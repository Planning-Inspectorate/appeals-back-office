import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { getTeamFromAppealId } from '#appeals/appeal-details/update-case-team/update-case-team.service.js';
import { addressToString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import { changeLpaListPage, checkAndConfirmPage } from './local-planning-authority.mapper.js';
import { getLpaList, postChangeLpaRequest } from './local-planning-authority.service.js';

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeLpa = async (request, response) => {
	return await renderChangeLpa(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeLpa = async (request, response) => {
	try {
		const { localPlanningAuthority } = request.body;
		const { errors, params, session } = request;
		session.localPlanningAuthority = localPlanningAuthority;
		const appealId = Number(params.appealId);

		if (errors) {
			return renderChangeLpa(request, response);
		}

		return response.redirect(
			addBackLinkQueryToUrl(
				request,
				`/appeals-service/appeal-details/${appealId}/change-appeal-details/local-planning-authority/check-details`
			)
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeLpa = async (request, response) => {
	try {
		const { currentAppeal, apiClient, errors } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const lpaList = await getLpaList(apiClient);
		const backlinkUrl = generateBacklinkUrl(request.originalUrl);

		const lpa = lpaList.find((lpa) => lpa.name === appellantCaseData?.localPlanningDepartment);

		const mappedPageContent = changeLpaListPage(
			currentAppeal,
			lpa?.id,
			lpaList,
			backlinkUrl,
			errors
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getCheckDetails = async (request, response) => {
	return await renderCheckDetails(request, response);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCheckDetails = async (request, response) => {
	try {
		const { errors, session, apiClient, currentAppeal } = request;
		const appealId = currentAppeal.appealId;
		if (errors) {
			return response.redirect(
				`/appeals-service/appeal-details/${appealId}/change-appeal-details/local-planning-authority/check-details`
			);
		}

		await postChangeLpaRequest(apiClient, appealId, session.localPlanningAuthority);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'lpaChanged',
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
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderCheckDetails = async (request, response) => {
	try {
		const { currentAppeal, apiClient, errors, session } = request;

		const lpaList = await getLpaList(apiClient);
		const backlinkUrl = generateBacklinkUrl(request.originalUrl);

		const lpa = lpaList.find((lpa) => lpa.id.toString() === session.localPlanningAuthority);
		if (!lpa) {
			return response.status(404).render('app/404.njk');
		}

		const { email: assignedTeamEmail } = await getTeamFromAppealId(
			apiClient,
			currentAppeal.appealId
		);

		const appellantPreviewPersonalisation = {
			appeal_reference_number: currentAppeal.appealReference,
			site_address: addressToString(currentAppeal.appealSite),
			lpa_reference: currentAppeal.planningApplicationReference,
			team_email_address: assignedTeamEmail,
			local_planning_authority: lpa?.name
		};
		const lpaPreviewPersonalisation = {
			appeal_reference_number: currentAppeal.appealReference,
			site_address: addressToString(currentAppeal.appealSite),
			lpa_reference: currentAppeal.planningApplicationReference,
			team_email_address: assignedTeamEmail,
			local_planning_authority: lpa?.name
		};

		const appellantPreview = await generateNotifyPreview(
			request.apiClient,
			'lpa-changed-appellant.content.md',
			appellantPreviewPersonalisation
		);
		const lpaPreview = await generateNotifyPreview(
			request.apiClient,
			'lpa-removed.content.md',
			lpaPreviewPersonalisation
		);
		const emailPreviews = {
			appellant: appellantPreview.renderedHtml,
			lpa: lpaPreview.renderedHtml
		};
		const mappedPageContent = await checkAndConfirmPage(
			currentAppeal,
			lpa,
			backlinkUrl,
			emailPreviews
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContent,
			errors
		});
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 *
 * @param {string} currentUrl
 * @returns {string}
 */
const generateBacklinkUrl = (currentUrl) => {
	return currentUrl.split('/').slice(0, -2).join('/');
};
