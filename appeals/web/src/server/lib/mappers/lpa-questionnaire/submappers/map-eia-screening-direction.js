import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEiaScreeningDirection = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-screening-direction',
		text: 'Screening direction documents',
		folderInfo: lpaQuestionnaireData.documents.eiaScreeningDirection,
		cypressDataName: 'eia-screening-direction',
		lpaQuestionnaireData,
		session
	});
