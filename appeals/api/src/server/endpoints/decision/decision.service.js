import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getTeamEmailFromAppealId } from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { duplicateFiles } from '#endpoints/link-appeals/link-appeals.service.js';
import { getRepresentations } from '#endpoints/representations/representations.service.js';
import { notifySend } from '#notify/notify-send.js';
import appealRepository from '#repositories/appeal.repository.js';
import transitionState from '#state/transition-state.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import {
	AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED,
	AUDIT_TRAIL_CORRECTION_NOTICE_ADDED,
	AUDIT_TRAIL_DECISION_ISSUED,
	AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED,
	CASE_RELATIONSHIP_LINKED,
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';
import formatDate from '@pins/appeals/utils/date-formatter.js';
import { loadEnvironment } from '@pins/platform';
import {
	APPEAL_CASE_DECISION_OUTCOME,
	APPEAL_CASE_STAGE,
	APPEAL_CASE_STATUS
} from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.InspectorDecision} Decision */
/** @typedef {import('@pins/appeals.api').Schema.Document} Document */

const environment = loadEnvironment(process.env.NODE_ENV);

/**
 *
 * @param {Appeal} appeal
 * @param {string} outcome
 * @param {Date} documentDate
 * @param {string} documentGuid
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @returns
 */
export const publishDecision = async (
	appeal,
	outcome,
	documentDate,
	documentGuid,
	notifyClient,
	siteAddress,
	azureAdUserId
) => {
	const result = await appealRepository.setAppealDecision(appeal.id, {
		documentDate,
		documentGuid,
		version: 1,
		outcome: outcome === 'split decision' ? APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION : outcome
	});

	if (result) {
		const personalisation = {
			appeal_reference_number: appeal.reference,
			lpa_reference: appeal.applicationReference || '',
			site_address: siteAddress,
			front_office_url: environment.FRONT_OFFICE_URL || '',
			decision_date: formatDate(new Date(documentDate || ''), false),
			child_appeals:
				appeal.childAppeals
					?.filter((childAppeal) => childAppeal.type === CASE_RELATIONSHIP_LINKED)
					.map((childAppeal) => childAppeal.childRef) || []
		};
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		const lpaEmail = appeal.lpa?.email || '';

		if (recipientEmail) {
			await notifySend({
				azureAdUserId,
				templateName: 'decision-is-allowed-split-dismissed-appellant',
				notifyClient,
				recipientEmail,
				personalisation
			});
		}

		if (lpaEmail) {
			await notifySend({
				azureAdUserId,
				templateName: 'decision-is-allowed-split-dismissed-lpa',
				notifyClient,
				recipientEmail: lpaEmail,
				personalisation
			});
		}

		await createAuditTrail({
			appealId: appeal.id,
			azureAdUserId: azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [
				outcome[0].toUpperCase() + outcome.slice(1)
			])
		});

		await transitionState(appeal.id, azureAdUserId, APPEAL_CASE_STATUS.COMPLETE);
		await broadcasters.broadcastAppeal(appeal.id);

		return result;
	}

	return null;
};

/**
 *
 * @param {Appeal} childAppeal
 * @param {string} outcome
 * @param {Date} documentDate
 * @param {string} azureAdUserId
 * @param {Appeal} leadAppeal
 * @returns
 */
export const publishChildDecision = async (
	childAppeal,
	outcome,
	documentDate,
	azureAdUserId,
	leadAppeal
) => {
	const { id: appealId } = childAppeal;

	const result = await appealRepository.setAppealDecision(appealId, {
		documentDate,
		version: 1,
		outcome: outcome === 'split decision' ? APPEAL_CASE_DECISION_OUTCOME.SPLIT_DECISION : outcome
	});

	if (result) {
		await duplicateFiles(leadAppeal, childAppeal, APPEAL_CASE_STAGE.APPEAL_DECISION);

		await createAuditTrail({
			appealId,
			azureAdUserId: azureAdUserId,
			details: stringTokenReplacement(AUDIT_TRAIL_DECISION_ISSUED, [
				outcome[0].toUpperCase() + outcome.slice(1)
			])
		});

		await transitionState(appealId, azureAdUserId, APPEAL_CASE_STATUS.COMPLETE);
		await broadcasters.broadcastAppeal(appealId);

		return result;
	}

	return null;
};

/**
 * @param {Appeal} appeal
 * @param {import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @param {string} siteAddress
 * @param {string} azureAdUserId
 * @param {string} decisionType
 * @param {boolean}skipNotifies
 * @returns
 */
export const publishCostsDecision = async (
	appeal,
	notifyClient,
	siteAddress,
	azureAdUserId,
	decisionType,
	skipNotifies
) => {
	const costDecisionDetails = getCostDecisionDetails(decisionType);
	if (!costDecisionDetails) {
		throw new Error('Unable to parse decision type for cost decision details.');
	}
	const { recipientEmailTemplate, lpaEmailTemplate, auditTrailDetails } = costDecisionDetails;

	await updatePersonalList(appeal.id);

	if (!skipNotifies) {
		const personalisation = {
			appeal_reference_number: appeal.reference,
			site_address: siteAddress,
			lpa_reference: appeal.applicationReference || '',
			front_office_url: environment.FRONT_OFFICE_URL || ''
		};
		const recipientEmail = appeal.agent?.email || appeal.appellant?.email;
		const lpaEmail = appeal.lpa?.email || '';

		if (recipientEmail) {
			await notifySend({
				azureAdUserId,
				templateName: recipientEmailTemplate,
				notifyClient,
				recipientEmail,
				personalisation
			});
		}

		if (lpaEmail) {
			await notifySend({
				azureAdUserId,
				templateName: lpaEmailTemplate,
				notifyClient,
				recipientEmail: lpaEmail,
				personalisation
			});
		}
	}

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId,
		details: auditTrailDetails
	});
};

/**
 *
 * @param {string} decisionType
 * @returns
 */
const getCostDecisionDetails = (decisionType) => {
	switch (decisionType) {
		case DECISION_TYPE_APPELLANT_COSTS: {
			return {
				recipientEmailTemplate: 'appellant-costs-decision-appellant',
				lpaEmailTemplate: 'appellant-costs-decision-lpa',
				auditTrailDetails: AUDIT_TRAIL_APPELLANT_COSTS_DECISION_ISSUED
			};
		}
		case DECISION_TYPE_LPA_COSTS: {
			return {
				recipientEmailTemplate: 'lpa-costs-decision-appellant',
				lpaEmailTemplate: 'lpa-costs-decision-lpa',
				auditTrailDetails: AUDIT_TRAIL_LPA_COSTS_DECISION_ISSUED
			};
		}
	}
};

/**
 *
 * @param {Appeal} appeal
 * @param {string} correctionNotice
 * @param {string} azureAdUserId
 * @param {Date} decisionDate
 * @param { import('#endpoints/appeals.js').NotifyClient } notifyClient
 * @returns
 */
export const sendNewDecisionLetter = async (
	appeal,
	correctionNotice,
	azureAdUserId,
	notifyClient,
	decisionDate
) => {
	const representations = await getRepresentations(appeal.id, 1, 1000, {
		representationType: ['comment']
	});

	const relevantEmails = [
		appeal.agent?.email,
		appeal.appellant?.email,
		appeal.lpa?.email,
		...representations.comments.map((comment) => comment.represented?.email).filter(Boolean)
	];

	const uniqueEmails = [...new Set(relevantEmails)].filter(Boolean);

	const personalisation = {
		appeal_reference_number: appeal.reference,
		lpa_reference: appeal.applicationReference || '',
		site_address: appeal.address
			? formatAddressSingleLine(appeal.address)
			: 'Address not available',
		correction_notice_reason: correctionNotice,
		decision_date: formatDate(decisionDate, false),
		front_office_url: environment.FRONT_OFFICE_URL || '',
		team_email_address: await getTeamEmailFromAppealId(appeal.id)
	};

	await Promise.all(
		uniqueEmails.map(async (email) => {
			await notifySend({
				azureAdUserId,
				templateName: 'correction-notice-decision',
				notifyClient,
				recipientEmail: email,
				personalisation
			});
		})
	);

	await createAuditTrail({
		appealId: appeal.id,
		azureAdUserId,
		details: stringTokenReplacement(AUDIT_TRAIL_CORRECTION_NOTICE_ADDED, [correctionNotice])
	});

	await broadcasters.broadcastAppeal(appeal.id);
};
