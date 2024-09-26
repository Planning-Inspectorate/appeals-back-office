

/**
 *
 * @param {import("#repositories/casenotes.repository.js").Casenote[]} casenotes
 */
export const formatCasenotes = (casenotes) => {
	return casenotes
		? casenotes
				.filter((casenote) => !casenote.archived)
				.map((casenote) => ({
					id: casenote.id,
					comment: casenote.comment,
					createdAt: casenote.createdAt,
					azureAdUserId: casenote.user.azureAdUserId
				}))
		: [];
};
