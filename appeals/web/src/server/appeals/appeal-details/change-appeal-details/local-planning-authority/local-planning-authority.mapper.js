import config from '#environment/config.js';
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeal-details.types.js').Lpa} LPA
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {number|null|undefined} lpaId
 * @param {LPA[]} lpaList
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors|null|undefined} errors
 * @returns {PageContent}
 */
export function changeLpaPage(appealDetails, lpaId, lpaList, backLinkUrl, errors) {
	/** @type {PageComponent} */
	const selectLpaRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'localPlanningAuthority',
			value: lpaId,
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
 * @param {Appeal} appealDetails
 * @param {number|null|undefined} lpaId
 * @param {LPA[]} lpaList
 * @param {string} backLinkUrl
 * @param {import('@pins/express').ValidationErrors|null|undefined} errors
 * @returns {PageContent}
 */
export function changeLpaListPage(appealDetails, lpaId, lpaList, backLinkUrl, errors) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	const lpaArray = mapLpasToSelectItemParameters(lpaList);

	/** @type {PageComponent} */
	const selectSearchPageComponent = {
		type: 'select',
		parameters: {
			name: 'localPlanningAuthority',
			id: 'lpas',
			label: {
				classes: 'govuk-fieldset__legend--l',
				text: `Local planning authority`,
				isPageHeading: true
			},
			value: lpaId?.toString(),
			items: lpaArray,
			attributes: { 'data-cy': 'search-lpas' },
			classes: 'accessible-autocomplete',
			errorMessage: errors ? { text: errors.localPlanningAuthority.msg } : null
		}
	};

	/** @type {PageContent} */
	const pageContent = {
		title: `Local planning authority - ${shortAppealReference}`,
		backLinkText: 'Back',
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectSearchPageComponent]
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
/**
 * @param {Appeal} currentAppeal
 * @param {LPA} lpa
 * @param {string} backlinkUrl
 * @param { {appellant: string, lpa: string} }emailPreviews
 * @returns {Promise<PageContent>}
 */
export async function checkAndConfirmPage(currentAppeal, lpa, backlinkUrl, emailPreviews) {
	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Local planning authority'
					},
					value: {
						html: lpa?.name
					}
				}
			]
		}
	};
	/** @type {[PageComponent]} */
	const pageComponentList = [summaryListComponent];

	emailPreviews
		? pageComponentList.push(
				/** @type {PageComponent} */
				{
					type: 'details',
					wrapperHtml: {
						opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
						closing: '</div></div>'
					},
					parameters: {
						summaryText: `Preview email to appellant`,
						html: emailPreviews.appellant
					}
				},
				{
					type: 'details',
					wrapperHtml: {
						opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
						closing: '</div></div>'
					},
					parameters: {
						summaryText: `Preview email to lpa`,
						html: emailPreviews.lpa
					}
				}
			)
		: null;

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: backlinkUrl,
		preHeading: `Appeal ${appealShortReference(currentAppeal.appealReference)}`,
		heading: `Check details and update local planning authority`,
		submitButtonText: 'Update local planning authority',
		pageComponents: pageComponentList
	};

	return pageContent;
}
