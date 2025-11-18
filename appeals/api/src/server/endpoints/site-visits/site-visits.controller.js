import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import transitionState, { transitionLinkedChildAppealsState } from '#state/transition-state.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import { isFeatureActive } from '#utils/feature-flags.js';
import logger from '#utils/logger.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	VALIDATION_OUTCOME_COMPLETE,
	VALIDATION_OUTCOME_INCOMPLETE
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { formatSiteVisit } from './site-visits.formatter.js';
import {
	createSiteVisit,
	createSiteVisitForLinkedChildAppeals,
	deleteSiteVisit,
	getMissedSiteVisit,
	recordMissedSiteVisit,
	updateSiteVisit,
	updateWhenSiteVisitMissed
} from './site-visits.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateSiteVisitData} UpdateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.CreateSiteVisitData} CreateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Schema.SiteVisitType} SiteVisitType */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getSiteVisitById = async (req, res) => {
	const { appeal } = req;
	const formattedAppeal = formatSiteVisit(appeal);

	return res.send(formattedAppeal);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const postSiteVisit = async (req, res) => {
	const {
		body: { visitDate, visitEndTime, visitStartTime, inspectorName = '' },
		params,
		visitType,
		appeal
	} = req;

	const appealId = Number(params.appealId);
	const missedSiteVisit = await getMissedSiteVisit(appealId);

	if (missedSiteVisit) {
		req.body.siteVisitId = missedSiteVisit.id;
		return rearrangeMissedSiteVisit(req, res);
	}

	const azureAdUserId = String(req.get('azureAdUserId'));
	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const appellantEmail = String(appeal.agent?.email || appeal.appellant?.email || '');
	const lpaEmail = appeal.lpa?.email || '';
	const visitTypeName = visitType.name;

	/** @type { CreateSiteVisitData } */
	const siteVisitData = {
		appealId: Number(appealId),
		visitDate: isNaN(new Date(visitDate).getTime()) ? undefined : new Date(visitDate),
		visitEndTime: isNaN(new Date(visitEndTime).getTime()) ? undefined : new Date(visitEndTime),
		visitStartTime: isNaN(new Date(visitStartTime).getTime())
			? undefined
			: new Date(visitStartTime),
		visitType: visitType,
		appellantEmail,
		lpaEmail,
		appealReferenceNumber: appeal.reference,
		lpaReference: appeal.applicationReference || '',
		inspectorName,
		siteAddress
	};

	try {
		await createSiteVisit(azureAdUserId, siteVisitData, notifyClient);
		if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
			await createSiteVisitForLinkedChildAppeals(azureAdUserId, siteVisitData, notifyClient);
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT)) {
		if (isFeatureActive(FEATURE_FLAG_NAMES.LINKED_APPEALS)) {
			await transitionLinkedChildAppealsState(appeal, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}
		await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
	}

	return res.status(201).send({
		visitDate,
		visitEndTime,
		visitStartTime,
		visitType: visitTypeName
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const rearrangeSiteVisit = async (req, res) => {
	const {
		body: {
			visitDate,
			visitEndTime,
			visitStartTime,
			inspectorName = '',
			previousVisitType,
			siteVisitChangeType
		},
		params,
		params: { siteVisitId },
		visitType,
		appeal
	} = req;
	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const appellantEmail = String(appeal.agent?.email || appeal.appellant?.email || '');
	const lpaEmail = appeal.lpa?.email || '';
	const visitTypeName = visitType.name;

	/** @type { UpdateSiteVisitData } */
	const updateSiteVisitData = {
		siteVisitId: Number(siteVisitId),
		appealId: Number(appealId),
		visitDate: isNaN(new Date(visitDate).getTime()) ? undefined : new Date(visitDate),
		visitEndTime: isNaN(new Date(visitEndTime).getTime()) ? undefined : new Date(visitEndTime),
		visitStartTime: isNaN(new Date(visitStartTime).getTime())
			? undefined
			: new Date(visitStartTime),
		visitType,
		previousVisitType,
		siteVisitChangeType,
		appellantEmail,
		lpaEmail,
		appealReferenceNumber: appeal.reference,
		lpaReference: appeal.applicationReference || '',
		inspectorName,
		siteAddress
	};

	try {
		// @ts-ignore
		await updateSiteVisit(azureAdUserId, updateSiteVisitData, notifyClient);

		return res.send({
			visitDate,
			visitEndTime,
			visitStartTime,
			visitType: visitTypeName,
			previousVisitType,
			siteVisitChangeType
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};
/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const rearrangeMissedSiteVisit = async (req, res) => {
	const {
		body: { visitDate, visitEndTime, visitStartTime, inspectorName = '', siteVisitId },
		params,

		visitType,
		appeal
	} = req;
	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));
	const notifyClient = req.notifyClient;
	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const appellantEmail = String(appeal.agent?.email || appeal.appellant?.email || '');
	const lpaEmail = appeal.lpa?.email || '';
	const visitTypeName = visitType.name;

	/** @type {*} */
	const updateSiteVisitData = {
		siteVisitId: Number(siteVisitId),
		appealId: Number(appealId),
		visitDate: isNaN(new Date(visitDate).getTime()) ? undefined : new Date(visitDate),
		visitEndTime: isNaN(new Date(visitEndTime).getTime()) ? undefined : new Date(visitEndTime),
		visitStartTime: isNaN(new Date(visitStartTime).getTime())
			? undefined
			: new Date(visitStartTime),
		visitType,
		appellantEmail,
		lpaEmail,
		appealReferenceNumber: appeal.reference,
		lpaReference: appeal.applicationReference || '',
		inspectorName,
		siteAddress
	};

	try {
		// @ts-ignore
		await updateWhenSiteVisitMissed(azureAdUserId, updateSiteVisitData, notifyClient);

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT)) {
			await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
		}

		return res.send({
			visitDate,
			visitEndTime,
			visitStartTime,
			visitType: visitTypeName
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};
/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const cancelSiteVisit = async (req, res) => {
	const { params, appeal, notifyClient } = req;
	const siteVisitId = Number(params.siteVisitId);

	const azureAdUserId = req.get('azureAdUserId') || '';
	try {
		await deleteSiteVisit(siteVisitId, appeal, notifyClient, String(azureAdUserId));

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.AWAITING_EVENT)) {
			await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_INCOMPLETE);
		}

		return res.status(200).send({ siteVisitId });
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};
/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const postSiteVisitMissed = async (req, res) => {
	const {
		params,
		appeal,
		notifyClient,
		body: { whoMissedSiteVisit }
	} = req;

	const siteVisitId = Number(params.siteVisitId);

	const azureAdUserId = req.get('azureAdUserId') || '';
	try {
		// @ts-ignore
		const result = await recordMissedSiteVisit(
			siteVisitId,
			appeal,
			notifyClient,
			String(azureAdUserId),
			whoMissedSiteVisit
		);
		if (!result) {
			return res.status(404).send({ errors: { body: 'Record missed site visit failed' } });
		}

		if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.AWAITING_EVENT)) {
			await transitionState(appeal.id, azureAdUserId, VALIDATION_OUTCOME_INCOMPLETE);
		}

		return res.send({
			siteVisitId
		});
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};

export {
	cancelSiteVisit,
	getSiteVisitById,
	postSiteVisit,
	postSiteVisitMissed,
	rearrangeSiteVisit
};
