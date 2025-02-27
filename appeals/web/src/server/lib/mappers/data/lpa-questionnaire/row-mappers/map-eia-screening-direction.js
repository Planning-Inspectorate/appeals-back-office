import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapEiaScreeningDirection = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'eia-screening-direction',
		text: 'Screening direction documents',
		folderInfo: lpaQuestionnaireData.documents.eiaScreeningDirection,
		cypressDataName: 'eia-screening-direction',
		lpaQuestionnaireData,
		session
	});
