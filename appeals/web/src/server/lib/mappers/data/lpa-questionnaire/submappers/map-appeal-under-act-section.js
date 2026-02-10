import { textSummaryListItem } from '#lib/mappers/index.js';
import { toSentenceCase } from '#lib/string-utilities.js';
import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppealUnderActSection = ({
	lpaQuestionnaireData,
	currentRoute,
	userHasUpdateCase
}) => {
	const appealUnderActSection = lpaQuestionnaireData.appealUnderActSection;
	return textSummaryListItem({
		id: 'appeal-under-act-section',
		text: 'What type of lawful development certificate is the appeal about?',
		value: Object.values(APPEAL_APPEAL_UNDER_ACT_SECTION).includes(
			/** @type {"existing-development" | "proposed-changes-to-a-listed-building" | "proposed-use-of-a-development"} */ (
				appealUnderActSection
			)
		)
			? toSentenceCase(
					/** @type {"existing-development" | "proposed-changes-to-a-listed-building" | "proposed-use-of-a-development"} */ (
						appealUnderActSection
					)
				)
			: appealUnderActSection || 'Not answered',
		link: `${currentRoute}/appeal-under-act-section/change`,
		editable: userHasUpdateCase,
		actionText: appealUnderActSection !== null ? 'Change' : 'Add'
	});
};
