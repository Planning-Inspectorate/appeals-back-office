import { mapAppellantProofOfEvidence } from '#lib/mappers/data/appeal/submappers/appellant-proof-of-evidence-and-witness.mapper.js';
import { mapLPAProofOfEvidence } from '#lib/mappers/data/appeal/submappers/lpa-proof-of-evidence-and-witness.mapper.js';
import { submaps as hasSubmaps } from './has.js';
import { mapAppellantFinalComments } from './submappers/appellant-final-comments.mapper.js';
import { mapAppellantStatement } from './submappers/appellant-statement.mapper.js';
import { mapCostsRule6Parties } from './submappers/costs-rule-6-parties.mapper.js';
import { mapEnvironmentalAssessment } from './submappers/environmental-assessment.mapper.js';
import { mapFinalCommentDueDate } from './submappers/final-comment-due-date.mapper.js';
import { mapAddHearingEstimates } from './submappers/hearing-add-hearing-estimates.js';
import { mapCancelHearing } from './submappers/hearing-cancel-hearing.js';
import { mapHearingDate } from './submappers/hearing-date.mapper.js';
import { mapHearingDetails } from './submappers/hearing-details.js';
import { mapHearingEstimates } from './submappers/hearing-hearing-estimates.js';
import { mapSetUpHearing } from './submappers/hearing-set-up-hearing.js';
import { mapHorizonReference } from './submappers/horizon-reference.mapper.js';
import { mapAddInquiryEstimates } from './submappers/inquiry-add-inquiry-estimates.js';
import { mapCancelInquiry } from './submappers/inquiry-cancel-inquiry.js';
import { mapInquiryDate } from './submappers/inquiry-date.mapper.js';
import { mapInquiryDetails } from './submappers/inquiry-details.js';
import { mapInquiryEstimates } from './submappers/inquiry-inquiry-estimates.js';
import { mapSetUpInquiry } from './submappers/inquiry-set-up-inquiry.js';
import { mapIpCommentsDueDate } from './submappers/ip-comments-due-date.mapper.js';
import { mapIpComments } from './submappers/ip-comments.mapper.js';
import { mapLPAFinalComments } from './submappers/lpa-final-comments.mapper.js';
import { mapLpaStatementDueDate } from './submappers/lpa-statement-due-date.mapper.js';
import { mapLpaStatement } from './submappers/lpa-statement.mapper.js';
import { mapNetResidenceChange } from './submappers/net-residence-change.mapper.js';
import { mapNetResidenceGainOrLoss } from './submappers/net-residence-gain-or-less.mapper.js';
import { mapPlanningObligationDueDate } from './submappers/planning-obligation-due-date.mapper.js';
import { mapProofOfEvidenceAndWitnessesDueDate } from './submappers/proof-of-evidence-and-witnesses-due-date.mapper.js';
import { mapRule6PartyContactDetails } from './submappers/rule-6-party-contact-details.mapper.js';
import { mapRule6PartyProofs } from './submappers/rule-6-party-proofs.mapper.js';
import { mapRule6PartyStatements } from './submappers/rule-6-party-statements.mapper.js';
import { mapStatementOfCommonGroundDueDate } from './submappers/statement-of-common-ground-due-date.mapper.js';

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
	proofOfEvidenceAndWitnessesDueDate: mapProofOfEvidenceAndWitnessesDueDate,
	appellantFinalComments: mapAppellantFinalComments,
	lpaFinalComments: mapLPAFinalComments,
	environmentalAssessment: mapEnvironmentalAssessment,
	setUpHearing: mapSetUpHearing,
	addInquiryEstimates: mapAddInquiryEstimates,
	inquiryEstimates: mapInquiryEstimates,
	inquiryDetails: mapInquiryDetails,
	hearingDetails: mapHearingDetails,
	addHearingEstimates: mapAddHearingEstimates,
	hearingEstimates: mapHearingEstimates,
	cancelHearing: mapCancelHearing,
	hearingDate: mapHearingDate,
	inquiryDate: mapInquiryDate,
	netResidenceChange: mapNetResidenceChange,
	netResidenceGainOrLoss: mapNetResidenceGainOrLoss,
	appellantProofOfEvidence: mapAppellantProofOfEvidence,
	lpaProofOfEvidence: mapLPAProofOfEvidence,
	horizonReference: mapHorizonReference,
	cancelInquiry: mapCancelInquiry,
	setUpInquiry: mapSetUpInquiry,
	rule6PartyContactDetails: mapRule6PartyContactDetails,
	rule6PartyStatements: mapRule6PartyStatements,
	rule6PartyProofs: mapRule6PartyProofs,
	costsRule6Parties: mapCostsRule6Parties,
	appellantStatement: mapAppellantStatement
};
