import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAdditionalDocumentsLpa = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'additional-documents-lpa',
		text: 'Any other documents submitted with the application',
		folderInfo: lpaQuestionnaireData.documents.additionalDocumentsLPA,
		cypressDataName: 'additional-documents-lpa',
		lpaQuestionnaireData,
		session
	});
