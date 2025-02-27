import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapLettersToNeighbours = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'letters-to-neighbours',
		text: 'Letter or email notification',
		folderInfo: lpaQuestionnaireData.documents.whoNotifiedLetterToNeighbours,
		cypressDataName: 'letter-or-email-notification',
		lpaQuestionnaireData,
		session
	});
