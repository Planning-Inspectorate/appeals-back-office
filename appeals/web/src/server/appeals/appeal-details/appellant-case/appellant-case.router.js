import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	clearUncommittedFilesFromSession,
	validateCaseDocumentId,
	validateCaseFolderId
} from '../../appeal-documents/appeal-documents.middleware.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import changeLpaRouter from '../change-appeal-details/local-planning-authority/local-planning-authority.router.js';
import changeProcedureTypeRouter from '../change-appeal-procedure-type/change-appeal-procedure-type.router.js';
import greenBeltRouter from '../green-belt/green-belt.router.js';
import inspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import outcomeInvalidRouter from '../invalid-appeal/invalid-appeal.router.js';
import lpaReferenceRouter from '../lpa-reference/lpa-reference.router.js';
import otherAppealsRouter from '../other-appeals/other-appeals.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import serviceUserRouter from '../service-user/service-user.router.js';
import siteAddressRouter from './address/address.router.js';
import agriculturalHoldingRouter from './agricultural-holding/agricultural-holding.router.js';
import * as controller from './appellant-case.controller.js';
import * as validators from './appellant-case.validators.js';
import applicationDecisionDateRouter from './application-decision-date/application-decision-date.router.js';
import applicationDevelopmentTypeRouter from './application-development-type/application-development-type.router.js';
import applicationOutcomeRouter from './application-outcome/application-outcome.router.js';
import applicationSubmissionDateRouter from './application-submission-date/application-submission-date.router.js';
import developmentDescriptionRouter from './development-description/development-description.router.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import outcomeValidRouter from './outcome-valid/outcome-valid.router.js';
import ownersKnownRouter from './owners-known/owners-known.router.js';
import planningObligationRouter from './planning-obligation/planning-obligation.router.js';
import procedurePreferenceRouter from './procedure-preference/procedure-preference.router.js';
import siteAreaRouter from './site-area/site-area.router.js';
import siteOwnershipRouter from './site-ownership/site-ownership.router.js';

const router = createRouter({ mergeParams: true });

router.use(
	'/valid',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	outcomeValidRouter
);
router.use(
	'/invalid',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	outcomeInvalidRouter
);
router.use(
	'/incomplete',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	outcomeIncompleteRouter
);
router.use(
	'/lpa-reference',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	lpaReferenceRouter
);
router.use(
	'/inspector-access',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	inspectorAccessRouter
);
router.use(
	'/safety-risks',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	safetyRisksRouter
);
router.use(
	'/service-user',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	serviceUserRouter
);
router.use(
	'/site-address',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	siteAddressRouter
);
router.use(
	'/site-ownership',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	siteOwnershipRouter
);
router.use(
	'/owners-known',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	ownersKnownRouter
);
router.use(
	'/planning-obligation',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	planningObligationRouter
);
router.use(
	'/agricultural-holding',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	agriculturalHoldingRouter
);
router.use(
	'/other-appeals',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	otherAppealsRouter
);
router.use(
	'/site-area',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	siteAreaRouter
);
router.use(
	'/application-date',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	applicationSubmissionDateRouter
);
router.use(
	'/application-decision-date',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	applicationDecisionDateRouter
);
router.use(
	'/green-belt',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	greenBeltRouter
);
router.use(
	'/development-description',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	developmentDescriptionRouter
);
router.use(
	'/application-outcome',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	applicationOutcomeRouter
);
router.use(
	'/procedure-preference',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	procedurePreferenceRouter
);
router.use(
	'/application-development-type',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	applicationDevelopmentTypeRouter
);

router.use(
	'/change-appeal-details/local-planning-authority',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changeLpaRouter
);

router.use(
	'/change-appeal-procedure-type/change-selected-procedure-type',
	validateAppeal,
	assertUserHasPermission(permissionNames.updateCase),
	changeProcedureTypeRouter
);

router
	.route('/')
	.get(validateAppeal, clearUncommittedFilesFromSession, asyncHandler(controller.getAppellantCase))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateReviewOutcome,
		asyncHandler(controller.postAppellantCase)
	);

router
	.route('/check-your-answers')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getCheckAndConfirm)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postCheckAndConfirm)
	);

router
	.route('/add-documents/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getAddDocuments)
	)
	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postAddDocuments));

router
	.route('/add-documents/:folderId/check-your-answers')
	.get(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.postAddDocumentsCheckAndConfirm)
	);

router
	.route('/add-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getAddDocumentVersion)
	)
	.post(validateAppeal, validateCaseFolderId, asyncHandler(controller.postAddDocumentVersion));

router
	.route('/add-documents/:folderId/:documentId/check-your-answers')
	.get(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentsCheckAndConfirm)
	)
	.post(
		validateAppeal,
		validateCaseFolderId,
		asyncHandler(controller.postAddDocumentVersionCheckAndConfirm)
	);

router
	.route('/add-document-details/:folderId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postAddDocumentDetails)
	);

router
	.route('/add-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getAddDocumentVersionDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postDocumentVersionDetails)
	);

router
	.route('/manage-documents/:folderId/')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getManageFolder)
	);

router
	.route('/manage-documents/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getManageDocument)
	);

router
	.route('/change-document-name/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentFileNameDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentNameBodyFormat,
		documentsValidators.validateDocumentName,
		asyncHandler(controller.postChangeDocumentFileNameDetails)
	);

router
	.route('/change-document-details/:folderId/:documentId')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		asyncHandler(controller.getChangeDocumentVersionDetails)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postChangeDocumentVersionDetails)
	);

router
	.route('/manage-documents/:folderId/:documentId/:versionId/delete')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		asyncHandler(controller.getDeleteDocument)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseFolderId,
		validateCaseDocumentId,
		documentsValidators.validateDocumentDeleteAnswer,
		asyncHandler(controller.postDeleteDocumentPage)
	);

export default router;
