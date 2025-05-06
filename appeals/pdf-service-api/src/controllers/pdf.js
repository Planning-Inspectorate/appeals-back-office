// @ts-nocheck
const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');
const { formatInTimeZone } = require('date-fns-tz');
const generatePdfLib = require('../lib/generate-pdf');
const logger = require('../lib/logger');
const { getBrowserInstance } = require('../browser-instance');
const UK_TIMEZONE = 'Europe/London';
const nunjucksEnv = nunjucks.configure(path.join(__dirname, '../views'), {
	autoescape: true
});
nunjucksEnv.addFilter('date', (dateString, formatString) => {
	try {
		if (!dateString) return '';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			logger.warn(`Invalid date encountered in template filter: ${dateString}`);
			return dateString;
		}
		return formatInTimeZone(date, UK_TIMEZONE, formatString);
	} catch (error) {
		logger.error(
			{ err: error, dateString, formatString },
			'Error formatting date in Nunjucks filter'
		);
		return dateString;
	}
});

const generateDataUri = (relativePath, mimeType) => {
	try {
		const absolutePath = path.resolve(__dirname, relativePath);
		const imageBuffer = fs.readFileSync(absolutePath);
		const base64Image = imageBuffer.toString('base64');
		return `data:${mimeType};base64,${base64Image}`;
	} catch (error) {
		logger.error({ err: error, filePath: relativePath }, 'Failed to read image file for Data URI');
		return null;
	}
};

let gdsCssFilePath = '';
try {
	const gdsCssSourcePath = require.resolve('govuk-frontend/dist/govuk/govuk-frontend.min.css');
	const gdsCssContent = fs.readFileSync(gdsCssSourcePath, 'utf8');

	const staticCssDir = path.join(__dirname, '../public/assets');
	if (!fs.existsSync(staticCssDir)) {
		fs.mkdirSync(staticCssDir, { recursive: true });
	}
	const cssFileName = 'govuk-frontend-pdf.css';
	gdsCssFilePath = path.join(staticCssDir, cssFileName);
	fs.writeFileSync(gdsCssFilePath, gdsCssContent, 'utf8');
	logger.info(`Successfully loaded GDS CSS and wrote to static file: ${gdsCssFilePath}`);
} catch (error) {
	logger.error(
		{ err: error },
		'FATAL: Could not load or write GOV.UK Frontend CSS to static file.'
	);
	throw error;
}

const postGeneratePdfController = async (req, res, next) => {
	const { templateName, templateData } = req.body;
	const identifier =
		templateData?.currentAppeal?.appealId ||
		templateData?.lpaQuestionnaireData?.appealId ||
		'unknown_identifier';

	if (!templateName || !templateData) {
		logger.warn({ identifier }, 'PDF Generation request missing templateName or templateData');
		return res
			.status(400)
			.json({
				error: 'BAD_REQUEST',
				message: 'Missing required data: templateName and templateData'
			});
	}
	logger.info({ identifier, templateName }, 'Received request to generate PDF');

	try {
		const browser = getBrowserInstance();
		const logoDataUri = generateDataUri('../assets/logo.png', 'image/png'); // Common asset

		logger.info({ identifier, templateName }, `Rendering Nunjucks template: ${templateName}.njk`);
		const context = {
			...templateData,
			logoDataUri: logoDataUri,
			gdsCssUrl: `/assets/${path.basename(gdsCssFilePath)}`
		};
		const html = nunjucksEnv.render(`${templateName}.njk`, context);

		logger.info(`Rendered HTML length for ${templateName}: ${html?.length || 0}`);

		const pdfBuffer = await generatePdfLib(browser, html);
		logger.info(
			{ identifier, templateName },
			`PDF Buffer received. Size: ${pdfBuffer?.length || 0} bytes.`
		);

		res.setHeader('Content-Type', 'application/pdf');
		res.send(pdfBuffer);
		logger.info({ identifier, templateName }, 'PDF buffer sent successfully.');
	} catch (err) {
		if (
			err.message &&
			(err.message.includes('template not found') || err.name === 'TemplateNotFoundError')
		) {
			logger.error({ err, identifier, templateName }, `Template not found: ${templateName}.njk`);
			return res
				.status(400)
				.json({
					error: 'TEMPLATE_NOT_FOUND',
					message: `Invalid template specified: ${templateName}`
				});
		}
		logger.error(
			{ err, identifier, templateName },
			'Error occurred during PDF generation process.'
		);
		next(err);
	}
};

module.exports = {
	postGeneratePdfController
};
