import config from '#environment/config.js';
import { permissionNames } from '#environment/permissions.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import {
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dayMonthYearHourMinuteToDisplayDate,
	dayMonthYearHourMinuteToISOString
} from '#lib/dates.js';
import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { initialiseAndMapLPAQData } from '#lib/mappers/data/lpa-questionnaire/mapper.js';
import {
	createNotificationBanner,
	dateInput,
	inputInstructionIsRadiosInputInstruction,
	mapNotificationBannersFromSession,
	removeSummaryListActions,
	sortNotificationBanners,
	userHasPermission,
	yesNoInput
} from '#lib/mappers/index.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { isFolderInfo } from '#lib/ts-utilities.js';
import { mapReasonOptionsToCheckboxItemParameters } from '#lib/validation-outcome-reasons-formatter.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { generateCaseTypeSpecificComponents } from './generate-page-components/index.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 * @typedef {import('./lpa-questionnaire.types.js').LPAQuestionnaireValidationOutcome} LPAQuestionnaireValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.IncompleteInvalidReasonsResponse} IncompleteInvalidReasonResponse
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 * @typedef {import('../appeal-details.types.js').BodyValidationOutcome} BodyValidationOutcome
 * @typedef {import('./lpa-questionnaire.types.js').LPAQuestionnaireSessionValidationOutcome} SessionValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 */

/**
 * @param {LPAQuestionnaire} lpaqDetails
 * @param {Appeal} appealDetails
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {string|undefined} backUrl
 * @returns {Promise<PageContent>}
 */
export async function lpaQuestionnairePage(
	lpaqDetails,
	appealDetails,
	currentRoute,
	session,
	request,
	backUrl
) {
	const mappedLpaqDetails = initialiseAndMapLPAQData(
		lpaqDetails,
		appealDetails,
		session,
		currentRoute
	);

	const mappedAppealDetails = await initialiseAndMapAppealData(
		appealDetails,
		currentRoute,
		session,
		request,
		true
	);

	/** @type {PageComponent[]} */
	let appealTypeSpecificPageComponents = generateCaseTypeSpecificComponents(
		appealDetails,
		mappedAppealDetails,
		mappedLpaqDetails
	);

	const lpaText = 'LPA';

	/**
	 * @type {PageComponent}
	 */
	const caseSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			classes: 'govuk-summary-list--no-border',
			rows: [
				...(mappedAppealDetails.appeal.siteAddress.display.summaryListItem
					? [mappedAppealDetails.appeal.siteAddress.display.summaryListItem]
					: []),
				...(mappedAppealDetails.appeal.localPlanningAuthority.display.summaryListItem
					? [
							{
								...mappedAppealDetails.appeal.localPlanningAuthority.display.summaryListItem,
								key: {
									text: lpaText
								}
							}
						]
					: [])
			]
		}
	};
	caseSummary.parameters.rows = caseSummary.parameters.rows.map(
		(/** @type {SummaryListRowProperties} */ row) => removeSummaryListActions(row)
	);

	/**
	 * @type {PageComponent}
	 */
	const additionalDocumentsSummary = {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: { ...mappedLpaqDetails.lpaq?.additionalDocuments?.display.cardItem }
	};

	/** @type {PageComponent} */
	const insetTextComponent = {
		type: 'inset-text',
		parameters: {
			text: 'Confirming this review will inform the relevant parties of the outcome.'
		}
	};

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

	const reviewOutcomeRadiosInputInstruction =
		mappedLpaqDetails.lpaq.reviewOutcome.input?.instructions.find(
			inputInstructionIsRadiosInputInstruction
		);

	/** @type {PageComponent[]} */
	const reviewOutcomeComponents = [];
	if (
		reviewOutcomeRadiosInputInstruction &&
		appealDetails.appealStatus === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE &&
		appealDetails.documentationSummary?.lpaQuestionnaire?.status?.toLowerCase() !== 'complete' &&
		userHasPermission(permissionNames.setStageOutcome, session)
	) {
		reviewOutcomeComponents.push({
			type: 'radios',
			parameters: reviewOutcomeRadiosInputInstruction.properties
		});
		reviewOutcomeComponents.push(insetTextComponent);
		reviewOutcomeComponents.push(documentsWarningComponent);
	}

	/** @type {PageComponent[]} */
	const errorSummaryPageComponents = [];

	if (getDocumentsForVirusStatus(lpaqDetails, 'affected').length > 0) {
		errorSummaryPageComponents.push({
			type: 'error-summary',
			parameters: {
				titleText: 'There is a problem',
				errorList: [
					{
						text: 'One or more documents in this LPA questionnaire contains a virus. Upload a different version of each document that contains a virus.',
						href: '#constraints-summary'
					}
				]
			}
		});
	}

	const notificationBanners = mapLPAQuestionnaireNotificationBanners(
		lpaqDetails,
		session,
		currentRoute,
		appealDetails.appealId,
		appealDetails.appealTimetable?.lpaQuestionnaireDueDate || ''
	);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `LPA questionnaire - ${shortAppealReference}`,
		backLinkUrl: backUrl || `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'LPA questionnaire',
		headingClasses: 'govuk-heading-l govuk-!-margin-bottom-3',
		pageComponents: [
			...errorSummaryPageComponents,
			...notificationBanners,
			caseSummary,
			...appealTypeSpecificPageComponents,
			additionalDocumentsSummary,
			...reviewOutcomeComponents
		],
		submitButtonText: 'Confirm'
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

	if (pageContent.pageComponents) {
		preRenderPageComponents(pageContent.pageComponents);
	}

	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @returns {PageContent}
 */
export function environmentServiceTeamReviewCasePage(appealData, lpaQuestionnaireData) {
	const title = 'Environmental services team review';
	const formLabel = 'Does the environmental services team need to review the case?';
	const { lpaQuestionnaireId } = lpaQuestionnaireData;
	const { appealId, appealReference, eiaScreeningRequired } = appealData;
	const emailAddress = 'environmentalservices@planninginspectorate.gov.uk';
	/** @type {PageContent} */
	const pageContent = {
		title,
		heading: title,
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		submitButtonProperties: {
			text: 'Continue',
			type: 'submit'
		},
		pageComponents: [
			{
				type: 'html',
				parameters: {
					html:
						'<p class="govuk-body">Select yes if there is an environmental statement or if the case needs an environmental screening.</p>' +
						`<p class="govuk-body">You also need to email <a class="govuk-link" href="mailTo:${emailAddress}">${emailAddress}</a> to request a review. Include whether the team needs to review the environmental statement or issue an environmental screening in your email.</p>`
				}
			},
			yesNoInput({
				name: 'eiaScreeningRequired',
				value: eiaScreeningRequired,
				legendText: formLabel,
				legendIsPageHeading: false
			})
		],
		postPageComponents: [
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Return to your appeal</a></p>`
				}
			}
		]
	};
	return pageContent;
}

/**
 * @param {Appeal} appealData
 * @param {string|number} lpaQuestionnaireId
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @param {number} [dueDateDay]
 * @param {number} [dueDateMonth]
 * @param {number} [dueDateYear]
 * @param {boolean} [errorsOnPage]
 * @returns {PageContent}
 */
export function updateDueDatePage(
	appealData,
	errors,
	lpaQuestionnaireId,
	dueDateDay,
	dueDateMonth,
	dueDateYear,
	errorsOnPage
) {
	let existingDueDateDayMonthYear;

	if (errorsOnPage) {
		/** @type {DayMonthYearHourMinute} */
		existingDueDateDayMonthYear = {
			day: dueDateDay,
			month: dueDateMonth,
			year: dueDateYear
		};
	} else if (appealData.documentationSummary.lpaQuestionnaire?.dueDate) {
		existingDueDateDayMonthYear = dateISOStringToDayMonthYearHourMinute(
			appealData.documentationSummary.lpaQuestionnaire?.dueDate
		);
	}

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete`,
		preHeading: `Appeal ${appealShortReference(appealData.appealReference)}`,
		heading: 'Update LPA questionnaire due date',
		submitButtonProperties: {
			text: 'Save and continue',
			type: 'submit'
		},
		pageComponents: [
			dateInput({
				name: 'due-date',
				id: 'due-date',
				namePrefix: 'due-date',
				value: {
					day: existingDueDateDayMonthYear?.day,
					month: existingDueDateDayMonthYear?.month,
					year: existingDueDateDayMonthYear?.year
				},
				legendText: '',
				hint: 'For example, 27 3 2023',
				errors: errors
			})
		]
	};

	if (appealData.documentationSummary.lpaQuestionnaire?.dueDate) {
		pageContent.pageComponents?.push({
			type: 'inset-text',
			parameters: {
				text: `The current due date for the LPA questionnaire is ${dateISOStringToDisplayDate(
					appealData.documentationSummary.lpaQuestionnaire?.dueDate
				)}`,
				classes: 'govuk-!-margin-bottom-7'
			}
		});
	}

	return pageContent;
}

/**
 * @param {number} appealId
 * @param {string} appealReference
 * @param {string|number} lpaQuestionnaireId
 * @param {ReasonOption[]} incompleteReasonOptions
 * @param {LPAQuestionnaireValidationOutcome} validationOutcome
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string|string[]} [incompleteReasons]
 * @param {Object<string, string[]>} [incompleteReasonsText]
 * @param {DayMonthYearHourMinute} [updatedDueDate]
 * @returns {PageContent}
 */
export function checkAndConfirmPage(
	appealId,
	appealReference,
	lpaQuestionnaireId,
	incompleteReasonOptions,
	validationOutcome,
	session,
	incompleteReasons,
	incompleteReasonsText,
	updatedDueDate
) {
	if (validationOutcome === 'incomplete' && !incompleteReasons) {
		throw new Error('validationOutcome incomplete requires incompleteReasons');
	}

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
						text: 'Incomplete'
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`,
								visuallyHiddenText: 'review outcome'
							}
						]
					}
				},
				{
					key: {
						text: 'Incomplete reasons'
					},
					value: {
						html: '',
						pageComponents: [
							{
								type: 'show-more',
								parameters: {
									html: mapReasonsToReasonsListHtml(
										incompleteReasonOptions,
										incompleteReasons,
										incompleteReasonsText
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
								href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete`,
								visuallyHiddenText: 'incomplete reasons'
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
						href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/date`,
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
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/date`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check your answers before confirming your review',
		pageComponents,
		submitButtonText: 'Confirm'
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
 * @param {LPAQuestionnaire} lpaqData
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {string} currentRoute
 * @param {number} appealId
 * @param {string} lpaqDueDate
 * @returns {PageComponent[]}
 */
function mapLPAQuestionnaireNotificationBanners(
	lpaqData,
	session,
	currentRoute,
	appealId,
	lpaqDueDate
) {
	const validationOutcome = lpaqData.validation?.outcome?.toLowerCase();
	const banners = mapNotificationBannersFromSession(session, 'lpaQuestionnaire', appealId);

	if (getDocumentsForVirusStatus(lpaqData, 'not_scanned').length > 0) {
		banners.push(createNotificationBanner({ bannerDefinitionKey: 'notCheckedDocument' }));
	}

	if (validationOutcome === 'incomplete') {
		const listClasses = 'govuk-!-margin-top-0';

		/** @type {PageComponent[]} */
		const bannerContentPageComponents = (lpaqData.validation?.incompleteReasons || [])
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

		const reasonsWithoutText = (lpaqData.validation?.incompleteReasons || []).filter(
			(reason) => !reason.name.hasText
		);

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

		if (lpaqDueDate.length) {
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
								text: dateISOStringToDisplayDate(lpaqDueDate)
							}
						}
					]
				}
			});
		}

		banners.push(
			createNotificationBanner({
				bannerDefinitionKey: 'lpaQuestionnaireNotValid',
				titleText: `LPA Questionnaire is ${String(validationOutcome)}`,
				pageComponents: bannerContentPageComponents
			})
		);
	}

	return sortNotificationBanners(banners);
}

/**
 *
 * @param {ReasonOption[]} reasonOptions
 * @param {BodyValidationOutcome} [bodyValidationOutcome]
 * @param {SessionValidationOutcome} [sessionValidationOutcome]
 * @param {import('@pins/appeals.api').Appeals.ValidationOutcomeResponse | null} [existingValidationOutcome]
 * @param {import('@pins/express').ValidationErrors | undefined} errors
 * @returns {import('../../appeals.types.js').CheckboxItemParameter[]}
 */
export function mapIncompleteReasonOptionsToCheckboxItemParameters(
	reasonOptions,
	bodyValidationOutcome,
	sessionValidationOutcome,
	existingValidationOutcome,
	errors = undefined
) {
	/** @type {import('@pins/appeals.api').Appeals.IncompleteInvalidReasonsResponse[]} */
	let existingReasons = [];
	/** @type {number[]|undefined} */
	let existingReasonIds;

	if (existingValidationOutcome?.outcome?.toLowerCase() === 'incomplete') {
		existingReasons = existingValidationOutcome?.incompleteReasons || [];
		existingReasonIds = existingReasons.map((reason) => reason.name?.id);
	}

	const bodyValidationBaseKey = `incompleteReason`;
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
 * @param {LPAQuestionnaireValidationOutcome} validationOutcome
 * @param {string|string[]} [incompleteReasons]
 * @param {Object<string, string[]>} [incompleteReasonsText]
 * @param {DayMonthYearHourMinute} [updatedDueDate]
 * @returns {import('./lpa-questionnaire.types.js').LPAQuestionnaireValidationOutcomeRequest}
 */
export function mapWebValidationOutcomeToApiValidationOutcome(
	validationOutcome,
	incompleteReasons,
	incompleteReasonsText,
	updatedDueDate
) {
	/** @type number[] */
	let parsedReasons = [];

	if (incompleteReasons) {
		if (!Array.isArray(incompleteReasons)) {
			incompleteReasons = [incompleteReasons];
		}
		parsedReasons = incompleteReasons.map((reason) => parseInt(reason, 10));
		if (!parsedReasons.every((value) => !Number.isNaN(value))) {
			throw new Error('failed to parse one or more invalid reason IDs to integer');
		}
	}

	return {
		validationOutcome,
		...(validationOutcome === 'incomplete' &&
			incompleteReasons &&
			incompleteReasonsText && {
				incompleteReasons: parsedReasons.map((reason) => ({
					id: reason,
					...(incompleteReasonsText?.[`${reason}`] && {
						text: incompleteReasonsText?.[`${reason}`]
					})
				}))
			}),
		...(updatedDueDate && {
			lpaQuestionnaireDueDate: dayMonthYearHourMinuteToISOString({
				...updatedDueDate,
				hour: DEADLINE_HOUR,
				minute: DEADLINE_MINUTE
			})
		})
	};
}

/**
 *
 * @param {LPAQuestionnaire} lpaQuestionnaire
 * @param {"not_scanned"|"checked"|"affected"} virusStatus
 * @returns {import('@pins/appeals.api').Appeals.DocumentInfo[]}
 */
function getDocumentsForVirusStatus(lpaQuestionnaire, virusStatus) {
	let unscannedFiles = [];
	for (let folder of Object.values(lpaQuestionnaire.documents)) {
		const documentsOfStatus = (isFolderInfo(folder) ? folder.documents : []).filter(
			(item) => item.latestDocumentVersion?.virusCheckStatus === virusStatus
		);
		for (const document of documentsOfStatus) {
			unscannedFiles.push(document);
		}
	}
	return unscannedFiles;
}

/**
 * @param {string|undefined} outcomeString
 * @returns {outcomeString is LPAQuestionnaireValidationOutcome}
 */
export function stringIsLPAQuestionnaireValidationOutcome(outcomeString) {
	return (
		outcomeString !== undefined && (outcomeString === 'complete' || outcomeString === 'incomplete')
	);
}

/**
 * @param {LPAQuestionnaire} lpaQuestionnaireData
 * @returns {LPAQuestionnaireValidationOutcome|undefined}
 */
export function getValidationOutcomeFromLpaQuestionnaire(lpaQuestionnaireData) {
	const existingValidationOutcomeString = lpaQuestionnaireData.validation?.outcome?.toLowerCase();

	return stringIsLPAQuestionnaireValidationOutcome(existingValidationOutcomeString)
		? existingValidationOutcomeString
		: undefined;
}
