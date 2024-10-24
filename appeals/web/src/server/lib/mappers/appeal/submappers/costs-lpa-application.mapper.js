import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaApplication = ({ appealDetails, currentRoute }) =>
	costsFolderTableItem({
		id: 'costs-lpa-application',
		text: 'LPA application',
		link: `${currentRoute}/costs/lpa/application`,
		folderInfo: appealDetails?.costs?.lpaApplicationFolder
	});
