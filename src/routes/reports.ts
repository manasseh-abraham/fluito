import { Hono } from 'hono';
import { db } from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { createReport, resolveTargetUserId } from '../services/moderation';
import { reportSchema } from '../utils/validation';

type Variables = {
  userId: number;
  user: { id: number; email: string };
};

export const reportRoutes = new Hono<{ Variables: Variables }>();

reportRoutes.use('/*', authMiddleware);

reportRoutes.post('/', async (c) => {
  try {
    const userId = c.get('userId') as number;
    const body = await c.req.json();
    const validated = reportSchema.parse(body);
    const target = resolveTargetUserId(db, userId, {
      targetUserId: validated.reported_user_id,
      matchId: validated.match_id,
    });

    if (!target.ok) {
      return c.json({ error: target.error }, target.status);
    }

    const result = createReport(db, {
      reporterId: userId,
      reportedUserId: target.targetUserId,
      reason: validated.reason,
      details: validated.details,
      alsoBlock: validated.block,
    });

    return c.json(
      {
        message: result.blocked ? 'Report submitted and user blocked' : 'Report submitted',
        report_id: result.reportId,
        blocked: result.blocked,
        match_id: result.matchId,
      },
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});
