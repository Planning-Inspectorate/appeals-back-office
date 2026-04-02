import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapReasonForAppeal = ({ appellantCaseData, currentRoute, userHasUpdateCase }) =>
	textSummaryListItem({
		id: 'reason-for-appeal',
		text: 'Why are you appealing?',
		value: appellantCaseData.reasonForAppealAppellant,
		link: `${currentRoute}/reason-for-appeal/change`,
		editable: userHasUpdateCase
	});
