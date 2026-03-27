import { APPEAL_TYPE, FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { isAppealTypeEnabled } from './feature-flags-appeal-types.js';
import { isFeatureActive } from './feature-flags.js';

/**
 *
 * @param {boolean} [linked]
 * @returns Array<string>
 */
export const getEnabledInquiryAppealTypes = (linked = false) => {
	let enabledInquiryAppealTypes = [];
	let enabledLinkedInquiryAppealTypes = [];

	if (
		isAppealTypeEnabled(APPEAL_TYPE.S78) &&
		isFeatureActive(FEATURE_FLAG_NAMES.SECTION_78_INQUIRY)
	) {
		enabledInquiryAppealTypes.push(APPEAL_TYPE.S78);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.PLANNED_LISTED_BUILDING) &&
		isFeatureActive(FEATURE_FLAG_NAMES.S20_INQUIRY)
	) {
		enabledInquiryAppealTypes.push(APPEAL_TYPE.PLANNED_LISTED_BUILDING);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.ENFORCEMENT_NOTICE) &&
		isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_INQUIRY)
	) {
		enabledInquiryAppealTypes.push(APPEAL_TYPE.ENFORCEMENT_NOTICE);
		if (isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_INQUIRY_LINKED)) {
			enabledLinkedInquiryAppealTypes.push(APPEAL_TYPE.ENFORCEMENT_NOTICE);
		}
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE) &&
		isFeatureActive(FEATURE_FLAG_NAMES.LDC_INQUIRY)
	) {
		enabledInquiryAppealTypes.push(APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE);
	}

	if (
		isAppealTypeEnabled(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING) &&
		isFeatureActive(FEATURE_FLAG_NAMES.ELB_INQUIRY)
	) {
		enabledInquiryAppealTypes.push(APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING);
	}

	return linked ? enabledLinkedInquiryAppealTypes : enabledInquiryAppealTypes;
};
