import featureFlags from '#common/feature-flags.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 * @param {import('../appeal-details.types.js').WebAppeal} appealData
 * @param {string} backLinkUrl
 * @param {string|undefined} errorMessage
 * @param {Record<string, string>} [values]
 * @returns {PageContent}
 */
export function mapCancelAppealPage(appealData, backLinkUrl, errorMessage, values) {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const showEnforcementOptions =
		appealData.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE &&
		featureFlags.isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_CANCEL);

	/** @type {PageContent} */
	const pageContent = {
		title: `Why are you cancelling the appeal?`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - cancel appeal`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'cancelReasonRadio',
					idPrefix: 'cancel-reason-radio',
					fieldset: {
						legend: {
							text: 'Why are you cancelling the appeal?',
							isPageHeading: true,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					value: values?.cancelReasonRadio,
					items: [
						{
							value: 'invalid',
							text: 'Appeal invalid'
						},
						...(showEnforcementOptions
							? [
									{
										value: 'enforcement-notice-withdrawn',
										text: 'LPA has withdrawn the enforcement notice'
									},
									{
										value: 'did-not-pay',
										text: 'Did not pay the ground (a) fee'
									}
								]
							: []),
						{
							value: 'withdrawal',
							text: 'Request to withdraw appeal'
						}
					],
					errorMessage: errorMessage && { text: errorMessage }
				}
			}
		]
	};

	return pageContent;
}
