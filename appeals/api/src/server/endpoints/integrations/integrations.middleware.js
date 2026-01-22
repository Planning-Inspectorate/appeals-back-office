import { serviceUserIdStartRange } from '#mappers/integration/map-service-user-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import { getEnabledAppealTypes } from '#utils/feature-flags-appeal-types.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import { default as logger, default as pino } from '#utils/logger.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	CASE_RELATIONSHIP_LINKED,
	ERROR_INVALID_APPEAL_TYPE_REP,
	ERROR_INVALID_APPELLANT_CASE_DATA,
	ERROR_INVALID_LPAQ_DATA,
	ERROR_INVALID_REP_DATA,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import isExpeditedAppealType from '@pins/appeals/utils/is-expedited-appeal-type.js';
import { APPEAL_REPRESENTATION_TYPE } from '@planning-inspectorate/data-model';
import { schemas, validateFromSchema } from './integrations.validators.js';

/** @type {Record<string, { flag: string, name: string }>} */
const rule6Config = {
	[APPEAL_REPRESENTATION_TYPE.PROOFS_EVIDENCE]: {
		flag: FEATURE_FLAG_NAMES.RULE_6_PARTIES_POE,
		name: 'Proof of Evidence'
	},
	[APPEAL_REPRESENTATION_TYPE.STATEMENT]: {
		flag: FEATURE_FLAG_NAMES.RULE_6_STATEMENT,
		name: 'Statement'
	}
};

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

	const referenceData = await loadReferenceData(body?.casedata?.caseReference);
	if (!referenceData?.appeal) {
		pino.error(
			`Error associating representation to an existing appeal with reference '${body?.caseReference}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	req.appeal = referenceData.appeal;
	req.designatedSites = referenceData.designatedSites;
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

	const useLeadAppealIfLinked = isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS);
	const referenceData = await loadReferenceData(body?.caseReference, useLeadAppealIfLinked);
	if (!referenceData?.appeal) {
		pino.error(
			`Error associating representation to an existing appeal with reference '${body?.caseReference}'`
		);
		return res.status(404).send({
			errors: {
				appeal: ERROR_NOT_FOUND
			}
		});
	}

	const featureFlagResponse = validateRule6FeatureAndParty(
		res,
		body.representationType,
		body.caseReference,
		body.serviceUserId,
		referenceData
	);

	if (featureFlagResponse) {
		return featureFlagResponse;
	}

	if (isExpeditedAppealType(referenceData.appeal.appealType?.key)) {
		pino.error(
			`The reference appeal '${body?.caseReference}' does not accept representations (${referenceData.appeal.appealType?.key})`
		);
		return res.status(400).send({
			errors: {
				appeal: ERROR_INVALID_APPEAL_TYPE_REP
			}
		});
	}

	// TODO: additional validation,
	// e.g. reject if rep time window is elapsed or custom logic depending on representationType and appeal status

	req.appeal = referenceData.appeal;
	req.designatedSites = referenceData.designatedSites;

	next();
};

/**
 * Loads reference data for an appeal
 * @param {string|undefined} reference
 * @param {boolean} [useLeadAppealIfLinked]
 * @returns {Promise<*|null>}
 */
const loadReferenceData = async (reference, useLeadAppealIfLinked = false) => {
	if (!reference) {
		return null;
	}
	return databaseConnector.$transaction(async (tx) => {
		if (useLeadAppealIfLinked) {
			const linkedAppeal = await tx.appealRelationship.findFirst({
				where: {
					childRef: reference,
					type: CASE_RELATIONSHIP_LINKED
				}
			});
			if (linkedAppeal?.parentRef) {
				reference = linkedAppeal.parentRef;
			}
		}

		let appeal = await tx.appeal.findUnique({
			where: { reference },
			include: {
				appealStatus: true,
				appealType: true,
				appellant: true,
				agent: true,
				lpa: true,
				appealRule6Parties: {
					include: {
						serviceUser: true
					}
				},
				inquiry: true,
				appealTimetable: true,
				address: true
			}
		});

		const designatedSites = await tx.designatedSite.findMany();

		if (appeal && designatedSites) {
			return {
				appeal,
				designatedSites
			};
		}
	});
};

/**
 * @param {import("express").Response} res
 * @param {string} representationType
 * @param {string} caseReference
 * @param {string} serviceUserId
 * @param {*} referenceData
 * @returns {object|undefined}
 */
const validateRule6FeatureAndParty = (
	res,
	representationType,
	caseReference,
	serviceUserId,
	referenceData
) => {
	const config = rule6Config[representationType];
	if (!config) {
		return;
	}

	const isFeatureEnabled = isFeatureActive(config.flag);
	if (isFeatureEnabled) {
		return;
	}

	const serviceUserIdBo = Number(serviceUserId) - serviceUserIdStartRange;
	const isRule6Party = !!referenceData.appeal.appealRule6Parties?.some(
		(/** @type {{ serviceUserId: number; }} */ party) => party.serviceUserId === serviceUserIdBo
	);

	if (isRule6Party) {
		logger.info(
			`Blocking Rule 6 ${config.name} submission for appeal '${caseReference}' as feature flag is disabled`
		);
		return res.status(403).send({
			errors: {
				integration: `Rule 6 ${config.name} ingestion is currently disabled`
			}
		});
	}
};
