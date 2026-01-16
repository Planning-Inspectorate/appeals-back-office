import { isFeatureActive } from '#common/feature-flags.js';
import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray } from '#lib/array-utilities.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dayMonthYearHourMinuteToDisplayDate,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { initialiseAndMapData } from '#lib/mappers/data/appellant-case/mapper.js';
import {
	createNotificationBanner,
	dateInput,
	inputInstructionIsRadiosInputInstruction,
	mapNotificationBannersFromSession,
	removeSummaryListActions,
	sortNotificationBanners,
	userHasPermission
} from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { mapReasonOptionsToCheckboxItemParameters } from '#lib/validation-outcome-reasons-formatter.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_DOCUMENT_TYPE,
	APPEAL_VIRUS_CHECK_STATUS
} from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';
import { generateAdvertComponents } from './page-components/adverts.mapper.js';
import { generateCASAdvertComponents } from './page-components/cas-advert.mapper.js';
import { generateCASComponents } from './page-components/cas.mapper.js';
import { generateEnforcementNoticeComponents } from './page-components/enforcement-notice.mapper.js';
import { generateHASComponents } from './page-components/has.mapper.js';
import { generateS20Components } from './page-components/s20.mapper.js';
import { generateS78Components } from './page-components/s78.mapper.js';

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
 * @param {string|undefined} errorMessage
 * @returns {Promise<PageContent>}
 */
export async function appellantCasePage(
	appellantCaseData,
	appealDetails,
	currentRoute,
	backUrl,
	session,
	errorMessage = undefined
) {
	const mappedAppellantCaseData = initialiseAndMapData(
		appellantCaseData,
		appealDetails,
		currentRoute,
		session
	);

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
					: [])
			]
		}
	};

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
		appealDetails.documentationSummary?.appellantCase?.status?.toLowerCase() !== 'valid' &&
		userHasPermission(permissionNames.setStageOutcome, session)
	) {
		if (session.webAppellantCaseReviewOutcome?.validationOutcome) {
			reviewOutcomeRadiosInputInstruction.properties.items =
				// @ts-ignore
				reviewOutcomeRadiosInputInstruction.properties.items.map((item) => {
					return {
						...item,
						checked: item.value === session.webAppellantCaseReviewOutcome?.validationOutcome
					};
				});
		}

		reviewOutcomeComponents.push({
			type: 'radios',
			parameters: {
				...reviewOutcomeRadiosInputInstruction.properties,
				errorMessage: errorMessage ? { text: errorMessage } : undefined
			}
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

	// Add section numbers to the start of each card title other than before you start and additional documents
	appealTypeSpecificComponents.forEach((component, index) => {
		const { title } = component?.parameters?.card || {};
		switch (component.parameters.attributes.id) {
			case 'before-you-start':
				break;
			case 'additional-documents':
				break;
			default:
				title.text = `${index}. ${title.text}`;
		}
	});

	/** @type {PageContent} */
	const pageContent = {
		title: `Appellant case - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Appellant case',
		headingClasses: 'govuk-heading-l govuk-!-margin-bottom-3',
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
 * @param {number | string} [dueDateDay]
 * @param {number | string} [dueDateMonth]
 * @param {number | string} [dueDateYear]
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {boolean} [errorsOnPage]
 * @returns {PageContent}
 */
export function updateDueDatePage(
	appealData,
	errors,
	dueDateDay,
	dueDateMonth,
	dueDateYear,
	errorsOnPage
) {
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
			dateInput({
				name: 'due-date',
				id: 'due-date',
				namePrefix: 'due-date',
				hint: 'For example, 27 3 2007',
				value: {
					day: existingDueDateDayMonthYear.day,
					month: existingDueDateDayMonthYear.month,
					year: existingDueDateDayMonthYear.year
				},
				legendText: '',
				errors: errors
			})
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
 * @param {string} [enforcementNoticeInvalid]
 * @param {string} [otherLiveAppeals]
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
	updatedDueDate,
	enforcementNoticeInvalid,
	otherLiveAppeals
) {
	if (
		(validationOutcome === 'invalid' || validationOutcome === 'incomplete') &&
		!invalidOrIncompleteReasons
	) {
		throw new Error(`validationOutcome "${validationOutcome}" requires invalidOrIncompleteReasons`);
	}

	const isEnforcementAppeal =
		enforcementNoticeInvalid !== undefined && otherLiveAppeals !== undefined;
	const validationOutcomeAsString = String(validationOutcome);

	/** @type {PageComponent} */
	const summaryListComponent = {
		type: 'summary-list',
		parameters: {
			rows: [
				{
					key: { text: isEnforcementAppeal ? 'Review decision' : 'Review outcome' },
					value: { text: capitalize(validationOutcomeAsString) },
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
				isEnforcementAppeal && {
					key: { text: 'Is the enforcement notice invalid?' },
					value: { text: capitalize(enforcementNoticeInvalid) },
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/appellant-case/invalid/enforcement-notice`,
								visuallyHiddenText: 'Is the enforcement notice invalid?'
							}
						]
					}
				},
				{
					key: {
						text: isEnforcementAppeal
							? `Why is the appeal ${validationOutcomeAsString}?`
							: `${capitalize(validationOutcomeAsString)} reasons`
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
				},
				isEnforcementAppeal && {
					key: { text: 'Are there any other live appeals against the enforcement notice?' },
					value: { text: capitalize(otherLiveAppeals) },
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/appellant-case/invalid/other-live-appeals`,
								visuallyHiddenText:
									'Are there any other live appeals against the enforcement notice?'
							}
						]
					}
				}
			].filter(Boolean)
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
			text: isEnforcementAppeal
				? 'We will mark the appeal as invalid and send an email to the relevant parties.'
				: 'Confirming this review will inform the relevant parties of the outcome.'
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
		heading: isEnforcementAppeal
			? 'Check details and mark appeal as invalid'
			: 'Check your answers before confirming your review',
		pageComponents,
		submitButtonProperties: {
			text: isEnforcementAppeal ? 'Mark appeal as invalid' : 'Confirm'
		}
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
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {import('../../appeals.types.js').CheckboxItemParameter[]}
 */
export function mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
	validationOutcome,
	reasonOptions,
	bodyValidationOutcome,
	sessionValidationOutcome,
	existingValidationOutcome,
	errors = undefined
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
		sessionValidationOutcome,
		errors
	);
}

/**
 *
 * @param {AppellantCaseValidationOutcome} validationOutcome
 * @param {string|string[]} [invalidOrIncompleteReasons]
 * @param {Object<string, string[]>} [invalidOrIncompleteReasonsText]
 * @param {DayMonthYearHourMinute} [updatedDueDate]
 * @param {string} [enforcementNoticeInvalid]
 * @param {string} [otherLiveAppeals]
 * @returns {import('./appellant-case.types.js').AppellantCaseValidationOutcomeRequest}
 */
export function mapWebReviewOutcomeToApiReviewOutcome(
	validationOutcome,
	invalidOrIncompleteReasons,
	invalidOrIncompleteReasonsText,
	updatedDueDate,
	enforcementNoticeInvalid,
	otherLiveAppeals
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
		...(validationOutcome === 'invalid' && {
			...(invalidOrIncompleteReasons && {
				invalidReasons: parsedReasons?.map((reason) => ({
					id: reason,
					...(invalidOrIncompleteReasonsText &&
						invalidOrIncompleteReasonsText[reason] && {
							text: invalidOrIncompleteReasonsText[reason]
						})
				}))
			}),
			...(enforcementNoticeInvalid && { enforcementNoticeInvalid }),
			...(otherLiveAppeals && { otherLiveAppeals })
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
		case APPEAL_TYPE.PLANNED_LISTED_BUILDING:
			return generateS20Components(
				appealDetails,
				appellantCaseData,
				mappedAppellantCaseData,
				userHasUpdateCasePermission
			);
		case APPEAL_TYPE.CAS_PLANNING:
			if (isFeatureActive(FEATURE_FLAG_NAMES.CAS)) {
				return generateCASComponents(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for CAS');
			}
		case APPEAL_TYPE.CAS_ADVERTISEMENT:
			if (isFeatureActive(FEATURE_FLAG_NAMES.CAS_ADVERT)) {
				return generateCASAdvertComponents(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for CAS adverts');
			}
		case APPEAL_TYPE.ADVERTISEMENT:
			if (isFeatureActive(FEATURE_FLAG_NAMES.ADVERTISEMENT)) {
				return generateAdvertComponents(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for adverts');
			}
		case APPEAL_TYPE.ENFORCEMENT_NOTICE:
			if (isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_NOTICE)) {
				return generateEnforcementNoticeComponents(
					appealDetails,
					appellantCaseData,
					mappedAppellantCaseData,
					userHasUpdateCasePermission
				);
			} else {
				throw new Error('Feature flag inactive for Enforcement notice');
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
		case APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING:
			return 'Ground (a) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING:
			return 'Ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING:
			return 'Ground (c) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING:
			return 'Ground (d) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING:
			return 'Ground (e) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING:
			return 'Ground (f) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING:
			return 'Ground (g) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT:
			return 'Application receipt';
		default:
			return;
	}
}

/**
 * @param {import('@pins/appeals.api').Appeals.FolderInfo} folder
 * @param {string} appealType
 * @returns {string | undefined}
 */
export function getPageHeadingTextOverrideForAddDocuments(folder, appealType) {
	switch (folder.path.split('/')[1]) {
		case APPEAL_DOCUMENT_TYPE.APPLICATION_DECISION_LETTER:
			return 'Upload the decision letter from the local planning authority';
		case APPEAL_DOCUMENT_TYPE.PLANS_DRAWINGS:
			return 'Upload plans, drawings and list of plans';
		case APPEAL_DOCUMENT_TYPE.ORIGINAL_APPLICATION_FORM:
			return 'Upload your application form';
		case APPEAL_DOCUMENT_TYPE.CHANGED_DESCRIPTION:
			return appealType === APPEAL_TYPE.CAS_ADVERTISEMENT ||
				appealType === APPEAL_TYPE.ADVERTISEMENT
				? 'Upload evidence of your agreement to change the description of the advertisement'
				: 'Upload evidence of your agreement to change the description of development';
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
		case APPEAL_DOCUMENT_TYPE.PRIOR_CORRESPONDENCE_WITH_PINS:
			return 'Upload your communication with the Planning Inspectorate';
		case APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE:
			return 'Upload your enforcement notice';
		case APPEAL_DOCUMENT_TYPE.ENFORCEMENT_NOTICE_PLAN:
			return 'Upload your enforcement notice plan';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING:
			return 'Upload your ground (a) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING:
			return 'Upload your ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING:
			return 'Upload your ground (c) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING:
			return 'Upload your ground (d) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING:
			return 'Upload your ground (e) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING:
			return 'Upload your ground (f) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING:
			return 'Upload your ground (g) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT:
			return 'Upload your application receipt';
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
		case APPEAL_DOCUMENT_TYPE.GROUND_A_SUPPORTING:
			return 'ground (a) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_B_SUPPORTING:
			return 'ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_C_SUPPORTING:
			return 'ground (b) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_D_SUPPORTING:
			return 'ground (d) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_E_SUPPORTING:
			return 'ground (e) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_F_SUPPORTING:
			return 'ground (f) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_G_SUPPORTING:
			return 'ground (g) supporting documents';
		case APPEAL_DOCUMENT_TYPE.GROUND_A_FEE_RECEIPT:
			return 'application receipt';
	}
}
