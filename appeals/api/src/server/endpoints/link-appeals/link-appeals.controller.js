import appealRepository from '#repositories/appeal.repository.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	AUDIT_TRAIL_APPEAL_LINK_REMOVED,
	AUDIT_TRAIL_APPEAL_RELATION_ADDED,
	AUDIT_TRAIL_APPEAL_RELATION_REMOVED
} from '@pins/appeals/constants/support.js';
import { canLinkAppeals, checkAppealsStatusBeforeLPAQ } from './link-appeals.service.js';
import {
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED,
	ERROR_LINKING_APPEALS
} from '@pins/appeals/constants/support.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { notifySend } from '#notify/notify-send.js';
import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const linkAppeal = async (req, res) => {
	const { appeal: currentAppeal, notifyClient } = req;
	const { linkedAppealId, isCurrentAppealParent } = req.body;
	const linkedAppeal = await appealRepository.getAppealById(Number(linkedAppealId));

	if (!linkedAppeal) {
		return res.status(404).end();
	}

	const canLinkCurrentAppeal = canLinkAppeals(
		currentAppeal,
		CASE_RELATIONSHIP_LINKED,
		isCurrentAppealParent ? 'lead' : 'child'
	);
	const canLinkLinkedAppeal = canLinkAppeals(
		linkedAppeal,
		CASE_RELATIONSHIP_LINKED,
		isCurrentAppealParent ? 'child' : 'lead'
	);

	if (!(canLinkCurrentAppeal && canLinkLinkedAppeal)) {
		return res.status(409).send({
			errors: {
				body: ERROR_LINKING_APPEALS
			}
		});
	}

	const relationship = isCurrentAppealParent
		? {
				parentId: currentAppeal.id,
				parentRef: currentAppeal.reference,
				childId: linkedAppeal.id,
				childRef: linkedAppeal.reference,
				type: CASE_RELATIONSHIP_LINKED,
				externalSource: false
		  }
		: {
				parentId: linkedAppeal.id,
				parentRef: linkedAppeal.reference,
				childId: currentAppeal.id,
				childRef: currentAppeal.reference,
				type: CASE_RELATIONSHIP_LINKED,
				externalSource: false
		  };

	const result = await appealRepository.linkAppeal(relationship);

	const siteAddress = currentAppeal.address
		? formatAddressSingleLine(currentAppeal.address)
		: 'Address not available';

	const linkedBeforeLPAQ = checkAppealsStatusBeforeLPAQ(
		currentAppeal,
		linkedAppeal,
		isCurrentAppealParent
	);

	const personalisation = {
		appeal_reference_number: currentAppeal.reference,
		lead_appeal_reference_number: relationship.parentRef,
		child_appeal_reference_number: relationship.childRef,
		lpa_reference: currentAppeal.applicationReference || '',
		site_address: siteAddress,
		event_type: 'site visit',
		linked_before_lpa_questionnaire: linkedBeforeLPAQ
	};

	const appellantEmail = currentAppeal.agent?.email || currentAppeal.appellant?.email;
	const lpaEmail = currentAppeal.lpa?.email || '';

	await Promise.all([
		notifySend({
			templateName: 'link-appeal',
			notifyClient,
			recipientEmail: appellantEmail,
			personalisation
		}),

		notifySend({
			templateName: 'link-appeal',
			notifyClient,
			recipientEmail: lpaEmail,
			personalisation
		}),

		createAuditTrail({
			appealId: currentAppeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [linkedAppeal.reference])
		}),

		createAuditTrail({
			appealId: linkedAppeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [currentAppeal.reference])
		})
	]);

	await Promise.all(
		[currentAppeal.id, linkedAppeal.id].map((id) => broadcasters.broadcastAppeal(id))
	);
	return res.status(201).send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const linkExternalAppeal = async (req, res) => {
	const { isCurrentAppealParent, linkedAppealReference } = req.body;
	const currentAppeal = req.appeal;
	const currentAppealType = isCurrentAppealParent ? 'lead' : 'child';
	if (!canLinkAppeals(currentAppeal, CASE_RELATIONSHIP_LINKED, currentAppealType)) {
		return res.status(409).send({
			errors: {
				body: ERROR_LINKING_APPEALS
			}
		});
	}

	const linkedAppeal = await getAppealFromHorizon(linkedAppealReference);
	const formattedLinkedAppeal = formatHorizonGetCaseData(linkedAppeal);
	const linkedAppealId = formattedLinkedAppeal.appealId
		? parseInt(formattedLinkedAppeal.appealId)
		: undefined;
	const relationship = isCurrentAppealParent
		? {
				parentId: currentAppeal.id,
				parentRef: currentAppeal.reference,
				childRef: formattedLinkedAppeal.appealReference || linkedAppealReference,
				childId: null,
				type: CASE_RELATIONSHIP_LINKED,
				externalSource: true,
				externalAppealType: formattedLinkedAppeal.appealType,
				externalId: linkedAppealId?.toString()
		  }
		: {
				parentId: null,
				parentRef: formattedLinkedAppeal.appealReference || linkedAppealReference,
				childRef: currentAppeal.reference,
				childId: currentAppeal.id,
				type: CASE_RELATIONSHIP_LINKED,
				externalSource: true,
				externalAppealType: formattedLinkedAppeal.appealType,
				externalId: linkedAppealId?.toString()
		  };

	const result = await appealRepository.linkAppeal(relationship);
	await createAuditTrail({
		appealId: currentAppeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_ADDED, [
			formattedLinkedAppeal.appealReference || linkedAppealReference
		])
	});

	await broadcasters.broadcastAppeal(currentAppeal.id);
	return res.send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const associateAppeal = async (req, res) => {
	const { linkedAppealId } = req.body;
	const currentAppeal = req.appeal;
	const appealToRelate = await appealRepository.getAppealById(Number(linkedAppealId));

	if (appealToRelate) {
		const relationship = {
			parentId: currentAppeal.id,
			parentRef: currentAppeal.reference,
			childId: appealToRelate.id,
			childRef: appealToRelate.reference,
			type: CASE_RELATIONSHIP_RELATED,
			externalSource: false
		};

		const result = await appealRepository.linkAppeal(relationship);
		await createAuditTrail({
			appealId: currentAppeal.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: AUDIT_TRAIL_APPEAL_RELATION_ADDED
		});

		await broadcasters.broadcastAppeal(currentAppeal.id);
		return res.send(result);
	}

	return res.status(404).send({});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const associateExternalAppeal = async (req, res) => {
	const { linkedAppealReference } = req.body;
	const currentAppeal = req.appeal;

	const linkedAppeal = await getAppealFromHorizon(linkedAppealReference);
	const formattedLinkedAppeal = formatHorizonGetCaseData(linkedAppeal);
	const linkedAppealId = formattedLinkedAppeal.appealId
		? parseInt(formattedLinkedAppeal.appealId)
		: undefined;

	const relationship = {
		parentId: currentAppeal.id,
		parentRef: currentAppeal.reference,
		childId: null,
		childRef: linkedAppealReference,
		type: CASE_RELATIONSHIP_RELATED,
		externalSource: true,
		externalAppealType: formattedLinkedAppeal.appealType,
		externalId: linkedAppealId?.toString()
	};
	const result = await appealRepository.linkAppeal(relationship);
	await createAuditTrail({
		appealId: currentAppeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details: AUDIT_TRAIL_APPEAL_RELATION_ADDED
	});

	await broadcasters.broadcastAppeal(currentAppeal.id);
	return res.send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const unlinkAppeal = async (req, res) => {
	const { relationshipId } = req.body;
	const currentAppeal = req.appeal;
	const linkDetails = await appealRepository.unlinkAppeal(relationshipId);
	await createAuditTrail({
		appealId: currentAppeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details:
			linkDetails.type === CASE_RELATIONSHIP_LINKED
				? AUDIT_TRAIL_APPEAL_LINK_REMOVED
				: AUDIT_TRAIL_APPEAL_RELATION_REMOVED
	});

	await broadcasters.broadcastAppeal(currentAppeal.id);
	return res.status(200).send(true);
};
