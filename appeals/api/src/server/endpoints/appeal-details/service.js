import { contextEnum } from '#mappers/context-enum.js';
import { mapCase } from '#mappers/mapper-factory.js';
import { getAllAppealTypes } from '#repositories/appeal-type.repository.js';
import { getCache, setCache } from '#utils/cache-data.js';

/** @typedef {import('@pins/appeals.api').Schema.Appeal} Appeal */
/** @typedef {import('@pins/appeals.api').Schema.AppealType} AppealType */

/**
 *
 * @param {{ appeal:Appeal }} request
 * @returns
 */
const loadAndFormatAppeal = async ({ appeal }) => {
	const appealTypes = await loadAppealTypes();
	const context = contextEnum.appealDetails;

	return mapCase({ appeal, appealTypes, context });
};

/**
 * @returns { Promise<AppealType[]> }
 */
const loadAppealTypes = async () => {
	const cacheKey = 'appealTypesCache';

	if (getCache(cacheKey) == null) {
		const data = await getAllAppealTypes();
		setCache(cacheKey, data);
	}

	return getCache(cacheKey);
};

export const service = {
	loadAndFormatAppeal
};
