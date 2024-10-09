import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsLpaWithdrawal = ({ appealDetails, currentRoute }) =>
	costsFolderTableItem({
		id: 'costs-lpa-withdrawal',
		text: 'LPA withdrawal',
		link: `${currentRoute}/costs/lpa/withdrawal`,
		folderInfo: appealDetails?.costs?.lpaWithdrawalFolder
	});
