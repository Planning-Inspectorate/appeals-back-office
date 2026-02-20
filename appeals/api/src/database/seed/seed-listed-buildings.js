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

const LOCAL_LISTED_BUILDINGS = [
	{ reference: '1021469', name: 'FIVE LORDS FARMHOUSE', grade: 'II' },
	{ reference: '1021470', name: 'PENLEIGH MILL', grade: 'II' },
	{ reference: '1021472', name: 'PENLEIGH FARMHOUSE', grade: 'II' },
	{ reference: '1021473', name: 'CHURCH OF HOLY TRINITY', grade: 'II*' },
	{ reference: '1021499', name: 'THE GEORGE INN', grade: 'II' },
	{ reference: '1021500', name: 'GREATER LANE FARMHOUSE', grade: 'II' },
	{ reference: '1021501', name: 'THE OLD VICARAGE', grade: 'II' },
	{ reference: '1021502', name: 'BROOK HALL', grade: 'II' },
	{ reference: '1021775', name: 'WHITLEY HOUSE', grade: 'II' },
	{ reference: '1021807', name: 'THE MANOR HOUSE', grade: 'II' }
];

// Set to true if running in an Azure pipeline
const loadAllListedBuildings = process.env.TF_BUILD === 'True';

/**
 *
 * @param {string} url
 */
export const importListedBuildingsDataset = async (url) => {
	const databaseConnector = createPrismaClient();

	let result;

	if (loadAllListedBuildings) {
		console.log('Starting download of listed buildings dataset...\n\n');
		const response = await fetch(url);
		if (response.body) {
			result = await importListedBuildings(Readable.from(response.body), databaseConnector);
		}
	} else {
		console.log('Insert reduced listed buildings dataset (10 records)...\n\n');
		result = await seedListedBuildings(LOCAL_LISTED_BUILDINGS, databaseConnector);
	}

	if (result) {
		console.log('\n\nComplete!');
		console.log(`Total records processed: ${result.processed}`);
		console.log(`Total inserted: ${result.inserted}`);
		console.log(`Total updated: ${result.updated}`);
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
	let processed = 0;
	let inserted = 0;
	let updated = 0;

	for await (const { value } of pipeline) {
		const record = {
			reference: value.reference,
			name: value.name,
			grade: value['listed-building-grade']
		};

		if (record.grade && record.name) batch.push(record);

		if (batch.length === batchSize) {
			const batchResult = await processBatch(batch, databaseConnector);
			processed += batch.length;
			inserted += batchResult.inserted;
			updated += batchResult.updated;
			batch = [];
		}
	}

	if (batch.length > 0) {
		const batchResult = await processBatch(batch, databaseConnector);
		processed += batch.length;
		inserted += batchResult.inserted;
		updated += batchResult.updated;
	}

	return { processed, inserted, updated };
};

/**
 * @param {{ reference: string, name: string, grade: string }[]} listedBuildings
 * @param {import('#db-client/client.ts').PrismaClient} databaseConnector
 */
const seedListedBuildings = async (listedBuildings, databaseConnector) => {
	const batchResult = await processBatch(listedBuildings, databaseConnector);

	return {
		processed: listedBuildings.length,
		inserted: batchResult.inserted,
		updated: batchResult.updated
	};
};

/**
 * @param {{ reference: string, name: string, grade: string }[]} records
 * @param {import('#db-client/client.ts').PrismaClient} databaseConnector
 */
const processBatch = async (records, databaseConnector) => {
	if (records.length === 0) {
		return { inserted: 0, updated: 0 };
	}

	const references = records.map((record) => record.reference);
	const existingRecords = await databaseConnector.listedBuilding.findMany({
		where: { reference: { in: references } },
		select: { reference: true, name: true, grade: true }
	});
	const existingByReference = new Map(
		existingRecords.map((existingRecord) => [existingRecord.reference, existingRecord])
	);

	const toCreate = [];
	const toUpdate = [];

	for (const record of records) {
		const existingRecord = existingByReference.get(record.reference);

		if (!existingRecord) {
			toCreate.push(record);
			continue;
		}

		if (existingRecord.name !== record.name || existingRecord.grade !== record.grade) {
			toUpdate.push(record);
		}
	}

	if (toCreate.length > 0) {
		await databaseConnector.listedBuilding.createMany({
			data: toCreate
		});
	}

	if (toUpdate.length > 0) {
		await databaseConnector.$transaction(
			toUpdate.map((record) =>
				databaseConnector.listedBuilding.update({
					where: { reference: record.reference },
					data: {
						name: record.name,
						grade: record.grade
					}
				})
			)
		);
	}

	return { inserted: toCreate.length, updated: toUpdate.length };
};
