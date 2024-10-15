import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapPlansDrawings = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'plans-drawings',
		text: `Plans, drawings and list of plans`,
		folderInfo: lpaQuestionnaireData.documents.plansDrawings,
		lpaQuestionnaireData,
		session
	});
