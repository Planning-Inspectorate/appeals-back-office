// @ts-nocheck
import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';
import { buildRows } from '../build-rows.js';

describe('buildRows', () => {
	const mockRowBuilders = {
		originalApplicationForm: (data) => ({
			key: 'Application form',
			value: data.applicationFormValue
		}),
		appellantStatement: (data) => ({ key: 'Appeal statement', value: data.appealStatementValue }),
		changedDescription: (data) => ({
			key: 'Changed description',
			value: data.changedDescriptionValue
		})
	};

	const mockRowKeys = {
		[APPEAL_TYPE.HOUSEHOLDER]: [
			'originalApplicationForm',
			{ key: 'appellantStatement', condition: (data) => data.showStatement },
			{ key: 'changedDescription', condition: (data) => data.showChangedDescription }
		],
		[APPEAL_TYPE.S78_EXPEDITED]: ['originalApplicationForm', 'appellantStatement']
	};

	it('should return an empty array if template data is missing or lacks appealType', () => {
		expect(buildRows(null, mockRowBuilders, mockRowKeys)).toEqual([]);
		expect(buildRows({}, mockRowBuilders, mockRowKeys)).toEqual([]);
	});

	it('should build rows correctly based on simple string keys', () => {
		const templateData = {
			appealType: APPEAL_TYPE.HOUSEHOLDER,
			applicationFormValue: 'form.pdf',
			showStatement: false,
			showChangedDescription: false
		};
		const result = buildRows(templateData, mockRowBuilders, mockRowKeys);

		expect(result).toEqual([{ key: 'Application form', value: 'form.pdf' }]);
	});

	it('should include conditional rows when condition is met (returns true)', () => {
		const templateData = {
			appealType: APPEAL_TYPE.HOUSEHOLDER,
			applicationFormValue: 'form.pdf',
			appealStatementValue: 'statement.pdf',
			showStatement: true,
			showChangedDescription: false
		};
		const result = buildRows(templateData, mockRowBuilders, mockRowKeys);

		expect(result).toEqual([
			{ key: 'Application form', value: 'form.pdf' },
			{ key: 'Appeal statement', value: 'statement.pdf' }
		]);
	});

	it('should use S78_EXPEDITED keys if templateData.isS78Expedited is true', () => {
		const templateData = {
			appealType: APPEAL_TYPE.S78,
			isS78Expedited: true,
			applicationFormValue: 'form.pdf',
			appealStatementValue: 'statement.pdf'
		};
		const result = buildRows(templateData, mockRowBuilders, mockRowKeys);

		expect(result).toEqual([
			{ key: 'Application form', value: 'form.pdf' },
			{ key: 'Appeal statement', value: 'statement.pdf' }
		]);
	});

	it('should skip row if builder is not a function', () => {
		const badRowKeys = {
			[APPEAL_TYPE.HOUSEHOLDER]: ['originalApplicationForm', 'rowDoesNotExist']
		};
		const templateData = {
			appealType: APPEAL_TYPE.HOUSEHOLDER,
			applicationFormValue: 'form.pdf'
		};
		const result = buildRows(templateData, mockRowBuilders, badRowKeys);

		expect(result).toEqual([{ key: 'Application form', value: 'form.pdf' }]);
	});
});
