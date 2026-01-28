import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEnforcementNoticePlan = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'enforcement-notice-plan',
		text: 'Enforcement notice plan',
		folderInfo: lpaQuestionnaireData.documents.lpaEnforcementNoticePlan,
		cypressDataName: 'enforcement-notice-plan',
		lpaQuestionnaireData,
		session
	});
