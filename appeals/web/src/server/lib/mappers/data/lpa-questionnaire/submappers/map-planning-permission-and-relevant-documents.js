import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapPlanningPermissionAndRelevantDocuments = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'planning-permission-and-relevant-documents',
		text: 'Planning permission and relevant documents',
		folderInfo: lpaQuestionnaireData.documents.planningPermission,
		cypressDataName: 'planning-permission-and-relevant-documents',
		lpaQuestionnaireData,
		session
	});
