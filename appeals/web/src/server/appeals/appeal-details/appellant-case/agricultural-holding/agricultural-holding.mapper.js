/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: boolean}} storedSessionData
 * @returns {PageContent}
 */
export const changePartOfAgriculturalHoldingPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let partOfAgriculturalHolding = appellantCaseData.agriculturalHolding.isPartOfAgriculturalHolding;

	if (storedSessionData?.radio) {
		partOfAgriculturalHolding = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change part of agricultural holding`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change part of agricultural holding`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'partOfAgriculturalHoldingRadio',
					id: 'part-of-agricultural-holding-radio',
					fieldSet: {
						legend: {
							text: 'Is the appeal site part of an agricultural holding?',
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: !!partOfAgriculturalHolding
						},
						{
							value: 'no',
							text: 'No',
							checked: !partOfAgriculturalHolding
						}
					]
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: boolean}} storedSessionData
 * @returns {PageContent}
 */
export const changeTenantOfAgriculturalHoldingPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let tenantOfAgriculturalHolding = appellantCaseData.agriculturalHolding.isTenant;

	if (storedSessionData?.radio) {
		tenantOfAgriculturalHolding = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change tenant of agricultural holding`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change tenant of agricultural holding`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'tenantOfAgriculturalHoldingRadio',
					id: 'tenant-of-agricultural-holding-radio',
					fieldSet: {
						legend: {
							text: 'Is the appellant a tenant of the agricultural holding?',
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: !!tenantOfAgriculturalHolding
						},
						{
							value: 'no',
							text: 'No',
							checked: !tenantOfAgriculturalHolding
						}
					]
				}
			}
		]
	};

	return pageContent;
};

/**
 * @param {Appeal} appealData
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} appellantCaseData
 * @param {{radio: boolean}} storedSessionData
 * @returns {PageContent}
 */
export const changeOtherTenantsOfAgriculturalHoldingPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let otherTenantsOfAgriculturalHolding = appellantCaseData.agriculturalHolding.hasOtherTenants;

	if (storedSessionData?.radio) {
		otherTenantsOfAgriculturalHolding = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change other tenants of agricultural holding`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change other tenants of agricultural holding`,
		pageComponents: [
			{
				type: 'radios',
				parameters: {
					name: 'otherTenantsOfAgriculturalHoldingRadio',
					id: 'other-tenants-of-agricultural-holding-radio',
					fieldSet: {
						legend: {
							text: 'Are there any other tenants of the agricultural holding?',
							isPageHeading: false,
							classes: 'govuk-fieldset__legend--l'
						}
					},
					items: [
						{
							value: 'yes',
							text: 'Yes',
							checked: !!otherTenantsOfAgriculturalHolding
						},
						{
							value: 'no',
							text: 'No',
							checked: !otherTenantsOfAgriculturalHolding
						}
					]
				}
			}
		]
	};

	return pageContent;
};
