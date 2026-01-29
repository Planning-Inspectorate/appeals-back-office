import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapArticle4Direction = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'article-4-direction',
		text: 'Article 4 direction',
		folderInfo: lpaQuestionnaireData.documents.article4Direction,
		cypressDataName: 'article-4-direction',
		lpaQuestionnaireData,
		session
	});
