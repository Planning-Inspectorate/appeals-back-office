import { mapBlobPath } from '#endpoints/documents/documents.mapper.js';
import { randomUUID } from 'node:crypto';
import { renameDuplicateDocuments } from '../integrations.utils.js';

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

	describe('mapping/processing-duplicates', () => {
		const tests = [
			{
				it: 'success small dupe set',
				input: [
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name.pdf' }
				],
				output: [
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name_1.pdf' },
					{ documentType: 'A', originalFilename: 'name_2.pdf' }
				]
			},
			{
				it: 'success big dupe set',
				input: [
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name_1.pdf' },
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'B', originalFilename: 'name.pdf' },
					{ documentType: 'B', originalFilename: 'name_1.pdf' },
					{ documentType: 'C', originalFilename: 'name_3.pdf' },
					{ documentType: 'AC', originalFilename: 'name_3.docx' },
					{ documentType: 'AC', originalFilename: 'name_3.docx' },
					{ documentType: 'C', originalFilename: 'name_3.pdf' }
				],
				output: [
					{ documentType: 'A', originalFilename: 'name.pdf' },
					{ documentType: 'A', originalFilename: 'name_1.pdf' },
					{ documentType: 'A', originalFilename: 'name_2.pdf' },
					{ documentType: 'A', originalFilename: 'name_3.pdf' },
					{ documentType: 'B', originalFilename: 'name.pdf' },
					{ documentType: 'B', originalFilename: 'name_1.pdf' },
					{ documentType: 'C', originalFilename: 'name_3.pdf' },
					{ documentType: 'AC', originalFilename: 'name_3.docx' },
					{ documentType: 'AC', originalFilename: 'name_3_1.docx' },
					{ documentType: 'C', originalFilename: 'name_3_1.pdf' }
				]
			}
		];

		for (const { it, input, output } of tests) {
			test(`${it}`, async () => {
				// @ts-ignore
				const processed = renameDuplicateDocuments(input);
				expect(processed).toEqual(output);
			});
		}
	});
});
