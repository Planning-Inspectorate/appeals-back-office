import { mapContactAddress } from '#lib/mappers/data/appellant-case/submappers/contact-address.js';
import { mapInterestInLand } from '#lib/mappers/data/appellant-case/submappers/interest-in-land.js';
import { mapOtherAppellants } from '#lib/mappers/data/appellant-case/submappers/other-appellants.js';
import { mapWrittenOrVerbalPermission } from '#lib/mappers/data/appellant-case/submappers/written-or-verbal-permission.js';
import { submaps as s78Submaps } from './s78.js';
import { mapContactPlanningInspectorateDate } from './submappers/contact-planning-inspectorate-date.js';
import { mapEnforcementEffectiveDate } from './submappers/enforcement-effective-date.js';
import { mapEnforcementIssueDate } from './submappers/enforcement-issue-date.js';
import { mapEnforcementNoticeListedBuilding } from './submappers/enforcement-notice-listed-building.js';
import { mapEnforcementNotice } from './submappers/enforcement-notice.js';
import { mapEnforcementReference } from './submappers/enforcement-reference.js';

/** @type {Record<string, import('./mapper.js').SubMapper>} */
export const submaps = {
	...s78Submaps,
	enforcementNotice: mapEnforcementNotice,
	enforcementNoticeListedBuilding: mapEnforcementNoticeListedBuilding,
	enforcementIssueDate: mapEnforcementIssueDate,
	enforcementEffectiveDate: mapEnforcementEffectiveDate,
	contactPlanningInspectorateDate: mapContactPlanningInspectorateDate,
	enforcementReference: mapEnforcementReference,
	contactAddress: mapContactAddress,
	interestInLand: mapInterestInLand,
	writtenOrVerbalPermission: mapWrittenOrVerbalPermission,
	otherAppellants: mapOtherAppellants
};
