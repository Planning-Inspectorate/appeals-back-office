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
			value: {
				html: !hasData ? 'No data' : appealGround.factsForGround
			},
			link: `${currentRoute}/ground/${groundRef}/facts-for-ground/${actionText.toLowerCase()}`,
			editable: hasData && userHasUpdateCase,
			classes: 'facts-for-ground',
			actionText,
			cypressDataName: id
		});
	});
};
