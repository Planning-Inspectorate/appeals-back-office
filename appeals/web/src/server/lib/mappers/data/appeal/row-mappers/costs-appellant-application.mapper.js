import { costsFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').RowMapper} */
export const mapCostsAppellantApplication = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-appellant-application',
		text: 'Appellant application',
		link: `${currentRoute}/costs/appellant/application`,
		folderInfo: appealDetails?.costs?.appellantApplicationFolder,
		editable: userHasUpdateCasePermission
	});
