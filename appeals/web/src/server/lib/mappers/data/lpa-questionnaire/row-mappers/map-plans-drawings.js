import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapPlansDrawings = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'plans-drawings',
		text: `Plans, drawings and list of plans`,
		folderInfo: lpaQuestionnaireData.documents.plansDrawings,
		lpaQuestionnaireData,
		session
	});
