import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressToString } from '#lib/address-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { appealStatusToStatusTag } from '#lib/nunjucks-filters/status-tag.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';

/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */
/** @typedef {import('../../app/auth/auth.service').AccountInfo} AccountInfo */

/**
 * @param {AppealList|void} appeals
 * @param {string} urlWithoutQuery
 * @param {string|undefined} searchTerm
 * @param {string|undefined} searchTermError
 * @param {string|undefined} appealStatusFilter
 * @param {string|undefined} inspectorStatusFilter
 * @param {string|undefined} localPlanningAuthorityFilter
 * @param {string|undefined} caseOfficerFilter
 * @param {string|undefined} inspectorFilter
 * @param {string|undefined} greenBeltFilter
 * @returns {PageContent}
 */

export function nationalListPage(
	appeals,
	urlWithoutQuery,
	searchTerm,
	searchTermError,
	appealStatusFilter,
	inspectorStatusFilter,
	localPlanningAuthorityFilter,
	caseOfficerFilter,
	inspectorFilter,
	greenBeltFilter
) {
	const appealStatusFilterItemsArray = ['all', ...(appeals?.statuses || [])].map(
		(appealStatus) => ({
			text: capitalizeFirstLetter(appealStatusToStatusTag(appealStatus)),
			value: appealStatus,
			selected: appealStatusFilter === appealStatus
		})
	);

	const inspectorStatusFilterItemsArray = ['all', 'assigned', 'unassigned'].map(
		(inspectorStatus) => ({
			text: capitalizeFirstLetter(inspectorStatus),
			value: inspectorStatus,
			selected: inspectorStatusFilter === inspectorStatus
		})
	);

	const localPlanningAuthorityFilterItemsArray = ['all'].map((localPlanningAuthority) => ({
		text: capitalizeFirstLetter(localPlanningAuthority),
		value: localPlanningAuthority,
		selected: localPlanningAuthorityFilter === localPlanningAuthority
	}));

	const caseOfficerFilterItemsArray = ['all'].map((caseOfficer) => ({
		text: capitalizeFirstLetter(caseOfficer),
		value: caseOfficer,
		selected: caseOfficerFilter === caseOfficer
	}));

	const inspectorFilterItemsArray = ['all'].map((inspector) => ({
		text: capitalizeFirstLetter(inspector),
		value: inspector,
		selected: inspectorFilter === inspector
	}));

	let searchResultsHeader = '';

	if (searchTerm && appeals?.itemCount === 0) {
		searchResultsHeader = `No results found for ${searchTerm}`;
	} else if (searchTerm) {
		searchResultsHeader = `${appeals?.itemCount} result${
			appeals?.itemCount !== 1 ? 's' : ''
		} for ${searchTerm}`;
	} else if (!searchTerm && appeals?.itemCount === 0) {
		searchResultsHeader = `No results found`;
	} else if (
		!searchTerm &&
		appeals?.itemCount &&
		appeals?.itemCount > 0 &&
		((appealStatusFilter && appealStatusFilter !== 'all') ||
			(inspectorStatusFilter && inspectorStatusFilter !== 'all'))
	) {
		searchResultsHeader = `${appeals?.itemCount} result${appeals?.itemCount !== 1 ? 's' : ''}`;
	}

	if (
		(appealStatusFilter && appealStatusFilter !== 'all') ||
		(inspectorStatusFilter && inspectorStatusFilter !== 'all')
	) {
		searchResultsHeader += ' (filters applied)';
	}

	const searchInputErrorMessage = {};

	if (searchTermError) {
		searchInputErrorMessage.errorMessage = {
			text: searchTermError
		};
	}

	let clearFilterUrl = urlWithoutQuery;

	if (searchTerm) {
		clearFilterUrl += `?searchTerm=${encodeURIComponent(searchTerm)}`;
	}

	/** @type {PageComponent[]} */
	const searchPageContent = [
		{
			type: 'html',
			parameters: {
				html: `<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds"><form method="GET">`
			}
		},
		{
			type: 'input',
			parameters: {
				id: 'searchTerm',
				name: 'searchTerm',
				label: {
					text: 'Enter appeal reference or postcode (include spaces)',
					classes: 'govuk-caption-m govuk-!-margin-bottom-3 colour--secondary'
				},
				value: searchTerm,
				attributes: { 'data-cy': 'search-term' },
				...searchInputErrorMessage
			}
		},
		{
			type: 'html',
			parameters: {
				html: '<div class="govuk-button-group">'
			}
		},
		{
			type: 'button',
			parameters: {
				id: 'filters-submit',
				type: 'submit',
				classes: 'govuk-button',
				text: 'Search'
			}
		},
		{
			type: 'html',
			parameters: {
				html: `${
					searchTerm
						? `<a class="govuk-link" href="${urlWithoutQuery}" data-cy="clear-search">Clear search</a>`
						: ''
				}</div></form><div class="govuk-section-break--visible govuk-!-margin-top-2 govuk-!-margin-bottom-6"></div></div></div>`
			}
		},
		{
			type: 'html',
			parameters: {
				html: searchResultsHeader
					? `<div class="govuk-grid-row govuk-!-padding-left-3"><h2 class="govuk-heading-m">${searchResultsHeader}</h2></div>`
					: ''
			}
		},
		{
			type: 'details',
			wrapperHtml: {
				opening:
					'<div class="govuk-grid-row govuk-!-padding-left-3"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				summaryText: 'Filters',
				html: '',
				pageComponents: [
					{
						type: 'html',
						parameters: {
							html: `<form method="GET">`
						}
					},
					{
						type: 'html',
						parameters: {
							html: '<h2 class="govuk-heading-m">Filter</h2>'
						}
					},
					{
						type: 'html',
						parameters: {
							html: searchTerm
								? `<input type="hidden" name="searchTerm" value="${searchTerm}" data-cy="search-term" />`
								: ''
						}
					},
					{
						type: 'html',
						parameters: {
							html: '<div class="govuk-button-group">'
						}
					},
					{
						type: 'button',
						parameters: {
							id: 'filters-submit',
							type: 'submit',
							text: 'Apply filters',
							attributes: { 'data-cy': 'filter-submit' }
						}
					},
					{
						type: 'html',
						parameters: {
							html: `<a class="govuk-link" href="${clearFilterUrl}" data-cy="filter-clear">Clear filters</a></div>`
						}
					},
					{
						type: 'select',
						parameters: {
							name: 'appealStatusFilter',
							id: 'appeal-status-filter',
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Case status'
							},
							value: 'all',
							items: appealStatusFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-case-status' }
						}
					},
					{
						type: 'select',
						parameters: {
							name: 'inspectorStatusFilter',
							id: 'inspector-status-filter',
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Inspector status'
							},
							value: 'all',
							items: inspectorStatusFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-inspector-status' }
						}
					},
					{
						type: 'select',
						parameters: {
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Local planning authority'
							},
							name: 'localPlanningAuthorityFilter',
							value: 'all',
							items: localPlanningAuthorityFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-local-planning-authority' }
						}
					},
					{
						type: 'select',
						parameters: {
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Case officer'
							},
							name: 'caseOfficerFilter',
							value: 'all',
							items: caseOfficerFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-case-officer' }
						}
					},
					{
						type: 'select',
						parameters: {
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Inspector'
							},
							name: 'inspectorFilter',
							value: 'all',
							items: inspectorFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-inspector' }
						}
					},
					{
						type: 'checkboxes',
						parameters: {
							name: 'greenBeltFilter',
							classes: 'govuk-checkboxes--small',
							items: [
								{
									text: 'Green belt',
									value: 'yes',
									checked: greenBeltFilter === 'yes'
								}
							],
							value: greenBeltFilter,
							attributes: { 'data-cy': 'filter-by-green-belt' }
						}
					},
					{
						type: 'html',
						parameters: {
							html: `</form>`
						}
					}
				]
			}
		}
	];

	/** @type {PageComponent[]} */
	const appealsDataPageContent = appeals?.itemCount
		? [
				{
					type: 'table',
					wrapperHtml: {
						opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
						closing: '</div></div>'
					},
					parameters: {
						head: [
							{
								text: 'Appeal reference'
							},
							{
								text: 'Site address'
							},
							{
								text: 'Local planning authority (LPA)'
							},
							{
								text: 'Appeal type'
							},
							{
								text: 'Status'
							}
						],
						rows: (appeals?.items || []).map((appeal) => {
							const shortReference = appealShortReference(appeal.appealReference);

							return [
								{
									html: `<a class="govuk-link" href="/appeals-service/appeal-details/${
										appeal.appealId
									}" aria-label="Appeal ${numberToAccessibleDigitLabel(
										shortReference || ''
									)}" data-cy="${shortReference}" >${shortReference}</a>`
								},
								{
									text: addressToString(appeal.appealSite)
								},
								{
									text: appeal.localPlanningDepartment
								},
								{
									text: appeal.appealType
								},
								{
									html: '',
									pageComponents: [
										{
											type: 'status-tag',
											parameters: {
												status: appeal.appealStatus || 'ERROR'
											}
										}
									]
								}
							];
						})
					}
				}
		  ]
		: [];

	/** @type {PageContent} */
	const pageContent = {
		title: 'All cases',
		heading: 'Search all cases',
		headingClasses: 'govuk-heading-l govuk-!-margin-bottom-3',
		pageComponents: [...searchPageContent, ...appealsDataPageContent]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}
