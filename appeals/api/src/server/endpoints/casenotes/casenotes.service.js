import userRepository from "#repositories/user.repository.js"
import * as casenotesRepository from '#repositories/casenotes.repository.js';
import logger from "#utils/logger.js";

/** @typedef {import('@pins/appeals.api').Schema.Casenote} Casenote */

/**
 *
 * @param {string} appealId
 * @param {string | undefined} azureAdUserId
 * @param {string} comment
 * @returns {Promise<Casenote | undefined>}
 */
const postCasenote = async (appealId, azureAdUserId, comment) => {
	try {
		if(azureAdUserId && comment) {
			const { id: userId } = await userRepository.findOrCreateUser(azureAdUserId);

			if(userId) {
				const commentResponse = await casenotesRepository.postCasenote({
					caseId: Number(appealId),
					comment,
					userId,
					createdAt: new Date(),
					archived: false

				});

				return commentResponse;
			}
		}
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to create comment')
	}
}

export { postCasenote }
