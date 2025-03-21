import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateUuidParameter from '#common/validators/uuid-parameter.js';
import { validateStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_DOCUMENT_AV_RESULT_STATUSES_MUST_BE_ONE_OF,
	ERROR_MUST_BE_STRING,
	ERROR_MUST_BE_UUID,
	ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE,
	ERROR_MUST_BE_VALID_FILEINFO,
	ERROR_DOCUMENT_REDACTION_STATUSES_MUST_BE_ONE_OF
} from '@pins/appeals/constants/support.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import validateDateParameter from '#common/validators/date-parameter.js';
import { getDocumentRedactionStatusIds } from './documents.service.js';
import { APPEAL_VIRUS_CHECK_STATUS } from 'pins-data-model';
import { validateFileNameParameter } from '#common/validators/filename-parameter.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateDocumentsRequest} UpdateDocumentsRequest */
/** @typedef {import('@pins/appeals.api').Api.UpdateDocumentsAvCheckRequest} UpdateDocumentsAvCheckRequest */

/**
 * @param {UpdateDocumentsRequest} documents
 * @returns {Promise<boolean>}
 */
const validateDocumentRedactionStatusIds = async (documents) => {
	const redactionStatusIds = await getDocumentRedactionStatusIds();
	const hasValidStatusIds = documents.every(({ redactionStatus }) =>
		redactionStatusIds.includes(redactionStatus)
	);

	if (!hasValidStatusIds) {
		throw new Error(
			stringTokenReplacement(ERROR_DOCUMENT_REDACTION_STATUSES_MUST_BE_ONE_OF, [
				redactionStatusIds.join(', ')
			])
		);
	}

	return true;
};

/**
 * @param {UpdateDocumentsAvCheckRequest['documents']} documents
 * @returns {Promise<boolean>}
 */
const validateAvCheckResult = async (documents) => {
	const validAvResults = [APPEAL_VIRUS_CHECK_STATUS.SCANNED, APPEAL_VIRUS_CHECK_STATUS.AFFECTED];
	const hasValidStatusIds = documents?.every(
		({ virusCheckStatus }) => virusCheckStatus && validAvResults.includes(virusCheckStatus)
	);

	if (!hasValidStatusIds) {
		throw new Error(
			stringTokenReplacement(ERROR_DOCUMENT_AV_RESULT_STATUSES_MUST_BE_ONE_OF, [
				validAvResults.join(', ')
			])
		);
	}

	return true;
};

const getFolderIdValidator = composeMiddleware(
	validateIdParameter('folderId'),
	validationErrorHandler
);

const getDocumentIdValidator = composeMiddleware(
	validateUuidParameter({ parameterName: 'documentId' }),
	validationErrorHandler
);

const getDocumentValidator = composeMiddleware(
	body('blobStorageHost').isString().withMessage(ERROR_MUST_BE_STRING),
	body('blobStorageContainer').isString().withMessage(ERROR_MUST_BE_STRING),
	body('document').isObject().withMessage(ERROR_MUST_BE_VALID_FILEINFO),
	validationErrorHandler
);

const getDocumentsValidator = composeMiddleware(
	body('blobStorageHost').isString().withMessage(ERROR_MUST_BE_STRING),
	body('blobStorageContainer').isString().withMessage(ERROR_MUST_BE_STRING),
	body('documents')
		.isArray()
		.custom((value) => value[0])
		.withMessage(ERROR_MUST_CONTAIN_AT_LEAST_1_VALUE),
	validationErrorHandler
);

const patchDocumentsValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateUuidParameter({ parameterName: 'documents.*.id', parameterType: body }),
	validateDateParameter({ parameterName: 'documents.*.receivedDate', isRequired: true }),
	body('documents').custom(validateDocumentRedactionStatusIds),
	validationErrorHandler
);

const patchDocumentFileNameValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateUuidParameter({ parameterName: 'documents.*.id', parameterType: body }),
	validateFileNameParameter('documents.*.fileName'),
	validationErrorHandler
);

const patchDocumentsAvCheckValidator = composeMiddleware(
	validateUuidParameter({ parameterName: 'documents.*.id', parameterType: body }).withMessage(
		ERROR_MUST_BE_UUID
	),
	validateStringParameter('documents.*.virusCheckStatus', 18),
	body('documents').custom(validateAvCheckResult),
	validationErrorHandler
);

export {
	getDocumentIdValidator,
	getDocumentsValidator,
	getDocumentValidator,
	getFolderIdValidator,
	patchDocumentsValidator,
	patchDocumentFileNameValidator,
	patchDocumentsAvCheckValidator
};
