import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapNotifyingParties = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'notifying-parties',
		text: 'Who did you notify about this application?',
		folderInfo: lpaQuestionnaireData.documents.whoNotified,
		lpaQuestionnaireData,
		session
	});
