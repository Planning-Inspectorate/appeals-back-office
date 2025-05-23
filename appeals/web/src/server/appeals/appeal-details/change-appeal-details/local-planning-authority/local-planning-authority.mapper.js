import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeal-details.types.js').Lpa} LPA
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {LPA[]} lpaList
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors|null|undefined} errors
 * @returns {PageContent}
 */
export function changeLpaPage(appealDetails, lpaList, backLinkUrl, errors) {
	/** @type {PageComponent} */
	const selectLpaRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'localPlanningAuthority',
			idPrefix: 'local-planning-authority',
			fieldset: {
				legend: {
					text: 'Local planning authority',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: mapLpasToSelectItemParameters(lpaList),
			errorMessage: errors ? { text: errors.localPlanningAuthority.msg } : null
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Local planning authority - ${shortAppealReference}`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectLpaRadiosComponent]
	};

	return pageContent;
}

/**
 *
 * @param { LPA[] } lpaList
 * @returns { {value: string, text: string}[] }
 */
export function mapLpasToSelectItemParameters(lpaList) {
	return lpaList
		.filter((lpa) =>
			config.useSystemTestBcForChangeLpa ? lpa : !['Q1111', 'Q9999'].includes(lpa.lpaCode)
		)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((lpa) => ({
			value: lpa.id.toString(),
			text: lpa.name
		}));
}
