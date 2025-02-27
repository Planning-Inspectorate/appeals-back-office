import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapPressAdvert = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'press-advert',
		text: 'Press advert notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedPressAdvert,
		cypressDataName: 'press-advert-notification',
		lpaQuestionnaireData,
		session
	});
