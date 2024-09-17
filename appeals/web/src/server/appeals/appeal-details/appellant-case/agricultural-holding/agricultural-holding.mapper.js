/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/page-components/radio.js';

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
			yesNoInput({
				name: 'partOfAgriculturalHoldingRadio',
				legendText: 'Is the appeal site part of an agricultural holding?',
				value: partOfAgriculturalHolding
			})
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
			yesNoInput({
				name: 'tenantOfAgriculturalHoldingRadio',
				legendText: 'Is the appellant a tenant of the agricultural holding?',
				value: tenantOfAgriculturalHolding
			})
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
			yesNoInput({
				name: 'otherTenantsOfAgriculturalHoldingRadio',
				legendText: 'Are there any other tenants of the agricultural holding?',
				value: otherTenantsOfAgriculturalHolding
			})
		]
	};

	return pageContent;
};
