import logger from '#lib/logger.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { getAppellantCaseEnforcementGroundsMismatch } from '../outcome-incomplete/outcome-incomplete.service.js';
import { groundsFactsCheckPage } from './grounds-facts-check.mapper.js';

/**
 * @typedef { import('@pins/appeals.api').Appeals.ReasonOption } ReasonOption
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getGroundsFactsCheck = async (request, response) => {
	return renderGroundsFactsCheck(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderGroundsFactsCheck = async (request, response) => {
	try {
		const { errors, currentAppeal, body, session } = request;

		/** @type {ReasonOption[]} */
		const groundsMismatchFactsList = await getAppellantCaseEnforcementGroundsMismatch(
			request.apiClient
		);
		const filteredGroundsMismatchFactsList =
			currentAppeal.appealType === APPEAL_TYPE.ENFORCEMENT_NOTICE
				? groundsMismatchFactsList.filter((/** @type {{ id: number; }} */ ground) => ground.id <= 7)
				: groundsMismatchFactsList;

		const selectedGrounds = filteredGroundsMismatchFactsList.map((option) => {
			if (errors) {
				const selected = body.groundsFacts?.includes(option.id.toString()) ?? false;
				return {
					...option,
					selected,
					text: (selected && body[`groundsFacts-${option.id}`]) ?? ''
				};
			}
			const groundsFactsSession = Array.isArray(
				session?.webAppellantCaseReviewOutcome?.enforcementGroundsMismatchText
			)
				? session?.webAppellantCaseReviewOutcome?.enforcementGroundsMismatchText
				: [session?.webAppellantCaseReviewOutcome?.enforcementGroundsMismatchText];
			const groundsFacts = groundsFactsSession?.find((/** @type {{ id: any; }} */ groundsFacts) => {
				const id = Number(groundsFacts?.id);
				const optionId = option.id;
				return id === optionId;
			});
			const selected = groundsFacts ?? false;
			const text = groundsFacts ? groundsFacts.text[0] : '';
			return {
				...option,
				selected,
				text: (selected && text) ?? ''
			};
		});
		const backLinkUrl = request.session.webAppellantCaseReviewOutcome?.missingDocuments
			? `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete/missing-documents`
			: `/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case/incomplete`;

		const mappedPageContents = groundsFactsCheckPage(
			currentAppeal,
			selectedGrounds,
			backLinkUrl,
			errors && typeof errors === 'object' ? errors.groundsFactsCheck?.msg : undefined
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postGroundsFactsCheck = async (request, response) => {
	if (request.errors) {
		return renderGroundsFactsCheck(request, response);
	}
	const {
		params: { appealId },
		session
	} = request;

	try {
		const groundsMismatchFactsList = await getAppellantCaseEnforcementGroundsMismatch(
			request.apiClient
		);
		request.session.webAppellantCaseReviewOutcome = {
			...request.session.webAppellantCaseReviewOutcome,
			enforcementGroundsMismatchText: extractGroundsMismatchFacts(request, groundsMismatchFactsList)
		};

		const redirectMap = {
			10: 'date',
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
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {any[]} groundsMismatchFactsList
 * @returns {Object}
 */
const extractGroundsMismatchFacts = (request, groundsMismatchFactsList) => {
	if (request.body?.groundsFacts.length === 1) {
		const ground = request.body?.groundsFacts[0];
		const groundName = groundsMismatchFactsList.find(
			(/** @type {{ id: string; }} */ item) => item.id.toString() === ground
		)?.name;
		return [
			{
				id: Number(ground),
				text: [request.body[`groundsFacts-${ground}`]],
				name: groundName
			}
		];
	} else {
		return request.body?.groundsFacts.map((/** @type {any} */ ground) => {
			const groundName = groundsMismatchFactsList.find(
				(/** @type {{ id: string; }} */ item) => item.id.toString() === ground
			)?.name;
			return {
				id: Number(ground),
				text: [request.body[`groundsFacts-${ground}`]],
				name: groundName
			};
		});
	}
};
