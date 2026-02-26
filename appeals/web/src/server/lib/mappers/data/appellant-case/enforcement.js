import { mapAppealDecisionDate } from '#lib/mappers/data/appellant-case/submappers/appeal-decision-date.js';
import { mapApplicationDevelopmentAllOrPart } from '#lib/mappers/data/appellant-case/submappers/application-development-all-or-part.js';
import { mapGroundAFeeReceipt } from '#lib/mappers/data/appellant-case/submappers/ground-a-fee-receipt.js';
import { submaps as enforcementListedSubmaps } from './enforcement-listed.js';
import { mapOtherAppellants } from './submappers/other-appellants.js';
import { mapRetrospectiveApplication } from './submappers/retrospective-application.js';
import { mapWrittenOrVerbalPermission } from './submappers/written-or-verbal-permission.js';

/** @type {Record<string, import('./mapper.js').SubMapper | import('./mapper.js').SubMapperList>} */
export const submaps = {
	...enforcementListedSubmaps,
	otherAppellants: mapOtherAppellants,
	writtenOrVerbalPermission: mapWrittenOrVerbalPermission,
	retrospectiveApplication: mapRetrospectiveApplication,
	groundAFeeReceipt: mapGroundAFeeReceipt,
	applicationDevelopmentAllOrPart: mapApplicationDevelopmentAllOrPart,
	appealDecisionDate: mapAppealDecisionDate
};
