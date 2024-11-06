import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapSiteNotice = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'site-notice',
		text: 'Site notice',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedSiteNotice,
		lpaQuestionnaireData,
		session
	});
