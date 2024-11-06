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
 * @param {boolean} userHasPermission
 * @param {ActionItemProperties|ActionItemProperties[]} component
 * @returns {ActionItemProperties | undefined}
 */
export const displayComponentGivenPermission = (userHasPermission, component) =>
	(userHasPermission && component) || undefined;

/**
 *
 * @param {string} permission
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @returns {boolean}
 */
export const userHasPermission = (permission, session) => {
	return Boolean(session.permissions && session.permissions[permission]);
};
