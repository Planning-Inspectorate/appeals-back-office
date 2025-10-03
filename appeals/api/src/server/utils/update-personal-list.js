// @ts-nocheck
import appealRepository from '#repositories/appeal.repository.js';
import personalListRepository from '#repositories/personal-list.repository.js';
import { calculateDueDate } from '#utils/calculate-due-date.js';
import { currentStatus } from '#utils/current-status.js';
import { formatCostsDecision } from '#utils/format-costs-decision.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 *
 * @param {number} appealId
 */
export const updatePersonalList = async (appealId) => {
	const appeal = await appealRepository.getAppealById(appealId);
	const costsDecision =
		currentStatus(appeal) === APPEAL_CASE_STATUS.COMPLETE
			? await formatCostsDecision(appeal)
			: null;
	let dueDate = await calculateDueDate(appeal, costsDecision);
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
			const costsDecision =
				currentStatus(parentAppeal) === APPEAL_CASE_STATUS.COMPLETE
					? await formatCostsDecision(parentAppeal)
					: null;
			dueDate = await calculateDueDate(parentAppeal, costsDecision);
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
	return personalListRepository.upsertPersonalListEntry({
		appealId,
		dueDate,
		linkType,
		leadAppealId
	});
}

export async function refreshPersonalList() {
	const appealsWithoutPersonalListEntry =
		await appealRepository.getAppealsWithNoPersonalListEntries();
	if (appealsWithoutPersonalListEntry.length > 0) {
		console.log(
			`PersonalList will be refreshed for ${appealsWithoutPersonalListEntry.length} appeals`
		);
	}
	for (const appeal of appealsWithoutPersonalListEntry) {
		await updatePersonalList(appeal.id);
	}
}

export async function fixPersonalListOnStartUp() {
	const personalList = await personalListRepository.getCompletedPersonalListEntriesWithDueDate();
	const appealIdsToUpdate = personalList?.length
		? (
				await Promise.all(
					personalList.map(async (personalListEntry) => {
						const appeal = await appealRepository.getAppealById(personalListEntry.appealId);
						const costsDecision =
							currentStatus(appeal) === APPEAL_CASE_STATUS.COMPLETE
								? await formatCostsDecision(appeal)
								: null;
						const dueDate = await calculateDueDate(appeal, costsDecision);
						if (dueDate !== null) {
							return null;
						}
						await personalListRepository.upsertPersonalListEntry({
							appealId: personalListEntry.appealId,
							dueDate,
							linkType: personalListEntry.linkType,
							leadAppealId: personalListEntry.leadAppealId
						});
						return personalListEntry.appealId;
					})
				)
		  ).filter((appealId) => appealId !== null)
		: [];
	if (appealIdsToUpdate.length) {
		console.log('Personal list fixed on startup for appealIds: ', appealIdsToUpdate);
	}
}
