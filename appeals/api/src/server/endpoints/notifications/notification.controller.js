/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import { getAppealNotifications } from '#repositories/appeal-notification.repository.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getNotifications = async (req, res) => {
	const { appeal } = req;
	const notifications = await getAppealNotifications(appeal.reference);

	return res.status(200).send(notifications);
};
