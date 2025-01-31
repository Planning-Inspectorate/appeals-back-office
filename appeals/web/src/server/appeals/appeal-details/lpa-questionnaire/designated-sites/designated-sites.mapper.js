/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { checkboxesInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]} designatedSiteNames
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]|null|undefined} existingValue
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeInNearOrLikelyToAffectDesignatedSites = (appealData, designatedSiteNames, existingValue, backLinkUrl) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	console.log('changeInNearOrLikelyToAffectDesignatedSites - existingValue: ', existingValue);

	const mappedDesignatedSiteOptions = designatedSiteNames.map(designatedSiteName => ({
		text: designatedSiteName.name,
		value: designatedSiteName.key,
		checked: existingValue?.some(item => item.key === designatedSiteName.key)
	}));

	/** @type {PageContent} */
	const pageContent = {
		title: 'Change whether the site is in, partly in, or likely to affect a sensitive area',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			checkboxesInput({
				name: 'inNearOrLikelyToAffectDesignatedSitesCheckboxes',
				items: [
					...mappedDesignatedSiteOptions,
					{
						text: 'Other',
						value: 'other',
						checked: existingValue?.some(item => item.key === 'other'),
						conditional: {
							html: `<label for="other-designation" class="govuk-label">Other designation(s)</label><input class="govuk-input" id="other-designation" name="otherDesignation" type="text" value="${existingValue?.find(item => item.key === 'other')?.name || ''}">`
						}
					},
					{
						divider: 'or'
					},
					{
						text: 'No, it is not in, near or likely to affect any designated sites',
						value: 'none',
						behaviour: 'exclusive',
						checked: existingValue?.some(item => item.key === 'none')
					}
				],
				legendText: 'Change whether the site is in, partly in, or likely to affect a sensitive area',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
