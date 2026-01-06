import { getAppellantCaseFromAppealId } from '#appeals/appeal-details/appellant-case/appellant-case.service.js';
import { getLpaQuestionnaireFromId } from '#appeals/appeal-details/lpa-questionnaire/lpa-questionnaire.service.js';
import { getSingularRepresentationByType } from '#appeals/appeal-details/representations/representations.service.js';
import config from '#environment/config.js';
import logger from '#lib/logger.js';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

const pdfServiceGenerateUrl = config.pdfServiceHost + '/generate-pdf';
const FETCH_TIMEOUT_MS = 30000;

/** @typedef {import('#appeals/appeal-details/appeal-details.types.d.ts').WebAppeal} WebAppeal */

// @ts-ignore
async function generatePdfViaService(templateName, templateData, appealIdForLog, filenameInZip) {
	logger.info(`[DownloadAll] Requesting PDF: ${filenameInZip} (Template: ${templateName})`);
	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		controller.abort();
	}, FETCH_TIMEOUT_MS);
	try {
		const response = await fetch(pdfServiceGenerateUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ templateName, templateData }),
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(
				`[DownloadAll] PDF service failed for ${filenameInZip}: ${response.status}. Body: ${errorBody}`
			);
			return {
				name: filenameInZip,
				error: `PDF Service Failed (Status ${response.status})`,
				buffer: null
			};
		}
		const arrayBuffer = await response.arrayBuffer();
		return { name: filenameInZip, buffer: Buffer.from(arrayBuffer), error: null };
	} catch (error) {
		clearTimeout(timeoutId);
		const errorMessage =
			// @ts-ignore
			error.name === 'AbortError'
				? `Timeout generating PDF`
				: `Network error during PDF generation`;
		// @ts-ignore
		console.error(`[DownloadAll] Error for ${filenameInZip}:`, error.message);
		return { name: filenameInZip, error: errorMessage, buffer: null };
	}
}

/**
 *
 * @param {WebAppeal} currentAppealData
 * @param {import('got').Got} apiClient
 * @returns {Promise<*>}
 */
export async function generateAllPdfs(currentAppealData, apiClient) {
	const { appealId, appealType } = currentAppealData;

	const hasTasks = [
		{
			filenameInZip: `LPA questionnaire ${currentAppealData.appealReference}.pdf`,
			templateName: 'lpa-questionnaire-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: LPA Questionnaire');
				const lpaQuestionnaireId = currentAppealData.lpaQuestionnaireId;
				if (!lpaQuestionnaireId) return null;

				const rawData = await getLpaQuestionnaireFromId(
					apiClient,
					appealId,
					lpaQuestionnaireId.toString()
				);

				if (rawData) {
					logger.debug(
						'[DownloadAll] Raw EIA Schedule Value from API:',
						rawData.eiaEnvironmentalImpactSchedule
					);
				}

				return rawData ? { lpaQuestionnaireData: { ...currentAppealData, ...rawData } } : null;
			}
		},
		{
			filenameInZip: `Appellant case ${currentAppealData.appealReference}.pdf`,
			templateName: 'appellant-case-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: Appellant Case');
				const appellantCaseId = currentAppealData.appellantCaseId;
				if (!appellantCaseId) return null;
				const rawData = await getAppellantCaseFromAppealId(apiClient, appealId, appellantCaseId);
				logger.info('rawData getAppellantCaseFromAppealId', rawData);
				return rawData ? { appellantCaseData: { ...currentAppealData, ...rawData } } : null;
			}
		}
	];

	// --- Step 1: Define a single source of truth for all tasks ---

	// folders are the same for s20 and s78
	const s78s20Tasks = [
		...hasTasks,
		{
			filenameInZip: `LPA statement ${currentAppealData.appealReference}.pdf`,
			templateName: 'lpa-statement-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: LPA Statement');
				const rawData = await getSingularRepresentationByType(
					apiClient,
					Number(appealId),
					'lpa_statement'
				);
				return rawData ? { lpaStatementData: { ...currentAppealData, ...rawData } } : null;
			}
		},
		{
			filenameInZip: `Appellant final comments ${currentAppealData.appealReference}.pdf`,
			templateName: 'appellant-final-comments-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: Appellant Final Comments');
				const rawData = await getSingularRepresentationByType(
					apiClient,
					Number(appealId),
					'appellant_final_comment'
				);
				return rawData
					? { appellantFinalCommentsData: { ...currentAppealData, ...rawData } }
					: null;
			}
		},
		{
			filenameInZip: `LPA final comments ${currentAppealData.appealReference}.pdf`,
			templateName: 'lpa-final-comments-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: LPA Final Comments');
				const rawData = await getSingularRepresentationByType(
					apiClient,
					Number(appealId),
					'lpa_final_comment'
				);
				return rawData ? { lpaFinalCommentsData: { ...currentAppealData, ...rawData } } : null;
			}
		},
		{
			filenameInZip: `Interested party comments ${currentAppealData.appealReference}.pdf`,
			templateName: 'ip-comments-pdf',
			async fetchData() {
				logger.debug('[DownloadAll] Fetching data for: Interested Party Comments');
				const statuses = ['awaiting_review', 'valid', 'invalid', 'published'];
				const promises = statuses.map((s) =>
					apiClient
						.get(`appeals/${appealId}/reps`, {
							searchParams: { type: 'comment', status: s, pageNumber: 1, pageSize: 1000 }
						})
						.json()
						.catch(() => ({ items: [] }))
				);
				const [awaiting, accepted, rejected, published] = await Promise.all(promises);
				if (
					!awaiting?.items?.length &&
					!accepted?.items?.length &&
					!rejected?.items?.length &&
					!published?.items?.length
				)
					return null;
				return {
					ipCommentsData: {
						...currentAppealData,
						awaitingReviewComments: awaiting.items,
						acceptedComments: accepted.items,
						rejectedComments: rejected.items,
						publishedComments: published.items
					}
				};
			}
		}
	];

	const tasks = appealType === APPEAL_TYPE.HOUSEHOLDER ? hasTasks : s78s20Tasks;

	// --- Step 2: Fetch data and generate PDFs in parallel ---
	logger.info(`[DownloadAll] Starting to process ${tasks.length} PDF generation tasks.`);
	const generationPromises = tasks.map(async (task) => {
		try {
			const templateData = await task.fetchData();
			if (!templateData) {
				return { name: task.filenameInZip, error: `No data available`, buffer: null };
			}
			return generatePdfViaService(task.templateName, templateData, appealId, task.filenameInZip);
		} catch (dataFetchError) {
			console.error(
				`[DownloadAll] Error during fetchData for ${task.templateName}:`,
				dataFetchError
			);
			return { name: task.filenameInZip, error: `Failed to fetch data`, buffer: null };
		}
	});

	const results = await Promise.all(generationPromises);

	// --- Step 3: Stream response as an array of buffers ---
	return results.filter((r) => r.buffer);
}
