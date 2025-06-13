import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import config from '#environment/config.js';
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
import issueDecisionRouter from './issue-decision/issue-decision.router.js';
import issueDecisionOldRouter from './issue-decision-old/issue-decision.router.js';
import appealTypeChangeRouter from './change-appeal-type/change-appeal-type.router.js';
import linkedAppealsRouter from './linked-appeals/linked-appeals.router.js';
import otherAppealsRouter from './other-appeals/other-appeals.router.js';
import neighbouringSitesRouter from './neighbouring-sites/neighbouring-sites.router.js';
import costsRouter from './costs/costs.router.js';
import environmentalAssessmentRouter from './environmental-assessment/environmental-assessment.router.js';
import serviceUserRouter from './service-user/service-user.router.js';
import { validateAppeal } from './appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import lpaReferenceRouter from './lpa-reference/lpa-reference.router.js';
import inspectorAccessRouter from './inspector-access/inspector-access.router.js';
import safetyRisksRouter from './safety-risks/safety-risks.router.js';
import internalCorrespondenceRouter from './internal-correspondence/internal-correspondence.router.js';
import withdrawalRouter from './withdrawal/withdrawal.router.js';
import interestedPartyCommentsRouter from './representations/interested-party-comments/interested-party-comments.router.js';
import finalCommentsRouter from './representations/final-comments/final-comments.router.js';
import { postCaseNote } from '#appeals/appeal-details/case-notes/case-notes.controller.js';
import { validateCaseNoteTextArea } from '#appeals/appeal-details/appeals-details.validator.js';
import representationsRouter from './representations/representations.router.js';
import { clearUncommittedFilesFromSession } from '#appeals/appeal-documents/appeal-documents.middleware.js';
import changeAppealDetailsRouter from './change-appeal-details/change-appeal-details.router.js';
import hearingRouter from './hearing/hearing.router.js';
import siteAddressRouter from './appellant-case/address/address.router.js';
import timetableRouter from './timetable/timetable.router.js';
import updateDecisionLetterRouter from './update-decision-letter/update-decision-letter.router.js';
import inquiryRouter from './inquiry/inquiry.router.js';

const router = createRouter();

router
	.route('/:appealId')
	.get(
		validateAppeal,
		clearUncommittedFilesFromSession,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(controller.viewAppealDetails)
	)
	.post(validateAppeal, validateCaseNoteTextArea, asyncHandler(postCaseNote));

router.use(
	'/:appealId/start-case',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	startDateRouter
);

router.use('/:appealId/lpa-questionnaire', lpaQuestionnaireRouter);
router.use('/:appealId/allocation-details', allocationDetailsRouter);
router.use('/:appealId/appeal-timetables', appealTimetablesRouter);
router.use('/:appealId/timetable', timetableRouter);
router.use('/:appealId/appellant-case', appellantCaseRouter);
router.use('/:appealId/interested-party-comments', interestedPartyCommentsRouter);
router.use('/:appealId/final-comments', finalCommentsRouter);
router.use(
	'/:appealId/site-visit',
	validateAppeal,
	assertUserHasPermission(permissionNames.viewCaseDetails),
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
	'/:appealId/issue-decision',
	validateAppeal,
	assertUserHasPermission(permissionNames.viewCaseList),
	config.featureFlags.featureFlagIssueDecision ? issueDecisionRouter : issueDecisionOldRouter
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
	assertUserHasPermission(permissionNames.viewCaseDetails, permissionNames.viewAssignedCaseDetails),
	costsRouter
);

router.use(
	'/:appealId/environmental-assessment',
	validateAppeal,
	assertUserHasPermission(permissionNames.viewCaseDetails, permissionNames.viewAssignedCaseDetails),
	environmentalAssessmentRouter
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
	assertUserHasPermission(permissionNames.viewCaseList),
	internalCorrespondenceRouter
);
router.use(
	'/:appealId/withdrawal',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	withdrawalRouter
);

router.use(
	'/:appealId/change-appeal-details',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changeAppealDetailsRouter
);

router.use(
	'/:appealId/hearing',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	hearingRouter
);

router.use(
	'/:appealId/inquiry',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	inquiryRouter
);

router.use(
	'/:appealId/site-address',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	siteAddressRouter
);

router.use(
	'/:appealId/update-decision-letter',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	updateDecisionLetterRouter
);

router.use('/:appealId', validateAppeal, representationsRouter);

export default router;
