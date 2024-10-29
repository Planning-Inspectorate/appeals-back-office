import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEiaEnvironmentalStatement = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-environmental-statement',
		text: 'Environmental statement',
		folderInfo: lpaQuestionnaireData.documents.eiaEnvironmentalStatement,
		cypressDataName: 'eia-environmental-statement',
		lpaQuestionnaireData,
		session
	});
