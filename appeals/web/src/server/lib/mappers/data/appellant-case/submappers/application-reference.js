import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapApplicationReference = ({
	appealDetails,
	appellantCaseData,
	currentRoute,
	userHasUpdateCase
}) => {
	const editable =
		userHasUpdateCase &&
		!appellantCaseData.isEnforcementChild &&
		!appealDetails.lpaQuestionnaireId &&
		appealDetails.appealStatus !== APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

	return textSummaryListItem({
		id: 'application-reference',
		text: 'What is the application reference number?',
		value: appellantCaseData.planningApplicationReference,
		link: `${currentRoute}/lpa-reference/change`,
		editable
	});
};
