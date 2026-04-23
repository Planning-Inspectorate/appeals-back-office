import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

/**
 * @param {string | null | undefined} appealUnderActSection
 * @returns {string | null | undefined}
 */
export const formatAppealUnderActSection = (appealUnderActSection) => {
	switch (appealUnderActSection) {
		case APPEAL_APPEAL_UNDER_ACT_SECTION.EXISTING_DEVELOPMENT:
			return 'Existing development (section 191)';
		case APPEAL_APPEAL_UNDER_ACT_SECTION.PROPOSED_CHANGES_TO_A_LISTED_BUILDING:
			return 'Proposed changes to a listed building (section 26H)';
		case APPEAL_APPEAL_UNDER_ACT_SECTION.PROPOSED_USE_OF_A_DEVELOPMENT:
			return 'Proposed use of a development (section 192)';
	}
};
