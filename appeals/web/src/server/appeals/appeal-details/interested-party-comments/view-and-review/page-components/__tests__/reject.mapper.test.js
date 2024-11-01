import { mapRejectionReasonPayload } from '../reject.mapper.js';

describe('mapRejectionReasonPayload', () => {
	it('should correctly map rejection reasons for the happy path', () => {
		const input = {
			rejectionReason: ['1', '4', '5', '7'],
			'rejectionReason-7': [
				'Illegible or Incomplete Documentation',
				'Previously Decided or Duplicate Appeal'
			]
		};

		const expectedOutput = [
			{ id: 1, text: [] },
			{ id: 4, text: [] },
			{ id: 5, text: [] },
			{
				id: 7,
				text: ['Illegible or Incomplete Documentation', 'Previously Decided or Duplicate Appeal']
			}
		];

		const result = mapRejectionReasonPayload(input);

		expect(result).toEqual(expectedOutput);
	});
	it('should handle single string rejectionReason', () => {
		const input = {
			rejectionReason: '1',
			'rejectionReason-1': 'Single reason'
		};
		const expectedOutput = [{ id: 1, text: ['Single reason'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('should handle empty strings and ignore reasons not in rejectionReason array', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-1': ['']
		};

		const expectedOutput = [{ id: 1, text: [] }];

		const result = mapRejectionReasonPayload(input);

		expect(result).toEqual(expectedOutput);
	});
	it('should handle duplicate IDs', () => {
		const input = {
			rejectionReason: ['1', '1'],
			'rejectionReason-1': ['Reason 1', 'Reason 2']
		};
		const expectedOutput = [{ id: 1, text: ['Reason 1', 'Reason 2'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});
	it('should include reasons even if ID is not in rejectionReason array', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-2': 'Unexpected reason'
		};
		const expectedOutput = [
			{ id: 1, text: [] },
			{ id: 2, text: ['Unexpected reason'] }
		];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});
	it('should trim whitespace from reasons', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-1': ['Illegible or Incomplete Documentation', '  ']
		};
		const expectedOutput = [{ id: 1, text: ['Illegible or Incomplete Documentation'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});
});
