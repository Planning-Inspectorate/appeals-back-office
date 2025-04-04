import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeal-details.types.js').Lpa} LPA
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {LPA[]} lpaList
 * @param {LPA} currentLpa
 * @returns {PageContent}
 */
export function changeLpaPage(appealDetails, lpaList, currentLpa) {
	/** @type {PageComponent} */
	const selectLpaRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'localPlanningAuthority',
			idPrefix: 'localPlanningAuthority',
			fieldset: {
				legend: {
					text: 'Local planning authority',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: mapLpasToSelectItemParameters(lpaList, currentLpa)
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Local planning authority - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`, // will need to be dynamic
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectLpaRadiosComponent]
	};

	return pageContent;
}

/**
 *
 * @param { LPA[] } lpaList
 * @param { LPA } currentLpa
 * @returns { {value: string, text: string, checked: boolean}[] }
 */
export function mapLpasToSelectItemParameters(lpaList, currentLpa) {
	return lpaList
		.filter((lpa) => !['Q1111', 'Q9999'].includes(lpa.lpaCode))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((lpa) => ({
			value: lpa.id.toString(),
			text: lpa.name,
			//todo a2-2605 confirm if existing LPA should be checked by default
			checked: lpa.lpaCode == currentLpa.lpaCode
		}));
}
