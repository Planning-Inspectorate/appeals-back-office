import {
	appealData,
	lpaQuestionnaireDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { createAccountInfo } from '#testing/app/app.js';
import { initialiseAndMapAppealData } from '../data/appeal/mapper.js';
import { initialiseAndMapLPAQData } from '../data/lpa-questionnaire/mapper.js';
import { areIdsDefinedAndUnique } from '#testing/lib/testMappers.js';
import { mapPagination } from '../index.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { constructUrl } from '#lib/mappers/utils/url.mapper.js';

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

describe('mapRepresentationDocumentSummaryActionLink', () => {
	const baseRoute = '/appeals-service/appeal-details/4419';

	describe('LPA Statement links', () => {
		it('should return "Review" link for LPA statement when awaiting review', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				'lpa-statement'
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "Review" link for LPA statement when incomplete', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
				'lpa-statement'
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "View" link for LPA statement when valid', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.VALID,
				'lpa-statement'
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "View" link for LPA statement when published', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.PUBLISHED,
				'lpa-statement'
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return an empty string when LPA statement is not received', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'not_received',
				null,
				'lpa-statement'
			);
			expect(link).toBe('');
		});
	});
});

describe('URL mappers', () => {
	const appealId = '1';

	describe('constructUrl', () => {
		it('should return the sign-in page URL when given "/signin" as input', () => {
			const url = constructUrl('/signin');
			expect(url).toBe('/auth/signin');
		});

		it('should return the "assigned to me" page URL when given "/personal-list" as input', () => {
			const url = constructUrl('/personal-list');
			expect(url).toBe('/appeals-service/personal-list');
		});

		it('should return the "case details" page URL when given "/" along with appeal ID as input', () => {
			const url = constructUrl('/', appealId);
			expect(url).toBe('/appeals-service/appeal-details/1/');
		});

		it('should return the "share" page URL when given "/share" along with appeal ID as input', () => {
			const url = constructUrl('/share', appealId);
			expect(url).toBe('/appeals-service/appeal-details/1/share');
		});

		it('should return the all cases page URL when given value that does not exist in URL map and as input and appeal ID not provided', () => {
			const url = constructUrl('/foo');
			expect(url).toBe('/appeals-service/all-cases');
		});
	});
});
