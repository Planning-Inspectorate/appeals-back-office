// @ts-nocheck
import { mapIpComments } from '#lib/mappers/data/appeal/submappers/ip-comments.mapper.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

describe('ip-comments.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			currentRoute: '/appeals-service/appeal-details/1',
			request: { originalUrl: '/appeals-service/appeal-details/1' },
			appealDetails: {
				appealId: 1,
				startedAt: '2025-01-01',
				appealStatus: 'statements',
				completedStateList: [],
				appealTimetable: {
					ipCommentsDueDate: '2025-01-10T23:59:59.000Z'
				},
				documentationSummary: {
					ipComments: {
						status: 'received',
						counts: {
							published: 0,
							awaiting_review: 0,
							valid: 0,
							invalid: 1
						},
						receivedAt: '2025-01-05T12:00:00.000Z'
					}
				}
			}
		};
	});

	it('should return "Awaiting start date" if appeal has not started', () => {
		data.appealDetails.startedAt = null;
		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('Awaiting start date');
		expect(result.display.tableItem[2].text).toBe('Not applicable');
	});

	it('should return "Ready to review" and "Review" action when awaiting review comments exist during statements', () => {
		data.appealDetails.documentationSummary.ipComments.counts.awaiting_review = 2;
		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('Ready to review');
		expect(result.display.tableItem[3].html).toContain('>Review<');
		expect(result.display.tableItem[3].html).toContain(
			'href="/appeals-service/appeal-details/1/interested-party-comments?'
		);
	});

	it('should return "1 interested party comment" and "View" action when 1 valid comment exists before statements complete', () => {
		data.appealDetails.documentationSummary.ipComments.counts.valid = 1;
		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('1 interested party comment');
		expect(result.display.tableItem[3].html).toContain('>View<');
		expect(result.display.tableItem[3].html).toContain(
			'href="/appeals-service/appeal-details/1/interested-party-comments?'
		);
	});

	it('should return "Shared" and "View" action when published comments exist', () => {
		data.appealDetails.documentationSummary.ipComments.counts.published = 3;
		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('Shared');
		expect(result.display.tableItem[3].html).toContain('>View<');
		expect(result.display.tableItem[3].html).toContain(
			'href="/appeals-service/appeal-details/1/interested-party-comments?'
		);
	});

	it('should show "No interested party comments" and "Add" action when statements completed (status not in PRE_STATEMENTS) and only rejected comments exist', () => {
		data.appealDetails.appealStatus = APPEAL_CASE_STATUS.FINAL_COMMENTS;
		data.appealDetails.documentationSummary.ipComments.counts = {
			published: 0,
			awaiting_review: 0,
			valid: 0,
			invalid: 1
		};

		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('No interested party comments');
		expect(result.display.tableItem[3].html).toContain('>Add<');
		expect(result.display.tableItem[3].html).toContain(
			'href="/appeals-service/appeal-details/1/interested-party-comments/add/ip-details?'
		);
		expect(result.display.tableItem[3].html).not.toContain('>View<');
	});

	it('should show "No interested party comments" and "Add" action when statements is in completedStateList and published count is 0', () => {
		data.appealDetails.appealStatus = APPEAL_CASE_STATUS.STATEMENTS;
		data.appealDetails.completedStateList = [APPEAL_CASE_STATUS.STATEMENTS];
		data.appealDetails.documentationSummary.ipComments.counts = {
			published: 0,
			awaiting_review: 0,
			valid: 0,
			invalid: 2
		};

		const result = mapIpComments(data);

		expect(result.display.tableItem[1].text).toBe('No interested party comments');
		expect(result.display.tableItem[3].html).toContain('>Add<');
		expect(result.display.tableItem[3].html).toContain(
			'href="/appeals-service/appeal-details/1/interested-party-comments/add/ip-details?'
		);
		expect(result.display.tableItem[3].html).not.toContain('>View<');
	});
});
