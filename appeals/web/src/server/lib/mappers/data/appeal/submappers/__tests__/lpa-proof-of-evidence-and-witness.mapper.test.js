// @ts-nocheck
import { mapLPAProofOfEvidence } from '../lpa-proof-of-evidence-and-witness.mapper.js';

describe('mapLPAProofOfEvidence', () => {
	const data = {
		appealDetails: {
			appealId: 8526,
			appealReference: '6008526',
			procedureType: 'Inquiry',
			appealType: 'Planning appeal',
			documentationSummary: {
				appellantCase: {
					status: 'Valid',
					dueDate: null,
					receivedAt: '2025-06-09T10:54:51.201Z'
				},
				lpaProofOfEvidence: {
					status: 'not_received',
					dueDate: '2025-10-13T10:27:06.626Z',
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
		id: 'lpa-proofs-evidence',
		display: {
			tableItem: [
				{
					text: 'LPA proof of evidence and witness'
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
		data.appealDetails.documentationSummary.lpaProofOfEvidence.status = 'received';
		expected.display.tableItem[1].text = 'Received';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('LPA proof of evidence');

		const result = mapLPAProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when representation status is valid', () => {
		data.appealDetails.documentationSummary.lpaProofOfEvidence.status = 'received';
		data.appealDetails.documentationSummary.lpaProofOfEvidence.representationStatus = 'valid';
		expected.display.tableItem[1].text = 'Completed';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('LPA proof of evidence');

		const result = mapLPAProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when representation status is incomplete', () => {
		data.appealDetails.documentationSummary.lpaProofOfEvidence.status = 'received';
		data.appealDetails.documentationSummary.lpaProofOfEvidence.representationStatus = 'incomplete';
		expected.display.tableItem[1].text = 'Incomplete';
		expected.display.tableItem[2].text = '2 August 2025';
		expected.display.tableItem[3].html = expect.stringContaining('LPA proof of evidence');

		const result = mapLPAProofOfEvidence(data);

		expect(result).toEqual(expected);
	});

	it('should return correct table row when status is not received', () => {
		data.appealDetails.documentationSummary.lpaProofOfEvidence.status = 'not_received';
		data.appealDetails.documentationSummary.lpaProofOfEvidence.representationStatus =
			'awaiting_review';
		expected.display.tableItem[1].text = 'Awaiting proof of evidence and witness';
		expected.display.tableItem[2].text = '';
		expected.display.tableItem[3].html =
			'<a href="/test/proof-of-evidence/lpa/add-representation?backUrl=%2Ftest" data-cy="add-lpa-proofs-evidence" class="govuk-link">Add<span class="govuk-visually-hidden"> LPA proof of evidence</span></a>';

		const result = mapLPAProofOfEvidence(data);

		expect(result).toEqual(expected);
	});
});
