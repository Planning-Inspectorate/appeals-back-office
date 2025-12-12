import { createStatementMapper } from './statement.mapper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantStatement = createStatementMapper({
	id: 'appellant-statement',
	text: 'Appellant statement',
	documentationKey: 'appellantStatement',
	dueDateKey: 'appellantStatementDueDate'
});
