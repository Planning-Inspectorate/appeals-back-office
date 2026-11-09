import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { APPEAL_CASE_TYPE } from '@planning-inspectorate/data-model';
import {
	appealCaseTypeToAppealTypeMapper,
	appealTypeToAppealCaseTypeMapper
} from '../appeal-type-case.mapper';

describe('mappers', () => {
	test('appealTypeToAppealCaseTypeMapper should return an empty string for an invalid appeal type', () => {
		const testMap = appealTypeToAppealCaseTypeMapper('Not a valid appeal type');
		expect(testMap).toBe('');
	});

	test('appealCaseTypeToAppealTypeMapper should return an empty string for an invalid appeal type', () => {
		const testMap = appealCaseTypeToAppealTypeMapper('Not a valid case appeal type');
		expect(testMap).toBe('');
	});

	test('combining both mappers for a valid appeal type returns the same appeal type', () => {
		const appealType = APPEAL_TYPE.HOUSEHOLDER;
		const returnedAppealType = appealCaseTypeToAppealTypeMapper(
			appealTypeToAppealCaseTypeMapper(appealType)
		);
		expect(returnedAppealType).toBe(appealType);
	});

	test('appealTypeToAppealCaseTypeMapper maps generic appeal types correctly', () => {
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.DISCONTINUANCE_NOTICE)).toBe(
			APPEAL_CASE_TYPE.G
		);
		expect(appealTypeToAppealCaseTypeMapper('Discontinuance notice')).toBe(APPEAL_CASE_TYPE.G);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY)).toBe(
			APPEAL_CASE_TYPE.L
		);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.PLANNING_OBLIGATION)).toBe(
			APPEAL_CASE_TYPE.Q
		);
		expect(appealTypeToAppealCaseTypeMapper('Section 106 agreement')).toBe(APPEAL_CASE_TYPE.Q);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.ENVIRONMENTAL)).toBe(APPEAL_CASE_TYPE.ENV);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.TREE_PRESERVATION_ORDER)).toBe(
			APPEAL_CASE_TYPE.TPO
		);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.TREE_REPLACEMENT_NOTICE)).toBe(
			APPEAL_CASE_TYPE.TRN
		);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.HIGH_HEDGES)).toBe(APPEAL_CASE_TYPE.HH);
		expect(appealTypeToAppealCaseTypeMapper(APPEAL_TYPE.HEDGEROWS)).toBe(APPEAL_CASE_TYPE.HR);
	});

	test('appealCaseTypeToAppealTypeMapper maps G, L, Q and generic case types correctly', () => {
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.G)).toBe(
			APPEAL_TYPE.DISCONTINUANCE_NOTICE
		);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.L)).toBe(
			APPEAL_TYPE.COMMUNITY_INFRASTRUCTURE_LEVY
		);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.Q)).toBe(
			APPEAL_TYPE.PLANNING_OBLIGATION
		);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.TPO)).toBe(
			APPEAL_TYPE.TREE_PRESERVATION_ORDER
		);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.TRN)).toBe(
			APPEAL_TYPE.TREE_REPLACEMENT_NOTICE
		);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.HH)).toBe(APPEAL_TYPE.HIGH_HEDGES);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.HR)).toBe(APPEAL_TYPE.HEDGEROWS);
		expect(appealCaseTypeToAppealTypeMapper(APPEAL_CASE_TYPE.ENV)).toBe(APPEAL_TYPE.ENVIRONMENTAL);
	});
});
