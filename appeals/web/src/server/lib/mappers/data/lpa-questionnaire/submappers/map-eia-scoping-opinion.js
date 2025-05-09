import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEiaScopingOpinion = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-scoping-opinion',
		text: 'Scoping opinion documents',
		folderInfo: lpaQuestionnaireData.documents.eiaScopingOpinion,
		cypressDataName: 'eia-scoping-opinion',
		lpaQuestionnaireData,
		session
	});
