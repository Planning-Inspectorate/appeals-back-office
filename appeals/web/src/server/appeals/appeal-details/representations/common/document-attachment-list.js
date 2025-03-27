/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';

export const getAttachmentList = (/** @type {Representation} */ representation) => {
	const filteredAttachments = representation.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	return filteredAttachments.length > 0
		? buildHtmUnorderedList(
				filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				)
		  )
		: null;
};
