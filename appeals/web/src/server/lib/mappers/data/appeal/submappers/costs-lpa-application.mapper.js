import { costsFolderTableItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsLpaApplication = ({
	appealDetails,
	currentRoute,
	userHasUpdateCasePermission
}) =>
	costsFolderTableItem({
		id: 'costs-lpa-application',
		text: 'LPA application',
		link: `${currentRoute}/costs/lpa/application`,
		folderInfo: appealDetails?.costs?.lpaApplicationFolder,
		editable: userHasUpdateCasePermission
	});
