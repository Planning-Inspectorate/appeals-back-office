/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{ siteGridReferenceEasting?: string; siteGridReferenceNorthing?: string } | undefined} sessionData
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export const changeSiteGridReferencePage = (appealData, appellantCaseData, sessionData, errors) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Enter the grid reference`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Enter the grid reference`,
		prePageComponents: [
			{
				type: 'html',
				parameters: {
					html: `
					<p class="govuk-body">
						The grid reference should match what is on the application to the local planning authority.
						You can <a href="/appeals-service/appeal-details/${appealData.appealId}/appellant-case/site-address/change/${appealData.appealSite.addressId}" class="govuk-link">
						enter an address</a> instead.
					</p>
				`
				}
			}
		],
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'site-grid-reference-easting',
					name: 'siteGridReferenceEasting',
					label: {
						text: 'Easting'
					},
					hint: { text: 'For example, 359608' },
					classes: 'govuk-input--width-10',
					value:
						sessionData?.siteGridReferenceEasting ??
						appellantCaseData.siteGridReferenceEasting ??
						'',
					errorMessage: errors?.siteGridReferenceEasting
						? { text: errors.siteGridReferenceEasting.msg }
						: undefined
				}
			},
			{
				type: 'input',
				parameters: {
					id: 'site-grid-reference-northing',
					name: 'siteGridReferenceNorthing',
					label: {
						text: 'Northing'
					},
					hint: { text: 'For example, 172607' },
					classes: 'govuk-input--width-10',
					value:
						sessionData?.siteGridReferenceNorthing ??
						appellantCaseData.siteGridReferenceNorthing ??
						'',
					errorMessage: errors?.siteGridReferenceNorthing
						? { text: errors.siteGridReferenceNorthing.msg }
						: undefined
				}
			}
		]
	};

	return pageContent;
};
