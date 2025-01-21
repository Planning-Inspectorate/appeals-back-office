import { apiMappers } from './api/index.js';
import { integrationMappers } from './integration/index.js';
import { contextEnum } from './context-enum.js';
import { APPEAL_CASE_STAGE, APPEAL_CASE_TYPE, APPEAL_DOCUMENT_TYPE } from 'pins-data-model';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */
/** @typedef {import('@pins/appeals.api').Api.Appeal} AppealDTO */
/** @typedef {import('@pins/appeals.api').Api.AppellantCase} AppellantCaseDto */
/** @typedef {import('@pins/appeals.api').Api.LpaQuestionnaire} LpaQuestionnaireDTO */
/** @typedef {import('pins-data-model').Schemas.AppealHASCase} AppealHASCase */
/** @typedef {import('pins-data-model').Schemas.AppealS78Case} AppealS78Case */
/** @typedef {import('@pins/appeals.api').Api.Folder} Folder */
/** @typedef {{ appeal: Appeal, context: keyof contextEnum|undefined }} MappingRequest */

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {AppealDTO|AppellantCaseDto|LpaQuestionnaireDTO|AppealHASCase|AppealS78Case|undefined}
 */
export const mapCase = ({ appeal, context = contextEnum.appealDetails }) => {
	if (context && appeal?.id && appeal?.caseCreatedDate) {
		const caseMap =
			context === contextEnum.broadcast
				? createIntegrationMap({ appeal, context })
				: createDataMap({ appeal, context });

		return createDataLayout(caseMap, { appeal, context });
	}
};

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
function createDataMap(mappingRequest) {
	const { appeal } = mappingRequest;

	const casedata = createMap(apiMappers.apiSharedMappers, mappingRequest);
	switch (appeal.appealType?.key) {
		case APPEAL_CASE_TYPE.W: {
			const s78 = createMap(apiMappers.apiS78Mappers, mappingRequest);
			mergeMaps(casedata, s78);
			break;
		}
		case APPEAL_CASE_TYPE.D:
		default: {
			break;
		}
	}

	return casedata;
}

/**
 *
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
function createIntegrationMap(mappingRequest) {
	const { appeal } = mappingRequest;

	const casedata = createMap(integrationMappers.integrationSharedMappers, mappingRequest);
	switch (appeal.appealType?.key) {
		case APPEAL_CASE_TYPE.W: {
			const s78 = createMap(integrationMappers.integrationS78Mappers, mappingRequest);
			mergeMaps(casedata, s78);
			break;
		}
		case APPEAL_CASE_TYPE.D:
		default: {
			break;
		}
	}

	return casedata;
}

/**
 *
 * @param {Object<string, *>} mappers
 * @param {MappingRequest} mappingRequest
 * @returns {Map<string, *>}
 */
function createMap(mappers, mappingRequest) {
	const casedata = new Map([]);
	Object.entries(mappers).forEach(([key, mapper]) => {
		const mapped = mapper(mappingRequest);
		if (mapped) {
			casedata.set(key, mapped);
		}
	});
	return casedata;
}

/**
 *
 * @param {Map<string, *>} existingMap
 * @param {Map<string, *>} newMap
 */
function mergeMaps(existingMap, newMap) {
	Array.from(existingMap.entries()).forEach(([key, value]) => {
		const newValue = newMap.get(key);
		if (newValue) {
			existingMap.set(key, {
				...value,
				...newValue
			});
		}
	});
}

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
				...createFoldersLayout(folders, contextEnum.appealDetails)
			};
		}
	}
}

/***
 *
 * @param {Folder[]} folders
 * @param { keyof contextEnum} context
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
					decisionFolder: folders.find(
						(f) =>
							f.path === `${APPEAL_CASE_STAGE.COSTS}/${APPEAL_DOCUMENT_TYPE.COSTS_DECISION_LETTER}`
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
 *
 * @param {Folder[]} folders
 * @returns {Object<string, Folder>}
 *
 */
function processFolders(folders) {
	/** @type {Object<string, Folder>} */
	const documents = {};
	folders.map((folder) => {
		const key = folder.path.split('/')[1];
		documents[key] = folder;
	});

	return documents;
}
