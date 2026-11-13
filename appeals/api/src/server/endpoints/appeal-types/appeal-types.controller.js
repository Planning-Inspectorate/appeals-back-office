import { updateAppealTypeNotifySuppression } from '#repositories/appeal-type.repository.js';
import logger from '#utils/logger.js';
import {
	ERROR_FAILED_TO_GET_DATA,
	ERROR_FAILED_TO_SAVE_DATA,
	ERROR_NOT_FOUND
} from '@pins/appeals/constants/support.js';
import { getAppealTypesReq } from './appeal-types.service.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAppealTypes = async (req, res) => {
	try {
		const filterEnabled = req.query.filterEnabled === 'true';
		const appeals = await getAppealTypesReq(filterEnabled);

		if (!appeals || !appeals.length) {
			return res.status(404).send({ errors: ERROR_NOT_FOUND });
		}

		return res.send(appeals);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: ERROR_FAILED_TO_GET_DATA });
	}
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const patchAppealTypeNotifySuppression = async (req, res) => {
	try {
		const { id } = req.params;
		const { suppressNotifications } = req.body;

		const updated = await updateAppealTypeNotifySuppression(id, suppressNotifications);
		return res.status(200).send(updated);
	} catch (error) {
		logger.error(error);
		return res.status(500).send({ errors: ERROR_FAILED_TO_SAVE_DATA });
	}
};

export { getAppealTypes, patchAppealTypeNotifySuppression };
