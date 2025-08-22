import logger from '#lib/logger.js';
import {
	getAppealTypes,
	postAppealChangeRequest,
	postAppealTransferRequest,
	postAppealTransferConfirmation
} from './change-appeal-type.service.js';
import {
	appealTypePage,
	changeAppealFinalDatePage,
	resubmitAppealPage,
	addHorizonReferencePage,
	checkTransferPage,
	invalidChangeAppealType,
	changeAppealMarkAppealInvalidPage
} from './change-appeal-type.mapper.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { dayMonthYearHourMinuteToISOString } from '#lib/dates.js';
import { getBackLinkUrlFromQuery } from '#lib/url-utilities.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
// import featureFlags from '#common/feature-flags.js';
// import { APPEAL_TYPE_CHANGE_APPEALS } from '@pins/appeals/constants/common.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

/** @typedef {import('@pins/express/types/express.js').Request} Request */
/** @typedef {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} Response */
/** @typedef {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} ChangeAppealTypeRequest */

/**
 * @param {Request} request
 * @param {Response} response
 */
export const getAppealType = async (request, response) => {
	return renderAppealType(request, response);
};

/**
 * @param {Request} request
 * @param {Response} response
 */
export const postAppealType = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { appealType: appealTypeId } = request.body;
		const { errors } = request;

		if (errors) {
			return renderAppealType(request, response);
		}

		/** @type {ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			appealId,
			...request.session.changeAppealType,
			appealTypeId
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/resubmit`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {Request} request
 * @param {Response} response
 */
const renderAppealType = async (request, response) => {
	const { errors } = request;
	const appealId = request.params.appealId;
	const appealData = request.currentAppeal;
	const appealTypes = await getAppealTypes(request.apiClient);

	if (!appealTypes) {
		throw new Error('error retrieving Appeal Types');
	}

	if (
		request.session?.changeAppealType?.appealId &&
		request.session?.changeAppealType?.appealId !== appealId
	) {
		request.session.changeAppealType = {};
	}

	// CAS Planning, CAS Advert, Advertisement
	/** @type {Array<string>} */
	const filterThese = [
		APPEAL_TYPE.CAS_ADVERTISEMENT,
		APPEAL_TYPE.CAS_PLANNING,
		APPEAL_TYPE.ADVERTISEMENT
	];
	const appealTypeIdsToFilter = appealTypes
		.filter((appealType) => filterThese.includes(appealType.type))
		.map((appealType) => appealType.id);

	request.session.changeAppealType = {
		...request.session.changeAppealType,
		appealTypeIdsToFilter
	};

	const validAppealChangeTypeStatuses = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION
	];

	if (validAppealChangeTypeStatuses.includes(appealData.appealStatus)) {
		const mappedPageContent = appealTypePage(
			appealData,
			appealTypes,
			request.session.changeAppealType,
			errors ? errors['appealType'].msg : undefined
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} else {
		const pageContent = invalidChangeAppealType(appealData);

		return response.status(200).render('patterns/display-page.pattern.njk', {
			pageContent,
			errors
		});
	}
};

/**
 * @param {Request} request
 * @param {Response} response
 */
export const getResubmitAppeal = async (request, response) => {
	return renderResubmitAppeal(request, response);
};

/**
 * @param {Request} request
 * @param {Response} response
 */
export const postResubmitAppeal = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { appealResubmit } = request.body;
		const { errors } = request;

		if (errors) {
			return renderResubmitAppeal(request, response);
		}

		const isResubmit = appealResubmit === 'true';

		if (!isResubmit) {
			/** @type {ChangeAppealTypeRequest} */
			const { appealTypeId, appealTypeIdsToFilter } = request.session.changeAppealType;
			// if (featureFlags.isFeatureActive('') && appealTypeIdsToFilter?.includes(appealTypeId)) {
			if (appealTypeIdsToFilter?.includes(appealTypeId)) {
				return response.redirect(
					`/appeals-service/appeal-details/${appealId}/change-appeal-type/mark-appeal-invalid`
				);
			}

			await postAppealTransferRequest(request.apiClient, appealId, parseInt(appealTypeId, 10));

			return response.redirect(`/appeals-service/appeal-details/${appealId}`);
		}

		/** @type {import('./change-appeal-type.types.js').ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			...request.session.changeAppealType,
			resubmit: isResubmit
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/mark-appeal-invalid`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
const renderResubmitAppeal = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;
	const mappedPageContent = resubmitAppealPage(
		appealData,
		request.session.changeAppealType,
		errors ? errors['appealResubmit'].msg : undefined
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const getChangeAppealFinalDate = async (request, response) => {
	return renderChangeAppealFinalDate(request, response);
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const postChangeAppealFinalDate = async (request, response) => {
	try {
		const { appealId } = request.params;
		const {
			'change-appeal-final-date-day': day,
			'change-appeal-final-date-month': month,
			'change-appeal-final-date-year': year
		} = request.body;
		const { errors } = request;

		if (errors) {
			return renderChangeAppealFinalDate(request, response);
		}
		const appealTypeId = parseInt(request.session.changeAppealType.appealTypeId, 10);

		await postAppealChangeRequest(
			request.apiClient,
			appealId,
			appealTypeId,
			dayMonthYearHourMinuteToISOString({
				year,
				month,
				day
			})
		);

		request.session.changeAppealType = {};

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'appealTypeChanged',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
const renderChangeAppealFinalDate = async (request, response) => {
	const { errors } = request;
	const {
		'change-appeal-final-date-day': changeDay,
		'change-appeal-final-date-month': changeMonth,
		'change-appeal-final-date-year': changeYear
	} = request.body;

	const appealData = request.currentAppeal;

	const mappedPageContent = changeAppealFinalDatePage(
		appealData,
		changeDay,
		changeMonth,
		changeYear,
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const getAddHorizonReference = async (request, response) => {
	return renderAddHorizonReference(request, response);
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
const renderAddHorizonReference = async (request, response) => {
	const { errors } = request;

	const appealData = request.currentAppeal;

	const mappedPageContent = addHorizonReferencePage(appealData, getBackLinkUrlFromQuery(request));

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const postAddHorizonReference = async (request, response) => {
	try {
		const {
			errors,
			params: { appealId },
			body: { 'horizon-reference': horizonReference }
		} = request;

		if (request.body.problemWithHorizon) {
			return response.status(500).render('app/500.njk', {
				titleCopy: 'Sorry, there is a problem with Horizon',
				additionalCtas: [
					{
						href: `/appeals-service/appeal-details/${appealId}`,
						text: 'Go back to case overview'
					}
				],
				hideDefaultCta: true
			});
		}

		if (errors) {
			return renderAddHorizonReference(request, response);
		}

		/** @type {ChangeAppealTypeRequest} */
		request.session.changeAppealType = {
			...request.session.changeAppealType,
			transferredAppealHorizonReference: horizonReference
		};

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/check-transfer`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const getCheckTransfer = async (request, response) => {
	return renderCheckTransfer(request, response);
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
const renderCheckTransfer = async (request, response) => {
	if (
		!('changeAppealType' in request.session) ||
		!('transferredAppealHorizonReference' in request.session.changeAppealType)
	) {
		return response.status(500).render('app/500.njk');
	}

	const { errors } = request;

	const appealData = request.currentAppeal;
	const mappedPageContent = await checkTransferPage(
		request.apiClient,
		appealData,
		request.session.changeAppealType.transferredAppealHorizonReference
	);

	return response.status(200).render('patterns/check-and-confirm-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const postCheckTransfer = async (request, response) => {
	try {
		if (
			!('changeAppealType' in request.session) ||
			!('transferredAppealHorizonReference' in request.session.changeAppealType)
		) {
			return response.status(500).render('app/500.njk');
		}

		const {
			errors,
			params: { appealId }
		} = request;

		if (errors) {
			return renderCheckTransfer(request, response);
		}

		await postAppealTransferConfirmation(
			request.apiClient,
			appealId,
			request.session.changeAppealType.transferredAppealHorizonReference
		);

		/** @type {ChangeAppealTypeRequest} */
		request.session.changeAppealType = {};

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'horizonReferenceAdded',
			appealId
		});

		return response.redirect(`/appeals-service/appeal-details/${appealId}`);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const markAppealInvalid = async (request, response) => {
	const {
		errors,
		params: { appealId },
		session: { changeAppealType }
	} = request;
	console.log(changeAppealType);
	const appealData = request.currentAppeal;
	const appealTypes = await getAppealTypes(request.apiClient);
	const changeAppeal = appealTypes.find(
		(appealType) => appealType.id === parseInt(changeAppealType.appealTypeId)
	);

	if (!changeAppeal) {
		logger.error('error');
		return response.status(500).render('app/500.njk');
	}

	const mappedPageContent = changeAppealMarkAppealInvalidPage(
		appealId,
		appealData.appealType,
		changeAppeal.type
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 *
 * @param {Request} request
 * @param {Response} response
 */
export const postMarkAppealInvalid = (request, response) => {
	try {
		const { appealId } = request.params;
		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/change-appeal-type/change-appeal-final-date`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
