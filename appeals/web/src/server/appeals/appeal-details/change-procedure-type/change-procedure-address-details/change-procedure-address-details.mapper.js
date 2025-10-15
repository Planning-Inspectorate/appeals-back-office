import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/mappers/index.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {import('@pins/appeals').Address} currentAddress
 * @param {'setup' | 'change'} action
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {string} newProcedureType
 * @returns {PageContent}
 */
export function changeAddressDetailsPage(
	appealData,
	action,
	currentAddress,
	errors,
	newProcedureType
) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	return {
		title: `Address - update appeal procedure - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${appealData.appealId}/change-appeal-procedure-type/${newProcedureType}/address-known`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Inquiry address',
		pageComponents: addressInputs({ address: currentAddress, errors })
	};
}

/**
 *
 * @param {string} dateField
 * @returns {undefined | {name: string, id: string}}
 */
export const getDueDateFieldNameAndID = (dateField) => {
	switch (dateField) {
		case 'lpaQuestionnaireDueDate':
			return {
				id: 'lpa-questionnaire-due-date',
				name: 'LPA questionnaire due date'
			};
		case 'statementDueDate':
			return {
				id: 'statement-due-date',
				name: 'Statement due date'
			};
		case 'ipCommentsDueDate':
			return {
				id: 'ip-comments-due-date',
				name: 'Interested party comments'
			};
		case 'statementOfCommonGroundDueDate':
			return {
				id: 'statement-of-common-ground-due-date',
				name: 'Statement of common ground due date'
			};
		case 'proofOfEvidenceAndWitnessesDueDate':
			return {
				id: 'proof-of-evidence-and-witnesses-due-date',
				name: 'Proof of evidence and witnesses due date'
			};
		case 'planningObligationDueDate':
			return {
				id: 'planning-obligation-due-date',
				name: 'Planning obligation due date'
			};
		default:
			return undefined;
	}
};
