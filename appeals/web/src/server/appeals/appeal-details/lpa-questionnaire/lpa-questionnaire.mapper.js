import config from '#environment/config.js';
import { inputInstructionIsRadiosInputInstruction } from '#lib/mappers/index.js';
import { initialiseAndMapAppealData } from '#lib/mappers/data/appeal/mapper.js';
import { initialiseAndMapLPAQData } from '#lib/mappers/data/lpa-questionnaire/mapper.js';
import {
	dayMonthYearHourMinuteToISOString,
	dayMonthYearHourMinuteToDisplayDate,
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate
} from '#lib/dates.js';
import {
	mapReasonOptionsToCheckboxItemParameters,
	mapReasonsToReasonsListHtml
} from '#lib/validation-outcome-reasons-formatter.js';
import { buildNotificationBanners } from '#lib/mappers/index.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { isDefined, isFolderInfo } from '#lib/ts-utilities.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { DEADLINE_HOUR, DEADLINE_MINUTE } from '@pins/appeals/constants/dates.js';
import { isFeatureActive } from '#common/feature-flags.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { userHasPermission } from '#lib/mappers/index.js';
import { permissionNames } from '#environment/permissions.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} LPAQuestionnaire
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 * @typedef {import('../../appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 * @typedef {import('./lpa-questionnaire.types.js').LPAQuestionnaireValidationOutcome} LPAQuestionnaireValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.IncompleteInvalidReasonsResponse} IncompleteInvalidReasonResponse
 * @typedef {import('@pins/appeals.api').Appeals.NotValidReasonOption} NotValidReasonOption
 * @typedef {import('../appeal-details.types.js').BodyValidationOutcome} BodyValidationOutcome
 * @typedef {import('./lpa-questionnaire.types.js').LPAQuestionnaireSessionValidationOutcome} SessionValidationOutcome
 * @typedef {import('@pins/appeals.api').Appeals.FolderInfo} FolderInfo
 */

/**
 * @param {LPAQuestionnaire} lpaqDetails
 * @param {Appeal} appealDetails
 * @param {string} currentRoute
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {Promise<PageContent>}
 */
export async function lpaQuestionnairePage(lpaqDetails, appealDetails, currentRoute, session) {
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
		true
	);

	/** @type {PageComponent[]} */
	let appealTypeSpecificPageComponents = generateCaseTypeSpecificComponents(
		appealDetails,
		mappedAppealDetails,
		mappedLpaqDetails
	);

	/**
	 * @type {PageComponent}
	 */
	const caseSummary = {
		type: 'summary-list',
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
									text: 'LPA'
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
		userHasPermission(permissionNames.setStageOutcome, session)
	) {
		reviewOutcomeComponents.push({
			type: 'html',
			parameters: {
				html: '<h2>What is the outcome of your review?</h2>'
			}
		});
		reviewOutcomeComponents.push({
			type: 'radios',
			parameters: reviewOutcomeRadiosInputInstruction.properties
		});
		reviewOutcomeComponents.push(insetTextComponent);
		reviewOutcomeComponents.push(documentsWarningComponent);
	}

	if (getDocumentsForVirusStatus(lpaqDetails, 'not_scanned').length > 0) {
		addNotificationBannerToSession(
			session,
			'notCheckedDocument',
			appealDetails?.appealId,
			`<p class="govuk-notification-banner__heading">Virus scan in progress</p></br><a class="govuk-notification-banner__link" href="${currentRoute}">Refresh page to see if scan has finished</a>`
		);
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

	const notificationBanners = mapNotificationBannerComponentParameters(
		session,
		lpaqDetails,
		appealDetails.appealId,
		appealDetails.appealTimetable?.lpaQuestionnaireDueDate || ''
	);

	const shortAppealReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageContent} */
	const pageContent = {
		title: `LPA questionnaire - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'LPA questionnaire',
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
 * @param {string|number} lpaQuestionnaireId
 * @param {number} [dueDateDay]
 * @param {number} [dueDateMonth]
 * @param {number} [dueDateYear]
 * @param {boolean} [errorsOnPage]
 * @returns {PageContent}
 */
export function updateDueDatePage(
	appealData,
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
 * @param {NotValidReasonOption[]} incompleteReasonOptions
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
								href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}`
							}
						]
					}
				},
				{
					key: {
						text: 'Incomplete reasons'
					},
					value: {
						html: mapReasonsToReasonsListHtml(
							incompleteReasonOptions,
							incompleteReasons,
							incompleteReasonsText
						)
					},
					actions: {
						items: [
							{
								text: 'Change',
								href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete`
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
						href: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/date`
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

	/** @type {PageContent} */
	const pageContent = {
		title: 'Check answers',
		backLinkUrl: `/appeals-service/appeal-details/${appealId}/lpa-questionnaire/${lpaQuestionnaireId}/incomplete/date`,
		preHeading: `Appeal ${appealShortReference(appealReference)}`,
		heading: 'Check your answers before confirming your review',
		pageComponents: [summaryListComponent, insetTextComponent],
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
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {LPAQuestionnaire} lpaqData
 * @param {number} appealId
 * @param {string} lpaqDueDate
 * @returns {PageComponent[]}
 */
function mapNotificationBannerComponentParameters(session, lpaqData, appealId, lpaqDueDate) {
	const validationOutcome = lpaqData.validation?.outcome?.toLowerCase();

	if (
		validationOutcome === 'complete' &&
		'notificationBanners' in session &&
		'lpaQuestionnaireNotValid' in session.notificationBanners
	) {
		delete session.notificationBanners.lpaQuestionnaireNotValid;
	} else if (validationOutcome === 'incomplete') {
		if (!('notificationBanners' in session)) {
			session.notificationBanners = {};
		}

		const listClasses = 'govuk-!-margin-top-0';

		/** @type {PageComponent[]} */
		const bannerContentPageComponents = (lpaqData.validation?.incompleteReasons || [])
			.filter((reason) => reason.name.hasText)
			.map((reason) => ({
				type: 'details',
				parameters: {
					summaryText: reason.name?.name,
					html: buildHtmUnorderedList(reason.text || [], 0, listClasses)
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
					html: buildHtmUnorderedList(
						reasonsWithoutText.map((reason) => reason.name.name),
						0,
						listClasses
					)
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

		session.notificationBanners.lpaQuestionnaireNotValid = {
			appealId,
			titleText: `LPA Questionnaire is ${String(validationOutcome)}`,
			html: '',
			pageComponents: bannerContentPageComponents
		};
	}

	return buildNotificationBanners(session, 'lpaQuestionnaire', appealId);
}

/**
 *
 * @param {NotValidReasonOption[]} reasonOptions
 * @param {BodyValidationOutcome} [bodyValidationOutcome]
 * @param {SessionValidationOutcome} [sessionValidationOutcome]
 * @param {import('@pins/appeals.api').Appeals.ValidationOutcomeResponse | null} [existingValidationOutcome]
 * @returns {import('../../appeals.types.js').CheckboxItemParameter[]}
 */
export function mapIncompleteReasonOptionsToCheckboxItemParameters(
	reasonOptions,
	bodyValidationOutcome,
	sessionValidationOutcome,
	existingValidationOutcome
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
		sessionValidationOutcome
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

/**
 *
 * @param {string} appealId
 * @param {string} appealReference
 * @returns {PageContent}
 */
export function reviewCompletePage(appealId, appealReference) {
	/** @type {PageContent} */
	const pageContent = {
		title: 'LPA questionnaire complete',
		pageComponents: [
			{
				type: 'panel',
				parameters: {
					titleText: 'LPA questionnaire complete',
					headingLevel: 1,
					html: `Appeal reference<br><strong>${appealShortReference(appealReference)}</strong>`
				}
			},
			{
				type: 'html',
				parameters: {
					html: '<p class="govuk-body">The relevant parties have been informed.</p>'
				}
			},
			{
				type: 'html',
				parameters: {
					html: `<p class="govuk-body"><a class="govuk-link" href="/appeals-service/appeal-details/${appealId}">Go back to case details</a></p>`
				}
			}
		]
	};

	return pageContent;
}

/**
 *
 * @param {Appeal} appealDetails
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @returns {PageComponent[]}
 */
function generateCaseTypeSpecificComponents(appealDetails, mappedAppealDetails, mappedLPAQData) {
	switch (appealDetails.appealType) {
		case APPEAL_TYPE.D:
			return generateHASLpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
		case APPEAL_TYPE.W:
			if (isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78)) {
				return generateS78LpaQuestionnaireComponents(mappedLPAQData, mappedAppealDetails);
			} else {
				throw new Error('Feature flag inactive for S78');
			}
		default:
			throw new Error('Invalid appealType, unable to generate display page');
	}
}

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
const generateHASLpaQuestionnaireComponents = (mappedLPAQData, mappedAppealDetails) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			attributes: {
				id: 'constraints-summary'
			},
			card: {
				title: {
					text: '1. Constraints, designations and other issues'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.isCorrectAppealType?.display.summaryListItem,
				mappedLPAQData.lpaq?.affectsListedBuildingDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.conservationAreaMap?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteWithinGreenBelt?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '2. Notifying relevant parties of the application'
				}
			},
			attributes: {
				id: 'notifications-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.notifyingParties?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.lettersToNeighbours?.display.summaryListItem,
				mappedLPAQData.lpaq?.pressAdvert?.display.summaryListItem,
				mappedLPAQData.lpaq?.notificationMethods?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '3. Consultation responses and representations'
				}
			},
			attributes: {
				id: 'representations-summary'
			},
			rows: [mappedLPAQData.lpaq?.representations?.display.summaryListItem].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '4. Planning officer’s report and supplementary documents'
				}
			},
			attributes: {
				id: 'supplementary-documents-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.officersReport?.display.summaryListItem,
				mappedLPAQData.lpaq?.plansDrawings?.display.summaryListItem,
				mappedLPAQData.lpaq?.developmentPlanPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.supplementaryPlanning?.display.summaryListItem,
				mappedLPAQData.lpaq?.emergingPlan?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '5. Site access'
				}
			},
			attributes: {
				id: 'site-access-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.siteAccess?.display.summaryListItem,
				mappedAppealDetails.appeal.lpaNeighbouringSites?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaHealthAndSafety?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '6. Appeal process'
				}
			},
			attributes: {
				id: 'appeal-process-summary'
			},
			rows: [
				mappedLPAQData.lpaq?.otherAppeals?.display.summaryListItem,
				mappedLPAQData.lpaq?.extraConditions?.display.summaryListItem
			].filter(isDefined)
		}
	});

	return pageComponents;
};

/**
 *
 * @param {{lpaq: MappedInstructions}} mappedLPAQData
 * @param {{appeal: MappedInstructions}} mappedAppealDetails
 * @returns {PageComponent[]}
 */
const generateS78LpaQuestionnaireComponents = (mappedLPAQData, mappedAppealDetails) => {
	/** @type {PageComponent[]} */
	const pageComponents = [];

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			attributes: {
				id: 'constraints-summary'
			},
			card: {
				title: {
					text: '1. Constraints, designations and other issues'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.isCorrectAppealType?.display.summaryListItem,
				mappedLPAQData.lpaq?.affectsListedBuildingDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.affectsScheduledMonument?.display.summaryListItem,
				mappedLPAQData.lpaq?.conservationAreaMap?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasProtectedSpecies?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteWithinGreenBelt?.display.summaryListItem,
				mappedLPAQData.lpaq?.isAonbNationalLandscape?.display.summaryListItem,
				mappedLPAQData.lpaq?.treePreservationPlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.isGypsyOrTravellerSite?.display.summaryListItem,
				mappedLPAQData.lpaq?.definitiveMapStatement?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '2. Environmental impact assessment'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.eiaEnvironmentalImpactSchedule?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaColumnTwoThreshold?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaRequiresEnvironmentalStatement?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaEnvironmentalStatement?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaScreeningOpinion?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaScreeningDirection?.display.summaryListItem,
				mappedLPAQData.lpaq?.eiaDevelopmentDescription?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '3. Notifying relevant parties of the application'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.notifyingParties?.display.summaryListItem,
				mappedLPAQData.lpaq?.siteNotice?.display.summaryListItem,
				mappedLPAQData.lpaq?.lettersToNeighbours?.display.summaryListItem,
				mappedLPAQData.lpaq?.pressAdvert?.display.summaryListItem,
				mappedLPAQData.lpaq?.notificationMethods?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '4. Consultation responses and representations'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.representations?.display.summaryListItem,
				mappedLPAQData.lpaq?.consultationResponses?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '5. Planning officer’s report and supplementary documents'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.officersReport?.display.summaryListItem,
				mappedLPAQData.lpaq?.plansDrawings?.display.summaryListItem,
				mappedLPAQData.lpaq?.developmentPlanPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.supplementaryPlanning?.display.summaryListItem,
				mappedLPAQData.lpaq?.emergingPlan?.display.summaryListItem,
				mappedLPAQData.lpaq?.otherRelevantPolicies?.display.summaryListItem,
				mappedLPAQData.lpaq?.hasCommunityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.communityInfrastructureLevy?.display.summaryListItem,
				mappedLPAQData.lpaq?.isInfrastructureLevyFormallyAdopted?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyAdoptedDate?.display.summaryListItem,
				mappedLPAQData.lpaq?.infrastructureLevyExpectedDate?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '6. Site access'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.siteAccess?.display.summaryListItem,
				mappedAppealDetails.appeal.lpaNeighbouringSites?.display.summaryListItem,
				mappedLPAQData.lpaq?.lpaHealthAndSafety?.display.summaryListItem
			].filter(isDefined)
		}
	});

	pageComponents.push({
		/** @type {'summary-list'} */
		type: 'summary-list',
		parameters: {
			card: {
				title: {
					text: '7. Appeal process'
				}
			},
			rows: [
				mappedLPAQData.lpaq?.procedurePreference?.display.summaryListItem,
				mappedLPAQData.lpaq?.procedurePreferenceDetails?.display.summaryListItem,
				mappedLPAQData.lpaq?.procedurePreferenceDuration?.display.summaryListItem,
				mappedLPAQData.lpaq?.otherAppeals?.display.summaryListItem,
				mappedLPAQData.lpaq?.extraConditions?.display.summaryListItem
			].filter(isDefined)
		}
	});

	return pageComponents;
};
