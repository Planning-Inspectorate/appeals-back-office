// @ts-nocheck
import { mapLpaQuestionnaireDueDate } from '#lib/mappers/data/appeal/submappers/lpa-questionnaire-due-date.mapper.js';
import {
	DOCUMENT_STATUS_RECEIVED,
	DOCUMENT_STATUS_NOT_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
describe('lpa-questionnaire-due-date.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				validAt: '2025-01-01',
				appealTimetable: { lpaQuestionnaireDueDate: '2025-01-10' }
			},
			userHasUpdateCasePermission: true
		};
	});

	it('should not display LPA Questionnaire due date', () => {
		const mappedData = mapLpaQuestionnaireDueDate(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'lpa-questionnaire-due-date'
		});
	});

	it('should display LPA Questionnaire due date with Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.documentationSummary = {
			lpaQuestionnaire: {
				status: DOCUMENT_STATUS_NOT_RECEIVED
			}
		};
		const mappedData = mapLpaQuestionnaireDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: [
							{
								attributes: {
									'data-cy': 'change-lpa-questionnaire-due-date'
								},
								href: '/test/appeal-timetables/lpa-questionnaire',
								text: 'Change',
								visuallyHiddenText: 'LPA questionnaire due'
							}
						]
					},
					classes: 'appeal-lpa-questionnaire-due-date',
					key: {
						text: 'LPA questionnaire due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'lpa-questionnaire-due-date'
		});
	});

	it('should display LPA Questionnaire due date without Change action link', () => {
		data.appealDetails.startedAt = '2025-01-01';
		data.appealDetails.documentationSummary = {
			lpaQuestionnaire: {
				status: DOCUMENT_STATUS_RECEIVED
			}
		};
		const mappedData = mapLpaQuestionnaireDueDate(data);
		expect(mappedData).toEqual({
			display: {
				summaryListItem: {
					actions: {
						items: []
					},
					classes: 'appeal-lpa-questionnaire-due-date',
					key: {
						text: 'LPA questionnaire due'
					},
					value: {
						text: '10 January 2025'
					}
				}
			},
			id: 'lpa-questionnaire-due-date'
		});
	});
});
