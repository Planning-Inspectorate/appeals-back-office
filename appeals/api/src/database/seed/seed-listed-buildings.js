import { Readable } from 'node:stream';
import { databaseConnector } from '../../server/utils/database-connector.js';

// json streaming
import { chain } from 'stream-chain';
import Parser from 'stream-json';
import Ignore from 'stream-json/filters/Ignore.js';
import Pick from 'stream-json/filters/Pick.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';

/**
 *
 * @param {string} url
 */
export const importListedBuildingsDataset = async (url) => {
	const existingListdBuildingsCount = await databaseConnector.listedBuilding.count();

	if (existingListdBuildingsCount > 0) {
		console.log('ListedBuilding table not empty. Please delete all records to refresh.');
	} else {
		console.log('Starting download of listed buildings dataset...\n\n');
		fetch(url).then(async (response) => {
			if (response.body) {
				const totalRecords = await importListedBuildings(Readable.from(response.body));
				console.log(`\n\nComplete! ${totalRecords} records imported.`);
			}
		});
	}
};

/**
 *
 * @param {Readable} fileStream
 * @returns
 */
const importListedBuildings = async (fileStream) => {
	const pipeline = chain([
		fileStream,
		Parser(),
		new Pick({ filter: 'entities' }),
		new Ignore({
			filter:
				/dataset|geometry|entry-date|end-date|entity|organisation-entity|point|prefix|typology|documentation-url|start-date/i
		}),
		new StreamArray()
	]);

	const batchSize = 50;
	let batch = [];
	let totalRecords = 0;

	for await (const { value } of pipeline) {
		const record = {
			reference: value.reference,
			name: value.name,
			grade: value['listed-building-grade']
		};

		batch.push(record);

		if (batch.length === batchSize) {
			await databaseConnector.listedBuilding.createMany({
				data: batch
			});

			totalRecords += batch.length;
			batch = [];
		}
	}

	return totalRecords;
};
