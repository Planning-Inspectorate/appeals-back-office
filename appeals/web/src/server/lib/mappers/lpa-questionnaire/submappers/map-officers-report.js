import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapOfficersReport = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'officers-report',
		text: `Planning officer's report`,
		folderInfo: lpaQuestionnaireData.documents.planningOfficerReport,
		lpaQuestionnaireData,
		session
	});
