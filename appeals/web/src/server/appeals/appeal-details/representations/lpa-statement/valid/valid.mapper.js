import { appealShortReference } from '#lib/appeals-formatter.js';
import { yesNoInput, radiosInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

export const ALLOCATION_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		yesNoInput({
			name: 'allocationLevelAndSpecialisms',
			id: 'allocationLevelAndSpecialisms',
			legendText: 'Do you need to update the allocation level and specialisms?'
		})
	];

	return {
		title: 'Allocation level and specialisms',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation level and specialisms',
		submitButtonText: 'Continue',
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {SessionWithAuth & Record<string, string>} session
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, lpaStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		radiosInput({
			name: 'allocationLevel',
			items: ALLOCATION_LEVELS.map((l) => ({ text: l, value: l })),
			value: session.allocationLevel
		})
	];

	return {
		title: 'Allocation level',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-check`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Allocation level',
		submitButtonText: 'Continue',
		pageComponents
	};
}

/**
 * @param {Appeal} appealDetails
 * @param {{ id: number, name: string }[]} specialisms
 * @param {SessionWithAuth & Record<string, string>} session
 * */
export function allocationSpecialismsPage(appealDetails, specialisms, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const sessionSelections = Array.isArray(session.allocationSpecialisms)
		? session.allocationSpecialisms
		: [session.allocationSpecialisms];

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'checkboxes',
			parameters: {
				name: 'allocationSpecialisms',
				id: 'allocationSpecialisms',
				items: specialisms.map((s) => ({
					text: s.name,
					value: s.name,
					checked: sessionSelections.includes(s.name)
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
