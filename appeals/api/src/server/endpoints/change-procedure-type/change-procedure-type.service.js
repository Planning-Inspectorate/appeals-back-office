/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import {
	formatAddressForDb,
	formatAddressSingleLine
} from '#endpoints/addresses/addresses.formatter.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';
import { APPEAL_REPRESENTATION_TYPE, EVENT_TYPE } from '@pins/appeals/constants/common.js';
import { DEFAULT_TIMEZONE } from '@pins/appeals/constants/dates.js';
import {
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import { dateISOStringToDisplayDate } from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * @param {import('src/server/openapi-types.js').ChangeProcedureTypeRequest} data
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const changeProcedureToWritten = async (data, appealId) => {
	try {
		await databaseConnector.$transaction(async (tx) => {
			const procedureType = await tx.procedureType.findFirst({
				where: { key: data.appealProcedure }
			});

			await tx.appeal.update({
				where: { id: appealId },
				data: {
					procedureTypeId: procedureType?.id
				}
			});

			const updatedAppeal = await tx.appealTimetable.update({
				where: { appealId },
				data: {
					lpaQuestionnaireDueDate: data.lpaQuestionnaireDueDate,
					lpaStatementDueDate: data.statementDueDate,
					appellantStatementDueDate: data.statementDueDate,
					ipCommentsDueDate: data.ipCommentsDueDate
				}
			});

			if (data.existingAppealProcedure === 'hearing') {
				await tx.hearing.deleteMany({
					where: { appealId }
				});
				await tx.hearingEstimate.deleteMany({
					where: { appealId }
				});
			} else if (data.existingAppealProcedure === 'inquiry') {
				await tx.inquiry.deleteMany({
					where: { appealId }
				});
				await tx.inquiryEstimate.deleteMany({
					where: { appealId }
				});
			}
			return { updatedAppeal };
		});
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/** @typedef {import('@pins/appeals.api').Schema.Address} Address */

/**
 * @param {import('src/server/openapi-types.js').ChangeProcedureTypeRequest} data
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const changeProcedureToHearing = async (data, appealId) => {
	try {
		const result = await databaseConnector.$transaction(async (tx) => {
			const procedureType = await tx.procedureType.findFirst({
				where: { key: data.appealProcedure }
			});

			await tx.appeal.update({
				where: { id: appealId },
				data: {
					procedureTypeId: procedureType?.id
				}
			});

			const hearing = await tx.hearing.findFirst({ where: { appealId } });
			let updatedHearing;
			if (hearing) {
				updatedHearing = await tx.hearing.update({
					where: { appealId },
					data: {
						hearingStartTime: data.eventDate
					}
				});
			} else {
				if (data.eventDate) {
					updatedHearing = await tx.hearing.create({
						data: {
							appealId,
							hearingStartTime: data.eventDate
						}
					});
				}
			}

			const updatedAppeal = await tx.appealTimetable.update({
				where: { appealId },
				data: {
					lpaQuestionnaireDueDate: data.lpaQuestionnaireDueDate,
					lpaStatementDueDate: data.statementDueDate,
					ipCommentsDueDate: data.ipCommentsDueDate,
					statementOfCommonGroundDueDate: data.statementOfCommonGroundDueDate,
					planningObligationDueDate: data.planningObligationDueDate
				}
			});
			if (data.existingAppealProcedure === 'written') {
				await tx.siteVisit.deleteMany({
					where: { appealId }
				});
			} else if (data.existingAppealProcedure === 'inquiry') {
				await tx.inquiry.deleteMany({
					where: { appealId }
				});
				await tx.inquiryEstimate.deleteMany({
					where: { appealId }
				});
			}
			return { updatedAppeal, updatedHearing };
		});

		if (result.updatedHearing) {
			await broadcasters.broadcastEvent(
				result.updatedHearing.id,
				EVENT_TYPE.HEARING,
				data.appealProcedure === data.existingAppealProcedure ? EventType.Update : EventType.Create
			);
		}
	} catch (error) {
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {import('src/server/openapi-types.js').ChangeProcedureTypeRequest} data
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const changeProcedureToInquiry = async (data, appealId) => {
	try {
		const result = await databaseConnector.$transaction(async (tx) => {
			const procedureType = await tx.procedureType.findFirst({
				where: { key: data.appealProcedure }
			});

			await tx.appeal.update({
				where: { id: appealId },
				data: {
					procedureTypeId: procedureType?.id
				}
			});

			const inquiry = await tx.inquiry.findFirst({ where: { appealId } });

			let address;
			if (data.address && !inquiry?.addressId) {
				address = await tx.address.create({
					data: {
						addressLine1: data.address.addressLine1,
						addressLine2: data.address.addressLine2 || null,
						addressTown: data.address.town,
						addressCounty: data.address.county || null,
						postcode: data.address.postcode,
						addressCountry: data.address.country || null
					}
				});
			} else if (data.address && inquiry?.addressId) {
				address = await tx.address.update({
					where: { id: inquiry.addressId },
					data: {
						addressLine1: data.address.addressLine1,
						addressLine2: data.address.addressLine2 || null,
						addressTown: data.address.town,
						addressCounty: data.address.county || null,
						postcode: data.address.postcode,
						addressCountry: data.address.country || null
					}
				});
			}
			let updatedInquiry;
			if (inquiry) {
				updatedInquiry = await tx.inquiry.update({
					where: { appealId },
					data: {
						inquiryStartTime: data.eventDate,
						estimatedDays: data.estimationDays ? Number(data.estimationDays) : null,
						addressId: data.address ? address?.id : null
					}
				});
			} else {
				if (data.eventDate) {
					updatedInquiry = await tx.inquiry.create({
						data: {
							inquiryStartTime: data.eventDate,
							inquiryEndTime: null,
							appealId,
							addressId: data?.address ? address?.id : null,
							estimatedDays: data.estimationDays ? Number(data.estimationDays) : null
						}
					});
				}
			}

			const updatedAppeal = await tx.appealTimetable.update({
				where: { appealId },
				data: {
					lpaQuestionnaireDueDate: data.lpaQuestionnaireDueDate,
					lpaStatementDueDate: data.statementDueDate,
					ipCommentsDueDate: data.ipCommentsDueDate,
					statementOfCommonGroundDueDate: data.statementOfCommonGroundDueDate,
					planningObligationDueDate: data.planningObligationDueDate,
					proofOfEvidenceAndWitnessesDueDate: data.proofOfEvidenceAndWitnessesDueDate
				}
			});

			if (data.existingAppealProcedure === 'hearing') {
				await tx.hearing.deleteMany({
					where: { appealId }
				});
				await tx.hearingEstimate.deleteMany({
					where: { appealId }
				});
			} else if (data.existingAppealProcedure === 'written') {
				await tx.siteVisit.deleteMany({
					where: { appealId }
				});
			}
			return { updatedAppeal, updatedInquiry };
		});

		if (result.updatedInquiry) {
			await broadcasters.broadcastEvent(
				result.updatedInquiry.id,
				EVENT_TYPE.INQUIRY,
				data.appealProcedure === data.existingAppealProcedure ? EventType.Update : EventType.Create
			);
		}
	} catch (error) {
		logger.error(error);
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {string} appealProcedure
 * @param {string | undefined} existingAppealProcedure
 * @param {string | undefined} proofOfEvidenceAndWitnessesDueDate
 * @param {import('#endpoints/appeals.js').SingleAddressResponse | undefined} address
 * @param {string | undefined} eventDate
 * @returns {Promise<void>}
 */
export const sendChangeProcedureTypeNotifications = async (
	notifyClient,
	templateName,
	appeal,
	appealProcedure,
	existingAppealProcedure,
	proofOfEvidenceAndWitnessesDueDate,
	address,
	eventDate
) => {
	const lpaStatement = await databaseConnector.representation.findFirst({
		where: { appealId: appeal.id, representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT }
	});

	const inquiry = await databaseConnector.inquiry.findUnique({
		where: { appealId: appeal.id },
		include: {
			address: true
		}
	});

	const conferenceDate = inquiry?.inquiryStartTime ? new Date(inquiry.inquiryStartTime) : null;
	const weekBeforeConferenceDate = conferenceDate
		? new Date(conferenceDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
		: '';

	const personalisation = {
		change_message: `We have changed your appeal procedure to ${
			appealProcedure === 'written' ? 'written representations' : appealProcedure
		} ${
			existingAppealProcedure === 'hearing' && appeal.hearing
				? `and cancelled your hearing`
				: existingAppealProcedure === 'inquiry' && appeal.inquiry
				? `and cancelled your inquiry`
				: existingAppealProcedure === 'written' && appeal.siteVisit
				? 'and cancelled your site visit'
				: ''
		}.`,
		appeal_procedure: appealProcedure,
		team_email_address: await getTeamEmailFromAppealId(appeal.id),
		inquiry_date: dateISOStringToDisplayDate(
			inquiry?.inquiryStartTime
				? typeof inquiry?.inquiryStartTime === 'string'
					? inquiry?.inquiryStartTime
					: inquiry?.inquiryStartTime.toISOString()
				: ''
		),
		inquiry_time: dateISOStringToDisplayTime12hr(
			inquiry?.inquiryStartTime
				? typeof inquiry?.inquiryStartTime === 'string'
					? inquiry?.inquiryStartTime
					: inquiry?.inquiryStartTime.toISOString()
				: ''
		),
		inquiry_expected_days: inquiry?.estimatedDays ? inquiry?.estimatedDays.toString() : '',
		inquiry_address: address
			? formatAddressSingleLine({ ...formatAddressForDb(address), id: 0 })
			: '',
		week_before_conference_date: inquiry?.inquiryStartTime
			? dateISOStringToDisplayDate(weekBeforeConferenceDate)
			: '',
		proof_of_evidence_due_date: proofOfEvidenceAndWitnessesDueDate
			? dateISOStringToDisplayDate(proofOfEvidenceAndWitnessesDueDate)
			: '',
		existing_appeal_procedure: existingAppealProcedure ?? '',
		hearing_date: eventDate ? dateISOStringToDisplayDate(eventDate) : '',
		hearing_time: dateISOStringToDisplayTime12hr(eventDate ?? '')
	};
	await sendNotifications(notifyClient, templateName, appeal, lpaStatement, personalisation);
};

/**
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {string} templateName
 * @param {Appeal} appeal
 * @param {Object | null} lpaStatement
 * @param {Record<string, string>} [personalisation]
 * @returns {Promise<void>}
 */
const sendNotifications = async (
	notifyClient,
	templateName,
	appeal,
	lpaStatement,
	personalisation = {}
) => {
	const appellantEmail = appeal.appellant?.email ?? appeal.agent?.email;
	const lpaEmail = appeal.lpa?.email;
	if (!appellantEmail || !lpaEmail) {
		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
	}

	[
		{ email: appellantEmail, isLpa: false },
		{ email: lpaEmail, isLpa: true }
	].forEach(async (item) => {
		const subject = `We have changed ${item.isLpa ? 'the' : 'your'} appeal procedure: ${
			appeal.reference
		}`;

		await notifySend({
			notifyClient,
			templateName,
			personalisation: {
				appeal_reference_number: appeal.reference,
				site_address: appeal.address ? formatAddressSingleLine(appeal.address) : '',
				lpa_reference: appeal.applicationReference ?? '',
				is_lpa: item.isLpa,
				lpa_statement_exists: lpaStatement ? true : false,
				subject,
				...personalisation
			},
			recipientEmail: item.email
		});
	});
};

/**
 * @param {string | null | undefined} dateISOString
 * @returns {string}
 */
function dateISOStringToDisplayTime12hr(dateISOString) {
	if (typeof dateISOString === 'undefined' || dateISOString === null) {
		return '';
	}

	let displayTimeString;

	try {
		displayTimeString = formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, `h:mmaaa`);
	} catch (e) {
		displayTimeString = '';
	}

	return displayTimeString;
}
