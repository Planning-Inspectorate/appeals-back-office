// @ts-nocheck
import { mapLPAFinalComments } from '#lib/mappers/data/appeal/submappers/lpa-final-comments.mapper.js';

describe('lpa-final-comments.mapper', () => {
	const mockRequest = {
		originalUrl: '/appeals-service/appeal-details/8526/lpa-final-comments',
		query: {},
		params: { appealId: 8526 }
	};
	const data = {
		currentRoute: '/test',
		appealDetails: {
			appealId: 8526,
			appealReference: '6008526',
			appealType: 'Planning appeal',
			createdAt: '2025-06-09T10:54:51.201Z',
			validAt: '2024-08-09T10:54:41.225Z',
			startedAt: '2025-06-08T23:00:00.000Z',
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-06-09T10:54:51.201Z'
				},
				lpaFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null
				}
			}
		},
		request: mockRequest
	};

	it('should display lpa final comments row if the procedure type is written', () => {
		data.appealDetails.procedureType = 'Written';
		const result = mapLPAFinalComments(data);
		expect(result).toEqual({
			display: {
				tableItem: [
					{ text: 'LPA final comments' },
					{ text: 'Awaiting final comments' },
					{ text: 'Due by ' },
					{
						classes: 'govuk-!-text-align-right',
						html: ''
					}
				]
			},
			id: 'lpa-final-comments'
		});
	});

	it('should not display lpa final comments row if the procedure type is hearing', () => {
		data.appealDetails.procedureType = 'Hearing';
		const result = mapLPAFinalComments(data);
		expect(result).toEqual({ id: 'start-case-date', display: {} });
	});
});
