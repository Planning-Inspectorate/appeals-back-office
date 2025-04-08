import { button } from '#lib/mappers/components/instructions/button.js';

/** @type {import('../mapper.js').SubMapper} */
export const mapSetUpHearing = ({ currentRoute, userHasUpdateCasePermission }) => {
	const id = 'set-up-hearing';
	if (!userHasUpdateCasePermission) {
		return { id, display: {} };
	}
	return button({
		id,
		text: 'Set up hearing',
		buttonOptions: {
			href: `${currentRoute}/hearing/setup`
		}
	});
};
