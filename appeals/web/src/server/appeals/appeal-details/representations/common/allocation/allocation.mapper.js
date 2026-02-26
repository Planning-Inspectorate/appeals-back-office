import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray, moveItemInArray } from '#lib/array-utilities.js';
import { radiosInput, yesNoInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Record<string, string>} [sessionData]
 * @param {string} [backLinkUrl]
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails, sessionData, backLinkUrl) {
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
		backLinkUrl,
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
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, allocationLevels, sessionData, backLinkUrl) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		radiosInput({
			name: 'allocationLevel',
			items: allocationLevels.map((l) => ({ text: l, value: l })),
			value: sessionData?.allocationLevel || appealDetails.allocationDetails?.level
		})
	];

	return {
		title: 'Allocation level',
		backLinkUrl,
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
 * @param {string} backLinkUrl
 * @returns {PageContent}
 * */
export function allocationSpecialismsPage(appealDetails, specialisms, sessionData, backLinkUrl) {
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
		if (allocationSpecialisms) {
			return ensureArray(allocationSpecialisms).map(String);
		}

		if (appealDetails.allocationDetails?.specialisms) {
			return appealDetails.allocationDetails.specialisms
				.map((name) => {
					const specialism = specialisms.find((s) => s.name === name);
					return specialism ? String(specialism.id) : null;
				})
				.filter(Boolean);
		}

		return [];
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
		backLinkUrl,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation specialisms',
		submitButtonText: 'Continue',
		pageComponents
	};
}
