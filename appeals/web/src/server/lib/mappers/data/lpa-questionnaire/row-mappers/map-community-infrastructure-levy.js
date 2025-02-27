import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapCommunityInfrastructureLevy = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'community-infrastructure-levy',
		text: 'Community infrastructure levy',
		folderInfo: lpaQuestionnaireData.documents.communityInfrastructureLevy,
		cypressDataName: 'community-infrastructure-levy',
		lpaQuestionnaireData,
		session
	});
