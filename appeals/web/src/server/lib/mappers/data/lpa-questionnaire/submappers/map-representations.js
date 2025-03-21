import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapRepresentations = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'representations-from-other-parties',
		text: 'Representations from members of the public or other parties',
		folderInfo: lpaQuestionnaireData.documents.otherPartyRepresentations,
		lpaQuestionnaireData,
		session
	});
