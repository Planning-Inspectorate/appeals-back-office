import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapPressAdvert = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'press-advert',
		text: 'Press advertisement',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedPressAdvert,
		cypressDataName: 'press-advert-notification',
		lpaQuestionnaireData,
		session
	});
