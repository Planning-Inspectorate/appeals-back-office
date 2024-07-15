import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { renderAudit } from './audit.controller.js';

const auditRouter = createRouter({ mergeParams: true });

auditRouter.route('/').get(asyncHandler(renderAudit));

export { auditRouter };
