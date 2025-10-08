// @ts-nocheck
import { getRepresentationAttachments } from '#appeals/appeal-documents/appeal.documents.service.js';
import { jest } from '@jest/globals';
import { getRepresentationAttachmentFullNames } from '../file-downloader.component.js';

describe('getRepresentationAttachments', () => {
	let mockApiClient;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiClient = {
			get: jest.fn()
		};
	});

	it('should successfully fetch representation attachments', async () => {
		const mockResponse = {
			itemCount: 2,
			items: [
				{ id: 1, representationType: 'comment' },
				{ id: 2, representationType: 'appellant_statement' }
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockResponse)
		});

		const result = await getRepresentationAttachments(mockApiClient, '12345');

		expect(mockApiClient.get).toHaveBeenCalledWith('appeals/12345/reps');
		expect(result).toEqual(mockResponse);
	});
});

describe('getRepresentationAttachmentFullNames', () => {
	let mockApiClient;

	beforeEach(() => {
		jest.clearAllMocks();
		mockApiClient = {
			get: jest.fn()
		};
	});

	it('should process valid comment representations with attachments', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 359,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'dd2c2fdf-126a-4059-be21-ba2e90024965',
									name: 'lorem.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'dd2c2fdf-126a-4059-be21-ba2e90024965':
				'Representations/Interested party comments/Accepted/Comment 1/lorem.pdf'
		});
	});

	it('should skip invalid comment representations', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 355,
					status: 'invalid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-1',
									name: 'test.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({});
	});

	it('should handle multiple valid comments with unique folder names', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 359,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-1',
									name: 'file1.pdf'
								}
							}
						}
					]
				},
				{
					id: 358,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-2',
									name: 'file2.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'guid-1': 'Representations/Interested party comments/Accepted/Comment 1/file1.pdf',
			'guid-2': 'Representations/Interested party comments/Accepted/Comment 2/file2.pdf'
		});
	});

	it('should handle awaiting_review status comments', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 362,
					status: 'awaiting_review',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: '600dddb1-2f93-4872-bac5-9885fdcf8532',
									name: 'image.png'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'600dddb1-2f93-4872-bac5-9885fdcf8532':
				'Representations/Interested party comments/Awaiting review/Comment 1/image.png'
		});
	});

	it('should handle non-comment representation types', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 137,
					status: 'awaiting_review',
					representationType: 'appellant_statement',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-statement',
									name: 'statement.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'guid-statement': 'Representations/Appellant statement/statement.pdf'
		});
	});

	it('should replace "Lpa" with "LPA" in representation type', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 140,
					status: 'valid',
					representationType: 'lpa_statement',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-lpa',
									name: 'lpa-doc.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'guid-lpa': 'Representations/LPA statement/lpa-doc.pdf'
		});
	});

	it('should handle representations with multiple attachments', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 359,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: {
									guid: 'guid-1',
									name: 'file1.pdf'
								}
							}
						},
						{
							documentVersion: {
								document: {
									guid: 'guid-2',
									name: 'file2.pdf'
								}
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'guid-1': 'Representations/Interested party comments/Accepted/Comment 1/file1.pdf',
			'guid-2': 'Representations/Interested party comments/Accepted/Comment 1/file2.pdf'
		});
	});

	it('should handle empty representations list', async () => {
		const mockRepresentations = {
			items: []
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({});
	});

	it('should handle representations with no attachments', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 137,
					status: 'awaiting_review',
					representationType: 'appellant_statement',
					attachments: []
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({});
	});

	it('should handle mixed statuses for comments correctly', async () => {
		const mockRepresentations = {
			items: [
				{
					id: 1,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: { guid: 'guid-valid-1', name: 'valid1.pdf' }
							}
						}
					]
				},
				{
					id: 2,
					status: 'invalid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: { guid: 'guid-invalid', name: 'invalid.pdf' }
							}
						}
					]
				},
				{
					id: 3,
					status: 'valid',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: { guid: 'guid-valid-2', name: 'valid2.pdf' }
							}
						}
					]
				},
				{
					id: 4,
					status: 'awaiting_review',
					representationType: 'comment',
					attachments: [
						{
							documentVersion: {
								document: { guid: 'guid-awaiting', name: 'awaiting.pdf' }
							}
						}
					]
				}
			]
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({
			'guid-valid-1': 'Representations/Interested party comments/Accepted/Comment 1/valid1.pdf',
			'guid-valid-2': 'Representations/Interested party comments/Accepted/Comment 2/valid2.pdf',
			'guid-awaiting':
				'Representations/Interested party comments/Awaiting review/Comment 1/awaiting.pdf'
		});
		expect(result['guid-invalid']).toBeUndefined();
	});

	it('should handle undefined or null items gracefully', async () => {
		const mockRepresentations = {
			items: undefined
		};

		mockApiClient.get.mockReturnValue({
			json: jest.fn().mockResolvedValue(mockRepresentations)
		});

		const result = await getRepresentationAttachmentFullNames(mockApiClient, '12345');

		expect(result).toEqual({});
	});
});
