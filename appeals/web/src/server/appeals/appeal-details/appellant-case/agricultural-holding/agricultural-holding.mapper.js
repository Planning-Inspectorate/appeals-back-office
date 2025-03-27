/**
 * @typedef {import('../../appeal-details.types.js').WebAppeal} Appeal
 */
import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput } from '#lib/mappers/index.js';

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
		title: `Is the appeal site part of an agricultural holding?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'partOfAgriculturalHoldingRadio',
				value: partOfAgriculturalHolding,
				legendText: 'Is the appeal site part of an agricultural holding?',
				legendIsPageHeading: true
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
		title: `Are you a tenant of the agricultural holding?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'tenantOfAgriculturalHoldingRadio',
				value: tenantOfAgriculturalHolding ?? 'Not answered',
				legendText: 'Are you a tenant of the agricultural holding?',
				legendIsPageHeading: true
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
		title: `Are there any other tenants?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [
			yesNoInput({
				name: 'otherTenantsOfAgriculturalHoldingRadio',
				value: otherTenantsOfAgriculturalHolding,
				legendText: 'Are there any other tenants?',
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
