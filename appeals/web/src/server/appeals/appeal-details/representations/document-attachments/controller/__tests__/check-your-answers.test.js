// @ts-nocheck
import {
	APPEAL_REPRESENTATION_TYPE,
	REPRESENTATION_ADDED_AS_DOCUMENT
} from '@pins/appeals/constants/common.js';
import { APPEAL_REPRESENTATION_STATUS } from '@planning-inspectorate/data-model';
import {
	buildPayload,
	getRepresentationType,
	onlySingularRepresentationAllowed
} from '../check-your-answers.js';

describe('check-your-answers controller utilities', () => {
	describe('buildPayload', () => {
		const documentGuid = 'test-guid';
		const redactionStatus = 'redacted';
		const createdDate = '2023-01-01T00:00:00.000Z';
		const representedId = 123;

		const testCases = [
			{ type: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT, source: 'citizen' },
			{ type: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT, source: 'citizen' },
			{ type: APPEAL_REPRESENTATION_TYPE.APPELLANT_PROOFS_EVIDENCE, source: 'citizen' },
			{
				type: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
				source: 'citizen',
				hasRepresentedId: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_PROOFS_EVIDENCE,
				source: 'citizen',
				hasRepresentedId: true
			},
			{ type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT, source: 'lpa' },
			{ type: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT, source: 'lpa' },
			{ type: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE, source: 'lpa' },
			{ type: APPEAL_REPRESENTATION_TYPE.COMMENT, source: 'lpa' }
		];

		test.each(testCases)(
			'should build payload with source "$source" for $type',
			({ type, source, hasRepresentedId }) => {
				const result = buildPayload(
					type,
					documentGuid,
					redactionStatus,
					createdDate,
					hasRepresentedId ? representedId : undefined
				);

				expect(result).toEqual({
					attachments: [documentGuid],
					redactionStatus,
					source,
					dateCreated: createdDate,
					representationText: REPRESENTATION_ADDED_AS_DOCUMENT,
					...(hasRepresentedId ? { representedId } : {})
				});
			}
		);
	});

	describe('getRepresentationType', () => {
		const testCases = [
			{
				url: '/appeals-service/appeal-details/1/final-comments/lpa/add-document',
				expected: 'lpa_final_comment'
			},
			{
				url: '/appeals-service/appeal-details/1/final-comments/appellant/add-document',
				expected: 'appellant_final_comment'
			},
			{
				url: '/appeals-service/appeal-details/1/rule-6-party-statement/1/add-document',
				expected: 'rule_6_party_statement'
			},
			{
				url: '/appeals-service/appeal-details/1/proof-of-evidence/rule-6-party/1/add-document',
				expected: 'rule_6_party_proofs_evidence'
			},
			{
				url: '/appeals-service/appeal-details/1/lpa-statement/add-document',
				expected: 'lpa_statement'
			},
			{
				url: '/appeals-service/appeal-details/1/appellant-case/add-document',
				expected: 'appellant_case'
			}
		];

		test.each(testCases)('should return "$expected" for URL: $url', ({ url, expected }) => {
			expect(getRepresentationType(url)).toBe(expected);
		});
	});

	describe('onlySingularRepresentationAllowed', () => {
		const testCases = [
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.PUBLISHED,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.INVALID,
				expected: false
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_STATEMENT,
				status: undefined,
				expected: false
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.APPELLANT_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_FINAL_COMMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.APPELLANT_FINAL_COMMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: true
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.RULE_6_PARTY_STATEMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: false
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.COMMENT,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: false
			},
			{
				type: APPEAL_REPRESENTATION_TYPE.LPA_PROOFS_EVIDENCE,
				status: APPEAL_REPRESENTATION_STATUS.VALID,
				expected: false
			}
		];

		test.each(testCases)(
			'should return $expected for type $type and status $status',
			({ type, status, expected }) => {
				expect(onlySingularRepresentationAllowed(type, status)).toBe(expected);
			}
		);
	});
});
