import { databaseConnector } from '#utils/database-connector.js';
import { AUDIT_TRAIL_SYSTEM_UUID } from '@pins/appeals/constants/support.js';
import {
	APPEAL_CASE_STATUS,
	APPEAL_TYPE_OF_PLANNING_APPLICATION
} from '@planning-inspectorate/data-model';
import { sub } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { randomBool } from '../../../database/seed/data-utilities.js';
import {
	createAppeal,
	createDocuments,
	createDocumentVersions,
	createRepresentation,
	createRepresentationAttachments,
	findFolderByPath,
	updateDocumentLatestVersion
} from './test-data.repository.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */

/**
 * @param {'has' | 's78'} appealType
 * @param {number} count
 * @param {string[]} userEmails
 */
const generateAppeals = async (appealType, count, userEmails) => {
	const BATCH_SIZE = 10;

	return databaseConnector.$transaction(async (tx) => {
		const folder = await findFolderByPath('representation/representationAttachments');
		const created = [];

		for (let start = 0; start < count; start += BATCH_SIZE) {
			const end = Math.min(start + BATCH_SIZE, count);
			const promises = [];

			for (let i = start; i < end; i++) {
				const appealInput = createMockAppeal(appealType, userEmails);
				promises.push(
					createAppeal(appealInput).then(async (appeal) => {
						await createRepresentationWithAttachments(tx, appeal.id, folder.id, { count: 25 });
						return appeal;
					})
				);
			}
			created.push(...(await Promise.all(promises)));
		}

		return created;
	});
};
/**
 * @param {import('#db-client').Prisma.TransactionClient} tx
 * @param {number} appealId
 * @param {number} folderId
 * @param {{ count?: number, type?: string, text?: string, status?: string, source?: string, notes?: string, stage?: string, documentType?: string, fileName?: string }} options
 */
export const createRepresentationWithAttachments = async (tx, appealId, folderId, options = {}) => {
	const docCount = options.count ?? 25;
	const rep = await createRepresentation(appealId, {
		representationType: options.type || 'lpa_final_comment',
		originalRepresentation: options.text || 'Auto-generated representation',
		redactedRepresentation: '',
		status: options.status || 'awaiting_review',
		source: options.source || 'citizen',
		notes: options.notes || 'auto-generated test representation',
		siteVisitRequested: false
	});

	if (docCount === 0) {
		return { rep, docs: [], versions: [], attachments: [] };
	}

	const documentData = [];
	const versionData = [];
	const attachmentData = [];

	for (let i = 0; i < docCount; i++) {
		const guid = randomUUID();
		const fileName = `${options.fileName || 'test-file'}-${i + 1}-${guid}.pdf`;

		documentData.push({
			name: fileName,
			guid,
			folderId,
			isDeleted: false,
			caseId: appealId
		});

		versionData.push({
			blobStorageContainer: 'document-service-uploads',
			dateCreated: new Date().toISOString(),
			description: `${fileName} imported`,
			documentGuid: guid,
			documentType: options.documentType || 'lpaFinalComments',
			draft: false,
			fileName,
			mime: 'application/pdf',
			originalFilename: fileName,
			size: 1024,
			stage: options.stage || 'appeal-submission',
			version: 1
		});

		attachmentData.push({
			documentGuid: guid,
			version: 1,
			representationId: rep.id
		});
	}

	await createDocuments(documentData);
	await createDocumentVersions(versionData);
	await createRepresentationAttachments(attachmentData);

	for (const doc of documentData) {
		await updateDocumentLatestVersion(doc.guid, 1);
	}

	return { rep, docs: documentData, versions: versionData, attachments: attachmentData };
};

/**
 * @param {'has' | 's78'} type
 * @param {string[]} userEmails
 * @returns {import('#db-client').Prisma.AppealCreateInput}
 */
export function createMockAppeal(type = 'has', userEmails = []) {
	const typeKey = type === 'has' ? 'D' : 'W';
	const now = new Date();
	const daysAgo90 = sub(new Date(), { days: 90 });
	const daysAgo60 = sub(new Date(), { days: 60 });
	const daysAgo30 = sub(new Date(), { days: 30 });

	const submissionId = randomUUID();
	const reference = randomUUID();
	const applicationRef = generateLpaReference();

	return {
		submissionId,
		applicationReference: applicationRef,
		reference,
		appealType: { connect: { key: typeKey } },

		caseCreatedDate: daysAgo90,
		caseUpdatedDate: now,
		caseValidDate: daysAgo60,
		caseExtensionDate: null,
		caseStartedDate: daysAgo60,
		casePublishedDate: daysAgo30,
		caseCompletedDate: null,
		withdrawalRequestDate: null,

		caseResubmittedTypeId: null,
		caseTransferredId: null,
		eiaScreeningRequired: false,
		allocationId: null,
		appealTimetable: undefined,

		appellantCase: { create: getRandomisedAppellantCaseCreateInput(typeKey) },
		appealStatus: {
			create: [
				{
					status: APPEAL_CASE_STATUS.VALIDATION,
					createdAt: now
				},
				{
					status: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
					createdAt: sub(new Date(), { months: 1 })
				}
			]
		},
		procedureType: { connect: { name: 'written' } },

		appellant: {
			create: {
				firstName: 'Load',
				lastName: 'Tester',
				email: userEmails[0] || 'load-test@example.com'
			}
		},
		agent: {
			create: {
				firstName: 'Agent',
				lastName: 'Smith',
				email: userEmails[1] || 'load-agent@example.com'
			}
		},
		lpa: {
			connectOrCreate: {
				where: { lpaCode: 'LOAD1' },
				create: {
					lpaCode: 'LOAD1',
					name: 'System Load Test Borough Council',
					email: 'appealplanningdecisionloadtest@planninginspectorate.gov.uk'
				}
			}
		},
		inspector: undefined,
		caseOfficer: {
			connectOrCreate: {
				where: { azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID },
				create: { azureAdUserId: AUDIT_TRAIL_SYSTEM_UUID }
			}
		},

		siteVisit: undefined,
		inspectorDecision: undefined,
		folders: { create: [] },
		documents: { create: [] },
		auditTrail: { create: [] },
		parentAppeals: { create: [] },
		childAppeals: { create: [] },
		representations: { create: [] },
		caseNotes: { create: [] },
		hearing: undefined,
		appealNotifications: { create: [] },
		hearingEstimate: undefined,
		inquiry: undefined,
		inquiryEstimate: undefined,
		assignedTeam: undefined,

		address: {
			create: {
				addressLine1: '123 Test Street',
				postcode: 'TE5 7ST'
			}
		},

		lpaQuestionnaire: { create: createLPAQuestionnaireForAppealType(typeKey) }
	};
}

/**
 * @returns {string}
 */
function generateLpaReference() {
	const numberPrefix = Math.floor(Math.random() * 69_999 + 1);
	const numberSuffix = Math.floor(Math.random() * 699_999 + 1);

	return `${numberPrefix}/APP/2025/${numberSuffix}`;
}

/**
 * @param {string} appealTypeShorthand
 * @returns {import('#db-client').Prisma.AppellantCaseCreateWithoutAppealInput}
 */
export const getRandomisedAppellantCaseCreateInput = (appealTypeShorthand) => {
	const monthAgo = sub(new Date(), { months: 1 });
	const weeksAgo6 = sub(new Date(), { weeks: 6 });
	const isGreenBelt = randomBool();
	const hasAdvertised = randomBool();

	const base = {
		siteAreaSquareMetres: 30.9,
		floorSpaceSquareMetres: 9.7,
		ownsAllLand: true,
		ownsSomeLand: false,
		hasAdvertisedAppeal: hasAdvertised,
		originalDevelopmentDescription: 'lorem ipsum',
		changedDevelopmentDescription: false,
		isGreenBelt,
		applicationDecisionDate: monthAgo,
		applicationDate: weeksAgo6
	};

	switch (appealTypeShorthand) {
		case 'W': // S78 Full Planning Appeal
			return {
				...base,
				typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.FULL_APPEAL,
				agriculturalHolding: randomBool(),
				tenantAgriculturalHolding: randomBool(),
				otherTenantsAgriculturalHolding: randomBool(),
				informedTenantsAgriculturalHolding: true
			};

		case 'D': // HAS (Householder)
		default:
			return {
				...base,
				typeOfPlanningApplication: APPEAL_TYPE_OF_PLANNING_APPLICATION.HOUSEHOLDER_PLANNING
			};
	}
};

/**
 * @param {string} appealTypeShorthand
 * @returns {import('#db-client').Prisma.LPAQuestionnaireCreateWithoutAppealInput | undefined}
 */
export function createLPAQuestionnaireForAppealType(appealTypeShorthand) {
	if (appealTypeShorthand !== 'D') {
		return undefined;
	}

	const baseDate = new Date(2023, 4, 9);

	return {
		siteSafetyDetails: 'There may be no mobile reception at the site',
		siteAccessDetails: 'There is a tall hedge around the site which obstructs the view of the site',
		inConservationArea: true,
		isCorrectAppealType: true,
		lpaStatement: null,
		newConditionDetails: null,
		lpaCostsAppliedFor: false,
		lpaqCreatedDate: baseDate,
		lpaQuestionnaireSubmittedDate: baseDate,
		isGreenBelt: randomBool()
	};
}

export const testDataService = {
	generateAppeals,
	createRepresentationWithAttachments
};
