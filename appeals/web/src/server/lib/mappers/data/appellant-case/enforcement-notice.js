import { submaps as s78Submaps } from './s78.js';
import { mapContactAddress } from './submappers/contact-address.js';
import { mapContactPlanningInspectorateDate } from './submappers/contact-planning-inspectorate-date.js';
import { mapDescriptionOfAllegedBreach } from './submappers/description-of-alleged-breach.js';
import { mapEnforcementEffectiveDate } from './submappers/enforcement-effective-date.js';
import { mapEnforcementIssueDate } from './submappers/enforcement-issue-date.js';
import { mapEnforcementNoticeListedBuilding } from './submappers/enforcement-notice-listed-building.js';
import { mapEnforcementNotice } from './submappers/enforcement-notice.js';
import { mapEnforcementReference } from './submappers/enforcement-reference.js';
import { mapFactsForGrounds } from './submappers/facts-for-grounds.js';
import { mapGrounds } from './submappers/grounds.js';
import { mapInterestInLand } from './submappers/interest-in-land.js';
import { mapOtherAppellants } from './submappers/other-appellants.js';
import { mapSupportingDocumentsForGrounds } from './submappers/supporting-documents-for-grounds.js';
import { mapWrittenOrVerbalPermission } from './submappers/written-or-verbal-permission.js';

/** @type {Record<string, import('./mapper.js').SubMapper | import('./mapper.js').SubMapperList>} */
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
	descriptionOfAllegedBreach: mapDescriptionOfAllegedBreach,
	otherAppellants: mapOtherAppellants,
	grounds: mapGrounds,
	factsForGrounds: mapFactsForGrounds,
	supportingDocumentsForGrounds: mapSupportingDocumentsForGrounds
};
