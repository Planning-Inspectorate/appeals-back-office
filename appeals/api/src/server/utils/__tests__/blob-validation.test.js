import { jest } from '@jest/globals';
import { mapBlobPath } from '@pins/appeals/utils/document-blob-path.js';

//@ts-ignore
const getProperties = jest.fn().mockResolvedValue({ contentType: 'application/pdf' });
//@ts-ignore
const downloadToBuffer = jest.fn().mockResolvedValue(Buffer.from('%PDF-1.7'));
const getBlobClient = jest.fn().mockReturnValue({ getProperties, downloadToBuffer });

jest.unstable_unmockModule('#utils/blob-validation.js');
jest.unstable_mockModule('@pins/blob-storage-client', () => ({
	BlobStorageClient: {
		fromUrl: jest.fn().mockReturnValue({ getBlobClient })
	}
}));

const { validateBlobContents } = await import('#utils/blob-validation.js');

describe('validateBlobContents', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test.each(['123', 'APP/Q9999/D/21/351062'])(
		'accepts shared storage path for reference %s',
		async (reference) => {
			const path = mapBlobPath('document-guid', reference, 'document-guid.pdf', 3);

			await expect(validateBlobContents(reference, [path])).resolves.toBe(true);
			expect(getBlobClient).toHaveBeenCalledWith(expect.anything(), path);
		}
	);

	test('rejects storage path belonging to another appeal', async () => {
		const path = mapBlobPath('document-guid', 'APP/other', 'document-guid.pdf');

		await expect(validateBlobContents('APP/123', [path])).resolves.toBe(false);
		expect(getBlobClient).not.toHaveBeenCalled();
	});
});
