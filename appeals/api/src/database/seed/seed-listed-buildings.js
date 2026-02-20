import dotenv from 'dotenv';
dotenv.config();

import { Readable } from 'node:stream';
import { createPrismaClient } from '../create-client.js';

// json streaming
import { chain } from 'stream-chain';
import Parser from 'stream-json';
import Ignore from 'stream-json/filters/Ignore.js';
import Pick from 'stream-json/filters/Pick.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';

const testListedBuildings = [
	{
		name: '10 and 10A Special House',
		reference: '1010101',
		grade: 'II'
	},
	{
		name: 'AN IMPORTANT BUILDING',
		reference: '1010102',
		grade: 'II*'
	},
	{
		name: 'Exceptional Building',
		reference: '1010103',
		grade: 'I'
	}
];

/**
 *
 * @param {string} url
 * @param {boolean} useRealData
 */
export const importListedBuildingsDataset = async (url, useRealData = false) => {
	const databaseConnector = createPrismaClient();
	const existingListdBuildingsCount = await databaseConnector.listedBuilding.count();

	if (existingListdBuildingsCount > 0) {
		console.log('ListedBuilding table not empty. Please delete all records to refresh.');
	} else {
		if (!useRealData) {
			await databaseConnector.listedBuilding.createMany({
				data: testListedBuildings
			});

			console.log(`\n\nComplete! ${testListedBuildings.length} records imported.`);
			return;
		}

		console.log('Starting download of listed buildings dataset...\n\n');
		const response = await fetch(url);
		if (response.body) {
			const totalRecords = await importListedBuildings(
				Readable.from(response.body),
				databaseConnector
			);
			console.log(`\n\nComplete! ${totalRecords} records imported.`);
		}
	}
};

/**
 *
 *
 * @param {Readable} fileStream
 * @param {import('#db-client/client.ts').PrismaClient} databaseConnector
 * @returns
 */
const importListedBuildings = async (fileStream, databaseConnector) => {
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

	// Insert any remaining records
	if (batch.length > 0) {
		await databaseConnector.listedBuilding.createMany({
			data: batch
		});
		totalRecords += batch.length;
	}

	return totalRecords;
};
