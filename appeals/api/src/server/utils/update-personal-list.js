import appealRepository from '#repositories/appeal.repository.js';
import personalListRepository from '#repositories/personal-list.repository.js';
import { calculateDueDate } from '#utils/calculate-due-date.js';
import { currentStatus } from '#utils/current-status.js';
import { formatCostsDecision } from '#utils/format-costs-decision.js';
import logger from '#utils/logger.js';
import { CASE_RELATIONSHIP_LINKED } from '@pins/appeals/constants/support.js';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

/**
 * Updates the PersonalList for the specified appeal
 * @param {number} appealId
 * @returns {Promise<void>}
 */
export const updatePersonalList = async (appealId) => {
	const appeal = await appealRepository.getAppealById(appealId);
	if (!appeal) {
		return;
	}

	const appealStatus = currentStatus(appeal);
	const appealIsCompleteOrWithdrawn =
		appealStatus === APPEAL_CASE_STATUS.COMPLETE || appealStatus === APPEAL_CASE_STATUS.WITHDRAWN;
	const costsDecision = appealIsCompleteOrWithdrawn ? await formatCostsDecision(appeal) : null;

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
		if (!dueDate && linkedAppeals[0]?.parentId) {
			const parentAppeal = await appealRepository.getAppealById(linkedAppeals[0].parentId);
			if (!parentAppeal) {
				dueDate = null;
			} else {
				const costsDecision =
					currentStatus(parentAppeal) === APPEAL_CASE_STATUS.COMPLETE
						? await formatCostsDecision(parentAppeal)
						: null;
				dueDate = await calculateDueDate(parentAppeal, costsDecision);
			}
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
			linkedAppeals.map(async (linkedAppeal) => {
				if (linkedAppeal.childId) {
					await performUpdate({
						appealId: linkedAppeal.childId,
						dueDate,
						linkType: 'child',
						leadAppealId: linkedAppeal.parentId
					});
				}
			})
		);
	}
};

/**
 *
 * @param {{ appealId: number, dueDate: Date | null | undefined, linkType: string | null, leadAppealId: number | null }} personalListEntry
 */
async function performUpdate(personalListEntry) {
	const { appealId, dueDate = null, linkType = null, leadAppealId = null } = personalListEntry;

	// @ts-ignore
	return personalListRepository.upsertPersonalListEntry({
		appealId,
		dueDate,
		linkType,
		leadAppealId
	});
}

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Refreshes the PersonalList for all appeals that have no PersonalList entries
 * @returns {Promise<void>}
 */
export async function refreshPersonalList() {
	const appealsWithoutPersonalListEntry =
		await appealRepository.getAppealsWithNoPersonalListEntries();
	if (appealsWithoutPersonalListEntry.length > 0) {
		logger.info(
			`PersonalList will be refreshed for ${appealsWithoutPersonalListEntry.length} appeals`
		);
		for (const appeal of appealsWithoutPersonalListEntry) {
			await updatePersonalList(appeal.id);
			await sleep(10); // sleep for 10 milliseconds
		}
		logger.info(`PersonalList refresh complete`);
	}
}
