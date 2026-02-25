import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { ensureArray } from '#lib/array-utilities.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';

/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import('#appeals/appeal-details/representations/types.js').Representation} Representation */
/** @typedef {import('../../../../../app/auth/auth-session.service.js').SessionWithAuth} SessionWithAuth */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} rule6PartyStatement
 * @param {import('#lib/api/allocation-details.api.js').AllocationDetailsSpecialism[]} specialismData
 * @param {SessionWithAuth & { acceptRule6PartyStatement?: { [key: number]: { allocationLevelAndSpecialisms: string, allocationLevel: string, allocationSpecialisms: string[], forcedAllocation: boolean } } }} session
 * @param {string} rule6PartyId
 * @returns {PageContent}
 * */
export const confirmPage = (
	appealDetails,
	rule6PartyStatement,
	specialismData,
	session,
	rule6PartyId
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);
	const sessionData = session.acceptRule6PartyStatement?.[appealDetails.appealId];
	const updatingAllocation = sessionData?.allocationLevelAndSpecialisms === 'yes';

	const specialisms = (() => {
		if (!sessionData?.allocationSpecialisms) {
			return [];
		}

		const items = ensureArray(sessionData.allocationSpecialisms);

		return items.map((item) => specialismData.find((s) => s.id === parseInt(item))?.name);
	})();

	const filteredAttachments = rule6PartyStatement.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList =
		filteredAttachments.length > 0
			? buildHtmlList({
					items: filteredAttachments.map(
						(a) =>
							`<a class="govuk-link" href="${mapDocumentDownloadUrl(
								a.documentVersion.document.caseId,
								a.documentVersion.document.guid,
								a.documentVersion.document.name
							)}" target="_blank">${a.documentVersion.document.name}</a>`
					),
					isOrderedList: true,
					isNumberedList: filteredAttachments.length > 1
				})
			: null;

	const folderId = filteredAttachments?.[0]?.documentVersion?.document?.folderId ?? null;

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
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
										html: newLine2LineBreak(rule6PartyStatement.originalRepresentation),
										labelText: 'Statement'
									}
								}
							]
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/redact`,
									text: 'Redact',
									visuallyHiddenText: 'Redact statement'
								}
							]
						}
					},
					{
						key: { text: 'Supporting documents' },
						value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
						actions: {
							items: [
								...(rule6PartyStatement.attachments?.length > 0
									? [
											{
												text: 'Manage',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/manage-documents/${folderId}?backUrl=/rule-6-party-statement/${rule6PartyId}/valid/confirm`,
												visuallyHiddenText: 'supporting documents'
											}
										]
									: []),
								{
									text: 'Add',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/add-document?backUrl=/rule-6-party-statement/${rule6PartyId}/valid/confirm`,
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
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}`,
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
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-check`,
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
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-level`,
												visuallyHiddenText: 'allocation level'
											}
										]
									}
								},
								{
									key: { text: 'Allocation specialisms' },
									value: {
										html:
											specialisms.length === 1
												? specialisms[0]
												: `<ul class="govuk-list govuk-list--bullet">
												${specialisms.map((s) => `<li>${s}</li>`).join('')}
											</ul>`
									},
									actions: {
										items: [
											{
												text: 'Change',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-specialisms`,
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
		title: `Check details and accept ${rule6PartyStatement.author} statement`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/rule-6-party-statement/${rule6PartyId}/valid/allocation-specialisms`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and accept ${rule6PartyStatement.author} statement`,
		submitButtonProperties: {
			text: 'Accept statement',
			type: 'submit',
			preventDoubleClick: true
		},
		pageComponents
	};
};
