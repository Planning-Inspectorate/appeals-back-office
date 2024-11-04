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
export const changeOwnershipCertificatePage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let ownershipCertificateSubmitted = appellantCaseData.ownershipCertificateSubmitted;

	if (storedSessionData?.radio) {
		ownershipCertificateSubmitted = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Change ownership certificate or land declaration submitted`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Change ownership certificate or land declaration submitted`,
		pageComponents: [
			yesNoInput({
				name: 'ownershipCertificateRadio',
				id: 'owners-known-radio',
				value: ownershipCertificateSubmitted
			})
		]
	};

	return pageContent;
};
