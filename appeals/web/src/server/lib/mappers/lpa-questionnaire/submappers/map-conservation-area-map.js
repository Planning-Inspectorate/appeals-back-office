import { documentInstruction } from '../utils.js';

/** @type {import("../lpa-questionnaire.mapper.js").SubMapper} */
export const mapConservationAreaMap = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'conservation-area-map',
		text: 'Conservation area map and guidance',
		folderInfo: lpaQuestionnaireData.documents.conservationMap,
		cypressDataName: 'conservation-area-map-and-guidance',
		lpaQuestionnaireData,
		session
	});
