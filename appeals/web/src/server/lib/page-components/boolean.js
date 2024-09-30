import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';
import { mapActionComponent } from '#lib/mappers/component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';

/**
 *
 * @param {Object} options
 * @param {string} options.id
 * @param {string} options.text
 * @param {boolean|null} [options.value]
 * @param {string} [options.defaultText]
 * @param {string} options.link
 * @param {boolean} [options.addCyAttribute]
 * @param {import("express-session").Session & Partial<import("express-session").SessionData>} options.session
 * @returns {Instructions}
 */
export function booleanDisplayField({
	id,
	text,
	value,
	defaultText,
	link,
	addCyAttribute,
	session
}) {
	return {
		id,
		display: {
			summaryListItem: {
				key: {
					text
				},
				value: {
					text: convertFromBooleanToYesNo(value, defaultText)
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							visuallyHiddenText: text,
							href: link,
							attributes: addCyAttribute && { 'data-cy': 'change-' + id }
						})
					]
				}
			}
		}
	};
}
