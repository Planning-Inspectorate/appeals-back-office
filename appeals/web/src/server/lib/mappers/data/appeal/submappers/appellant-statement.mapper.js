import config from '#environment/config.js';
import { documentationFolderTableItem } from '#lib/mappers/components/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import isAppellantStatementAppealType from '@pins/appeals/utils/is-appellant-statement-appeal-type.js';
import { statementReceivedText, statementStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantStatement = ({ appealDetails, currentRoute, request }) => {
	const shouldBeDisplayed =
		config.featureFlags.featureFlagAppellantStatement &&
		isAppellantStatementAppealType(appealDetails.appealType);

	if (!shouldBeDisplayed) {
		return { id: 'appellant-statement', display: {} };
	}

	const { status, representationStatus, isRedacted } =
		appealDetails.documentationSummary?.appellantStatement ?? {};

	const statusText = statementStatusText(appealDetails, status, representationStatus, isRedacted);

	const receivedText = statementReceivedText(
		appealDetails,
		appealDetails?.documentationSummary?.appellantStatement
	);

	return documentationFolderTableItem({
		id: 'appellant-statement',
		text: 'Appellant statement',
		statusText,
		receivedText,
		actionHtml: mapRepresentationDocumentSummaryActionLink(
			currentRoute,
			appealDetails?.documentationSummary?.appellantStatement?.status,
			appealDetails?.documentationSummary?.appellantStatement?.representationStatus,
			'appellant-statement',
			request,
			undefined,
			appealDetails.appealTimetable?.lpaStatementDueDate || ''
		)
	});
};
