import { mapBlobPath } from '#endpoints/documents/documents.mapper.js';
import { randomUUID } from 'node:crypto';

describe('document import', () => {
	describe('mapping/encoding', () => {
		const tests = [
			{
				it: 'success strings with spaces',
				input: 'document name with space.pdf'
			},
			{
				it: 'success strings with encoding',
				input: 'space and enc Q%20-%20Press%20advert.pdf'
			},
			{
				it: 'success strings with uncommon chars',
				input: 'document name with numbers10 &chars `.pdf'
			}
		];

		const containerName = 'files';

		for (const { it, input } of tests) {
			test(`${it}`, async () => {
				const guid = randomUUID();
				const ref = randomUUID();
				const blobStoragePath = mapBlobPath(guid, ref, input);
				const destinationUrl = `https://test.com/${containerName}/${blobStoragePath}`;

				const destinationComponents = destinationUrl.split(`/${containerName}/`);
				if (destinationComponents.length !== 2) {
					throw new Error(`Destination URL format unexpected : ${destinationUrl}`);
				}
				const blobPath = destinationComponents[1];

				expect(blobStoragePath).toEqual(blobPath);
			});
		}
	});
});
