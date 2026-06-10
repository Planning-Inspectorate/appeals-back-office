import { APPEAL_TYPE } from '@pins/appeals/constants/common.js';

export const buildRows = (templateData, rowBuilders, rowKeys) => {
	if (!templateData || !templateData.appealType) {
		console.warn('Template data or appeal type is missing. Cannot build constraints rows.');
		return [];
	}
	const isS78Expedited = templateData.isS78Expedited || false;
	const appealType = isS78Expedited ? APPEAL_TYPE.S78_EXPEDITED : templateData.appealType;

	const constraintRowKeys = rowKeys[appealType] || [];

	if (constraintRowKeys.length === 0) {
		console.warn(`No row keys defined for appeal type: ${appealType}`);
	}

	return constraintRowKeys
		.map((key) => {
			const rowBuilder = rowBuilders[key];
			if (typeof rowBuilder !== 'function') {
				console.warn(`No row builder function found for key: ${key}`);
				return null;
			}
			return rowBuilder(templateData);
		})
		.filter(Boolean);
};
