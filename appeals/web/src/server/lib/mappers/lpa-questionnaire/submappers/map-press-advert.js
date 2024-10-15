import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapPressAdvert = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'press-advert',
		text: 'Press advert notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedPressAdvert,
		cypressDataName: 'press-advert-notification',
		lpaQuestionnaireData,
		session
	});
