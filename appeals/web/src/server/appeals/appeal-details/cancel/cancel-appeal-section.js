import { wrapComponents } from '#lib/mappers/index.js';
import isLinkedAppeal from '#lib/mappers/utils/is-linked-appeal.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @returns {PageComponent[]|undefined}
 */
export const getCancelAppealSection = (appealDetails, currentRoute) => {
	if (
		appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN ||
		appealDetails.appealStatus === APPEAL_CASE_STATUS.INVALID ||
		appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE ||
		isLinkedAppeal(appealDetails)
	) {
		return;
	}

	/** @type {PageComponent} */
	const cancelAppealHeading = {
		type: 'html',
		parameters: { html: '<h3 class="govuk-heading-m">Cancel appeal</h3>' }
	};

	/** @type {PageComponent} */
	const cancelAppealComponent = {
		type: 'html',
		parameters: {
			html: `<div><p><a id="cancelCase" class="govuk-body govuk-link" href="${currentRoute}/cancel">Cancel appeal</a></p></div>`
		}
	};

	return [
		wrapComponents([cancelAppealHeading, cancelAppealComponent], {
			opening: '<div id="case-details-cancel-section">',
			closing: '</div>'
		})
	];
};
