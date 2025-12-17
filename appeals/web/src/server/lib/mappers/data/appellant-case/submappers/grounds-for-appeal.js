import { textSummaryListItem } from '#lib/mappers/components/index.js';

/**
 *
 * @typedef {{groundRef: string}} Ground
 */

/**
 *
 * @param {Ground} ground
 * @returns {string}
 */
const formatGround = (ground) => {
	return ground.groundRef;
};

/**
 *
 * @param {Ground[]} grounds
 * @returns {string}
 */
const formatGroundsAsHtmlList = (grounds) => {
	return grounds.length === 1
		? formatGround(grounds[0])
		: `<ul class="govuk-list govuk-list--bullet">
	${grounds.map((ground) => '<li>' + formatGround(ground) + '</li>').join('')}</ul>`;
};

/** @type {import('../mapper.js').SubMapper} */
export const mapGroundsForAppeal = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	// @ts-ignore
	const { appealGrounds } = appellantCaseData;
	const hasData = !!appealGrounds;
	const actionText = appealGrounds?.length ? 'Change' : 'Add';

	return textSummaryListItem({
		id: 'grounds-for-appeal',
		text: 'Grounds of appeal',
		value: {
			html: !hasData
				? 'No data'
				: appealGrounds?.length
				? // @ts-ignore
				  formatGroundsAsHtmlList(appealGrounds.map((appealGround) => appealGround?.ground))
				: ''
		},
		link: `${currentRoute}/grounds-for-appeal/change`,
		editable: hasData && userHasUpdateCase,
		classes: 'grounds-for-appeal',
		actionText,
		cypressDataName: 'grounds-for-appeal'
	});
};
