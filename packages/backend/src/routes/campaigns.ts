import { Router } from 'express';
import { jwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import { prisma } from '../services/prismaClient';
import { ApiResponse } from '../types';
import { Response } from 'express';

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

/** GET /api/campaigns — Alle eigenen Kampagnen laden */
router.get('/', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { items: { select: { itemId: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const data = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      itemIds: c.items.map((i) => i.itemId),
      startsAt: c.startsAt?.toISOString() ?? null,
      endsAt: c.endsAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  } catch (e) {
    console.error('List campaigns error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load campaigns'));
  }
});

/** POST /api/campaigns — Neue Kampagne anlegen */
router.post('/', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { name, itemIds, startsAt, endsAt } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json(err('BAD_REQUEST', 'name is required'));
      return;
    }
    if (!Array.isArray(itemIds)) {
      res.status(400).json(err('BAD_REQUEST', 'itemIds must be an array'));
      return;
    }

    // Nur Items des Users erlauben
    const ownedItems = await prisma.scannedItem.findMany({
      where: { id: { in: itemIds as string[] }, userId },
      select: { id: true },
    });
    const validItemIds = ownedItems.map((i) => i.id);

    const campaign = await prisma.campaign.create({
      data: {
        id: `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        userId,
        name: name.trim(),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        items: {
          create: validItemIds.map((itemId) => ({ itemId })),
        },
      },
      include: { items: { select: { itemId: true } } },
    });

    res.status(201).json({
      success: true,
      data: {
        id: campaign.id,
        name: campaign.name,
        itemIds: campaign.items.map((i) => i.itemId),
        startsAt: campaign.startsAt?.toISOString() ?? null,
        endsAt: campaign.endsAt?.toISOString() ?? null,
        createdAt: campaign.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error('Create campaign error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to create campaign'));
  }
});

/** DELETE /api/campaigns/:id — Kampagne löschen */
router.delete('/:id', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { id } = req.params as { id: string };

    const existing = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json(err('NOT_FOUND', 'Campaign not found'));
      return;
    }

    await prisma.campaign.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error('Delete campaign error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to delete campaign'));
  }
});

export default router;
