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
 * @returns {Promise<object>}
 */
const updateAppellantCaseValidationOutcome = ({
	appellantCaseId,
	validationOutcomeId,
	incompleteReasons,
	invalidReasons,
	appealId,
	validAt
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
				manyToManyRelationTable: 'appellantCaseIncompleteReasonOnAppellantCase',
				incompleteInvalidReasonTextTable: 'appellantCaseIncompleteReasonText',
				data: incompleteReasons
			})
		);
	}

	if (invalidReasons) {
		transaction.push(
			...commonRepository.createIncompleteInvalidReasons({
				id: appellantCaseId,
				relationOne: 'appellantCaseId',
				relationTwo: 'appellantCaseInvalidReasonId',
				manyToManyRelationTable: 'appellantCaseInvalidReasonOnAppellantCase',
				incompleteInvalidReasonTextTable: 'appellantCaseInvalidReasonText',
				data: invalidReasons
			})
		);
	}

	if (appealId && validAt) {
		transaction.push(
			appealRepository.updateAppealById(appealId, { validAt: validAt.toISOString() })
		);
	}

	return databaseConnector.$transaction(transaction);
};

export default { updateAppellantCaseById, updateAppellantCaseValidationOutcome };
