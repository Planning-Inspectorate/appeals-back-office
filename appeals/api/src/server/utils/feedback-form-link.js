import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';

export const FEEDBACK_FORM_LINKS = {
	ALL: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UOUlNRkhaQjNXTDQyNEhSRExNOFVGSkNJTS4u',

	S78: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQzg1SlNPQjA3V0FDNUFJTldHMlEzMDdMRS4u',

	HAS: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UQ0wyTE9UVDIyWlVaQlBBTEM0TFYyU01YVC4u',

	S20: 'https://forms.office.com/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UjI0R09ONVRVNVJZVk9XMzBYTFo2RDlQUy4u',

	CAS_PLANNING:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5URE1RMzFNSVQzUjBWRlQ2VFFPUTI3TkVSVC4u',

	CAS_ADVERTS:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UOVZRWTJSOUdWUDk3T0owQTVFNExTUzlVSC4u',

	FULL_ADVERTS:
		'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UREdSMUZXUFhUMUdBUERBUFFGVkRQVEFBTS4u',

	LPA: 'https://forms.office.com.mcas.ms/Pages/ResponsePage.aspx?id=mN94WIhvq0iTIpmM5VcIjYt1ax_BPvtOqhVjfvzyJN5UNzVFTElMSEJIWlhXWkZFM1E1WDg3RTFPUy4u'
};

/**
 * @param {string} appealKey
 * @returns {string}
 */
export function getFeedbackLinkFromAppealType(appealKey) {
	switch (appealKey) {
		case APPEAL_CASE_TYPE.W: // S78
			return FEEDBACK_FORM_LINKS.S78;

		case APPEAL_CASE_TYPE.D: // HAS householder
			return FEEDBACK_FORM_LINKS.HAS;

		case APPEAL_CASE_TYPE.Y: // S20 listed building
			return FEEDBACK_FORM_LINKS.S20;

		case APPEAL_CASE_TYPE.ZP: // CAS Planning
			return FEEDBACK_FORM_LINKS.CAS_PLANNING;

		case APPEAL_CASE_TYPE.ZA: // CAS Adverts
			return FEEDBACK_FORM_LINKS.CAS_ADVERTS;

		case APPEAL_CASE_TYPE.H: // Full Adverts
			return FEEDBACK_FORM_LINKS.FULL_ADVERTS;

		default:
			return FEEDBACK_FORM_LINKS.ALL;
	}
}
