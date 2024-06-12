import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import siteVisitRepository from '#repositories/site-visit.repository.js';
import {
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL
} from '#endpoints/constants.js';
import config from '#config/config.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import formatDate from '#utils/date-formatter.js';
import { format, parseISO } from 'date-fns';
import { ERROR_NOT_FOUND } from '#endpoints/constants.js';
import { toCamelCase } from '#utils/string-utils.js';
// eslint-disable-next-line no-unused-vars
import NotifyClient from '#utils/notify-client.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateSiteVisitData} UpdateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.CreateSiteVisitData} CreateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.NotifyTemplate} NotifyTemplate */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @param {string} azureAdUserId
 * @param {CreateSiteVisitData} siteVisitData
 * @param {*} notifyClient
 * @returns {Promise<void>}
 */
export const createSiteVisit = async (azureAdUserId, siteVisitData, notifyClient) => {
	try {
		const appealId = siteVisitData.appealId;
		const visitDate = siteVisitData.visitDate;
		const visitEndTime = siteVisitData.visitEndTime;
		const visitStartTime = siteVisitData.visitStartTime;
		const visitTypeId = siteVisitData.visitType.id;

		await siteVisitRepository.createSiteVisitById({
			appealId,
			// @ts-ignore
			visitDate,
			visitEndTime,
			visitStartTime,
			siteVisitTypeId: visitTypeId
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

		const visitTypeKey = toCamelCase(`${siteVisitData.visitType.name}`);
		const notifyTemplateIds = config.govNotify.template.siteVisitSchedule[visitTypeKey] || {};

		const emailVariables = {
			appeal_reference_number: siteVisitData.appealReferenceNumber,
			lpa_reference: siteVisitData.lpaReference,
			site_address: siteVisitData.siteAddress,
			start_time: siteVisitData.visitStartTime || '',
			end_time: siteVisitData.visitEndTime || '',
			visit_date: formatDate(new Date(siteVisitData.visitDate || ''), false)
		};

		if (notifyTemplateIds.appellant && siteVisitData.appellantEmail) {
			try {
				await notifyClient.sendEmail(
					notifyTemplateIds.appellant,
					siteVisitData.appellantEmail,
					emailVariables
				);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (notifyTemplateIds.lpa && siteVisitData.lpaEmail) {
			try {
				await notifyClient.sendEmail(notifyTemplateIds.lpa, siteVisitData.lpaEmail, emailVariables);
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<Response | void>}
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
			updateSiteVisitData.previousVisitType,
			updateSiteVisitData.siteVisitChangeType
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
 * @param {string} siteVisitChangeType
 */
const fetchVisitNotificationTemplateIds = (visitType, previousVisitType, siteVisitChangeType) => {
	switch (siteVisitChangeType) {
		case 'all':
		case 'unchanged':
			return {};

		case 'date-time':
			if (visitType === 'Access required') {
				return {
					appellant: {
						id: config.govNotify.template.siteVisitChange.accessRequiredDateChange.appellant.id
					}
				};
			} else if (visitType === 'Accompanied') {
				return {
					appellant: {
						id: config.govNotify.template.siteVisitChange.accompaniedDateChange.appellant.id
					},
					lpa: { id: config.govNotify.template.siteVisitChange.accompaniedDateChange.lpa.id }
				};
			}
			return {};

		case 'visit-type': {
			const transitionKey = toCamelCase(`${previousVisitType} To ${visitType}`);
			return config.govNotify.template.siteVisitChange[transitionKey] || {};
		}
		default:
			return {};
	}
};

export { checkSiteVisitExists, updateSiteVisit, fetchVisitNotificationTemplateIds };
