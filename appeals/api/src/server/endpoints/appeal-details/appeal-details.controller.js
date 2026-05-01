import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { updateServiceUser } from '#endpoints/service-user/service-user.service.js';
import { contextEnum } from '#mappers/context-enum.js';
import { isParentAppeal } from '#utils/is-linked-appeal.js';
import { getChildAppeals } from '#utils/link-appeals.js';
import logger from '#utils/logger.js';
import { setPersonalList } from '#utils/update-personal-list.js';
import { ERROR_FAILED_TO_SAVE_DATA } from '@pins/appeals/constants/support.js';
import { SERVICE_USER_TYPE } from '@planning-inspectorate/data-model';
import { appealDetailService } from './appeal-details.service.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeal = async (req, res) => {
	const { appeal } = req;

	const result = await appealDetailService.loadAndFormatAppeal({
		appeal,
		context: /** @type {keyof contextEnum} */ (contextEnum.appealDetails)
	});

	if (!result) {
		return res.status(404).end();
	}
	return res.send(result);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppealById = async (req, res) => {
	const {
		appeal,
		body: {
			caseOfficerId,
			inspectorId,
			caseOfficerName,
			inspectorName,
			prevUserName,
			startedAt,
			validAt,
			planningApplicationReference,
			agent,
			padsInspectorId
		},
		params
	} = req;
	const appealId = Number(params.appealId);
	const azureAdUserId = req.get('azureAdUserId');

	const notifyClient = req.notifyClient;

	// logic:
	// - first update the appeal assignment or other changes
	// - update the personal list
	// - broadcast the change
	// - update any child appeal assignments + broadcast
	// - update any child appeal agents + broadcast
	try {
		const isAssignmentChange = appealDetailService.assignedUserType({
			caseOfficer: caseOfficerId,
			inspector: inspectorId,
			padsInspector: padsInspectorId
		});
		// if its an assignment change - just handle the assignment
		if (isAssignmentChange) {
			await appealDetailService.assignUser(
				appeal,
				{ caseOfficer: caseOfficerId, inspector: inspectorId, padsInspector: padsInspectorId },
				{
					caseOfficerName: caseOfficerName,
					inspectorName: inspectorName,
					prevUserName: prevUserName
				},
				azureAdUserId,
				notifyClient
			);
		} else {
			// otherwise update any other appeal details
			await appealDetailService.updateAppealDetails(
				{
					appealId,
					startedAt,
					validAt,
					planningApplicationReference,
					agent
				},
				azureAdUserId
			);
		}
		await setPersonalList({ appealId });
		// broadcast any changes
		await broadcasters.broadcastAppeal(appeal.id);

		// if an assignment change, also assign to linked/child appeals
		if (isAssignmentChange && isParentAppeal(appeal)) {
			// includes a call to broadcast child appeals
			await appealDetailService.assignUserForLinkedAppeals(
				appeal,
				{ caseOfficer: caseOfficerId, inspector: inspectorId, padsInspector: padsInspectorId },
				{
					caseOfficerName: caseOfficerName,
					inspectorName: inspectorName,
					prevUserName: prevUserName
				},
				azureAdUserId,
				notifyClient
			);
		}

		// if its an agent change, add the agent to all child appeals
		if (agent && isParentAppeal(appeal)) {
			const childAppeals = getChildAppeals(appeal);
			await Promise.allSettled(
				childAppeals.map(async (childAppeal) => {
					if (childAppeal?.id) {
						if (childAppeal?.agent) {
							await updateServiceUser(
								azureAdUserId,
								childAppeal.agent.id,
								SERVICE_USER_TYPE.AGENT,
								childAppeal,
								agent
							);
						} else {
							await appealDetailService.updateAppealDetails(
								{
									appealId: childAppeal.id,
									startedAt,
									validAt,
									planningApplicationReference,
									agent
								},
								azureAdUserId
							);

							return broadcasters.broadcastAppeal(childAppeal.id);
						}
					}
				})
			);
		}
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	const response = {
		...(caseOfficerId !== undefined && { caseOfficerId }),
		...(inspectorId !== undefined && { inspectorId }),
		...(padsInspectorId !== undefined && { padsInspectorId }),
		...(startedAt !== undefined && { startedAt }),
		...(validAt !== undefined && { validAt }),
		...(planningApplicationReference !== undefined && { planningApplicationReference })
	};

	return res.send(response);
};

export const controller = {
	getAppeal,
	updateAppealById
};
