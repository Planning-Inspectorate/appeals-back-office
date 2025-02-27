import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapOtherRelevantPolicies = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'other-relevant-policies',
		text: 'Other relevant policies',
		folderInfo: lpaQuestionnaireData.documents.otherRelevantPolicies,
		cypressDataName: 'other-relevant-policies',
		lpaQuestionnaireData,
		session
	});
