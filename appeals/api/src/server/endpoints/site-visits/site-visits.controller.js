import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	VALIDATION_OUTCOME_COMPLETE
} from '@pins/appeals/constants/support.js';
import logger from '#utils/logger.js';
import { arrayOfStatusesContainsString } from '#utils/array-of-statuses-contains-string.js';
import { formatSiteVisit } from './site-visits.formatter.js';
import { createSiteVisit, updateSiteVisit } from './site-visits.service.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import transitionState from '#state/transition-state.js';

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
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}

	if (arrayOfStatusesContainsString(appeal.appealStatus, APPEAL_CASE_STATUS.EVENT)) {
		await transitionState(appealId, azureAdUserId, VALIDATION_OUTCOME_COMPLETE);
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

export { postSiteVisit, getSiteVisitById, rearrangeSiteVisit };
