import { permissionNames } from '#environment/permissions.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import { userHasPermission } from '#lib/mappers/utils/permissions.mapper.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCrossTeamCorrespondence = ({ appealDetails, currentRoute, session }) => ({
	id: 'cross-team-correspondence',
	display: {
		summaryListItem: {
			key: {
				text: 'Cross-team correspondence'
			},
			actions: {
				items:
					appealDetails.internalCorrespondence?.crossTeam?.documents &&
					appealDetails.internalCorrespondence?.crossTeam?.documents.length > 0
						? [
								{
									text: 'Manage',
									visuallyHiddenText: 'cross-team correspondence documents',
									href: `${currentRoute}/internal-correspondence/cross-team/manage-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
								},
								...(userHasPermission(permissionNames.viewCaseDetails, session)
									? [
											{
												text: 'Add',
												visuallyHiddenText: 'cross-team correspondence documents',
												href: displayPageFormatter.formatDocumentActionLink(
													appealDetails.appealId,
													appealDetails.internalCorrespondence?.crossTeam,
													`${currentRoute}/internal-correspondence/cross-team/upload-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
												)
											}
									  ]
									: [])
						  ]
						: [
								...(userHasPermission(permissionNames.viewCaseDetails, session)
									? [
											{
												text: 'Add',
												visuallyHiddenText: 'cross-team correspondence documents',
												href: displayPageFormatter.formatDocumentActionLink(
													appealDetails.appealId,
													appealDetails.internalCorrespondence?.crossTeam,
													`${currentRoute}/internal-correspondence/cross-team/upload-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
												)
											}
									  ]
									: [])
						  ]
			}
		}
	}
});
