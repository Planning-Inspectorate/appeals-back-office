// @ts-nocheck
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { getBrowserInstance } from '../browser-instance.js';
import config from '../config.js';
import generatePdfLib from '../lib/generate-pdf.js';
import logger from '../lib/logger.js';
import nunjucksEnv from '../lib/nunjucks-environment.js';
import dirname from '../lib/utils/dirname.js';
import mapAppellantCaseData from '../mappers/appellant-case/appellant-case.mapper.js';
import { mapAppellantFinalComments } from '../mappers/appellant-final-comments/appellant-final-comments.mapper.js';
import mapIpCommentsData from '../mappers/ip-comments/ip-comments.mapper.js';
import { mapLpaFinalComments } from '../mappers/lpa-final-comments/lpa-final-comments.mapper.js';
import mapQuestionnaireData from '../mappers/lpa-questionnaire/lpa-questionnaire.mapper.js';
import { mapLpaStatement } from '../mappers/lpa-statement/lpa-statement.mapper.js';

const __dirname = dirname(import.meta.url); // get the resolved path of the directory

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
	const require = createRequire(import.meta.url);
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

const mapTemplateDataForView = (templateName, templateData) => {
	switch (templateName) {
		case 'lpa-questionnaire-pdf':
			return mapQuestionnaireData(templateData.lpaQuestionnaireData);
		case 'appellant-case-pdf':
			return mapAppellantCaseData(templateData.appellantCaseData);
		case 'ip-comments-pdf':
			return mapIpCommentsData(templateData.ipCommentsData);
		case 'lpa-statement-pdf':
			return mapLpaStatement(templateData.lpaStatementData);
		case 'lpa-final-comments-pdf':
			return mapLpaFinalComments(templateData.lpaFinalCommentsData);
		case 'appellant-final-comments-pdf':
			return mapAppellantFinalComments(templateData.appellantFinalCommentsData);
		default:
			return templateData;
	}
};

const postGeneratePdfController = async (req, res, next) => {
	const { templateName, templateData } = req.body;
	const identifier =
		templateData?.currentAppeal?.appealId ||
		templateData?.lpaQuestionnaireData?.appealId ||
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
		const mappedData = mapTemplateDataForView(templateName, templateData);
		const context = {
			...mappedData,
			logoDataUri: logoDataUri,
			gdsCssUrl: `/assets/${path.basename(gdsCssFilePath)}`
		};

		const html = nunjucksEnv.render(`${templateName}.njk`, context);

		logger.info(`Rendered HTML length for ${templateName}: ${html?.length || 0}`);

		if (config.development.createHTMLFile) {
			const tempDir = path.join(__dirname, '../..', 'temp');
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true });
			}
			const htmlFilePath = path.join(tempDir, `${templateName}.html`);
			logger.info({ identifier, templateName }, `Writing HTML to file: ${htmlFilePath}`);
			fs.writeFileSync(htmlFilePath, html, 'utf8');
			logger.info({ identifier, templateName }, 'HTML file written successfully.');
		}

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
			return res.status(400).json({
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

export { postGeneratePdfController };
