import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantApplication = ({ appealDetails, currentRoute }) =>
	costsFolderTableItem({
		id: 'costs-appellant-application',
		text: 'Appellant application',
		link: `${currentRoute}/costs/appellant/application`,
		folderInfo: appealDetails?.costs?.appellantApplicationFolder
	});
