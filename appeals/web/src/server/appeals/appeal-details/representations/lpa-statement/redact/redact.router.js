import { Router } from 'express';
import { renderRedact } from './redact.controller.js';

const router = Router({ mergeParams: true });

router.route('/').get(renderRedact);

export default router;
