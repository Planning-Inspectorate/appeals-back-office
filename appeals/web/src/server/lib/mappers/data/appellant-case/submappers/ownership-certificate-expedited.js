import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapOwnershipCertificateExpedited = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	booleanSummaryListItem({
		id: 'ownership-certificate-expedited',
		text: 'Did you submit a separate ownership certificate and agricultural land declaration with your application?',
		value: appellantCaseData.ownershipCertificate,
		link: `${currentRoute}/ownership-certificate/change`,
		editable: userHasUpdateCase
	});
