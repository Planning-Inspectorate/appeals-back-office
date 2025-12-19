// @ts-nocheck
import { mapFactsForGrounds } from '../facts-for-grounds.js';

const expectedFactsForGroundRows = (params) =>
	params.appellantCaseData.appealGrounds.map((appealGround) => {
		const { factsForGround, ground } = appealGround;
		const { groundRef } = ground || {};
		return {
			id: `facts-for-ground-${groundRef}`,
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': `facts-for-ground-${groundRef}`
								},
								href: `${params.currentRoute}/facts-for-ground/${groundRef}/change`,
								text: factsForGround ? 'Change' : 'Add',
								visuallyHiddenText: `Facts for ground (${groundRef})`
							}
						]
					},
					classes: 'facts-for-ground',
					key: {
						text: `Facts for ground (${groundRef})`
					},
					value: {
						text: factsForGround || 'Not answered'
					}
				}
			}
		};
	});

describe('facts-for-ground-mapper', () => {
	let params;

	beforeEach(() => {
		params = {
			appellantCaseData: {
				appealId: 1,
				appealStatus: 'validation',
				appealGrounds: [
					{ ground: { groundRef: 'a' }, factsForGround: '' },
					{ ground: { groundRef: 'b' }, factsForGround: 'Some details' }
				]
			},
			userHasUpdateCase: true,
			currentRoute: '/original-url'
		};
	});

	describe('Facts for ground', () => {
		it('Should display 2 factsForGround rows', () => {
			expect(mapFactsForGrounds(params)).toEqual(expectedFactsForGroundRows(params));
		});
	});
});
