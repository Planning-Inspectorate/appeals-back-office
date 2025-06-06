import { Router } from 'express';
import archiver from 'archiver';
import { performance } from 'perf_hooks';
import { getAppealCaseNotes } from './case-notes/case-notes.service.js';
import { getLpaQuestionnaireFromId } from './lpa-questionnaire/lpa-questionnaire.service.js';
import { getSingularRepresentationByType } from './representations/representations.service.js';

const router = Router();
const pdfServiceGenerateUrl = 'http://localhost:3001/generate-pdf';
const FETCH_TIMEOUT_MS = 30000; // Timeout for each individual PDF generation call

// @ts-ignore
async function generatePdfViaService(templateName, templateData, appealIdForLog, filenameInZip) {
	console.log(
		`[DownloadAll] Requesting PDF: ${filenameInZip} (Template: ${templateName}), Appeal: ${appealIdForLog}`
	);
	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		console.error(`[DownloadAll] Fetch timeout for ${filenameInZip}`);
		controller.abort();
	}, FETCH_TIMEOUT_MS);

	try {
		const fetchStartTime = performance.now();
		const response = await fetch(pdfServiceGenerateUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ templateName, templateData }),
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		const fetchEndTime = performance.now();
		const duration = ((fetchEndTime - fetchStartTime) / 1000).toFixed(2);

		if (!response.ok) {
			const errorBody = await response.text();
			console.error(
				`[DownloadAll] PDF service failed for ${filenameInZip}: ${response.status}. Body: ${errorBody}. Duration: ${duration}s`
			);
			return {
				name: filenameInZip,
				error: `PDF Service Failed (Status ${response.status})`,
				buffer: null
			};
		}
		console.log(
			`[DownloadAll] PDF service success for ${filenameInZip}. Status: ${response.status}. Duration: ${duration}s`
		);
		const arrayBuffer = await response.arrayBuffer();
		return { name: filenameInZip, buffer: Buffer.from(arrayBuffer), error: null };
	} catch (error) {
		clearTimeout(timeoutId);
		let errorMessage = `Error fetching/generating PDF for ${filenameInZip}`;
		// @ts-ignore
		if (error.name === 'AbortError') {
			errorMessage = `Timeout fetching/generating PDF for ${filenameInZip}`;
			console.error(`[DownloadAll] ${errorMessage}`);
		} else {
			console.error(`[DownloadAll] ${errorMessage}:`, error);
		}
		return { name: filenameInZip, error: errorMessage, buffer: null };
	}
}

// --- Data Fetching Functions ---
// @ts-ignore
async function getAppealDataForMainPdf(apiClient, appealId, sessionCurrentAppeal) {
	console.log(`[DownloadAll] Fetching main appeal data and case notes for ${appealId}`);
	try {
		const appealCaseNotes = await getAppealCaseNotes(apiClient, appealId);
		return { currentAppeal: sessionCurrentAppeal, appealCaseNotes };
	} catch (error) {
		console.error(`[DownloadAll] Error fetching main appeal data/notes for ${appealId}:`, error);
		return null;
	}
}

// @ts-ignore
async function getLPAQuestionnaireDataForPdf(apiClient, appealId, currentAppealData) {
	console.log(`[DownloadAll] Attempting to fetch LPA Questionnaire for appealId: ${appealId}`);
	//console.log('current appeal data',currentAppealData);
	try {
		const lpaQuestionnaireId = currentAppealData.lpaQuestionnaireId;

		if (!lpaQuestionnaireId) {
			console.warn(
				`[DownloadAll] lpaQuestionnaireId not found on currentAppealData for appeal ${appealId}. Cannot fetch LPA Questionnaire.`
			);
			return null;
		}

		console.log(
			`[DownloadAll] Found lpaQuestionnaireId: ${lpaQuestionnaireId} for appeal ${appealId}. Fetching...`
		);
		const lpaQuestionnaireRawData = await getLpaQuestionnaireFromId(
			apiClient,
			appealId,
			lpaQuestionnaireId.toString()
		);

		console.log(
			'[DownloadAll] LPA Questionnaire Raw Data Fetched:',
			JSON.stringify(lpaQuestionnaireRawData, null, 2)
		);

		if (lpaQuestionnaireRawData) {
			return {
				lpaQuestionnaireData: {
					// @ts-ignore
					appealId: appealId,
					// @ts-ignore
					appealReference: currentAppealData.appealReference,
					localPlanningDepartment: currentAppealData.localPlanningDepartment,
					// @ts-ignore
					appealSite: currentAppealData.appealSite,
					neighbouringSites: currentAppealData.neighbouringSites,

					...lpaQuestionnaireRawData
				}
			};
		}
		console.warn(`[DownloadAll] No raw data returned for LPA Questionnaire ${lpaQuestionnaireId}`);
		return null;
	} catch (error) {
		console.error(
			`[DownloadAll] Error fetching LPA Questionnaire for appeal ${appealId} (ID: ${currentAppealData.lpaQuestionnaireId}):`,
			error
		);
		return null;
	}
}

// @ts-ignore
async function getLPAFinalCommentsDataForPdf(apiClient, appealId, currentAppealData) {
	console.log(`[DownloadAll] Attempting to fetch LPA Final Comments for appealId: ${appealId}`);
	try {
		const lpaFinalCommentType = 'lpa_final_comment';
		const desiredStatus = 'PUBLISHED';

		console.log(
			`[DownloadAll] Using representation type: '${lpaFinalCommentType}' and status: '${desiredStatus}'`
		);
		const rawLpaFinalComment = await getSingularRepresentationByType(
			apiClient,
			appealId,
			lpaFinalCommentType
		);
		console.log(
			'[DownloadAll] LPA Final Comment (from service) Raw Data Fetched:',
			JSON.stringify(rawLpaFinalComment, null, 2)
		);

		if (rawLpaFinalComment) {
			return {
				lpaFinalCommentsData: {
					appealId: currentAppealData.appealId,
					appealReference: currentAppealData.appealReference,
					appealSite: currentAppealData.appealSite,
					localPlanningDepartment: currentAppealData.localPlanningDepartment,
					commentsList: [rawLpaFinalComment]
				}
			};
		}
		console.warn(
			`[DownloadAll] No LPA Final Comments found for appeal ${appealId} (type: ${lpaFinalCommentType}).`
		);
		return null;
	} catch (error) {
		// @ts-ignore
		const errorMessage = error.response ? JSON.stringify(error.response.body) : error.message;
		// @ts-ignore
		console.error(
			`[DownloadAll] Error fetching LPA Final Comments for appeal ${appealId}:`,
			errorMessage,
			// @ts-ignore
			error.stack
		);
		return null;
	}
}
// @ts-ignore
async function getLPAStatementDataForPdf(apiClient, appealId, currentAppealData) {
	console.log(`[DownloadAll] Attempting to fetch LPA Statement for appealId: ${appealId}`);
	try {
		const lpaStatementType = 'lpa_statement';
		console.log(
			`[DownloadAll] Using getSingularRepresentationByType with type: '${lpaStatementType}'`
		);
		const rawLPAStatement = await getSingularRepresentationByType(
			apiClient,
			appealId,
			lpaStatementType
		);
		console.log(
			'[DownloadAll] LPA Statement Raw Data Fetched:',
			JSON.stringify(rawLPAStatement, null, 2)
		);

		if (rawLPAStatement) {
			return {
				lpaStatementData: {
					appealId: currentAppealData.appealId,
					appealReference: currentAppealData.appealReference,
					appealSite: currentAppealData.appealSite,
					localPlanningDepartment: currentAppealData.localPlanningDepartment,
					...rawLPAStatement
				}
			};
		}
		console.warn(
			`[DownloadAll] No LPA Statement found for appeal ${appealId} (type: ${lpaStatementType}).`
		);
		return null;
	} catch (error) {
		// @ts-ignore
		const errorMessage = error.response ? JSON.stringify(error.response.body) : error.message;
		console.error(
			`[DownloadAll] Error fetching LPA Statement for appeal ${appealId}:`,
			errorMessage
		);
		return null;
	}
}

// @ts-ignore
async function getAppellantFinalCommentsDataForPdf(apiClient, appealId, currentAppealData) {
	console.log(
		`[DownloadAll] Attempting to fetch Appellant Final Comments for appealId: ${appealId}`
	);
	try {
		const appellantFinalCommentType = 'appellant_final_comment';
		console.log(
			`[DownloadAll] Using getSingularRepresentationByType with type: '${appellantFinalCommentType}'`
		);
		const rawAppellantFinalComment = await getSingularRepresentationByType(
			apiClient,
			appealId,
			appellantFinalCommentType
		);
		console.log(
			'[DownloadAll] Appellant Final Comment Raw Data Fetched:',
			JSON.stringify(rawAppellantFinalComment, null, 2)
		);

		if (rawAppellantFinalComment) {
			return {
				appellantFinalCommentsData: {
					appealId: currentAppealData.appealId,
					appealReference: currentAppealData.appealReference,
					appealSite: currentAppealData.appealSite,
					localPlanningDepartment: currentAppealData.localPlanningDepartment,
					commentsList: [rawAppellantFinalComment]
				}
			};
		}
		console.warn(`[DownloadAll] No Appellant Final Comments found for appeal ${appealId}.`);
		return null;
	} catch (error) {
		// @ts-ignore
		const errorMessage = error.response ? JSON.stringify(error.response.body) : error.message;
		console.error(
			`[DownloadAll] Error fetching Appellant Final Comments for appeal ${appealId}:`,
			errorMessage
		);
		return null;
	}
}
// @ts-ignore
async function getIPCommentsDataForPdf(apiClient, appealId, currentAppealData) {
	console.log(
		`[DownloadAll] Attempting to fetch all Interested Party Comments for appealId: ${appealId}`
	);
	try {
		const statusesToFetch = ['awaiting_review', 'valid', 'invalid'];
		const ipCommentType = 'comment';
		const fetchPromises = statusesToFetch.map((status) => {
			console.log(`[DownloadAll] Preparing to fetch IP comments with status: ${status}`);
			return (
				apiClient
					.get(`appeals/${appealId}/reps`, {
						searchParams: {
							type: ipCommentType,
							status: status,
							pageNumber: 1,
							pageSize: 100 // Fetch up to 100 comments per status
						}
						// @ts-ignore
					})
					.json()
					// @ts-ignore
					.catch((err) => {
						console.error(
							`[DownloadAll] Failed to fetch IP comments with status '${status}':`,
							err.message
						);
						return { items: [] };
					})
			);
		});

		// Await all the parallel API calls
		const [awaitingReviewResponse, acceptedResponse, rejectedResponse] = await Promise.all(
			fetchPromises
		);

		const awaitingReviewComments = awaitingReviewResponse.items || [];
		const acceptedComments = acceptedResponse.items || [];
		const rejectedComments = rejectedResponse.items || [];

		console.log(
			`[DownloadAll] Fetched comment counts - Awaiting Review: ${awaitingReviewComments.length}, Accepted: ${acceptedComments.length}, Rejected: ${rejectedComments.length}`
		);

		if (
			awaitingReviewComments.length === 0 &&
			acceptedComments.length === 0 &&
			rejectedComments.length === 0
		) {
			console.warn(
				`[DownloadAll] No Interested Party Comments found for appeal ${appealId} across all statuses.`
			);
			return null;
		}

		return {
			ipCommentsData: {
				appealId: currentAppealData.appealId,
				appealReference: currentAppealData.appealReference,
				appealSite: currentAppealData.appealSite,
				localPlanningDepartment: currentAppealData.localPlanningDepartment,
				awaitingReviewComments: awaitingReviewComments,
				acceptedComments: acceptedComments,
				rejectedComments: rejectedComments
			}
		};
	} catch (error) {
		// @ts-ignore
		const errorMessage = error.response ? JSON.stringify(error.response.body) : error.message;
		console.error(
			`[DownloadAll] Critical error fetching Interested Party Comments for appeal ${appealId}:`,
			errorMessage
		);
		return null;
	}
}

router.get('/:appealId/download-all-generated-pdfs', async (req, res) => {
	// console.log('[DownloadAll] *** FORCING TEST ERROR ***');
	// return res.status(500).json({
	//     error: 'FORCED_TEST_ERROR',
	//     message: 'This is a test error to see if the notification banner appears correctly on the page.'
	// });
	const { appealId } = req.params;
	const { apiClient, session } = req;

	console.log(
		`[DownloadAll] ROUTE: Received request for all generated PDFs for appealId: ${appealId}`
	);

	if (!session.currentAppeal || session.currentAppeal.appealId?.toString() !== appealId) {
		console.error(
			`[DownloadAll] ROUTE: Appeal data mismatch/missing in session for appealId: ${appealId}`
		);
		return res
			.status(400)
			.json({ error: 'SESSION_ERROR', message: 'Appeal data not found in session or mismatch.' });
	}
	const currentAppealData = session.currentAppeal;
	// console.log('[DownloadAll] ROUTE: currentAppealData from session:', JSON.stringify(currentAppealData, null, 2));

	try {
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="appeal-${appealId}-generated-documents.zip"`
		);

		const archive = archiver('zip', { zlib: { level: 9 } });
		archive.on('warning', (err) => {
			console.warn('[DownloadAll] Archiver warning:', err);
		});
		archive.on('error', (err) => {
			console.error('[DownloadAll] Archiver critical error:', err);
			if (!res.writableEnded) {
				if (!res.headersSent)
					res
						.status(500)
						.json({ error: 'ZIP_ARCHIVE_ERROR', message: 'Failed to create ZIP archive.' });
				else res.end();
			}
		});
		archive.pipe(res);
		//const currentAppealData = session.currentAppeal;
		console.log(
			'[DownloadAll] ROUTE: currentAppealData.neighbouringSites:',
			JSON.stringify(currentAppealData.neighbouringSites, null, 2)
		);
		const tasks = [
			{
				filenameInZip: `Appeal_Details_${appealId}.pdf`,
				templateName: 'appeal-pdf',
				fetchData: () => getAppealDataForMainPdf(apiClient, appealId, currentAppealData)
			},
			{
				filenameInZip: `LPA_Questionnaire_${appealId}.pdf`,
				templateName: 'lpa-questionnaire-pdf',
				fetchData: () => getLPAQuestionnaireDataForPdf(apiClient, appealId, currentAppealData)
			},
			{
				filenameInZip: `LPA_Final_Comments_${appealId}.pdf`,
				templateName: 'lpa-final-comments-pdf',
				fetchData: () => getLPAFinalCommentsDataForPdf(apiClient, appealId, currentAppealData)
			},

			{
				filenameInZip: `LPA_Statement_${appealId}.pdf`,
				templateName: 'lpa-statement-pdf',
				fetchData: () => getLPAStatementDataForPdf(apiClient, appealId, currentAppealData)
			},
			{
				filenameInZip: `Appellant_Final_Comments_${appealId}.pdf`,
				templateName: 'appellant-final-comments-pdf',
				fetchData: () => getAppellantFinalCommentsDataForPdf(apiClient, appealId, currentAppealData)
			},
			{
				filenameInZip: `Interested_Party_Comments_${appealId}.pdf`,
				templateName: 'ip-comments-pdf',
				fetchData: () => getIPCommentsDataForPdf(apiClient, appealId, currentAppealData)
			}
		];

		console.log(
			`[DownloadAll] ROUTE: Starting to process ${tasks.length} PDF generation tasks in parallel.`
		);
		const generationPromises = tasks.map(async (task) => {
			try {
				const templateData = await task.fetchData();
				if (!templateData) {
					console.warn(
						`[DownloadAll] No data fetched for ${task.templateName}, Appeal: ${appealId}. Skipping PDF.`
					);
					return {
						name: task.filenameInZip,
						error: `No data available for ${task.templateName}`,
						buffer: null
					};
				}
				return generatePdfViaService(task.templateName, templateData, appealId, task.filenameInZip);
			} catch (dataFetchError) {
				console.error(
					`[DownloadAll] Error during fetchData for ${task.templateName}, Appeal: ${appealId}:`,
					dataFetchError
				);
				return {
					name: task.filenameInZip,
					error: `Failed to fetch data for ${task.templateName}`,
					buffer: null
				};
			}
		});

		const results = await Promise.all(generationPromises);
		const failedDocuments = [];

		for (const result of results) {
			if (result.buffer) {
				archive.append(result.buffer, { name: result.name });
				console.log(`[DownloadAll] Added ${result.name} to ZIP archive.`);
			} else {
				failedDocuments.push({ name: result.name, reason: result.error });
				console.warn(
					`[DownloadAll] Failed to generate ${result.name}. Reason: ${result.error}. Adding error file to ZIP.`
				);
				archive.append(
					`Failed to generate document: ${result.name}.\nReason: ${
						result.error || 'Unknown error during PDF generation.'
					}`,
					{ name: `${result.name}.ERROR.txt` }
				);
			}
		}

		if (failedDocuments.length > 0) {
			let summaryMessage = `SUMMARY OF ERRORS FOR APPEAL ${appealId}:\nOne or more documents could not be generated:\n`;
			failedDocuments.forEach(
				(fail) => (summaryMessage += `- ${fail.name} (Reason: ${fail.reason})\n`)
			);
			archive.append(summaryMessage, { name: '_GENERATION_ERRORS_SUMMARY.txt' });
		}

		console.log('[DownloadAll] Finalizing ZIP archive...');
		await archive.finalize();
		console.log('[DownloadAll] ZIP archive finalized and sent.');
	} catch (error) {
		console.error(
			`[DownloadAll] Critical error in /download-all-generated-pdfs route for appeal ${appealId}:`,
			error
		);
		if (!res.headersSent && !res.writableEnded) {
			res.status(500).json({
				error: 'DOWNLOAD_ALL_CRITICAL_ERROR',
				message: 'Could not process the request to download all documents.'
			});
		} else if (!res.writableEnded) {
			res.end();
		}
	}
});

export default router;
