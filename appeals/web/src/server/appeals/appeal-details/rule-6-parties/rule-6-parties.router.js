import { Router as createRouter } from 'express';
import addRouter from './add/add.router.js';
import changeRouter from './change/change.router.js';
import manageRouter from './manage/manage.router.js';
import removeRouter from './remove/remove.router.js';
import * as validators from './rule-6-parties.validators.js';

const router = createRouter({ mergeParams: true });

router.use('/add', addRouter);
router.use('/change/:rule6PartyId', validators.validateRule6PartyId, changeRouter);
router.use('/remove/:rule6PartyId', validators.validateRule6PartyId, removeRouter);
router.use('/manage', manageRouter);

export default router;
