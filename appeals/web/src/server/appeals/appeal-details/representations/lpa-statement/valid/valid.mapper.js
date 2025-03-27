import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { ensureArray } from '#lib/array-utilities.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} lpaStatement
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {SessionWithAuth & { acceptLPAStatement?: { allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[], forcedAllocation: boolean } }} session
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
						(a) =>
							`<a class="govuk-link" href="${mapDocumentDownloadUrl(
								a.documentVersion.document.caseId,
								a.documentVersion.document.guid,
								a.documentVersion.document.name
							)}" target="_blank">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	const folderId = lpaStatement.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

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
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/manage-documents/${folderId}?backUrl=/lpa-statement/valid/confirm`,
												visuallyHiddenText: 'supporting documents'
											}
									  ]
									: []),
								{
									text: 'Add',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/lpa-statement/add-document?backUrl=/lpa-statement/valid/confirm`,
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
					...(sessionData?.forcedAllocation
						? []
						: [
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
								}
						  ]),
					...(sessionData?.allocationLevel && specialisms.length
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
