// @ts-nocheck
import { mapRule6PartyProofs } from '../rule-6-party-proofs.mapper.js';

describe('mapRule6PartyProofs', () => {
	const buildData = ({ rule6PartyProofs = {}, proofOfEvidenceAndWitnessesDueDate } = {}) => ({
		appealDetails: {
			appealId: 8526,
			appealReference: '6008526',
			procedureType: 'Inquiry',
			appealType: 'Planning appeal',
			appealTimetable: { proofOfEvidenceAndWitnessesDueDate },
			appealRule6Parties: [
				{ id: 1, serviceUserId: 101, serviceUser: { organisationName: 'Party One' } },
				{ id: 2, serviceUserId: 102, serviceUser: { organisationName: 'Party Two' } }
			],
			documentationSummary: { rule6PartyProofs }
		},
		currentRoute: '/test',
		request: { originalUrl: '/test' }
	});

	it('should show the shared proof of evidence due date for each rule 6 party awaiting proof of evidence', () => {
		const result = mapRule6PartyProofs(
			buildData({
				proofOfEvidenceAndWitnessesDueDate: '2025-10-12T10:27:06.626Z',
				rule6PartyProofs: {
					101: { status: 'not_received', receivedAt: null, representationStatus: null }
				}
			})
		);

		expect(result.display.tableItems).toHaveLength(2);
		for (const row of result.display.tableItems) {
			expect(row[1].text).toBe('Awaiting proof of evidence and witness');
			expect(row[2].text).toBe('Due by 12 October 2025');
		}
	});

	it('should show the received date for a rule 6 party whose when proof of evidence received', () => {
		const result = mapRule6PartyProofs(
			buildData({
				proofOfEvidenceAndWitnessesDueDate: '2025-10-12T10:27:06.626Z',
				rule6PartyProofs: {
					101: {
						status: 'received',
						receivedAt: '2025-08-02T10:27:06.626Z',
						representationStatus: 'awaiting_review'
					},
					102: { status: 'not_received', receivedAt: null, representationStatus: null }
				}
			})
		);

		expect(result.display.tableItems[0][2].text).toBe('2 August 2025');
		expect(result.display.tableItems[1][2].text).toBe('Due by 12 October 2025');
	});
});
