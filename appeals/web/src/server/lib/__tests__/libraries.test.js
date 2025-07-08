import { addressToString, appealSiteToMultilineAddressStringHtml } from '../address-formatter.js';
import { bodyToPayload } from '../body-formatter.js';
import {
	dateIsInTheFuture,
	dateIsInThePast,
	dateIsTodayOrInThePast,
	dateIsValid,
	dayMonthYearHourMinuteToISOString,
	dayMonthYearHourMinuteToDisplayDate,
	dateISOStringToDayMonthYearHourMinute,
	dateISOStringToDisplayDate,
	dateISOStringToDisplayTime24hr,
	getDayFromISODate
} from '../dates.js';
import { appealShortReference } from '../nunjucks-filters/appeals.js';
import { nameToString } from '../person-name-formatter.js';
import { objectContainsAllKeys } from '../object-utilities.js';
import { getIdByNameFromIdNamePairs } from '../id-name-pairs.js';
import { convertFromBooleanToYesNo } from '#lib/boolean-formatter.js';
import { addConditionalHtml } from '#lib/nunjucks-filters/add-conditional-html.js';
import { numberToAccessibleDigitLabel } from '#lib/accessibility.js';
import {
	mapReasonOptionsToCheckboxItemParameters,
	getNotValidReasonsTextFromRequestBody
} from '../validation-outcome-reasons-formatter.js';
import { mapReasonsToReasonsListHtml } from '#lib/reasons-formatter.js';
import { timeIsBeforeTime, is24HourTimeValid } from '#lib/times.js';
import { appellantCaseInvalidReasons, baseSession } from '#testing/app/fixtures/referencedata.js';
import { stringContainsDigitsOnly } from '#lib/string-utilities.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { paginationDefaultSettings } from '#appeals/appeal.constants.js';
import { getPaginationParametersFromQuery } from '#lib/pagination-utilities.js';
import { linkedAppealStatus } from '#lib/appeals-formatter.js';
import httpMocks from 'node-mocks-http';
import {
	getOriginPathname,
	isInternalUrl,
	safeRedirect,
	addBackLinkQueryToUrl,
	getBackLinkUrlFromQuery,
	stripQueryString,
	preserveQueryString
} from '#lib/url-utilities.js';
import { stringIsValidPostcodeFormat } from '#lib/postcode.js';
import { addInvisibleSpacesAfterRedactionCharacters } from '#lib/redaction-string-formatter.js';
import {
	mapStatusText,
	mapAppealProcedureTypeToEventName,
	mapStatusFilterLabel
} from '#lib/appeal-status.js';
import { APPEAL_CASE_STATUS, APPEAL_CASE_PROCEDURE } from 'pins-data-model';
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

describe('Libraries', () => {
	describe('addressFormatter', () => {
		it('addressToString should convert a multi part address to a single string', () => {
			const address = {
				postCode: 'postcode',
				addressLine1: 'address 1',
				addressLine2: 'address 2',
				town: 'town',
				county: 'county'
			};

			const adressFormatted = addressToString(address);

			expect(typeof adressFormatted).toBe('string');
		});
		it('appealSiteToMultilineAddressStringHtml should converts a multi part address to a single string', () => {
			const address = {
				postCode: 'postcode',
				addressLine1: 'address 1',
				addressLine2: 'address 2',
				town: 'town',
				county: 'county'
			};

			const adressFormatted = appealSiteToMultilineAddressStringHtml(address);

			expect(adressFormatted).toEqual(
				'address 1, </br>address 2, </br>town, </br>county, </br>postcode'
			);
		});
	});

	describe('appeals', () => {
		describe('appealShortRef', () => {
			const tests = [
				{
					name: 'null',
					ref: null,
					want: null
				},
				{
					name: 'undefined'
				},
				{
					name: 'empty',
					ref: '',
					want: ''
				},
				{
					name: 'valid 0',
					ref: 'APP/5141/9999',
					want: '9999'
				},
				{
					name: 'valid 1',
					ref: 'APP/Q9999/D/21/1345264',
					want: '1345264'
				},
				{
					name: 'valid 2',
					ref: 'APP/Q9999/D/21/5463281',
					want: '5463281'
				}
			];

			for (const { name, ref, want } of tests) {
				it(`should handle ${name}`, () => {
					const got = appealShortReference(ref);

					expect(got).toEqual(want);
				});
			}
		});
	});

	describe('BodyToPayload', () => {
		it('should format correct the body', () => {
			const body = {
				'A1.B1.C1': 'a1b1c1',
				'A1.B2.C2': 'a1b2c2',
				'A1.B1.C3': 'a1b1c3',
				'A1.C3': 'a1c3',
				'A2.B2': 'a2b2',
				'A2.B1': 'a2b1',
				A3: 'a3'
			};

			const payload = bodyToPayload(body);
			const expectPayload = {
				A1: {
					B1: {
						C1: 'a1b1c1',
						C3: 'a1b1c3'
					},
					B2: {
						C2: 'a1b2c2'
					},
					C3: 'a1c3'
				},
				A2: {
					B2: 'a2b2',
					B1: 'a2b1'
				},
				A3: 'a3'
			};

			expect(payload).toMatchObject(expectPayload);
		});
	});

	describe('dates', () => {
		describe('dateIsValid', () => {
			it('should return true if day, month and year params form a date that is semantically valid and real', () => {
				expect(dateIsValid({ year: 2024, month: 2, day: 29 })).toBe(true);
			});
			it('should return false if day, month and year params form a date that is semantically valid but not real', () => {
				expect(dateIsValid({ year: 2023, month: 2, day: 29 })).toBe(false);
			});
			it('should return true if day, month and year params form a valid real date', () => {
				expect(dateIsValid({ year: 2021, month: 2, day: 1 })).toBe(true);
			});
			it('should return false if day parameter is outside the valid range', () => {
				expect(dateIsValid({ year: 2023, month: 2, day: 0 })).toBe(false);
				expect(dateIsValid({ year: 2024, month: 1, day: 32 })).toBe(false);
			});
			it('should return false if month parameter is outside the valid range', () => {
				expect(dateIsValid({ year: 2023, month: 0, day: 1 })).toBe(false);
				expect(dateIsValid({ year: 2023, month: 13, day: 1 })).toBe(false);
				// @ts-ignore
				expect(dateIsValid({ year: 'abc', month: 2, day: 29 })).toBe(false);
				expect(dateIsValid({ year: NaN, month: 2, day: 29 })).toBe(false);
				// @ts-ignore
				expect(dateIsValid({ year: null, month: 2, day: 29 })).toBe(false);
			});
		});

		describe('dateIsInTheFuture', () => {
			it('should return true if day, month and year params form a date that is in the future', () => {
				expect(dateIsInTheFuture({ year: 3000, month: 1, day: 1 })).toBe(true);
			});
			it('should return false if day, month and year params form a date that is in the past', () => {
				expect(dateIsInTheFuture({ year: 2000, month: 1, day: 1 })).toBe(false);
			});
		});

		describe('dateIsInThePast', () => {
			it('should return true if day, month and year params form a date that is in the past', () => {
				expect(dateIsInThePast({ year: 2000, month: 1, day: 1 })).toBe(true);
			});
			it('should return false if day, month and year params form a date that is in the future', () => {
				expect(dateIsInThePast({ year: 3000, month: 1, day: 1 })).toBe(false);
			});
		});

		describe('dateIsTodayOrInThePast', () => {
			it('should return true if day, month and year params form a date that is in the past', () => {
				expect(dateIsTodayOrInThePast({ year: 2000, month: 1, day: 1 })).toBe(true);
			});
			it('should return false if day, month and year params form a date that is in the future', () => {
				expect(dateIsTodayOrInThePast({ year: 3000, month: 1, day: 1 })).toBe(false);
			});
		});

		describe('dayMonthYearHourMinuteToISOString', () => {
			it('should return the correct date as a string in the format YYYY-MM-DD when provided a DayMonthYearHourMinute with single-digit day and month values', () => {
				const convertedDate = dayMonthYearHourMinuteToISOString({
					day: 1,
					month: 12,
					year: 2023,
					hour: 0,
					minute: 0
				});

				expect(convertedDate).toBe('2023-12-01T00:00:00.000Z');
			});

			it('should return the correct date as a string in the format YYYY-MM-DD when provided a DayMonthYearHourMinute with double-digit day and month values', () => {
				const convertedDate = dayMonthYearHourMinuteToISOString({
					day: 10,
					month: 12,
					year: 2023,
					hour: 0,
					minute: 0
				});

				expect(convertedDate).toBe('2023-12-10T00:00:00.000Z');
			});
		});

		describe('dayMonthYearHourMinuteToDisplayDate', () => {
			it('should return the correct date as a string in the format of "1 January 2024" when provided a DayMonthYearHourMinute with single-digit day and month values', () => {
				const convertedDate = dayMonthYearHourMinuteToDisplayDate({
					day: 1,
					month: 1,
					year: 2024
				});

				expect(convertedDate).toBe('1 January 2024');
			});
			it('should return the correct date as a string in the format of "1 January 2024" when provided a DayMonthYearHourMinute with single-digit day and month values and condensed is true', () => {
				const convertedDate = dayMonthYearHourMinuteToDisplayDate({
					day: 1,
					month: 1,
					year: 2024
				});

				expect(convertedDate).toBe('1 January 2024');
			});
		});

		describe('dateISOStringToDayMonthYearHourMinute', () => {
			it('should return undefined when the provided date string is null', () => {
				const convertedDate = dateISOStringToDayMonthYearHourMinute(null);

				expect(convertedDate).toEqual({});
			});

			it('should return undefined when the provided date string is undefined', () => {
				const convertedDate = dateISOStringToDayMonthYearHourMinute(undefined);

				expect(convertedDate).toEqual({});
			});

			it('should return undefined when provided an invalid date string', () => {
				const convertedDate = dateISOStringToDayMonthYearHourMinute('abc123');

				expect(convertedDate).toEqual({});
			});

			it('should return the correct date as a DayMonthYearHourMinute object when provided a valid date string when UK is in GMT TZ', () => {
				const convertedDate = dateISOStringToDayMonthYearHourMinute('2024-02-02T13:24:10.359Z');

				expect(convertedDate).toEqual({
					day: 2,
					month: 2,
					year: 2024,
					hour: 13,
					minute: 24
				});
			});

			it('should return the correct date as a DayMonthYearHourMinute object when provided a valid date string when UK is in BST TZ', () => {
				const convertedDate = dateISOStringToDayMonthYearHourMinute('2024-06-02T13:24:10.359Z');

				expect(convertedDate).toEqual({
					day: 2,
					month: 6,
					year: 2024,
					hour: 14,
					minute: 24
				});
			});

			it('should handle invalid dates gracefully', () => {
				expect(dateISOStringToDayMonthYearHourMinute('invalid-date')).toEqual({});
			});
		});

		describe('dateISOStringToDisplayDate', () => {
			it('returns an empty string for null input', () => {
				expect(dateISOStringToDisplayDate(null)).toBe('');
			});

			it('returns an empty string for undefined input', () => {
				expect(dateISOStringToDisplayDate(undefined)).toBe('');
			});

			it('formats a Date object correctly with default options', () => {
				expect(dateISOStringToDisplayDate('2024-01-01T12:00:00Z')).toBe('1 January 2024');
			});

			it('formats a Date object correctly with default options, in BST', () => {
				// 1st July 23:00 UTC is 2nd July 00:00 Europe/London
				expect(dateISOStringToDisplayDate('2024-07-01T23:00:00Z')).toBe('2 July 2024');
			});

			it('formats a timestamp correctly with default options', () => {
				expect(dateISOStringToDisplayDate('2024-01-01T12:00:00Z')).toBe('1 January 2024');
			});
		});

		describe('dateISOStringToDisplayTime24hr', () => {
			it('formats a Date object into a HH:MM string', () => {
				expect(dateISOStringToDisplayTime24hr('2024-01-01T13:09:00Z')).toBe('13:09');
			});
			it('formats a Date object into a HH:MM string, in BST', () => {
				expect(dateISOStringToDisplayTime24hr('2024-07-01T13:09:00Z')).toBe('14:09');
			});

			it('returns an empty string for undefined or null dates', () => {
				expect(dateISOStringToDisplayTime24hr(undefined)).toBe('');
				expect(dateISOStringToDisplayTime24hr(null)).toBe('');
			});
		});

		describe('is24HoursTimeValid', () => {
			it('should return true for valid times', () => {
				const validTimes = ['00:00', '06:12', '6:12', '12:00', '16:30'];
				for (const set of validTimes) {
					expect(is24HourTimeValid(set)).toBe(true);
				}
			});
			it('should return false for invalid times', () => {
				const validTimes = ['0000', '26:12', '24:00', '13:60', '16:30:00'];
				for (const set of validTimes) {
					expect(is24HourTimeValid(set)).toBe(false);
				}
			});
		});

		describe('getDayFromISODate', () => {
			it('should return an empty string for a null value', () => {
				const date = null;
				expect(getDayFromISODate(date)).toEqual('');
			});
			it('should return an empty string for an undefined value', () => {
				const date = undefined;
				expect(getDayFromISODate(date)).toEqual('');
			});
			it('should return the correct day for a valid ISODate during BST', () => {
				const date = '2011-06-01T00:00:00.000Z';
				expect(getDayFromISODate(date)).toEqual('Wednesday');
			});
			it('should return the correct day for a valid ISODate during GMT', () => {
				const date = '2024-12-05T00:00:00.000Z';
				expect(getDayFromISODate(date)).toEqual('Thursday');
			});
		});
	});

	describe('nameToString', () => {
		it('should converts a multi part person name to a single string', () => {
			const applicant = {
				firstName: 'firstName',
				lastName: 'lastName',
				id: 1,
				organisationName: 'organisationName',
				email: 'email',
				website: 'website',
				phoneNumber: 'phoneNumber'
			};

			const formattedApplicant = nameToString(applicant);

			expect(typeof formattedApplicant).toEqual('string');
		});
	});

	describe('objectContainsAllKeys', () => {
		it('should return true if the provided object contains all of the provided keys, false otherwise', () => {
			const testObject = {
				firstKey: 'firstKey value',
				'second-key': 'second-key value',
				3: '3 value',
				fourthKey: ['fourthKey', 'value']
			};

			expect(objectContainsAllKeys(testObject, 'firstKey')).toBe(true);
			expect(objectContainsAllKeys(testObject, 'second-key')).toBe(true);
			expect(objectContainsAllKeys(testObject, '3')).toBe(true);
			expect(objectContainsAllKeys(testObject, 'fourthKey')).toBe(true);
			expect(objectContainsAllKeys(testObject, 'keyThatDoesNotExist')).toBe(false);
			expect(objectContainsAllKeys(testObject, ['firstKey', 'second-key', '3', 'fourthKey'])).toBe(
				true
			);
			expect(
				objectContainsAllKeys(testObject, [
					'firstKey',
					'second-key',
					'3',
					'fourthKey',
					'keyThatDoesNotExist'
				])
			).toBe(false);
		});
	});

	describe('addConditionalHtml', () => {
		it('should add the provided html to the "conditional" property of the supplied object', () => {
			const item = {};
			const conditionalHtml = '<div>test</div>';
			/** @type {Object<string, any>} */
			const result = addConditionalHtml(item, conditionalHtml);

			expect(result.conditional).toEqual({ html: '<div>test</div>' });
		});
	});

	describe('getIdByNameFromIdNamePairs', () => {
		it('should return the id of the IdNamePair with the provided name, if a matching IdNamePair is present in the provided array', () => {
			const matchingId = getIdByNameFromIdNamePairs(
				[
					{ id: 0, name: 'a' },
					{ id: 1, name: 'b' },
					{ id: 2, name: 'c' }
				],
				'b'
			);

			expect(matchingId).toBe(1);
		});
		it('should return undefined, if an IdNamePair with the provided name is not present in the provided array', () => {
			const matchingId = getIdByNameFromIdNamePairs(
				[
					{ id: 0, name: 'a' },
					{ id: 1, name: 'b' },
					{ id: 2, name: 'c' }
				],
				'd'
			);

			expect(matchingId).toBe(undefined);
		});
	});

	describe('convertFromBooleanToYesNo', () => {
		it('should return null if provided boolean is undefined', () => {
			expect(convertFromBooleanToYesNo(undefined)).toBe(null);
		});
		it('should return null if provided boolean is null', () => {
			expect(convertFromBooleanToYesNo(null)).toBe(null);
		});
		it('should return "Yes" if provided boolean is true', () => {
			expect(convertFromBooleanToYesNo(true)).toBe('Yes');
		});
		it('should return "No" if provided boolean is false', () => {
			expect(convertFromBooleanToYesNo(false)).toBe('No');
		});
	});

	describe('mappers/validation-outcome-reasons.mapper', () => {
		describe('mapReasonOptionsToCheckboxItemParameters', () => {
			it('should return an array of checkbox item parameters with the expected properties if checkedOptions is undefined', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					undefined,
					[],
					{},
					'invalidReason',
					undefined
				);

				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: false,
						addAnother: { textItems: [''] }
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: false
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if checkedOptions is an empty array', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[],
					[],
					{},
					'invalidReason',
					undefined
				);

				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: false,
						addAnother: { textItems: [''] }
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: false
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are no reasonOptions with text', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons.filter((reasonOption) => reasonOption.hasText === false),
					[],
					[],
					{},
					'invalidReason',
					undefined
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: false
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions but no reasonOptions with text', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons.filter((reasonOption) => reasonOption.hasText === false),
					[23],
					[],
					{},
					'invalidReason',
					undefined
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions and reasonOptions with text and existingReasons, but not a bodyValidationOutcome or sessionValidationOutcome', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[22, 23],
					[
						{
							name: {
								id: 22,
								name: 'Documents have not been submitted on time',
								hasText: true
							},
							text: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						},
						{
							name: {
								id: 23,
								name: "The appellant doesn't have the right to appeal",
								hasText: false
							}
						}
					],
					{},
					'invalidReason',
					undefined
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: true,
						addAnother: {
							textItems: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						}
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions and reasonOptions with text and a sessionValidationOutcome, but not existingReasons or a bodyValidationOutcome', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[22, 23],
					[],
					{},
					'invalidReason',
					{
						appealId: '1',
						validationOutcome: 'invalid',
						reasons: ['22', '23'],
						reasonsText: {
							22: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						}
					}
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: true,
						addAnother: {
							textItems: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						}
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions and reasonOptions with text and a bodyValidationOutcome, but not existingReasons or a sessionValidationOutcome', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[22, 23],
					[],
					{
						invalidReason: ['22', '23'],
						'invalidReason-22': [
							'test document 1 has not been submitted on time',
							'test document 2 has not been submitted on time'
						]
					},
					'invalidReason',
					undefined
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: true,
						addAnother: {
							textItems: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						}
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions and reasonOptions with text and existingReasons and a sessionValidationOutcome, but not a bodyValidationOutcome (sessionValidationOutcome text items should take precedence over any conflicting existingReasons text items)', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[22, 23],
					[
						{
							name: {
								id: 22,
								name: 'Documents have not been submitted on time',
								hasText: true
							},
							text: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						},
						{
							name: {
								id: 23,
								name: "The appellant doesn't have the right to appeal",
								hasText: false
							}
						}
					],
					{},
					'invalidReason',
					{
						appealId: '1',
						validationOutcome: 'invalid',
						reasons: ['22', '23'],
						reasonsText: {
							22: ['session text item 1']
						}
					}
				);
				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: true,
						addAnother: {
							textItems: ['session text item 1']
						}
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});

			it('should return an array of checkbox item parameters with the expected properties if there are checkedOptions and reasonOptions with text and existingReasons and a sessionValidationOutcome and a bodyValidationOutcome (bodyValidationOutcome text items should take precedence over any conflicting sessionValidationOutcome or existingReasons text items)', () => {
				const result = mapReasonOptionsToCheckboxItemParameters(
					appellantCaseInvalidReasons,
					[22, 23],
					[
						{
							name: {
								id: 22,
								name: 'Documents have not been submitted on time',
								hasText: true
							},
							text: [
								'test document 1 has not been submitted on time',
								'test document 2 has not been submitted on time'
							]
						},
						{
							name: {
								id: 23,
								name: "The appellant doesn't have the right to appeal",
								hasText: false
							}
						}
					],
					{
						invalidReason: ['22', '23'],
						'invalidReason-22': 'body text item 1'
					},
					'invalidReason',
					{
						appealId: '1',
						validationOutcome: 'invalid',
						reasons: ['22', '23'],
						reasonsText: {
							22: ['session text item 1']
						}
					}
				);

				const expectedResult = [
					{
						value: '21',
						text: 'Appeal has not been submitted on time',
						checked: false
					},
					{
						value: '22',
						text: 'Documents have not been submitted on time',
						checked: true,
						addAnother: {
							textItems: ['body text item 1']
						}
					},
					{
						value: '23',
						text: "The appellant doesn't have the right to appeal",
						checked: true
					},
					{
						value: '24',
						text: 'Other',
						checked: false,
						addAnother: { textItems: [''] }
					}
				];

				expect(result).toEqual(expectedResult);
			});
		});

		describe('mapReasonsToReasonsListHtml', () => {
			it('should return an empty string if reasons is undefined', () => {
				const result = mapReasonsToReasonsListHtml(
					appellantCaseInvalidReasons,
					undefined,
					undefined
				);

				expect(result).toEqual('');
			});

			it('should return an empty string if reasons is an empty array', () => {
				const result = mapReasonsToReasonsListHtml(appellantCaseInvalidReasons, [], undefined);

				expect(result).toEqual('');
			});

			it('should return a string containing the expected html if reasonsText is undefined', () => {
				const result = mapReasonsToReasonsListHtml(
					appellantCaseInvalidReasons,
					['22', '23'],
					undefined
				);

				expect(result).toEqual(
					'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-margin-bottom-0 govuk-list--bullet"><li>Documents have not been submitted on time</li><li>The appellant doesn\'t have the right to appeal</li></ul>'
				);
			});

			it('should return a string containing the expected html if reasonsText is an empty object', () => {
				const result = mapReasonsToReasonsListHtml(appellantCaseInvalidReasons, ['22', '23'], {});

				expect(result).toEqual(
					'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-margin-bottom-0 govuk-list--bullet"><li>Documents have not been submitted on time</li><li>The appellant doesn\'t have the right to appeal</li></ul>'
				);
			});

			it('should return a string containing the expected html if reasons and reasonsText are defined and populated with values', () => {
				const result = mapReasonsToReasonsListHtml(appellantCaseInvalidReasons, ['22', '23'], {
					22: ['test reason text 1', 'test reason text 2']
				});

				expect(result).toEqual(
					'<ul class="govuk-list govuk-!-margin-top-0 govuk-!-margin-bottom-0 govuk-list--bullet"><li>Documents have not been submitted on time: test reason text 1</li><li>Documents have not been submitted on time: test reason text 2</li><li>The appellant doesn\'t have the right to appeal</li></ul>'
				);
			});
		});

		describe('getNotValidReasonsTextFromRequestBody', () => {
			it('should throw an error if reasonKey is not present in requestBody', () => {
				expect(() => {
					getNotValidReasonsTextFromRequestBody(
						{
							incompleteReason: ['22', '23']
						},
						'invalidReason'
					);
				}).toThrow('reasonKey "invalidReason" not found in requestBody');
			});

			it('should return an object with the expected properties if reasonKey is present in requestBody, but the expected reasonText keys are missing from requestBody', () => {
				const result = getNotValidReasonsTextFromRequestBody(
					{
						invalidReason: ['22', '23']
					},
					'invalidReason'
				);

				expect(result).toEqual({});
			});

			it('should return an object with the expected properties if reasonKey and the expected reasonText keys are present in requestBody', () => {
				const result = getNotValidReasonsTextFromRequestBody(
					{
						invalidReason: ['22', '23'],
						'invalidReason-22': ['test reason text 1', 'test reason text 2']
					},
					'invalidReason'
				);

				expect(result).toEqual({
					22: ['test reason text 1', 'test reason text 2']
				});
			});
		});
	});

	describe('times', () => {
		describe('timeIsBeforeTime', () => {
			it('should return true if the provided time is before the provided beforeTime', () => {
				expect(timeIsBeforeTime(0, 1, 0, 2)).toBe(true);
				expect(timeIsBeforeTime(1, 0, 2, 0)).toBe(true);
				expect(timeIsBeforeTime(1, 59, 2, 0)).toBe(true);
				expect(timeIsBeforeTime(12, 45, 13, 0)).toBe(true);
			});

			it('should return false if the provided time is not before the provided beforeTime', () => {
				expect(timeIsBeforeTime(0, 1, 0, 1)).toBe(false);
				expect(timeIsBeforeTime(1, 0, 1, 0)).toBe(false);
				expect(timeIsBeforeTime(0, 2, 0, 1)).toBe(false);
				expect(timeIsBeforeTime(2, 0, 1, 0)).toBe(false);
				expect(timeIsBeforeTime(9, 15, 9, 15)).toBe(false);
				expect(timeIsBeforeTime(9, 30, 9, 15)).toBe(false);
				expect(timeIsBeforeTime(12, 45, 9, 0)).toBe(false);
				expect(timeIsBeforeTime(23, 45, 23, 30)).toBe(false);
			});
		});
	});

	describe('string utilities', () => {
		describe('stringContainsDigitsOnly', () => {
			it('should return true if the supplied string only contains digits', () => {
				expect(stringContainsDigitsOnly('0')).toBe(true);
				expect(stringContainsDigitsOnly('9')).toBe(true);
				expect(stringContainsDigitsOnly('123')).toBe(true);
				expect(stringContainsDigitsOnly(' 12 ')).toBe(true);
			});

			it('should return false if the supplied string contains any non-digit characters', () => {
				expect(stringContainsDigitsOnly('')).toBe(false);
				expect(stringContainsDigitsOnly(' ')).toBe(false);
				expect(stringContainsDigitsOnly('one')).toBe(false);
				expect(stringContainsDigitsOnly('.')).toBe(false);
				expect(stringContainsDigitsOnly('£1')).toBe(false);
				expect(stringContainsDigitsOnly('0.')).toBe(false);
				expect(stringContainsDigitsOnly('0.9')).toBe(false);
				expect(stringContainsDigitsOnly('3.141')).toBe(false);
				expect(stringContainsDigitsOnly('1!')).toBe(false);
				expect(stringContainsDigitsOnly('2a')).toBe(false);
				expect(stringContainsDigitsOnly('1 2')).toBe(false);
			});
		});
	});

	describe('session utilities', () => {
		describe('addNotificationBannerToSession', () => {
			it('should return false without modifying the session notificationBanners object if an unrecognised bannerDefinitionKey is provided', () => {
				const testSession = { ...baseSession };

				const result = addNotificationBannerToSession({
					session: testSession,
					// @ts-ignore
					bannerDefinitionKey: 'anUnrecognisedKey',
					appealId: 1
				});

				expect(result).toBe(false);
				expect(testSession).toEqual(baseSession);
			});

			it('should return true and add the expected notification banner data to the session (scoped by stringified appealId) if a recognised bannerDefinitionKey is provided and there is no notificationBanners property in the session already', () => {
				const testSession = { ...baseSession };

				const result = addNotificationBannerToSession({
					session: testSession,
					bannerDefinitionKey: 'caseOfficerAdded',
					appealId: 1
				});

				expect(result).toBe(true);
				expect(testSession).toEqual({
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'caseOfficerAdded'
							}
						]
					}
				});
			});

			it('should return true and add the expected notification banner data to the session (scoped by stringified appealId) if a recognised bannerDefinitionKey is provided and there is already a notificationBanners property in the session which is empty', () => {
				const testSession = {
					...baseSession,
					notificationBanners: {}
				};

				const result = addNotificationBannerToSession({
					session: testSession,
					bannerDefinitionKey: 'caseOfficerAdded',
					appealId: 1
				});

				expect(result).toBe(true);
				expect(testSession).toEqual({
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'caseOfficerAdded'
							}
						]
					}
				});
			});

			it('should return true and add the expected notification banner data to the session (scoped by stringified appealId) if a recognised bannerDefinitionKey is provided and there is already a notificationBanners property in the session which is populated with existing banner data', () => {
				const testSession = {
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'documentAdded'
							}
						]
					}
				};

				const result = addNotificationBannerToSession({
					session: testSession,
					bannerDefinitionKey: 'caseOfficerAdded',
					appealId: 1
				});

				expect(result).toBe(true);
				expect(testSession).toEqual({
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'documentAdded'
							},
							{
								key: 'caseOfficerAdded'
							}
						]
					}
				});
			});

			it('should return true and correctly handle the text parameter when adding a banner to the session', () => {
				const testSession = { ...baseSession };
				const customText = 'Custom banner content';

				const result = addNotificationBannerToSession({
					session: testSession,
					bannerDefinitionKey: 'documentAdded',
					appealId: 1,
					text: customText
				});

				expect(result).toBe(true);
				expect(testSession).toEqual({
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'documentAdded',
								text: customText
							}
						]
					}
				});
			});

			it('should return true and correctly handle the html parameter when adding a banner to the session', () => {
				const testSession = { ...baseSession };
				const customHtml = '<p>Custom banner content</p>';

				const result = addNotificationBannerToSession({
					session: testSession,
					bannerDefinitionKey: 'documentAdded',
					appealId: 1,
					html: customHtml
				});

				expect(result).toBe(true);
				expect(testSession).toEqual({
					...baseSession,
					notificationBanners: {
						1: [
							{
								key: 'documentAdded',
								html: customHtml
							}
						]
					}
				});
			});
		});
	});

	describe('accessibility', () => {
		describe('numberToAccessibleDigitLabel', () => {
			it('should return a string with each digit separated by a space, if the input is a number', () => {
				const result = numberToAccessibleDigitLabel(12345);

				expect(result).toEqual('1 2 3 4 5');
			});

			it('should return a string with each digit separated by a space, if the input is a number formatted as a string', () => {
				const result = numberToAccessibleDigitLabel('12345');

				expect(result).toEqual('1 2 3 4 5');
			});

			it('should return the input formatted as a string if any non-numeric characters are present in the input', () => {
				const result1 = numberToAccessibleDigitLabel('1.2345');
				const result2 = numberToAccessibleDigitLabel('1a2345');

				expect(result1).toEqual('1.2345');
				expect(result2).toEqual('1a2345');
			});
		});
	});

	describe('pagination utilities', () => {
		describe('getPaginationParametersFromQuery', () => {
			it('should return a PaginationParameters object with default pageNumber and pageSize values, if the supplied query object is an empty object', () => {
				const result = getPaginationParametersFromQuery({});

				expect(result.pageNumber).toEqual(paginationDefaultSettings.firstPageNumber);
				expect(result.pageSize).toEqual(paginationDefaultSettings.pageSize);
			});

			it('should return a PaginationParameters object with pageNumber and pageSize values from the supplied query object, if the query object is valid', () => {
				const result = getPaginationParametersFromQuery({
					pageNumber: '3',
					pageSize: '16'
				});

				expect(result.pageNumber).toEqual(3);
				expect(result.pageSize).toEqual(16);
			});
		});
	});

	describe('addInvisibleSpacesAfterRedactionCharacters', () => {
		it('should add a unicode invisible space after each █ character', () => {
			const originalString = 'some text ██████████████████████ more text';
			const formattedString =
				'some text █\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B█\u200B more text';

			expect(addInvisibleSpacesAfterRedactionCharacters(originalString)).toEqual(formattedString);
		});
	});
});

describe('linkedAppealStatus', () => {
	it('returns "Lead" when isParent is true', () => {
		expect(linkedAppealStatus(true, false)).toBe('Lead');
	});

	it('returns "Child" when isChild is true', () => {
		expect(linkedAppealStatus(false, true)).toBe('Child');
	});

	it('returns an empty string when both isParent and isChild are false', () => {
		expect(linkedAppealStatus(false, false)).toBe('');
	});
});

describe('stringIsValidPostcodeFormat', () => {
	it('returns true when passed a string in valid UK postcode format (uppercase)', () => {
		expect(stringIsValidPostcodeFormat('A1 1AA')).toBe(true);
		expect(stringIsValidPostcodeFormat('A11 1AA')).toBe(true);
		expect(stringIsValidPostcodeFormat('AA1 1AA')).toBe(true);
		expect(stringIsValidPostcodeFormat('AA11 1AA')).toBe(true);
		expect(stringIsValidPostcodeFormat('A1A 1AA')).toBe(true);
		expect(stringIsValidPostcodeFormat('AA1A 1AA')).toBe(true);
	});

	it('returns when passed a string in valid UK postcode format (lowercase)', () => {
		expect(stringIsValidPostcodeFormat('a1 1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('a11 1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa1 1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa11 1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('a1a 1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa1a 1aa')).toBe(true);
	});

	it('returns when passed a string in valid UK postcode format (without space separator)', () => {
		expect(stringIsValidPostcodeFormat('a11aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('a111aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa11aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa111aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('a1a1aa')).toBe(true);
		expect(stringIsValidPostcodeFormat('aa1a1aa')).toBe(true);
	});

	it('returns false when passed null or undefined', () => {
		expect(stringIsValidPostcodeFormat(null)).toBe(false);
		expect(stringIsValidPostcodeFormat(undefined)).toBe(false);
	});

	it('returns false when passed a string not in valid UK postcode format', () => {
		// invalid separator
		expect(stringIsValidPostcodeFormat('A1-1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1_1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1.1AA')).toBe(false);

		// invalid outward code
		expect(stringIsValidPostcodeFormat('AA 1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('11 1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('1A 1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('1 1AA')).toBe(false);
		expect(stringIsValidPostcodeFormat('A 1AA')).toBe(false);

		// invalid inward code
		expect(stringIsValidPostcodeFormat('A1 AAA')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1 AA1')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1 A11')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1 111')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1 11A')).toBe(false);
		expect(stringIsValidPostcodeFormat('A1 1A')).toBe(false);
	});
});

describe('url-utilities', () => {
	describe('isInternalUrl', () => {
		test('should return true for URL starting with a single slash', () => {
			const url = '/appeals-service/all-cases';
			const request = httpMocks.createRequest({
				method: 'GET',
				url: 'https://localhost/',
				secure: false,
				headers: {
					host: 'localhost'
				}
			});
			expect(isInternalUrl(url, request)).toBe(true);
		});

		test('should return true for fully qualified internal HTTP URL', () => {
			const url = 'http://localhost/appeals-service/all-cases';

			const request = httpMocks.createRequest({
				method: 'GET',
				url: 'http://localhost/',
				secure: false,
				headers: {
					host: 'localhost'
				}
			});

			expect(isInternalUrl(url, request)).toBe(true);
		});

		test('should return true for fully qualified internal HTTPS URL', () => {
			const url = 'https://localhost/appeals-service/all-cases';
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				}
			});
			expect(isInternalUrl(url, request)).toBe(true);
		});

		test('should return false for external URL', () => {
			const url = 'https://external-phishing-url.com';
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/',
				secure: true,
				headers: {
					host: 'localhost'
				}
			});
			expect(isInternalUrl(url, request)).toBe(false);
		});

		test('should return false for an invalid URL', () => {
			const url = '://bad.url';
			const request = httpMocks.createRequest({
				method: 'GET',
				url: 'http://localhost',
				secure: false,
				headers: {
					host: 'localhost'
				}
			});
			expect(isInternalUrl(url, request)).toBe(false);
		});

		test('should handle URLs without protocols', () => {
			const url = '//localhost/appeals-service/all-cases';
			const request = httpMocks.createRequest({
				method: 'GET',
				url: 'http://localhost/appeals-service/all-cases',
				secure: false,
				headers: {
					host: 'localhost'
				}
			});
			expect(isInternalUrl(url, request)).toBe(true);
		});
	});

	describe('getOriginPathname', () => {
		it('should return the pathname for a standard URL', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				originalUrl: '/appeals-service/all-cases'
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/appeals-service/all-cases');
		});

		it('should return the pathname for a URL with query parameters', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases?search=test',
				secure: true,
				headers: {
					host: 'localhost'
				},
				originalUrl: '/appeals-service/all-cases?search=test'
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/appeals-service/all-cases');
		});

		it('should return the pathname for a URL with hash parameters', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases#section1',
				secure: true,
				headers: {
					host: 'localhost'
				},
				originalUrl: '/appeals-service/all-cases#section1'
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/appeals-service/all-cases');
		});

		it('should return the pathname for an HTTP URL', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: false,
				headers: {
					host: 'localhost'
				},
				originalUrl: '/appeals-service/all-cases'
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/appeals-service/all-cases');
		});

		it('should return the pathname for a URL with port', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost:3000'
				},
				originalUrl: '/appeals-service/all-cases'
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/appeals-service/all-cases');
		});

		it('should handle empty originalUrl gracefully', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/',
				secure: true,
				headers: {
					host: 'localhost'
				},
				originalUrl: ''
			});

			const result = getOriginPathname(request);

			expect(result).toBe('/');
		});
	});

	describe('safeRedirect', () => {
		it('should redirect to the provided internal URL', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				protocol: 'https',
				originalUrl: '/appeals-service/all-cases'
			});
			const response = httpMocks.createResponse();
			const url = '/appeals-service/new-case';

			safeRedirect(request, response, url);

			expect(response._getRedirectUrl()).toBe('/appeals-service/new-case');
		});

		it('should redirect to the homepage if the URL is external', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				protocol: 'https',
				originalUrl: '/appeals-service/all-cases'
			});
			const response = httpMocks.createResponse();
			const url = 'https://external-phishing-url.com';

			safeRedirect(request, response, url);

			expect(response._getRedirectUrl()).toBe('/');
		});

		it('should redirect to the homepage if the URL is a protocol-relative URL', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				protocol: 'https',
				originalUrl: '/appeals-service/all-cases'
			});
			const response = httpMocks.createResponse();
			const url = '//localhost/appeals-service/new-case';

			safeRedirect(request, response, url);

			expect(response._getRedirectUrl()).toBe('//localhost/appeals-service/new-case');
		});

		it('should handle invalid URLs by redirecting to the homepage', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				protocol: 'https',
				originalUrl: '/appeals-service/all-cases'
			});
			const response = httpMocks.createResponse();
			const url = '://bad.url';

			safeRedirect(request, response, url);

			expect(response._getRedirectUrl()).toBe('/');
		});

		it('should redirect to the homepage if the provided URL is null, undefined, or an empty string', () => {
			const request = httpMocks.createRequest({
				method: 'GET',
				url: '/appeals-service/all-cases',
				secure: true,
				headers: {
					host: 'localhost'
				},
				protocol: 'https',
				originalUrl: '/appeals-service/all-cases'
			});
			const response = httpMocks.createResponse();
			const url = '';

			safeRedirect(request, response, url);

			expect(response._getRedirectUrl()).toBe('/');
		});
	});

	describe('addBackLinkQueryToUrl', () => {
		it('should append a backUrl query with the URI-encoded originalUrl value from the supplied request to the supplied url', () => {
			expect(
				addBackLinkQueryToUrl(
					// @ts-ignore
					{ originalUrl: '/test/original/url?withOwnQuery=true' },
					'/supplied/url'
				)
			).toBe('/supplied/url?backUrl=%2Ftest%2Foriginal%2Furl%3FwithOwnQuery%3Dtrue');
		});

		it('should move the URL hash to the end of the URL (after the query string) if a hash is present in the supplied URL', () => {
			expect(
				addBackLinkQueryToUrl(
					// @ts-ignore
					{ originalUrl: '/test/original/url?withOwnQuery=true' },
					'/supplied/url#with-hash'
				)
			).toBe('/supplied/url?backUrl=%2Ftest%2Foriginal%2Furl%3FwithOwnQuery%3Dtrue#with-hash');
		});

		it('should append a backUrl query and keep any existing query string intact', () => {
			expect(
				addBackLinkQueryToUrl(
					// @ts-ignore
					{ originalUrl: '/test/original/url?withOwnQuery=true' },
					'/supplied/url?originalQuery1=true&originalQuery2=false'
				)
			).toBe(
				'/supplied/url?originalQuery1=true&originalQuery2=false&backUrl=%2Ftest%2Foriginal%2Furl%3FwithOwnQuery%3Dtrue'
			);
		});

		it('should append a backUrl query and keep any existing query string intact and add the hash', () => {
			expect(
				addBackLinkQueryToUrl(
					// @ts-ignore
					{ originalUrl: '/test/original/url?withOwnQuery=true' },
					'/supplied/url?originalQuery1=true&originalQuery2=false#with-hash'
				)
			).toBe(
				'/supplied/url?originalQuery1=true&originalQuery2=false&backUrl=%2Ftest%2Foriginal%2Furl%3FwithOwnQuery%3Dtrue#with-hash'
			);
		});
	});

	describe('preserveQueryString', () => {
		it('should return the supplied URL with the query string intact', () => {
			expect(
				preserveQueryString(
					// @ts-ignore
					{ originalUrl: '/original/url/with-query?testQuery=someValue' },
					'/test/url/with-query'
				)
			).toBe('/test/url/with-query?testQuery=someValue');
		});

		it('should return the unaltered URL with no query string', () => {
			expect(
				preserveQueryString(
					// @ts-ignore
					{ originalUrl: '/original/url/with-query' },
					'/test/url/with-query'
				)
			).toBe('/test/url/with-query');
		});

		it('should return the supplied URL with the query string intact and no hash', () => {
			expect(
				preserveQueryString(
					// @ts-ignore
					{ originalUrl: '/original/url/with-query?testQuery=someValue' },
					'/new/url/with-query#with-hash'
				)
			).toBe('/new/url/with-query?testQuery=someValue');
		});

		it('should return the supplied URL with the query string except for the excluded query params', () => {
			expect(
				preserveQueryString(
					// @ts-ignore
					{ originalUrl: '/original/url/with-query?testQuery=someValue&excludeQuery=true' },
					'/test/url/with-query',
					{ exclude: ['excludeQuery'] }
				)
			).toBe('/test/url/with-query?testQuery=someValue');
		});
	});

	describe('getBackLinkUrlFromQuery', () => {
		it('should return undefined if the supplied request.query does not contain a backUrl property', () => {
			// @ts-ignore
			expect(getBackLinkUrlFromQuery({ query: {} })).toBe(undefined);
		});
		it('should return the URI-decoded value from the supplied request.query.backUrl property, if request.query contains a backUrl property', () => {
			const query = { backUrl: '%2Ftest%2Foriginal%2Furl%3FwithOwnQuery%3Dtrue' };
			expect(
				// @ts-ignore
				getBackLinkUrlFromQuery({ query })
			).toBe('/test/original/url?withOwnQuery=true');
		});
	});

	describe('stripQueryString', () => {
		it('should return the supplied URL with the query string removed, if there is a query string', () => {
			expect(stripQueryString('/test/url/with-query?testQuery=someValue')).toBe(
				'/test/url/with-query'
			);
		});
		it('should return the supplied URL with the whole query string removed, if there is a query string whose value contains another query string', () => {
			expect(
				stripQueryString('/test/url/with-query?testQuery=someValue/with/?additionalQuery=true')
			).toBe('/test/url/with-query');
		});
		it('should return the supplied URL intact, if there is no query string', () => {
			expect(stripQueryString('/test/url/without-query')).toBe('/test/url/without-query');
		});
	});
});

describe('appeal-status', () => {
	describe('mapStatusText', () => {
		const appealTypesNotIncludingHouseholderAndS78 = [
			APPEAL_TYPE.HOUSEHOLDER,
			APPEAL_TYPE.S78,
			APPEAL_TYPE.ENFORCEMENT_NOTICE,
			APPEAL_TYPE.ENFORCEMENT_LISTED_BUILDING,
			APPEAL_TYPE.DISCONTINUANCE_NOTICE,
			APPEAL_TYPE.ADVERTISEMENT,
			APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY,
			APPEAL_TYPE.PLANNING_OBLIGATION,
			APPEAL_TYPE.AFFORDABLE_HOUSING_OBLIGATION,
			APPEAL_TYPE.CALL_IN_APPLICATION,
			APPEAL_TYPE.LAWFUL_DEVELOPMENT_CERTIFICATE,
			APPEAL_TYPE.PLANNED_LISTED_BUILDING,
			APPEAL_TYPE.COMMERCIAL
		];

		for (const appealType of appealTypesNotIncludingHouseholderAndS78) {
			it(`should return the appealStatus unchanged if the appeal type is anything other than HAS or S78 (${appealType})`, () => {
				expect(
					mapStatusText(
						APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
						appealType,
						APPEAL_CASE_PROCEDURE.WRITTEN
					)
				).toBe(APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER);
			});
		}

		const appealStatusesNotIncludingEventStatuses = [
			APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
			APPEAL_CASE_STATUS.AWAITING_TRANSFER,
			APPEAL_CASE_STATUS.CLOSED,
			APPEAL_CASE_STATUS.COMPLETE,
			APPEAL_CASE_STATUS.EVIDENCE,
			APPEAL_CASE_STATUS.FINAL_COMMENTS,
			APPEAL_CASE_STATUS.INVALID,
			APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
			APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
			APPEAL_CASE_STATUS.READY_TO_START,
			APPEAL_CASE_STATUS.STATEMENTS,
			APPEAL_CASE_STATUS.TRANSFERRED,
			APPEAL_CASE_STATUS.VALIDATION,
			APPEAL_CASE_STATUS.WITHDRAWN,
			APPEAL_CASE_STATUS.WITNESSES
		];

		for (const appealStatus of appealStatusesNotIncludingEventStatuses) {
			it(`should return the appealStatus unchanged (${appealStatus}) if appealStatus is not an event status`, () => {
				expect(mapStatusText(appealStatus, APPEAL_TYPE.S78, APPEAL_CASE_PROCEDURE.WRITTEN)).toBe(
					appealStatus
				);
			});
		}

		it(`should return 'site_visit_ready_to_set_up' if appealStatus is 'event' and appealProcedureType is undefined`, () => {
			expect(mapStatusText(APPEAL_CASE_STATUS.EVENT, APPEAL_TYPE.S78, undefined)).toBe(
				'site_visit_ready_to_set_up'
			);
		});

		it(`should return 'site_visit_ready_to_set_up' if appealStatus is 'event' and appealProcedureType is 'written'`, () => {
			expect(
				mapStatusText(APPEAL_CASE_STATUS.EVENT, APPEAL_TYPE.S78, APPEAL_CASE_PROCEDURE.WRITTEN)
			).toBe('site_visit_ready_to_set_up');
		});

		it(`should return 'hearing_ready_to_set_up' if appealStatus is 'event' and appealProcedureType is 'hearing'`, () => {
			expect(
				mapStatusText(APPEAL_CASE_STATUS.EVENT, APPEAL_TYPE.S78, APPEAL_CASE_PROCEDURE.HEARING)
			).toBe('hearing_ready_to_set_up');
		});

		it(`should return 'inquiry_ready_to_set_up' if appealStatus is 'event' and appealProcedureType is 'inquiry'`, () => {
			expect(
				mapStatusText(APPEAL_CASE_STATUS.EVENT, APPEAL_TYPE.S78, APPEAL_CASE_PROCEDURE.INQUIRY)
			).toBe('inquiry_ready_to_set_up');
		});

		it(`should return 'awaiting_site_visit' if appealStatus is 'awaiting_event' and appealProcedureType is undefined`, () => {
			expect(mapStatusText(APPEAL_CASE_STATUS.AWAITING_EVENT, APPEAL_TYPE.S78, undefined)).toBe(
				'awaiting_site_visit'
			);
		});

		it(`should return 'awaiting_site_visit' if appealStatus is 'awaiting_event' and appealProcedureType is 'written'`, () => {
			expect(
				mapStatusText(
					APPEAL_CASE_STATUS.AWAITING_EVENT,
					APPEAL_TYPE.S78,
					APPEAL_CASE_PROCEDURE.WRITTEN
				)
			).toBe('awaiting_site_visit');
		});

		it(`should return 'awaiting_hearing' if appealStatus is 'awaiting_event' and appealProcedureType is 'hearing'`, () => {
			expect(
				mapStatusText(
					APPEAL_CASE_STATUS.AWAITING_EVENT,
					APPEAL_TYPE.S78,
					APPEAL_CASE_PROCEDURE.HEARING
				)
			).toBe('awaiting_hearing');
		});

		it(`should return 'awaiting_inquiry' if appealStatus is 'awaiting_event' and appealProcedureType is 'inquiry'`, () => {
			expect(
				mapStatusText(
					APPEAL_CASE_STATUS.AWAITING_EVENT,
					APPEAL_TYPE.S78,
					APPEAL_CASE_PROCEDURE.INQUIRY
				)
			).toBe('awaiting_inquiry');
		});
	});

	describe('mapAppealProcedureTypeToEventName', () => {
		it(`should return 'hearing' if appealProcedureType is 'hearing'`, () => {
			expect(mapAppealProcedureTypeToEventName(APPEAL_CASE_PROCEDURE.HEARING)).toBe('hearing');
		});

		it(`should return 'inquiry' if appealProcedureType is 'inquiry'`, () => {
			expect(mapAppealProcedureTypeToEventName(APPEAL_CASE_PROCEDURE.INQUIRY)).toBe('inquiry');
		});

		it(`should return 'site_visit' if appealProcedureType is 'written'`, () => {
			expect(mapAppealProcedureTypeToEventName(APPEAL_CASE_PROCEDURE.WRITTEN)).toBe('site_visit');
		});

		it(`should return 'site_visit' if appealProcedureType is undefined`, () => {
			expect(mapAppealProcedureTypeToEventName(undefined)).toBe('site_visit');
		});
	});

	describe('mapStatusFilterLabel', () => {
		const testCases = [
			{
				appealStatus: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER,
				expectedLabel: 'Assign case officer'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.AWAITING_EVENT,
				expectedLabel: 'Awaiting event'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.AWAITING_TRANSFER,
				expectedLabel: 'Awaiting transfer'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.CLOSED,
				expectedLabel: 'Closed'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.COMPLETE,
				expectedLabel: 'Complete'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.EVENT,
				expectedLabel: 'Event ready to set up'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.EVIDENCE,
				expectedLabel: 'Evidence'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.INVALID,
				expectedLabel: 'Invalid'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.ISSUE_DETERMINATION,
				expectedLabel: 'Issue decision'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE,
				expectedLabel: 'LPA questionnaire'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.READY_TO_START,
				expectedLabel: 'Ready to start'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.STATEMENTS,
				expectedLabel: 'Statements'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.TRANSFERRED,
				expectedLabel: 'Transferred'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.VALIDATION,
				expectedLabel: 'Validation'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.WITHDRAWN,
				expectedLabel: 'Withdrawn'
			},
			{
				appealStatus: APPEAL_CASE_STATUS.WITNESSES,
				expectedLabel: 'Witnesses'
			}
		];

		for (const testCase of testCases) {
			it(`should return '${testCase.expectedLabel}' if appealStatus is '${testCase.appealStatus}'`, () => {
				expect(mapStatusFilterLabel(testCase.appealStatus)).toBe(testCase.expectedLabel);
			});
		}
	});
});
