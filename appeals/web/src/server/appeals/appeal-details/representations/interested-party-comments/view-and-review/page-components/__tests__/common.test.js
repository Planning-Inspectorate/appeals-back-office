import { generateCommentSummaryList } from '#appeals/appeal-details/representations/interested-party-comments/view-and-review/page-components/common.js';

describe('generateCommentSummaryList', () => {
	it('should return the default comment summary list', () => {
		const appealId = 5;
		const comment = {};
		const filter = {};
		// @ts-ignore
		const result = generateCommentSummaryList(appealId, comment, filter);
		expect(result.parameters.rows[0].value.text).toContain('Not provided');
		expect(result.parameters.rows[1].value.text).toContain('Not provided');
		expect(result).toMatchSnapshot();
	});

	it('should return the comment summary list including data', () => {
		const appealId = 5;
		const comment = {
			represented: {
				address: {
					addressLine1: '123 Random street',
					postCode: 'SW1A 1AA'
				},
				name: 'John Doe',
				email: 'john.dow@example.com'
			},
			siteVisitRequested: true,
			whenSubmitted: '2021-01-01T00:00:00.000Z',
			originalRepresentation: 'Test comment'
		};
		const filter = {};
		// @ts-ignore
		const result = generateCommentSummaryList(appealId, comment, filter);
		expect(result.parameters.rows[0].value.text).toContain('John Doe');
		expect(result.parameters.rows[1].value.text).toContain('john.dow@example.com');
		expect(result).toMatchSnapshot();
	});
});
