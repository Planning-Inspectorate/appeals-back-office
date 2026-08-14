// @ts-nocheck
import { mapSupportingDocuments } from '#lib/mappers/data/appeal/submappers/supporting-documents.mapper.js';

describe('supporting-documents.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				supportingDocuments: {
					folderId: 10,
					documents: []
				}
			}
		};
	});

	it('should show no documents and Add action when the folder is empty', () => {
		const mappedData = mapSupportingDocuments(data);

		expect(mappedData).toEqual({
			id: 'supporting-documents',
			display: {
				tableItem: [
					{
						text: 'Supporting documents'
					},
					{
						text: 'No documents'
					},
					{
						text: 'Not applicable'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-supporting-documents" href="/test/supporting-documents/upload-documents/10">Add<span class="govuk-visually-hidden"> Supporting documents</span></a></li></ul>'
					}
				]
			}
		});
	});

	it('should show one document and Manage plus Add actions when the folder has one document', () => {
		data.appealDetails.supportingDocuments.documents = [
			{
				latestDocumentVersion: { isDeleted: false }
			}
		];

		const mappedData = mapSupportingDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('1 document');
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/supporting-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/supporting-documents/upload-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'Manage<span class="govuk-visually-hidden"> Supporting documents</span>'
		);
	});

	it('should show plural documents when the folder has multiple documents', () => {
		data.appealDetails.supportingDocuments.documents = [
			{
				latestDocumentVersion: { isDeleted: false }
			},
			{
				latestDocumentVersion: { isDeleted: false }
			}
		];

		const mappedData = mapSupportingDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('2 documents');
	});
});
