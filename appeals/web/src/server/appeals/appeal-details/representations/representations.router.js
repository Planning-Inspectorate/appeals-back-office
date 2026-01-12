import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { Router } from 'express';
import appellantStatementRouter from './appellant-statement/appellant-statement.router.js';
import lpaStatementRouter from './lpa-statement/lpa-statement.router.js';
import proofOfEvidenceRouter from './proof-of-evidence/proof-of-evidence.router.js';
import {
	postShareRepresentations,
	renderShareRepresentations
} from './representations.controller.js';
import { withSingularRepresentation } from './representations.middleware.js';
import { validateReadyToShare } from './representations.validators.js';
import rule6PartyStatementRouter from './rule-6-party-statement/rule-6-party-statement.router.js';

const router = Router({ mergeParams: true });

router.use(
	'/lpa-statement',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT),
	lpaStatementRouter
);

router.use(
	'/appellant-statement',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT),
	appellantStatementRouter
);

router.use(
	'/rule-6-party-statement/:rule6PartyId',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT),
	rule6PartyStatementRouter
);

router.use(
	'/rule-6-party-statement/:rule6PartyId',
	withSingularRepresentation(APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT),
	rule6PartyStatementRouter
);

router.use('/:appealId/proof-of-evidence', proofOfEvidenceRouter);

router
	.route('/share')
	.get(validateReadyToShare, renderShareRepresentations)
	.post(validateReadyToShare, postShareRepresentations);

export default router;
