import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapConsultationResponses = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'consultation-responses',
		text: 'Consultation responses or standing advice',
		folderInfo: lpaQuestionnaireData.documents.consultationResponses,
		cypressDataName: 'consultation-responses',
		lpaQuestionnaireData,
		session
	});
