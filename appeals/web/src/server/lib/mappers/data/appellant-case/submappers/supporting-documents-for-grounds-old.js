// @ts-nocheck
import { textSummaryListItem } from '#lib/mappers/index.js';

/** @typedef {import('@pins/appeals.api').Schema.AppealGround} AppealGround */
/** @typedef {import('@pins/appeals.api').Schema.Document} AppealGroundAttachment */

/**
 *
 * @param {AppealGroundAttachment} attachment
 * @returns {string}
 */
const formatAttachment = (attachment) => {
	return attachment.documentVersion.fileName;
};

/**
 *
 * @param {AppealGroundAttachment} attachments
 * @returns {string}
 */
const formatSupportingDocumentsAsHtmlList = (attachments) => {
	return attachments.length === 1
		? formatAttachment(attachments[0])
		: `<ul class="govuk-list govuk-list--bullet">
	${attachments.map((attachment) => '<li>' + formatAttachment(attachment) + '</li>').join('')}</ul>`;
};

/** @type {import('../mapper.js').SubMapperList} */
export const mapSupportingDocumentsForGroundsOld = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	// @ts-ignore
	const { appealGrounds } = appellantCaseData;

	// @ts-ignore
	return appealGrounds.map((appealGround) => {
		const { ground, appealGroundAttachments = [] } = appealGround || {};
		const hasData = !!appealGroundAttachments;
		const actionText = appealGroundAttachments?.length ? 'Change' : 'Add';
		const { groundRef } = ground || {};
		const id = `supporting-documents-for-ground-${groundRef}`;
		return textSummaryListItem({
			id,
			text: `Ground (${groundRef}) supporting documents (Older format)`,
			value: {
				html: !hasData
					? 'No data'
					: appealGroundAttachments?.length
					? // @ts-ignore
					  formatSupportingDocumentsAsHtmlList(appealGroundAttachments)
					: 'No documents'
			},
			link: `${currentRoute}/ground/${groundRef}/supporting-documents/${actionText.toLowerCase()}`,
			editable: hasData && userHasUpdateCase,
			classes: 'supporting-documents-for-ground',
			actionText,
			cypressDataName: id
		});
	});
};
