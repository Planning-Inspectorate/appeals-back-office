import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { Router } from 'express';
import lpaStatementRouter from './lpa-statement/lpa-statement.router.js';
import {
	postShareRepresentations,
	renderShareRepresentations
} from './representations.controller.js';
import { withSingularRepresentation } from './representations.middleware.js';
import { validateReadyToShare } from './representations.validators.js';

const router = Router({ mergeParams: true });

router.use(
	'/lpa-statement',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT),
	lpaStatementRouter
);

router
	.route('/share')
	.get(validateReadyToShare, renderShareRepresentations)
	.post(validateReadyToShare, postShareRepresentations);

export default router;
