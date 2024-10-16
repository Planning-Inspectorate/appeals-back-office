import pino from '#utils/logger.js';
import { databaseConnector } from '#utils/database-connector.js';
import { schemas, validateFromSchema } from './integrations.validators.js';
import {
	ERROR_NOT_FOUND,
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA,
	ERROR_INVALID_DOCUMENT_DATA
} from '#endpoints/constants.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppellantCase = async (req, res, next) => {
	const { body } = req;

	pino.info('Received appellant case from topic', body);
	const validationResult = await validateFromSchema(schemas.commands.appealSubmission, body);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error(`Error validating appellant case: ${errorDetails[0]}`);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_APPELLANT_CASE_DATA,
				details: errorDetails
			}
		});
	}

	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateCaseType = async (req, res, next) => {
	const { body } = req;
	const validCaseTypes = getEnabledAppealTypes();

	const caseType = body.casedata?.caseType;
	if (validCaseTypes.indexOf(caseType) === -1) {
		const errorDetails = `Error validating case types: ${caseType} not currently supported`;
		pino.error(errorDetails);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_APPELLANT_CASE_DATA,
				details: errorDetails
			}
		});
	}

	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateLpaQuestionnaire = async (req, res, next) => {
	const { body } = req;

	pino.info('Received LPA submission from topic', body);
	const validationResult = await validateFromSchema(schemas.commands.lpaSubmission, body);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error(`Error validating LPA submission: ${errorDetails[0]}`);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_LPAQ_DATA,
				details: errorDetails
			}
		});
	}

	const appealExists = await findAppealByReference(body?.casedata?.caseReference);
	if (!appealExists) {
		pino.error(
			`Error associating LPA submission to an existing appeal with reference '${body?.questionnaire?.caseReference}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateDocument = async (req, res, next) => {
	const { body } = req;

	pino.info('Received document from topic');
	const validationResult = await validateFromSchema(schemas.commands.documentSubmission, body);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error('Error validating document', errorDetails);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_DOCUMENT_DATA,
				details: errorDetails
			}
		});
	}

	const appealExists = await findAppealByReference(body?.caseRef);
	if (!appealExists) {
		pino.error(
			`Error associating document to an existing appeal with reference '${body?.caseRef}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	next();
};

const findAppealByReference = async (/** @type {string|undefined} */ reference) => {
	if (reference) {
		const appeal = await databaseConnector.appeal.findUnique({
			where: { reference }
		});
		if (appeal) {
			return appeal;
		}
	}

	return null;
};
