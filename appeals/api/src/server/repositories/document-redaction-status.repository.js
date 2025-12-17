import { databaseConnector } from '#utils/database-connector.js';
import { DATABASE_ORDER_BY_ASC } from '@pins/appeals/constants/support.js';

/** @typedef {import('@pins/appeals.api').Schema.DocumentRedactionStatus} DocumentRedactionStatus */
/**
 * @typedef {import('#db-client/client.ts').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @returns {PrismaPromise<DocumentRedactionStatus[]>}
 */
const getAllDocumentRedactionStatuses = () =>
	databaseConnector.documentRedactionStatus.findMany({
		orderBy: {
			id: DATABASE_ORDER_BY_ASC
		}
	});

export default { getAllDocumentRedactionStatuses };
