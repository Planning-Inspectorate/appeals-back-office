import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEiaScreeningOpinion = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-screening-opinion',
		text: 'Screening opinion documents',
		folderInfo: lpaQuestionnaireData.documents.eiaScreeningOpinion,
		cypressDataName: 'eia-screening-opinion',
		lpaQuestionnaireData,
		session
	});
