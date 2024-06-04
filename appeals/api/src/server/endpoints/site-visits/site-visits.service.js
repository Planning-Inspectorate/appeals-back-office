import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import siteVisitRepository from '#repositories/site-visit.repository.js';
import {
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL
} from '#endpoints/constants.js';
import config from '#config/config.js';
// eslint-disable-next-line no-unused-vars
import NotifyClient from '#utils/notify-client.js';

/** @typedef {import('express').RequestHandler} RequestHandler */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateSiteVisitData} UpdateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.NotifyTemplate} NotifyTemplate */

import { ERROR_NOT_FOUND } from '#endpoints/constants.js';
import formatDate from '#utils/date-formatter.js';
import { toCamelCase } from '#utils/string-utils.js';

/**
 * @type {RequestHandler}
 * @returns {Promise<object | void>}
 */
const checkSiteVisitExists = async (req, res, next) => {
	const {
		appeal,
		params: { siteVisitId }
	} = req;
	const hasSiteVisit = appeal.siteVisit?.id === Number(siteVisitId);

	if (!hasSiteVisit) {
		return res.status(404).send({ errors: { siteVisitId: ERROR_NOT_FOUND } });
	}

	next();
};

/**
 * @param {string} azureAdUserId
 * @param {UpdateSiteVisitData} updateSiteVisitData
 * @param { NotifyClient } notifyClient
 */
const updateSiteVisit = async (azureAdUserId, updateSiteVisitData, notifyClient) => {
	try {
		const visitDate = updateSiteVisitData.visitDate;
		const visitEndTime = updateSiteVisitData.visitEndTime;
		const visitStartTime = updateSiteVisitData.visitStartTime;
		const siteVisitTypeId = updateSiteVisitData.visitType?.id;

		const updateData = {
			...(visitDate && { visitDate }),
			...(visitEndTime !== undefined && { visitEndTime }),
			...(visitStartTime !== undefined && { visitStartTime }),
			...(siteVisitTypeId && { siteVisitTypeId })
		};

		const appealId = Number(updateSiteVisitData.appealId);
		const notifyTemplateIds = fetchVisitNotificationTemplateIds(
			updateSiteVisitData.visitType.name,
			updateSiteVisitData.previousVisitType
		);

		const result = await siteVisitRepository.updateSiteVisitById(
			updateSiteVisitData.siteVisitId,
			updateData
		);
		if (!result) {
			throw new Error(ERROR_FAILED_TO_SAVE_DATA);
		}

		if (updateSiteVisitData.visitType) {
			await createAuditTrail({
				appealId,
				azureAdUserId,
				details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED
			});
		}

		const emailVariables = {
			appeal_reference_number: updateSiteVisitData.appealReferenceNumber,
			lpa_reference: updateSiteVisitData.lpaReference,
			site_address: updateSiteVisitData.siteAddress,
			start_time: updateSiteVisitData.visitStartTime || '',
			end_time: updateSiteVisitData.visitEndTime || '',
			visit_date: formatDate(new Date(updateSiteVisitData.visitDate || ''), false)
		};

		if (notifyTemplateIds.appellant && updateSiteVisitData.appellantEmail) {
			try {
				await notifyClient.sendEmail(
					notifyTemplateIds.appellant,
					updateSiteVisitData.appellantEmail,
					emailVariables
				);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (notifyTemplateIds.lpa && updateSiteVisitData.lpaEmail) {
			try {
				await notifyClient.sendEmail(
					notifyTemplateIds.lpa,
					updateSiteVisitData.lpaEmail,
					emailVariables
				);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		return result;
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {string} visitType
 * @param {string} previousVisitType
 */
const fetchVisitNotificationTemplateIds = (visitType, previousVisitType) => {
	if (!previousVisitType || previousVisitType === visitType) {
		return {};
	}

	const transitionKey = toCamelCase(`${previousVisitType} To ${visitType}`);
	return config.govNotify.template.siteVisitChange[transitionKey] || {};
};

export { checkSiteVisitExists, updateSiteVisit, fetchVisitNotificationTemplateIds };
