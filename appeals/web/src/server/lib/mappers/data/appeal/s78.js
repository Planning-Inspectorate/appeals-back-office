import { submaps as hasSubmaps } from './has.js';
import { mapFinalCommentDueDate } from './submappers/final-comment-due-date.mapper.js';
import { mapIpCommentsDueDate } from './submappers/ip-comments-due-date.mapper.js';
import { mapIpComments } from './submappers/ip-comments.mapper.js';
import { mapLpaStatementDueDate } from './submappers/lpa-statement-due-date.mapper.js';
import { mapS106ObligationDue } from './submappers/s106-obligation-due-date.mapper.js';
import { mapAppellantStatementDueDate } from './submappers/appellant-statement-due-date.mapper.js';
import { mapLpaStatement } from './submappers/lpa-statement.mapper.js';
import { mapAppellantFinalComments } from './submappers/appellant-final-comments.mapper.js';
import { mapLPAFinalComments } from './submappers/lpa-final-comments.mapper.js';
import { mapEnvironmentalAssessment } from './submappers/environmental-assessment.mapper.js';
import { mapSetUpHearing } from './submappers/hearing-set-up-hearing.js';
import { mapAddHearingEstimates } from './submappers/hearing-add-hearing-estimates.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	appellantStatementDueDate: mapAppellantStatementDueDate,
	lpaStatementDueDate: mapLpaStatementDueDate,
	ipCommentsDueDate: mapIpCommentsDueDate,
	finalCommentDueDate: mapFinalCommentDueDate,
	s106ObligationDueDate: mapS106ObligationDue,
	ipComments: mapIpComments,
	lpaStatement: mapLpaStatement,
	appellantFinalComments: mapAppellantFinalComments,
	lpaFinalComments: mapLPAFinalComments,
	environmentalAssessment: mapEnvironmentalAssessment,
	setUpHearing: mapSetUpHearing,
	addHearingEstimates: mapAddHearingEstimates
};
