// @ts-nocheck
// Install mocks for third-party integration
import { jest } from '@jest/globals';
import './testing/app/mocks/msal.js';

jest.unstable_mockModule('@pins/blob-storage-client', () => ({
	BlobStorageClient: {
		fromUrlAndToken: jest.fn().mockReturnValue({
			getBlobProperties: jest.fn().mockResolvedValue({}),
			downloadStream: jest
				.fn()
				.mockResolvedValue({ readableStreamBody: true, blobDownloadStream: null })
		})
	}
}));
