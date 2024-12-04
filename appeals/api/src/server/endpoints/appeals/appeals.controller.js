import { createAuditTrail } from '#endpoints/audit-trails/audit-trails.service.js';
import { getRootFoldersForAppeal } from '#endpoints/documents/documents.service.js';
import { getPageCount } from '#utils/database-pagination.js';
import { sortAppeals } from '#utils/appeal-sorter.js';
import { getAppealTypeByTypeId } from '#repositories/appeal-type.repository.js';
import { broadcasters } from '#endpoints/integrations/integrations.broadcasters.js';
import { getAvScanStatus } from '#endpoints/documents/documents.service.js';
import logger from '#utils/logger.js';
import appealRepository from '#repositories/appeal.repository.js';
import appealListRepository from '#repositories/appeal-lists.repository.js';
import representationRepository from '#repositories/representation.repository.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	AUDIT_TRAIL_ASSIGNED_CASE_OFFICER,
	AUDIT_TRAIL_ASSIGNED_INSPECTOR,
	AUDIT_TRAIL_REMOVED_CASE_OFFICER,
	AUDIT_TRAIL_REMOVED_INSPECTOR,
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_CANNOT_BE_EMPTY_STRING,
	AUDIT_TRAIL_SYSTEM_UUID
} from '../constants.js';
import {
	formatAppeal,
	formatAppeals,
	formatMyAppeals,
	getIdsOfReferencedAppeals
} from './appeals.formatter.js';
import { assignUser, assignedUserType } from './appeals.service.js';
import transitionState from '#state/transition-state.js';
import { getDocumentById } from '#repositories/document.repository.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('@pins/appeals.api').Appeals.SingleAppealDetailsResponse} SingleAppealDetailsResponse */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeals = async (req, res) => {
	const { query } = req;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const searchTerm = String(query.searchTerm);
	const status = String(query.status);
	const hasInspector = String(query.hasInspector);
	const isGreenBelt = query.isGreenBelt === 'true';

	console.log(isGreenBelt);

	const [
		itemCount,
		appeals = [],
		rawStatuses = []
		// rawLPAs = [],
		// rawcaseOfficers = [],
		// rawInspectors = []
	] = await appealListRepository.getAllAppeals(
		pageNumber,
		pageSize,
		searchTerm,
		status,
		hasInspector,
		isGreenBelt
	);

	const formattedAppeals = await Promise.all(
		appeals.map(async (appeal) => {
			const linkedAppeals = await appealRepository.getLinkedAppeals(appeal.reference);
			const commentCounts = await representationRepository.countAppealRepresentationsByStatus(
				appeal.id,
				'comment'
			);

			return formatAppeals(
				appeal,
				linkedAppeals.filter((linkedAppeal) => linkedAppeal.type === 'linked'),
				commentCounts
			);
		})
	);

	const formattedStatuses = mapAppealStatuses(rawStatuses);

	return res.send({
		itemCount,
		items: formattedAppeals,
		statuses: formattedStatuses,
		page: pageNumber,
		pageCount: getPageCount(itemCount, pageSize),
		pageSize
	});
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getMyAppeals = async (req, res) => {
	const { query } = req;
	const pageNumber = Number(query.pageNumber) || DEFAULT_PAGE_NUMBER;
	const pageSize = Number(query.pageSize) || DEFAULT_PAGE_SIZE;
	const status = String(query.status);
	const azureUserId = req.get('azureAdUserId');

	if (azureUserId) {
		const [itemCount, appeals = [], rawStatuses = []] = await appealListRepository.getUserAppeals(
			azureUserId,
			pageNumber,
			pageSize,
			status
		);

		const formattedAppeals = await Promise.all(
			appeals.map(async (appeal) => {
				const linkedAppeals = await appealRepository.getLinkedAppeals(appeal.reference);
				const commentCounts = await representationRepository.countAppealRepresentationsByStatus(
					appeal.id,
					'comment'
				);

				return formatMyAppeals(
					appeal,
					linkedAppeals.filter((linkedAppeal) => linkedAppeal.type === 'linked'),
					commentCounts
				);
			})
		);
		const sortedAppeals = sortAppeals(formattedAppeals);
		const formattedStatuses = mapAppealStatuses(rawStatuses);

		return res.send({
			itemCount,
			items: sortedAppeals,
			statuses: formattedStatuses,
			page: pageNumber,
			pageCount: getPageCount(itemCount, pageSize),
			pageSize
		});
	}

	return res.status(404).send({ errors: { azureUserId: ERROR_CANNOT_BE_EMPTY_STRING } });
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const getAppeal = async (req, res) => {
	const { appeal } = req;
	const appealRootFolders = await getRootFoldersForAppeal(appeal.id);

	let transferAppealTypeInfo;
	if (appeal.caseResubmittedTypeId && appeal.caseTransferredId) {
		const resubmitType = await getAppealTypeByTypeId(appeal.caseResubmittedTypeId);
		if (resubmitType) {
			transferAppealTypeInfo = {
				transferredAppealType: `(${resubmitType.key}) ${resubmitType.type}`,
				transferredAppealReference: appeal.caseTransferredId
			};
		}
	}

	let decisionInfo;
	if (
		appeal.appealStatus[0].status === APPEAL_CASE_STATUS.COMPLETE &&
		appeal.inspectorDecision?.decisionLetterGuid
	) {
		const document = await getDocumentById(appeal.inspectorDecision.decisionLetterGuid);
		if (document && document.latestDocumentVersion) {
			decisionInfo = {
				letterDate: document.latestDocumentVersion.dateReceived,
				documentName: document.name,
				virusCheckStatus: getAvScanStatus(document.latestDocumentVersion)
			};
		}
	}

	let formattedAppealWithLinkedTypes;
	if (appeal.linkedAppeals || appeal.relatedAppeals) {
		const relations = [...(appeal.linkedAppeals ?? []), ...(appeal.relatedAppeals ?? [])];

		const referencedAppealIds = getIdsOfReferencedAppeals(relations, appeal.reference);
		formattedAppealWithLinkedTypes = await appealRepository.getAppealsByIds(referencedAppealIds);
	}

	const formattedAppeal = formatAppeal(
		appeal,
		appealRootFolders,
		transferAppealTypeInfo,
		decisionInfo,
		formattedAppealWithLinkedTypes
	);
	return res.send(formattedAppeal);
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
const updateAppealById = async (req, res) => {
	const {
		appeal,
		body: { caseOfficer, inspector, startedAt, validAt, planningApplicationReference },
		params
	} = req;
	const appealId = Number(params.appealId);

	try {
		if (assignedUserType({ caseOfficer, inspector })) {
			await assignUser(appealId, { caseOfficer, inspector });

			let details = '';
			let isCaseOfficerAssignment = false;

			if (caseOfficer) {
				isCaseOfficerAssignment = true;
				details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_CASE_OFFICER, [caseOfficer]);
			} else if (inspector) {
				details = stringTokenReplacement(AUDIT_TRAIL_ASSIGNED_INSPECTOR, [inspector]);
			} else if (caseOfficer === null && appeal.caseOfficer) {
				details = stringTokenReplacement(AUDIT_TRAIL_REMOVED_CASE_OFFICER, [
					appeal.caseOfficer.azureAdUserId || ''
				]);
			} else if (inspector === null && appeal.inspector) {
				details = stringTokenReplacement(AUDIT_TRAIL_REMOVED_INSPECTOR, [
					appeal.inspector.azureAdUserId || ''
				]);
			}

			const azureUserId = req.get('azureAdUserId');
			await createAuditTrail({
				appealId: appeal.id,
				details,
				azureAdUserId: req.get('azureAdUserId')
			});

			if (isCaseOfficerAssignment && appeal.appealType) {
				await transitionState(
					appeal.id,
					appeal.appealType,
					azureUserId || AUDIT_TRAIL_SYSTEM_UUID,
					appeal.appealStatus,
					APPEAL_CASE_STATUS.VALIDATION
				);
			}
		} else {
			await appealRepository.updateAppealById(appealId, {
				caseStartedDate: startedAt,
				caseValidDate: validAt,
				applicationReference: planningApplicationReference
			});
		}

		await broadcasters.broadcastAppeal(appeal.id);
	} catch (error) {
		if (error) {
			logger.error(error);
			return res.status(500).send({ errors: { body: ERROR_FAILED_TO_SAVE_DATA } });
		}
	}

	const response = {
		...(caseOfficer !== undefined && { caseOfficer }),
		...(inspector !== undefined && { inspector }),
		...(startedAt !== undefined && { startedAt }),
		...(validAt !== undefined && { validAt }),
		...(planningApplicationReference !== undefined && { planningApplicationReference })
	};

	return res.status(200).send(response);
};

/**
 * @param {{ appealStatus: { status: string; }[] }[]} rawStatuses
 * @returns {string[]}
 */
const mapAppealStatuses = (rawStatuses) => {
	const statusOrder = [
		APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
		APPEAL_CASE_STATUS.VALIDATION,
		APPEAL_CASE_STATUS.READY_TO_START,
		APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
		APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
		APPEAL_CASE_STATUS.AWAITING_TRANSFER,
		APPEAL_CASE_STATUS.COMPLETE
	];

	const extractedStatuses = [
		...new Set(
			rawStatuses
				.flat()
				.flatMap((/** @type {*} */ item) =>
					item.appealStatus.map((/** @type {{ status: any; }} */ statusItem) => statusItem.status)
				)
		)
	];
	return statusOrder.filter((status) => extractedStatuses.includes(status));
};

export { getAppeal, getAppeals, getMyAppeals, updateAppealById, mapAppealStatuses };
