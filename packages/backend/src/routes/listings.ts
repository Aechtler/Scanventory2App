import { Router, Response } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { prisma } from '../services/prismaClient';
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

function formatListing(l: {
  id: string;
  itemId: string;
  platform: string;
  listingType: string;
  startingPrice: number | null;
  fixedPrice: number | null;
  status: string;
  soldPrice: number | null;
  soldAt: Date | null;
  externalUrl: string | null;
  externalId?: string | null;
  ebayOrderId?: string | null;
  buyerInfo?: unknown;
  paymentStatus?: string | null;
  createdAt: Date;
  updatedAt: Date;
  item: { productName: string; imageFilename: string } | null;
}) {
  return {
    id: l.id,
    itemId: l.itemId,
    platform: l.platform,
    listingType: l.listingType,
    startingPrice: l.startingPrice,
    fixedPrice: l.fixedPrice,
    status: l.status,
    soldPrice: l.soldPrice,
    soldAt: l.soldAt?.toISOString() ?? null,
    externalUrl: l.externalUrl,
    externalId: l.externalId ?? null,
    ebayOrderId: l.ebayOrderId ?? null,
    buyerInfo: l.buyerInfo ?? null,
    paymentStatus: l.paymentStatus ?? null,
    createdAt: l.createdAt.toISOString(),
    productName: l.item?.productName ?? null,
    imageFilename: l.item?.imageFilename ?? null,
  };
}

/** GET /api/listings — Eigene Listings laden */
router.get('/', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const listings = await prisma.listing.findMany({
      where: { userId },
      include: { item: { select: { productName: true, imageFilename: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: listings.map(formatListing) });
  } catch (e) {
    console.error('List listings error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load listings'));
  }
});

/** POST /api/listings — Neues Listing anlegen */
router.post('/', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { itemId, platform, listingType, startingPrice, fixedPrice, status, externalUrl } =
      req.body;

    if (typeof itemId !== 'string' || !itemId) {
      res.status(400).json(err('BAD_REQUEST', 'itemId is required'));
      return;
    }
    if (!['ebay', 'kleinanzeigen', 'amazon'].includes(platform)) {
      res.status(400).json(err('BAD_REQUEST', 'Invalid platform'));
      return;
    }
    if (!['auction', 'fixed_price', 'negotiable'].includes(listingType)) {
      res.status(400).json(err('BAD_REQUEST', 'Invalid listingType'));
      return;
    }

    // Nur eigene Items erlauben
    const item = await prisma.scannedItem.findFirst({
      where: { id: itemId, userId },
      select: { id: true, productName: true, imageFilename: true },
    });
    if (!item) {
      res.status(404).json(err('NOT_FOUND', 'Item not found'));
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        userId,
        itemId,
        platform,
        listingType,
        startingPrice: startingPrice ?? null,
        fixedPrice: fixedPrice ?? null,
        status: status ?? 'active',
        externalUrl: externalUrl ?? null,
      },
      include: { item: { select: { productName: true, imageFilename: true } } },
    });

    res.status(201).json({ success: true, data: formatListing(listing) });
  } catch (e) {
    console.error('Create listing error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to create listing'));
  }
});

/** PUT /api/listings/:id — Listing aktualisieren */
router.put('/:id', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { id } = req.params as { id: string };
    const existing = await prisma.listing.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json(err('NOT_FOUND', 'Listing not found'));
      return;
    }

    const { status, soldPrice, soldAt, fixedPrice, startingPrice, listingType, externalUrl } =
      req.body;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(soldPrice !== undefined && { soldPrice }),
        ...(soldAt !== undefined && { soldAt: soldAt ? new Date(soldAt) : null }),
        ...(fixedPrice !== undefined && { fixedPrice }),
        ...(startingPrice !== undefined && { startingPrice }),
        ...(listingType !== undefined && { listingType }),
        ...(externalUrl !== undefined && { externalUrl }),
      },
      include: { item: { select: { productName: true, imageFilename: true } } },
    });

    res.json({ success: true, data: formatListing(updated) });
  } catch (e) {
    console.error('Update listing error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to update listing'));
  }
});

/** DELETE /api/listings/:id — Listing löschen */
router.delete('/:id', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { id } = req.params as { id: string };
    const existing = await prisma.listing.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json(err('NOT_FOUND', 'Listing not found'));
      return;
    }

    await prisma.listing.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error('Delete listing error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to delete listing'));
  }
});

export default router;
