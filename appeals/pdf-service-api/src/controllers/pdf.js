const generatePdf = require('../lib/generate-pdf');
const logger = require('../lib/logger');

// @ts-ignore
const postGeneratePdf = async (req, res) => {
	const {
		body: { html }
	} = req;

	try {
		const pdfBuffer = await generatePdf(html);
		res.contentType('application/pdf').send(pdfBuffer);
	} catch (err) {
		logger.error({ err }, 'Failed to download pdf');
		res.status(500).send({
			// @ts-ignore
			message: err.message
		});
	}
};

module.exports = {
	postGeneratePdf
};
