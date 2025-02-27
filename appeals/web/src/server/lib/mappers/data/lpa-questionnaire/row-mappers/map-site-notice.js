import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapSiteNotice = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'site-notice',
		text: 'Site notice',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedSiteNotice,
		lpaQuestionnaireData,
		session
	});
