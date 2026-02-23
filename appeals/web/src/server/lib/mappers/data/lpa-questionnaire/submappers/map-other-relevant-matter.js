import { documentInstruction } from '#lib/mappers/data/lpa-questionnaire/common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapOtherRelevantMatters = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'other-relevant-matters',
		text: 'Other relevant matters',
		folderInfo: lpaQuestionnaireData.documents.otherRelevantMatters,
		cypressDataName: 'other-relevant-matters',
		lpaQuestionnaireData,
		session
	});
