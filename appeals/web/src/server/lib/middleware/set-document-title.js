/**
 * @param {string} documentTitle
 * @returns {import('express').RequestHandler}
 */
export const setDocumentTitle = (documentTitle) => (req, res, next) => {
	req.locals = req.locals || {};
	req.locals.pageContent = {
		...req.locals.pageContent,
		addDocument: {
			...req.locals.pageContent?.addDocument,
			documentTitle
		}
	};
	next();
};
