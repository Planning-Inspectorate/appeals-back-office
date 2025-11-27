import { textSummaryListItem } from '#lib/mappers/components/index.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

/**
 *
 * @typedef {import("@pins/appeals.api/src/server/endpoints/appeals.js").ServiceUserResponse} ServiceUser
 */

/**
 *
 * @param {ServiceUser[]} otherAppellants
 * @returns {string}
 */
const formatOtherAppellantsAsHtmlList = (otherAppellants) => {
	return otherAppellants.length === 1
		? formatServiceUserAsHtmlList(otherAppellants[0])
		: `<ul class="govuk-list govuk-list--bullet">
	${otherAppellants
		.map((otherAppellant) => '<li>' + formatServiceUserAsHtmlList(otherAppellant) + '</li>')
		.join('')}</ul>`;
};

/** @type {import('../mapper.js').SubMapper} */
export const mapOtherAppellants = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	// @ts-ignore
	const { otherAppellants } = appellantCaseData;
	const hasData = !!otherAppellants;
	const actionText = otherAppellants?.length ? 'Change' : 'Add';

	return textSummaryListItem({
		id: 'appellant',
		text: 'Other appellants',
		value: {
			html: !hasData
				? 'No data'
				: otherAppellants?.length
				? // @ts-ignore
				  formatOtherAppellantsAsHtmlList(otherAppellants)
				: ''
		},
		link: `${currentRoute}/other-appellants/${actionText.toLowerCase()}`,
		editable: hasData && userHasUpdateCase,
		classes: 'appeal-other-appellants',
		actionText,
		cypressDataName: 'other-appellants'
	});
};
