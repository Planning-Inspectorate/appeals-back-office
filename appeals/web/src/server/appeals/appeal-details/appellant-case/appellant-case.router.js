import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import { asyncHandler } from '@pins/express';
import * as controller from './appellant-case.controller.js';
import * as validators from './appellant-case.validators.js';
import * as documentsValidators from '../../appeal-documents/appeal-documents.validators.js';
import outcomeValidRouter from './outcome-valid/outcome-valid.router.js';
import outcomeInvalidRouter from './outcome-invalid/outcome-invalid.router.js';
import outcomeIncompleteRouter from './outcome-incomplete/outcome-incomplete.router.js';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import {
	validateCaseFolderId,
	validateCaseDocumentId
} from '../../appeal-documents/appeal-documents.middleware.js';
import changeLpaReferenceRouter from '../change-lpa-reference/change-lpa-reference.router.js';
import inspectorAccessRouter from '../inspector-access/inspector-access.router.js';
import serviceUserRouter from '../service-user/service-user.router.js';
import safetyRisksRouter from '../safety-risks/safety-risks.router.js';
import siteAddressRouter from '../address/address.router.js';
import siteOwnershipRouter from '../site-ownership/site-ownership.router.js';
import ownersKnownRouter from '../owners-known/owners-known.router.js';
import otherAppealsRouter from '../other-appeals/other-appeals.router.js';
import siteAreaRouter from '../site-area/site-area.router.js';
import applicationSubmissionDateRouter from '../application-submission-date/application-submission-date.router.js';
import applicationDecisionDateRouter from '../application-decision-date/application-decision-date.router.js';
import greenBeltRouter from '../green-belt/green-belt.router.js';
import developmentDescriptionRouter from '../development-description/development-description.router.js';

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
	changeLpaReferenceRouter
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

router
	.route('/')
	.get(validateAppeal, asyncHandler(controller.getAppellantCase))
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateReviewOutcome,
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
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
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
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
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
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
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
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
		assertGroupAccess(config.referenceData.appeals.caseOfficerGroupId),
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
