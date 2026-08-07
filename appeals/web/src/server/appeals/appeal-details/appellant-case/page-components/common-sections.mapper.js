import config from '#environment/config.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import {
	documentUploadUrlTemplate,
	mapDocumentManageUrl
} from '#lib/mappers/data/appellant-case/common.js';
import { removeSummaryListActions } from '#lib/mappers/index.js';
import { isFolderInfo } from '#lib/ts-utilities.js';

/**
 * @typedef {import('@pins/appeals.api').Appeals.SingleAppellantCaseResponse} SingleAppellantCaseResponse
 * @typedef {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} Appeal
 */

/**
 * Creates a standard summary list card component.
 * @param {string} id
 * @param {string} title
 * @param {(any|undefined|null)[]} rows
 * @param {object} [options]
 * @param {string} [options.classes]
 * @param {object} [options.actions]
 * @returns {PageComponent|null}
 */
export function buildSummaryListCard(id, title, rows, options = {}) {
	const validRows = rows.filter(Boolean);
	if (validRows.length === 0 && !options.actions) {
		return null;
	}

	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			attributes: {
				id
			},
			...(options.classes ? { classes: options.classes } : {}),
			card: {
				title: {
					text: title
				},
				...(options.actions ? { actions: options.actions } : {})
			},
			rows: validRows
		}
	};
}

/**
 * Builds the "Before you start" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {object} [options]
 * @param {string} [options.lpaText]
 * @returns {PageComponent|null}
 */
export function buildBeforeYouStartCard(mappedAppellantCaseData, options = {}) {
	const lpaText = options.lpaText || 'Local planning authority';

	return buildSummaryListCard('before-you-start', 'Before you start', [
		...(mappedAppellantCaseData.localPlanningAuthority?.display?.summaryListItem
			? [
					{
						...mappedAppellantCaseData.localPlanningAuthority.display.summaryListItem,
						key: {
							text: lpaText
						}
					}
				]
			: []),
		mappedAppellantCaseData.applicationType?.display?.summaryListItem
			? removeSummaryListActions(mappedAppellantCaseData.applicationType.display.summaryListItem)
			: null,
		mappedAppellantCaseData.applicationDecision?.display?.summaryListItem,
		mappedAppellantCaseData.applicationDecisionDate?.display?.summaryListItem,
		mappedAppellantCaseData.applicationReference?.display?.summaryListItem
	]);
}

/**
 * Builds the "Appellant details" section card component.
 * @param {Appeal} appealDetails
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildAppellantDetailsCard(appealDetails, mappedAppellantCaseData) {
	return buildSummaryListCard('appellant-details', 'Appellant details', [
		mappedAppellantCaseData.appellant?.display?.summaryListItem,
		...(appealDetails.agent ? [mappedAppellantCaseData.agent?.display?.summaryListItem] : [])
	]);
}

/**
 * Builds the "Site details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {(any|undefined|null)[]} [additionalRows]
 * @returns {PageComponent|null}
 */
export function buildSiteDetailsCard(mappedAppellantCaseData, additionalRows = []) {
	return buildSummaryListCard('site-details', 'Site details', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.siteArea?.display?.summaryListItem,
		mappedAppellantCaseData.inGreenBelt?.display?.summaryListItem,
		mappedAppellantCaseData.siteOwnership?.display?.summaryListItem,
		mappedAppellantCaseData.ownersKnown?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem,
		mappedAppellantCaseData.anySignificantChanges?.display?.summaryListItem,
		...additionalRows
	]);
}

/**
 * Builds the "Application details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {(any|undefined|null)[]} [additionalRows]
 * @returns {PageComponent|null}
 */
export function buildApplicationDetailsCard(mappedAppellantCaseData, additionalRows = []) {
	return buildSummaryListCard('application-summary', 'Application details', [
		mappedAppellantCaseData.applicationDate?.display?.summaryListItem,
		mappedAppellantCaseData.developmentDescription?.display?.summaryListItem,
		mappedAppellantCaseData.relatedAppeals?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
		...additionalRows
	]);
}

/**
 * Builds the "Appeal details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {(any|undefined|null)[]} [additionalRows]
 * @returns {PageComponent|null}
 */
export function buildAppealDetailsCard(mappedAppellantCaseData, additionalRows = []) {
	return buildSummaryListCard('appeal-summary', 'Appeal details', [
		mappedAppellantCaseData.reasonForAppealAppellant?.display?.summaryListItem,
		...additionalRows
	]);
}

/**
 * Builds the "Additional documents" section card component.
 * @param {SingleAppellantCaseResponse} appellantCaseData
 * @param {MappedInstructions} mappedAppellantCaseData
 * @param {boolean} userHasUpdateCasePermission
 * @returns {PageComponent|null}
 */
export function buildAdditionalDocumentsCard(
	appellantCaseData,
	mappedAppellantCaseData,
	userHasUpdateCasePermission
) {
	const correspondenceFolder = appellantCaseData.documents?.appellantCaseCorrespondence;
	const hasDocs =
		isFolderInfo(correspondenceFolder) &&
		correspondenceFolder?.documents &&
		correspondenceFolder.documents.length > 0;

	const actionsItems = [];

	if (hasDocs && isFolderInfo(correspondenceFolder)) {
		actionsItems.push({
			text: 'Manage',
			visuallyHiddenText: 'additional documents',
			href: mapDocumentManageUrl(appellantCaseData.appealId, correspondenceFolder.folderId)
		});
	}

	if (userHasUpdateCasePermission && !appellantCaseData.isEnforcementChild) {
		actionsItems.push({
			text: 'Add',
			visuallyHiddenText: 'additional documents',
			href: displayPageFormatter.formatDocumentActionLink(
				appellantCaseData.appealId,
				correspondenceFolder,
				documentUploadUrlTemplate
			)
		});
	}

	return buildSummaryListCard(
		'additional-documents',
		'Additional documents',
		mappedAppellantCaseData.additionalDocuments?.display?.summaryListItems || [],
		{
			classes: 'pins-summary-list--fullwidth-value',
			actions: { items: actionsItems }
		}
	);
}

/**
 * Builds the Full Planning (S20 & S78) "Application details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildFullPlanningApplicationDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('application-summary', 'Application details', [
		mappedAppellantCaseData.applicationDate?.display?.summaryListItem,
		mappedAppellantCaseData.developmentDescription?.display?.summaryListItem,
		mappedAppellantCaseData.relatedAppeals?.display?.summaryListItem,
		mappedAppellantCaseData.developmentType?.display?.summaryListItem
	]);
}

/**
 * Builds the Full Planning (S20 & S78) "Appeal details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildFullPlanningAppealDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('appeal-summary', 'Appeal details', [
		mappedAppellantCaseData.procedurePreference?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDetails?.display?.summaryListItem,
		mappedAppellantCaseData.procedurePreferenceDuration?.display?.summaryListItem,
		mappedAppellantCaseData.inquiryNumberOfWitnesses?.display?.summaryListItem
	]);
}

/**
 * Builds the Full Planning (S20 & S78) "Uploaded documents" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildFullPlanningUploadedDocumentsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('uploaded-documents', 'Upload documents', [
		mappedAppellantCaseData.applicationForm?.display?.summaryListItem,
		mappedAppellantCaseData.changedDevelopmentDescriptionDocument?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem,
		mappedAppellantCaseData.appealStatement?.display?.summaryListItem,
		mappedAppellantCaseData.statusPlanningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.planningObligation?.display?.summaryListItem,
		mappedAppellantCaseData.statementCommonGround?.display?.summaryListItem,
		mappedAppellantCaseData.ownershipCertificate?.display?.summaryListItem,
		mappedAppellantCaseData.costsDocument?.display?.summaryListItem,
		mappedAppellantCaseData.designAccessStatement?.display?.summaryListItem,
		mappedAppellantCaseData.supportingDocuments?.display?.summaryListItem,
		mappedAppellantCaseData.newPlansDrawings?.display?.summaryListItem,
		mappedAppellantCaseData.otherNewDocuments?.display?.summaryListItem
	]);
}

/**
 * Builds the Enforcement "Before you start" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementBeforeYouStartCard(mappedAppellantCaseData) {
	return buildSummaryListCard('before-you-start', 'Before you start', [
		!config.featureFlags.featureFlagNewBeforeYouStart &&
			mappedAppellantCaseData.enforcementNotice?.display?.summaryListItem,
		mappedAppellantCaseData.localPlanningAuthority?.display?.summaryListItem,
		config.featureFlags.featureFlagNewBeforeYouStart &&
			mappedAppellantCaseData.applicationType?.display?.summaryListItem,
		!config.featureFlags.featureFlagNewBeforeYouStart &&
			mappedAppellantCaseData.enforcementNoticeListedBuilding?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementIssueDate?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementEffectiveDate?.display?.summaryListItem,
		mappedAppellantCaseData.contactPlanningInspectorateDate?.display?.summaryListItem,
		mappedAppellantCaseData.enforcementReference?.display?.summaryListItem
	]);
}

/**
 * Builds the Enforcement "Appellant details" section card component.
 * @param {Appeal} appealDetails
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementAppellantDetailsCard(appealDetails, mappedAppellantCaseData) {
	return buildSummaryListCard('appellant-details', 'Appellant details', [
		mappedAppellantCaseData.appellant?.display?.summaryListItem,
		...(appealDetails.agent ? [mappedAppellantCaseData.agent?.display?.summaryListItem] : []),
		mappedAppellantCaseData.otherAppellants?.display?.summaryListItem
	]);
}

/**
 * Builds the Enforcement "Land" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementLandDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('site-details', 'Land', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.contactAddress?.display?.summaryListItem,
		mappedAppellantCaseData.interestInLand?.display?.summaryListItem,
		mappedAppellantCaseData.writtenOrVerbalPermission?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem
	]);
}

/**
 * Builds the Enforcement "Application details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildEnforcementApplicationDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('application-summary', 'Application details', [
		mappedAppellantCaseData.relatedAppeals?.display?.summaryListItem
	]);
}

/**
 * Builds the Advert "Site details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildAdvertSiteDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('site-details', 'Site details', [
		mappedAppellantCaseData.siteAddress?.display?.summaryListItem,
		mappedAppellantCaseData.highwayLand?.display?.summaryListItem,
		mappedAppellantCaseData.advertisementInPosition?.display?.summaryListItem,
		mappedAppellantCaseData.inGreenBelt?.display?.summaryListItem,
		mappedAppellantCaseData.siteOwnership?.display?.summaryListItem,
		mappedAppellantCaseData.ownersKnown?.display?.summaryListItem,
		mappedAppellantCaseData.inspectorAccess?.display?.summaryListItem,
		mappedAppellantCaseData.healthAndSafetyIssues?.display?.summaryListItem,
		mappedAppellantCaseData.landownerPermission?.display?.summaryListItem,
		mappedAppellantCaseData.anySignificantChanges?.display?.summaryListItem
	]);
}

/**
 * Builds the Advert "Application details" section card component.
 * @param {MappedInstructions} mappedAppellantCaseData
 * @returns {PageComponent|null}
 */
export function buildAdvertApplicationDetailsCard(mappedAppellantCaseData) {
	return buildSummaryListCard('application-summary', 'Application details', [
		mappedAppellantCaseData.applicationDate?.display?.summaryListItem,
		mappedAppellantCaseData.advertisementDescription?.display?.summaryListItem,
		mappedAppellantCaseData.changedAdvertisementDescriptionDocument?.display?.summaryListItem,
		mappedAppellantCaseData.relatedAppeals?.display?.summaryListItem,
		mappedAppellantCaseData.decisionLetter?.display?.summaryListItem
	]);
}
