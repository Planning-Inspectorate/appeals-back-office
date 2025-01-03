import { Router } from 'express';
import { renderAllocationCheck } from './valid.controller.js';

const router = Router({ mergeParams: true });

router.get('/allocation-check', renderAllocationCheck);

export default router;
