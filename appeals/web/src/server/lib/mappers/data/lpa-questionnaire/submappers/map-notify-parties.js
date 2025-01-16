import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapNotifyingParties = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'notifying-parties',
		text: 'Who was notified about the application',
		folderInfo: lpaQuestionnaireData.documents.whoNotified,
		lpaQuestionnaireData,
		session
	});
