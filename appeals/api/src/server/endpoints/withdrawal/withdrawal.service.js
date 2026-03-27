import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { getFeedbackLinkFromAppealTypeKey } from '#utils/feedback-form-link.js';
import { getEnforcementReference } from '#utils/get-enforcement-reference.js';
import { FEEDBACK_FORM_LINKS } from '@pins/appeals/constants/common.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { getEventType } from '@pins/appeals/utils/event-type.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 *
 * @param {Appeal} appeal
 * @param {Date} withdrawalRequestDate
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns
 */
export const publishWithdrawal = async (
	appeal,
	withdrawalRequestDate,
	notifyClient,
	siteAddress,
	azureAdUserId
) => {
	const result = await appealRepository.setAppealWithdrawal(
		appeal.id,
		new Date(withdrawalRequestDate)
	);

	const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
	const lpaEmail = appeal.lpa?.email || '';

	const eventType = getEventType(appeal);
	const enforcementReference = await getEnforcementReference(appeal);
	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		...(enforcementReference && { enforcement_reference: enforcementReference }),
		site_address: siteAddress,
		withdrawal_date: formatDate(new Date(withdrawalRequestDate || ''), false),
		event_type: eventType,
		event_set: !!eventType,
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};

	if (recipientEmail) {
		await notifySend({
			azureAdUserId,
			templateName: 'appeal-withdrawn-appellant',
			notifyClient,
			recipientEmail,
			personalisation: {
				...personalisation,
				feedback_link: getFeedbackLinkFromAppealTypeKey(appeal.appealType?.key)
			}
		});

		await notifySend({
			azureAdUserId,
			templateName: 'appeal-withdrawn-lpa',
			notifyClient,
			recipientEmail: lpaEmail,
			personalisation: {
				...personalisation,
				feedback_link: FEEDBACK_FORM_LINKS.LPA
			}
		});
	}

	if (appeal.appealRule6Parties && appeal.appealRule6Parties.length > 0) {
		appeal.appealRule6Parties.forEach(async (party) => {
			if (party.serviceUser?.email) {
				await notifySend({
					azureAdUserId,
					templateName: 'appeal-withdrawn-lpa',
					notifyClient,
					recipientEmail: party.serviceUser.email,
					personalisation: {
						...personalisation,
						feedback_link: FEEDBACK_FORM_LINKS.LPA
					}
				});
			}
		});
	}

	if (result) {
		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.WITHDRAWN);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
