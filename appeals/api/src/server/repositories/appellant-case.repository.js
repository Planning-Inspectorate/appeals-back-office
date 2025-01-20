import { databaseConnector } from '#utils/database-connector.js';
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
 * @returns {PrismaPromise<object>}
 */
const updateAppellantCaseById = (id, data) => {
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
		return databaseConnector.appellantCase.update({
			where: { id },
			data: {
				knowsOtherOwnersId: null
			}
		});
	}

	return databaseConnector.appellantCase.update({
		where: { id },
		// @ts-ignore
		data: {
			...data,
			knowsOtherOwners
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
		updateAppellantCaseById(appellantCaseId, {
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

	const tx = databaseConnector.$transaction(transaction);
	return tx;
};

export default { updateAppellantCaseById, updateAppellantCaseValidationOutcome };
