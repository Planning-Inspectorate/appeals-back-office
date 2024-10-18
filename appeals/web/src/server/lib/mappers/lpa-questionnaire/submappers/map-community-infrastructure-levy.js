import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapCommunityInfrastructureLevy = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'community-infrastructure-levy',
		text: 'Community infrastructure levy',
		folderInfo: lpaQuestionnaireData.documents.communityInfrastructureLevy,
		cypressDataName: 'community-infrastructure-levy',
		lpaQuestionnaireData,
		session
	});
