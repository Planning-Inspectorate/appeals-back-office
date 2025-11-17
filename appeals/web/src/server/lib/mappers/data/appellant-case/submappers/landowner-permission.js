import { booleanSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapLandownerPermission = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	booleanSummaryListItem({
		id: 'landowner-permission',
		text: "Do you have the landowner's permission?",
		defaultText: appellantCaseData.siteOwnership.ownsAllLand ? 'Not answered' : 'No data',
		value: appellantCaseData.landownerPermission,
		link: `${currentRoute}/landowner-permission/change`,
		editable: userHasUpdateCase
	});
