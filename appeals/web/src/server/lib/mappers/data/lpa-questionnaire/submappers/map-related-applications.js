import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapRelatedApplications = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'related-applications',
		text: `Related applications`,
		folderInfo: lpaQuestionnaireData.documents.relatedApplications,
		lpaQuestionnaireData,
		session
	});
