/**
 *
 * @param {string} permission
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {ActionItemProperties|ActionItemProperties[]} component
 * @returns {ActionItemProperties | undefined}
 */
export const mapActionComponent = (permission, session, component) => {
	if (userHasPermission(permission, session)) {
		return component;
	}
};

/**
 *
 * @param {string} permission
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {boolean}
 */
export const userHasPermission = (permission, session) => {
	return Boolean(session.permissions && session.permissions[permission]);
};
