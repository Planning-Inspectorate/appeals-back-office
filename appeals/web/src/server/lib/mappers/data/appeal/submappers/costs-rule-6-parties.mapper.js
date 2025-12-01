import config from '#environment/config.js';
import { costsFolderTableItem } from '#lib/mappers/index.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

/** @type {import('../mapper.js').SubMapper} */
export const mapCostsRule6Parties = ({ appealDetails, userHasUpdateCasePermission }) => {
	const shouldBeDisplayed =
		config.featureFlags.featureFlagRule6Parties &&
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase();

	const rule6Parties = appealDetails.appealRule6Parties;
	if (!shouldBeDisplayed || !rule6Parties || rule6Parties.length === 0) {
		return { id: 'costs-rule-6-parties-application', display: {} };
	}

	return {
		id: 'costs-rule-6-parties-application',
		display: {
			tableItems: rule6Parties
				.flatMap((/** @type {Record<string, any>} */ rule6Party, i) => {
					return ['application', 'withdrawal', 'correspondence']
						.map((type) => {
							const id = `rule-6-party-costs-${type}-${i}`;
							const text = `${rule6Party.serviceUser.organisationName} ${type}`;

							return costsFolderTableItem({
								id,
								text,
								link: '#',
								folderInfo: null,
								editable: userHasUpdateCasePermission
							}).display.tableItem;
						})
						.filter(isDefined);
				})
				.filter(isDefined)
		}
	};
};
