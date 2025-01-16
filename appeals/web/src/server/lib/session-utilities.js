import { notificationBannerDefinitions } from './mappers/index.js';

/**
 *
 * @param {import('../app/auth/auth-session.service').SessionWithAuth & Object<string, any>} session
 * @param {keyof import('./mappers/index.js').notificationBannerDefinitions} bannerDefinitionKey
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

	session.notificationBanners[bannerDefinitionKey] = {
		appealId: typeof appealId === 'string' ? parseInt(appealId) : appealId,
		html,
		...(text && { text })
	};

	return true;
};
/*** @param {import('../app/auth/auth-session.service').SessionWithAuth & Object<string, any>} session* @param {number|string} appealId* @param {keyof import('./mappers/index.js').notificationBannerDefinitions} bannerDefinitionKey*/ export const clearNotificationBannerFromSession =
	(session, appealId, bannerDefinitionKey) => {
		if (!(bannerDefinitionKey in notificationBannerDefinitions)) {
			return false;
		}
		if (!('notificationBanners' in session)) {
			return false;
		}
		if (!(bannerDefinitionKey in session.notificationBanners)) {
			return false;
		}
		if (session.notificationBanners[bannerDefinitionKey]?.appealId !== appealId) {
			return false;
		}
		delete session.notificationBanners[bannerDefinitionKey];
	};
