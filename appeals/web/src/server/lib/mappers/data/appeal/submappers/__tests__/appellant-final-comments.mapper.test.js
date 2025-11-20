// @ts-nocheck
import { mapAppellantFinalComments } from '#lib/mappers/data/appeal/submappers/appellant-final-comments.mapper.js';

describe('appellant-final-comments.mapper', () => {
	const mockRequest = {
		originalUrl: '/appeals-service/appeal-details/8526',
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
				appellantFinalComments: {
					status: 'not_received',
					receivedAt: null,
					representationStatus: null
				}
			}
		},
		request: mockRequest
	};

	it('should display appellant final comments row if the procedure type is written', () => {
		data.appealDetails.procedureType = 'Written';
		const result = mapAppellantFinalComments(data);
		const expectedHref =
			'/test/final-comments/appellant/add-document?backUrl=%2Fappeals-service%2Fappeal-details%2F8526';
		const expectedText = 'Add<span class="govuk-visually-hidden"> Appellant final comments</span>';
		const receivedHtml = result.display.tableItem[3].html;
		expect(result).toEqual(
			expect.objectContaining({
				display: {
					tableItem: [
						{ text: 'Appellant final comments' },
						{ text: 'Awaiting final comments' },
						{ text: 'Due by ' },
						expect.objectContaining({
							classes: 'govuk-!-text-align-right',
							html: expect.stringContaining(`href="${expectedHref}"`)
						})
					]
				},
				id: 'appellant-final-comments'
			})
		);

		expect(receivedHtml).toContain(expectedText);
	});

	it('should not display appellant final comments row if the procedure type is hearing', () => {
		data.appealDetails.procedureType = 'Hearing';
		const result = mapAppellantFinalComments(data);
		console.log(result);
		expect(result).toEqual({ id: 'start-case-date', display: {} });
	});
});
