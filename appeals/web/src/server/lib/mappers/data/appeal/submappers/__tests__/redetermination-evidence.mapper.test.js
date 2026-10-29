// @ts-nocheck
import { permissionNames } from '#environment/permissions.js';
import { mapRedeterminationEvidence } from '../redetermination-evidence.mapper.js';

describe('redetermination-evidence.mapper', () => {
	let data;

	beforeEach(() => {
		data = {
			currentRoute: '/test',
			appealDetails: {
				redeterminationEvidence: {
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

	it('should return empty display when redeterminationEvidence is not present', () => {
		const mappedData = mapRedeterminationEvidence({ ...data, appealDetails: {} });
		expect(mappedData).toEqual({
			id: 'redetermination-evidence',
			display: {}
		});
	});

	it('should show no documents and Add action when the folder is empty', () => {
		const mappedData = mapRedeterminationEvidence(data);

		expect(mappedData).toEqual({
			id: 'redetermination-evidence',
			display: {
				tableItem: [
					{
						text: 'Redetermination documents'
					},
					{
						text: 'No documents'
					},
					{
						text: 'Not applicable'
					},
					{
						classes: 'govuk-!-text-align-right govuk-!-width-one-quarter',
						html: '<ul class="govuk-summary-list__actions-list"><li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-redetermination-evidence" href="/test/supporting-documents/upload-documents/10">Add<span class="govuk-visually-hidden"> Redetermination documents</span></a></li></ul>'
					}
				]
			}
		});
	});

	it('should show one document and Manage plus Add actions when the folder has one document', () => {
		data.appealDetails.redeterminationEvidence.documentCount = 1;

		const mappedData = mapRedeterminationEvidence(data);

		expect(mappedData.display.tableItem[1].text).toEqual('1 document');
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/supporting-documents/manage-documents/10'
		);
		expect(mappedData.display.tableItem[3].html).toContain(
			'/test/supporting-documents/upload-documents/10'
		);
	});

	it('should show multiple documents count when the folder has more than one document', () => {
		data.appealDetails.redeterminationEvidence.documentCount = 3;

		const mappedData = mapRedeterminationEvidence(data);

		expect(mappedData.display.tableItem[1].text).toEqual('3 documents');
	});
});
