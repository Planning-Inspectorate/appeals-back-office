// @ts-nocheck
import { mapStartedAt } from '#lib/mappers/data/appeal/submappers/started-at.mapper.js';

describe('started-at.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				documentationSummary: { lpaQuestionnaire: { status: 'not_received' } }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display', () => {
		delete data.appealDetails.validAt;
		const mappedData = mapStartedAt(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'start-case-date'
		});
	});

	it('should contain Not started and a Start action link', () => {
		const mappedData = mapStartedAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'start-start-case-date'
								},
								href: '/test/start-case/add?backUrl=/test',
								text: 'Start',
								visuallyHiddenText: 'Start date'
							}
						]
					},
					classes: 'appeal-start-date',
					key: {
						text: 'Start date'
					},
					value: {
						text: 'Not started'
					}
				}
			},
			id: 'start-case-date'
		});
	});

	it('should contain a start date and a Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapStartedAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-start-case-date'
								},
								href: '/test/start-case/change',
								text: 'Change',
								visuallyHiddenText: 'Start date'
							}
						]
					},
					classes: 'appeal-start-date',
					key: {
						text: 'Start date'
					},
					value: {
						text: '1 January 2025'
					}
				}
			},
			id: 'start-case-date'
		});
	});

	it('should contain a start date and no action link text', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.documentationSummary.lpaQuestionnaire.status = 'complete';
		const mappedData = mapStartedAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': '-start-case-date'
								},
								href: '/test/start-case/change',
								text: '',
								visuallyHiddenText: 'Start date'
							}
						]
					},
					classes: 'appeal-start-date',
					key: {
						text: 'Start date'
					},
					value: {
						text: '1 January 2025'
					}
				}
			},
			id: 'start-case-date'
		});
	});
});
