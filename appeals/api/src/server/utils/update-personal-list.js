// @ts-nocheck
import appealRepository from '#repositories/appeal.repository.js';
import personalListRepository from '#repositories/personal-list.repository.js';
import { calculateDueDate } from '#utils/calculate-due-date.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';

/**
 *
 * @param {number} appealId
 */
export const updatePersonalList = async (appealId) => {
	const appeal = await appealRepository.getAppealById(appealId);
	let dueDate = await calculateDueDate(appeal);
	let linkType = null;
	const linkedAppeals = await appealRepository.getLinkedAppeals(
		appeal.reference,
		CASE_RELATIONSHIP_LINKED
	);
	if (linkedAppeals?.length) {
		if (linkedAppeals.some((linkedAppeal) => linkedAppeal.childId === appeal.id)) {
			return; // Do not update children here as their parent should display the correct date
		} else if (linkedAppeals.some((linkedAppeal) => linkedAppeal.parentId === appeal.id)) {
			linkType = 'parent';
		}
		if (!dueDate) {
			const parentAppeal = await appealRepository.getAppealById(linkedAppeals[0].parentId);
			dueDate = await calculateDueDate(parentAppeal);
		}
	}
	const personalListEntry = {
		appealId: appeal.id,
		dueDate,
		linkType,
		leadAppealId: linkType === 'parent' ? appeal.id : null
	};

	await performUpdate(personalListEntry);

	if (linkType === 'parent') {
		await Promise.all(
			linkedAppeals.map(
				async (linkedAppeal) =>
					await performUpdate({
						appealId: linkedAppeal.childId,
						dueDate,
						linkType: 'child',
						leadAppealId: linkedAppeal.parentId
					})
			)
		);
	}
};

async function performUpdate(personalListEntry) {
	const { appealId, dueDate = null, linkType = null, leadAppealId = null } = personalListEntry;
	await personalListRepository.upsertPersonalListEntry({
		appealId,
		dueDate,
		linkType,
		leadAppealId
	});
}
