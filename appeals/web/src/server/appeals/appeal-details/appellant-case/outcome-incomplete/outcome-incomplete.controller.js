import {
	calculateIncompleteDueDate,
	dateISOStringToDayMonthYearHourMinute,
	getTodaysISOString
} from '#lib/dates.js';
import logger from '#lib/logger.js';
import { objectContainsAllKeys } from '#lib/object-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { getNotValidReasonsTextFromRequestBody } from '#lib/validation-outcome-reasons-formatter.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { isAfter, parseISO } from 'date-fns';
import * as appellantCaseService from '../../appellant-case/appellant-case.service.js';
import { isAnyEnforcementAppealType } from '../appellant-case.controller.js';
import {
	mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters,
	updateDueDatePage
} from '../appellant-case.mapper.js';
import {
	checkDetailsAndMarkEnforcementAsIncomplete,
	enforcementMissingDocumentsPage,
	mapIncompleteReasonPage,
	updateFeeReceiptDueDatePage
} from './outcome-incomplete.mapper.js';
import * as outcomeIncompleteService from './outcome-incomplete.service.js';
import { getAppellantCaseEnforcementMissingDocuments } from './outcome-incomplete.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderIncompleteReason = async (request, response) => {
	const {
		errors,
		body,
		currentAppeal: { appealId, appealReference, appellantCaseId, appealType }
	} = request;

	if (appellantCaseId === null || appellantCaseId === undefined) {
		return response.status(404).render('app/404.njk');
	}

	const [appellantCaseResponse, incompleteReasonOptions] = await Promise.all([
		appellantCaseService
			.getAppellantCaseFromAppealId(request.apiClient, appealId, appellantCaseId)
			.catch((error) => logger.error(error)),
		appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
			request.apiClient,
			'incomplete'
		)
	]);

	if (!appellantCaseResponse) {
		return response.status(404).render('app/404.njk');
	}

	const { webAppellantCaseReviewOutcome } = request.session;

	if (incompleteReasonOptions) {
		const filteredReasons = isAnyEnforcementAppealType(appealType)
			? appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING
				? incompleteReasonOptions.filter(
						(reason) => reason.id > 9 && reason.id !== 11 && reason.id !== 14
					)
				: incompleteReasonOptions.filter((reason) => reason.id > 9 && reason.id !== 11)
			: incompleteReasonOptions.filter((reason) => reason.id <= 10 || reason.id === 11);
		const mappedIncompleteReasonOptions =
			mapInvalidOrIncompleteReasonOptionsToCheckboxItemParameters(
				'incomplete',
				filteredReasons,
				body,
				webAppellantCaseReviewOutcome,
				appellantCaseResponse.validation,
				errors
			);

		const pageContent = mapIncompleteReasonPage(
			appealId,
			appealReference,
			appealType,
			mappedIncompleteReasonOptions,
			errors ? errors['incompleteReason']?.msg : undefined
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}

	return response.status(500).render('app/500.njk');
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderUpdateDueDate = async (request, response) => {
	const { body, currentAppeal, errors } = request;
	let dueDateDay, dueDateMonth, dueDateYear;

	if (request.session.webAppellantCaseReviewOutcome?.updatedDueDate) {
		dueDateDay = request.session.webAppellantCaseReviewOutcome.updatedDueDate.day;
		dueDateMonth = request.session.webAppellantCaseReviewOutcome.updatedDueDate.month;
		dueDateYear = request.session.webAppellantCaseReviewOutcome.updatedDueDate.year;
	} else {
		const appellantCase = await appellantCaseService
			.getAppellantCaseFromAppealId(
				request.apiClient,
				currentAppeal.appealId,
				currentAppeal.appellantCaseId
			)
			.catch((error) => logger.error(error));

		if (appellantCase?.applicationDecisionDate) {
			const defaultDueDate = calculateIncompleteDueDate(
				appellantCase.applicationDecisionDate,
				currentAppeal.appealType
			);

			if (defaultDueDate && isAfter(defaultDueDate, parseISO(getTodaysISOString()))) {
				const processedDueDate = dateISOStringToDayMonthYearHourMinute(
					defaultDueDate.toISOString()
				);

				dueDateDay = processedDueDate.day;
				dueDateMonth = processedDueDate.month;
				dueDateYear = processedDueDate.year;
			}
		}
	}
	if (objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		dueDateDay = request.body['due-date-day'];
		dueDateMonth = request.body['due-date-month'];
		dueDateYear = request.body['due-date-year'];
	}

	let backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/`;
	if (currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
		if (
			request.session.webAppellantCaseReviewOutcome?.missingDocuments &&
			request.session.webAppellantCaseReviewOutcome?.feeReceiptDueDate
		) {
			backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/receipt-due-date`;
		} else if (request.session.webAppellantCaseReviewOutcome?.missingDocuments) {
			backLinkUrl = `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/missing-documents`;
		}
	}
	const mappedPageContent = updateDueDatePage(
		currentAppeal,
		backLinkUrl,
		errors,
		dueDateDay,
		dueDateMonth,
		dueDateYear,
		!!errors
	);

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getIncompleteReason = async (request, response) => {
	renderIncompleteReason(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postIncompleteReason = async (request, response) => {
	const {
		errors,
		currentAppeal: { appealId, appealType }
	} = request;

	if (errors) {
		return renderIncompleteReason(request, response);
	}
	try {
		/** @type {import('../appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
		request.session.webAppellantCaseReviewOutcome = {
			...request.session.webAppellantCaseReviewOutcome,
			appealId,
			validationOutcome: 'incomplete',
			reasons: request.body.incompleteReason,
			reasonsText: getNotValidReasonsTextFromRequestBody(request.body, 'incompleteReason')
		};

		if (isAnyEnforcementAppealType(appealType)) {
			const redirectMap = {
				10: 'date',
				12: 'missing-documents',
				13: 'grounds-facts-check',
				14: 'receipt-due-date'
			};
			const redirectPriority = ['12', '13', '14', '10'];
			const redirectId = redirectPriority.find((id) => request.body.incompleteReason.includes(id));

			if (!redirectId) {
				logger.error('Something went wrong when completing appellant case review');
				return response.status(500).render('app/500.njk');
			}

			// @ts-ignore
			const redirectRoute = redirectMap[redirectId];

			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/${redirectRoute}`
			);
		}
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getUpdateDueDate = async (request, response) => {
	renderUpdateDueDate(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postUpdateDueDate = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		body,
		currentAppeal: { appealId, appealType }
	} = request;

	if (!objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		return response.status(500).render('app/500.njk');
	}

	if (request.errors) {
		return renderUpdateDueDate(request, response);
	}

	try {
		const updatedDueDateDay = parseInt(body['due-date-day'], 10);
		const updatedDueDateMonth = parseInt(body['due-date-month'], 10);
		const updatedDueDateYear = parseInt(body['due-date-year'], 10);

		if (
			Number.isNaN(updatedDueDateDay) ||
			Number.isNaN(updatedDueDateMonth) ||
			Number.isNaN(updatedDueDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		request.session.webAppellantCaseReviewOutcome.updatedDueDate = {
			day: updatedDueDateDay,
			month: updatedDueDateMonth,
			year: updatedDueDateYear
		};

		if (appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
			);
		} else if (appealType === APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/check-details`
			);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/check-your-answers`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('@pins/express').ValidationErrors} [apiErrors]
 */
export const renderMissingDocumentsPage = async (request, response, apiErrors) => {
	const { errors = apiErrors, body, currentAppeal, session } = request;

	if (typeof currentAppeal?.appellantCaseId !== 'number') {
		return response.status(404).render('app/404.njk');
	}

	const missingDocumentOptions = await getAppellantCaseEnforcementMissingDocuments(
		request.apiClient
	);
	if (missingDocumentOptions) {
		const pageContent = enforcementMissingDocumentsPage(
			currentAppeal.appealId,
			currentAppeal.appealReference,
			// @ts-ignore
			missingDocumentOptions.map((option) => {
				if (errors) {
					const selected = body.missingDocuments?.includes(option.id.toString()) ?? false;
					return {
						...option,
						selected,
						text: (selected && body[`missingDocuments-${option.id}`]) ?? ''
					};
				}
				const missingDocumentsSession = Array.isArray(
					session?.webAppellantCaseReviewOutcome?.missingDocuments
				)
					? session?.webAppellantCaseReviewOutcome?.missingDocuments
					: [session?.webAppellantCaseReviewOutcome?.missingDocuments];
				const missingDocument = missingDocumentsSession.find(
					(/** @type {{missingDocument:string}} */ missingDocument) => {
						const id = Number(missingDocument);
						const optionId = option.id;
						return id === optionId;
					}
				);
				const selected = missingDocument ?? false;
				return {
					...option,
					selected,
					text:
						(selected &&
							session?.webAppellantCaseReviewOutcome?.missingDocumentsText[missingDocument]) ??
						''
				};
			}),
			errors
		);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}

	return response.status(500).render('app/500.njk');
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getMissingDocuments = async (request, response) => {
	renderMissingDocumentsPage(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postMissingDocuments = async (request, response) => {
	const {
		currentAppeal: { appealId },
		body,
		errors,
		session
	} = request;

	/** @type {import('../appellant-case.types.js').AppellantCaseSessionValidationOutcome} */
	session.webAppellantCaseReviewOutcome = {
		...session.webAppellantCaseReviewOutcome,
		missingDocuments: body.missingDocuments,
		missingDocumentsText: body.missingDocuments
			? getNotValidReasonsTextFromRequestBody(request.body, 'missingDocuments')
			: undefined
	};

	if (errors) {
		return renderMissingDocumentsPage(request, response);
	}

	const redirectMap = {
		13: 'grounds-facts-check',
		14: 'receipt-due-date'
	};
	const reasons = session.webAppellantCaseReviewOutcome.reasons;
	const reasonsArray = Array.isArray(reasons) ? reasons : [reasons];
	const redirectId = reasonsArray.find((/** @type { string } */ reason) => reason in redirectMap);
	if (redirectId) {
		return response.redirect(
			// @ts-ignore
			`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/${redirectMap[redirectId]}`
		);
	}

	return response.redirect(
		`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
	);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderReceiptFeeDueDate = async (request, response) => {
	const { body, currentAppeal, errors } = request;
	let dueDateDay, dueDateMonth, dueDateYear;

	if (request.session.webAppellantCaseReviewOutcome?.feeReceiptDueDate) {
		dueDateDay = request.session.webAppellantCaseReviewOutcome.feeReceiptDueDate.day;
		dueDateMonth = request.session.webAppellantCaseReviewOutcome.feeReceiptDueDate.month;
		dueDateYear = request.session.webAppellantCaseReviewOutcome.feeReceiptDueDate.year;
	}

	if (objectContainsAllKeys(body, ['due-date-day', 'due-date-month', 'due-date-year'])) {
		dueDateDay = request.body['due-date-day'];
		dueDateMonth = request.body['due-date-month'];
		dueDateYear = request.body['due-date-year'];
	}

	const backLinkUrl = request.session.webAppellantCaseReviewOutcome?.missingDocuments?.length
		? `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/missing-documents`
		: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/`;

	const mappedPageContent = updateFeeReceiptDueDatePage(
		currentAppeal,
		backLinkUrl,
		errors,
		dueDateDay,
		dueDateMonth,
		dueDateYear
	);

	return response.status(200).render('appeals/appeal/update-date.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getRecieptDueDate = async (request, response) => {
	return renderReceiptFeeDueDate(request, response);
};

/** @type {import('@pins/express').RequestHandler<Response>} */
export const postReceiptDueDate = async (request, response) => {
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	const {
		body,
		currentAppeal: { appealId }
	} = request;

	if (
		!objectContainsAllKeys(body, [
			'fee-receipt-due-date-day',
			'fee-receipt-due-date-month',
			'fee-receipt-due-date-year'
		])
	) {
		return response.status(500).render('app/500.njk');
	}

	if (request.errors) {
		return renderReceiptFeeDueDate(request, response);
	}

	try {
		const feeReceiptDueDateDay = parseInt(body['fee-receipt-due-date-day'], 10);
		const feeReceiptDueDateMonth = parseInt(body['fee-receipt-due-date-month'], 10);
		const feeReceiptDueDateYear = parseInt(body['fee-receipt-due-date-year'], 10);

		if (
			Number.isNaN(feeReceiptDueDateDay) ||
			Number.isNaN(feeReceiptDueDateMonth) ||
			Number.isNaN(feeReceiptDueDateYear)
		) {
			return response.status(500).render('app/500.njk');
		}

		request.session.webAppellantCaseReviewOutcome.feeReceiptDueDate = {
			day: feeReceiptDueDateDay,
			month: feeReceiptDueDateMonth,
			year: feeReceiptDueDateYear
		};

		const reasons = request.session.webAppellantCaseReviewOutcome.reasons;
		const reasonsArray = Array.isArray(reasons) ? reasons : [reasons];
		if (reasonsArray.some((/** @type { string } */ reason) => ['12', '13'].includes(reason))) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/date`
			);
		}
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/appellant-case/incomplete/check-details-and-mark-enforcement-as-incomplete`
		);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing appellant case review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCheckDetailsAndMarkEnforcementAsIncomplete = async (request, response) => {
	return renderCheckDetailsAndMarkEnforcementAsIncomplete(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckDetailsAndMarkEnforcementAsIncomplete = async (request, response) => {
	try {
		if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
			return response.status(500).render('app/500.njk');
		}

		const enforcementInvalidReasonOptions =
			await appellantCaseService.getAppellantCaseEnforcementInvalidReasonOptions(request.apiClient);

		const incompleteReasonOptions =
			request.session?.webAppellantCaseReviewOutcome?.validationOutcome === 'incomplete'
				? await appellantCaseService.getAppellantCaseNotValidReasonOptionsForOutcome(
						request.apiClient,
						'incomplete'
					)
				: [];

		const missingDocuments =
			request.session?.webAppellantCaseReviewOutcome?.validationOutcome === 'incomplete'
				? await outcomeIncompleteService.getAppellantCaseEnforcementMissingDocuments(
						request.apiClient
					)
				: [];

		const mappedPageContent = checkDetailsAndMarkEnforcementAsIncomplete(
			request.currentAppeal,
			enforcementInvalidReasonOptions,
			incompleteReasonOptions,
			missingDocuments,
			request.session
		);

		return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
			pageContent: mappedPageContent
		});
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing enforcement invalid review'
		);

		return response.status(500).render('app/500.njk');
	}
};

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const postCheckDetailsAndMarkEnforcementAsIncomplete = async (request, response) => {
	const { currentAppeal } = request;
	console.log(request.session.webAppellantCaseReviewOutcome);
	if (!objectContainsAllKeys(request.session, 'webAppellantCaseReviewOutcome')) {
		return response.status(500).render('app/500.njk');
	}

	const { webAppellantCaseReviewOutcome } = request.session;

	try {
		await outcomeIncompleteService.setReviewOutcomeForEnforcementNoticeAppellantCase(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId,
			{
				...webAppellantCaseReviewOutcome
			}
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appellantCaseInvalidOrIncomplete',
			appealId: currentAppeal.appealId,
			text: `Appeal marked as ${webAppellantCaseReviewOutcome.validationOutcome}`
		});

		delete request.session.webAppellantCaseReviewOutcome;

		return response.redirect(`/appeals-service/appeal-details/${currentAppeal.appealId}`);
	} catch (error) {
		logger.error(
			error,
			error instanceof Error
				? error.message
				: 'Something went wrong when completing enforcement invalid review'
		);

		return response.status(500).render('app/500.njk');
	}
};
