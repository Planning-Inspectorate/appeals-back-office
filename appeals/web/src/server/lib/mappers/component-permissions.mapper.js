/**
 *
 * @param {string} permission
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} session
 * @param {ActionItemProperties} component
 * @returns {ActionItemProperties | undefined}
 */
export const mapActionComponent = (permission, session, component) => {
	if (session.permissions && session.permissions[permission]) {
		return component;
	}
};
