import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapTreePreservationPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'tree-preservation-plan',
		text: 'Plan showing extent of TPO',
		folderInfo: lpaQuestionnaireData.documents.treePreservationPlan,
		cypressDataName: 'tree-preservation-plan',
		lpaQuestionnaireData,
		session
	});
