import {
	APPEAL_CASE_TYPE,
	APPEAL_CASE_PROCEDURE,
	APPEAL_REDACTED_STATUS,
	APPEAL_KNOWS_OTHER_OWNERS,
	APPEAL_EVENT_TYPE
} from 'pins-data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { FOLDERS } from '@pins/appeals/constants/documents.js';
/**
 * Static data required by the back-office service
 */

/**
 * @typedef {import('@pins/appeals.api').Schema.ProcedureType} ProcedureType
 * @typedef {import('@pins/appeals.api').Schema.KnowledgeOfOtherLandowners} KnowledgeOfOtherLandowners
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseValidationOutcome} AppellantCaseValidationOutcome
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseIncompleteReason} AppellantCaseIncompleteReason
 * @typedef {import('@pins/appeals.api').Schema.AppellantCaseInvalidReason} AppellantCaseInvalidReason
 * @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaireValidationOutcome} LPAQuestionnaireValidationOutcome
 * @typedef {import('@pins/appeals.api').Schema.LPAQuestionnaireIncompleteReason} LPAQuestionnaireIncompleteReason
 * @typedef {import('@pins/appeals.api').Schema.LPANotificationMethods} LPANotificationMethods
 * @typedef {import('@pins/appeals.api').Schema.SiteVisitType} SiteVisitType
 * @typedef {import('@pins/appeals.api').Schema.Specialism} Specialism
 * @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus
 * @typedef {import('@pins/appeals.api').Schema.RepresentationRejectionReason} RepresentationRejectionReason
 */

/**
 * Appeal types
 *
 */
export const appealTypes = [
	{ key: APPEAL_CASE_TYPE.D, type: APPEAL_TYPE.D, processCode: 'HAS', enabled: true },
	{ key: APPEAL_CASE_TYPE.C, type: APPEAL_TYPE.C, enabled: false },
	{ key: APPEAL_CASE_TYPE.F, type: APPEAL_TYPE.F, enabled: false },
	{ key: APPEAL_CASE_TYPE.G, type: APPEAL_TYPE.G, enabled: false },
	{ key: APPEAL_CASE_TYPE.H, type: APPEAL_TYPE.H, enabled: false },
	{ key: APPEAL_CASE_TYPE.L, type: APPEAL_TYPE.L, enabled: false },
	{ key: APPEAL_CASE_TYPE.Q, type: APPEAL_TYPE.Q, enabled: false },
	{ key: APPEAL_CASE_TYPE.S, type: APPEAL_TYPE.S, enabled: false },
	{ key: APPEAL_CASE_TYPE.V, type: APPEAL_TYPE.V, enabled: false },
	{ key: APPEAL_CASE_TYPE.W, type: APPEAL_TYPE.W, enabled: false },
	{ key: APPEAL_CASE_TYPE.X, type: APPEAL_TYPE.X, enabled: false },
	{ key: APPEAL_CASE_TYPE.Y, type: APPEAL_TYPE.Y, enabled: false },
	{ key: APPEAL_CASE_TYPE.Z, type: APPEAL_TYPE.Z, enabled: false }
];

/**
 * Seed static data into the database. Does not disconnect from the database or handle errors.
 * An array of procedure types.
 */
export const procedureTypes = [
	{
		key: APPEAL_CASE_PROCEDURE.HEARING,
		name: 'Hearing'
	},
	{
		key: APPEAL_CASE_PROCEDURE.INQUIRY,
		name: 'Inquiry'
	},
	{
		key: APPEAL_CASE_PROCEDURE.WRITTEN,
		name: 'Written'
	}
];

/**
 * An array of document redaction statuses.
 *
 */
export const documentRedactionStatuses = [
	{
		key: APPEAL_REDACTED_STATUS.REDACTED,
		name: 'Redacted'
	},
	{
		key: APPEAL_REDACTED_STATUS.NOT_REDACTED,
		name: 'Unredacted'
	},
	{
		key: APPEAL_REDACTED_STATUS.NO_REDACTION_REQUIRED,
		name: 'No redaction required'
	}
];

/**
 * An array of LPA notification methods.
 *
 */
export const lpaNotificationMethods = [
	{
		key: 'notice',
		name: 'A site notice'
	},
	{
		key: 'letter',
		name: 'Letter/email to interested parties'
	},
	{
		key: 'advert',
		name: 'A press advert'
	}
];

/**
 * An array of knowledge of other landowners values.
 *
 */
export const knowledgeOfOtherLandownersValues = [
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.YES.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.YES
	},
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.SOME.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.SOME
	},
	{
		key: APPEAL_KNOWS_OTHER_OWNERS.NO.toLowerCase(),
		name: APPEAL_KNOWS_OTHER_OWNERS.NO
	}
];

/**
 * An array of site visit types.
 *
 */
export const siteVisitTypes = [
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_ACCESS_REQUIRED, name: 'Access required' },
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_ACCOMPANIED, name: 'Accompanied' },
	{ key: APPEAL_EVENT_TYPE.SITE_VISIT_UNACCOMPANIED, name: 'Unaccompanied' }
];

//////////////////////////////////

/**
 * An array of appellant case validation outcomes.
 *
 * @type {Pick<AppellantCaseValidationOutcome, 'name'>[]}
 */
export const appellantCaseValidationOutcomes = [
	{
		name: 'Valid'
	},
	{
		name: 'Invalid'
	},
	{
		name: 'Incomplete'
	}
];

/**
 * An array of appellant case incomplete reasons.
 *
 * @type {Pick<AppellantCaseIncompleteReason, 'name' | 'hasText'>[]}
 */
export const appellantCaseIncompleteReasons = [
	{
		name: 'Appellant name is not the same on the application form and appeal form',
		hasText: false
	},
	{
		name: 'Attachments and/or appendices have not been included to the full statement of case',
		hasText: true
	},
	{
		name: "LPA's decision notice is missing",
		hasText: false
	},
	{
		name: "LPA's decision notice is incorrect or incomplete",
		hasText: true
	},
	{
		name: 'Documents and/or plans referred in the application form, decision notice and appeal covering letter are missing',
		hasText: true
	},
	{
		name: 'Agricultural holding certificate and declaration have not been completed on the appeal form',
		hasText: false
	},
	{
		name: 'The original application form is missing',
		hasText: false
	},
	{
		name: 'The original application form is incomplete',
		hasText: true
	},
	{
		name: 'Statement of case and ground of appeal are missing',
		hasText: false
	},
	{
		name: 'Other',
		hasText: true
	}
];

/**
 * An array of appellant case invalid reasons.
 *
 * @type {Pick<AppellantCaseInvalidReason, 'name' | 'hasText'>[]}
 */
export const appellantCaseInvalidReasons = [
	{
		name: 'Appeal has not been submitted on time',
		hasText: false
	},
	{
		name: 'Documents have not been submitted on time',
		hasText: false
	},
	{
		name: "The appellant doesn't have the right to appeal",
		hasText: false
	},
	{
		name: 'Other',
		hasText: true
	}
];

/**
 * An array of LPA questionnaire validation outcomes.
 *
 * @type {Pick<LPAQuestionnaireValidationOutcome, 'name'>[]}
 */
export const lpaQuestionnaireValidationOutcomes = [
	{
		name: 'Complete'
	},
	{
		name: 'Incomplete'
	}
];

/**
 * An array of LPA questionnaire incomplete reasons.
 *
 * @type {Pick<LPAQuestionnaireIncompleteReason, 'name' | 'hasText'>[]}
 */
export const lpaQuestionnaireIncompleteReasons = [
	{
		name: 'Policies are missing',
		hasText: true
	},
	{
		name: 'Other documents or information are missing',
		hasText: true
	},
	{
		name: 'Other',
		hasText: true
	}
];

/**
 * An array of specialisms.
 *
 * @type {Pick<Specialism, 'name'>[]}
 */

export const specialisms = [
	{ name: 'Schedule 1' },
	{ name: 'Schedule 2' },
	{ name: 'Enforcement' },
	{ name: 'General allocation' },
	{ name: 'Housing orders' },
	{ name: 'Rights of way' },
	{ name: 'Shopping' },
	{ name: 'Gypsy' },
	{ name: 'Housing' },
	{ name: 'Access' },
	{ name: 'Advertisements' },
	{ name: 'Appearance design' },
	{ name: 'Architecture design' },
	{ name: 'High hedges' },
	{ name: 'Historic heritage' },
	{ name: 'Listed building and enforcement' },
	{ name: 'Natural heritage' },
	{ name: 'Renewable energy/wind farms' },
	{ name: 'Roads and traffics' },
	{ name: 'Transport' },
	{ name: 'Tree preservation order' },
	{ name: 'Waste' },
	{ name: 'Water' }
];

/**
 * An array of representation rejection reasons.
 *
 * @type {Pick<RepresentationRejectionReason, 'name' | 'hasText'>[]}
 */
export const representationRejectionReasons = [
	{
		name: 'Received after deadline',
		hasText: false
	},
	{
		name: 'Illegible or Incomplete Documentation',
		hasText: false
	},
	{
		name: 'Includes personal and/or medical information',
		hasText: false
	},
	{
		name: 'Includes inflammatory content',
		hasText: false
	},
	{
		name: 'Duplicated comment',
		hasText: false
	},
	{
		name: 'Not relevant to this appeal',
		hasText: false
	},
	{
		name: 'Contains links to web pages',
		hasText: false
	},
	{
		name: 'Other',
		hasText: true
	}
];

/**
 * Seed static data into the database. Does not disconnect from the database or handle errors.
 *
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 */
export async function seedStaticData(databaseConnector) {
	const systemUserId = '00000000-0000-0000-0000-000000000000';

	await databaseConnector.user.upsert({
		where: {
			azureAdUserId: systemUserId
		},
		update: {},
		create: {
			azureAdUserId: systemUserId
		}
	});

	for (const appealType of appealTypes) {
		await databaseConnector.appealType.upsert({
			create: appealType,
			where: { type: appealType.type },
			update: appealType
		});
	}
	for (const procedureType of procedureTypes) {
		await databaseConnector.procedureType.upsert({
			create: procedureType,
			where: { name: procedureType.name },
			update: procedureType
		});
	}
	for (const lpaNotificationMethod of lpaNotificationMethods) {
		await databaseConnector.lPANotificationMethods.upsert({
			create: lpaNotificationMethod,
			where: { name: lpaNotificationMethod.name },
			update: lpaNotificationMethod
		});
	}
	for (const knowledgeOfOtherLandownersValue of knowledgeOfOtherLandownersValues) {
		await databaseConnector.knowledgeOfOtherLandowners.upsert({
			create: knowledgeOfOtherLandownersValue,
			where: { name: knowledgeOfOtherLandownersValue.name },
			update: knowledgeOfOtherLandownersValue
		});
	}
	for (const siteVisitType of siteVisitTypes) {
		await databaseConnector.siteVisitType.upsert({
			create: siteVisitType,
			where: { name: siteVisitType.name },
			update: siteVisitType
		});
	}
	for (const documentRedactionStatus of documentRedactionStatuses) {
		await databaseConnector.documentRedactionStatus.upsert({
			create: documentRedactionStatus,
			where: { name: documentRedactionStatus.name },
			update: documentRedactionStatus
		});
	}
	for (const appellantCaseValidationOutcome of appellantCaseValidationOutcomes) {
		await databaseConnector.appellantCaseValidationOutcome.upsert({
			create: appellantCaseValidationOutcome,
			where: { name: appellantCaseValidationOutcome.name },
			update: {}
		});
	}
	for (const appellantCaseIncompleteReason of appellantCaseIncompleteReasons) {
		await databaseConnector.appellantCaseIncompleteReason.upsert({
			create: appellantCaseIncompleteReason,
			where: { name: appellantCaseIncompleteReason.name },
			update: {}
		});
	}
	for (const appellantCaseInvalidReason of appellantCaseInvalidReasons) {
		await databaseConnector.appellantCaseInvalidReason.upsert({
			create: appellantCaseInvalidReason,
			where: { name: appellantCaseInvalidReason.name },
			update: {}
		});
	}
	for (const lpaQuestionnaireValidationOutcome of lpaQuestionnaireValidationOutcomes) {
		await databaseConnector.lPAQuestionnaireValidationOutcome.upsert({
			create: lpaQuestionnaireValidationOutcome,
			where: { name: lpaQuestionnaireValidationOutcome.name },
			update: {}
		});
	}
	for (const lpaQuestionnaireIncompleteReason of lpaQuestionnaireIncompleteReasons) {
		await databaseConnector.lPAQuestionnaireIncompleteReason.upsert({
			create: lpaQuestionnaireIncompleteReason,
			where: { name: lpaQuestionnaireIncompleteReason.name },
			update: {}
		});
	}
	for (const specialism of specialisms) {
		await databaseConnector.specialism.upsert({
			create: { name: specialism.name },
			where: { name: specialism.name },
			update: {}
		});
	}
	for (const rejectionReason of representationRejectionReasons) {
		await databaseConnector.representationRejectionReason.upsert({
			create: rejectionReason,
			where: { name: rejectionReason.name },
			update: {}
		});
	}

	await updateFolderDefinitionsForExistingAppeals(databaseConnector);
}

/**
 *
 * @param {import('../../server/utils/db-client/index.js').PrismaClient} databaseConnector
 */
const updateFolderDefinitionsForExistingAppeals = async (databaseConnector) => {
	//Find cases that have less folders than expected
	const queryRaw = `SELECT caseId FROM [Folder] GROUP BY [Folder].[caseId] HAVING COUNT(*) != ${FOLDERS.length}`;

	/**
	 * @type {{ caseId: number }[]}
	 */
	const existingAppealIDsWithMissingFolders = await databaseConnector.$queryRawUnsafe(queryRaw);

	for (const result of existingAppealIDsWithMissingFolders) {
		/**
		 * @type {{ caseId: number, path: string }[]}
		 */
		const defaultFolders = FOLDERS.map((/** @type {string} */ path) => {
			return {
				caseId: result.caseId,
				path
			};
		});

		for (const folder of defaultFolders) {
			await databaseConnector.folder.upsert({
				create: folder,
				update: folder,
				where: {
					caseId_path: {
						caseId: folder.caseId,
						path: folder.path
					}
				}
			});
		}
	}
};
