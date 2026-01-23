import config from '#environment/config.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { statementReceivedText, statementStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyStatements = ({ appealDetails, currentRoute, request }) => {
	const shouldBeDisplayed =
		config.featureFlags.featureFlagRule6Mvp &&
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase();

	const rule6Parties = appealDetails.appealRule6Parties;
	if (!shouldBeDisplayed || !rule6Parties || rule6Parties.length === 0) {
		return { id: 'rule-6-party-statements', display: {} };
	}

	return {
		id: 'rule-6-party-statements',
		display: {
			tableItems: rule6Parties
				.map((/** @type {Record<string, any>} */ rule6Party) => {
					const id = `rule-6-party-statement-${rule6Party.id}`;
					const text = `${rule6Party.serviceUser.organisationName} statement`;
					const statement =
						appealDetails.documentationSummary?.rule6PartyStatements?.[rule6Party.serviceUserId];

					const { status, representationStatus, isRedacted } = statement ?? {};

					const statusText = statementStatusText(
						appealDetails,
						status,
						representationStatus,
						isRedacted
					);
					const receivedText = statementReceivedText(appealDetails, statement);

					return documentationFolderTableItem({
						id,
						text,
						statusText,
						receivedText,
						actionHtml: mapRepresentationDocumentSummaryActionLink(
							currentRoute,
							appealDetails?.documentationSummary?.rule6PartyStatements?.[rule6Party.serviceUserId]
								?.status,
							appealDetails?.documentationSummary?.rule6PartyStatements?.[rule6Party.serviceUserId]
								?.representationStatus,
							'rule-6-party-statement',
							request,
							{ id: rule6Party.id, serviceUser: rule6Party.serviceUser }
						)
					}).display.tableItem;
				})
				.filter(isDefined)
		}
	};
};
