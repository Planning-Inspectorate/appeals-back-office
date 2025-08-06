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
					text: null
				},
				{
					classes: 'govuk-!-text-align-right',
					html: null
				}
			]
		}
	};

	it('should return correct table row when status is received', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus =
			'received';
		expected.display.tableItem[1].text = 'Received';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('Appellant proof of evidence');

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when status is not received', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus =
			'not_received';
		expected.display.tableItem[1].text = 'Awaiting';
		expected.display.tableItem[2].text = null;
		expected.display.tableItem[3].html = null;

		const result = mapAppellantProofOfEvidence(data);

		expect(result).toEqual(expected);
	});
});
