import { submaps as hasSubmaps } from './has.js';
import { mapFinalCommentDueDate } from './submappers/final-comment-due-date.mapper.js';
import { mapIpCommentsDueDate } from './submappers/ip-comments-due-date.mapper.js';
import { mapIpComments } from './submappers/ip-comments.mapper.js';
import { mapLpaStatementDueDate } from './submappers/lpa-statement-due-date.mapper.js';
import { mapLpaStatement } from './submappers/lpa-statement.mapper.js';
import { mapAppellantFinalComments } from './submappers/appellant-final-comments.mapper.js';
import { mapLPAFinalComments } from './submappers/lpa-final-comments.mapper.js';
import { mapEnvironmentalAssessment } from './submappers/environmental-assessment.mapper.js';
import { mapSetUpHearing } from './submappers/hearing-set-up-hearing.js';
import { mapAddHearingEstimates } from './submappers/hearing-add-hearing-estimates.js';
import { mapHearingEstimates } from './submappers/hearing-hearing-estimates.js';
import { mapHearingDetails } from './submappers/hearing-details.js';
import { mapCancelHearing } from './submappers/hearing-cancel-hearing.js';
import { mapStatementOfCommonGroundDueDate } from './submappers/statement-of-common-ground-due-date.mapper.js';
import { mapHearingDate } from './submappers/hearing-date.mapper.js';
import { mapPlanningObligationDueDate } from './submappers/planning-obligation-due-date.mapper.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...hasSubmaps,
	lpaStatementDueDate: mapLpaStatementDueDate,
	ipCommentsDueDate: mapIpCommentsDueDate,
	finalCommentDueDate: mapFinalCommentDueDate,
	ipComments: mapIpComments,
	lpaStatement: mapLpaStatement,
	statementOfCommonGroundDueDate: mapStatementOfCommonGroundDueDate,
	planningObligationDueDate: mapPlanningObligationDueDate,
	appellantFinalComments: mapAppellantFinalComments,
	lpaFinalComments: mapLPAFinalComments,
	environmentalAssessment: mapEnvironmentalAssessment,
	setUpHearing: mapSetUpHearing,
	hearingDetails: mapHearingDetails,
	addHearingEstimates: mapAddHearingEstimates,
	hearingEstimates: mapHearingEstimates,
	cancelHearing: mapCancelHearing,
	hearingDate: mapHearingDate
};
