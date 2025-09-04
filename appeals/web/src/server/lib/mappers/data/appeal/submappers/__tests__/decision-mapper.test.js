// @ts-nocheck
import { mapDecision } from '#lib/mappers/data/appeal/submappers/decision.mapper.js';

const expectedViewDecisionRow = (params) => ({
	id: 'decision',
	display: {
		summaryListItem: {
			actions: {
				items: [
					{
						attributes: {
							'data-cy': 'view-decision'
						},
						href: `/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=${encodeURIComponent(
							params.request.originalUrl
						)}`,
						text: 'View',
						visuallyHiddenText: 'Decision'
					}
				]
			},
			classes: 'appeal-decision',
			key: {
				text: 'Decision'
			},
			value: {
				text: 'Split decision'
			}
		}
	}
});

const expectedIssueDecisionRow = (params) => ({
	id: 'decision',
	display: {
		summaryListItem: {
			actions: {
				items: [
					{
						attributes: {
							'data-cy': 'issue-decision'
						},
						href: `/appeals-service/appeal-details/1/issue-decision/decision?backUrl=${encodeURIComponent(
							params.request.originalUrl
						)}`,
						text: 'Issue',
						visuallyHiddenText: 'Decision'
					}
				]
			},
			classes: 'appeal-decision',
			key: {
				text: 'Decision'
			},
			value: {
				text: 'Not issued'
			}
		}
	}
});

const expectedEmptyDecisionRow = {
	id: 'decision',
	display: {}
};

const setCaseOutcome = (params) => {
	params.appealDetails.appealStatus = 'complete';
	params.completedStateList = ['awaiting_event', 'issue_determination'];
	params.appealDetails.decision = { outcome: 'Split decision' };
};

describe('decision-mapper', () => {
	let params;

	beforeEach(() => {
		params = {
			appealDetails: {
				appealId: 1,
				appealStatus: 'issue_determination',
				completedStateList: ['awaiting_event']
			},
			session: { permissions: { setCaseOutcome: true } },
			request: { originalUrl: '/original-url' }
		};
	});

	describe('for unlinked or lead linked appeal', () => {
		it('Should display decision row with issue decision link', () => {
			expect(mapDecision(params)).toEqual(expectedIssueDecisionRow(params));
		});

		it('Should display decision row with view decision link', () => {
			setCaseOutcome(params);
			expect(mapDecision(params)).toEqual(expectedViewDecisionRow(params));
		});
	});

	describe('for child linked appeal', () => {
		beforeEach(() => {
			params.appealDetails.isChildAppeal = true;
		});

		it('Should not display decision row with issue decision link', () => {
			expect(mapDecision(params)).toEqual(expectedEmptyDecisionRow);
		});

		it('Should display decision row with view decision link', () => {
			setCaseOutcome(params);
			expect(mapDecision(params)).toEqual(expectedViewDecisionRow(params));
		});
	});
});
