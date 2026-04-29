import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapPlansDrawingsLpa = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'plans-drawings-lpa',
		text: 'Plans and drawings',
		folderInfo: lpaQuestionnaireData.documents.plansDrawingsLPA,
		cypressDataName: 'plans-drawings-lpa',
		lpaQuestionnaireData,
		session
	});
