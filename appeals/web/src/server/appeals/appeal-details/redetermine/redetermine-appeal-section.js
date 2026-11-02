import { wrapComponents } from '#lib/mappers/index.js';
import {
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1,
	APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @returns {PageComponent[]|undefined}
 */
export const getRedetermineAppealSection = (appealDetails, currentRoute) => {
	if (appealDetails.appealStatus === APPEAL_CASE_STATUS_REDETERMINATION_STAGE_1) {
		/** @type {PageComponent} */
		const heading = {
			type: 'html',
			parameters: { html: '<h3 class="govuk-heading-m">Redetermination stage 1</h3>' }
		};

		/** @type {PageComponent} */
		const component = {
			type: 'html',
			parameters: {
				html: `<div><a id="progressRedetermination" role="button" draggable="false" class="govuk-button" data-module="govuk-button" href="${currentRoute}/redetermine/progress">Progress to stage 2</a></div>`
			}
		};

		return [
			wrapComponents([heading, component], {
				opening: '<div id="case-details-redetermine-section">',
				closing: '</div>'
			})
		];
	}

	if (appealDetails.appealStatus === APPEAL_CASE_STATUS_REDETERMINATION_STAGE_2) {
		/** @type {PageComponent} */
		const heading = {
			type: 'html',
			parameters: { html: '<h3 class="govuk-heading-m">Redetermination stage 2</h3>' }
		};

		/** @type {PageComponent} */
		const component = {
			type: 'html',
			parameters: {
				html: `<div><a id="progressRedetermination" role="button" draggable="false" class="govuk-button" data-module="govuk-button" href="${currentRoute}/redetermine/progress">Progress to event</a></div>`
			}
		};

		return [
			wrapComponents([heading, component], {
				opening: '<div id="case-details-redetermine-section">',
				closing: '</div>'
			})
		];
	}

	if (appealDetails.appealStatus !== APPEAL_CASE_STATUS.COMPLETE) {
		return;
	}

	/** @type {PageComponent} */
	const redetermineAppealHeading = {
		type: 'html',
		parameters: { html: '<h3 class="govuk-heading-m">Redetermine appeal</h3>' }
	};

	/** @type {PageComponent} */
	const redetermineAppealComponent = {
		type: 'html',
		parameters: {
			html: `<div><p><a id="redetermineCase" class="govuk-body govuk-link" href="${currentRoute}/redetermine">Reopen appeal for redetermination</a></p></div>`
		}
	};

	return [
		wrapComponents([redetermineAppealHeading, redetermineAppealComponent], {
			opening: '<div id="case-details-redetermine-section">',
			closing: '</div>'
		})
	];
};
