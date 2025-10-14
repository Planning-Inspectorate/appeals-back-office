// @ts-nocheck
import { mapCostsAppellantDecision } from '#lib/mappers/data/appeal/submappers/costs-appellant-decision.mapper.js';

describe('costs-appellant-decision.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			appealDetails: {
				appealId: 1,
				appealType: 'Planning appeal',
				appealReference: '12345678',
				costs: {
					appellantApplicationFolder: { documents: [{ id: 1 }] },
					appellantWithdrawalFolder: { documents: [] },
					appellantDecisionFolder: { documents: [] }
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
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({
				id: 'appellant-costs-decision',
				display: {
					summaryListItem: {
						actions: {
							items: [
								{
									attributes: { 'data-cy': 'issue-appellant-costs-decision' },
									href: '/test/issue-decision/issue-appellant-costs-decision-letter-upload?backUrl=%2Foriginal-url',
									text: 'Issue',
									visuallyHiddenText: 'Appellant costs decision'
								}
							]
						},
						classes: 'costs-appellant-decision',
						key: {
							text: 'Appellant costs decision'
						},
						value: {
							text: 'Not issued'
						}
					}
				}
			});
		});

		it('when the decision has been issued', () => {
			data.appealDetails.costs.appellantDecisionFolder.documents = [{ id: 3 }];
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({
				id: 'appellant-costs-decision',
				display: {
					summaryListItem: {
						actions: {
							items: [
								{
									attributes: { 'data-cy': 'view-appellant-costs-decision' },
									href: '/appeals-service/appeal-details/1/issue-decision/view-decision?backUrl=%2Foriginal-url',
									text: 'View',
									visuallyHiddenText: 'Appellant costs decision'
								}
							]
						},
						classes: 'costs-appellant-decision',
						key: {
							text: 'Appellant costs decision'
						},
						value: {
							text: 'Issued'
						}
					}
				}
			});
		});

		it('when the appeal is withdrawn', () => {
			data.appealDetails.completedStateList = [];
			data.appealDetails.appealStatus = 'withdrawn';
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({
				id: 'appellant-costs-decision',
				display: {
					summaryListItem: {
						actions: {
							items: [
								{
									attributes: { 'data-cy': 'issue-appellant-costs-decision' },
									href: '/test/issue-decision/issue-appellant-costs-decision-letter-upload?backUrl=%2Foriginal-url',
									text: 'Issue',
									visuallyHiddenText: 'Appellant costs decision'
								}
							]
						},
						classes: 'costs-appellant-decision',
						key: {
							text: 'Appellant costs decision'
						},
						value: {
							text: 'Not issued'
						}
					}
				}
			});
		});
	});

	describe('should return an empty display object', () => {
		it('when the appeal is a child linked appeal', () => {
			data.appealDetails.isChildAppeal = true;
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({ id: 'appellant-costs-decision', display: {} });
		});

		it('when the appeal has not yet moved to the issue decision stage and is not withdrawn', () => {
			data.appealDetails.completedStateList = ['ready_to_start', 'lpa_questionnaire'];
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({ id: 'appellant-costs-decision', display: {} });
		});

		it('when the appeal has less cost application documents than cost withdrawal documents', () => {
			data.appealDetails.costs.appellantWithdrawalFolder.documents = [{ id: 2 }];
			const result = mapCostsAppellantDecision(data);
			expect(result).toEqual({ id: 'appellant-costs-decision', display: {} });
		});
	});
});
