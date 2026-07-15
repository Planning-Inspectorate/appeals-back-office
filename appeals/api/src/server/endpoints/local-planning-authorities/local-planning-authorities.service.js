import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import lpaRepository from '#repositories/lpa.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_LPA_UPDATED,
	ERROR_NO_RECIPIENT_EMAIL
} from '@pins/appeals/constants/support.js';
import {
	isEnforcementCaseType,
	isLdcOrDiscontinuanceOrEnforcementCaseType
} from '@pins/appeals/utils/appeal-type-checks.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {string|null|undefined} caseType
 * @param {import('@pins/appeals.api').Schema.LPA} lpaDetails
 * @returns {Promise<number|null>}
 */
const determineEnforcementTeam = async (caseType, lpaDetails) => {
	return lpaDetails.enforcementTeamId || null;
};

/**
 * @param {number} appealId
 * @param {import('@pins/appeals.api').Schema.LPA} newLpaDetails
 * @returns {Promise<void>}
 */
const updateAppealAssignedTeam = async (appealId, newLpaDetails) => {
	const appealDetails = await databaseConnector.appeal.findUnique({
		where: { id: appealId },
		select: {
			appealType: {
				select: {
					key: true
				}
			}
		}
	});

	if (!appealDetails) {
		return;
	}

	const caseType = appealDetails.appealType?.key;
	if (isLdcOrDiscontinuanceOrEnforcementCaseType(caseType)) {
		const teamId = await determineEnforcementTeam(caseType, newLpaDetails);
		if (teamId) {
			await databaseConnector.appeal.update({
				where: { id: appealId },
				data: { assignedTeamId: teamId }
			});
		}
	}
};

/**
 * @param {Appeal|Partial<Appeal>} appeal
 * @param {number} newLpaId
 * @param {string|undefined} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @param {boolean} isChild
 *
 * @returns {Promise<void>}
 */
/**
 * @param {Appeal|Partial<Appeal>} appeal
 * @param {import('@pins/appeals.api').Schema.LPA} newLpaDetails
 * @param {string|undefined} azureAdUserId
 * @param {import('#endpoints/appeals.js').NotifyClient} notifyClient
 * @returns {Promise<void>}
 */
const sendLpaChangeNotifications = async (appeal, newLpaDetails, azureAdUserId, notifyClient) => {
	const appealId = Number(appeal.id);
	const currentLPA = appeal.lpa;
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
		appeal_reference_number: appeal.reference || '',
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
};

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
	try {
		const appealId = Number(appeal.id);
		await lpaRepository.updateLpaByAppealId(appealId, newLpaId);
		const newLpaDetails = await lpaRepository.getLpaById(newLpaId);

		if (newLpaDetails) {
			await updateAppealAssignedTeam(appealId, newLpaDetails);
		}

		if (!isChild && appeal.reference && newLpaDetails) {
			await sendLpaChangeNotifications(appeal, newLpaDetails, azureAdUserId, notifyClient);
		}

		await createAuditTrail({
			appealId: appealId,
			azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_LPA_UPDATED, [newLpaDetails?.name || ''])
		});

		await broadcasters.broadcastAppeal(appealId);
	} catch (err) {
		console.error('ERROR IN changeLpa:', err);
		throw err;
	}
};

export const lpaService = {
	changeLpa
};
