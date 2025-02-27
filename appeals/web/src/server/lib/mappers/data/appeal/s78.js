import { hasRowMappers } from './has.js';
import { mapFinalCommentDueDate } from './row-mappers/final-comment-due-date.mapper.js';
import { mapIpCommentsDueDate } from './row-mappers/ip-comments-due-date.mapper.js';
import { mapIpComments } from './row-mappers/ip-comments.mapper.js';
import { mapLpaStatementDueDate } from './row-mappers/lpa-statement-due-date.mapper.js';
import { mapS106ObligationDue } from './row-mappers/s106-obligation-due-date.mapper.js';
import { mapAppellantStatementDueDate } from './row-mappers/appellant-statement-due-date.mapper.js';
import { mapLpaStatement } from './row-mappers/lpa-statement.mapper.js';
import { mapAppellantFinalComments } from './row-mappers/appellant-final-comments.mapper.js';
import { mapLPAFinalComments } from './row-mappers/lpa-final-comments.mapper.js';
import { mapEnvironmentalAssessment } from './row-mappers/environmental-assessment.mapper.js';

/** @type {Record<string, import('./mapper.js').RowMapper>} */
export const s78RowMappers = {
	...hasRowMappers,
	appellantStatementDueDate: mapAppellantStatementDueDate,
	lpaStatementDueDate: mapLpaStatementDueDate,
	ipCommentsDueDate: mapIpCommentsDueDate,
	finalCommentDueDate: mapFinalCommentDueDate,
	s106ObligationDueDate: mapS106ObligationDue,
	ipComments: mapIpComments,
	lpaStatement: mapLpaStatement,
	appellantFinalComments: mapAppellantFinalComments,
	lpaFinalComments: mapLPAFinalComments,
	environmentalAssessment: mapEnvironmentalAssessment
};
