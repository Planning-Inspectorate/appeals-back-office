import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { permissionNames } from '#environment/permissions.js';
import config from '#environment/config.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { mapActionComponent } from '#lib/mappers/index.js';
import { isChildAppeal } from '#lib/mappers/utils/is-linked-appeal.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 */

/** @type {import('../mapper.js').SubMapper} */
export const mapLinkedAppeals = ({ appealDetails, session }) => {
	if (!config.featureFlags.featureFlagLinkedAppeals) {
		return { id: '', display: {} };
	}

	const canAdd =
		!isChildAppeal(appealDetails) &&
		[
			APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
			APPEAL_CASE_STATUS.VALIDATION,
			APPEAL_CASE_STATUS.READY_TO_START,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
		].includes(appealDetails.appealStatus);

	const hasItems = appealDetails.linkedAppeals?.every(
		(linkedAppeal) => !linkedAppeal.externalSource && !linkedAppeal.isParentAppeal
	);

	return {
		id: 'linked-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Linked appeals'
				},
				value: {
					html: displayPageFormatter.formatListOfLinkedAppeals(appealDetails.linkedAppeals)
				},
				actions: {
					items: hasItems
						? mapActionComponent(permissionNames.updateCase, session, [
								...(appealDetails.linkedAppeals.length > 0
									? [
											{
												text: 'Manage',
												href: `/appeals-service/appeal-details/${
													appealDetails.appealId
												}/linked-appeals/${
													appealDetails.linkedAppeals.length > 0 ? 'manage' : 'add'
												}`,
												visuallyHiddenText: 'Linked appeals',
												attributes: { 'data-cy': 'manage-linked-appeals' }
											}
									  ]
									: []),
								...(canAdd
									? [
											{
												text: 'Add',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals/add`,
												visuallyHiddenText: 'Linked appeals',
												attributes: { 'data-cy': 'add-linked-appeal' }
											}
									  ]
									: [])
						  ])
						: []
				},
				classes: 'appeal-linked-appeals'
			}
		}
	};
};
