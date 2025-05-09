import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapConsultationResponses = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'consultation-responses',
		text: 'Consultation responses and standing advice',
		folderInfo: lpaQuestionnaireData.documents.consultationResponses,
		cypressDataName: 'consultation-responses',
		lpaQuestionnaireData,
		session
	});
