import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapTreePreservationPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'tree-preservation-plan',
		text: 'Tree Preservation Order',
		folderInfo: lpaQuestionnaireData.documents.treePreservationPlan,
		cypressDataName: 'tree-preservation-plan',
		lpaQuestionnaireData,
		session
	});
