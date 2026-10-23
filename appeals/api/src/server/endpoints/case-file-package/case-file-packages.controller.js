import {
	claimCaseFilePackage as claimCaseFilePackageService,
	completeCaseFilePackage as completeCaseFilePackageService,
	createCaseFilePackageRequest,
	failCaseFilePackage as failCaseFilePackageService,
	getCaseFilePackageById as getCaseFilePackageByIdService,
	getCaseFilePackage as getCaseFilePackageService,
	getZipSasUrl
} from './case-file-packages.service.js';

/** @type {import('express').RequestHandler} */
export const getCaseFilePackage = async (request, response) => {
	const appealId = Number(request.params.appealId);

	const item = await getCaseFilePackageService(appealId);
	return item ? response.json(item) : response.sendStatus(404);
};

/** @type {import('express').RequestHandler} */
export const getCaseFilePackageDownloadUrl = async (request, response) => {
	const appealId = Number(request.params.appealId);

	const url = await getZipSasUrl(appealId);
	if (!url) return response.sendStatus(404);

	response.set('Cache-Control', 'no-store');
	return response.json({ url });
};

/** @type {import('express').RequestHandler} */
export const requestCaseFilePackage = async (request, response) => {
	const appealId = Number(request.params.appealId);

	const result = await createCaseFilePackageRequest(
		appealId,
		String(request.headers['azureaduserid'])
	);

	if (!result) return response.sendStatus(404);

	return response.status(result.reusedExisting ? 200 : 202).json(result.caseFilePackage);
};

/** @type {import('express').RequestHandler} */
export const getCaseFilePackageById = async (request, response) => {
	const item = await getCaseFilePackageByIdService(
		Number(request.params.appealId),
		request.params.packageId
	);
	return item ? response.json(item) : response.sendStatus(404);
};

/** @type {import('express').RequestHandler} */
export const claimCaseFilePackage = async (request, response) => {
	const claimed = await claimCaseFilePackageService(
		Number(request.params.appealId),
		request.params.packageId
	);
	return response.sendStatus(claimed ? 204 : 409);
};

/** @type {import('express').RequestHandler} */
export const completeCaseFilePackage = async (request, response) => {
	const { blobPath, sizeBytes } = request.body || {};

	const completed = await completeCaseFilePackageService(
		Number(request.params.appealId),
		request.params.packageId,
		blobPath,
		sizeBytes
	);
	if (completed === null) return response.sendStatus(400);

	return response.sendStatus(completed ? 204 : 409);
};

/** @type {import('express').RequestHandler} */
export const failCaseFilePackage = async (request, response) => {
	const failed = await failCaseFilePackageService(
		Number(request.params.appealId),
		request.params.packageId,
		request.body
	);
	return response.sendStatus(failed ? 204 : 409);
};
