import { appealShortReference } from '#lib/appeals-formatter.js';
import { addressInputs } from '#lib/mappers/index.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {Record<string, string>} currentAddress
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @param {string} backLinkUrl
 * @returns {PageContent}
 */
export function changeAddressDetailsPage(appealData, currentAddress, errors, backLinkUrl) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	return {
		title: `Address - update appeal procedure - ${shortAppealReference}`,
		backLinkUrl,
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
		case 'caseManagementConferenceDueDate':
			return {
				id: 'case-management-conference-due-date',
				name: 'Case management conference due date'
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
