import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml } from '#lib/enhance-html.js';
import { yesNoInput } from '#lib/mappers/index.js';
import { renderPageComponentsToHtml } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import("@pins/express").ValidationErrors | undefined} ValidationErrors
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption & { selected: boolean, text: string }} ReasonOption
 */

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function decisionInvalidConfirmationPage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'Appeal invalid',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'Appeal invalid',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The appeal has been closed. The relevant parties have been informed.</p>'
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {import('#appeals/appeals.types.js').CheckboxItemParameter[]} mappedInvalidReasonOptions
 * @param {string} appealType
 * @param {string | undefined} errorMessage
 * @param {boolean} sourceIsAppellantCase
 * @returns {PageContent}
 */
export const mapInvalidReasonPage = (
	appealId,
	appealReference,
	mappedInvalidReasonOptions,
	appealType,
	errorMessage = undefined,
	sourceIsAppellantCase
) => {
	const shortAppealReference = appealShortReference(appealReference);
	const backLinkUrl =
		appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE
			? `/appeals-service/appeal-details/${appealId}/appellant-case/invalid/enforcement-notice`
			: `/appeals-service/appeal-details/${appealId}/${
					sourceIsAppellantCase ? 'appellant-case' : 'cancel'
			  }`;

	/** @type {PageContent} */
	const pageContent = {
		title: `Why is the appeal invalid?`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - mark as invalid`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					fieldset: {
						legend: {
							text: 'Why is the appeal invalid?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedInvalidReasonOptions,
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	mappedInvalidReasonOptions
		// @ts-ignore
		.filter((option) => option.addAnother)
		.forEach((option) =>
			enhanceCheckboxOptionWithAddAnotherReasonConditionalHtml(
				option,
				'invalidReason-',
				'invalid-reason-',
				'Enter a reason'
			)
		);
	return pageContent;
};

/**
 * @param {string} appealId
 * @param {string} appealReference
 * @param {string} invalidDate
 * @param {Object[]} invalidReasons
 * @returns {PageContent}
 */
export const viewInvalidAppealPage = (appealId, appealReference, invalidDate, invalidReasons) => {
	const formattedInvalidReasons = getFormattedReasons(invalidReasons);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Why is the appeal invalid?'
					},
					value: {
						html: formattedInvalidReasons
					}
				},
				{
					key: {
						text: 'Invalid date'
					},
					value: {
						text: dateISOStringToDisplayDate(invalidDate)
					}
				}
			]
		}
	};

	const title = `Appeal marked as invalid`;
	const pageContent = {
		title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: title,
		pageComponents: [summaryListComponent]
	};

	return pageContent;
};

/**
 * @param {Object[]} reasonsArray
 * @returns {string} - List of formatted reasons
 */
export const getFormattedReasons = (reasonsArray) => {
	if (!reasonsArray || reasonsArray.length === 0) {
		throw new Error('No reasons found');
	}

	const reasons = reasonsArray.flatMap((item) => {
		// @ts-ignore
		const reasonName = /** @type {string} */ item.name;
		// @ts-ignore
		const reasonText = /** @type {string[]} */ item.text;

		if (reasonText.length > 0) {
			return reasonText.map((/** @type {string} */ textItem) => `${reasonName.name}: ${textItem}`);
		} else {
			return [reasonName.name];
		}
	});

	const listItems = reasons.map((reason) => `<li>${reason}</li>`).join('');

	return `<ul>${listItems}</ul>`;
};

/**
 * @param {Appeal} appealDetails
 * @param {string} [enforcementNoticeInvalid]
 * @returns {PageContent}
 * */
export const enforcementNoticeInvalidPage = (appealDetails, enforcementNoticeInvalid) => ({
	title: 'Is the enforcement notice invalid',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Is the enforcement notice invalid?',
	pageComponents: [
		yesNoInput({
			name: 'enforcementNoticeInvalid',
			id: 'enforcementNoticeInvalid',
			value: enforcementNoticeInvalid
		})
	]
});

/**
 * @param {Appeal} appealDetails
 * @param {ReasonOption[]} reasonOptions
 * @param {ValidationErrors} [errors]
 * @returns {PageContent}
 */
export const enforcementNoticeReasonPage = (appealDetails, reasonOptions, errors) => {
	const mappedInvalidReasonOptions = reasonOptions.map((reason) => {
		const reasonId = `invalid-reason-${reason.id}-1`;
		const reasonName = `invalidReason-${reason.id}`;
		const reasonError = errors?.[`${reasonName}-1`];
		return {
			value: reason.id,
			text: reason.name,
			checked: reason.selected || !!reason.text,
			conditional: reason.hasText
				? {
						html: renderPageComponentsToHtml([
							{
								type: 'input',
								parameters: {
									id: reasonId,
									name: reasonName,
									value: reason.text ?? '',
									...(reasonError && { errorMessage: { text: reasonError.msg } }),
									label: {
										text: 'Enter a reason',
										classes: 'govuk-label--s'
									}
								}
							}
						])
				  }
				: undefined
		};
	});

	/** @type {PageContent} */
	const pageContent = {
		title: 'Why is the enforcement notice invalid',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/invalid/enforcement-notice`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		pageComponents: [
			{
				type: 'checkboxes',
				parameters: {
					name: 'invalidReason',
					idPrefix: 'invalid-reason',
					fieldset: {
						legend: {
							text: 'Why is the enforcement notice invalid?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: mappedInvalidReasonOptions,
					...(errors?.invalidReason && { errorMessage: { text: errors.invalidReason.msg } })
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealDetails
 * @param {string} [otherLiveAppeals]
 * @returns {PageContent}
 * */
export const otherLiveAppealsPage = (appealDetails, otherLiveAppeals) => ({
	title: 'Are there any other live appeals against the enforcement notice',
	backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/appellant-case/invalid`,
	preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
	heading: 'Are there any other live appeals against the enforcement notice?',
	pageComponents: [
		yesNoInput({
			name: 'otherLiveAppeals',
			id: 'otherLiveAppeals',
			value: otherLiveAppeals
		})
	]
});
