import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import siteVisitRepository from '#repositories/site-visit.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { EVENT_TYPE } from '@pins/appeals/constants/common.js';
import {
	AUDIT_TRAIL_RECORD_MISSED_SITE_VISIT,
	AUDIT_TRAIL_SITE_VISIT_ARRANGED,
	AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED,
	CASE_RELATIONSHIP_LINKED,
	DEFAULT_DATE_FORMAT_AUDIT_TRAIL,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import formatDate, { formatTime } from '@pins/appeals/utils/date-formatter.js';
// eslint-disable-next-line no-unused-vars
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import appealRepository from '#repositories/appeal.repository.js';
import logger from '#utils/logger.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import { DEFAULT_TIMEZONE } from '@pins/appeals/constants/dates.js';
import { AUDIT_TRAIL_SITE_VISIT_CANCELLED } from '@pins/appeals/constants/support.js';
import { addDays } from '@pins/appeals/utils/business-days.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { formatInTimeZone } from 'date-fns-tz';
import { capitalize, upperCase } from 'lodash-es';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateSiteVisitData} UpdateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.CreateSiteVisitData} CreateSiteVisitData */
/** @typedef {import('@pins/appeals.api').Appeals.NotifyTemplate} NotifyTemplate */
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/** @typedef {import('./site-visits.types.js').VisitNotificationTemplateIds}  VisitNotificationTemplateIds */

/**
 * @param {string} azureAdUserId
 * @param {CreateSiteVisitData} siteVisitData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {boolean} [isChildAppeal]
 * @returns {Promise<void>}
 */
export const createSiteVisit = async (
	azureAdUserId,
	siteVisitData,
	notifyClient,
	isChildAppeal = false
) => {
	try {
		const appealId = siteVisitData.appealId;
		const visitDate = siteVisitData.visitDate;
		const visitEndTime = siteVisitData.visitEndTime;
		const visitStartTime = siteVisitData.visitStartTime;
		const visitTypeId = siteVisitData.visitType.id;

		const siteVisit = await siteVisitRepository.createSiteVisitById({
			appealId,
			visitDate,
			visitEndTime,
			visitStartTime,
			siteVisitTypeId: visitTypeId
		});

		if (isChildAppeal) {
			return;
		}

		if (visitDate) {
			await broadcasters.broadcastEvent(siteVisit.id, EVENT_TYPE.SITE_VISIT, EventType.Create);
			await createAuditTrail({
				appealId,
				azureAdUserId,
				details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
					formatInTimeZone(new Date(visitDate), DEFAULT_TIMEZONE, DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
				])
			});
		}

		const notifyTemplateIds = fetchSiteVisitScheduleTemplateIds(siteVisitData.visitType.name);

		const emailVariables = {
			appeal_reference_number: siteVisitData.appealReferenceNumber,
			lpa_reference: siteVisitData.lpaReference,
			site_address: siteVisitData.siteAddress,
			start_time: formatTime(siteVisitData.visitStartTime),
			end_time: formatTime(siteVisitData.visitEndTime),
			visit_date: formatDate(new Date(siteVisitData.visitDate || ''), false),
			inspector_name: siteVisitData.inspectorName || '',
			team_email_address: await getTeamEmailFromAppealId(appealId)
		};

		if (notifyTemplateIds.appellant && siteVisitData.appellantEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.appellant,
					notifyClient,
					recipientEmail: siteVisitData.appellantEmail,
					personalisation: emailVariables
				});
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (notifyTemplateIds.lpa && siteVisitData.lpaEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.lpa,
					notifyClient,
					recipientEmail: siteVisitData.lpaEmail,
					personalisation: emailVariables
				});
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {string} azureAdUserId
 * @param {CreateSiteVisitData} siteVisitData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @returns {Promise<void[]>}
 */
export const createSiteVisitForLinkedChildAppeals = async (
	azureAdUserId,
	siteVisitData,
	notifyClient
) => {
	const linkedAppeals = await appealRepository.getLinkedAppealsById(
		siteVisitData.appealId,
		CASE_RELATIONSHIP_LINKED
	);
	return Promise.all(
		linkedAppeals.map(async (linkedAppeal) => {
			if (linkedAppeal.childId === null) {
				return;
			}
			return createSiteVisit(
				azureAdUserId,
				{ ...siteVisitData, appealId: linkedAppeal.childId },
				notifyClient,
				true
			);
		})
	);
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
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 */
const updateSiteVisit = async (azureAdUserId, updateSiteVisitData, notifyClient) => {
	try {
		const visitDate = updateSiteVisitData.visitDate;
		const visitEndTime = updateSiteVisitData.visitEndTime;
		const visitStartTime = updateSiteVisitData.visitStartTime;
		const siteVisitTypeId = updateSiteVisitData.visitType?.id;

		const updateData = {
			...(visitDate && { visitDate }),
			visitEndTime: visitEndTime || null,
			visitStartTime: visitStartTime || null,
			...(siteVisitTypeId && { siteVisitTypeId })
		};

		const appealId = Number(updateSiteVisitData.appealId);
		const notifyTemplateIds = fetchRescheduleTemplateIds(
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

		await updatePersonalList(appealId);

		if (updateSiteVisitData.visitType) {
			await createAuditTrail({
				appealId,
				azureAdUserId,
				details: AUDIT_TRAIL_SITE_VISIT_TYPE_SELECTED
			});

			await broadcasters.broadcastEvent(
				updateSiteVisitData.siteVisitId,
				EVENT_TYPE.SITE_VISIT,
				EventType.Update
			);
		}

		const emailVariables = {
			appeal_reference_number: updateSiteVisitData.appealReferenceNumber,
			lpa_reference: updateSiteVisitData.lpaReference,
			site_address: updateSiteVisitData.siteAddress,
			start_time: formatTime(updateSiteVisitData.visitStartTime),
			end_time: formatTime(updateSiteVisitData.visitEndTime),
			visit_date: formatDate(new Date(updateSiteVisitData.visitDate || ''), false),
			inspector_name: updateSiteVisitData.inspectorName || '',
			team_email_address: await getTeamEmailFromAppealId(appealId)
		};

		if (notifyTemplateIds.appellant && updateSiteVisitData.appellantEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.appellant,
					notifyClient,
					recipientEmail: updateSiteVisitData.appellantEmail,
					personalisation: emailVariables
				});
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (notifyTemplateIds.lpa && updateSiteVisitData.lpaEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.lpa,
					notifyClient,
					recipientEmail: updateSiteVisitData.lpaEmail,
					personalisation: emailVariables
				});
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
 * @param {string} azureAdUserId
 * @param {UpdateSiteVisitData} updateSiteVisitData
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 */
const updateWhenSiteVisitMissed = async (azureAdUserId, updateSiteVisitData, notifyClient) => {
	try {
		const visitDate = updateSiteVisitData.visitDate;
		const visitEndTime = updateSiteVisitData.visitEndTime;
		const visitStartTime = updateSiteVisitData.visitStartTime;
		const siteVisitTypeId = updateSiteVisitData.visitType?.id;
		const updateData = {
			...(visitDate && { visitDate }),
			visitEndTime: visitEndTime || null,
			visitStartTime: visitStartTime || null,
			...(siteVisitTypeId && { siteVisitTypeId }),
			whoMissedSiteVisit: null
		};

		const appealId = Number(updateSiteVisitData.appealId);
		const notifyTemplateIds = fetchRearrangeMissedSiteVisitTemplateIds(
			updateSiteVisitData.visitType.name
		);

		const result = await siteVisitRepository.updateSiteVisitById(
			updateSiteVisitData.siteVisitId,
			updateData
		);
		if (!result) {
			throw new Error(ERROR_FAILED_TO_SAVE_DATA);
		}

		if (updateSiteVisitData.visitType) {
			if (visitDate) {
				await createAuditTrail({
					appealId,
					azureAdUserId,
					details: stringTokenReplacement(AUDIT_TRAIL_SITE_VISIT_ARRANGED, [
						formatInTimeZone(new Date(visitDate), DEFAULT_TIMEZONE, DEFAULT_DATE_FORMAT_AUDIT_TRAIL)
					])
				});
			}

			await broadcasters.broadcastEvent(
				updateSiteVisitData.siteVisitId,
				EVENT_TYPE.SITE_VISIT,
				EventType.Update
			);
		}

		const emailVariables = {
			appeal_reference_number: updateSiteVisitData.appealReferenceNumber,
			lpa_reference: updateSiteVisitData.lpaReference,
			site_address: updateSiteVisitData.siteAddress,
			start_time: formatTime(updateSiteVisitData.visitStartTime),
			visit_date: formatDate(new Date(updateSiteVisitData.visitDate || ''), false),
			team_email_address: await getTeamEmailFromAppealId(appealId)
		};

		if (notifyTemplateIds.appellant && updateSiteVisitData.appellantEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.appellant,
					notifyClient,
					recipientEmail: updateSiteVisitData.appellantEmail,
					personalisation: emailVariables
				});
			} catch (error) {
				throw new Error(ERROR_FAILED_TO_SEND_NOTIFICATION_EMAIL);
			}
		}

		if (notifyTemplateIds.lpa && updateSiteVisitData.lpaEmail) {
			try {
				await notifySend({
					azureAdUserId,
					templateName: notifyTemplateIds.lpa,
					notifyClient,
					recipientEmail: updateSiteVisitData.lpaEmail,
					personalisation: emailVariables
				});
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
 *
 * @returns {VisitNotificationTemplateIds}
 */
const fetchRescheduleTemplateIds = (visitType, previousVisitType, siteVisitChangeType) => {
	switch (siteVisitChangeType) {
		case 'unchanged':
			return {};

		case 'date-time':
			if (visitType === 'Access required') {
				return {
					appellant: 'site-visit-change-access-required-date-change-appellant'
				};
			} else if (visitType === 'Accompanied') {
				return {
					appellant: 'site-visit-change-accompanied-date-change-appellant',
					lpa: 'site-visit-change-accompanied-date-change-lpa'
				};
			}
			return {};

		case 'all':
		case 'visit-type': {
			const transitionKey = `${previousVisitType} To ${visitType}`;
			return getRescheduleTemplateEnvVarNames(transitionKey);
		}

		default:
			return {};
	}
};

/**
 * @param {string} transitionKey
 * @returns {VisitNotificationTemplateIds}
 */
const getRescheduleTemplateEnvVarNames = (transitionKey) => {
	switch (transitionKey) {
		case 'Accompanied To Access required':
			return {
				appellant: 'site-visit-change-accompanied-to-access-required-appellant',
				lpa: 'site-visit-change-accompanied-to-access-required-lpa'
			};
		case 'Accompanied To Unaccompanied':
			return {
				appellant: 'site-visit-change-accompanied-to-unaccompanied-appellant',
				lpa: 'site-visit-change-accompanied-to-unaccompanied-lpa'
			};
		case 'Access required To Accompanied':
			return {
				appellant: 'site-visit-change-access-required-to-accompanied-appellant',
				lpa: 'site-visit-change-access-required-to-accompanied-lpa'
			};
		case 'Access required To Unaccompanied':
			return {
				appellant: 'site-visit-change-access-required-to-unaccompanied-appellant'
			};
		case 'Unaccompanied To Access required':
			return {
				appellant: 'site-visit-change-unaccompanied-to-access-required-appellant'
			};
		case 'Unaccompanied To Accompanied':
			return {
				appellant: 'site-visit-change-unaccompanied-to-accompanied-appellant',
				lpa: 'site-visit-change-unaccompanied-to-accompanied-lpa'
			};
		default:
			return {};
	}
};

/**
 * @param {string} visitTypeName
 * @returns {VisitNotificationTemplateIds}
 */
const fetchSiteVisitScheduleTemplateIds = (visitTypeName) => {
	const visitTypeKey = visitTypeName.replace(/\s+/g, '').toLowerCase();

	switch (visitTypeKey) {
		case 'accessrequired':
			return {
				appellant: 'site-visit-schedule-access-required-appellant'
			};
		case 'accompanied':
			return {
				appellant: 'site-visit-schedule-accompanied-appellant',
				lpa: 'site-visit-schedule-accompanied-lpa'
			};
		case 'unaccompanied':
			return {
				appellant: 'site-visit-schedule-unaccompanied-appellant'
			};
		default:
			return {};
	}
};

/**
 * @param {string} visitTypeName
 * @returns {VisitNotificationTemplateIds}
 */
const fetchRearrangeMissedSiteVisitTemplateIds = (visitTypeName) => {
	const visitTypeKey = visitTypeName.replace(/\s+/g, '').toLowerCase();

	switch (visitTypeKey) {
		case 'accessrequired':
			return {
				appellant: 'missed-site-visit-rearranged-appellant'
			};
		case 'accompanied':
			return {
				appellant: 'missed-site-visit-rearranged-appellant',
				lpa: 'missed-site-visit-rearranged-lpa'
			};
		case 'unaccompanied':
			return {
				appellant: 'missed-site-visit-rearranged-unaccompanied-appellant'
			};
		default:
			return {};
	}
};

/**
 *
 * @param {number} siteVisitId
 * @param {import('@pins/appeals.api').Schema.Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 */
const deleteSiteVisit = async (siteVisitId, appeal, notifyClient, azureAdUserId) => {
	try {
		const existingSiteVisit = await siteVisitRepository.getSiteVisitById(siteVisitId);
		await siteVisitRepository.deleteSiteVisitById(siteVisitId);

		await broadcasters.broadcastEvent(
			siteVisitId,
			EVENT_TYPE.SITE_VISIT,
			EventType.Delete,
			// @ts-ignore
			existingSiteVisit
		);

		await sendCancelledSiteVisitNotification({
			appeal,
			azureAdUserId,
			notifyClient
		});

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: azureAdUserId,
			details: AUDIT_TRAIL_SITE_VISIT_CANCELLED
		});
	} catch (error) {
		logger.error(error, 'Failed to delete site visit');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 *
 * @param {number} siteVisitId
 * @param {import('@pins/appeals.api').Schema.Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} azureAdUserId
 * @param {string} whoMissedSiteVisit
 * @returns
 */
const recordMissedSiteVisit = async (
	siteVisitId,
	appeal,
	notifyClient,
	azureAdUserId,
	whoMissedSiteVisit
) => {
	const result = await siteVisitRepository.updateSiteVisitById(siteVisitId, { whoMissedSiteVisit });
	if (!result) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}

	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const currentDate = new Date();
	const deadlineDate = dateISOStringToDisplayDate(await addDays(currentDate, 5));
	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		visit_date: dateISOStringToDisplayDate(appeal.siteVisit?.visitDate),
		'5_day_deadline': deadlineDate,
		start_time: formatTime(appeal.siteVisit?.visitStartTime),
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};
	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId: azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_RECORD_MISSED_SITE_VISIT, [
			whoMissedSiteVisit === 'lpa' ? upperCase(whoMissedSiteVisit) : capitalize(whoMissedSiteVisit)
		])
	});

	const appellantEmail = appeal.appellant?.email ?? appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email;

	if (appellantEmail && whoMissedSiteVisit === 'appellant') {
		await notifySend({
			azureAdUserId: azureAdUserId,
			templateName: 'record-missed-site-visit-appellant',
			notifyClient,
			recipientEmail: appellantEmail,
			personalisation
		});
	}

	if (lpaEmail && whoMissedSiteVisit === 'lpa') {
		await notifySend({
			azureAdUserId: azureAdUserId,
			templateName: 'record-missed-site-visit-lpa',
			notifyClient,
			recipientEmail: lpaEmail,
			personalisation
		});
	}
	return result;
};

/**
 *
 * @param {number} appealId
 */
const getMissedSiteVisit = async (appealId) =>
	await siteVisitRepository.getMissedSiteVisitByAppealId(appealId);

/**
 *
 * @param {Object} params
 * @param {import('@pins/appeals.api').Schema.Appeal}  params.appeal
 * @param {string} params.azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient}  params.notifyClient
 */
const sendCancelledSiteVisitNotification = async ({ appeal, azureAdUserId, notifyClient }) => {
	const templateName = 'site-visit-cancelled';

	const siteAddress = appeal.address
		? formatAddressSingleLine(appeal.address)
		: 'Address not available';

	const teamEmail = await getTeamEmailFromAppealId(appeal.id);

	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: siteAddress,
		team_email_address: teamEmail
	};

	const appellantRecipientEmail = appeal.agent?.email || appeal.appellant?.email;

	if (appellantRecipientEmail) {
		await notifySend({
			azureAdUserId,
			templateName,
			notifyClient,
			recipientEmail: appellantRecipientEmail,
			personalisation
		});
	}

	if (appeal.lpa?.email) {
		await notifySend({
			azureAdUserId,
			templateName,
			notifyClient,
			recipientEmail: appeal.lpa.email,
			personalisation
		});
	}
};

export {
	checkSiteVisitExists,
	deleteSiteVisit,
	fetchRearrangeMissedSiteVisitTemplateIds,
	fetchRescheduleTemplateIds,
	fetchSiteVisitScheduleTemplateIds,
	getMissedSiteVisit,
	recordMissedSiteVisit,
	updateSiteVisit,
	updateWhenSiteVisitMissed
};
