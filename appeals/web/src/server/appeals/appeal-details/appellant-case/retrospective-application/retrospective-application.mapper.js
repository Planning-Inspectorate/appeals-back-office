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
export const changeRetrospectiveApplicationPage = (
	appealData,
	appellantCaseData,
	storedSessionData
) => {
	const shortAppealReference = appealShortReference(appealData.appealReference);
	const retrospectiveApplication =
		storedSessionData?.radio ?? appellantCaseData?.enforcementNotice?.retrospectiveApplication;

	const retrospectiveApplicationComponent = yesNoInput({
		name: 'retrospectiveApplication',
		id: 'retrospective-application',
		legendText: 'Did anyone submit a retrospective planning application?',
		legendIsPageHeading: true,
		value: retrospectiveApplication
	});

	/** @type {PageContent} */
	return {
		title: `Appellant Case - Retrospective Application - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/appellant-case`,
		preHeading: `Appeal ${shortAppealReference}`,
		pageComponents: [retrospectiveApplicationComponent]
	};
};
