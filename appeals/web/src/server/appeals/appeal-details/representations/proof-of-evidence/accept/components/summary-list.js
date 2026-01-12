/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} proofOfEvidence
 * @param {string} proofOfEvidenceType
 * @param {string|null} attachmentsList
 * @param {import("../../proof-of-evidence.middleware.js").AppealRule6Party} rule6Party
 * @returns {PageComponent}
 */
export const summaryList = (
	appealDetails,
	proofOfEvidence,
	proofOfEvidenceType,
	attachmentsList,
	rule6Party
) => ({
	type: 'summary-list',
	wrapperHtml: {
		opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
		closing: '</div></div>'
	},
	parameters: {
		rows: [
			{
				key: { text: 'Proof of evidence and witnesses' },
				value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
				actions: {
					items: [
						{
							text: 'Change',
							href: `/appeals-service/appeal-details/${
								appealDetails.appealId
							}/proof-of-evidence/${proofOfEvidenceType}${
								proofOfEvidenceType === 'rule-6-party' ? `/${rule6Party.id}` : ''
							}/manage-documents/${
								proofOfEvidence.attachments?.[0]?.documentVersion?.document?.folderId
							}/?backUrl=/proof-of-evidence/${proofOfEvidenceType}${
								proofOfEvidenceType === 'rule-6-party' ? `/${rule6Party.id}` : ''
							}/accept`,
							visuallyHiddenText: 'proof of evidence and witnesses'
						}
					]
				}
			},
			{
				key: { text: 'Review decisions' },
				value: { text: 'Accept proof of evidence and witnesses' },
				actions: {
					items: [
						{
							text: 'Change',
							href: `/appeals-service/appeal-details/${
								appealDetails.appealId
							}/proof-of-evidence/${proofOfEvidenceType}${
								proofOfEvidenceType === 'rule-6-party' ? `/${rule6Party.id}` : ''
							}?backUrl=/appeals-service/appeal-details/${
								appealDetails.appealId
							}/proof-of-evidence/${proofOfEvidenceType}${
								proofOfEvidenceType === 'rule-6-party' ? `/${rule6Party.id}` : ''
							}/accept`
						}
					]
				}
			}
		]
	}
});
