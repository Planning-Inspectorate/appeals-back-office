import { userHasPermission } from '#lib/mappers/utils/permissions.mapper.js';
import { documentSummaryListItem } from '#lib/mappers/components/instructions/document.js';
import { permissionNames } from '#environment/permissions.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapCrossTeamCorrespondence = ({ appealDetails, currentRoute, session }) =>
	documentSummaryListItem({
		id: 'cross-team-correspondence',
		text: 'Cross-team correspondence',
		appealId: appealDetails.appealId,
		folderInfo: appealDetails.internalCorrespondence?.crossTeam,
		displayMode: 'number',
		editable: userHasPermission(permissionNames.viewCaseDetails, session),
		uploadUrlTemplate: `${currentRoute}/internal-correspondence/cross-team/upload-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`,
		manageUrl: `${currentRoute}/internal-correspondence/cross-team/manage-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
	});
