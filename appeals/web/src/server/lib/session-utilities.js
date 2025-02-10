import { notificationBannerDefinitions } from './mappers/index.js';

/**
 * @typedef {Object} NotificationBannerSessionData
 * @property {import('./mappers/index.js').NotificationBannerDefinitionKey} key
 * @property {string} [html]
 * @property {string} [text]
 */

/**
 *
 * @param {import('../app/auth/auth-session.service').SessionWithAuth & Object<string, any>} session
 * @param {import('./mappers/index.js').NotificationBannerDefinitionKey} bannerDefinitionKey
 * @param {number|string} appealId
 * @param {string} [html]
 * @param {string} [text]
 */
export const addNotificationBannerToSession = (
	session,
	bannerDefinitionKey,
	appealId,
	html = '',
	text = ''
) => {
	if (!(bannerDefinitionKey in notificationBannerDefinitions)) {
		return false;
	}

	if (!('notificationBanners' in session)) {
		session.notificationBanners = {};
	}

	const appealIdAsString = typeof appealId === 'number' ? appealId.toString() : appealId;

	if (!(appealIdAsString in session.notificationBanners)) {
		/** @type {NotificationBannerSessionData[]} */
		session.notificationBanners[appealIdAsString] = [];
	}

	/** @type {NotificationBannerSessionData} */
	const notificationBannerSessionData = {
		key: bannerDefinitionKey,
		...(html && { html }),
		...(text && { text })
	};

	session.notificationBanners[appealIdAsString].push(notificationBannerSessionData);

	return true;
};
