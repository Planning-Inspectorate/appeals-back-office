import { costsFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsDecision = ({ appealDetails, currentRoute, userHasUpdateCasePermission }) =>
	costsFolderTableItem({
		id: 'costs-decision',
		text: 'Costs decision',
		link: `${currentRoute}/costs/decision`,
		folderInfo: appealDetails?.costs?.decisionFolder,
		statusText: 'Uploaded',
		editable: userHasUpdateCasePermission
	});
