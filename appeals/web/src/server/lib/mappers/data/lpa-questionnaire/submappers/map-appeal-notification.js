import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapAppealNotification = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'appeal-notification',
		text: 'Appeal notification letter and the list of people that you notified',
		folderInfo: lpaQuestionnaireData.documents.appealNotification,
		cypressDataName: 'appeal-notification-letter',
		lpaQuestionnaireData,
		session
	});
