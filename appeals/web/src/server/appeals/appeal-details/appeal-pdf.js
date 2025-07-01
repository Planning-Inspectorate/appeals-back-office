// @ts-nocheck
import { Router } from 'express';
import { getAppealCaseNotes } from './case-notes/case-notes.service.js';
import { performance } from 'perf_hooks';
const router = Router();
const pdfServiceBaseUrl = 'http://localhost:3001';
const pdfServiceGenerateUrl = `${pdfServiceBaseUrl}/generate-pdf`;
const pdfServiceHealthUrl = `${pdfServiceBaseUrl}/health`;

const FETCH_TIMEOUT_MS = 30000;
//console.log(currentAppeal);

/**
 * @param {import('@pins/express/types/express.js').Request} req
 * @param {import('@pins/express/types/express.js').Response} res
 */
router.get('/', async (req, res) => {
	const appealId = req.params.appealId;
	const { session, apiClient } = req;
	console.log(`[appeal-pdf.js] Received request for appealId: ${appealId}`);

	const controller = new AbortController();
	const timeoutId = setTimeout(() => {
		console.error(`[appeal-pdf.js] Fetch timeout triggered after ${FETCH_TIMEOUT_MS}ms`);
		controller.abort();
	}, FETCH_TIMEOUT_MS);
	try {
		console.log(
			`[appeal-pdf.js] *** TEST: Initiating fetch to HEALTH endpoint: ${pdfServiceHealthUrl} ***`
		);
		const healthController = new AbortController();
		const healthTimeoutId = setTimeout(() => healthController.abort(), 5000);
		const healthStartTime = performance.now();
		const healthResponse = await fetch(pdfServiceHealthUrl, { signal: healthController.signal });
		clearTimeout(healthTimeoutId);
		const healthEndTime = performance.now();
		console.log(
			`[appeal-pdf.js] *** TEST: Health fetch completed. Status: ${
				healthResponse.status
			}. Duration: ${((healthEndTime - healthStartTime) / 1000).toFixed(2)}s ***`
		);
	} catch (healthError) {
		// @ts-ignore
		console.error(
			`[appeal-pdf.js] *** TEST: Error during fetch to HEALTH endpoint: ${healthError.message} ***`
		);
	}

	let fetchStartTime;
	try {
		const currentAppeal = session.currentAppeal;

		if (!currentAppeal || currentAppeal.appealId?.toString() !== appealId) {
			console.error(
				`[appeal-pdf.js] Appeal data mismatch or missing in session. Requested: ${appealId}, Session: ${currentAppeal?.appealId}`
			);
			clearTimeout(timeoutId);
			return res.status(400).send('Appeal data mismatch or missing in session.');
		}

		console.log(`[appeal-pdf.js] Fetching case notes for appeal: ${appealId}`);
		const appealCaseNotes = await getAppealCaseNotes(apiClient, appealId);
		console.log(`[appeal-pdf.js] Case notes fetched. Count: ${appealCaseNotes?.length || 0}`);

		if (appealCaseNotes && appealCaseNotes.length > 0) {
			console.log('[appeal-pdf.js] Logging fetched case notes structure (first few):');
			appealCaseNotes.slice(0, 3).forEach((noteObject, index) => {
				console.log(`  Note ${index}:`, JSON.stringify(noteObject, null, 2));
			});
		} else if (appealCaseNotes) {
			console.log('[appeal-pdf.js] Fetched case notes array is empty.');
		} else {
			console.log('[appeal-pdf.js] Fetched case notes is null or undefined.');
		}
		const payload = { currentAppeal, appealCaseNotes };
		const payloadString = JSON.stringify(payload);
		console.log(
			`[appeal-pdf.js] Prepared payload. Size: ${payloadString.length} bytes. Sending to ${pdfServiceGenerateUrl}`
		);

		console.log(
			`[appeal-pdf.js] Initiating fetch to PDF generation endpoint: ${pdfServiceGenerateUrl} with ${FETCH_TIMEOUT_MS}ms timeout`
		);
		fetchStartTime = performance.now();
		const pdfResponse = await fetch(pdfServiceGenerateUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: payloadString,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		const fetchEndTime = performance.now();
		const fetchDuration = ((fetchEndTime - fetchStartTime) / 1000).toFixed(2);
		console.log(
			`[appeal-pdf.js] Fetch to generation endpoint completed. Status: ${pdfResponse.status}. Duration: ${fetchDuration}s`
		);

		if (!pdfResponse.ok) {
			const errorBody = await pdfResponse.text();
			console.error(
				`[appeal-pdf.js] PDF service failed: ${pdfResponse.status} ${pdfResponse.statusText}. Duration: ${fetchDuration}s`
			);
			console.error(`[appeal-pdf.js] PDF service error body: ${errorBody}`);
			return res
				.status(500)
				.send(`Failed to generate PDF. Service responded with status ${pdfResponse.status}.`);
		}
		console.log(`[appeal-pdf.js] PDF service response OK (Status: ${pdfResponse.status}).`);

		const contentType = pdfResponse.headers.get('content-type');
		console.log(`[appeal-pdf.js] PDF service response Content-Type: ${contentType}`);
		if (!contentType || !contentType.includes('application/pdf')) {
			console.warn(
				`[appeal-pdf.js] PDF service responded with OK status but unexpected content type: ${contentType}.`
			);
		}

		console.log('[appeal-pdf.js] Reading PDF response body into buffer...');
		const bufferStartTime = performance.now();
		const arrayBuffer = await pdfResponse.arrayBuffer();
		const pdfBuffer = Buffer.from(arrayBuffer);
		const bufferEndTime = performance.now();
		console.log(
			`[appeal-pdf.js] PDF response body buffered successfully. Size: ${
				pdfBuffer.length
			} bytes. Buffering Duration: ${((bufferEndTime - bufferStartTime) / 1000).toFixed(2)}s`
		);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="appeal-details-${appealId}.pdf"`);
		console.log('[appeal-pdf.js] Response headers set. Sending complete PDF buffer to client...');
		const sendStartTime = performance.now();
		res.send(pdfBuffer);
		const sendEndTime = performance.now();
		console.log(
			`[appeal-pdf.js] res.send(pdfBuffer) finished. Send Duration: ${(
				(sendEndTime - sendStartTime) /
				1000
			).toFixed(2)}s`
		);
	} catch (error) {
		clearTimeout(timeoutId);
		const errorFetchDuration = fetchStartTime
			? `Fetch Duration Before Error: ${((performance.now() - fetchStartTime) / 1000).toFixed(2)}s`
			: 'Fetch did not start or error occurred before fetch.';

		// @ts-ignore
		if (error.name === 'AbortError') {
			console.error(
				`[appeal-pdf.js] Fetch aborted due to timeout (${FETCH_TIMEOUT_MS}ms). ${errorFetchDuration}`
			);
			if (!res.headersSent)
				res.status(504).send('Could not generate PDF: Request to PDF service timed out.');
		} else {
			// @ts-ignore
			console.error(
				`[appeal-pdf.js] PDF generation flow failed in CATCH block. Error Type: ${error.name}, Message: ${error.message}. ${errorFetchDuration}`
			);
			// @ts-ignore
			if (error.cause) {
				// @ts-ignore
				console.error(`[appeal-pdf.js] Error Cause: ${error.cause}`);
			}
			// @ts-ignore
			console.error(error.stack);
			// @ts-ignore
			if (!res.headersSent)
				res.status(500).send(`Could not generate PDF due to an internal error: ${error.message}`);
		}
	}
});

export default router;
