import { permissionNames } from '#environment/permissions.js';
import { documentSummaryListItem } from '#lib/mappers/components/instructions/document.js';
import { userHasPermission } from '#lib/mappers/utils/permissions.mapper.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapMainPartyCorrespondence = ({ appealDetails, currentRoute, session }) =>
	documentSummaryListItem({
		id: 'main-party-correspondence',
		text: 'Main party correspondence',
		appealId: appealDetails.appealId,
		folderInfo: appealDetails.internalCorrespondence?.mainParty,
		displayMode: 'number',
		editable: userHasPermission(permissionNames.viewCaseDetails, session),
		uploadUrlTemplate: `${currentRoute}/internal-correspondence/main-party/upload-documents/${appealDetails.internalCorrespondence?.mainParty?.folderId}`,
		manageUrl: `${currentRoute}/internal-correspondence/main-party/manage-documents/${appealDetails.internalCorrespondence?.mainParty?.folderId}`
	});
