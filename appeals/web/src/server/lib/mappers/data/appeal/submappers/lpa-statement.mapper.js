import { createStatementMapper } from './statement.mapper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLpaStatement = createStatementMapper({
	id: 'lpa-statement',
	text: 'LPA statement',
	documentationKey: 'lpaStatement',
	dueDateKey: 'lpaStatementDueDate'
});
