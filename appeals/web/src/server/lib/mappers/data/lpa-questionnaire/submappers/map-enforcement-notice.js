import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEnforcementNotice = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'enforcement-notice',
		text: 'Enforcement notice',
		folderInfo: lpaQuestionnaireData.documents.lpaEnforcementNotice,
		cypressDataName: 'enforcement-notice',
		lpaQuestionnaireData,
		session
	});
