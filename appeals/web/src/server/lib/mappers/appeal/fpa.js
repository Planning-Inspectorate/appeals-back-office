import { submaps as hasSubmaps } from './has.js';
import { mapAppellantFinalCommentDueDate } from './submappers/appellant-final-comment-due-date.mapper.js';
import { mapIpCommentsDueDate } from './submappers/ip-comments-due-date.mapper.js';
import { mapIpComments } from './submappers/ip-comments.mapper.js';
import { mapLpaFinalCommentDueDate } from './submappers/lpa-final-comment-due-date.mapper.js';
import { mapLpaStatementDueDate } from './submappers/lpa-statement-due-date.mapper.js';
import { mapS106ObligationDue } from './submappers/s106-obligation-due-date.mapper.js';

/** @type {Record<string, import('./appeal.mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	lpaStatementDueDate: mapLpaStatementDueDate,
	ipCommentsDueDate: mapIpCommentsDueDate,
	appellantFinalCommentDueDate: mapAppellantFinalCommentDueDate,
	lpaFinalCommentDueDate: mapLpaFinalCommentDueDate,
	s106ObligationDueDate: mapS106ObligationDue,
	ipComments: mapIpComments
};
