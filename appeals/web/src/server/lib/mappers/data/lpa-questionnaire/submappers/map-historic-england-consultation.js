import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").SubMapper} */
export const mapHistoricEnglandConsultation = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'historic-england-consultation',
		text: `Historic England consultation`,
		folderInfo: lpaQuestionnaireData.documents.historicEnglandConsultation,
		lpaQuestionnaireData,
		session
	});
