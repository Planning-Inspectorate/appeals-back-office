import { mapRepresentationEntity } from '#mappers/integration/map-representation-entity.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import { schemas, validateFromSchema } from '../integrations.validators.js';

/** @typedef {import('@planning-inspectorate/data-model').Schemas.AppealRepresentation} AppealRepresentation */

const mockRepresentation = {
	appeal: {
		id: 1,
		reference: '6000001'
	},
	id: 1,
	status: 'invalid',
	originalRepresentation: 'Original text of the representation',
	redactedRepresentation: 'Redacted text of the representation',
	dateCreated: new Date('2024-12-06T12:00:00Z'),
	notes: 'Some notes',
	attachments: [],
	representationType: 'comment',
	siteVisitRequested: true,
	source: 'citizen'
};

const reasons = [
	{
		id: 1,
		name: 'Contains links to web pages',
		hasText: false
	},
	{
		id: 2,
		name: 'Duplicated or repeated comment',
		hasText: false
	},
	{
		id: 3,
		name: 'Includes inflammatory content',
		hasText: false
	},
	{
		id: 4,
		name: 'No list of suggested conditions',
		hasText: false
	},
	{
		id: 5,
		name: 'Not relevant to this appeal',
		hasText: false
	},
	{
		id: 6,
		name: 'Received after deadline',
		hasText: false
	},
	{
		id: 7,
		name: 'other_reason',
		hasText: true
	}
];

describe('representation mapper', () => {
	describe('successfull representation mapping', () => {
		for (const status of Object.values(APPEAL_REPRESENTATION_STATUS)) {
			test(`Mapping correct status: ${status}`, async () => {
				// @ts-ignore
				const mapped = mapRepresentationEntity({ ...mockRepresentation, status });

				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
			});
		}
		for (const representationType of Object.values(APPEAL_REPRESENTATION_TYPE)) {
			test(`Mapping correct type: ${representationType}`, async () => {
				// @ts-ignore
				const mapped = mapRepresentationEntity({ ...mockRepresentation, representationType });
				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
			});
		}
		for (const reason of reasons) {
			test(`Mapping correct reason: ${reason.name}`, async () => {
				const mapped = mapRepresentationEntity({
					...mockRepresentation,
					// @ts-ignore
					representationRejectionReasonsSelected: [reason]
				});
				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
			});
		}
		for (const source of [
			{
				lpa: null,
				representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT
			},
			{
				lpa: null,
				representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT
			},
			{
				lpa: null,
				representationType: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE
			}
		]) {
			test(`Mapping citizen source: ${source}`, async () => {
				const data = { ...mockRepresentation, ...source };
				// @ts-ignore
				const mapped = mapRepresentationEntity(data);
				// @ts-ignore
				expect(mapped.source).toEqual('citizen');

				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
			});
		}
		for (const source of [
			{
				lpa: { lpaCode: 'XXXX' },
				representationType: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT
			},
			{
				lpa: { lpaCode: 'XXXX' },
				representationType: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT
			},
			{
				lpa: { lpaCode: 'XXXX' },
				representationType: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE
			}
		]) {
			test(`Mapping lpa source: ${source}`, async () => {
				const data = { ...mockRepresentation, ...source };
				// @ts-ignore
				const mapped = mapRepresentationEntity(data);
				// @ts-ignore
				expect(mapped.source).toEqual('lpa');

				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
			});
		}

		test('Mapping rejection reasons', async () => {
			const mapped = mapRepresentationEntity({
				...mockRepresentation,
				representationRejectionReasonsSelected: [
					{
						// @ts-ignore
						representationRejectionReason: {
							name: 'Contains links to web pages',
							hasText: false
						}
					},
					{
						// @ts-ignore
						representationRejectionReason: {
							name: 'other_reason',
							hasText: true
						},
						representationRejectionReasonText: [
							// @ts-ignore
							{ text: 'Custom rejection reason text' }
						]
					}
				]
			});

			expect(mapped?.invalidOrIncompleteDetails).toEqual(['Contains links to web pages']);
			expect(mapped?.otherInvalidOrIncompleteDetails).toEqual([
				'other_reason: Custom rejection reason text'
			]);

			const validationResult = await validateFromSchema(
				schemas.events.appealRepresentation,
				// @ts-ignore
				mapped
			);
			expect(validationResult).toBe(true);
		});
	});

	describe('unsuccessfull representation mapping', () => {
		for (const status of ['status1', 'status2']) {
			test(`Mapping incorrect status: ${status}`, async () => {
				// @ts-ignore
				const mapped = mapRepresentationEntity({ ...mockRepresentation, status });
				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
				expect(mapped?.representationStatus).toBe(null);
			});
		}
		for (const representationType of ['type1', 'type2']) {
			test(`Mapping incorrect type: ${representationType}`, async () => {
				// @ts-ignore
				const mapped = mapRepresentationEntity({ ...mockRepresentation, representationType });
				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
				expect(mapped?.representationType).toBe(null);
			});
		}
		for (const reason of ['A reason not listed', 'another one not listed']) {
			test(`Mapping reason: ${reason}`, async () => {
				const mapped = mapRepresentationEntity({
					...mockRepresentation,
					// @ts-ignore
					representationRejectionReasonsSelected: [reason]
				});
				const validationResult = await validateFromSchema(
					schemas.events.appealRepresentation,
					// @ts-ignore
					mapped
				);
				expect(validationResult).toBe(true);
				expect(mapped?.invalidOrIncompleteDetails?.length).toBe(0);
			});
		}
	});
});
