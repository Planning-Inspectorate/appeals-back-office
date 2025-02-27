import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapEiaScreeningOpinion = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-screening-opinion',
		text: 'Screening opinion documents',
		folderInfo: lpaQuestionnaireData.documents.eiaScreeningOpinion,
		cypressDataName: 'eia-screening-opinion',
		lpaQuestionnaireData,
		session
	});
