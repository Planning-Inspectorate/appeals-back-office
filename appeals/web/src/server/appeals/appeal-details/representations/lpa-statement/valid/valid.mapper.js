import { checkYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
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
 * @param {SessionWithAuth & { acceptLPAStatement?: Record<string, string> }} session
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, lpaStatement, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		radiosInput({
			name: 'allocationLevel',
			items: ALLOCATION_LEVELS.map((l) => ({ text: l, value: l })),
			value: session.acceptLPAStatement?.allocationLevel
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
 * @param {SessionWithAuth & { acceptLPAStatement?: Record<string, string> }} session
 * */
export function allocationSpecialismsPage(appealDetails, specialisms, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const sessionSelections = (() => {
		const allocationSpecialisms = session.acceptLPAStatement?.allocationSpecialisms;
		if (!allocationSpecialisms) {
			return [];
		}

		return Array.isArray(allocationSpecialisms) ? allocationSpecialisms : [allocationSpecialisms];
	})();

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

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {SessionWithAuth & { acceptLPAStatement?: { allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[] } }} session
 * @returns {PageContent}
 * */
export const confirmPage = (appealDetails, lpaStatement, session) => {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.acceptLPAStatement;
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		return Array.isArray(sessionData.allocationSpecialisms)
			? sessionData.allocationSpecialisms
			: [sessionData.allocationSpecialisms];
	})();

	return checkYourAnswersComponent({
		title: 'Check details and accept LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-specialisms`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Check details and accept LPA statement',
		submitButtonText: 'Accept LPA statement',
		responses: {
			Statement: {
				html: lpaStatement.redactedRepresentation || lpaStatement.originalRepresentation
				// TODO: Add code for truncating long text with 'Show more' button
			},
			'Supporting documents': {
				actions: {
					Change: '#'
				}
				// TODO: Add document links
			},
			'Review decision': {
				value: 'Accept statement',
				actions: {
					Change: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`
				}
			},
			'Do you need to update the allocation level and specialisms?': {
				value: updatingAllocation ? 'Yes' : 'No',
				actions: {
					Change: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-check`
				}
			},
			...(updatingAllocation
				? {
						'Allocation level': {
							value: sessionData.allocationLevel,
							actions: {
								Change: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-level`
							}
						},
						'Allocation specialisms': {
							html: `<ul class="govuk-list govuk-list--bullet">
            ${specialisms.map((s) => `<li>${s}</li>`)}
          </ul>`,
							actions: {
								Change: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-specialisms`
							}
						}
				  }
				: {})
		}
	});
};
