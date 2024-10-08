import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantCorrespondence = ({ appealDetails, currentRoute }) =>
	costsFolderTableItem({
		id: 'costs-appellant-correspondence',
		text: 'Appellant correspondence',
		link: `${currentRoute}/costs/appellant/correspondence`,
		folderInfo: appealDetails?.costs?.appellantCorrespondenceFolder
	});
