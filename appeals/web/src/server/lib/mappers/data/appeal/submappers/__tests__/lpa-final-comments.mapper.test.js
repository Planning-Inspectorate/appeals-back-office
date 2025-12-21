// @ts-nocheck
import { mapLPAFinalComments } from '#lib/mappers/data/appeal/submappers/lpa-final-comments.mapper.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import dateISOStringToDisplayDate from '@pins/appeals/utils/date-formatter.js';

describe('lpa-final-comments.mapper', () => {
	const mockRequest = {
		originalUrl: '/appeals-service/appeal-details/8526/lpa-final-comments',
		query: {},
		params: { appealId: 8526 }
	};
	const dateDue = new Date();
	dateDue.setDate(dateDue.getDate() + 7);
	const data = {
		currentRoute: '/test',
		appealDetails: {
			appealId: 8526,
			appealReference: '6008526',
			appealType: 'Planning appeal',
			createdAt: '2025-06-09T10:54:51.201Z',
			validAt: '2024-08-09T10:54:41.225Z',
			startedAt: '2025-06-08T23:00:00.000Z',
			procedureType: 'Written',
			appealTimetable: {
				finalCommentsDueDate: `${dateDue.getDay()} ${dateDue.getmon} ${dateDue.getFullYear()}`
			},
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: '',
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
					{
						text: `Due by ${dateISOStringToDisplayDate(
							data.appealDetails.appealTimetable.finalCommentsDueDate
						)}`
					},
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

	it('should display lpa final comments row correctly if representation not sent', () => {
		data.appealDetails.procedureType = 'Written';
		data.appealDetails.documentationSummary.lpaFinalComments.status = 'not_sent';
		const result = mapLPAFinalComments(data);
		const expectedText = '';
		expect(result).toEqual({
			display: {
				tableItem: [
					{ text: 'LPA final comments' },
					{ text: 'No final comments' },
					{ text: 'Not applicable' },
					{
						classes: 'govuk-!-text-align-right',
						html: ''
					}
				]
			},
			id: 'lpa-final-comments'
		});

		expect(result.display.tableItem[3].html).toContain(expectedText);
	});

	it('should display lpa final comments row correctly if representation is awaiting review', () => {
		data.appealDetails.procedureType = 'Written';
		data.appealDetails.documentationSummary.lpaFinalComments.status = 'received';
		data.appealDetails.documentationSummary.lpaFinalComments.representationStatus =
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW;
		const result = mapLPAFinalComments(data);
		const expectedText =
			'<a href="/test/final-comments/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F8526%2Flpa-final-comments" data-cy="review-lpa-final-comments" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA final comments</span></a>';
		expect(result).toEqual({
			display: {
				tableItem: [
					{ text: 'LPA final comments' },
					{ text: 'Ready to review' },
					{
						text: `Due by ${dateISOStringToDisplayDate(
							data.appealDetails.appealTimetable.finalCommentsDueDate
						)}`
					},
					{
						classes: 'govuk-!-text-align-right',
						html: '<a href="/test/final-comments/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F8526%2Flpa-final-comments" data-cy="review-lpa-final-comments" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA final comments</span></a>'
					}
				]
			},
			id: 'lpa-final-comments'
		});

		expect(result.display.tableItem[3].html).toContain(expectedText);
	});
});
