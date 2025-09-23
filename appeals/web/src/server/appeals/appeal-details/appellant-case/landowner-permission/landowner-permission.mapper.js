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
export const changeLandownerPermissionPage = (appealData, appellantCaseData, storedSessionData) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	let landownerPermission = appellantCaseData.landownerPermission;

	if (storedSessionData?.radio) {
		landownerPermission = storedSessionData.radio;
	}

	/** @type {PageContent} */
	const pageContent = {
		title: `Do you have the landowner's permission?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: `Do you have the landowner's permission?`,
		pageComponents: [
			yesNoInput({
				name: 'landownerPermission',
				value: landownerPermission,
				legendIsPageHeading: true
			})
		]
	};

	return pageContent;
};
