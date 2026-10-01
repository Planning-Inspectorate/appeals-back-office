// @ts-nocheck
import { mapHearingDocuments } from '#lib/mappers/data/appeal/submappers/hearing-documents.mapper.js';

describe('hearing-documents.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				hearingDocuments: {
					folderId: 10,
					documents: []
				}
			}
		};
	});

	it('should show no documents and Add action when the folder is empty', () => {
		const mappedData = mapHearingDocuments(data);

		expect(mappedData).toEqual({
			id: 'hearing-documents',
			display: {
				tableItem: [
					{
						text: 'Hearing documents'
					},
					{
						text: 'No documents'
					},
					{
						text: 'Not applicable'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-hearing-documents" href="/test/hearing-documents/upload-documents/10">Add<span class="govuk-visually-hidden"> Hearing documents</span></a></li></ul>'
					}
				]
			}
		});
	});

	it('should show one document and Manage plus Add actions when the folder has one document', () => {
		data.appealDetails.hearingDocuments.documents = [
			{
				latestDocumentVersion: { isDeleted: false }
			}
		];
		data.appealDetails.hearingDocuments.documentCount = 1;

		const mappedData = mapHearingDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('1 document');
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/hearing-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/hearing-documents/upload-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'Manage<span class="govuk-visually-hidden"> Hearing documents</span>'
		);
	});

	it('should show plural documents when the folder has multiple documents', () => {
		data.appealDetails.hearingDocuments.documentCount = 2;

		const mappedData = mapHearingDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('2 documents');
	});
});
