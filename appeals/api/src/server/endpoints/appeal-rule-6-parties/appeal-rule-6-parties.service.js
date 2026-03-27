import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import appealRule6PartyRepository from '#repositories/appeal-rule-6-party.repository.js';
import { getEnforcementReference } from '#utils/get-enforcement-reference.js';
import logger from '#utils/logger.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import * as SUPPORT_CONSTANTS from '@pins/appeals/constants/support.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { EventType } from '@pins/event-client';
import { SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';

/** @typedef {import('express').Request['appeal']} Appeal */
/** @typedef {import('#db-client/client.ts').ServiceUser} ServiceUser */
/** @typedef {import('#db-client/client.ts').AppealRule6Party} AppealRule6Party */
/** @typedef {import('#endpoints/appeals.js').NotifyClient} NotifyClient */

/**
 * @param {Appeal} appeal
 * @param {ServiceUser} serviceUser
 * @param {string} azureAdUserId
 * @param {NotifyClient} notifyClient
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const addRule6Party = async (appeal, serviceUser, azureAdUserId, notifyClient) => {
	try {
		const { id: appealId, reference: appealReference } = appeal;
		const result = await appealRule6PartyRepository.createAppealRule6Party({
			appealId,
			serviceUser
		});

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Create,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appealReference
		);

		await createAuditTrail({
			appealId,
			azureAdUserId,
			details: stringTokenReplacement(SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_ADDED, [
				serviceUser.organisationName || ''
			])
		});

		await createAuditTrail({
			appealId,
			azureAdUserId,
			details: SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_ADDED_EMAILS_SENT
		});

		const siteAddress = appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available';
		const teamEmail = await getTeamEmailFromAppealId(appealId);
		const enforcementReference = await getEnforcementReference(appeal);

		if (serviceUser.email) {
			const statementsDueDate = appeal.appealTimetable?.lpaStatementDueDate;
			const proofsDueDate = appeal.appealTimetable?.proofOfEvidenceAndWitnessesDueDate;

			await notifySend({
				azureAdUserId,
				templateName: 'rule-6-status-accepted-rule-6-party',
				notifyClient,
				recipientEmail: serviceUser.email,
				personalisation: {
					appeal_reference_number: appealReference,
					lpa_reference: appeal.applicationReference || '',
					...(enforcementReference && { enforcement_reference: enforcementReference }),
					site_address: siteAddress,
					statements_due_date: statementsDueDate
						? formatDate(new Date(statementsDueDate), false)
						: '',
					proofs_due_date: proofsDueDate ? formatDate(new Date(proofsDueDate), false) : '',
					team_email_address: teamEmail
				}
			});
		}

		const mainPartiesRecipients = [
			appeal.agent?.email || appeal.appellant?.email,
			appeal.lpa?.email
		].filter(Boolean);

		for (const recipientEmail of mainPartiesRecipients) {
			await notifySend({
				azureAdUserId,
				templateName: 'rule-6-status-accepted-main-parties',
				notifyClient,
				recipientEmail,
				personalisation: {
					appeal_reference_number: appealReference,
					lpa_reference: appeal.applicationReference || '',
					...(enforcementReference && { enforcement_reference: enforcementReference }),
					site_address: siteAddress,
					rule_6_organisation: serviceUser.organisationName || '',
					team_email_address: teamEmail
				}
			});
		}

		return result;
	} catch (error) {
		logger.error(error, 'Failed to add rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {Appeal} appeal
 * @param {number} rule6PartyId
 * @param {ServiceUser} serviceUser
 * @param {string} azureAdUserId
 * @param {NotifyClient} notifyClient
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const updateRule6Party = async (appeal, rule6PartyId, serviceUser, azureAdUserId, notifyClient) => {
	try {
		const result = await appealRule6PartyRepository.updateRule6Party({ rule6PartyId, serviceUser });

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Update,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appeal.reference
		);

		await createAuditTrail({
			appealId: result.appealId,
			azureAdUserId,
			details: stringTokenReplacement(SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_DETAILS_UPDATED, [
				serviceUser.organisationName || ''
			])
		});

		const recipientEmail = serviceUser.email;
		if (recipientEmail) {
			const siteAddress = appeal.address
				? formatAddressSingleLine(appeal.address)
				: 'Address not available';
			const teamEmail = await getTeamEmailFromAppealId(appeal.id);
			const enforcementReference = await getEnforcementReference(appeal);

			await notifySend({
				azureAdUserId,
				templateName: 'rule-6-party-updated',
				notifyClient,
				recipientEmail,
				personalisation: {
					appeal_reference_number: appeal.reference,
					lpa_reference: appeal.applicationReference || '',
					...(enforcementReference && { enforcement_reference: enforcementReference }),
					site_address: siteAddress,
					rule_6_organisation: serviceUser.organisationName || '',
					team_email_address: teamEmail
				}
			});
		}

		return result;
	} catch (error) {
		logger.error(error, 'Failed to update rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

/**
 * @param {string} appealReference
 * @param {number} rule6PartyId
 * @param {string} azureAdUserId
 * @returns {Promise<{ appealId: number, id: number, serviceUserId: number }>}
 */
// eslint-disable-next-line no-unused-vars
const deleteRule6Party = async (appealReference, rule6PartyId, azureAdUserId) => {
	try {
		const rule6Party = await appealRule6PartyRepository.getRule6PartyById(rule6PartyId);

		const result = await appealRule6PartyRepository.deleteRule6Party(rule6PartyId);

		await broadcasters.broadcastServiceUser(
			result.serviceUserId,
			EventType.Delete,
			SERVICE_USER_TYPE.RULE_6_PARTY,
			appealReference
		);

		if (rule6Party && rule6Party.serviceUser) {
			await createAuditTrail({
				appealId: result.appealId,
				azureAdUserId,
				details: stringTokenReplacement(SUPPORT_CONSTANTS.AUDIT_TRAIL_RULE_6_PARTY_REMOVED, [
					rule6Party.serviceUser.organisationName || ''
				])
			});
		}

		return result;
	} catch (error) {
		logger.error(error, 'Failed to delete rule 6 party');
		throw new Error(ERROR_FAILED_TO_SAVE_DATA);
	}
};

export { addRule6Party, deleteRule6Party, updateRule6Party };
