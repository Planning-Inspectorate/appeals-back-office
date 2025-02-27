import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapEmergingPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'emerging-plan',
		text: 'Emerging plan relevant to appeal',
		folderInfo: lpaQuestionnaireData.documents.emergingPlan,
		cypressDataName: 'emerging-plan',
		lpaQuestionnaireData,
		session
	});
