import * as displayPageFormatter from '#lib/display-page-formatter.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapInspectorCorrespondence = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) => ({
	id: 'inspector-correspondence',
	display: {
		summaryListItem: {
			key: {
				text: 'Inspector correspondence'
			},
			actions: {
				items:
					appealDetails.internalCorrespondence?.inspector?.documents &&
					appealDetails.internalCorrespondence?.inspector?.documents.length > 0
						? [
								{
									text: 'Manage',
									visuallyHiddenText: 'inspector correspondence documents',
									href: `${currentRoute}/internal-correspondence/inspector/manage-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
								},
								...(userHasUpdateCasePermission
									? [
											{
												text: 'Add',
												visuallyHiddenText: 'inspector correspondence documents',
												href: displayPageFormatter.formatDocumentActionLink(
													appealDetails.appealId,
													appealDetails.internalCorrespondence?.inspector,
													`${currentRoute}/internal-correspondence/inspector/upload-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
												)
											}
									  ]
									: [])
						  ]
						: [
								...(userHasUpdateCasePermission
									? [
											{
												text: 'Add',
												visuallyHiddenText: 'inspector correspondence documents',
												href: displayPageFormatter.formatDocumentActionLink(
													appealDetails.appealId,
													appealDetails.internalCorrespondence?.inspector,
													`${currentRoute}/internal-correspondence/inspector/upload-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
												)
											}
									  ]
									: [])
						  ]
			}
		}
	}
});
