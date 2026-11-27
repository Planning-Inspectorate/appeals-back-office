/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { generateNotifyPreview } from '#notify/emulate-notify.js';
import { renderTemplate } from '#notify/notify-send.js';
import { getFeedbackLinkFromAppealTypeKey } from '#utils/feedback-form-link.js';
import { formatContactDetails } from '#utils/format-contact-details.js';
import logger from '#utils/logger.js';
import { trimAppealType } from '#utils/string-utils.js';

import { loadEnvironment } from '@pins/platform';
const environment = loadEnvironment(process.env.NODE_ENV);

// /**
//  * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
//  * @param {string} templateName
//  * @param {Appeal} appeal
//  * @param {Object | null} lpaStatement
//  * @param {Record<string, string>} [personalisation]
//  * @param {string} [azureAdUserId]
//  * @returns {Promise<void>}
//  */
// const sendNotifications = async (
// 	notifyClient,
// 	templateName,
// 	appeal,
// 	lpaStatement,
// 	personalisation = {},
// 	azureAdUserId
// ) => {
// 	const appellantEmail = appeal.agent?.email ?? appeal.appellant?.email;
// 	const lpaEmail = appeal.lpa?.email;
// 	if (!appellantEmail || !lpaEmail) {
// 		throw new Error(ERROR_NO_RECIPIENT_EMAIL);
// 	}

// 	[
// 		{ email: appellantEmail, isLpa: false },
// 		{ email: lpaEmail, isLpa: true }
// 	].forEach(async (item) => {
// 		const subject = `We have changed ${item.isLpa ? 'the' : 'your'} appeal procedure: ${
// 			appeal.reference
// 		}`;

// 		const enforcementReference = await getEnforcementReference(appeal);
// 		await notifySend({
// 			azureAdUserId,
// 			notifyClient,
// 			templateName,
// 			personalisation: {
// 				appeal_reference_number: appeal.reference,
// 				site_address: appeal.address ? formatAddressSingleLine(appeal.address) : '',
// 				lpa_reference: appeal.applicationReference ?? '',
// 				...(enforcementReference && { enforcement_reference: enforcementReference }),
// 				is_lpa: item.isLpa,
// 				fo_dashboard_stub: item.isLpa
// 					? FRONT_OFFICE_DASHBOARD_PATH_STUBS.LPA
// 					: FRONT_OFFICE_DASHBOARD_PATH_STUBS.APPELLANT,
// 				lpa_statement_exists: lpaStatement ? true : false,
// 				subject,
// 				...personalisation
// 			},
// 			recipientEmail: item.email
// 		});
// 	});
// };

// /**
//  * @param {string | null | undefined} dateISOString
//  * @returns {string}
//  */
// function dateISOStringToDisplayTime12hr(dateISOString) {
// 	if (typeof dateISOString === 'undefined' || dateISOString === null) {
// 		return '';
// 	}

// 	let displayTimeString;

// 	try {
// 		displayTimeString = formatInTimeZone(dateISOString, DEFAULT_TIMEZONE, `h:mmaaa`);
// 	} catch {
// 		displayTimeString = '';
// 	}

// 	return displayTimeString;
// }

/**
 * @param {Appeal} appeal
 * @param {String} siteAddress
 * @param {String} updatedProcedureType
 * @param {String} dueDate
 * @returns {Promise<{appellant?: string, lpa?: string}>}
 */
export const getChangeToPart2NotifyPreviews = async (
	appeal,
	siteAddress,
	updatedProcedureType,
	dueDate
) => {
	try {
		const { id: appealId } = appeal;

		const teamEmail = await getTeamEmailFromAppealId(appealId);

		const { agent, appellant } = appeal || {};

		const appealType = appeal.appealType?.type || '';
		console.log(updatedProcedureType);
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			team_email_address: teamEmail,
			local_planning_authority: appeal.lpa?.name || '',
			appeal_type: trimAppealType(appealType),
			procedureType: updatedProcedureType,
			dueDate: dueDate
		};

		const appellantTemplateName =
			'expedited-validation-change-procedure-to-type-2-appellant.content.md';
		const lpaTemplateName = 'expedited-validation-change-procedure-to-type-2-lpa.content.md';

		const appellantTemplate = appellant
			? renderTemplate(appellantTemplateName, {
					...personalisation,
					feedback_link: getFeedbackLinkFromAppealTypeKey(appeal?.appealType?.key)
				})
			: '';

		const lpaTemplate = renderTemplate(lpaTemplateName, {
			...personalisation,
			agent_contact_details: agent ? formatContactDetails(agent) : '',
			appellant_contact_details: appellant ? formatContactDetails(appellant) : '',
			front_office_url: environment.FRONT_OFFICE_URL || ''
		});

		return {
			...(appellant && { appellant: generateNotifyPreview(appellantTemplate) }),
			...{ lpa: generateNotifyPreview(lpaTemplate) }
		};
	} catch (/** @type {any} */ error) {
		logger.error(`Error generating notify previews for appeal ID ${appeal.id}: ${error}`);
		throw error;
	}
};
