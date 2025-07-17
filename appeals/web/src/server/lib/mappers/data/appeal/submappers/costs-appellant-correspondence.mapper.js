import { costsFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsAppellantCorrespondence = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-appellant-correspondence',
		text: 'Appellant correspondence',
		link: `${currentRoute}/costs/appellant/correspondence`,
		folderInfo: appealDetails?.costs?.appellantCorrespondenceFolder,
		editable: userHasUpdateCasePermission
	});
