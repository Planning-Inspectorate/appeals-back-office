import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapPlanningContraventionNotice = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'planning-contravention-notice',
		text: 'Planning contravention notice',
		folderInfo: lpaQuestionnaireData.documents.planningContraventionNotice,
		cypressDataName: 'planning-contravention-notice',
		lpaQuestionnaireData,
		session
	});
