import usersService from '#appeals/appeal-users/users-service.js';
import { formatFirstInitialLastName } from '#lib/string-utilities.js';

/**
 *
 * @param {import("@pins/appeals.api/src/server/endpoints/appeals.js").ServiceUserResponse} serviceUser
 * @param {import("@pins/appeals.api/src/server/endpoints/appeals.js").ServiceUserResponse |null} [agentDetails]
 */
export const formatAppellantAsHtmlList = (serviceUser, agentDetails) => {
	const name = `<li>${serviceUser.firstName} ${serviceUser.lastName}</li>`;
	const organisationName = `${
		serviceUser.organisationName ? '<li>' + serviceUser.organisationName + '</li>' : ''
	}`;
	let email;
	let phoneNumber;
	if (!agentDetails) {
		email = `${serviceUser.email ? '<li>' + serviceUser.email + '</li>' : ''}`;
		phoneNumber = `${serviceUser.phoneNumber ? '<li>' + serviceUser.phoneNumber + '</li>' : ''}`;
	}
	const listItems = name + organisationName + (email || '') + (phoneNumber || '');

	return `<ul class="govuk-list">${listItems}</ul>`;
};
/**
 *
 * @param {import("@pins/appeals.api/src/server/endpoints/appeals.js").ServiceUserResponse} serviceUser
 */
export const formatServiceUserAsHtmlList = (serviceUser) => {
	const name = `<li>${serviceUser.firstName} ${serviceUser.lastName}</li>`;
	const organisationName = `${
		serviceUser.organisationName ? '<li>' + serviceUser.organisationName + '</li>' : ''
	}`;
	const email = `${serviceUser.email ? '<li>' + serviceUser.email + '</li>' : ''}`;
	const phoneNumber = `${
		serviceUser.phoneNumber ? '<li>' + serviceUser.phoneNumber + '</li>' : ''
	}`;
	return `<ul class="govuk-list">${name}${organisationName}${email}${phoneNumber}</ul>`;
};

/**
 * @param {string | undefined | null} inspector
 * @param {import('@pins/express/types/express.js').Request} request
 */
export const getInspectorFormattedEmailName = async (inspector, request) => {
	const assignedInspector = inspector
		? await usersService.getUserById(inspector, request.session)
		: null;
	return assignedInspector ? formatFirstInitialLastName(assignedInspector?.name) : null;
};
