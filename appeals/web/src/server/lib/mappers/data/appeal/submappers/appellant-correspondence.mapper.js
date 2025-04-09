import { userHasPermission } from '#lib/mappers/utils/permissions.mapper.js';
import { documentSummaryListItem } from '#lib/mappers/components/instructions/document.js';
import { permissionNames } from '#environment/permissions.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantCorrespondence = ({ appealDetails, currentRoute, session }) =>
	documentSummaryListItem({
		id: 'appellant-correspondence',
		text: 'Appellant correspondence',
		appealId: appealDetails.appealId,
		folderInfo: appealDetails.costs?.appellantCorrespondenceFolder,
		displayMode: 'number',
		editable: userHasPermission(permissionNames.viewCaseDetails, session),
		uploadUrlTemplate: `${currentRoute}/internal-correspondence/appellant/upload-documents/${appealDetails.costs?.appellantCorrespondenceFolder?.folderId}`,
		manageUrl: `${currentRoute}/internal-correspondence/appellant/manage-documents/${appealDetails.costs?.appellantCorrespondenceFolder?.folderId}`
	});
