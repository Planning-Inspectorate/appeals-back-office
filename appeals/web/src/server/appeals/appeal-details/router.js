import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import startDateRouter from './sections/start-case/start-case.router.js';
import lpaQuestionnaireRouter from './sections/lpa-questionnaire/lpa-questionnaire.router.js';
import allocationDetailsRouter from './sections/allocation-details/allocation-details.router.js';
import appealTimetablesRouter from './sections/appeal-timetables/appeal-timetables.router.js';
import appellantCaseRouter from './sections/appellant-case/appellant-case.router.js';
import siteVisitRouter from './sections/site-visit/site-visit.router.js';
import {
	assignUserRouter,
	unassignUserRouter,
	assignNewUserRouter
} from './sections/assign-user/assign-user.router.js';
import { auditRouter } from './sections/audit/audit.router.js';
import * as controller from './controller.js';
import changePageRouter from '../change-page/change-page.router.js';
import issueDecisionRouter from './sections/issue-decision/issue-decision.router.js';
import appealTypeChangeRouter from './sections/change-appeal-type/change-appeal-type.router.js';
import linkedAppealsRouter from './sections/linked-appeals/linked-appeals.router.js';
import otherAppealsRouter from './sections/other-appeals/other-appeals.router.js';
import neighbouringSitesRouter from './sections/neighbouring-sites/neighbouring-sites.router.js';
import costsRouter from './sections/costs/costs.router.js';
import serviceUserRouter from './sections/service-user/service-user.router.js';
import { validateAppeal } from './middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import lpaReferenceRouter from './sections/lpa-reference/lpa-reference.router.js';
import inspectorAccessRouter from './sections/inspector-access/inspector-access.router.js';
import safetyRisksRouter from './sections/safety-risks/safety-risks.router.js';
import internalCorrespondenceRouter from './sections/internal-correspondence/internal-correspondence.router.js';
import withdrawalRouter from './sections/withdrawal/withdrawal.router.js';

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
	);

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
