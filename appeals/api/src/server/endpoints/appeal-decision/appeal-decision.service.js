import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import formatDate from '#utils/date-formatter.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { notifySend } from '#notify/notify-send.js';
import { loadEnvironment } from '@pins/platform';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */

const environment = loadEnvironment(process.env.NODE_ENV);

/**
 *
 * @param {Appeal} appeal
 * @param {string} outcome
 * @param {Date} documentDate
 * @param {Document} document
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureUserId
 * @returns
 */
export const publishDecision = async (
	appeal,
	outcome,
	documentDate,
	document,
	notifyClient,
	siteAddress,
	azureUserId
) => {
	const result = await appealRepository.setAppealDecision(appeal.id, {
		documentDate,
		documentGuid: document.guid,
		version: document.latestDocumentVersion?.version || 1,
		outcome
	});

	if (result) {
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			front_office_url: environment.FRONT_OFFICE_URL || '',
			decision_date: formatDate(new Date(documentDate || ''), false)
		};
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		const lpaEmail = appeal.lpa?.email || '';

		if (recipientEmail) {
			await notifySend({
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				notifyClient,
				recipientEmail,
				personalisation
			});
		}

		if (lpaEmail) {
			await notifySend({
				templateName: 'decision-is-allowed-split-dismissed-lpa',
				notifyClient,
				recipientEmail: lpaEmail,
				personalisation
			});
		}

		await transitionState(appeal.id, azureUserId, APPEAL_CASE_STATUS.COMPLETE);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};
