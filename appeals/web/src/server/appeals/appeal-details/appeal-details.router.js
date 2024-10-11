import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import startDateRouter from './start-case/start-case.router.js';
import lpaQuestionnaireRouter from './lpa-questionnaire/lpa-questionnaire.router.js';
import allocationDetailsRouter from './allocation-details/allocation-details.router.js';
import appealTimetablesRouter from './appeal-timetables/appeal-timetables.router.js';
import appellantCaseRouter from './appellant-case/appellant-case.router.js';
import siteVisitRouter from './site-visit/site-visit.router.js';
import {
	assignUserRouter,
	unassignUserRouter,
	assignNewUserRouter
} from './assign-user/assign-user.router.js';
import { auditRouter } from './audit/audit.router.js';
import * as controller from './appeal-details.controller.js';
import changePageRouter from '../change-page/change-page.router.js';
import issueDecisionRouter from './issue-decision/issue-decision.router.js';
import appealTypeChangeRouter from './change-appeal-type/change-appeal-type.router.js';
import linkedAppealsRouter from './linked-appeals/linked-appeals.router.js';
import otherAppealsRouter from './other-appeals/other-appeals.router.js';
import neighbouringSitesRouter from './neighbouring-sites/neighbouring-sites.router.js';
import costsRouter from './costs/costs.router.js';
import serviceUserRouter from './service-user/service-user.router.js';
import { validateAppeal } from './appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import lpaReferenceRouter from './lpa-reference/lpa-reference.router.js';
import inspectorAccessRouter from './inspector-access/inspector-access.router.js';
import safetyRisksRouter from './safety-risks/safety-risks.router.js';
import internalCorrespondenceRouter from './internal-correspondence/internal-correspondence.router.js';
import withdrawalRouter from './withdrawal/withdrawal.router.js';
import interestedPartyCommentsRouter from './interested-party-comments/interested-party-comments.router.js';
import { postCaseNote } from '#appeals/appeal-details/case-notes/case-notes.controller.js';
import { validateCaseNoteEntry } from '#appeals/appeal-details/appeals-details.validator.js';

const router = createRouter();

router
	.route('/:appealId')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(controller.viewAppealDetails)
	)
	.post(validateAppeal, validateCaseNoteEntry, asyncHandler(postCaseNote));

router.use(
	'/:appealId/start-case',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	startDateRouter
);

router.use('/:appealId/lpa-questionnaire', lpaQuestionnaireRouter);
router.use('/:appealId/allocation-details', allocationDetailsRouter);
router.use('/:appealId/appeal-timetables', appealTimetablesRouter);
router.use('/:appealId/appellant-case', appellantCaseRouter);
router.use('/:appealId/interested-party-comments', interestedPartyCommentsRouter);
router.use(
	'/:appealId/site-visit',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	siteVisitRouter
);
router.use(
	'/:appealId/assign-user',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	assignUserRouter
);
router.use(
	'/:appealId/unassign-user',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	unassignUserRouter
);
router.use(
	'/:appealId/assign-new-user',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	assignNewUserRouter
);
router.use(
	'/:appealId/change-appeal-details',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changePageRouter
);
router.use(
	'/:appealId/issue-decision',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	issueDecisionRouter
);
router.use(
	'/:appealId/change-appeal-type',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	appealTypeChangeRouter
);
router.use(
	'/:appealId/linked-appeals',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	linkedAppealsRouter
);
router.use(
	'/:appealId/other-appeals',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	otherAppealsRouter
);
router.use('/:appealId/audit', validateAppeal, auditRouter);

router.use(
	'/:appealId/neighbouring-sites',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	neighbouringSitesRouter
);
router.use(
	'/:appealId/costs',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	costsRouter
);

router.use(
	'/:appealId/service-user',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	serviceUserRouter
);
router.use(
	'/:appealId/lpa-reference',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	lpaReferenceRouter
);
router.use(
	'/:appealId/inspector-access',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	inspectorAccessRouter
);
router.use(
	'/:appealId/safety-risks',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	safetyRisksRouter
);
router.use(
	'/:appealId/internal-correspondence',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	internalCorrespondenceRouter
);
router.use(
	'/:appealId/withdrawal',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	withdrawalRouter
);

export default router;
