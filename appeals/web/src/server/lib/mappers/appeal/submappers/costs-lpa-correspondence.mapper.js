import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaCorrespondence = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-lpa-correspondence',
		text: 'LPA correspondence',
		link: `${currentRoute}/costs/lpa/correspondence`,
		folderInfo: appealDetails?.costs?.lpaCorrespondenceFolder,
		editable: userHasUpdateCasePermission
	});
