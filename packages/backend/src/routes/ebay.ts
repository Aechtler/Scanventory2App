/**
 * eBay Sell API Routes
 * OAuth-Flow + Listing-Erstellung via eBay Sell API
 */

import { Router, Request, Response } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { prisma } from '../services/prismaClient';
import {
  getAuthUrl,
  exchangeCode,
  createEbayListing,
  isEbayConfigured,
  fetchRecentOrders,
} from '../services/ebayService';
import { sendSoldNotification } from '../services/pushNotificationService';
import { getImageUrl } from '../services/imageService';
import { ApiResponse } from '../types';

const router = Router();

function err(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

function requireUser(req: AuthRequest, res: Response): string | null {
  if (!req.user) {
    res.status(401).json(err('UNAUTHORIZED', 'Not authenticated'));
    return null;
  }
  return req.user.userId;
}

/** GET /api/ebay/connect — OAuth-URL zurückgeben */
router.get('/connect', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    if (!isEbayConfigured()) {
      res.status(503).json(err('EBAY_NOT_CONFIGURED', 'eBay credentials not configured'));
      return;
    }

    const authUrl = getAuthUrl(userId);
    res.json({ success: true, data: { authUrl } });
  } catch (e) {
    console.error('eBay connect error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to generate eBay auth URL'));
  }
});

/** GET /api/ebay/auth/callback — eBay-Redirect mit Auth-Code */
router.get('/auth/callback', async (req: Request, res) => {
  const { code, state: userId, error: oauthError } = req.query as Record<string, string>;

  if (oauthError || !code || !userId) {
    return res.redirect('scandirwas://ebay-callback?ok=false&error=' + encodeURIComponent(oauthError ?? 'missing_params'));
  }

  try {
    const tokens = await exchangeCode(code);
    const expiry = new Date(Date.now() + tokens.expiresIn * 1000);

    await prisma.ebayConnection.upsert({
      where: { userId },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: expiry,
      },
      create: {
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiry: expiry,
      },
    });

    return res.redirect('scandirwas://ebay-callback?ok=true');
  } catch (e) {
    console.error('eBay callback error:', e);
    return res.redirect('scandirwas://ebay-callback?ok=false&error=token_exchange_failed');
  }
});

/** GET /api/ebay/status — Verbindungsstatus des Users */
router.get('/status', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const conn = await prisma.ebayConnection.findUnique({
      where: { userId },
      select: { connectedAt: true },
    });

    res.json({ success: true, data: { connected: !!conn, connectedAt: conn?.connectedAt ?? null } });
  } catch (e) {
    console.error('eBay status error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to get eBay status'));
  }
});

/** DELETE /api/ebay/disconnect — eBay-Verbindung trennen */
router.delete('/disconnect', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    await prisma.ebayConnection.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (e) {
    console.error('eBay disconnect error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to disconnect eBay'));
  }
});

/** POST /api/ebay/listing — Listing direkt auf eBay einstellen */
router.post('/listing', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { listingId } = req.body as { listingId: string };

    if (!listingId) {
      res.status(400).json(err('BAD_REQUEST', 'listingId is required'));
      return;
    }

    // Listing + zugehöriges Item laden
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, userId },
      include: {
        item: {
          select: {
            productName: true,
            condition: true,
            conditionNote: true,
            brand: true,
            imageFilename: true,
            searchQuery: true,
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json(err('NOT_FOUND', 'Listing not found'));
      return;
    }

    if (listing.platform !== 'ebay') {
      res.status(400).json(err('BAD_REQUEST', 'This listing is not for eBay'));
      return;
    }

    // eBay-Verbindung prüfen
    const conn = await prisma.ebayConnection.findUnique({ where: { userId } });
    if (!conn) {
      res.status(403).json(err('EBAY_NOT_CONNECTED', 'Please connect your eBay account first'));
      return;
    }

    const item = listing.item;
    const imageUrl = item?.imageFilename ? getImageUrl(item.imageFilename) : undefined;

    const price =
      listing.fixedPrice ??
      listing.startingPrice ??
      0;

    const description = [
      item?.productName,
      item?.brand ? `Marke: ${item.brand}` : null,
      item?.conditionNote ? `Zustand: ${item.conditionNote}` : null,
      'Privatverkauf — keine Garantie, keine Rücknahme (sofern nicht anders angegeben in den Versandrichtlinien).',
    ]
      .filter(Boolean)
      .join('\n\n');

    const result = await createEbayListing(userId, {
      sku: listing.id,
      title: item?.productName ?? 'Artikel',
      description,
      condition: item?.condition ?? 'gut',
      imageUrls: imageUrl ? [imageUrl] : [],
      price,
      currency: 'EUR',
      listingType: listing.listingType === 'auction' ? 'AUCTION' : 'FIXED_PRICE',
      startingPrice: listing.startingPrice ?? undefined,
      quantity: 1,
    });

    // Listing in DB mit externer URL + eBay-ID aktualisieren
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'active',
        externalUrl: result.listingUrl,
        externalId: result.listingId,
      },
    });

    res.json({ success: true, data: result });
  } catch (e) {
    console.error('eBay listing error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json(err('EBAY_ERROR', message));
  }
});

/**
 * POST /api/ebay/sync-orders
 * Prüft offene eBay-Bestellungen und aktualisiert Listing-Status.
 * Sendet Push-Notification wenn neue Verkäufe gefunden werden.
 */
router.post('/sync-orders', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const conn = await prisma.ebayConnection.findUnique({ where: { userId } });
    if (!conn) {
      res.status(403).json(err('EBAY_NOT_CONNECTED', 'Please connect your eBay account first'));
      return;
    }

    const orders = await fetchRecentOrders(userId);
    const synced: { orderId: string; listingId: string; productName: string }[] = [];

    for (const order of orders) {
      for (const lineItem of order.lineItems) {
        if (!lineItem.itemId) continue;

        // Aktives Listing mit dieser eBay-ID suchen
        const listing = await prisma.listing.findFirst({
          where: { userId, externalId: lineItem.itemId, status: 'active' },
          include: { item: { select: { productName: true } } },
        });

        if (!listing) continue;

        // Käufer-Adresse formatieren
        const addr = order.buyerAddress;
        const addressStr = [addr.line1, addr.line2, `${addr.zip} ${addr.city}`, addr.country]
          .filter(Boolean)
          .join(', ');

        // Listing auf "sold" setzen + Käufer-Infos speichern
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            status: 'sold',
            soldPrice: order.totalAmount,
            soldAt: new Date(order.createdAt),
            ebayOrderId: order.orderId,
            buyerInfo: {
              name: order.buyerName,
              address: { ...order.buyerAddress },
            },
            paymentStatus: order.paymentStatus,
          },
        });

        // Push-Notification senden wenn User Push-Token hat
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { pushToken: true },
        });

        if (user?.pushToken) {
          await sendSoldNotification(
            user.pushToken,
            listing.item?.productName ?? 'Artikel',
            order.totalAmount,
            order.buyerName,
            addressStr,
          );
        }

        synced.push({
          orderId: order.orderId,
          listingId: listing.id,
          productName: listing.item?.productName ?? '',
        });
      }
    }

    res.json({ success: true, data: { synced, totalOrders: orders.length } });
  } catch (e) {
    console.error('eBay sync-orders error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json(err('EBAY_ERROR', message));
  }
});

export default router;
