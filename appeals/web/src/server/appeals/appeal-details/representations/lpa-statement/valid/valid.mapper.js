import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { yesNoInput, radiosInput } from '#lib/mappers/index.js';
import { ensureArray } from '#lib/array-utilities.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @returns {PageContent}
 */
export function allocationCheckPage(appealDetails) {
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
		...(appealDetails.allocationDetails ? [currentStatus] : []),
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
 * @param {string[]} allocationLevels
 * @param {SessionWithAuth & { acceptLPAStatement?: Record<string, string> }} session
 * @returns {PageContent}
 * */
export function allocationLevelPage(appealDetails, lpaStatement, allocationLevels, session) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	/** @type {PageComponent[]} */
	const pageComponents = [
		radiosInput({
			name: 'allocationLevel',
			items: allocationLevels.map((l) => ({ text: l, value: l })),
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

		return ensureArray(allocationSpecialisms);
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
					value: s.id,
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
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {SessionWithAuth & { acceptLPAStatement?: { allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[] } }} session
 * @returns {PageContent}
 * */
export const confirmPage = (appealDetails, lpaStatement, specialismData, session) => {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.acceptLPAStatement;
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		const items = ensureArray(sessionData.allocationSpecialisms);

		return items.map((item) => specialismData.find((s) => s.id === parseInt(item))?.name);
	})();

	const attachmentsList =
		lpaStatement.attachments.length > 0
			? buildHtmUnorderedList(
					lpaStatement.attachments.map(
						(a) => `<a class="govuk-list" href="#">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				rows: [
					{
						key: { text: 'Statement' },
						value: {
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										text: lpaStatement.originalRepresentation,
										labelText: 'Statement'
									}
								}
							]
						}
					},
					{
						key: { text: 'Supporting documents' },
						value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
						actions: {
							items: [
								...(lpaStatement.attachments?.length > 0
									? [
											{
												text: 'Manage',
												href: `#`,
												visuallyHiddenText: 'supporting documents'
											}
									  ]
									: []),
								{
									text: 'Add',
									href: `#`,
									visuallyHiddenText: 'supporting documents'
								}
							]
						}
					},
					{
						key: { text: 'Review decision' },
						value: { text: 'Accept statement' },
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement`,
									visuallyHiddenText: 'review decision'
								}
							]
						}
					},
					{
						key: { text: 'Do you need to update the allocation level and specialisms?' },
						value: { text: updatingAllocation ? 'Yes' : 'No' },
						actions: {
							items: [
								{
									text: 'Change',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-check`,
									visuallyHiddenText: 'allocation level and specialisms'
								}
							]
						}
					},
					...(updatingAllocation
						? [
								{
									key: { text: 'Allocation level' },
									value: { text: sessionData.allocationLevel },
									actions: {
										items: [
											{
												text: 'Change',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-level`,
												visuallyHiddenText: 'allocation level'
											}
										]
									}
								},
								{
									key: { text: 'Allocation specialisms' },
									value: {
										html: `<ul class="govuk-list govuk-list--bullet">
                    ${specialisms.map((s) => `<li>${s}</li>`).join('')}
                  </ul>`
									},
									actions: {
										items: [
											{
												text: 'Change',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-specialisms`,
												visuallyHiddenText: 'allocation specialisms'
											}
										]
									}
								}
						  ]
						: [])
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	return {
		title: 'Check details and accept LPA statement',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/valid/allocation-specialisms`,
		preHeading: `Appeal ${shortReference}`,
		heading: 'Check details and accept LPA statement',
		submitButtonText: 'Accept LPA statement',
		pageComponents
	};
};
