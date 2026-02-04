import config from '#environment/config.js';
import { documentationFolderTableItem } from '#lib/mappers/components/index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { statementReceivedText, statementStatusText } from '../common.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapAppellantStatement = ({ appealDetails, currentRoute, request }) => {
	const supportedAppealTypes = [
		APPEAL_TYPE.ADVERTISEMENT,
		APPEAL_TYPE.ENFORCEMENT_NOTICE,
		APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
		APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
		APPEAL_TYPE.DISCONTINUANCE_NOTICE
	];
	const shouldBeDisplayed =
		config.featureFlags.featureFlagAppellantStatement &&
		supportedAppealTypes.includes(appealDetails.appealType);

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
