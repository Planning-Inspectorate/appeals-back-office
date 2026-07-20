import appealStatusRepository from '#repositories/appeal-status.repository.js';
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import timetableRepository from '#repositories/appeal-timetable.repository.js';
import appealRepository from '#repositories/appeal.repository.js';
import appellantCaseRepository from '#repositories/appellant-case.repository.js';
import hearingRepository from '#repositories/hearing.repository.js';
import inquiryRepository from '#repositories/inquiry.repository.js';
import lpaqRepository from '#repositories/lpa-questionnaire.repository.js';
import enforcementNoticeAppealOutcomeRepository from '#repositories/enforcement-notice-appeal-outcome.repository.js';
import { databaseConnector } from '#utils/database-connector.js';
import commonRepository from '#repositories/common.repository.js';
import { VALIDATION_OUTCOME_VALID } from '@pins/appeals/constants/support.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const rollBackAppealStatus = async (req, res) => {
	const { appealId } = req.params;
	const { status } = req.body;
	const appealDetails = req.appeal;

	try {
		// we get as little information from the database as possible
		console.log('############# appealDetails:', appealDetails);

		const appealStatus = appealDetails.appealStatus;

		// may also need appellant case/lpaq but so far just getting the ids of those when required

		const parsedAppealId = Number(appealId);

		// we have appealType.key which gives us the letter of the appeal type - which ones use the enforcement stuff and which use the normal ones?
		// const appealTypeKey = appealDetails.appealType.key;
		// console.log('########## appealStatus', appealStatus);
		// console.log('########## appealTypeKey', appealTypeKey);

		// TODO: we now have currentStatus on the appeal and so we will need to also update this- we do still need the value of appealStatus though

		const currentStatus = appealStatus.find((appealStatus) => appealStatus.valid);

		const statusToRollBackTo = appealStatus.find((appealStatus) => appealStatus.status === status);

		if (!statusToRollBackTo) {
			return res.status(400).json({ error: `${status} is not a previous status for ${parsedAppealId}` });
		}

		const transitionsToRollBack = appealStatus.filter(
			(appealStatus) => appealStatus.createdAt >= statusToRollBackTo.createdAt && !appealStatus.valid
		);

		if (!transitionsToRollBack.length) {
			return res.status(400).json({ error: `${status} is the current status for ${parsedAppealId}` });
		}

		/** @type {Array<import('#db-client/client.ts').Prisma.PrismaPromise<any>>} */
		const rollbackOperations = [];

		console.log('############### statusesToRollBack', transitionsToRollBack);
		console.log('############### statusToRollBackTo', statusToRollBackTo);

		// eventual statuses (when can you get to each of these- because if so we don't want to do the other transition
		// it doesn't matter because you could do all of them- make all of them able to not have transitioned that state and it be fine
		// if an appeal is invalid we mark the reason- why is the appeal invalid (other has a typing box)
		if (currentStatus.status === APPEAL_CASE_STATUS.INVALID) {
			// non-enforcement
			// get appellant case
			const appellantCaseId = await appellantCaseRepository.getAppellantCaseIdByAppealId(parsedAppealId);
			// Remove invalid reasons selected
			rollbackOperations.push(
				appellantCaseRepository.deleteInvalidReasonsSelectedByAppellantCaseId(appellantCaseId)
			)
			// Remove invalid reason text
			rollbackOperations.push(
				appellantCaseRepository.deleteInvalidReasonTextByAppellantCaseId(appellantCaseId)
			)

			// enforcement

			// Remove enforcement invalid reasons text
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementInvalidReasonTextByAppellantCaseId(appellantCaseId)
			)
			// Remove enforcement invalid reasons selected
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementInvalidReasonsSelectedByAppellantCaseId(appellantCaseId)
			)

			// Remove enforcement missing documents text
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementMissingDocumentTextByAppellantCaseId(appellantCaseId)
			)
			// Remove enforcement missing documents selected
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementMissingDocumentsSelectedByAppellantCaseId(appellantCaseId)
			)

			// Remove enforcement grounds mismatch facts text
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementGroundsMismatchFactsTextByAppellantCaseId(appellantCaseId)
			);
			// Remove enforcement grounds mismatch facts selected
			rollbackOperations.push(
				appellantCaseRepository.deleteEnforcementGroundsMismatchFactsSelectedByAppellantCaseId(appellantCaseId)
			)

			// remove enforcement notice invalid, other live appeals and ground a fee receipt
			// rollbackOperations.push(
			// 	enforcementNoticeAppealOutcomeRepository.deleteEnforcementNoticeAppealOutcomeByAppealId(parsedAppealId)
			// );

			// get valid outcome info
			const validOutcome = await commonRepository.getLookupListValueByKey(
				'appellantCaseValidationOutcome',
				{ key: 'name', value: VALIDATION_OUTCOME_VALID }
			);

			// roll back validation outcome to valid (if we are rolling back to validation then this will be removed below)
			rollbackOperations.push(
				appellantCaseRepository.updateAppellantCaseValidationOutcomeIdByAppealId(parsedAppealId, validOutcome.id)
			);
		}

		if (currentStatus.status === APPEAL_CASE_STATUS.WITHDRAWN) {
			// what do we need to do here
		}

		// rolling back the validation into ready to start transition
		if (transitionsToRollBack.some((rollBackStatus) => rollBackStatus.status === APPEAL_CASE_STATUS.VALIDATION)) {
			// remove validation date
			rollbackOperations.push(
				appealRepository.updateAppealById(parsedAppealId, {
					caseValidDate: null,
					withdrawalRequestDate: null, // needed if the case was withdrawn
					caseExtensionDate: null // may be needed if the case was marked as incomplete
				})
			);
			// remove validation outcome
			rollbackOperations.push(
				appellantCaseRepository.updateAppellantCaseValidationOutcomeIdByAppealId(parsedAppealId, null)
			);

			// we don't need to remove any incomplete reasons as they will be removed if the appeal is set to incomplete again
			// and will not show up on the appeal unless the appeal validation outcome is set to incomplete

			// enforcement
			// remove enforcement notice appeal outcome ***************** this shouldn't be completely removed :(
			rollbackOperations.push(
				enforcementNoticeAppealOutcomeRepository.deleteEnforcementNoticeAppealOutcomeByAppealId(parsedAppealId)
			);
		}

		// rolling back the ready to start into lpaq transition
		if (transitionsToRollBack.some((rollBackStatus) => rollBackStatus.status === APPEAL_CASE_STATUS.READY_TO_START)) {
			// remove timetable
			rollbackOperations.push(timetableRepository.deleteAppealTimetableByAppealId(parsedAppealId));
			// remove start date
			rollbackOperations.push(
				appealRepository.updateAppealById(parsedAppealId, {
					caseStartedDate: null
				})
			);

			// hearing information may have been set through the ready to start transition
			// remove hearing info (date, time and estimated days)
			// all just on the hearing table
			rollbackOperations.push(
				hearingRepository.deleteHearingByAppealId(parsedAppealId)
			);

			// inquiry information may have been set through the ready to start transition
			// remove inquiry info (date, time, address and estimated days)
			// all just on the inquiry table
			rollbackOperations.push(
				inquiryRepository.deleteInquiryByAppealId(parsedAppealId)
			);
		}

		// rolling back the lpaq to statements transition
		if (transitionsToRollBack.some((rollBackStatus) => rollBackStatus.status === APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE)) {
			// get the LPAQ id
			const lpaQuestionnaireId = await lpaqRepository.getLPAQuestionnaireIdByAppealId(parsedAppealId);

			console.log('############### lpaQuestionnaireId', lpaQuestionnaireId);
			// remove any incomplete reasons selected

			// remove any incomplete reason text

			// remove lpa notification methods selected
			lpaqRepository.processNotificationMethods(lpaQuestionnaireId, null, rollbackOperations);
			// remove lpaquestionnaire
			rollbackOperations.push(lpaqRepository.deleteLPAQuestionnaireByAppealId(parsedAppealId));
			// remove designated sites?
			// remove documents in the lpaq

			// fo broadcast to unsubmit the lpaq

		}

		// rolling back the statements to final comments transition
		if (transitionsToRollBack.some((rollBackStatus) => rollBackStatus.status === APPEAL_CASE_STATUS.STATEMENTS)) {

			// unpublish statements
			// unreview the statements?
			// delete final comments
			// unpublish final comments
			// unreview the final comments?

		}

		// rolling back one of:
		// lpaq into site visit ready to set up
		// final comments into site visit ready to set up
		// statements into hearing ready to set up
		// final comments into hearing ready to set up
		// evidence into inquiry ready to set up
		if (transitionsToRollBack.some((rollBackStatus) => rollBackStatus.status === APPEAL_CASE_STATUS.EVENT)) {

			// unpublish statements
			// unreview the statements?
			// delete final comments
			// unpublish final comments
			// unreview the final comments?

		}



		if (rollbackOperations.length) {
			await databaseConnector.$transaction(rollbackOperations);
		}

		// roll the status back

		const appealStatusRollBack = await appealStatusRepository.rollBackAppealStatusTo(
			parsedAppealId,
			status
		);
		return res.status(200).json(appealStatusRollBack);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal status' });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response|undefined>}
 */
export const rollBackAppealStatusToValidation = async (req, res) => {
	const { appealId } = req.params;
	const appealDetails = req.appeal;

	const appealStatus = appealDetails.appealStatus;
	const parsedAppealId = Number(appealId);

	// initially only add rolling back to validation from invalid
	const currentStatus = appealStatus.find((appealStatus) => appealStatus.valid);

	console.log('############# appealDetails:', appealDetails);

	if (currentStatus.status !== APPEAL_CASE_STATUS.INVALID) {
		return res.status(400).json(
			{ error:
					`The endpoint currently only supports rolling back to validation from invalid, ` +
					`${parsedAppealId} is at ${currentStatus.status}` });
	}

	/** @type {Array<import('#db-client/client.ts').Prisma.PrismaPromise<any>>} */
	const rollbackOperations = [];

	try {
		// we need to remove the invalid reasons and text from the appellant case and then roll back the validation outcome to valid
		// where these reasons are stored in the database are different depending on whether the appeal is an enforcement appeal or not
		// as we do not expect this endpoint to get large amounts of useage we do not worry about the performance impact of
		// doing both operations for the appeal without checking the appeal type

		// we don't need to remove any incomplete reasons as they will be removed if the appeal is set to incomplete again
		// and will not show up on the appeal unless the appeal validation outcome is set to incomplete

		// get appellant case
		const appellantCaseId = await appellantCaseRepository.getAppellantCaseIdByAppealId(parsedAppealId);


	  // Non-enforcement
		// Remove invalid reason text
		rollbackOperations.push(
			appellantCaseRepository.deleteInvalidReasonTextByAppellantCaseId(appellantCaseId)
		)
		// Remove invalid reasons selected
		rollbackOperations.push(
			appellantCaseRepository.deleteInvalidReasonsSelectedByAppellantCaseId(appellantCaseId)
		)


		// Enforcement
		// Remove enforcement invalid reasons text
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementInvalidReasonTextByAppellantCaseId(appellantCaseId)
		)
		// Remove enforcement invalid reasons selected
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementInvalidReasonsSelectedByAppellantCaseId(appellantCaseId)
		)
		// Remove enforcement missing documents text
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementMissingDocumentTextByAppellantCaseId(appellantCaseId)
		)
		// Remove enforcement missing documents selected
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementMissingDocumentsSelectedByAppellantCaseId(appellantCaseId)
		)
		// Remove enforcement grounds mismatch facts text
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementGroundsMismatchFactsTextByAppellantCaseId(appellantCaseId)
		);
		// Remove enforcement grounds mismatch facts selected
		rollbackOperations.push(
			appellantCaseRepository.deleteEnforcementGroundsMismatchFactsSelectedByAppellantCaseId(appellantCaseId)
		)
		// remove enforcement notice invalid, other live appeals and ground a fee receipt
		rollbackOperations.push(
			enforcementNoticeAppealOutcomeRepository.deleteEnforcementNoticeAppealOutcomeByAppealId(parsedAppealId)
		);


		// All appeal types
		// remove validation date
		rollbackOperations.push(
			appealRepository.updateAppealById(parsedAppealId, {
				caseValidDate: null,
				withdrawalRequestDate: null, // needed if the case was withdrawn
				caseExtensionDate: null // may be needed if the case was marked as incomplete
			})
		);
		// remove validation outcome
		rollbackOperations.push(
			appellantCaseRepository.updateAppellantCaseValidationOutcomeIdByAppealId(parsedAppealId, null)
		);


		// apply the prepared operations in a transaction to ensure all are successful
		if (rollbackOperations.length) {
			await databaseConnector.$transaction(rollbackOperations);
		}


		// roll the status back
		const appealStatusRollBack = await appealStatusRepository.rollBackAppealStatusTo(
			parsedAppealId,
			'validation'
		);

		return res.status(200).json(appealStatusRollBack);
	} catch (error) {
		if (error instanceof Error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Failed to roll back appeal to validation' });
	}
};

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAppealStatusCreatedDate = async (req, res) => {
	const { appealId, status } = req.params;
	const statusCreatedDate = await appealStatusRepository.getAppealStatusCreatedDate(
		Number(appealId),
		status
	);
	return res.send(statusCreatedDate);
};
