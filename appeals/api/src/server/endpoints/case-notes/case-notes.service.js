import * as caseNotesRepository from '#repositories/case-notes.repository.js';
import userRepository from '#repositories/user.repository.js';
import logger from '#utils/logger.js';

/** @typedef {import('@pins/appeals.api').Schema.CaseNote} CaseNote */

/**
 *
 * @param {string} appealId
 * @param {string} azureAdUserId
 * @param {string} comment
 */
const postCaseNote = async (appealId, azureAdUserId, comment) => {
	try {
		const { id: userId } = await userRepository.findOrCreateUser(azureAdUserId);

		if (userId) {
			return await caseNotesRepository.postCaseNote({
				caseId: Number(appealId),
				comment,
				userId,
				createdAt: new Date(),
				archived: false
			});
		}
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to create comment');
	}
};

export { postCaseNote };
