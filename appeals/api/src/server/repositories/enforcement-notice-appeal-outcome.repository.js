import { databaseConnector } from '#utils/database-connector.js';

/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */
/** @typedef {import('@pins/appeals.api').Schema.EnforcementNoticeAppealOutcome} EnforcementNoticeAppealOutcome */

/**
 * @param {import('#db-client/client.ts').Prisma.EnforcementNoticeAppealOutcomeWhereUniqueInput} where
 * @param {import('#db-client/client.ts').Prisma.EnforcementNoticeAppealOutcomeCreateInput} data
 * @returns {PrismaPromise<EnforcementNoticeAppealOutcome>}
 */
const upsertEnforcementNoticeAppealOutcome = (where, data) => {
	return databaseConnector.enforcementNoticeAppealOutcome.upsert({
		where,
		update: data,
		create: data
	});
};

export default {
	upsertEnforcementNoticeAppealOutcome
};
