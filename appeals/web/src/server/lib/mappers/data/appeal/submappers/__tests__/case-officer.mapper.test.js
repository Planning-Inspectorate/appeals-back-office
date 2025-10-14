// @ts-nocheck
import { mapCaseOfficer } from '#lib/mappers/data/appeal/submappers/case-officer.mapper.js';

describe('case-officer.mapper', () => {
	let data;
	let expectedSummaryListItem;

	beforeEach(() => {
		data = {
			appealDetails: {},
			currentRoute: '/test',
			skipAssignedUsersData: false,
			caseOfficerUser: { name: 'Bloggs, Fred', email: 'fred.bloggs@test.com' },
			userHasUpdateCasePermission: true
		};

		expectedSummaryListItem = {
			classes: 'appeal-case-officer',
			key: {
				text: 'Case officer'
			},
			value: {
				html: '<ul class="govuk-list"><li> Fred Bloggs</li><li>fred.bloggs@test.com</li></ul>'
			},
			actions: {
				items: [
					{
						attributes: {
							'data-cy': 'change-case-officer'
						},
						href: '/test/assign-case-officer/search-case-officer',
						text: 'Change',
						visuallyHiddenText: 'Case officer'
					}
				]
			}
		};
	});

	describe('should display case officer row', () => {
		it('with a change link', () => {
			const mappedData = mapCaseOfficer(data);
			expect(mappedData).toEqual({
				display: {
					summaryListItem: expectedSummaryListItem
				},
				id: 'case-officer'
			});
		});

		describe('without a change link', () => {
			let expectedMappedData;

			beforeEach(() => {
				const { classes, key, value } = expectedSummaryListItem;
				expectedMappedData = {
					display: {
						summaryListItem: { key, value, classes, actions: { items: [] } }
					},
					id: 'case-officer'
				};
			});

			it('when the user does not have update case permission', () => {
				const mappedData = mapCaseOfficer({ ...data, userHasUpdateCasePermission: false });
				expect(mappedData).toEqual(expectedMappedData);
			});

			it('when the appeal is a linked child appeal', () => {
				const mappedData = mapCaseOfficer({ ...data, appealDetails: { isChildAppeal: true } });
				expect(mappedData).toEqual(expectedMappedData);
			});
		});
	});
});
