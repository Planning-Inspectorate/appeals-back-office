import { textSummaryListItem } from '#lib/mappers/index.js';
import { toSentenceCase } from '#lib/string-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationDevelopmentAllOrPart = ({
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const id = 'application-development-all-or-part';
	const { applicationDevelopmentAllOrPart } = appellantCaseData?.enforcementNotice || {};
	return textSummaryListItem({
		id,
		text: 'Was the application for all or part of the development?',
		value: applicationDevelopmentAllOrPart
			? toSentenceCase(applicationDevelopmentAllOrPart)
			: 'Not answered',
		link: `${currentRoute}/${id}/change`,
		editable: userHasUpdateCase && !appellantCaseData.isEnforcementChild,
		actionText: applicationDevelopmentAllOrPart ? 'Change' : 'Add'
	});
};
