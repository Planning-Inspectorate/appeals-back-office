import { Router } from 'express';
import { renderCheckYourAnswers } from './incomplete.controller.js';

const router = Router({ mergeParams: true });

router.get('/confirm', renderCheckYourAnswers);

export default router;
