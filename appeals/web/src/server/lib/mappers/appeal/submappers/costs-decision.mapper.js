import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsDecision = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	costsFolderTableItem({
		id: 'costs-decision',
		text: 'Costs decision',
		link: `${currentRoute}/costs/decision`,
		folderInfo: appealDetails?.costs?.decisionFolder,
		statusText: 'Uploaded',
		editable: userHasUpdateCasePermission
	});
