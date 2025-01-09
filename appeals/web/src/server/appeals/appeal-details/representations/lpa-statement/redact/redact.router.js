import { Router } from 'express';
import { renderConfirm, renderRedact, postConfirm, postRedact } from './redact.controller.js';

const router = Router({ mergeParams: true });

router.route('/').get(renderRedact).post(postRedact);

router.route('/confirm').get(renderConfirm).post(postConfirm);

export default router;
