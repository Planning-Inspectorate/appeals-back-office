import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapServedNoticeList = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'served-notice-list',
		text: 'Upload the list of people that you served the enforcement notice to',
		// @ts-ignore
		folderInfo: lpaQuestionnaireData.documents?.enforcementList,
		cypressDataName: 'served-notice-list',
		lpaQuestionnaireData,
		session
	});
