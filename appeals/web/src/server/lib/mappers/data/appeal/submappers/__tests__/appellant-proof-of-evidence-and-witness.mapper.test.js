// @ts-nocheck
import { mapAppellantProofOfEvidence } from '../appellant-proof-of-evidence-and-witness.mapper.js';

describe('mapAppellantProofOfEvidence', () => {
	const data = {
		appealDetails: {
			appealId: 8526,
			procedureType: 'Inquiry',
			appealReference: '6008526',
			appealType: 'Planning appeal',
			documentationSummary: {
				appellantProofOfEvidence: {
					status: null,
					dueDate: '2025-10-12T10:27:06.626Z',
					receivedAt: '2025-08-02T10:27:06.626Z',
					representationStatus: 'awaiting_review'
				}
			}
		},
		currentRoute: '/test',
		request: {
			originalUrl: '/test'
		}
	};

	const expected = {
		id: 'appellant-proofs-evidence',
		display: {
			tableItem: [
				{
					text: 'Appellant proof of evidence and witness'
				},
				{
					text: null
				},
				{
					text: ''
				},
				{
					classes: 'govuk-!-text-align-right',
					html: ''
				}
			]
		}
	};

	it('should return correct table row when status is received', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.status = 'received';
		expected.display.tableItem[1].text = 'Received';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('Appellant proof of evidence');

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when representation status is valid', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.status = 'received';
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus = 'valid';
		expected.display.tableItem[1].text = 'Completed';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('Appellant proof of evidence');

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when representation status is incomplete', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.status = 'received';
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus =
			'incomplete';
		expected.display.tableItem[1].text = 'Incomplete';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('Appellant proof of evidence');

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when status is not received', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.status = 'not_received';
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus =
			'awaiting_review';
		expected.display.tableItem[1].text = 'Awaiting proof of evidence and witness';
		expected.display.tableItem[2].text = '';
		expected.display.tableItem[3].html =
			'<a href="/test/proof-of-evidence/appellant/add-representation?backUrl=%2Ftest" data-cy="add-appellant-proofs-evidence" class="govuk-link">Add<span class="govuk-visually-hidden"> Appellant proof of evidence</span></a>';

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});
});
