// @ts-nocheck
import { mapInquiryEventDocuments } from '#lib/mappers/data/appeal/submappers/inquiry-event-documents.mapper.js';

describe('inquiry-event-documents.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				inquiryEventDocuments: {
					folderId: 10,
					documents: []
				}
			}
		};
	});

	it('should show no documents and Add action when the folder is empty', () => {
		const mappedData = mapInquiryEventDocuments(data);

		expect(mappedData).toEqual({
			id: 'inquiry-event-documents',
			display: {
				tableItem: [
					{
						text: 'Inquiry event documents'
					},
					{
						text: 'No documents'
					},
					{
						text: 'Not applicable'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-inquiry-event-documents" href="/test/inquiry-event-documents/upload-documents/10">Add<span class="govuk-visually-hidden"> Inquiry event documents</span></a></li></ul>'
					}
				]
			}
		});
	});

	it('should show one document and Manage plus Add actions when the folder has one document', () => {
		data.appealDetails.inquiryEventDocuments.documents = [
			{
				latestDocumentVersion: { isDeleted: false }
			}
		];
		data.appealDetails.inquiryEventDocuments.documentCount = 1;

		const mappedData = mapInquiryEventDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('1 document');
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/inquiry-event-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/inquiry-event-documents/upload-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'Manage<span class="govuk-visually-hidden"> Inquiry event documents</span>'
		);
	});

	it('should show plural documents when the folder has multiple documents', () => {
		data.appealDetails.inquiryEventDocuments.documentCount = 2;

		const mappedData = mapInquiryEventDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('2 documents');
	});
});
