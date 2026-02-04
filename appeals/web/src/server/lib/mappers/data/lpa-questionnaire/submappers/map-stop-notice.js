import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapStopNotice = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'stop-notice',
		text: 'Stop notice',
		folderInfo: lpaQuestionnaireData.documents.stopNotice,
		cypressDataName: 'stop-notice',
		lpaQuestionnaireData,
		session
	});
