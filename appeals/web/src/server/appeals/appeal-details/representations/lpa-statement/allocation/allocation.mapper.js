import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput, radiosInput } from '#lib/mappers/index.js';
import { ensureArray } from '#lib/array-utilities.js';
import { moveItemInArray } from '#lib/array-utilities.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @param {'valid' | 'redact'} flowRoute
 * @param {Record<string, string>} [sessionData]
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails, flowRoute, sessionData) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent} */
	const currentStatus = {
		type: 'inset-text',
		parameters: {
			html: `
        <p>Current status:</p>
        <ul>
          <li>Level ${appealDetails.allocationDetails?.level}</li>
          ${appealDetails.allocationDetails?.specialisms.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      `
		}
	};

	/** @type {PageComponent[]} */
	const pageComponents = [
		yesNoInput({
			name: 'allocationLevelAndSpecialisms',
			id: 'allocationLevelAndSpecialisms',
			legendText: 'Do you need to update the allocation level and specialisms?',
			legendTextSize: 'm',
			value: sessionData?.allocationLevelAndSpecialisms
		})
	];

	return {
		title: 'Allocation level',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement${
			flowRoute === 'valid' ? '' : `/${flowRoute}`
		}`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation level',
		submitButtonText: 'Continue',
		prePageComponents: appealDetails.allocationDetails ? [currentStatus] : [],
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {string[]} allocationLevels
 * @param {Record<string, string>} sessionData
 * @param {'valid' | 'redact'} flowRoute
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, allocationLevels, sessionData, flowRoute) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		radiosInput({
			name: 'allocationLevel',
			items: allocationLevels.map((l) => ({ text: l, value: l })),
			value: sessionData?.allocationLevel
		})
	];

	return {
		title: 'Allocation level',
		backLinkUrl: sessionData?.forcedAllocation
			? `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement${
					flowRoute === 'valid' ? '' : `/${flowRoute}`
			  }`
			: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/${flowRoute}/allocation-check`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation level',
		submitButtonText: 'Continue',
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {{ id: number, name: string }[]} specialisms
 * @param {Record<string, string>} sessionData
 * @returns {PageContent}
 * */
export function allocationSpecialismsPage(appealDetails, specialisms, sessionData) {
	// move "General allocation" to the top as per A2-1426
	let specialismsSorted = specialisms.slice();
	const generalAllocationIndex = specialisms.findIndex(
		(specialism) => specialism.name === 'General allocation'
	);
	if (generalAllocationIndex > 0) {
		specialismsSorted = moveItemInArray(specialismsSorted, generalAllocationIndex, 0);
	}

	const shortReference = appealShortReference(appealDetails.appealReference);

	const sessionSelections = (() => {
		const allocationSpecialisms = sessionData?.allocationSpecialisms;
		if (!allocationSpecialisms) {
			return [];
		}

		return ensureArray(allocationSpecialisms);
	})();

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'checkboxes',
			parameters: {
				name: 'allocationSpecialisms',
				id: 'allocationSpecialisms',
				items: specialismsSorted.map((s) => ({
					text: s.name,
					value: s.id,
					checked: sessionSelections.includes(String(s.id))
				}))
			}
		}
	];

	return {
		title: 'Allocation specialisms',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-level`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation specialisms',
		submitButtonText: 'Continue',
		pageComponents
	};
}
