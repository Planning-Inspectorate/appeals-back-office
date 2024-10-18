import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapEmergingPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'emerging-plan',
		text: 'Emerging plan relevant to appeal',
		folderInfo: lpaQuestionnaireData.documents.emergingPlan,
		cypressDataName: 'emerging-plan',
		lpaQuestionnaireData,
		session
	});
