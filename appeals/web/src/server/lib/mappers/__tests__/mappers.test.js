import {
	appealData,
	lpaQuestionnaireDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createAccountInfo } from '#testing/app/app.js';
import { initialiseAndMapAppealData } from '../data/appeal/mapper.js';
import { initialiseAndMapLPAQData } from '../data/lpa-questionnaire/mapper.js';
import { areIdsDefinedAndUnique } from '#testing/lib/testMappers.js';
import { mapPagination } from '../index.js';

/** @typedef {import('../../../app/auth/auth-session.service').SessionWithAuth} SessionWithAuth */

describe('appeal-mapper', () => {
	/**
	 * @type {string}
	 */
	let currentRoute;
	/**
	 * @type {SessionWithAuth}
	 */
	let session;
	/**
	 * @type {MappedAppealInstructions}
	 */
	let validMappedData;

	describe('Test 1: Basic functionality', () => {
		beforeAll(async () => {
			currentRoute = 'testroute/';
			// @ts-ignore
			session = { account: createAccountInfo() };
			validMappedData = await initialiseAndMapAppealData(appealData, currentRoute, session);
		});

		it('should return a valid MappedAppealInstructions object for valid inputs', async () => {
			expect(validMappedData).toBeDefined();
		});
		it('should have an id that is unique', async () => {
			const idsAreUnique = areIdsDefinedAndUnique(validMappedData.appeal);
			expect(idsAreUnique).toBe(true);
		});
	});
	describe('Test 2: Value transformation', () => {
		it('should format dates using UK format', async () => {
			const preFormattedDate = '2023-10-11T01:00:00.000Z';
			const mappedDate =
				validMappedData.appeal.lpaQuestionnaireDueDate.display.summaryListItem?.value.text;

			// Check date is the same after being formatted
			expect(new Date(mappedDate).getDate()).toEqual(new Date(preFormattedDate).getDate());

			//Check date format is correct
			const expectedLongFormatRegex =
				/^\d{1,2} (?:(Jan|Febr)uary|March|April|May|Ju(ne|ly)|August|(Septem|Octo|Novem|Decem)ber) \d{4}$/;
			const expectedShortFormatRegex =
				/^\d{1,2} (?:Jan|Feb|Mar|Apr|May|Ju(n|l)|Aug|Sep|Oct|Nov|Dec) \d{4}$/;

			/**
			 * @param {string} dateString
			 */
			function isDateInCorrectFormat(dateString) {
				return (
					dateString.match(expectedLongFormatRegex) !== null ||
					dateString.match(expectedShortFormatRegex) !== null
				);
			}

			expect(isDateInCorrectFormat(mappedDate)).toBe(true);
		});
	});
});

describe('lpaQuestionnaire-mapper', () => {
	/**
	 * @type {string}
	 */
	let currentRoute;
	/**
	 * @type {SessionWithAuth}
	 */
	let session;
	/**
	 * @type {MappedLPAQInstructions}
	 */
	let validMappedData;
	beforeAll(async () => {
		currentRoute = 'testroute/';
		// @ts-ignore
		session = { account: createAccountInfo() };
		validMappedData = await initialiseAndMapLPAQData(
			// @ts-ignore
			lpaQuestionnaireDataIncompleteOutcome,
			appealData,
			session,
			currentRoute
		);
	});
	describe('Test 1: Basic functionality', () => {
		it('should return a valid MappedLPAQInstructions object for valid inputs', async () => {
			expect(validMappedData).toBeDefined();
		});
		it('should have an id that is unique', async () => {
			expect(areIdsDefinedAndUnique(validMappedData.lpaq)).toBe(true);
		});
	});
});

describe('pagination mapper', () => {
	const testAdditionalQuery = { 'test-additional-query-string': true };

	describe('mapPagination', () => {
		it('should return an empty Pagination object if pageCount is less than 2', () => {
			const result = mapPagination(1, 1, 10, 'test-base-url', testAdditionalQuery);

			expect(result.previous).toEqual({});
			expect(result.next).toEqual({});
			expect(result.items).toEqual([]);
		});
		it('should return a Pagination object with the expected properties if pageCount is 2 or greater', () => {
			const testBaseUrl = 'test-base-url';

			const result = mapPagination(3, 5, 10, testBaseUrl, testAdditionalQuery);

			const testAdditionalQueryString = '&test-additional-query-string=true';

			expect(result.previous?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=2${testAdditionalQueryString}`
			);
			expect(result.next?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=4${testAdditionalQueryString}`
			);
			expect(result.items?.length).toBe(5);
			expect(result.items?.[4]?.number).toEqual(5);
			expect(result.items?.[4]?.href).toEqual(
				`${testBaseUrl}?pageSize=10&pageNumber=5${testAdditionalQueryString}`
			);
		});
	});
});
