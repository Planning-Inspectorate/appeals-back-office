import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapPlanningPermission = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'planning-permission',
		text: 'Planning permission',
		folderInfo: lpaQuestionnaireData.documents.planningPermission,
		cypressDataName: 'planning-permission',
		lpaQuestionnaireData,
		session
	});
