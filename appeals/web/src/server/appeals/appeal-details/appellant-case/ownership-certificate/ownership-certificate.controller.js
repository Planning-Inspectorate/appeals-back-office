import logger from '#lib/logger.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { HTTPError } from 'got';
import { getAppellantCaseFromAppealId } from '../appellant-case.service.js';
import { changeOwnershipCertificatePage } from './ownership-certificate.mapper.js';
import { changeOwnershipCertificate } from './ownership-certificate.service.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const getChangeOwnershipCertificate = async (request, response) => {
	return renderChangeOwnershipCertificate(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
const renderChangeOwnershipCertificate = async (request, response) => {
	try {
		const { errors, currentAppeal } = request;

		const appellantCaseData = await getAppellantCaseFromAppealId(
			request.apiClient,
			currentAppeal.appealId,
			currentAppeal.appellantCaseId
		);

		const mappedPageContents = changeOwnershipCertificatePage(
			currentAppeal,
			appellantCaseData,
			request.session.ownershipCertificate
		);

		return response.status(200).render('patterns/change-page.pattern.njk', {
			pageContent: mappedPageContents,
			errors
		});
	} catch (error) {
		logger.error(error);

		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return response.status(404).render('app/404.njk');
		} else {
			return response.status(500).render('app/500.njk');
		}
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postChangeOwnershipCertificate = async (request, response) => {
	if (request.errors) {
		return renderChangeOwnershipCertificate(request, response);
	}

	const {
		params: { appealId },
		currentAppeal
	} = request;

	request.session.ownershipCertificate = {
		radio: request.body['ownershipCertificateRadio'] === 'yes'
	};

	const appellantCaseId = currentAppeal.appellantCaseId;

	try {
		await changeOwnershipCertificate(
			request.apiClient,
			appealId,
			appellantCaseId,
			request.session.ownershipCertificate.radio
		);

		addNotificationBannerToSession(
			request.session,
			'changePage',
			appealId,
			'',
			'Ownership certificate or land declaration submitted updated'
		);

		delete request.session.ownershipCertificate;

		return response.redirect(
			`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`
		);
	} catch (error) {
		logger.error(error);
	}

	return response.status(500).render('app/500.njk');
};
