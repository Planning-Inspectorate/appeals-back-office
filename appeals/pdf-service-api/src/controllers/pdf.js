//please note, this is an inital single file upload for the appellant case. I am leaving this code in to show how to send a single pdf to the service.
const nunjucks = require('nunjucks');
const path = require('path'); // Ensure path is required
const fs = require('fs');
const generatePdfLib = require('../lib/generate-pdf');
const logger = require('../lib/logger');
const { getBrowserInstance } = require('../browser-instance');
const { formatInTimeZone } = require('date-fns-tz'); //has been used due to timezone issues with container
const UK_TIMEZONE = 'Europe/London';
// --- Configure Nunjucks Environment ---
const nunjucksEnv = nunjucks.configure(path.join(__dirname, '../views'), {
	autoescape: true
});
nunjucksEnv.addFilter('date', (dateString, formatString) => {
	try {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			logger.warn(`Invalid date encountered in template: ${dateString}`);
			return dateString; // Return original if invalid
		}
		return formatInTimeZone(date, UK_TIMEZONE, formatString);
	} catch (error) {
		logger.error(
			{ err: error, dateString, formatString },
			'Error formatting date in Nunjucks filter'
		);
		return dateString; // Return original on error
	}
});

// Helper function to generate Data URI for images
// @ts-ignore
const generateDataUri = (relativePath, mimeType) => {
	try {
		const absolutePath = path.resolve(__dirname, relativePath);
		logger.info(`Attempting to read image for Data URI: ${absolutePath}`);
		const imageBuffer = fs.readFileSync(absolutePath);
		const base64Image = imageBuffer.toString('base64');
		const dataUri = `data:${mimeType};base64,${base64Image}`;
		logger.info(`Successfully generated Data URI for ${relativePath}. Length: ${dataUri.length}`);
		return dataUri;
	} catch (error) {
		logger.error(
			{ err: error, filePath: relativePath },
			'Failed to read image file or generate Data URI'
		);
		return null; // Return null if image can't be loaded
	}
};

// Load GDS CSS content once on module load
let gdsCssContent = '';
try {
	//const gdsCssPath = require.resolve('govuk-frontend/govuk/all.css');
	const gdsCssPath = require.resolve('govuk-frontend/dist/govuk/govuk-frontend.min.css');
	gdsCssContent = fs.readFileSync(gdsCssPath, 'utf8');
	logger.info(`Successfully loaded GDS CSS. Length: ${gdsCssContent.length}`);
} catch (error) {
	logger.error(
		{ err: error },
		'FATAL: Could not load GOV.UK Frontend CSS. PDFs will lack GDS styling.'
	);
	// Consider how to handle this - for now, it logs and continues.
}

const postGeneratePdfController = async (
	/** @type {{ body: { templateName: any; templateData: any; }; }} */ req,
	/** @type {{ status: (arg0: number) => { (): any; new (): any; json: { (arg0: { error: string; message: string; }): any; new (): any; }; }; setHeader: (arg0: string, arg1: string) => void; send: (arg0: Buffer<ArrayBufferLike>) => void; }} */ res,
	/** @type {(arg0: unknown) => void} */ next
) => {
	const { templateName, templateData } = req.body;

	// Try to get a consistent identifier for logging from various possible locations in templateData
	const identifier =
		templateData?.currentAppeal?.appealId ||
		templateData?.currentAppeal?.appealReference ||
		templateData?.appealId || // Generic appealId
		templateData?.appealReference || // Generic appealReference
		templateData?.lpaQuestionnaire?.appealId || // Specific to LPA Questionnaire
		'unknown_identifier';

	if (!templateName || !templateData) {
		logger.warn({ identifier }, 'PDF Generation request missing templateName or templateData');
		return res.status(400).json({
			error: 'BAD_REQUEST',
			message: 'Missing required data: templateName and templateData'
		});
	}
	logger.info({ identifier, templateName }, 'Received request to generate PDF');

	try {
		const browser = getBrowserInstance();
		const logoDataUri = generateDataUri('../assets/logo.png', 'image/png'); // Common asset

		logger.info({ identifier, templateName }, `Rendering Nunjucks template: ${templateName}.njk`);

		// Merge templateData with common assets for rendering
		const context = {
			...templateData, // Spread the specific data for the template
			logoDataUri: logoDataUri,
			gdsCss: gdsCssContent
		};

		const html = nunjucksEnv.render(`${templateName}.njk`, context);
		logger.info(`Rendered HTML length for ${templateName}: ${html?.length || 0}`);

		logger.info({ identifier, templateName }, 'HTML rendered, calling PDF generation library');
		const pdfBuffer = await generatePdfLib(browser, html);
		logger.info(
			{ identifier, templateName },
			`PDF Buffer received. Size: ${pdfBuffer?.length || 0} bytes.`
		);

		// The PDF service should just return the PDF buffer.
		// Filenaming and zipping will be handled by the calling service (main back office).
		res.setHeader('Content-Type', 'application/pdf');
		// No Content-Disposition needed here if the main app is consuming the buffer
		res.send(pdfBuffer);
		logger.info({ identifier, templateName }, 'PDF buffer sent successfully.');
	} catch (err) {
		// Handle Nunjucks template not found error specifically
		// @ts-ignore
		if (
			err.message &&
			(err.message.includes('template not found') || err.name === 'TemplateNotFoundError')
		) {
			logger.error({ err, identifier, templateName }, `Template not found: ${templateName}.njk`);
			return res.status(400).json({
				error: 'TEMPLATE_NOT_FOUND',
				message: `Invalid template specified: ${templateName}`
			});
		}
		// For other errors, pass to the generic error handler
		logger.error(
			{ err, identifier, templateName },
			'Error occurred during PDF generation process.'
		);
		next(err); // This will go to your app.js error handler in pdf-service-api
	}
};

module.exports = {
	postGeneratePdfController
};
