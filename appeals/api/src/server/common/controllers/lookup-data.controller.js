import commonRepository from '#repositories/common.repository.js';
import { ERROR_FAILED_TO_GET_DATA, ERROR_NOT_FOUND } from '@pins/appeals/constants/support.js';
import logger from '../../utils/logger.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {string} databaseTable
 * @returns {(req: Request, res: Response) => Promise<object | void>}
 */
const getLookupData = (databaseTable) => async (req, res) => {
	try {
		const lookupData = await commonRepository.getLookupList(databaseTable);

		if (!lookupData.length) {
			return res.status(404).send({ errors: ERROR_NOT_FOUND });
		}

		return res.send(lookupData);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: ERROR_FAILED_TO_GET_DATA });
	}
};

/**
 * @param {string} databaseTable
 * @param {{key: string;value: string;}} lookupData
 * @return {Promise<object | void>}
 *
 */
const getLookupDataByValue = async (databaseTable, lookupData) => {
	try {
		const result = await commonRepository.getLookupListValueByKey(databaseTable, lookupData);
		if (!lookupData) {
			return { errors: ERROR_NOT_FOUND };
		}
		return result;
	} catch (error) {
		logger.error(error);
		return { errors: ERROR_FAILED_TO_GET_DATA };
	}
};

export { getLookupData, getLookupDataByValue };
