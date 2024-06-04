import { databaseConnector } from '#utils/database-connector.js';
import appealRepository from './appeal.repository.js';
import commonRepository from './common.repository.js';

/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseRequest} UpdateAppellantCaseRequest */
/** @typedef {import('@pins/appeals.api').Appeals.UpdateAppellantCaseValidationOutcome} UpdateAppellantCaseValidationOutcome */
/**
 * @typedef {import('#db-client').Prisma.PrismaPromise<T>} PrismaPromise
 * @template T
 */

/**
 * @param {number} id
 * @param {UpdateAppellantCaseRequest} data
 * @returns {PrismaPromise<object>}
 */
const updateAppellantCaseById = (id, data) =>
	databaseConnector.appellantCase.update({
		where: { id },
		data
	});

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
				appealRepository.updateAppealById(appealId, { caseExtensionDate: new Date(appealDueDate).toISOString() })
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
			appealRepository.updateAppealById(appealId, { caseValidDate: new Date(validAt).toISOString() })
		);
	}

	const tx = databaseConnector.$transaction(transaction);
	return tx;
};

export default { updateAppellantCaseById, updateAppellantCaseValidationOutcome };
