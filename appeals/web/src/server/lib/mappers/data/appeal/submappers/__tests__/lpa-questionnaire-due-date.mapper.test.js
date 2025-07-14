// @ts-nocheck
import { mapLpaQuestionnaireDueDate } from '#lib/mappers/data/appeal/submappers/lpa-questionnaire-due-date.mapper.js';
import {
	DOCUMENT_STATUS_RECEIVED,
	DOCUMENT_STATUS_NOT_RECEIVED
	// @ts-ignore
} from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common';

describe.each([APPEAL_TYPE.S78, APPEAL_TYPE.PLANNED_LISTED_BUILDING])(
	'lpa-questionnaire-due-date.mapper - S78 and S20',
	(appealType) => {
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

		it('should display LPA Questionnaire due date with new Change action link', () => {
			data.appealDetails.startedAt = '2025-01-01';
			data.appealDetails.procedureType = 'written';
			data.appealDetails.appealType = appealType;
			data.appealDetails.documentationSummary = {
				lpaQuestionnaire: {
					status: DOCUMENT_STATUS_NOT_RECEIVED
				}
			};
			data.appealDetails.appealStatus = APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE;

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
									href: '/test/timetable/edit',
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
	}
);
