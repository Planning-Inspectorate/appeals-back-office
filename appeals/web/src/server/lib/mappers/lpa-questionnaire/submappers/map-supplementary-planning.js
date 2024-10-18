import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapSupplementaryPlanning = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'supplementary-planning',
		text: 'Supplementary planning documents',
		folderInfo: lpaQuestionnaireData.documents.supplementaryPlanning,
		cypressDataName: 'supplementary-planning',
		lpaQuestionnaireData,
		session
	});
