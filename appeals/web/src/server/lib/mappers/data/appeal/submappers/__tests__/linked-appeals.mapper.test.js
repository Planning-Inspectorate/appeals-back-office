// @ts-nocheck

import { mapLinkedAppeals } from '#lib/mappers/data/appeal/submappers/linked-appeals.mapper.js';

describe('linked-appeals.mapper', () => {
	let data;
	let expectedResult;

	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				appealId: 20
			},
			userHasUpdateCasePermission: true,
			session: { permissions: { setEvents: true, updateCase: true } }
		};
		expectedResult = {
			id: 'linked-appeals',
			display: {
				summaryListItem: {
					key: {
						text: 'Linked appeals'
					},
					value: {
						html: '<span>No linked appeals</span>'
					},
					actions: {
						items: []
					},
					classes: 'appeal-linked-appeals'
				}
			}
		};
	});

	it('displays no linked appeals if there are none', () => {
		const mappedData = mapLinkedAppeals(data);
		expect(mappedData).toEqual(expectedResult);
	});

	it('displays two child appeals if linked lead appeal', () => {
		expectedResult.display.summaryListItem.value.html = [
			'<ul class="govuk-list govuk-list--bullet">',
			'<li><a href="/appeals-service/appeal-details/23" class="govuk-link" data-cy="linked-appeal-6000023" aria-label="Appeal 6 0 0 0 0 2 3">6000023</a></li>',
			'<li><a href="/appeals-service/appeal-details/25" class="govuk-link" data-cy="linked-appeal-6000025" aria-label="Appeal 6 0 0 0 0 2 5">6000025</a></li>',
			'</ul>'
		].join('');
		expectedResult.display.summaryListItem.actions.items = [
			{
				attributes: {
					['data-cy']: 'manage-linked-appeals'
				},
				href: '/appeals-service/appeal-details/20/linked-appeals/manage',
				text: 'Manage',
				visuallyHiddenText: 'Linked appeals'
			}
		];
		data.appealDetails.linkedAppeals = [
			{ appealId: 23, appealReference: '6000023' },
			{ appealId: 25, appealReference: '6000025' }
		];
		const mappedData = mapLinkedAppeals(data);
		expect(mappedData).toEqual(expectedResult);
	});

	it('displays one lead appeal if linked child appeal', () => {
		expectedResult.display.summaryListItem.value.html =
			'<a href="/appeals-service/appeal-details/23" class="govuk-link" data-cy="linked-appeal-6000023" aria-label="Appeal 6 0 0 0 0 2 3">6000023</a> (lead)';
		data.appealDetails.linkedAppeals = [
			{ appealId: 23, appealReference: '6000023', isParentAppeal: true }
		];
		const mappedData = mapLinkedAppeals(data);
		expect(mappedData).toEqual(expectedResult);
	});
});
