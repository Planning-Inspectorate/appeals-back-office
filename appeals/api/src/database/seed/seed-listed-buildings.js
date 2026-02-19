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

/**
 *
 * @param {string} url
 */
export const importListedBuildingsDataset = async (url) => {
	const databaseConnector = createPrismaClient();

	console.log('Starting download of listed buildings dataset...\n\n');
	const response = await fetch(url);
	if (response.body) {
		const result = await importListedBuildings(Readable.from(response.body), databaseConnector);
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

	/**
	 * @param {{ reference: string, name: string, grade: string }[]} records
	 */
	const processBatch = async (records) => {
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

	for await (const { value } of pipeline) {
		const record = {
			reference: value.reference,
			name: value.name,
			grade: value['listed-building-grade']
		};

		batch.push(record);

		if (batch.length === batchSize) {
			const batchResult = await processBatch(batch);
			processed += batch.length;
			inserted += batchResult.inserted;
			updated += batchResult.updated;
			batch = [];
		}
	}

	if (batch.length > 0) {
		const batchResult = await processBatch(batch);
		processed += batch.length;
		inserted += batchResult.inserted;
		updated += batchResult.updated;
	}

	return { processed, inserted, updated };
};
