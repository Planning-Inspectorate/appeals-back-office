import { notificationBannerDefinitions } from './mappers/index.js';

/**
 * @typedef {Object} NotificationBannerSessionData
 * @property {import('./mappers/index.js').NotificationBannerDefinitionKey} key
 * @property {string} [html]
 * @property {string} [text]
 */

/**
 * @param {Object} options
 * @param {import('../app/auth/auth-session.service').SessionWithAuth & Object<string, any>} options.session
 * @param {import('./mappers/index.js').NotificationBannerDefinitionKey} options.bannerDefinitionKey
 * @param {number|string} options.appealId
 * @param {string} [options.html]
 * @param {string} [options.text]
 */
export const addNotificationBannerToSession = ({
	session,
	bannerDefinitionKey,
	appealId,
	html = '',
	text = ''
}) => {
	if (!(bannerDefinitionKey in notificationBannerDefinitions)) {
		return false;
	}

	if (!('notificationBanners' in session)) {
		session.notificationBanners = {};
	}

	const appealIdAsString = appealId.toString();

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
