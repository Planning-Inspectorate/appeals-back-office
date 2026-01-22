/** @typedef {import('@pins/appeals.api').Schema.ServiceUser} ServiceUser */
/** @typedef {import('#mappers/mapper-factory.js').MappingRequest} MappingRequest */

import { isFeatureActive } from '#utils/feature-flags.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';

/**
 *
 * @param {MappingRequest} data
 * @returns {{otherAppellants: ServiceUser[] | null}}
 */
export const mapEnforcementAppealOtherAppellants = (data) => {
	const {
		appeal: { appellantCase, appellant, agent },
		linkedAppeals
	} = data;

	let otherAppellants = [];

	if (!isFeatureActive(FEATURE_FLAG_NAMES.ENFORCEMENT_LINKED)) {
		const linkedAppellants = linkedAppeals?.map(({ child }) => child.appellant) || [];
		const parentAppellant = linkedAppeals?.length && linkedAppeals[0].parent.appellant;

		if (parentAppellant) {
			linkedAppellants.unshift(parentAppellant);
		}

		otherAppellants = linkedAppellants.filter(
			(otherAppellant) => ![appellant?.id, agent?.id].includes(otherAppellant.id)
		);
	}

	// @ts-ignore
	const hasEnforcementData = [true, false].includes(appellantCase?.enforcementNotice);
	return {
		// @ts-ignore
		otherAppellants: hasEnforcementData ? otherAppellants : null
	};
};
