import { getEnabledAppealCaseTypes } from '#common/feature-flags-appeal-types.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import { addressToString } from '#lib/address-formatter.js';
import { mapStatusFilterLabel, mapStatusText } from '#lib/appeal-status.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { capitalizeFirstLetter } from '#lib/string-utilities.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @typedef {import('@pins/appeals').AppealList} AppealList */
/** @typedef {import('@pins/appeals').Pagination} Pagination */
/** @typedef {import('../../app/auth/auth.service').AccountInfo} AccountInfo */
/** @typedef {import('#appeals/appeals.types.js').AppealType} AppealType */
/** @typedef {import('#appeals/appeals.types.js').AppealProcedureType} AppealProcedureType */
/**
 * @param {{azureAdUserId: string, id: number, name: string}[]} users
 * @param {AppealList|void} appeals
 * @param {AppealType[]} appealTypes
 * @param {import('@pins/appeals.api').Api.CaseTeams} caseTeams
 * @param {AppealProcedureType[]} appealProcedureTypes
 * @param {string} urlWithoutQuery
 * @param {string|undefined} searchTerm
 * @param {string|undefined} searchTermError
 * @param {string|undefined} appealStatusFilter
 * @param {string|undefined} inspectorStatusFilter
 * @param {string|undefined} localPlanningAuthorityFilter
 * @param {string|undefined} caseOfficerFilter
 * @param {string|undefined} inspectorFilter
 * @param {string|undefined} appealTypeFilter
 * @param {string|undefined} caseTeamFilter
 * @param {string|undefined} appealProcedureFilter
 * @param {string|undefined} greenBeltFilter
 * @param {{sapId: string, id: number, name: string}[]} padsUsers
 * @returns {PageContent}
 */

export function nationalListPage(
	users,
	appeals,
	appealTypes,
	caseTeams,
	appealProcedureTypes,
	urlWithoutQuery,
	searchTerm,
	searchTermError,
	appealStatusFilter,
	inspectorStatusFilter,
	localPlanningAuthorityFilter,
	caseOfficerFilter,
	inspectorFilter,
	appealTypeFilter,
	caseTeamFilter,
	appealProcedureFilter,
	greenBeltFilter,
	padsUsers
) {
	const filtersApplied =
		greenBeltFilter ||
		appealTypeFilter ||
		caseTeamFilter ||
		appealProcedureFilter ||
		[
			appealStatusFilter,
			inspectorStatusFilter,
			localPlanningAuthorityFilter,
			caseOfficerFilter,
			inspectorFilter
		].some((filter) => filter && filter !== 'all');

	const appealStatusFilterItemsArray = ['all', ...(appeals?.statusesInNationalList || [])]
		.map((appealStatus) => ({
			text: mapStatusFilterLabel(appealStatus),
			value: appealStatus,
			selected: appealStatusFilter === appealStatus
		}))
		.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));

	const inspectorStatusFilterItemsArray = ['all', 'assigned', 'unassigned'].map(
		(inspectorStatus) => ({
			text: capitalizeFirstLetter(inspectorStatus),
			value: inspectorStatus,
			selected: inspectorStatusFilter === inspectorStatus
		})
	);

	const localPlanningAuthorityFilterItemsArray = [
		{ name: 'All', lpaCode: 'all' },
		...(appeals?.lpas || [])
	].map((localPlanningAuthority) => ({
		text: localPlanningAuthority.name,
		value: localPlanningAuthority.lpaCode,
		selected: localPlanningAuthorityFilter === localPlanningAuthority.lpaCode
	}));

	const caseOfficerFilterItemsArray = [
		{ name: 'All', id: 'all' },
		...(appeals?.caseOfficers.map(({ azureAdUserId }) =>
			users.find((user) => user.azureAdUserId === azureAdUserId)
		) || [])
	].map((caseOfficer) => ({
		text: caseOfficer?.name,
		value: caseOfficer?.id,
		selected: caseOfficerFilter === String(caseOfficer?.id)
	}));

	const inspectorFilterItemsArray = [
		{ name: 'All', id: 'all', sapId: 'all' },
		...(appeals?.inspectors.map(({ azureAdUserId }) =>
			users.find((user) => user.azureAdUserId === azureAdUserId)
		) || [])
	].map((inspector) => ({
		text: inspector?.name,
		value: inspector?.id,
		selected: inspectorFilter === String(inspector?.id)
	}));

	const padsInspectorFilterItemsArray = [...padsUsers].map((inspector) => ({
		text: inspector?.name,
		value: inspector?.sapId,
		selected: inspectorFilter === String(inspector?.sapId)
	}));
	const enabledAppealTypes = getEnabledAppealCaseTypes();

	let enabledAppealProcedures = [];

	if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
		enabledAppealProcedures.push(APPEAL_CASE_PROCEDURE.WRITTEN);
	}
	enabledAppealProcedures.push(APPEAL_CASE_PROCEDURE.HEARING);
	if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78_INQUIRY)) {
		enabledAppealProcedures.push(APPEAL_CASE_PROCEDURE.INQUIRY);
	}

	const appealTypeFilterItemsArray = [
		{
			text: 'All',
			value: 'all',
			selected: appealTypeFilter === 'all'
		},
		...enabledAppealTypes
			.filter((appealType) => appealTypes.some((item) => item.key === appealType))
			.map((appealType) => {
				const { type, id } = appealTypes.find((item) => item.key === appealType) || {};
				return {
					text: type,
					value: `${id}`,
					selected: appealTypeFilter === `${id}`
				};
			})
	];

	const caseTeamFilterItemsArray = [
		{
			text: 'All',
			value: 'all',
			selected: caseTeamFilter === 'all'
		},
		{
			text: 'Not assigned',
			value: -1,
			selected: caseTeamFilter === '-1'
		},
		...caseTeams.map(({ name, id }) => ({
			text: name,
			value: id,
			selected: caseTeamFilter === id?.toString()
		}))
	];

	const appealProcedureFilterItemsArray = [
		{
			text: 'All',
			value: 'all',
			selected: appealProcedureFilter === 'all'
		},
		...appealProcedureTypes
			.filter(({ key }) => enabledAppealProcedures.includes(key))
			.map(({ name, id }) => ({
				text: name,
				value: id.toString(),
				selected: appealProcedureFilter === id.toString()
			}))
	];

	let searchResultsHeader = '';

	if (searchTerm && appeals?.itemCount === 0) {
		searchResultsHeader = `No results found for ${searchTerm}`;
	} else if (searchTerm) {
		searchResultsHeader = `${appeals?.itemCount} result${
			appeals?.itemCount !== 1 ? 's' : ''
		} for ${searchTerm}`;
	} else if (!searchTerm && appeals?.itemCount === 0) {
		searchResultsHeader = `No results found`;
	} else if (!searchTerm && appeals?.itemCount && appeals?.itemCount > 0 && filtersApplied) {
		searchResultsHeader = `${appeals?.itemCount} result${appeals?.itemCount !== 1 ? 's' : ''}`;
	}

	if (filtersApplied) {
		searchResultsHeader += ' (filters applied)';
	}

	const searchInputErrorMessage = {};

	/** @type {PageComponent[]} */
	let errorSummaryPageComponents = [];

	if (searchTermError) {
		searchInputErrorMessage.errorMessage = {
			text: searchTermError
		};
		errorSummaryPageComponents.push({
			type: 'error-summary',
			parameters: {
				titleText: 'There is a problem',
				errorList: [
					{
						text: searchTermError,
						href: '#searchTerm'
					}
				]
			}
		});
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
					text: 'Enter the appeal reference, planning application reference or postcode (including spaces)',
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
							name: 'appealTypeFilter',
							id: 'appeal-type-filter',
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Appeal type'
							},
							value: 'all',
							items: appealTypeFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-appeal' }
						}
					},
					{
						type: 'select',
						parameters: {
							name: 'appealProcedureFilter',
							id: 'appeal-procedure-filter',
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Appeal procedure'
							},
							value: 'all',
							items: appealProcedureFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-appeal-procedure' }
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
							name: 'caseTeamFilter',
							id: 'case-team-filter',
							label: {
								classes: 'govuk-!-font-weight-bold',
								text: 'Case team'
							},
							value: 'all',
							items: caseTeamFilterItemsArray,
							attributes: { 'data-cy': 'filter-by-case-team' }
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
							items: [...inspectorFilterItemsArray, ...padsInspectorFilterItemsArray],
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
						classes: 'govuk-table--small-text-until-tablet govuk-table--case-list',
						head: [
							{
								text: 'Appeal reference'
							},
							{
								text: 'Planning application reference'
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
									html: `<span class="govuk-!-width-one-third">
										${appeal.planningApplicationReference}
									</span>`
								},
								{
									// text: addressToString(appeal.appealSite),
									html: `<span class="govuk-!-width-one-third">${addressToString(
										appeal.appealSite
									)}</span>`
								},
								{
									// text: appeal.localPlanningDepartment,
									html: `<span class="govuk-!-width-one-third">${appeal.localPlanningDepartment}</span>`
								},
								{
									html: `<span class="govuk-!-width-one-third">${appeal.appealType}</span>`
								},
								{
									html: '',
									pageComponents: [
										{
											type: 'status-tag',
											parameters: {
												status: mapStatusText(
													appeal.appealStatus,
													appeal.appealType,
													appeal.procedureType
												)
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
		pageComponents: [...searchPageContent, ...appealsDataPageContent, ...errorSummaryPageComponents]
	};

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * @param {string|undefined} procedurePreferenceRequest
 * @returns {string|undefined}
 */
export const getAppellantProcedurePreference = (procedurePreferenceRequest) => {
	switch (procedurePreferenceRequest) {
		case 'hearingRequests':
			return 'hearing';
		case 'inquiryRequests':
			return 'inquiry';
	}
};
