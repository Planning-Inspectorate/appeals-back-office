import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEmergingPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'emerging-plan',
		text: 'Emerging plan relevant to appeal',
		folderInfo: lpaQuestionnaireData.documents.emergingPlan,
		cypressDataName: 'emerging-plan',
		lpaQuestionnaireData,
		session
	});
