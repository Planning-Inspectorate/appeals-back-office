/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray } from '#lib/array-utilities.js';
import { checkboxesInput } from '#lib/mappers/index.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]} designatedSiteNames
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]|null|undefined} existingValue
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export const changeInNearOrLikelyToAffectDesignatedSites = (
	appealData,
	designatedSiteNames,
	existingValue,
	backLinkUrl
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	const mappedDesignatedSiteOptions = designatedSiteNames.map((designatedSiteName) => ({
		text: designatedSiteName.name,
		value: designatedSiteName.key,
		checked: existingValue?.some((item) => item.key === designatedSiteName.key)
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
						checked: existingValue?.some((item) => item.key === 'custom'),
						conditional: {
							html: `<label for="custom-designation" class="govuk-label">Other designation(s)</label><input class="govuk-input" id="custom-designation" name="customDesignation" type="text" value="${
								existingValue?.find((item) => item.key === 'custom')?.name || ''
							}">`
						}
					},
					{
						divider: 'or'
					},
					{
						text: 'No, it is not in, near or likely to affect any designated sites',
						value: 'none',
						behaviour: 'exclusive',
						checked: existingValue?.length === 0
					}
				],
				legendText:
					'Change whether the site is in, partly in, or likely to affect a sensitive area',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};

/**
 * @typedef {Object} InNearOrLikelyToAffectDesignatedSitesSessionData
 * @property {string[]} designations
 * @property {string} [customDesignation]
 * */

/**
 * @param {any} formData
 * @returns {InNearOrLikelyToAffectDesignatedSitesSessionData}
 */
export function mapChangePageFormDataToSessionData(formData) {
	const designations =
		'inNearOrLikelyToAffectDesignatedSitesCheckboxes' in formData
			? ensureArray(formData.inNearOrLikelyToAffectDesignatedSitesCheckboxes)
			: [];
	const customDesignation =
		'inNearOrLikelyToAffectDesignatedSitesCheckboxes' in formData && 'customDesignation' in formData
			? formData.customDesignation
			: undefined;

	return {
		designations,
		...(customDesignation && { customDesignation })
	};
}

/**
 * @param {InNearOrLikelyToAffectDesignatedSitesSessionData} sessionData
 * @param {import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName[]} designatedSiteNames
 * @returns {(import('@pins/appeals.api/src/server/openapi-types.js').DesignatedSiteName|undefined)[]}
 */
export function mapChangePageSessionDataToPatchEndpointPayload(sessionData, designatedSiteNames) {
	return sessionData.designations.includes('none')
		? []
		: sessionData.designations.map((/** @type {string} */ designation) => {
				if (designation === 'other') {
					return {
						id: 0,
						key: 'custom',
						name: sessionData?.customDesignation || ''
					};
				}

				return designatedSiteNames.find(
					(designatedSiteName) => designatedSiteName.key === designation
				);
			});
}
