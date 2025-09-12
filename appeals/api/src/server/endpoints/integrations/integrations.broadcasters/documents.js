import config from '#config/config.js';
import { eventClient } from '#infrastructure/event-client.js';
import { producers } from '#infrastructure/topics.js';
import { mapDocumentEntity } from '#mappers/integration/map-document-entity.js';
import { databaseConnector } from '#utils/database-connector.js';
import pino from '#utils/logger.js';
import { ODW_SYSTEM_ID } from '@pins/appeals/constants/common.js';
import { REP_ATTACHMENT_DOCTYPE } from '@pins/appeals/constants/documents.js';
import { APPEAL_DOCUMENT_TYPE } from '@planning-inspectorate/data-model';
import { schemas, validateFromSchema } from '../integrations.validators.js';

const entityInfo = {
	name: 'AppealDocumentMetadata'
};

/**
 *
 * @param {string} documentId
 * @param {number} version
 * @param {string} updateType
 * @returns
 */
export const broadcastDocument = async (documentId, version, updateType) => {
	if (!config.serviceBusEnabled && config.NODE_ENV !== 'development') {
		return false;
	}

	const document = await databaseConnector.document.findUnique({
		where: { guid: documentId },
		include: {
			case: {
				include: {
					appealType: true
				}
			},
			versions: {
				where: {
					version
				},
				include: {
					redactionStatus: true,
					representation: {
						include: {
							representation: true
						}
					}
				}
			}
		}
	});

	if (!document || document.versions?.length != 1) {
		pino.error(
			`Trying to broadcast info for document ${documentId} version ${version}, but it was not found.`
		);
		return false;
	}

	// @ts-ignore
	const msg = mapDocumentEntity(document);
	if (!msg) {
		return false;
	}

	const validationResult = await validateFromSchema(schemas.events.document, msg);
	if (validationResult !== true && validationResult.errors) {
		const errorDetails = validationResult.errors?.map(
			(e) => `${e.instancePath || '/'}: ${e.message}`
		);

		pino.error(`Error validating ${entityInfo.name} entity: ${errorDetails}`);
		return false;
	}

	const latestDocumentVersion = document.versions?.length === 1 ? document.versions[0] : null;

	// wait to broadcast representationAttachments if document type is not known
	if (
		latestDocumentVersion?.documentType === REP_ATTACHMENT_DOCTYPE &&
		msg.documentType === APPEAL_DOCUMENT_TYPE.UNCATEGORISED
	) {
		return false;
	}

	const topic = producers.boDocument;
	const res = await eventClient.sendEvents(topic, [msg], updateType, {
		entityType: entityInfo.name,
		sourceSystem: ODW_SYSTEM_ID
	});

	if (!res) {
		return false;
	}

	return true;
};
