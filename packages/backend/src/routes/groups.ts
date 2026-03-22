import { Router } from 'express';
import { jwtAuthMiddleware, optionalJwtAuthMiddleware, AuthRequest } from '../middleware/jwtAuth';
import {
  createGroup,
  getGroup,
  getGroupByInviteCode,
  getUserGroups,
  getGroupMembers,
  joinGroupByCode,
  inviteUserToGroup,
  acceptInvitation,
  declineInvitation,
  getPendingInvitations,
  leaveGroup,
  removeMember,
} from '../services/groupService';
import { searchGroups } from '../services/groupSearchService';
import { ApiResponse } from '../types';

const router = Router();

function err(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** POST /api/groups — Gruppe erstellen */
router.post('/', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    if (!isRecord(req.body)) { res.status(400).json(err('BAD_REQUEST', 'Invalid body')); return; }

    const { name, description, avatarUrl, isPublic } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json(err('BAD_REQUEST', 'name is required')); return;
    }

    const group = await createGroup(req.user.userId, {
      name: name as string,
      description: description as string | undefined,
      avatarUrl: avatarUrl as string | undefined,
      isPublic: typeof isPublic === 'boolean' ? isPublic : false,
    });
    res.status(201).json({ success: true, data: group });
  } catch (e) {
    console.error('Create group error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to create group'));
  }
});

/** GET /api/groups/search?q=... — Öffentliche Gruppen suchen */
router.get('/search', async (req, res) => {
  try {
    const q = req.query['q'];
    if (typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json(err('BAD_REQUEST', 'Query must be at least 2 characters')); return;
    }
    const groups = await searchGroups(q.trim());
    res.json({ success: true, data: groups });
  } catch (e) {
    console.error('Group search error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Search failed'));
  }
});

/** GET /api/groups/mine — Eigene Gruppen */
router.get('/mine', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    const groups = await getUserGroups(req.user.userId);
    res.json({ success: true, data: groups });
  } catch (e) {
    console.error('Get user groups error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load groups'));
  }
});

/** GET /api/groups/invitations — Offene Einladungen */
router.get('/invitations', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    const invitations = await getPendingInvitations(req.user.userId);
    res.json({ success: true, data: invitations });
  } catch (e) {
    console.error('Get invitations error:', e);
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load invitations'));
  }
});

/** POST /api/groups/invitations/:id/accept */
router.post('/invitations/:id/accept', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await acceptInvitation(req.params.id, req.user.userId);
    res.json({ success: true, data: { accepted: true } });
  } catch (e) {
    if (e instanceof Error && e.message === 'Invitation not found') {
      res.status(404).json(err('NOT_FOUND', e.message)); return;
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to accept invitation'));
  }
});

/** POST /api/groups/invitations/:id/decline */
router.post('/invitations/:id/decline', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await declineInvitation(req.params.id, req.user.userId);
    res.json({ success: true, data: { declined: true } });
  } catch (e) {
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to decline invitation'));
  }
});

/** POST /api/groups/join/:inviteCode — Per Code beitreten */
router.post('/join/:inviteCode', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    const group = await joinGroupByCode(req.user.userId, req.params.inviteCode);
    res.json({ success: true, data: group });
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid invite code') {
      res.status(404).json(err('NOT_FOUND', e.message)); return;
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to join group'));
  }
});

/** GET /api/groups/resolve/:inviteCode — Gruppen-Info per Code (vor Beitritt) */
router.get('/resolve/:inviteCode', optionalJwtAuthMiddleware, async (req, res) => {
  try {
    const group = await getGroupByInviteCode(req.params.inviteCode);
    if (!group) { res.status(404).json(err('NOT_FOUND', 'Invalid invite code')); return; }
    res.json({ success: true, data: group });
  } catch (e) {
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to resolve invite code'));
  }
});

/** GET /api/groups/:id — Gruppen-Detail */
router.get('/:id', optionalJwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const group = await getGroup(req.params.id, req.user?.userId);
    if (!group) { res.status(404).json(err('NOT_FOUND', 'Group not found')); return; }
    res.json({ success: true, data: group });
  } catch (e) {
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load group'));
  }
});

/** GET /api/groups/:id/members — Mitgliederliste */
router.get('/:id/members', optionalJwtAuthMiddleware, async (req, res) => {
  try {
    const members = await getGroupMembers(req.params.id);
    res.json({ success: true, data: members });
  } catch (e) {
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to load members'));
  }
});

/** POST /api/groups/:id/invite — User einladen */
router.post('/:id/invite', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    if (!isRecord(req.body) || typeof req.body['userId'] !== 'string') {
      res.status(400).json(err('BAD_REQUEST', 'userId is required')); return;
    }
    await inviteUserToGroup(req.params.id, req.user.userId, req.body['userId'] as string);
    res.json({ success: true, data: { invited: true } });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'User not found') { res.status(404).json(err('NOT_FOUND', e.message)); return; }
      if (e.message === 'Not a group member' || e.message === 'Insufficient permissions') {
        res.status(403).json(err('FORBIDDEN', e.message)); return;
      }
      if (e.message === 'User is already a member') {
        res.status(409).json(err('CONFLICT', e.message)); return;
      }
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to invite user'));
  }
});

/** DELETE /api/groups/:id/members/me — Gruppe verlassen */
router.delete('/:id/members/me', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await leaveGroup(req.params.id, req.user.userId);
    res.json({ success: true, data: { left: true } });
  } catch (e) {
    if (e instanceof Error && e.message.includes('Owner')) {
      res.status(400).json(err('BAD_REQUEST', e.message)); return;
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to leave group'));
  }
});

/** DELETE /api/groups/:id/members/:userId — Mitglied entfernen */
router.delete('/:id/members/:userId', jwtAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) { res.status(401).json(err('UNAUTHORIZED', 'Not authenticated')); return; }
    await removeMember(req.params.id, req.user.userId, req.params.userId);
    res.json({ success: true, data: { removed: true } });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'Insufficient permissions') { res.status(403).json(err('FORBIDDEN', e.message)); return; }
      if (e.message === 'Member not found') { res.status(404).json(err('NOT_FOUND', e.message)); return; }
    }
    res.status(500).json(err('INTERNAL_ERROR', 'Failed to remove member'));
  }
});

export default router;
