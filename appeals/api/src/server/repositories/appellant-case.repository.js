import { databaseConnector } from '#utils/database-connector.js';
import logger from '#utils/logger.js';
import appealRepository from './appeal.repository.js';
import commonRepository from './common.repository.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseValidationOutcome} UpdateAppellantCaseValidationOutcome */
/** @typedef {import('#db-client').Prisma.AppellantCaseUpdateInput} AppellantCaseUpdateInput */
/** @typedef {import('@pins/appeals.api').Api.AppellantCaseUpdateRequest} AppellantCaseUpdateRequest */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {AppellantCaseUpdateRequest} data
 * @returns {Promise<PrismaPromise<object>>}
 */
const updateAppellantCaseById = async (id, data) => {
	const { advertInPosition, highwayLand, ...mainUpdates } = data;

	const knowsOtherOwners =
		data.knowsOtherOwners !== undefined
			? data.knowsOtherOwners === null
				? null
				: {
						connect: {
							key: data.knowsOtherOwners.toLowerCase()
						}
				  }
			: undefined;

	if (knowsOtherOwners === null) {
		logger.info({ id }, 'removing knowsOtherOwners from appellant case');
		return databaseConnector.appellantCase.update({
			where: { id },
			data: {
				knowsOtherOwnersId: null
			}
		});
	}

	const transaction = [];

	transaction.push(
		updateAppellantCaseTable(id, {
			...mainUpdates,
			// @ts-ignore
			knowsOtherOwners
		})
	);

	const hasAdvertDetails =
		(advertInPosition !== undefined && advertInPosition !== null) ||
		(highwayLand !== undefined && highwayLand !== null);

	if (hasAdvertDetails) {
		logger.info({ id }, 'hasAdvertDetails update');
		logger.debug({ id, hasAdvertDetails }, `hasAdvertDetails update details`);
		const existing = await databaseConnector.appellantCaseAdvertDetails.findFirst({
			where: { appellantCaseId: id }
		});

		if (existing) {
			transaction.push(
				databaseConnector.appellantCaseAdvertDetails.update({
					where: { id: existing.id },
					data: {
						advertInPosition: advertInPosition ?? undefined,
						highwayLand: highwayLand ?? undefined
					}
				})
			);
		} else {
			transaction.push(
				databaseConnector.appellantCaseAdvertDetails.create({
					data: {
						appellantCaseId: id,
						advertInPosition: advertInPosition ?? false,
						highwayLand: highwayLand ?? false
					}
				})
			);
		}
	}

	return databaseConnector.$transaction(transaction);
};

/**
 * @param {number} id
 * @param {AppellantCaseUpdateRequest} data
 * @returns {PrismaPromise<object>}
 */
const updateAppellantCaseTable = (id, data) => {
	logger.info({ id }, 'appellant case update');
	logger.debug({ id, data }, 'appellant case update details');

	return databaseConnector.appellantCase.update({
		where: { id },
		// @ts-ignore
		data: {
			...data
		}
	});
};

/**
 * @param {UpdateAppellantCaseValidationOutcome} param0
 * @returns {Promise<object[]>}
 */
const updateAppellantCaseValidationOutcome = ({
	appellantCaseId,
	validationOutcomeId,
	incompleteReasons,
	invalidReasons,
	appealId,
	validAt,
	appealDueDate
}) => {
	const transaction = [
		updateAppellantCaseTable(appellantCaseId, {
			appellantCaseValidationOutcomeId: validationOutcomeId
		})
	];

	if (incompleteReasons) {
		transaction.push(
			...commonRepository.createIncompleteInvalidReasons({
				id: appellantCaseId,
				relationOne: 'appellantCaseId',
				relationTwo: 'appellantCaseIncompleteReasonId',
				manyToManyRelationTable: 'appellantCaseIncompleteReasonsSelected',
				incompleteInvalidReasonTextTable: 'appellantCaseIncompleteReasonText',
				data: incompleteReasons
			})
		);
		if (appealId && appealDueDate) {
			transaction.push(
				// @ts-ignore
				appealRepository.updateAppealById(appealId, {
					caseExtensionDate: new Date(appealDueDate).toISOString()
				})
			);
		}
	}

	if (invalidReasons) {
		transaction.push(
			...commonRepository.createIncompleteInvalidReasons({
				id: appellantCaseId,
				relationOne: 'appellantCaseId',
				relationTwo: 'appellantCaseInvalidReasonId',
				manyToManyRelationTable: 'appellantCaseInvalidReasonsSelected',
				incompleteInvalidReasonTextTable: 'appellantCaseInvalidReasonText',
				data: invalidReasons
			})
		);
	}

	if (appealId && validAt) {
		transaction.push(
			// @ts-ignore
			appealRepository.updateAppealById(appealId, {
				caseValidDate: new Date(validAt).toISOString()
			})
		);
	}

	// @ts-ignore
	const tx = databaseConnector.$transaction(transaction);
	return tx;
};

export default { updateAppellantCaseById, updateAppellantCaseValidationOutcome };
