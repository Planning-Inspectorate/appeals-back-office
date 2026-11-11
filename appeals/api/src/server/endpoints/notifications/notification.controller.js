/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

import {
	getAppealAuditNotifications,
	getAppealNotifications
} from '#repositories/appeal-notification.repository.js';
import appealRepository from '#repositories/appeal.repository.js';

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const patchNotifySuppression = async (req, res) => {
	const appealId = Number(req.params.appealId);
	const { suppressNotifications } = req.body;

	const updated = await appealRepository.setAppealNotifySuppression(
		appealId,
		suppressNotifications
	);

	return res.status(200).send({
		id: updated.id,
		suppressNotifications: updated.suppressNotifications
	});
};

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

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAuditNotifications = async (req, res) => {
	const { appeal } = req;
	const notifications = await getAppealAuditNotifications(appeal.reference);

	const auditNotifications = notifications.map((notification) => ({
		recipient: notification.recipient,
		subject: notification.subject,
		renderedContent: notification.renderedMessage || '',
		renderedSubject: notification.renderedSubject,
		dateCreated: notification.dateCreated,
		sender: notification.sender
	}));
	return res.status(200).send(auditNotifications);
};
