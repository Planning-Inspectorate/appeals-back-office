import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import {
	claimCaseFilePackage as claimCaseFilePackageRepository,
	completeCaseFilePackage as completeCaseFilePackageRepository,
	createCaseFilePackage as createCaseFilePackageRepository,
	failCaseFilePackage as failCaseFilePackageRepository,
	getActiveCaseFilePackage,
	getAppealForCaseFilePackage,
	getCaseFilePackageById as getCaseFilePackageByIdRepository,
	getLatestCaseFilePackage,
	getLatestReadyCaseFilePackage,
	markCaseFilePackageFailed
} from '#repositories/case-file-package.repository.js';
import { DefaultAzureCredential } from '@azure/identity';
import {
	BlobSASPermissions,
	BlobServiceClient,
	generateBlobSASQueryParameters,
	SASProtocol
} from '@azure/storage-blob';
import { CASE_FILE_PACKAGE_RESPONSE_STATUS } from '@pins/appeals/constants/case-file-package.js';
import { EventType } from '@pins/event-client';

const SAS_START_TIME_BUFFER_MS = 5 * 60_000; // 5 minutes
const SAS_TOKEN_VALIDITY_MS = 15 * 60_000; // 15 minutes

/**
 * @param {import('#db-client/client.ts').CaseFilePackage} item
 */
const mapCaseFilePackage = (item) => ({
	id: item.id,
	status: item.status,
	requestedAt: item.requestedAt,
	completedAt: item.completedAt,
	sizeBytes: item.sizeBytes === null ? null : item.sizeBytes.toString()
});

/** @typedef {ReturnType<typeof mapCaseFilePackage>} CaseFilePackage */

/**
 * @param {number} appealId
 * @returns {Promise<CaseFilePackage | { status: string } | null>}
 */
export const getCaseFilePackage = async (appealId) => {
	const appeal = await getAppealForCaseFilePackage(appealId);
	if (!appeal) return null;

	const item = await getLatestCaseFilePackage(appealId);

	return item
		? mapCaseFilePackage(item)
		: { status: CASE_FILE_PACKAGE_RESPONSE_STATUS.NOT_REQUESTED };
};

/**
 * @param {number} appealId
 * @returns {Promise<string|null>}
 */
export const getZipSasUrl = async (appealId) => {
	const item = await getLatestReadyCaseFilePackage(appealId);
	if (!item?.blobPath || item.blobPath !== `case-file-packages/${item.id}.zip`) return null;

	const container = config.BO_BLOB_CONTAINER;
	if (!container) throw new Error('Case file package blob storage is not configured');

	if (config.useBlobEmulator) {
		if (!config.blobEmulatorSasUrl)
			throw new Error('Case file package blob emulator is not configured');
		const url = new URL(config.blobEmulatorSasUrl);
		const containerPath = `/${container}`;
		if (!url.pathname.replace(/\/$/, '').endsWith(containerPath))
			throw new Error('Case file package container does not match blob emulator SAS URL');
		url.pathname = `${url.pathname.replace(/\/$/, '')}/${item.blobPath}`;
		return url.toString();
	}

	const storageUrl = config.BO_BLOB_STORAGE_ACCOUNT;
	if (!storageUrl) throw new Error('Case file package blob storage is not configured');
	const storage = new BlobServiceClient(storageUrl, new DefaultAzureCredential());
	const now = Date.now();
	const key = await storage.getUserDelegationKey(
		new Date(now - SAS_START_TIME_BUFFER_MS),
		new Date(now + SAS_TOKEN_VALIDITY_MS)
	);
	const blob = storage.getContainerClient(container).getBlobClient(item.blobPath);
	const token = generateBlobSASQueryParameters(
		{
			containerName: container,
			blobName: item.blobPath,
			permissions: BlobSASPermissions.parse('r'),
			protocol: SASProtocol.Https,
			startsOn: new Date(now - SAS_START_TIME_BUFFER_MS),
			expiresOn: new Date(now + SAS_TOKEN_VALIDITY_MS),
			contentDisposition: `attachment; filename="case-${appealId}.zip"`
		},
		key,
		storage.accountName
	).toString();

	return `${blob.url}?${token}`;
};

/**
 * @param {number} appealId
 * @param {string} requestedBy
 * @returns {Promise<{caseFilePackage: CaseFilePackage, reusedExisting: boolean }|null>}
 */
export const createCaseFilePackageRequest = async (appealId, requestedBy) => {
	const appeal = await getAppealForCaseFilePackage(appealId);
	if (!appeal) return null;

	let item;
	try {
		item = await createCaseFilePackageRepository(appealId, requestedBy);
	} catch (/** @type {any} */ error) {
		if (error?.code !== 'P2002') throw error;
		item = await getActiveCaseFilePackage(appealId);
		if (!item) throw error;
		return { caseFilePackage: mapCaseFilePackage(item), reusedExisting: true };
	}

	try {
		const sent = await eventClient.sendEvents(
			producers.boCaseFilePackage,
			[{ appealId, packageId: item.id }],
			EventType.Create
		);
		if (!sent) throw new Error('Could not queue case file package');
	} catch (error) {
		await markCaseFilePackageFailed(item.id, String(error));
		throw error;
	}

	return { caseFilePackage: mapCaseFilePackage(item), reusedExisting: false };
};

/**
 * @param {number} appealId
 * @param {string} packageId
 * @returns {Promise<CaseFilePackage | null>}
 */
export const getCaseFilePackageById = async (appealId, packageId) => {
	const item = await getCaseFilePackageByIdRepository(appealId, packageId);
	return item ? mapCaseFilePackage(item) : null;
};

/**
 * @param {number} appealId
 * @param {string} packageId
 * @returns {Promise<boolean>}
 */
export const claimCaseFilePackage = async (appealId, packageId) => {
	const { count } = await claimCaseFilePackageRepository(appealId, packageId);
	return count === 1;
};

/**
 * @param {number} appealId
 * @param {string} packageId
 * @param {string} blobPath
 * @param {number} sizeBytes
 * @returns {Promise<boolean|null>}
 */
export const completeCaseFilePackage = async (appealId, packageId, blobPath, sizeBytes) => {
	if (
		typeof blobPath !== 'string' ||
		blobPath !== `case-file-packages/${packageId}.zip` ||
		!Number.isSafeInteger(sizeBytes) ||
		sizeBytes < 1
	) {
		return null;
	}

	const { count } = await completeCaseFilePackageRepository(
		appealId,
		packageId,
		blobPath,
		sizeBytes
	);
	return count === 1;
};

/**
 * @param {number} appealId
 * @param {string} packageId
 * @param {object} body
 * @param {string} [body.error]
 * @returns {Promise<boolean>}
 */
export const failCaseFilePackage = async (appealId, packageId, body = {}) => {
	const error = typeof body?.error === 'string' ? body.error.slice(0, 500) : 'Packaging failed';
	const { count } = await failCaseFilePackageRepository(appealId, packageId, error);
	return count === 1;
};
