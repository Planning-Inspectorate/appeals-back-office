import { apiMappers } from './api/index.js';
import { integrationMappers } from './integration/index.js';
import { contextEnum } from './context-enum.js';
import {
	APPEAL_CASE_STAGE,
	APPEAL_CASE_TYPE,
	APPEAL_DOCUMENT_TYPE
} from '@planning-inspectorate/data-model';
import mergeMaps from '#utils/merge-maps.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Api.Appeal} AppealDTO */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCaseDto */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaireDTO */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {AppealDTO|AppellantCaseDto|LpaQuestionnaireDTO|AppealHASCase|AppealS78Case} MapResult */
/** @typedef {import('@pins/appeals.api').Api.Folder} Folder */
/** @typedef {import('@pins/appeals').CostsDecision} CostsDecision */
/** @typedef {{ appeal: Appeal, appealTypes?: AppealType[]|undefined, linkedAppeals?: *[]|undefined, costsDecision?: CostsDecision|undefined, context?: keyof contextEnum }} MappingRequest */

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {MapResult | undefined}
 */
export const mapCase = ({
	appeal,
	appealTypes = [],
	linkedAppeals = [],
	costsDecision = { awaitingAppellantCostsDecision: false, awaitingLpaCostsDecision: false },
	context = /** @type {keyof contextEnum} */ (contextEnum.appealDetails)
}) => {
	if (!context || !appeal?.id || !appeal?.caseCreatedDate) {
		return;
	}

	const caseMap =
		context === contextEnum.broadcast
			? createIntegrationMap({ appeal, context })
			: createDataMap({ appeal, appealTypes, linkedAppeals, costsDecision, context });

	return createDataLayout(caseMap, { appeal, context });
};

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
function createDataMap(mappingRequest) {
	const { appeal } = mappingRequest;

	const caseData = createMap(apiMappers.apiSharedMappers, mappingRequest);

	//TODO: add maps for specific appeal types for UI
	switch (appeal.appealType?.key) {
		case APPEAL_CASE_TYPE.Y: {
			const s20 = createMap(apiMappers.apiS20Mappers, mappingRequest);
			return mergeMaps(caseData, s20);
		}
		case APPEAL_CASE_TYPE.W: {
			const s78 = createMap(apiMappers.apiS78Mappers, mappingRequest);
			return mergeMaps(caseData, s78);
		}
		default:
			return caseData;
	}
}

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
function createIntegrationMap(mappingRequest) {
	const { appeal } = mappingRequest;

	const caseData = createMap(integrationMappers.integrationSharedMappers, mappingRequest);

	switch (appeal.appealType?.key) {
		//TODO: validate with Data Model
		case APPEAL_CASE_TYPE.W: {
			const s78 = createMap(integrationMappers.integrationS78Mappers, mappingRequest);
			return mergeMaps(caseData, s78);
		}
		case APPEAL_CASE_TYPE.Y: {
			const s20 = createMap(integrationMappers.integrationS20Mappers, mappingRequest);
			return mergeMaps(caseData, s20);
		}
		default:
			return caseData;
	}
}

/**
 *
 * @param {Object<string, *>} mappers
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
const createMap = (mappers, mappingRequest) =>
	Object.entries(mappers).reduce((accumulator, [key, mapper]) => {
		const mapped = mapper(mappingRequest);
		if (mapped) {
			accumulator.set(key, mapped);
		}

		return accumulator;
	}, new Map());

/**
 *
 * @param {Map<string, *>} caseMap
 * @param {MappingRequest} mappingRequest
 */
function createDataLayout(caseMap, mappingRequest) {
	const { context, appeal } = mappingRequest;

	if (context === contextEnum.broadcast) {
		return Array.from(caseMap.values()).reduce((acc, val) => ({ ...acc, ...val }), {});
	}

	const {
		appealSummary,
		team,
		appealRelationships,
		appellantCase,
		lpaQuestionnaire,
		representations,
		folders,
		...appealDetails
	} = Object.fromEntries(caseMap);

	switch (context) {
		case contextEnum.appellantCase:
			return {
				appellantCaseId: appeal.appellantCase?.id,
				...appealSummary,
				...appellantCase,
				...createFoldersLayout(folders, contextEnum.appellantCase)
			};
		case contextEnum.lpaQuestionnaire:
			return {
				lpaQuestionnaireId: appeal.lpaQuestionnaire?.id,
				...appealSummary,
				...lpaQuestionnaire,
				...createFoldersLayout(folders, contextEnum.lpaQuestionnaire)
			};
		case contextEnum.representations:
			return {
				...appealSummary,
				...representations,
				...createFoldersLayout(folders, contextEnum.representations)
			};
		default: {
			return {
				...appealSummary,
				...team,
				...appealRelationships,
				...appealDetails,
				appellantCaseId: appeal.appellantCase?.id,
				lpaQuestionnaireId: appeal.lpaQuestionnaire?.id,
				healthAndSafety: {
					appellantCase: { ...appellantCase.healthAndSafety },
					lpaQuestionnaire: { ...(lpaQuestionnaire?.healthAndSafety ?? null) }
				},
				inspectorAccess: {
					appellantCase: { ...appellantCase.siteAccessRequired },
					lpaQuestionnaire: { ...(lpaQuestionnaire?.siteAccessRequired ?? null) }
				},
				eiaScreeningRequired: appeal.eiaScreeningRequired,
				lpaEmailAddress: appeal.lpa?.email,
				...createFoldersLayout(folders, contextEnum.appealDetails)
			};
		}
	}
}

/***
 *
 * @param {Folder[]} folders
 * @param {string} context
 *
 */
function createFoldersLayout(folders, context) {
	switch (context) {
		case contextEnum.appellantCase: {
			const appellantCaseFolders = folders.filter((f) =>
				f.path.startsWith(APPEAL_CASE_STAGE.APPELLANT_CASE)
			);

			return {
				documents: processFolders(appellantCaseFolders)
			};
		}
		case contextEnum.lpaQuestionnaire: {
			const lpaqFolders = folders.filter((f) =>
				f.path.startsWith(APPEAL_CASE_STAGE.LPA_QUESTIONNAIRE)
			);

			return {
				documents: processFolders(lpaqFolders)
			};
		}
		case contextEnum.representations: {
			const repsIpCommentsFolders = folders.filter((f) =>
				f.path.startsWith(APPEAL_CASE_STAGE.THIRD_PARTY_COMMENTS)
			);
			const repsStatementsFolders = folders.filter((f) =>
				f.path.startsWith(APPEAL_CASE_STAGE.STATEMENTS)
			);
			const repsFinalCommentsFolders = folders.filter((f) =>
				f.path.startsWith(APPEAL_CASE_STAGE.FINAL_COMMENTS)
			);

			return {
				...repsIpCommentsFolders,
				...repsStatementsFolders,
				...repsFinalCommentsFolders
			};
		}
		default: {
			const appealFolders = {
				environmentalAssessment: folders.find(
					(f) =>
						f.path ===
						`${APPEAL_CASE_STAGE.APPELLANT_CASE}/${APPEAL_DOCUMENT_TYPE.ENVIRONMENTAL_ASSESSMENT}`
				),
				costs: {
					appellantApplicationFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_APPLICATION}`
					),
					appellantWithdrawalFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_WITHDRAWAL}`
					),
					appellantCorrespondenceFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_CORRESPONDENCE}`
					),
					lpaApplicationFolder: folders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_APPLICATION}`
					),
					lpaWithdrawalFolder: folders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_WITHDRAWAL}`
					),
					lpaCorrespondenceFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_CORRESPONDENCE}`
					),
					appellantDecisionFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.APPELLANT_COSTS_DECISION_LETTER}`
					),
					lpaDecisionFolder: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.LPA_COSTS_DECISION_LETTER}`
					)
				},
				internalCorrespondence: {
					crossTeam: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.CROSS_TEAM_CORRESPONDENCE}`
					),
					inspector: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.INSPECTOR_CORRESPONDENCE}`
					),
					mainParty: folders.find(
						(f) =>
							f.path ===
							`${APPEAL_CASE_STAGE.INTERNAL}/${APPEAL_DOCUMENT_TYPE.MAIN_PARTY_CORRESPONDENCE}`
					)
				}
			};
			return {
				...appealFolders
			};
		}
	}
}

/***
 * @param {Folder[]} folders
 * @returns {Object<string, Folder>}
 */
const processFolders = (folders) =>
	folders.reduce((accumulator, folder) => {
		const key = folder.path.split('/')[1];

		return {
			...accumulator,
			[key]: folder
		};
	}, {});
