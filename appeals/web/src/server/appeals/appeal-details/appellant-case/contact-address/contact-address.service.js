import { assertValidNumericIds } from '#lib/validators/api-parameters.validator.js';
import { manageContactAddressPage } from './contact-address.mapper.js';

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderManageContactAddress = async (request, response) => {
	const { errors, currentAppeal } = request;

	const mappedPageContents = manageContactAddressPage(
		currentAppeal,
		`/appeals-service/appeal-details/${currentAppeal.appealId}/appellant-case`,
		request.session.contactAddress,
		request,
		errors
	);

	return response.status(errors ? 400 : 200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContents,
		errors
	});
};

/**
 * @param {*} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {*} contactAddress
 */
export const addContactAddress = async (apiClient, appealId, appellantCaseId, contactAddress) => {
	const ids = assertValidNumericIds({ appealId, appellantCaseId });
	return apiClient.post(
		`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}/contact-address`,
		{
			json: {
				addressLine1: contactAddress.addressLine1,
				addressLine2: contactAddress.addressLine2,
				addressTown: contactAddress.town,
				addressCounty: contactAddress.county,
				postcode: contactAddress.postCode
			}
		}
	);
};

/**
 * @param {*} apiClient
 * @param {string} appealId
 * @param {string} appellantCaseId
 * @param {string} contactAddressId
 * @param {*} contactAddress
 */
export const updateContactAddress = async (
	apiClient,
	appealId,
	appellantCaseId,
	contactAddressId,
	contactAddress
) => {
	const ids = assertValidNumericIds({ appealId, appellantCaseId, contactAddressId });
	return apiClient.patch(
		`appeals/${ids.appealId}/appellant-cases/${ids.appellantCaseId}/contact-address/${contactAddressId}`,
		{
			json: {
				addressLine1: contactAddress.addressLine1,
				addressLine2: contactAddress.addressLine2,
				addressTown: contactAddress.town,
				addressCounty: contactAddress.county,
				postcode: contactAddress.postCode
			}
		}
	);
};
