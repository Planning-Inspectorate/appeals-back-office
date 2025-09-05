import { appealShortReference } from '#lib/appeals-formatter.js';
import { getExampleDateHint } from '#lib/dates.js';
import { dateInput } from '#lib/mappers/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { changeAppealTypeDateField } from './change-appeal-types.constants.js';

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
 * @param { ChangeAppealTypeRequest | undefined | Object } changeAppeal
 * @param {string | undefined} errorMessage
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
			items: mapAppealTypesToSelectItemParameters(
				appealTypes,
				changeAppeal,
				appealDetails.appealType
			)
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
 * @param { ChangeAppealTypeRequest | undefined | Object } changeAppeal
 * @param { string | null | undefined } currentAppealType
 * @returns { SelectItemParameter[]}
 */
function mapAppealTypesToSelectItemParameters(appealTypes, changeAppeal, currentAppealType) {
	return appealTypes
		.sort((a, b) => {
			// CAS Planning should be listed before CAS Advert
			if (a.key === 'ZP' && b.key === 'ZA') {
				return -1;
			}
			if (a.key === 'ZA' && b.key === 'ZP') {
				return 1;
			}
			return a.key.localeCompare(b.key);
		})
		.filter((appealType) => appealType.key !== 'Z') // Don't show old CAS type
		.map((appealType) => ({
			value: appealType.id.toString(),
			text: appealType.changeAppealType,
			checked: isAppealTypeRadioChecked(appealType, changeAppeal, currentAppealType)
		}));
}

/**
 *
 * @param { AppealType } appealType
 * @param { ChangeAppealTypeRequest | undefined | Object } changeAppeal
 * @param { string | null | undefined } currentAppealType
 * @returns { Boolean }
 */
function isAppealTypeRadioChecked(appealType, changeAppeal, currentAppealType) {
	const changeAppealExists = changeAppeal !== undefined && 'appealTypeId' in changeAppeal;

	return (
		(changeAppealExists && changeAppeal.appealTypeId === appealType.id) ||
		(!changeAppealExists && currentAppealType === appealType.type)
	);
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
					text: 'Does the appellant need to resubmit the appeal?',
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
		title: 'Does the appellant need to resubmit the appeal?',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/appeal-type`,
		preHeading: `Appeal ${shortAppealReference} - update appeal type`,
		pageComponents: [selectResubmitAppealComponent]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {string|undefined} backUrl
 * @param {string|undefined} horizonReference
 * @returns {PageContent}
 */
export function addHorizonReferencePage(appealDetails, backUrl, horizonReference) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Horizon reference - ${shortAppealReference}`,
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
						text: 'Horizon reference',
						isPageHeading: true,
						classes: 'govuk-label--l'
					},
					value: horizonReference
				}
			}
		]
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {string} transferredAppealHorizonReference
 * @returns {Promise<PageContent>}
 */
export async function checkTransferPage(appealDetails, transferredAppealHorizonReference) {
	const shortAppealReference = appealShortReference(appealDetails.appealReference);
	const backLinkUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/add-horizon-reference`;

	/** @type {PageContent} */
	const pageContent = {
		title: `Check details and mark case as transferred`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Check details and mark case as transferred',
		pageComponents: [
			{
				type: 'summary-list',
				parameters: {
					rows: [
						{
							key: {
								text: 'Horizon reference'
							},
							value: {
								text: transferredAppealHorizonReference || ''
							},
							actions: {
								items: [
									{
										href: backLinkUrl,
										text: 'Change',
										visuallyHiddenText: 'level'
									}
								]
							}
						}
					]
				}
			}
		],
		submitButtonProperties: {
			text: 'Mark case as transferred',
			type: 'submit'
		}
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param { string | undefined } changeDay
 * @param { string | undefined } changeMonth
 * @param { string | undefined } changeYear,
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
		legendText: 'Deadline to resubmit appeal',
		hint: `For example, ${getExampleDateHint(45)}`,
		errors: errors
	});

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Deadline to resubmit appeal - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/change-appeal-type/resubmit`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [selectDateComponent],
		submitButtonText: 'Continue'
	};

	return pageContent;
}

/**
 *
 * @param {string} appealId
 * @param {string} existingAppealType
 * @param {string} newAppealType
 * @returns
 */
export function changeAppealMarkAppealInvalidPage(appealId, existingAppealType, newAppealType) {
	/** @type {PageComponent} */
	const textComponent = {
		type: 'html',
		parameters: {
			html: `
			<p class="govuk-body">You need to add a deadline for the appellant to resubmit the new ${newAppealType} appeal.<p>
      	`
		}
	};

	const pageContent = {
		title: `We will mark the ${existingAppealType} appeal as invalid`,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/change-appeal-type/resubmit`,
		preHeading: `Appeal ${appealId}`,
		heading: `We will mark the ${existingAppealType} appeal as invalid`,
		pageComponents: [textComponent],
		submitButtonText: 'Continue'
	};

	return pageContent;
}
