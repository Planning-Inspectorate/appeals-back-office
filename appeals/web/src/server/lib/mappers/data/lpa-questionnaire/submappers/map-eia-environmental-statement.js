import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaEnvironmentalStatement = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-environmental-statement',
		text: 'Environmental statement',
		folderInfo: lpaQuestionnaireData.documents.eiaEnvironmentalStatement,
		cypressDataName: 'eia-environmental-statement',
		lpaQuestionnaireData,
		session
	});
