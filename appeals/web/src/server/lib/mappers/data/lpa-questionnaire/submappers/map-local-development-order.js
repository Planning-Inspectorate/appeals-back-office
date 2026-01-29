import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapLocalDevelopmentOrder = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'local-development-order',
		text: 'Local development order',
		folderInfo: lpaQuestionnaireData.documents.localDevelopmentOrder,
		cypressDataName: 'local-development-order',
		lpaQuestionnaireData,
		session
	});
