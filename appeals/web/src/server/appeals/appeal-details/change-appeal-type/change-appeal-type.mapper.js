import logger from '#lib/logger.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { nameToString } from '#lib/person-name-formatter.js';
import { getAppealTypesFromId } from './change-appeal-type.service.js';
import { dateInput } from '#lib/mappers/index.js';
import { changeAppealTypeDateField } from './change-appeal-types.constants.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('#appeals/appeals.types.js').AppealType} AppealType
 * @typedef {import('../../appeals.types.js').SelectItemParameter} SelectItemParameter
 * @typedef {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} ChangeAppealTypeRequest
 */

/**
 *
 * @param {Appeal} appealDetails
 * @param {AppealType[]} appealTypes
 * @param { ChangeAppealTypeRequest } changeAppeal
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export function appealTypePage(appealDetails, appealTypes, changeAppeal, errorMessage) {
	/** @type {PageComponent} */
	const selectAppealTypeRadiosComponent = {
		type: 'radios',
		parameters: {
			name: 'appealType',
			idPrefix: 'appeal-type',
			fieldset: {
				legend: {
					text: 'Appeal type',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			errorMessage: errorMessage && { text: errorMessage },
			items: mapAppealTypesToSelectItemParameters(appealTypes, changeAppeal)
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What type should this appeal be? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference} - update appeal type`,
		pageComponents: [selectAppealTypeRadiosComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function invalidChangeAppealType(appealDetails) {
	const validAppealChangeTypeStatusesListItems = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION
	]
		.map((status) => {
			const formattedStatus = status.replace(/_/g, ' ');
			return `<li>${formattedStatus}</li>`;
		})
		.join('');

	/** @type {PageComponent} */
	const messageComponent = {
		type: 'html',
		parameters: {
			html: `
			<p class="govuk-body">This is because you can only update the appeal type when the status is:</p>
			<ul class="govuk-list govuk-list--bullet">
				${validAppealChangeTypeStatusesListItems}
			</ul>
      	`
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: 'You cannot update the appeal type',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'You cannot update the appeal type',
		pageComponents: [messageComponent]
	};

	return pageContent;
}

/**
 *
 * @param { AppealType[] } appealTypes
 * @param { ChangeAppealTypeRequest } changeAppeal
 * @returns { SelectItemParameter[]}
 */
export function mapAppealTypesToSelectItemParameters(appealTypes, changeAppeal) {
	return appealTypes
		.sort((a, b) => a.key.localeCompare(b.key))
		.map((appealType) => ({
			value: appealType.id.toString(),
			text: mapAppealTypeToDisplayText(appealType),
			checked: changeAppeal && changeAppeal.appealTypeId === appealType.id
		}));
}

/**
 *
 * @param {Appeal} appealDetails
 * @param { ChangeAppealTypeRequest } changeAppeal
 * @param {string|undefined} errorMessage
 * @returns {PageContent}
 */
export function resubmitAppealPage(appealDetails, changeAppeal, errorMessage) {
	/** @type {PageComponent} */
	const selectResubmitAppealComponent = {
		type: 'radios',
		parameters: {
			name: 'appealResubmit',
			idPrefix: 'appeal-resubmit',
			fieldset: {
				legend: {
					text: 'Should the appellant be asked to resubmit this appeal?',
					isPageHeading: true,
					classes: 'govuk-fieldset__legend--l'
				}
			},
			items: [
				{
					value: true,
					text: 'Yes',
					checked: changeAppeal?.resubmit === true
				},
				{
					value: false,
					text: 'No',
					checked: changeAppeal?.resubmit === false
				}
			],
			errorMessage: errorMessage && { text: errorMessage }
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Should the appellant be asked to resubmit this appeal? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/appeal-type`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectResubmitAppealComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {string|undefined} backUrl
 * @returns {PageContent}
 */
export function addHorizonReferencePage(appealDetails, backUrl) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the reference of the new appeal on Horizon? - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			{
				type: 'input',
				parameters: {
					id: 'horizon-reference',
					name: 'horizon-reference',
					type: 'text',
					classes: 'govuk-input govuk-input--width-10',
					label: {
						text: 'What is the reference of the new appeal on Horizon?',
						isPageHeading: true,
						classes: 'govuk-label--l'
					}
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {import('got').Got} apiClient
 * @param {Appeal} appealDetails
 * @param {string} transferredAppealHorizonReference
 * @returns {Promise<PageContent>}
 */
export async function checkTransferPage(
	apiClient,
	appealDetails,
	transferredAppealHorizonReference
) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Details of the transferred appeal - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Details of the transferred appeal',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					rows: [
						{
							key: {
								text: 'Appeal reference'
							},
							value: {
								text: transferredAppealHorizonReference || ''
							}
						},
						{
							key: {
								text: 'Appeal type'
							},
							value: {
								text: await mapAppealResubmitTypeIdToAppealType(apiClient, appealDetails)
							}
						},
						{
							key: {
								text: 'Site address'
							},
							value: {
								text: appealSiteToAddressString(appealDetails.appealSite)
							}
						},
						{
							key: {
								text: 'Local planning authority (LPA)'
							},
							value: {
								text: appealDetails.localPlanningDepartment
							}
						},
						{
							key: {
								text: 'Appellant name'
							},
							value: {
								text: nameToString({
									firstName: appealDetails.appellant?.firstName || '',
									lastName: appealDetails.appellant?.lastName || ''
								})
							}
						},
						{
							key: {
								text: 'Agent name'
							},
							value: {
								text: nameToString({
									firstName: appealDetails.agent?.firstName || '',
									lastName: appealDetails.agent?.lastName || ''
								})
							}
						}
					]
				}
			},
			{
				type: 'warning-text',
				parameters: {
					text: 'You must email the appellant to let them know the appeal type has been changed.'
				}
			},
			{
				type: 'checkboxes',
				parameters: {
					name: 'confirm',
					idPrefix: 'confirm',
					classes: 'govuk-checkboxes--small',
					items: [
						{
							text: 'I have emailed the appellant about their change of appeal type',
							value: 'yes',
							checked: false
						}
					]
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {import('got').Got} apiClient
 * @param {Appeal} appealDetails
 * @returns {Promise<string>}
 */
async function mapAppealResubmitTypeIdToAppealType(apiClient, appealDetails) {
	if (!('resubmitTypeId' in appealDetails)) {
		return '';
	}

	try {
		const appealTypes = await getAppealTypesFromId(apiClient, appealDetails.appealId);
		const appealType = appealTypes.find(
			(appealType) => appealType.id === appealDetails.resubmitTypeId
		);

		if (appealType) {
			return mapAppealTypeToDisplayText(appealType);
		}

		return '';
	} catch (error) {
		logger.error(error);
		return '';
	}
}

/**
 * @param {AppealType} appealType
 * @returns
 */
function mapAppealTypeToDisplayText(appealType) {
	return `(${appealType.key}) ${appealType.type}`;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param { number } changeDay
 * @param { number } changeMonth
 * @param { number } changeYear,
 * @param {import('@pins/express').ValidationErrors|undefined}  errors
 * @returns {PageContent}
 */
export function changeAppealFinalDatePage(
	appealDetails,
	changeDay,
	changeMonth,
	changeYear,
	errors
) {
	/** @type {PageComponent} */
	const selectDateComponent = dateInput({
		name: changeAppealTypeDateField,
		id: changeAppealTypeDateField,
		namePrefix: changeAppealTypeDateField,
		value: {
			day: changeDay || '',
			month: changeMonth || '',
			year: changeYear || ''
		},
		legendText: 'What is the final date the appellant must resubmit by?',
		hint: 'For example, 27 3 2023',
		errors: errors
	});

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming will ask the appellant to resubmit using the correct appeal type'
		}
	};

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `What is the final date the appellant must resubmit by? - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/resubmit`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectDateComponent, insetTextComponent],
		submitButtonText: 'Confirm'
	};

	return pageContent;
}
