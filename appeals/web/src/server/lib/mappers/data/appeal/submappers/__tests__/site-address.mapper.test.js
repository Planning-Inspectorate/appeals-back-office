// @ts-nocheck
import { mapSiteAddress } from '#lib/mappers/data/appeal/submappers/site-address.mapper.js';

describe('site-address.mapper', () => {
	let data;
	let expectedSummaryListItem;

	beforeEach(() => {
		data = {
			appealDetails: {
				appealId: 123,
				appealSite: {
					addressId: 1,
					addressLine1: 'Copthalls',
					addressLine2: 'Clevedon Road',
					town: 'West Hill',
					postCode: 'BS48 1PN'
				},
				isChildAppeal: false
			},
			request: { originalUrl: 'test' },
			userHasUpdateCasePermission: true
		};

		expectedSummaryListItem = {
			classes: 'appeal-site-address',
			key: {
				text: 'Site address'
			},
			value: {
				text: 'Copthalls, Clevedon Road, West Hill, BS48 1PN'
			},
			actions: {
				items: [
					{
						attributes: {
							'data-cy': 'change-site-address'
						},
						href: '/appeals-service/appeal-details/123/site-address/change/1?backUrl=test',
						text: 'Change',
						visuallyHiddenText: 'Site address'
					}
				]
			}
		};
	});

	describe('should display site address row with a change link', () => {
		it('when the user has permission and the appeal is not a linked child appeal', () => {
			const mappedData = mapSiteAddress(data);
			expect(mappedData).toEqual({
				display: {
					summaryListItem: expectedSummaryListItem
				},
				id: 'site-address'
			});
		});
	});

	describe('should display site address row without a change link', () => {
		let expectedMappedData;

		beforeEach(() => {
			const { classes, key, value } = expectedSummaryListItem;
			expectedMappedData = {
				display: {
					summaryListItem: { key, value, classes, actions: { items: [] } }
				},
				id: 'site-address'
			};
		});

		it('when the user does not have update case permission', () => {
			const mappedData = mapSiteAddress({ ...data, userHasUpdateCasePermission: false });
			expect(mappedData).toEqual(expectedMappedData);
		});

		it('when the appeal is a linked child appeal', () => {
			const mappedData = mapSiteAddress({
				...data,
				appealDetails: { ...data.appealDetails, isChildAppeal: true }
			});
			expect(mappedData).toEqual(expectedMappedData);
		});
	});
});
