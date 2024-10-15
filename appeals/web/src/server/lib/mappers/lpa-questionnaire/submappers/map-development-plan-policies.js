import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapDevelopmentPlanPolicies = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'development-plan-policies',
		text: `Relevant policies from statutory development plan`,
		folderInfo: lpaQuestionnaireData.documents.developmentPlanPolicies,
		lpaQuestionnaireData,
		session
	});
