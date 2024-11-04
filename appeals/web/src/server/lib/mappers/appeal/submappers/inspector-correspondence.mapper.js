import { permissionNames } from '#environment/permissions.js';
import { documentSummaryListItem } from '#lib/mappers/components/instructions/document.js';
import { userHasPermission } from '#lib/mappers/utils/permissions.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapInspectorCorrespondence = ({ appealDetails, currentRoute, session }) =>
	documentSummaryListItem({
		id: 'inspector-correspondence',
		text: 'Inspector correspondence',
		appealId: appealDetails.appealId,
		folderInfo: appealDetails.internalCorrespondence?.inspector,
		showDocuments: false,
		editable: userHasPermission(permissionNames.viewCaseDetails, session),
		uploadUrlTemplate: `${currentRoute}/internal-correspondence/inspector/upload-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`,
		manageUrl: `${currentRoute}/internal-correspondence/inspector/manage-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
	});
