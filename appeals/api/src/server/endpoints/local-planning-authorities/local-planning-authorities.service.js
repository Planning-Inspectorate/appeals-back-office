import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import lpaRepository from '#repositories/lpa.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_LPA_UPDATED,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import { isEnforcementCaseType } from '@pins/appeals/utils/appeal-type-checks.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {Appeal|Partial<Appeal>} appeal
 * @param {number} newLpaId
 * @param {string|undefined} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {boolean} isChild
 *
 * @returns {Promise<void>}
 */
const changeLpa = async (appeal, newLpaId, azureAdUserId, notifyClient, isChild) => {
	const appealId = Number(appeal.id);
	const currentLPA = appeal.lpa;
	await lpaRepository.updateLpaByAppealId(appealId, newLpaId);
	const newLpaDetails = await lpaRepository.getLpaById(newLpaId);
	if (!isChild && appeal.reference && newLpaDetails) {
		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';

		const teamEmail = await getTeamEmailFromAppealId(appealId);
		const isEnforcement = isEnforcementCaseType(appeal.appealType?.key || '');
		const recipientEmail = appeal.appellant?.email || appeal.agent?.email;
		if (!recipientEmail) {
			throw new Error(ERROR_NO_RECIPIENT_EMAIL);
		}
		const appellantPersonalisation = {
			appeal_reference_number: appeal.reference,
			site_address: siteAddress,
			team_email_address: teamEmail,
			local_planning_authority: newLpaDetails.name,
			lpa_reference: appeal.applicationReference || '',
			...(isEnforcement && {
				enforcement_reference: appeal?.appellantCase?.enforcementReference || ''
			})
		};
		await notifySend({
			azureAdUserId: azureAdUserId || '',
			templateName: 'lpa-changed-appellant',
			notifyClient,
			recipientEmail: recipientEmail,
			personalisation: appellantPersonalisation
		});

		if (currentLPA && appeal.reference) {
			const lpaPersonalisation = {
				appeal_reference_number: appeal.reference,
				site_address: siteAddress,
				team_email_address: teamEmail,
				local_planning_authority: newLpaDetails.name,
				lpa_reference: appeal.applicationReference || '',
				...(isEnforcement && {
					enforcement_reference: appeal?.appellantCase?.enforcementReference || ''
				})
			};

			currentLPA.email
				? await notifySend({
						azureAdUserId: azureAdUserId || '',
						templateName: 'lpa-removed',
						notifyClient,
						recipientEmail: currentLPA.email,
						personalisation: lpaPersonalisation
					})
				: null;
		}
	}

	await createAuditTrail({
		appealId: appealId,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLpaDetails?.name || ''])
	});

	await broadcasters.broadcastAppeal(appealId);
};

export const lpaService = {
	changeLpa
};
