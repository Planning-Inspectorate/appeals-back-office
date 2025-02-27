import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapOfficersReport = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'officers-report',
		text: `Planning officer's report`,
		folderInfo: lpaQuestionnaireData.documents.planningOfficerReport,
		lpaQuestionnaireData,
		session
	});
