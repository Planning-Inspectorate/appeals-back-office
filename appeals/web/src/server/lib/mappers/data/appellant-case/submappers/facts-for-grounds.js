import { textSummaryListItem } from '#lib/mappers/index.js';

/** @type {import('../mapper.js').SubMapperList} */
export const mapFactsForGrounds = ({ appellantCaseData, currentRoute, userHasUpdateCase }) => {
	// @ts-ignore
	const { appealGrounds } = appellantCaseData;

	if (!appealGrounds) {
		return [];
	}

	// @ts-ignore
	return appealGrounds.map((appealGround) => {
		const { groundRef } = appealGround.ground || {};
		const id = `facts-for-ground-${groundRef}`;
		const hasData = appealGround.factsForGround !== null;
		const actionText = appealGround.factsForGround?.length ? 'Change' : 'Add';

		return textSummaryListItem({
			id,
			text: `Facts for ground (${groundRef})`,
			value: !hasData ? 'No data' : appealGround.factsForGround,
			link: `${currentRoute}/facts-for-ground/${groundRef}/${actionText.toLowerCase()}`,
			editable: hasData && userHasUpdateCase,
			withShowMore: true,
			toggleTextCollapsed: 'Show more',
			toggleTextExpanded: 'Show less',
			classes: 'facts-for-ground',
			actionText,
			cypressDataName: id
		});
	});
};
