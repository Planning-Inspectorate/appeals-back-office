// @ts-nocheck
import { mapEnvironmentalAssessment } from '#lib/mappers/data/appeal/submappers/environmental-assessment.mapper.js';

describe('environmental-assessment.mapper', () => {
	let data;
	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				environmentalAssessment: { folderId: '10', documents: [] },
				eiaScreeningRequired: true
			}
		};
	});

	it('should not contain tableItem', () => {
		data.appealDetails.eiaScreeningRequired = false;
		const mappedData = mapEnvironmentalAssessment(data);
		expect(mappedData).toEqual({
			display: {},
			id: 'environmental-assessment'
		});
	});

	it('should contain tableItem with no documents', () => {
		const mappedData = mapEnvironmentalAssessment(data);
		expect(mappedData).toEqual({
			display: {
				tableItem: [
					{
						text: 'Environmental services team review'
					},
					{
						text: 'No documents'
					},
					{
						text: 'Not applicable'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-environmental-assessment" href="/test/environmental-assessment/upload-documents/10">Add<span class="govuk-visually-hidden"> Environmental services team review</span></a></li></ul>'
					}
				]
			},
			id: 'environmental-assessment'
		});
	});

	it('should contain tableItem with one documents', () => {
		data.appealDetails.environmentalAssessment.documents = [
			{
				latestDocumentVersion: { dateReceived: new Date('2025-02-01') }
			}
		];
		const mappedData = mapEnvironmentalAssessment(data);
		expect(mappedData).toEqual({
			display: {
				tableItem: [
					{
						text: 'Environmental services team review'
					},
					{
						text: '1 document'
					},
					{
						text: '1 February 2025'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="/test/environmental-assessment/manage-documents/10">Manage<span class="govuk-visually-hidden"> Environmental services team review</span></a></li><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-environmental-assessment" href="/test/environmental-assessment/upload-documents/10">Add<span class="govuk-visually-hidden"> Environmental services team review</span></a></li></ul>'
					}
				]
			},
			id: 'environmental-assessment'
		});
	});

	it('should contain tableItem with three documents', () => {
		data.appealDetails.environmentalAssessment.documents = [
			{
				latestDocumentVersion: { dateReceived: new Date('2025-02-01') }
			},
			{
				latestDocumentVersion: { dateReceived: new Date('2025-01-01') }
			},
			{
				latestDocumentVersion: { dateReceived: new Date('2025-03-01') }
			}
		];
		const mappedData = mapEnvironmentalAssessment(data);
		expect(mappedData).toEqual({
			display: {
				tableItem: [
					{
						text: 'Environmental services team review'
					},
					{
						text: '3 documents'
					},
					{
						text: '1 March 2025'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="/test/environmental-assessment/manage-documents/10">Manage<span class="govuk-visually-hidden"> Environmental services team review</span></a></li><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-environmental-assessment" href="/test/environmental-assessment/upload-documents/10">Add<span class="govuk-visually-hidden"> Environmental services team review</span></a></li></ul>'
					}
				]
			},
			id: 'environmental-assessment'
		});
	});
});
