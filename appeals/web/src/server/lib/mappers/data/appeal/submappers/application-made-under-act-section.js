import { textSummaryListItem } from '#lib/mappers/index.js';
import { toSentenceCase } from '#lib/string-utilities.js';
import { APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationMadeUnderActSection = ({ appellantCase }) => {
	const applicationMadeUnderActSection = appellantCase?.applicationMadeUnderActSection;
	return textSummaryListItem({
		id: 'application-made-under-act-section',
		text: 'What type of lawful development certificate is the appeal about?',
		value: Object.values(APPEAL_APPLICATION_MADE_UNDER_ACT_SECTION).includes(
			/** @type {"existing-development" | "proposed-changes-to-a-listed-building" | "proposed-use-of-a-development"} */ (
				applicationMadeUnderActSection
			)
		)
			? toSentenceCase(
					/** @type {"existing-development" | "proposed-changes-to-a-listed-building" | "proposed-use-of-a-development"} */ (
						applicationMadeUnderActSection
					)
				)
			: applicationMadeUnderActSection || 'Not answered',
		link: '',
		editable: false
	});
};
