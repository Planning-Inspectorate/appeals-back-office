import pino from '#utils/logger.js';
import { databaseConnector } from '#utils/database-connector.js';
import { schemas, validateFromSchema } from './integrations.validators.js';
import {
	ERROR_NOT_FOUND,
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA,
	ERROR_INVALID_REP_DATA,
	ERROR_INVALID_APPEAL_TYPE_REP
} from '#endpoints/constants.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { APPEAL_CASE_TYPE } from 'pins-data-model';
import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateAppellantCase = async (req, res, next) => {
	const { body } = req;
	pino.info('Received appellant case from topic', body);
	const validationResult = await validateFromSchema(schemas.commands.appealSubmission, body, true);
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
	const validationResult = await validateFromSchema(schemas.commands.lpaSubmission, body, true);
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

	const referencedAppeal = await findAppealByReference(body?.casedata?.caseReference);
	if (!referencedAppeal) {
		pino.error(
			`Error associating representation to an existing appeal with reference '${body?.caseReference}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	req.appeal = referencedAppeal;
	next();
};

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<object|void>}
 */
export const validateRepresentation = async (req, res, next) => {
	const { body } = req;

	pino.info('Received Representation from topic', body);
	const validationResult = await validateFromSchema(schemas.commands.repSubmission, body, true);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error(`Error validating Representation submission: ${errorDetails[0]}`);
		return res.status(400).send({
			errors: {
				integration: ERROR_INVALID_REP_DATA,
				details: errorDetails
			}
		});
	}

	const referencedAppeal = await findAppealByReference(body?.caseReference);
	if (!referencedAppeal) {
		pino.error(
			`Error associating representation to an existing appeal with reference '${body?.caseReference}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	const validAppealTypesAcceptingReps = [];
	if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
		validAppealTypesAcceptingReps.push(APPEAL_CASE_TYPE.W);
	}

	if (validAppealTypesAcceptingReps.indexOf(referencedAppeal.appealType?.key ?? '') === -1) {
		pino.error(
			`The reference appeal '${body?.caseReference}' does not accept representations (${referencedAppeal.appealType?.key})`
		);
		return res.status(400).send({
			errors: {
				appeal: ERROR_INVALID_APPEAL_TYPE_REP
			}
		});
	}

	// TODO: additional validation,
	// e.g. reject if rep time window is elapsed or custom logic depending on representationType and appeal status

	req.appeal = referencedAppeal;
	next();
};

const findAppealByReference = async (/** @type {string|undefined} */ reference) => {
	if (reference) {
		const appeal = await databaseConnector.appeal.findUnique({
			where: { reference },
			include: {
				appealStatus: true,
				appealType: true
			}
		});
		if (appeal) {
			return appeal;
		}
	}

	return null;
};
