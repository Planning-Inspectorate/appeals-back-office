import { textSummaryListItem } from '#lib/mappers/components/index.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSiteUseAtTimeOfApplication = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) =>
	textSummaryListItem({
		id: 'site-use-at-time-of-application',
		text: 'What did you use the appeal site for when you made the application?',
		value: appellantCaseData?.siteUseAtTimeOfApplication,
		link: `${currentRoute}/site-use-at-time-of-application/change`,
		editable: userHasUpdateCase
	});
