import { databaseConnector } from '#utils/database-connector.js';
import { CASE_FILE_PACKAGE_STATUS } from '@pins/appeals/constants/case-file-package.js';

const activeStatuses = [CASE_FILE_PACKAGE_STATUS.QUEUED, CASE_FILE_PACKAGE_STATUS.PROCESSING];

/** @param {number} appealId */
export const getAppealForCaseFilePackage = (appealId) =>
	databaseConnector.appeal.findUnique({
		where: { id: appealId },
		select: { id: true }
	});

/** @param {number} appealId */
export const getLatestCaseFilePackage = (appealId) =>
	databaseConnector.caseFilePackage.findFirst({
		where: { appealId },
		orderBy: { requestedAt: 'desc' }
	});

/** @param {number} appealId */
export const getLatestReadyCaseFilePackage = (appealId) =>
	databaseConnector.caseFilePackage.findFirst({
		where: { appealId, status: CASE_FILE_PACKAGE_STATUS.READY },
		orderBy: { requestedAt: 'desc' }
	});

/** @param {number} appealId @param {string} requestedBy */
export const createCaseFilePackage = (appealId, requestedBy) =>
	databaseConnector.caseFilePackage.create({ data: { appealId, requestedBy } });

/** @param {number} appealId */
export const getActiveCaseFilePackage = (appealId) =>
	databaseConnector.caseFilePackage.findFirst({
		where: { appealId, active: true, status: { in: activeStatuses } }
	});

/** @param {string} packageId @param {string} error */
export const markCaseFilePackageFailed = (packageId, error) =>
	databaseConnector.caseFilePackage.update({
		where: { id: packageId },
		data: { status: CASE_FILE_PACKAGE_STATUS.FAILED, active: false, error }
	});

/** @param {number} appealId @param {string} packageId */
export const getCaseFilePackageById = (appealId, packageId) =>
	databaseConnector.caseFilePackage.findFirst({
		where: { appealId, id: packageId }
	});

/** @param {number} appealId @param {string} packageId */
export const claimCaseFilePackage = (appealId, packageId) =>
	databaseConnector.caseFilePackage.updateMany({
		where: {
			id: packageId,
			appealId,
			active: true,
			status: CASE_FILE_PACKAGE_STATUS.QUEUED
		},
		data: { status: CASE_FILE_PACKAGE_STATUS.PROCESSING, processingStartedAt: new Date() }
	});

/** @param {number} appealId @param {string} packageId @param {string} blobPath @param {number} sizeBytes */
export const completeCaseFilePackage = (appealId, packageId, blobPath, sizeBytes) =>
	databaseConnector.caseFilePackage.updateMany({
		where: {
			id: packageId,
			appealId,
			active: true,
			status: CASE_FILE_PACKAGE_STATUS.PROCESSING
		},
		data: {
			status: CASE_FILE_PACKAGE_STATUS.READY,
			active: false,
			completedAt: new Date(),
			blobPath,
			sizeBytes
		}
	});

/** @param {number} appealId @param {string} packageId @param {string} error */
export const failCaseFilePackage = (appealId, packageId, error) =>
	databaseConnector.caseFilePackage.updateMany({
		where: {
			id: packageId,
			appealId,
			active: true,
			status: CASE_FILE_PACKAGE_STATUS.PROCESSING
		},
		data: {
			status: CASE_FILE_PACKAGE_STATUS.FAILED,
			active: false,
			processingStartedAt: null,
			error
		}
	});
