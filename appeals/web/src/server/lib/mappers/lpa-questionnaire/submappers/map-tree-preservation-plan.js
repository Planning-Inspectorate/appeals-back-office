import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapTreePreservationPlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'tree-preservation-plan',
		text: 'Plan showing extent of TPO',
		folderInfo: lpaQuestionnaireData.documents.treePreservationPlan,
		cypressDataName: 'tree-preservation-plan',
		lpaQuestionnaireData,
		session
	});
