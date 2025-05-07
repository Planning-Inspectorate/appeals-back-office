const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');
const generatePdfLib = require('../lib/generate-pdf');
const logger = require('../lib/logger');
const { getBrowserInstance } = require('../browser-instance');

const nunjucksEnv = nunjucks.configure(path.join(__dirname, '../views'), {
	autoescape: true
});

nunjucksEnv.addFilter('date', (dateString, formatString) => {
	try {
		if (!dateString) return '';
		const date = new Date(dateString);

		if (isNaN(date.getTime())) {
			logger.warn(`Invalid date encountered in template: ${dateString}`);
			return dateString;
		}

		return format(date, formatString);
	} catch (error) {
		logger.error(
			{ err: error, dateString, formatString },
			'Error formatting date in Nunjucks filter'
		);

		return dateString;
	}
});

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
		return null;
	}
};

// @ts-ignore
const postGeneratePdfController = async (req, res, next) => {
	const { currentAppeal, appealCaseNotes } = req.body;
	const appealId = currentAppeal?.appealId || 'unknown';

	if (!currentAppeal || !appealCaseNotes) {
		logger.warn({ appealId }, 'PDF Generation request missing required data');
		logger.warn('PDF Generation request missing required data (currentAppeal or appealCaseNotes)');
		return res
			.status(400)
			.send({ message: 'Missing required data: currentAppeal and appealCaseNotes' });
	}
	logger.info({ appealId }, 'Received request to generate PDF');
	logger.info(
		{ appealId: currentAppeal.appealId },
		'Received request to generate PDF, currentAppeal.appealId'
	);

	try {
		const browser = getBrowserInstance();
		logger.info({ appealId }, 'Retrieved shared browser instance.');

		const logoDataUri = generateDataUri('../assets/logo.png', 'image/png');

		logger.info({ appealId }, 'Rendering Nunjucks template: appeal-pdf.njk');

		const html = nunjucksEnv.render('appeal-pdf.njk', {
			currentAppeal,
			appealCaseNotes,
			logoDataUri: logoDataUri
		});
		logger.info(
			{ appealId },
			'HTML rendered successfully, calling PDF generation library (generatePdfLib)'
		);

		logger.info(`Rendered HTML length: ${html?.length || 0}`);
		if (html && html.length > 0) {
			logger.info(`Rendered HTML start: ${html.substring(0, 500)}...`);
			logger.info(`Rendered HTML end: ...${html.substring(html.length - 500)}`);
			logger.info(
				`HTML includes appealId (${currentAppeal.appealId})? ${html.includes(
					currentAppeal.appealId.toString()
				)}`
			);
			logger.info(
				`HTML includes case note text? ${
					appealCaseNotes.length > 0 ? html.includes(appealCaseNotes[0].note) : 'N/A (no notes)'
				}`
			);
		} else {
			logger.error('Rendered HTML is empty or null after Nunjucks processing!');
			throw new Error('Nunjucks rendered empty HTML content.');
		}

		logger.info('HTML rendered successfully, calling PDF generation library (generatePdfLib)');
		const pdfBuffer = await generatePdfLib(browser, html);
		logger.info(`PDF Buffer received from library. Size: ${pdfBuffer?.length || 0} bytes.`);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="appeal-details-${appealId}.pdf"`);
		res.send(pdfBuffer);
		logger.info({ appealId }, 'PDF sent successfully to client.');
	} catch (err) {
		logger.error({ err, appealId }, 'Error occurred during PDF generation or sending process.');
		next(err);
	}
};

module.exports = {
	postGeneratePdfController
};
