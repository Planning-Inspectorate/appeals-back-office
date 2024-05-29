import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import {
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	ERROR_FAILED_TO_SAVE_DATA
} from '#endpoints/constants.js';
import siteVisitRepository from '#repositories/site-visit.repository.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { format, parseISO } from 'date-fns';
import { formatSiteVisit } from './site-visits.formatter.js';
import { updateSiteVisit } from './site-visits.service.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateSiteVisitData} UpdateSiteVisitData */

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
const createSiteVisit = async (req, res) => {
	const {
		body,
		body: { visitDate, visitEndTime, visitStartTime },
		params,
		visitType
	} = req;
	const appealId = Number(params.appealId);
	const azureAdUserId = String(req.get('azureAdUserId'));

	try {
		await siteVisitRepository.createSiteVisitById({
			appealId,
			visitDate,
			visitEndTime,
			visitStartTime,
			siteVisitTypeId: visitType.id
		});

		if (visitDate) {
			await createAuditTrail({
				appealId,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
					format(parseISO(visitDate), DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
				])
			});
		}

		return res.send(body);
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
const rearrangeSiteVisit = async (req, res) => {
	const {
		body,
		body: { visitDate, visitEndTime, visitStartTime, previousVisitType },
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
	const lpaEmail = appeal.lpa.email;

	/** @type { UpdateSiteVisitData } */
	const updateSiteVisitData = {
		siteVisitId: Number(siteVisitId),
		appealId: Number(appealId),
		visitDate: visitDate,
		visitEndTime,
		visitStartTime,
		visitType,
		previousVisitType,
		appellantEmail,
		lpaEmail,
		appealReferenceNumber: appeal.reference,
		lpaReference: appeal.planningApplicationReference,
		siteAddress
	};

	try {
		await updateSiteVisit(azureAdUserId, updateSiteVisitData, notifyClient);

		return res.send(body);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
	}
};

export { createSiteVisit, getSiteVisitById, rearrangeSiteVisit };
