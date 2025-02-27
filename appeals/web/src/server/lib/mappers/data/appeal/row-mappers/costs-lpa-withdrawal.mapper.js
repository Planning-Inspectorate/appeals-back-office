import { costsFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapCostsLpaWithdrawal = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-lpa-withdrawal',
		text: 'LPA withdrawal',
		link: `${currentRoute}/costs/lpa/withdrawal`,
		folderInfo: appealDetails?.costs?.lpaWithdrawalFolder,
		editable: userHasUpdateCasePermission
	});
