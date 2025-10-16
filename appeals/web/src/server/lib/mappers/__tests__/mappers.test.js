import { constructUrl } from '#lib/mappers/utils/url.mapper.js';
import { mapRepresentationDocumentSummaryActionLink } from '#lib/representation-utilities.js';
import { createAccountInfo } from '#testing/app/app.js';
import {
	appealData,
	lpaQuestionnaireDataIncompleteOutcome
} from '#testing/app/fixtures/referencedata.js';
import { areIdsDefinedAndUnique } from '#testing/lib/testMappers.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { isEqual } from 'lodash-es';
import { initialiseAndMapAppealData } from '../data/appeal/mapper.js';
import { initialiseAndMapLPAQData } from '../data/lpa-questionnaire/mapper.js';
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
			validMappedData = await initialiseAndMapAppealData(
				appealData,
				currentRoute,
				session,
				// @ts-ignore
				{
					originalUrl: currentRoute
				}
			);
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

		it('renders an ellipsis element before the final page marker and no ellipsis element after the first page marker when page count is greater than 10 and current page is 2', () => {
			const testBaseUrl = 'test-base-url';
			const result = mapPagination(2, 15, 30, testBaseUrl, testAdditionalQuery);

			const containsEllipsisElementAfterFirstPageMarker = isEqual(result.items[1], {
				ellipsis: true
			});
			const containsEllipsisElementBeforeLastPageMarker = isEqual(result.items[3], {
				ellipsis: true
			});
			const containsBlankEllipsisElement =
				result.items.filter((item) => isEqual(item, { ellipsis: false })).length > 0;

			expect(containsEllipsisElementAfterFirstPageMarker).toBeFalsy();
			expect(containsEllipsisElementBeforeLastPageMarker).toBeTruthy();
			expect(containsBlankEllipsisElement).toBeFalsy();
		});

		it('renders an ellipsis element after the first page marker and no ellipsis element before the last page marker when page count is greater than 10 and current page is 17', () => {
			const testBaseUrl = 'test-base-url';
			const result = mapPagination(17, 15, 30, testBaseUrl, testAdditionalQuery);

			const containsEllipsisElementAfterFirstPageMarker = isEqual(result.items[1], {
				ellipsis: true
			});
			const containsEllipsisElementBeforeLastPageMarker = isEqual(result.items[3], {
				ellipsis: true
			});
			const containsBlankEllipsisElement =
				result.items.filter((item) => isEqual(item, { ellipsis: false })).length > 0;

			expect(containsEllipsisElementAfterFirstPageMarker).toBeTruthy();
			expect(containsEllipsisElementBeforeLastPageMarker).toBeFalsy();
			expect(containsBlankEllipsisElement).toBeFalsy();
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
				'lpa-statement',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "Review" link for LPA statement when incomplete', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
				'lpa-statement',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-lpa-statement" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "View" link for LPA statement when valid', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.VALID,
				'lpa-statement',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return "View" link for LPA statement when published', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.PUBLISHED,
				'lpa-statement',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/lpa-statement?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-lpa-statement" class="govuk-link">View<span class="govuk-visually-hidden"> LPA statement</span></a>`
			);
		});

		it('should return an empty string when LPA statement is not received', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'not_received',
				null,
				'lpa-statement',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe('');
		});
	});

	describe('LPA proof of evidence links', () => {
		it('should return "Review" link for LPA proof of evidence when awaiting review', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				'lpa-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-lpa-proofs-evidence" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA proof of evidence</span></a>`
			);
		});

		it('should return "View" link for LPA proof of evidence when incomplete', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
				'lpa-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/lpa/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-lpa-proofs-evidence" class="govuk-link">View<span class="govuk-visually-hidden"> LPA proof of evidence</span></a>`
			);
		});

		it('should return "View" link for LPA proof of evidence when valid', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.VALID,
				'lpa-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/lpa/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-lpa-proofs-evidence" class="govuk-link">View<span class="govuk-visually-hidden"> LPA proof of evidence</span></a>`
			);
		});
	});

	describe('Appellant proof of evidence links', () => {
		it('should return "Review" link for appellant proof of evidence when awaiting review', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				'appellant-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/appellant?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-appellant-proofs-evidence" class="govuk-link">Review<span class="govuk-visually-hidden"> Appellant proof of evidence</span></a>`
			);
		});

		it('should return "View" link for appellant proof of evidence when incomplete', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.INCOMPLETE,
				'appellant-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/appellant/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-appellant-proofs-evidence" class="govuk-link">View<span class="govuk-visually-hidden"> Appellant proof of evidence</span></a>`
			);
		});

		it('should return "View" link for appellant proof of evidence when valid', () => {
			const link = mapRepresentationDocumentSummaryActionLink(
				baseRoute,
				'received',
				APPEAL_REPRESENTATION_STATUS.VALID,
				'appellant-proofs-evidence',
				// @ts-ignore
				{
					originalUrl: baseRoute
				}
			);
			expect(link).toBe(
				`<a href="${baseRoute}/proof-of-evidence/appellant/manage-documents?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-appellant-proofs-evidence" class="govuk-link">View<span class="govuk-visually-hidden"> Appellant proof of evidence</span></a>`
			);
		});
	});
});

describe('Final comments links', () => {
	const baseRoute = '/appeals-service/appeal-details/4419';
	it('should return "Review" link for appellant statement when awaiting review', () => {
		const link = mapRepresentationDocumentSummaryActionLink(
			baseRoute,
			'received',
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
			'appellant-final-comments',
			// @ts-ignore
			{
				originalUrl: baseRoute
			}
		);
		expect(link).toBe(
			`<a href="${baseRoute}/final-comments/appellant?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-appellant-final-comments" class="govuk-link">Review<span class="govuk-visually-hidden"> Appellant final comments</span></a>`
		);
	});

	it('should return "Review" link for LPA statement when awaiting review', () => {
		const link = mapRepresentationDocumentSummaryActionLink(
			baseRoute,
			'received',
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
			'lpa-final-comments',
			// @ts-ignore
			{
				originalUrl: baseRoute
			}
		);
		expect(link).toBe(
			`<a href="${baseRoute}/final-comments/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="review-lpa-final-comments" class="govuk-link">Review<span class="govuk-visually-hidden"> LPA final comments</span></a>`
		);
	});

	it('should return "View" link for appellant final comments when valid', () => {
		const link = mapRepresentationDocumentSummaryActionLink(
			baseRoute,
			'received',
			APPEAL_REPRESENTATION_STATUS.VALID,
			'appellant-final-comments',
			// @ts-ignore
			{
				originalUrl: baseRoute
			}
		);
		expect(link).toBe(
			`<a href="${baseRoute}/final-comments/appellant?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-appellant-final-comments" class="govuk-link">View<span class="govuk-visually-hidden"> Appellant final comments</span></a>`
		);
	});

	it('should return "View" link for LPA final comments when published', () => {
		const link = mapRepresentationDocumentSummaryActionLink(
			baseRoute,
			'received',
			APPEAL_REPRESENTATION_STATUS.PUBLISHED,
			'lpa-final-comments',
			// @ts-ignore
			{
				originalUrl: baseRoute
			}
		);
		expect(link).toBe(
			`<a href="${baseRoute}/final-comments/lpa?backUrl=%2Fappeals-service%2Fappeal-details%2F4419" data-cy="view-lpa-final-comments" class="govuk-link">View<span class="govuk-visually-hidden"> LPA final comments</span></a>`
		);
	});

	it('should return an empty string when (any) final comment is not received', () => {
		const link = mapRepresentationDocumentSummaryActionLink(
			baseRoute,
			'not_received',
			null,
			'appellant-final-comments',
			// @ts-ignore
			{
				originalUrl: baseRoute
			}
		);
		expect(link).toBe('');
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
