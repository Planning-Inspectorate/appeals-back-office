import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapConservationAreaMap = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'conservation-area-map',
		text: 'Conservation area map and guidance',
		folderInfo: lpaQuestionnaireData.documents.conservationMap,
		cypressDataName: 'conservation-area-map-and-guidance',
		lpaQuestionnaireData,
		session
	});
