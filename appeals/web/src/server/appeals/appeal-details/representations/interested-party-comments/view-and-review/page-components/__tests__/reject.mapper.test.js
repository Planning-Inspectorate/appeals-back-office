import { mapRejectionReasonPayload } from '#appeals/appeal-details/representations/representations.mapper.js';

describe('mapRejectionReasonPayload', () => {
	it('maps rejection reasons with empty texts correctly', () => {
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

		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('handles a single string rejectionReason with associated text', () => {
		const input = {
			rejectionReason: '1',
			'rejectionReason-1': 'Single reason'
		};
		const expectedOutput = [{ id: 1, text: ['Single reason'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('ignores empty strings in rejectionReason texts', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-1': ['']
		};
		const expectedOutput = [{ id: 1, text: [] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('handles duplicate IDs and consolidates text', () => {
		const input = {
			rejectionReason: ['1', '1'],
			'rejectionReason-1': ['Reason 1', 'Reason 2']
		};
		const expectedOutput = [{ id: 1, text: ['Reason 1', 'Reason 2'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('includes reasons with text even if ID is not in rejectionReason', () => {
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

	it('trims whitespace from rejection reason texts', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-1': ['Illegible or Incomplete Documentation', '  ']
		};
		const expectedOutput = [{ id: 1, text: ['Illegible or Incomplete Documentation'] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('filters out unwanted IDs with empty texts', () => {
		const input = {
			rejectionReason: ['1'],
			'rejectionReason-2': '',
			'rejectionReason-3': '  '
		};
		const expectedOutput = [{ id: 1, text: [] }];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('handles missing rejectionReason gracefully', () => {
		const input = {
			'rejectionReason-1': 'Reason 1',
			'rejectionReason-2': 'Reason 2'
		};
		const expectedOutput = [
			{ id: 1, text: ['Reason 1'] },
			{ id: 2, text: ['Reason 2'] }
		];
		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});

	it('maps rejection reason "Other" with proper text', () => {
		const input = {
			rejectionReason: ['1', '24'],
			'rejectionReason-24': 'This is the other reason'
		};

		const expectedOutput = [
			{ id: 1, text: [] },
			{ id: 24, text: ['This is the other reason'] }
		];

		expect(mapRejectionReasonPayload(input)).toEqual(expectedOutput);
	});
});
