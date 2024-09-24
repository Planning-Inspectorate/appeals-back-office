import formatAddress from '#utils/format-address.js';
import formatValidationOutcomeResponse from '#utils/format-validation-outcome-response.js';
import { mapFoldersLayoutForAppealSection } from '../documents/documents.mapper.js';
import { APPEAL_CASE_STAGE } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Appeals.SingleLPAQuestionnaireResponse} SingleLPAQuestionnaireResponse */
/** @typedef {import('@pins/appeals.api').Appeals.ListedBuildingDetailsResponse} ListedBuildingDetailsResponse */
/** @typedef {import('@pins/appeals.api').Schema.ListedBuildingSelected} ListedBuildingDetails */
/** @typedef {import('@pins/appeals.api').Schema.Folder} Folder */
/**
 * @param {boolean} affectsListedBuilding
 * @param {ListedBuildingDetails[] | null | undefined} values
 * @returns {ListedBuildingDetailsResponse | null}
 */
const formatListedBuildingDetails = (affectsListedBuilding, values) =>
	(values &&
		values
			.filter((value) => value.affectsListedBuilding === affectsListedBuilding)
			.map(({ listEntry, id }) => ({ id, listEntry }))) ||
	null;

/**
 * @param {Appeal} appeal
 * @param {Folder[] | null} folders
 * @returns {SingleLPAQuestionnaireResponse | {}}
 */
const formatLpaQuestionnaire = (appeal, folders = null) => {
	const { address, id, lpa, lpaQuestionnaire, reference } = appeal;
	if (lpaQuestionnaire) {
		return {
			lpaQuestionnaireId: lpaQuestionnaire.id,
			appealId: id,
			appealReference: reference,
			appealSite: formatAddress(address),
			localPlanningDepartment: lpa?.name,
			procedureType: appeal.procedureType?.name,
			...formatFoldersAndDocuments(folders),
			validation: formatValidationOutcomeResponse(
				lpaQuestionnaire.lpaQuestionnaireValidationOutcome?.name || null,
				lpaQuestionnaire.lpaQuestionnaireIncompleteReasonsSelected
			),
			lpaNotificationMethods: lpaQuestionnaire.lpaNotificationMethods?.map(
				({ lpaNotificationMethod: { name } }) => ({ name })
			),
			listedBuildingDetails: formatListedBuildingDetails(
				true,
				lpaQuestionnaire.listedBuildingDetails
			),
			healthAndSafetyDetails: lpaQuestionnaire.siteSafetyDetails,
			doesSiteHaveHealthAndSafetyIssues: lpaQuestionnaire.siteSafetyDetails !== null,
			inspectorAccessDetails: lpaQuestionnaire.siteAccessDetails,
			doesSiteRequireInspectorAccess: lpaQuestionnaire.siteAccessDetails !== null,
			isConservationArea: lpaQuestionnaire.inConservationArea,
			isGreenBelt: lpaQuestionnaire.isGreenBelt,
			isAffectingNeighbouringSites: lpaQuestionnaire.isAffectingNeighbouringSites,
			isCorrectAppealType: lpaQuestionnaire.isCorrectAppealType,
			submittedAt:
				lpaQuestionnaire.lpaQuestionnaireSubmittedDate &&
				lpaQuestionnaire.lpaQuestionnaireSubmittedDate?.toISOString(),
			receivedAt:
				lpaQuestionnaire.lpaqCreatedDate && lpaQuestionnaire.lpaqCreatedDate?.toISOString(),
			costsAppliedFor: lpaQuestionnaire.lpaCostsAppliedFor,
			lpaStatement: lpaQuestionnaire.lpaStatement,
			extraConditions: lpaQuestionnaire.newConditionDetails,
			hasExtraConditions: lpaQuestionnaire.newConditionDetails !== null
		};
	} else {
		return {};
	}
};

/**
 * @param {Folder[] | null} folders
 */
const formatFoldersAndDocuments = (folders) => {
	if (folders) {
		return {
			documents: mapFoldersLayoutForAppealSection(APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE, folders)
		};
	}

	return null;
};

export { formatLpaQuestionnaire };
