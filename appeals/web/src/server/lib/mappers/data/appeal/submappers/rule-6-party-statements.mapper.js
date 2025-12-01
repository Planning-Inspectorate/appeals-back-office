import config from '#environment/config.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyStatements = ({ appealDetails }) => {
	const shouldBeDisplayed =
		config.featureFlags.featureFlagRule6Parties &&
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase();

	const rule6Parties = appealDetails.appealRule6Parties;
	if (!shouldBeDisplayed || !rule6Parties || rule6Parties.length === 0) {
		return { id: 'rule-6-party-statements', display: {} };
	}

	const receivedText = appealDetails.appealTimetable?.lpaStatementDueDate
		? `Due by ${dateISOStringToDisplayDate(appealDetails.appealTimetable?.lpaStatementDueDate)}`
		: 'Not applicable';

	return {
		id: 'rule-6-party-statements',
		display: {
			tableItems: rule6Parties
				.map((/** @type {Record<string, any>} */ rule6Party, i) => {
					const id = `rule-6-party-statement-${rule6Party.id}`;
					const text = `${rule6Party.serviceUser.organisationName} statement`;

					return documentationFolderTableItem({
						id,
						text,
						statusText: 'Not received',
						receivedText,
						actionHtml: `<a href="#" class="govuk-link" data-cy="add-rule-6-party-statement-${i}">Add</a>`
					}).display.tableItem;
				})
				.filter(isDefined)
		}
	};
};
