import { Router } from 'express';
import lpaStatementRouter from './lpa-statement/lpa-statement.router.js';
import { withSingularRepresentation } from './representations.middleware.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';

const router = Router({ mergeParams: true });

router.use(
	'/lpa-statement',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT),
	lpaStatementRouter
);

export default router;
