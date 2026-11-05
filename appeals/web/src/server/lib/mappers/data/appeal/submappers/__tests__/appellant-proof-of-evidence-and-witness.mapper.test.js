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

	it('should return correct table row when representation status is published', () => {
		data.appealDetails.documentationSummary.appellantProofOfEvidence.status = 'received';
		data.appealDetails.documentationSummary.appellantProofOfEvidence.representationStatus =
			'published';
		expected.display.tableItem[1].text = 'Shared';
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

	it('should show the proof of evidence due date when status is not received', () => {
		const result = mapAppellantProofOfEvidence({
			...data,
			appealDetails: {
				...data.appealDetails,
				appealTimetable: { proofOfEvidenceAndWitnessesDueDate: '2025-10-12T10:27:06.626Z' },
				documentationSummary: {
					appellantProofOfEvidence: {
						status: 'not_received',
						receivedAt: null,
						representationStatus: null
					}
				}
			}
		});

		expect(result.display.tableItem[1].text).toBe('Awaiting proof of evidence and witness');
		expect(result.display.tableItem[2].text).toBe('Due by 12 October 2025');
	});

	it('should show the received date when proof of evidence received', () => {
		const result = mapAppellantProofOfEvidence({
			...data,
			appealDetails: {
				...data.appealDetails,
				appealTimetable: { proofOfEvidenceAndWitnessesDueDate: '2025-10-12T10:27:06.626Z' },
				documentationSummary: {
					appellantProofOfEvidence: {
						status: 'received',
						receivedAt: '2025-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					}
				}
			}
		});

		expect(result.display.tableItem[2].text).toBe('2 August 2025');
	});
});
