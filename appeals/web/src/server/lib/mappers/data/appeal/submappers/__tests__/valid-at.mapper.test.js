// @ts-nocheck
import { mapValidAt } from '#lib/mappers/data/appeal/submappers/valid-at.mapper.js';

describe('valid-at.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				caseOfficer: 'case-officer'
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should contain not validated and no action link', () => {
		delete data.appealDetails.caseOfficer;
		const mappedData = mapValidAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': '-valid-date'
								},
								href: '/test/appellant-case',
								text: '',
								visuallyHiddenText: 'Valid date'
							}
						]
					},
					classes: 'appeal-valid-date',
					key: {
						text: 'Valid date'
					},
					value: {
						text: 'Not validated'
					}
				}
			},
			id: 'valid-date'
		});
	});

	it('should contain not validated and a Validate action link', () => {
		const mappedData = mapValidAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'validate-valid-date'
								},
								href: '/test/appellant-case',
								text: 'Validate',
								visuallyHiddenText: 'Valid date'
							}
						]
					},
					classes: 'appeal-valid-date',
					key: {
						text: 'Valid date'
					},
					value: {
						text: 'Not validated'
					}
				}
			},
			id: 'valid-date'
		});
	});

	it('should contain a valid date and a Change action link', () => {
		data.appealDetails.validAt = '2025-01-01';
		const mappedData = mapValidAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-valid-date'
								},
								href: '/test/appellant-case/valid/date',
								text: 'Change',
								visuallyHiddenText: 'Valid date'
							}
						]
					},
					classes: 'appeal-valid-date',
					key: {
						text: 'Valid date'
					},
					value: {
						text: '1 January 2025'
					}
				}
			},
			id: 'valid-date'
		});
	});

	it('should contain a valid date and no action link', () => {
		data.appealDetails.validAt = '2025-01-01';
		data.appealDetails.startedAt = '2025-01-01';
		const mappedData = mapValidAt(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': '-valid-date'
								},
								href: '/test/appellant-case/valid/date',
								text: '',
								visuallyHiddenText: 'Valid date'
							}
						]
					},
					classes: 'appeal-valid-date',
					key: {
						text: 'Valid date'
					},
					value: {
						text: '1 January 2025'
					}
				}
			},
			id: 'valid-date'
		});
	});
});
