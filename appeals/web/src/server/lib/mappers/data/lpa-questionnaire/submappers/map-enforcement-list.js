import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapEnforcementList = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'enforcement-list',
		text: 'Upload the list of people that you served the enforcement notice to',
		folderInfo: lpaQuestionnaireData.documents.enforcementList,
		cypressDataName: 'enforcement-list',
		lpaQuestionnaireData,
		session
	});
