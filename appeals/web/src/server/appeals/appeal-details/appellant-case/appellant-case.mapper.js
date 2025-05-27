import config from '#environment/config.js';
import { inputInstructionIsRadiosInputInstruction } from '#lib/mappers/index.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dayMonthYearHourMinuteToISOString,
	dayMonthYearHourMinuteToDisplayDate
} from '#lib/dates.js';
import { capitalize } from 'lodash-es';
import { mapReasonOptionsToCheckboxItemParameters } from '#lib/validation-outcome-reasons-formatter.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { initialiseAndMapData } from '#lib/mappers/data/appellant-case/mapper.js';
import {
	userHasPermission,
	removeSummaryListActions,
	mapNotificationBannersFromSession,
	createNotificationBanner,
	sortNotificationBanners
} from '#lib/mappers/index.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_VIRUS_CHECK_STATUS,
	APPEAL_DOCUMENT_TYPE
} from 'pins-data-model';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { generateHASComponents } from './page-components/has.mapper.js';
import { generateS78Components } from './page-components/s78.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { ensureArray } from '#lib/array-utilities.js';
import { generateS20Components } from './page-components/s20.mapper.js';

/**
 * @typedef {import('../../appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('@pins/appeals.api').Appeals.IncompleteInvalidReasonsResponse} IncompleteInvalidReasonsResponse
 * @typedef {import('../appeal-details.types.js').BodyValidationOutcome} BodyValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('./appellant-case.types.js').AppellantCaseValidationOutcome} AppellantCaseValidationOutcome
 * @typedef {import('./appellant-case.types.js').AppellantCaseSessionValidationOutcome} AppellantCaseSessionValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 * @typedef {import('@pins/appeals.api').Appeals.DocumentInfo} DocumentInfo
 * @typedef {import('../appeal-details.types.js').WebAppeal} Appeal
 */

/**
 *
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {Appeal} appealDetails
 * @param {string} currentRoute
 * @param {string|undefined} backUrl
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {Promise<PageContent>}
 */
export async function appellantCasePage(
	appellantCaseData,
	appealDetails,
	currentRoute,
	backUrl,
	session
) {
	const mappedAppellantCaseData = initialiseAndMapData(
		appellantCaseData,
		appealDetails,
		currentRoute,
		session
	);

	const lpaText = 'Local planning authority';

	/**
	 * @type {PageComponent}
	 */
	const appellantCaseSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'govuk-summary-list--no-border',
			rows: [
				...(mappedAppellantCaseData.siteAddress.display.summaryListItem
					? [
							{
								...mappedAppellantCaseData.siteAddress.display.summaryListItem,
								key: {
									text: 'Site address'
								}
							}
					  ]
					: []),
				...(mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem
					? [
							{
								...mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem,
								key: {
									text: lpaText
								}
							}
					  ]
					: [])
			]
		}
	};

	appellantCaseSummary.parameters.rows = appellantCaseSummary.parameters.rows.map(
		(/** @type {SummaryListRowProperties} */ row) =>
			row.key.text === lpaText ? row : removeSummaryListActions(row)
	);

	const userHasUpdateCase = userHasPermission(permissionNames.updateCase, session);
	const appealTypeSpecificComponents = generateCaseTypeSpecificComponents(
		appealDetails,
		appellantCaseData,
		mappedAppellantCaseData,
		userHasUpdateCase
	);

	const reviewOutcomeRadiosInputInstruction =
		mappedAppellantCaseData.reviewOutcome.input?.instructions.find(
			inputInstructionIsRadiosInputInstruction
		);

	/** @type {PageComponent[]} */
	const reviewOutcomeComponents = [];

	/** @type {PageComponent} */
	const documentsWarningComponent = {
		type: 'warning-text',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">',
			closing: '</div></div>'
		},
		parameters: {
			text: 'Do not select an outcome until you have reviewed all of the supporting documents and redacted any sensitive information.'
		}
	};

	if (
		reviewOutcomeRadiosInputInstruction &&
		appealDetails.appealStatus === APPEAL_CASE_STATUS.VALIDATION &&
		userHasPermission(permissionNames.setStageOutcome, session)
	) {
		reviewOutcomeComponents.push({
			type: 'radios',
			parameters: reviewOutcomeRadiosInputInstruction.properties
		});
		reviewOutcomeComponents.push(documentsWarningComponent);
	}

	/** @type {PageComponent[]} */
	const errorSummaryPageComponents = [];

	if (
		getDocumentsForVirusStatus(appellantCaseData, APPEAL_VIRUS_CHECK_STATUS.AFFECTED).length > 0
	) {
		errorSummaryPageComponents.push({
			type: 'error-summary',
			parameters: {
				titleText: 'There is a problem',
				errorList: [
					{
						text: 'One or more documents in this appellant case contains a virus. Upload a different version of each document that contains a virus.',
						href: '#appeal-summary'
					}
				]
			}
		});
	}

	const existingValidationOutcome = getValidationOutcomeFromAppellantCase(appellantCaseData);
	const notificationBanners = mapAppellantCaseNotificationBanners(
		appellantCaseData,
		currentRoute,
		session,
		existingValidationOutcome,
		existingValidationOutcome === 'invalid'
			? appellantCaseData.validation?.invalidReasons || []
			: appellantCaseData.validation?.incompleteReasons || [],
		appealDetails?.appealId,
		appealDetails?.documentationSummary.appellantCase?.dueDate
	);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `Appellant case - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Appellant case',
		headingClasses: 'govuk-heading-xl govuk-!-margin-bottom-3',
		pageComponents: [
			...errorSummaryPageComponents,
			...notificationBanners,
			appellantCaseSummary,
			...appealTypeSpecificComponents,
			...reviewOutcomeComponents
		]
	};

	if (!userHasPermission(permissionNames.updateCase, session)) {
		pageContent.pageComponents?.forEach((component) => {
			if ('rows' in component.parameters && Array.isArray(component.parameters.rows)) {
				component.parameters.rows = component.parameters.rows.map((row) =>
					removeSummaryListActions(row)
				);
			}
		});
	}

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * @param {string|undefined} outcomeString
 * @returns {outcomeString is AppellantCaseValidationOutcome}
 */
export function stringIsAppellantCaseValidationOutcome(outcomeString) {
	return (
		outcomeString !== undefined &&
		(outcomeString === 'valid' || outcomeString === 'invalid' || outcomeString === 'incomplete')
	);
}

/**
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @returns {AppellantCaseValidationOutcome|undefined}
 */
export function getValidationOutcomeFromAppellantCase(appellantCaseData) {
	const existingValidationOutcomeString = appellantCaseData.validation?.outcome?.toLowerCase();

	return stringIsAppellantCaseValidationOutcome(existingValidationOutcomeString)
		? existingValidationOutcomeString
		: undefined;
}

/**
 * @param {Appeal} appealData
 * @param {number|string} [dueDateDay]
 * @param {number|string} [dueDateMonth]
 * @param {number|string} [dueDateYear]
 * @param {boolean} [errorsOnPage]
 * @returns {PageContent}
 */
export function updateDueDatePage(appealData, dueDateDay, dueDateMonth, dueDateYear, errorsOnPage) {
	let existingDueDateDayMonthYear = {
		day: dueDateDay,
		month: dueDateMonth,
		year: dueDateYear
	};

	if (!errorsOnPage && appealData.documentationSummary.appellantCase?.dueDate) {
		const existingDueDate = dateISOStringToDayMonthYearHourMinute(
			appealData.documentationSummary.appellantCase?.dueDate
		);
		existingDueDateDayMonthYear.day = existingDueDate.day;
		existingDueDateDayMonthYear.month = existingDueDate.month;
		existingDueDateDayMonthYear.year = existingDueDate.year;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case/incomplete/`,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: 'Update appeal due date',
		submitButtonProperties: {
			text: 'Save and continue',
			type: 'submit'
		},
		pageComponents: [
			{
				type: 'date-input',
				parameters: {
					id: 'due-date',
					namePrefix: 'due-date',
					hint: {
						text: 'For example, 27 3 2007'
					},
					...(existingDueDateDayMonthYear && {
						items: [
							{
								name: 'day',
								classes: 'govuk-input--width-2',
								value: existingDueDateDayMonthYear.day
							},
							{
								name: 'month',
								classes: 'govuk-input--width-2',
								value: existingDueDateDayMonthYear.month
							},
							{
								name: 'year',
								classes: 'govuk-input--width-4',
								value: existingDueDateDayMonthYear.year
							}
						]
					})
				}
			}
		]
	};

	return pageContent;
}

/**
 *
 * @param {number} appealId
 * @param {string} appealReference
 * @param {ReasonOption[]} reasonOptions
 * @param {AppellantCaseValidationOutcome} validationOutcome
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string|string[]} [invalidOrIncompleteReasons]
 * @param {Object<string, string[]>} [invalidOrIncompleteReasonsText]
 * @param {DayMonthYearHourMinute} [updatedDueDate]
 * @returns {PageContent}
 */
export function checkAndConfirmPage(
	appealId,
	appealReference,
	reasonOptions,
	validationOutcome,
	session,
	invalidOrIncompleteReasons,
	invalidOrIncompleteReasonsText,
	updatedDueDate
) {
	if (
		(validationOutcome === 'invalid' || validationOutcome === 'incomplete') &&
		!invalidOrIncompleteReasons
	) {
		throw new Error(`validationOutcome "${validationOutcome}" requires invalidOrIncompleteReasons`);
	}

	const validationOutcomeAsString = String(validationOutcome);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: {
						text: 'Review outcome'
					},
					value: {
						text: capitalize(validationOutcomeAsString)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/appellant-case`,
								visuallyHiddenText: 'review outcome'
							}
						]
					}
				},
				{
					key: {
						text: `${capitalize(validationOutcomeAsString)} reasons`
					},
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									html: mapReasonsToReasonsListHtml(
										reasonOptions,
										invalidOrIncompleteReasons,
										invalidOrIncompleteReasonsText
									),
									labelText: 'Read more'
								}
							}
						]
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcomeAsString.toLowerCase()}`,
								visuallyHiddenText: `${capitalize(validationOutcomeAsString)} reasons`
							}
						]
					}
				}
			]
		}
	};

	if (updatedDueDate) {
		summaryListComponent.parameters.rows.push({
			key: {
				text: 'Updated due date'
			},
			value: {
				text: dayMonthYearHourMinuteToDisplayDate(updatedDueDate)
			},
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcomeAsString.toLowerCase()}/date`,
						visuallyHiddenText: 'updated due date'
					}
				]
			}
		});
	}

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming this review will inform the relevant parties of the outcome.'
		}
	};

	/** @type {PageComponent[]} */
	const pageComponents = [summaryListComponent, insetTextComponent];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl:
			validationOutcome === 'incomplete'
				? `/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcome}/date`
				: `/appeals-service/appeal-details/${appealId}/appellant-case/${validationOutcome}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check your answers before confirming your review',
		pageComponents
	};

	if (
		!session.account.idTokenClaims.groups.includes(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		)
	) {
		pageContent.pageComponents?.forEach((component) => {
			if ('rows' in component.parameters && Array.isArray(component.parameters.rows)) {
				component.parameters.rows = component.parameters.rows.map((row) =>
					removeSummaryListActions(row)
				);
			}
		});
	}

	return pageContent;
}

/**
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {AppellantCaseValidationOutcome|undefined} validationOutcome
 * @param {IncompleteInvalidReasonsResponse[]} notValidReasons
 * @param {number} appealId
 * @param {string|null} [appealDueDate]
 * @returns {PageComponent[]}
 */
export function mapAppellantCaseNotificationBanners(
	appellantCaseData,
	currentRoute,
	session,
	validationOutcome,
	notValidReasons,
	appealId,
	appealDueDate
) {
	const banners = mapNotificationBannersFromSession(session, 'appellantCase', appealId);

	if (
		getDocumentsForVirusStatus(appellantCaseData, APPEAL_VIRUS_CHECK_STATUS.NOT_SCANNED).length > 0
	) {
		banners.push(createNotificationBanner({ bannerDefinitionKey: 'notCheckedDocument' }));
	}

	if (validationOutcome === 'invalid' || validationOutcome === 'incomplete') {
		notValidReasons = ensureArray(notValidReasons);

		const listClasses = 'govuk-!-margin-top-0';

		/** @type {PageComponent[]} */
		const bannerContentPageComponents = (notValidReasons || [])
			.filter((reason) => reason.name.hasText)
			.map((reason) => ({
				type: 'details',
				parameters: {
					summaryText: reason.name?.name,
					html: buildHtmlList({
						...(reason.text ? { items: reason.text } : {}),
						listClasses
					})
				}
			}));

		const reasonsWithoutText = (notValidReasons || []).filter((reason) => !reason.name.hasText);

		if (reasonsWithoutText.length > 0) {
			bannerContentPageComponents.unshift({
				type: 'details',
				parameters: {
					summaryText: 'Incorrect name and/or missing documents',
					html: buildHtmlList({
						items: reasonsWithoutText.map((reason) => reason.name.name),
						listClasses
					})
				}
			});
		}

		if (validationOutcome === 'incomplete' && appealDueDate) {
			bannerContentPageComponents.unshift({
				type: 'summary-list',
				parameters: {
					classes: 'govuk-summary-list--no-border govuk-!-margin-bottom-4',
					rows: [
						{
							key: {
								text: 'Due date'
							},
							value: {
								text: dateISOStringToDisplayDate(appealDueDate)
							}
						}
					]
				}
			});
		}

		banners.push(
			createNotificationBanner({
				bannerDefinitionKey: 'appellantCaseNotValid',
				titleText: `Appeal is ${String(validationOutcome)}`,
				pageComponents: bannerContentPageComponents
			})
		);
	}

	return sortNotificationBanners(banners);
}

/**
 *
 * @param {AppellantCaseValidationOutcome} validationOutcome
 * @param {ReasonOption[]} reasonOptions
 * @param {BodyValidationOutcome} [bodyValidationOutcome]
 * @param {AppellantCaseSessionValidationOutcome} [sessionValidationOutcome]
 * @param {import('./appellant-case.types.js').AppellantCaseValidationOutcomeResponse} [existingValidationOutcome]
 * @returns {import('../../appeals.types.js').CheckboxItemParameter[]}
 */
export function mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
	validationOutcome,
	reasonOptions,
	bodyValidationOutcome,
	sessionValidationOutcome,
	existingValidationOutcome
) {
	/** @type {IncompleteInvalidReasonsResponse[]} */
	let existingReasons = [];
	/** @type {number[]|undefined} */
	let existingReasonIds;

	if (
		existingValidationOutcome &&
		existingValidationOutcome.outcome.toLowerCase() === validationOutcome
	) {
		existingReasons =
			existingValidationOutcome.outcome.toLowerCase() === 'invalid'
				? existingValidationOutcome.invalidReasons || []
				: existingValidationOutcome.incompleteReasons || [];
		existingReasonIds = existingReasons.map((reason) => reason.name.id);
	}

	const bodyValidationBaseKey = `${validationOutcome}Reason`;
	/** @type {string|string[]|undefined} */
	const bodyValidationOutcomeReasons = bodyValidationOutcome?.[bodyValidationBaseKey];

	let notValidReasonIds =
		bodyValidationOutcomeReasons || sessionValidationOutcome?.reasons || existingReasonIds;

	if (typeof notValidReasonIds !== 'undefined' && !Array.isArray(notValidReasonIds)) {
		notValidReasonIds = [notValidReasonIds];
	}
	const checkedOptions = notValidReasonIds?.map((value) =>
		typeof value === 'string' ? parseInt(value, 10) : value
	);

	return mapReasonOptionsToCheckboxItemParameters(
		reasonOptions,
		checkedOptions,
		existingReasons,
		bodyValidationOutcome,
		bodyValidationBaseKey,
		sessionValidationOutcome
	);
}

/**
 *
 * @param {AppellantCaseValidationOutcome} validationOutcome
 * @param {string|string[]} [invalidOrIncompleteReasons]
 * @param {Object<string, string[]>} [invalidOrIncompleteReasonsText]
 * @param {DayMonthYearHourMinute} [updatedDueDate]
 * @returns {import('./appellant-case.types.js').AppellantCaseValidationOutcomeRequest}
 */
export function mapWebReviewOutcomeToApiReviewOutcome(
	validationOutcome,
	invalidOrIncompleteReasons,
	invalidOrIncompleteReasonsText,
	updatedDueDate
) {
	let parsedReasons;

	if (invalidOrIncompleteReasons) {
		if (!Array.isArray(invalidOrIncompleteReasons)) {
			invalidOrIncompleteReasons = [invalidOrIncompleteReasons];
		}
		parsedReasons = invalidOrIncompleteReasons.map((reason) => parseInt(reason, 10));
		if (!parsedReasons.every((value) => !Number.isNaN(value))) {
			throw new Error('failed to parse one or more invalid reason IDs to integer');
		}
	}

	return {
		validationOutcome: validationOutcome,
		...(validationOutcome === 'invalid' &&
			invalidOrIncompleteReasons && {
				invalidReasons: parsedReasons?.map((reason) => ({
					id: reason,
					...(invalidOrIncompleteReasonsText &&
						invalidOrIncompleteReasonsText[reason] && {
							text: invalidOrIncompleteReasonsText[reason]
						})
				}))
			}),
		...(validationOutcome === 'incomplete' &&
			invalidOrIncompleteReasons && {
				incompleteReasons: parsedReasons?.map((reason) => ({
					id: reason,
					...(invalidOrIncompleteReasonsText &&
						invalidOrIncompleteReasonsText[reason] && {
							text: invalidOrIncompleteReasonsText[reason]
						})
				}))
			}),
		...(updatedDueDate && {
			appealDueDate: dayMonthYearHourMinuteToISOString({
				...updatedDueDate,
				hour: DEADLINE_HOUR,
				minute: DEADLINE_MINUTE
			})
		})
	};
}

/**
 *
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {string} virusStatus
 * @returns {DocumentInfo[]}
 */
function getDocumentsForVirusStatus(appellantCaseData, virusStatus) {
	const unscannedFiles = [];
	for (const folder of Object.values(appellantCaseData.documents)) {
		if (folder && 'documents' in folder && folder.documents) {
			const documentsOfStatus = folder.documents.filter(
				(document) => document.latestDocumentVersion?.virusCheckStatus === virusStatus
			);
			for (const document of documentsOfStatus) {
				unscannedFiles.push(document);
			}
		}
	}
	return unscannedFiles;
}
/**
 *
 * @param {Appeal} appealDetails
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {PageComponent[]}
 */
function generateCaseTypeSpecificComponents(
	appealDetails,
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.HOUSEHOLDER:
			return generateHASComponents(
				appealDetails,
				appellantCaseData,
				mappedAppellantCaseData,
				userHasUpdateCasePermission
			);
		case APPEAL_TYPE.S78:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				return generateS78Components(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for S78');
			}
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING: //TODO: new field mappings and feature flag logic
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_20)) {
				return generateS20Components(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for S20');
			}
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @returns {string | undefined}
 */
export function getPageHeadingTextOverrideForFolder(folder) {
	switch (folder.path.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'Plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS:
			return 'new plans or drawings';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT:
			return 'design and access statement';
		case APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE:
			return 'Separate ownership certificate and agricultural land declaration';
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'Decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS:
			return 'Other new supporting documents';
		default:
			return;
	}
}

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @returns {string | undefined}
 */
export function getPageHeadingTextOverrideForAddDocuments(folder) {
	switch (folder.path.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'Upload the decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'Upload plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM:
			return 'Upload your application form';
		case APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION:
			return 'Upload evidence of your agreement to change the description of development';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT:
			return 'Upload your appeal statement';
		case APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION:
			return 'Upload your planning obligation';
		case APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE:
			return 'Upload your separate ownership certificate and agricultural land declaration';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION:
			return 'Upload your application for an award of appeal costs';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT:
			return 'Upload your design and access statement';
		case APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS:
			return 'Upload your new plans or drawings';
		case APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS:
			return 'Upload your other new supporting documents';
		default:
			break;
	}
}

/**
 * @param {string} folderPath
 * @returns {string | undefined}
 */
export function getDocumentNameFromFolder(folderPath) {
	switch (folderPath.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM:
			return 'application form';
		case APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION:
			return 'evidence of your agreement to change the description of development';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_STATEMENT:
			return 'appeal statement';
		case APPEAL_DOCUMENT_TYPE.PLANNING_OBLIGATION:
			return 'planning obligation';
		case APPEAL_DOCUMENT_TYPE.OWNERSHIP_CERTIFICATE:
			return 'separate ownership certificate and agricultural land declaration';
		case APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION:
			return 'application for an award of appeal costs';
		case APPEAL_DOCUMENT_TYPE.DESIGN_ACCESS_STATEMENT:
			return 'design and access statement';
		case APPEAL_DOCUMENT_TYPE.NEW_PLANS_DRAWINGS:
			return 'new plans or drawings';
		case APPEAL_DOCUMENT_TYPE.OTHER_NEW_DOCUMENTS:
			return 'other new supporting documents';
	}
}
