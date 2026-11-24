import { mapStatusFilterLabel, mapStatusText } from '#lib/appeal-status.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} WebAppeal
 * @typedef {import('#app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth
 */

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealStatus = ({ appealDetails }) => {
	const isGeneric = isGenericAppealType(appealDetails?.appealType);
	const formattedStatus =
		appealDetails?.appealStatus && appealDetails?.appealType
			? mapStatusText(
					appealDetails.appealStatus,
					appealDetails.appealType,
					appealDetails.procedureType
				)
			: '';

	return {
		id: 'appeal-status',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal status'
				},
				value: {
					text: isGeneric ? mapStatusFilterLabel(formattedStatus) : appealDetails.appealStatus
				},
				classes: 'appeal-appeal-status',
				...(isGeneric && {
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/change-status`,
								visuallyHiddenText: 'appeal status'
							}
						]
					}
				})
			},
			statusTag: {
				status: formattedStatus,
				classes: 'govuk-!-margin-bottom-4'
			}
		}
	};
};
