import { Router } from 'express';
import { renderReviewLpaStatement } from './lpa-statement.controller.js';

const router = Router({ mergeParams: true });

router.get('/', renderReviewLpaStatement);

export default router;
