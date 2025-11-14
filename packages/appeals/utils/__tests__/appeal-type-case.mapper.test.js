import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
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
});
