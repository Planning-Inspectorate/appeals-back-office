import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapDesignAccessStatementLpa = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'design-access-statement-lpa',
		text: 'Design and access statement',
		folderInfo: lpaQuestionnaireData.documents.designAccessStatementLPA,
		cypressDataName: 'design-access-statement-lpa',
		lpaQuestionnaireData,
		session
	});
