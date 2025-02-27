import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapRepresentations = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'representations-from-other-parties',
		text: 'Representations from other parties documents',
		folderInfo: lpaQuestionnaireData.documents.otherPartyRepresentations,
		lpaQuestionnaireData,
		session
	});
