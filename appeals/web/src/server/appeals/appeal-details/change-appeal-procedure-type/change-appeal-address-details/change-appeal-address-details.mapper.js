import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateInput } from '#lib/mappers/components/page-components/date.js';
import { addressInputs } from '#lib/mappers/index.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @param {Appeal} appealData
 * @param {import('@pins/appeals').Address} currentAddress
 * @param {'setup' | 'change'} action
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns {PageContent}
 */
export function changeAddressDetailsPage(appealData, action, currentAddress, errors) {
	const shortAppealReference = appealShortReference(appealData.appealReference);

	/** @type {PageContent} */
	return {
		title: `Address - update appeal procedure - ${shortAppealReference}`,
		backLinkUrl: `/appeals-service/appeal-details/${
			appealData.appealId
		}/change-appeal-procedure-type/${appealData?.procedureType?.toLowerCase()}/address-known`,
		preHeading: `Appeal ${shortAppealReference}`,
		heading: 'Inquiry address',
		pageComponents: addressInputs({ address: currentAddress, errors })
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {any} sessionValues
 * @param {'change' | 'setup'} action
 * @param {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse | undefined} appellantCase
 * @param {import("@pins/express").ValidationErrors | undefined} errors
 * @returns Promise<PageContent>
 */
export const inquiryDueDatesPage = async (
	appealDetails,
	sessionValues,
	action,
	appellantCase,
	errors = undefined
) => {
	/**
	 * @type {{backLinkUrl: string, heading: string, title: string, preHeading: string, pageComponents?: PageComponent[]}}
	 */
	let pageContent = {
		title: `Timetable due dates`,
		backLinkUrl: `/appeals-service/appeal-details/${
			appealDetails.appealId
		}/change-appeal-procedure-type/${appealDetails?.procedureType?.toLowerCase()}/address-known`,
		preHeading: `Appeal ${appealShortReference(appealDetails.appealReference)}`,
		heading: `Timetable due dates`,
		pageComponents: []
	};

	/**
	 *
	 * @type {string[]}
	 */
	const dueDateFields = [
		'lpaQuestionnaireDueDate',
		'statementDueDate',
		'ipCommentsDueDate',
		'statementOfCommonGroundDueDate',
		'proofOfEvidenceAndWitnessesDueDate'
	];

	if (appellantCase?.planningObligation?.hasObligation) {
		dueDateFields.push('planningObligationDueDate');
	}

	pageContent.pageComponents = dueDateFields.map((dateField) => {
		const fieldType = getDueDateFieldNameAndID(dateField);
		if (fieldType === undefined) {
			throw new Error(`Unknown date field: ${dateField}`);
		}
		const day = fieldType.id + '-day';
		const month = fieldType.id + '-month';
		const year = fieldType.id + '-year';
		return dateInput({
			name: `${fieldType.id}`,
			id: `${fieldType.id}`,
			namePrefix: `${fieldType.id}`,
			legendText: `${fieldType.name}`,
			hint: 'For example, 31 3 2025',
			legendClasses: 'govuk-fieldset__legend--m',
			value: {
				day: sessionValues[day] ? sessionValues[day] : '',
				month: sessionValues[month] ? sessionValues[month] : '',
				year: sessionValues[year] ? sessionValues[year] : ''
			},
			errors: errors
		});
	});

	return pageContent;
};

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
