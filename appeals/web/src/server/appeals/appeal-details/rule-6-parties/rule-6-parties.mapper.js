import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * @param {Appeal} appealData
 * @param {'Add' | 'Update'} action
 * @param {string} backLinkUrl
 * @param {Record<string, string>} values
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function namePage(appealData, action, backLinkUrl, values = {}, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageComponent} */
	const nameInput = {
		type: 'input',
		parameters: {
			name: 'organisationName',
			id: 'organisation-name',
			label: {
				text: 'Rule 6 party name',
				classes: 'govuk-label--l',
				isPageHeading: true
			},
			value: values.organisationName ?? '',
			...(errors?.organisationName && {
				errorMessage: { text: errors.organisationName.msg }
			})
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal ${shortAppealReference} - ${action} rule 6 party`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - ${action} rule 6 party`,
		pageComponents: [nameInput]
	};
}

/**
 * @param {Appeal} appealData
 * @param {'Add' | 'Update'} action
 * @param {string} backLinkUrl
 * @param {Record<string, string>} values
 * @param {import("@pins/express").ValidationErrors} [errors]
 * @returns {PageContent}
 */
export function emailPage(appealData, action, backLinkUrl, values = {}, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageComponent} */
	const emailInput = {
		type: 'input',
		parameters: {
			name: 'email',
			id: 'email',
			label: {
				text: 'Rule 6 party email address',
				classes: 'govuk-label--l',
				isPageHeading: true
			},
			value: values.email ?? '',
			...(errors?.email && {
				errorMessage: { text: errors.email.msg }
			})
		}
	};

	/** @type {PageContent} */
	return {
		title: `Appeal ${shortAppealReference} - ${action} rule 6 party`,
		backLinkUrl,
		preHeading: `Appeal ${shortAppealReference} - ${action} rule 6 party`,
		pageComponents: [emailInput]
	};
}
