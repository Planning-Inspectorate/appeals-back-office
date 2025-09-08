// @ts-nocheck
import { mapCostsLpaDecision } from '#lib/mappers/data/appeal/submappers/costs-lpa-decision.mapper.js';

describe('costs-lpa-decision.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				appealReference: '12345678',
				costs: {
					lpaApplicationFolder: { documents: [{ id: 1 }] },
					lpaWithdrawalFolder: { documents: [] },
					lpaDecisionFolder: { documents: [] }
				},
				completedStateList: ['ready_to_start', 'lpa_questionnaire', 'awaiting_event']
			},
			currentRoute: '/test',
			session: { permissions: { setCaseOutcome: true } },
			request: { originalUrl: '/original-url' }
		};
	});

	describe('should display a correctly populated display object', () => {
		it('when the decision has not been issued', () => {
			const result = mapCostsLpaDecision(data);
			expect(result).toEqual({
				id: 'lpa-costs-decision',
				display: {
					summaryListItem: {
						actions: {
							items: [
								{
									attributes: { 'data-cy': 'issue-lpa-costs-decision' },
									href: '/test/issue-decision/issue-lpa-costs-decision-letter-upload?backUrl=%2Foriginal-url',
									text: 'Issue',
									visuallyHiddenText: 'LPA costs decision'
								}
							]
						},
						classes: 'costs-lpa-decision',
						key: {
							text: 'LPA costs decision'
						},
						value: {
							text: 'Not issued'
						}
					}
				}
			});
		});

		it('when the decision has been issued', () => {
			data.appealDetails.costs.lpaDecisionFolder.documents = [{ id: 3 }];
			const result = mapCostsLpaDecision(data);
			expect(result).toEqual({
				id: 'lpa-costs-decision',
				display: {
					summaryListItem: {
						actions: {
							items: [
								{
									attributes: { 'data-cy': 'view-lpa-costs-decision' },
									href: '/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=%2Foriginal-url',
									text: 'View',
									visuallyHiddenText: 'LPA costs decision'
								}
							]
						},
						classes: 'costs-lpa-decision',
						key: {
							text: 'LPA costs decision'
						},
						value: {
							text: 'Issued'
						}
					}
				}
			});
		});
	});

	describe('should return an empty display object', () => {
		it('when the appeal is a child linked appeal', () => {
			data.appealDetails.isChildAppeal = true;
			const result = mapCostsLpaDecision(data);
			expect(result).toEqual({ id: 'lpa-costs-decision', display: {} });
		});

		it('when the appeal has not yet moved to the issue decision stage', () => {
			data.appealDetails.completedStateList = ['ready_to_start', 'lpa_questionnaire'];
			const result = mapCostsLpaDecision(data);
			expect(result).toEqual({ id: 'lpa-costs-decision', display: {} });
		});

		it('when the appeal has less cost application documents than cost withdrawal documents', () => {
			data.appealDetails.costs.lpaWithdrawalFolder.documents = [{ id: 2 }];
			const result = mapCostsLpaDecision(data);
			expect(result).toEqual({ id: 'lpa-costs-decision', display: {} });
		});
	});
});
