import { Router } from 'express';
import { renderRedact, postRedact } from './redact.controller.js';

const router = Router({ mergeParams: true });

router.route('/').get(renderRedact).post(postRedact);

export default router;
