import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapNotifyingParties = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'notifying-parties',
		text: "List of neighbours' addresses that you notified about the application",
		folderInfo: lpaQuestionnaireData.documents.whoNotified,
		lpaQuestionnaireData,
		session
	});
