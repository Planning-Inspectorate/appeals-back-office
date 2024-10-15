import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapNotifyingParties = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'notifying-parties',
		text: 'Who was notified',
		folderInfo: lpaQuestionnaireData.documents.whoNotified,
		lpaQuestionnaireData,
		session
	});
