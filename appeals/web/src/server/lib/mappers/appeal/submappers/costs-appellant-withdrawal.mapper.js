import { costsFolderTableItem } from '#lib/mappers/components/folder.js';

/** @type {import('../appeal.mapper.js').SubMapper} */
export const mapCostsAppellantWithdrawal = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-appellant-withdrawal',
		text: 'Appellant withdrawal',
		link: `${currentRoute}/costs/appellant/withdrawal`,
		folderInfo: appealDetails?.costs?.appellantWithdrawalFolder,
		editable: userHasUpdateCasePermission
	});
