// @ts-nocheck
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { mapLpaStatement } from '../lpa-statement.mapper.js';

describe('lpa-statement.mapper', () => {
	it('should map LPA statement correctly', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '2023-01-01',
						representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Received'
					},
					{
						text: '1 January 2023'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
	it('should map lpa statement correctly when there is no data', () => {
		let data = {
			appealDetails: {
				documentationSummary: {}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'No statement'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: ''
					}
				]
			}
		});
	});
	it('should map LPA statement correctly when no date available', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '',
						representationStatus: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Received'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
	it('should map LPA statement correctly when no status is valid', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '',
						representationStatus: APPEAL_REPRESENTATION_STATUS.VALID
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Accepted'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
	it('should map LPA statement correctly when no status is invalid', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '',
						representationStatus: APPEAL_REPRESENTATION_STATUS.INVALID
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Rejected'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
	it('should map LPA statement correctly when no status is published', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '',
						representationStatus: APPEAL_REPRESENTATION_STATUS.PUBLISHED
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Shared'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});

	it('should map LPA statement correctly when no status is incomplete', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: '',
						representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Incomplete'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
	it('should map LPA statement correctly when no date is a date type', () => {
		let data = {
			appealDetails: {
				documentationSummary: {
					lpaStatement: {
						status: 'received',
						receivedAt: new Date('2023-01-01'),
						representationStatus: APPEAL_REPRESENTATION_STATUS.INCOMPLETE
					}
				}
			},
			currentRoute: '/test'
		};
		const result = mapLpaStatement(data);
		expect(result).toEqual({
			id: 'lpa-statement',
			display: {
				tableItem: [
					{
						text: 'LPA statement'
					},
					{
						text: 'Incomplete'
					},
					{
						text: 'Not Applicable'
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>'
					}
				]
			}
		});
	});
});
