import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapLettersToNeighbours = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'letters-to-neighbours',
		text: 'Letter or email notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours,
		cypressDataName: 'letter-or-email-notification',
		lpaQuestionnaireData,
		session
	});
