import { button } from '#lib/mappers/components/instructions/button.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSetUpInquiry = ({ currentRoute, request, userHasUpdateCasePermission }) => {
	const id = 'set-up-inquiry';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return button({
		id,
		text: 'Set up inquiry',
		buttonOptions: {
			href: addBackLinkQueryToUrl(request, `${currentRoute}/inquiry/setup`)
		}
	});
};
