/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

import { formatAddressSingleLine } from '#endpoints/addresses/addresses.formatter.js';
import { appealDetailService } from '#endpoints/appeal-details/appeal-details.service.js';
import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import {
	getTeamEmailFromAppealId,
	setAssignedTeamId
} from '#endpoints/case-team/case-team.service.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { notifySend } from '#notify/notify-send.js';
import appealRepository from '#repositories/appeal.repository.js';
import { getAppealFromHorizon } from '#utils/horizon-gateway.js';
import { isChildAppeal, isLinkedAppeal, isParentAppeal } from '#utils/is-linked-appeal.js';
import { getChildAppeals, getLeadAppeal } from '#utils/link-appeals.js';
import { formatHorizonGetCaseData } from '#utils/mapping/map-horizon.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import { updatePersonalList } from '#utils/update-personal-list.js';
import { logger } from '@azure/identity';
import {
	AUDIT_TRAIL_APPEAL_LINK_ADDED,
	AUDIT_TRAIL_APPEAL_LINK_UNLINKED,
	AUDIT_TRAIL_APPEAL_LINK_UNLINKED_ALL,
	AUDIT_TRAIL_APPEAL_LINK_UPDATED_AS_LEAD,
	AUDIT_TRAIL_APPEAL_RELATION_ADDED,
	AUDIT_TRAIL_APPEAL_RELATION_REMOVED,
	CASE_RELATIONSHIP_LINKED,
	CASE_RELATIONSHIP_RELATED,
	ERROR_LINKING_APPEALS,
	ERROR_UNLINKING_APPEALS,
	LINK_APPEALS_CHANGE_LEAD_OPERATION,
	LINK_APPEALS_UNLINK_OPERATION
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STAGE, APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import {
	canLinkAppeals,
	checkAppealsStatusBeforeLPAQ,
	duplicateAllFiles,
	duplicateFiles,
	replaceLeadAppeal,
	unlinkChildAppeal
} from './link-appeals.service.js';

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
	const linkedAppeal = await appealRepository.getAppealById(
		Number(linkedAppealId),
		true,
		[
			'childAppeals',
			'parentAppeals',
			'caseOfficer',
			'inspector',
			'appellantCase',
			'appealStatus',
			'address',
			'inspector',
			'appellant',
			'agent',
			'lpa'
		],
		true
	);

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

	const childAppeal = isCurrentAppealParent ? linkedAppeal : currentAppeal;
	const parentAppeal = isCurrentAppealParent ? currentAppeal : linkedAppeal;

	const relationship = {
		parentId: parentAppeal.id,
		parentRef: parentAppeal.reference,
		childId: childAppeal.id,
		childRef: childAppeal.reference,
		type: CASE_RELATIONSHIP_LINKED,
		externalSource: false
	};

	const result = await appealRepository.linkAppeal(relationship);

	if (result) {
		await duplicateFiles(childAppeal, parentAppeal, APPEAL_CASE_STAGE.COSTS);
		const azureAdUserId = req.get('azureAdUserId') || '';
		await setAssignedTeamId(childAppeal.id, parentAppeal.assignedTeamId || null, azureAdUserId);
		const caseOfficer = parentAppeal.caseOfficer?.azureAdUserId || null;
		const inspector = parentAppeal.inspector?.azureAdUserId || null;
		const caseOfficerName = '';
		const inspectorName = '';
		const prevUserName = '';
		await appealDetailService.assignUser(
			childAppeal,
			{ caseOfficer },
			{ caseOfficerName, inspectorName, prevUserName },
			azureAdUserId,
			notifyClient
		);

		await appealDetailService.assignUser(
			childAppeal,
			{ inspector },
			{ caseOfficerName, inspectorName, prevUserName },
			azureAdUserId,
			notifyClient
		);
	}

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
		linked_before_lpa_questionnaire: linkedBeforeLPAQ,
		team_email_address: await getTeamEmailFromAppealId(currentAppeal.id)
	};

	const appellantEmail = currentAppeal.agent?.email || currentAppeal.appellant?.email;
	const lpaEmail = currentAppeal.lpa?.email || '';

	await Promise.all([
		await updatePersonalList(parentAppeal.id),

		await updatePersonalList(childAppeal.id),

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
	const appealToRelate = await appealRepository.getAppealById(
		Number(linkedAppealId),
		true,
		[],
		true
	);

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
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_ADDED, [appealToRelate.reference])
		});

		await createAuditTrail({
			appealId: appealToRelate.id,
			azureAdUserId: req.get('azureAdUserId'),
			details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_ADDED, [currentAppeal.reference])
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
		details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_ADDED, [linkedAppealReference])
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

	const otherRef =
		linkDetails.parentRef === currentAppeal.reference
			? linkDetails.childRef
			: linkDetails.parentRef;

	await createAuditTrail({
		appealId: currentAppeal.id,
		azureAdUserId: req.get('azureAdUserId'),
		details:
			linkDetails.type === CASE_RELATIONSHIP_LINKED
				? stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UNLINKED, [otherRef])
				: stringTokenReplacement(AUDIT_TRAIL_APPEAL_RELATION_REMOVED, [otherRef])
	});

	await broadcasters.broadcastAppeal(currentAppeal.id);
	return res.status(200).send(true);
};

/**
 *
 * @param {string} azureAdUserId
 * @param {number} appealId
 * @param {string} unlinkedAppealRef
 * @param {boolean} [allUnlinked]
 * @returns {Promise<void>}
 */
const auditUnlinkingAppeal = async (
	azureAdUserId,
	appealId,
	unlinkedAppealRef = '',
	allUnlinked = false
) => {
	const details = stringTokenReplacement(
		allUnlinked ? AUDIT_TRAIL_APPEAL_LINK_UNLINKED_ALL : AUDIT_TRAIL_APPEAL_LINK_UNLINKED,
		[unlinkedAppealRef]
	);

	await createAuditTrail({
		appealId,
		details,
		azureAdUserId
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const updateLinkedAppeals = async (req, res) => {
	const { appeal } = req;
	const { appealRefToReplaceLead, operation } = req.body;
	const azureAdUserId = req.get('azureAdUserId') || '';

	if (!operation) {
		return res.status(400).send('Missing operation field');
	}

	if (!isLinkedAppeal(appeal)) {
		return res.status(400).send('Operation is only valid for linked appeals');
	}

	switch (operation) {
		case LINK_APPEALS_CHANGE_LEAD_OPERATION: {
			if (!isParentAppeal(appeal)) {
				return res.status(400).send('Switching the lead is only valid for parent appeals');
			}
			if (!appealRefToReplaceLead) {
				return res
					.status(400)
					.send(
						`Appeal to replace lead is required for "${LINK_APPEALS_CHANGE_LEAD_OPERATION}" operation`
					);
			}
			break;
		}
		case LINK_APPEALS_UNLINK_OPERATION: {
			if (appealRefToReplaceLead && !isParentAppeal(appeal)) {
				return res.status(400).send('Unlinking a child appeal does not require replacing the lead');
			}
			break;
		}
		default: {
			return res.status(400).send('Invalid operation');
		}
	}

	try {
		const currentLead = getLeadAppeal(appeal);

		const childAppeals = getChildAppeals(appeal);

		const appealToReplaceLead =
			appealRefToReplaceLead &&
			childAppeals.find((childAppeal) => {
				return childAppeal.reference === appealRefToReplaceLead;
			});

		if (appealRefToReplaceLead && !appealToReplaceLead) {
			return res.status(400).send('Appeal to replace lead is not a child of the lead');
		}

		const omitFolders = [
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING}`,
			`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING}`
		];

		const options = { omitFolders };

		let appealToUnlink;
		let appealsToBroadcast;

		switch (operation) {
			case LINK_APPEALS_CHANGE_LEAD_OPERATION: {
				await Promise.allSettled([
					// @ts-ignore
					duplicateAllFiles(currentLead, appealToReplaceLead, options),
					// @ts-ignore
					replaceLeadAppeal(currentLead, appealToReplaceLead)
				]);
				break;
			}
			case LINK_APPEALS_UNLINK_OPERATION: {
				appealToUnlink =
					// Just unlink the child if it's a parent of only one child
					isParentAppeal(appeal) && childAppeals.length === 1
						? // Give child appeal parent relationship to allow isChildAppeal check to work below
							{ ...childAppeals[0], parentAppeals: [{ type: CASE_RELATIONSHIP_LINKED }] }
						: appeal;

				if (isChildAppeal(appealToUnlink)) {
					// @ts-ignore
					await duplicateAllFiles(currentLead, appealToUnlink, options);

					// only need to broadcast to the child and lead involved in the unlink action
					appealsToBroadcast = [currentLead?.id, appealToUnlink?.id];
				} else {
					if (!appealToReplaceLead) {
						return res
							.status(400)
							.send('Appeal to replace lead is required for unlinking a parent appeal');
					}
					await Promise.allSettled([
						// @ts-ignore
						duplicateAllFiles(appealToUnlink, appealToReplaceLead, options),
						// @ts-ignore
						replaceLeadAppeal(appealToUnlink, appealToReplaceLead)
					]);
				}
				await Promise.allSettled([
					// @ts-ignore
					unlinkChildAppeal(appealToUnlink),
					// @ts-ignore
					updatePersonalList(appealToUnlink.id)
				]);

				if (currentLead?.id && appealToUnlink?.id) {
					const allUnlinked = childAppeals.length === 1;

					await auditUnlinkingAppeal(
						azureAdUserId,
						appealToUnlink.id,
						currentLead.reference,
						allUnlinked
					);
					await auditUnlinkingAppeal(
						azureAdUserId,
						currentLead.id,
						appealToUnlink.reference,
						allUnlinked
					);
				}

				break;
			}
		}

		// Refresh the personal list for the lead
		await updatePersonalList(appealToReplaceLead?.id || currentLead?.id);

		if (currentLead?.id && appealToReplaceLead?.reference) {
			await createAuditTrail({
				appealId: currentLead.id,
				details: stringTokenReplacement(AUDIT_TRAIL_APPEAL_LINK_UPDATED_AS_LEAD, [
					appealToReplaceLead.reference
				]),
				azureAdUserId
			});

			// need to broadcast all the appeals in the originally linked group
			appealsToBroadcast = [currentLead.id, ...childAppeals.map((appeal) => appeal.id)];
		}
		if (appealsToBroadcast) {
			await Promise.allSettled(
				appealsToBroadcast
					.filter((id) => id !== undefined)
					.map((appealId) => broadcasters.broadcastAppeal(appealId))
			);
		}
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: { body: ERROR_UNLINKING_APPEALS } });
	}

	return res.status(200).send(true);
};
