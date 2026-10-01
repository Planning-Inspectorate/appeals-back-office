// @ts-nocheck
import { permissionNames } from '#environment/permissions.js';
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
			},
			session: {
				permissions: {
					[permissionNames.updateCase]: true
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
		data.appealDetails.supportingDocuments.documentCount = 1;

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
		data.appealDetails.supportingDocuments.documentCount = 2;

		const mappedData = mapSupportingDocuments(data);

		expect(mappedData.display.tableItem[1].text).toEqual('2 documents');
	});

	it('should not show the Add action when the user does not have permission to update the case', () => {
		data.session.permissions[permissionNames.updateCase] = false;
		data.appealDetails.supportingDocuments.documentCount = 0;

		const mappedData = mapSupportingDocuments(data);

		expect(mappedData.display.tableItem[3].html).not.toContain(
			'/test/supporting-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).not.toContain(
			'/test/supporting-documents/upload-documents/10'
		);
	});

	it('should show the manage action when the user does not have permission to update the case but there are documents', () => {
		data.session.permissions[permissionNames.updateCase] = false;
		data.appealDetails.supportingDocuments.documentCount = 1;

		const mappedData = mapSupportingDocuments(data);

		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/supporting-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).not.toContain(
			'/test/supporting-documents/upload-documents/10'
		);
	});
});
