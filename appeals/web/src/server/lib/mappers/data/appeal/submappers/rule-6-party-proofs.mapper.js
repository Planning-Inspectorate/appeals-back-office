import config from '#environment/config.js';
import { documentationFolderTableItem } from '#lib/mappers/index.js';
import {
	mapAddRepresentationSummaryActionLink,
	mapRepresentationDocumentSummaryActionLink
} from '#lib/representation-utilities.js';
import { isDefined } from '#lib/ts-utilities.js';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { capitalize } from 'lodash-es';
import { proofsReceivedText, proofsStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapRule6PartyProofs = ({ appealDetails, currentRoute, request }) => {
	const shouldBeDisplayed =
		config.featureFlags.featureFlagRule6Parties &&
		appealDetails.procedureType?.toLowerCase() === APPEAL_CASE_PROCEDURE.INQUIRY.toLowerCase();

	const rule6Parties = appealDetails.appealRule6Parties;

	if (!shouldBeDisplayed || !rule6Parties || rule6Parties.length === 0) {
		return { id: 'rule-6-party-proofs', display: {} };
	}

	return {
		id: 'rule-6-party-proofs',
		display: {
			tableItems: rule6Parties
				.map((/** @type {Record<string, any>} */ rule6Party) => {
					const id = `rule-6-party-proof-${rule6Party.id}`;
					const text = `${rule6Party.serviceUser.organisationName} proof of evidence and witness`;

					const { status, receivedAt, representationStatus } =
						appealDetails.documentationSummary?.rule6PartyProofs?.[rule6Party.serviceUserId] ?? {};

					const statusText = proofsStatusText(status, representationStatus);
					const receivedText = proofsReceivedText(statusText, receivedAt);

					return documentationFolderTableItem({
						id,
						text,
						statusText: capitalize(statusText),
						receivedText,
						actionHtml:
							statusText !== 'Awaiting proof of evidence and witness'
								? mapRepresentationDocumentSummaryActionLink(
										currentRoute,
										status || undefined,
										representationStatus,
										'rule-6-party-proofs-evidence',
										request,
										{ id: rule6Party.id, serviceUser: rule6Party.serviceUser }
									)
								: mapAddRepresentationSummaryActionLink(
										currentRoute,
										'rule-6-party-proofs-evidence',
										request,
										{ id: rule6Party.id, serviceUser: rule6Party.serviceUser }
									)
					}).display.tableItem;
				})
				.filter(isDefined)
		}
	};
};
