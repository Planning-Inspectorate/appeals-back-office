import { documentInstruction } from '../common.js';

/** @type {import("../mapper.js").RowMapper} */
export const mapDefinitiveMapStatement = ({ lpaQuestionnaireData, session }) =>
	documentInstruction({
		id: 'definitive-map-statement',
		text: 'Definitive map and statement extract',
		folderInfo: lpaQuestionnaireData.documents.definitiveMapStatement,
		cypressDataName: 'definitive-map-statement',
		lpaQuestionnaireData,
		session
	});
