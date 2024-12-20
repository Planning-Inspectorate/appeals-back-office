class BackOfficeAppError extends Error {
	code;
	status;
	isOperational;

	/**
	 * @param {string} message
	 * @param {number} [statusCode]
	 * @param {Record<string, string>} [fieldErrors]
	 * */
	constructor(message, statusCode, fieldErrors) {
		super(message);

		this.code = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;
		this.fieldErrors = fieldErrors;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default BackOfficeAppError;
