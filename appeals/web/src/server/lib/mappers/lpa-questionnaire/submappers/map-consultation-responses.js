import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapConsultationResponses = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'consultation-responses',
		text: 'Consultation responses or standing advice',
		folderInfo: lpaQuestionnaireData.documents.consultationResponses,
		cypressDataName: 'consultation-responses',
		lpaQuestionnaireData,
		session
	});
