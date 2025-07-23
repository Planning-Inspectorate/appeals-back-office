import { button } from '#lib/mappers/components/instructions/button.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSetUpHearing = ({ currentRoute, request, userHasUpdateCasePermission }) => {
	const id = 'set-up-hearing';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return button({
		id,
		text: 'Set up hearing',
		buttonOptions: {
			href: addBackLinkQueryToUrl(request, `${currentRoute}/hearing/setup`)
		}
	});
};
