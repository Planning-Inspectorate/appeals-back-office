import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { dateToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import usersService from '../../appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import { dateAndTimeFormatter } from './global-mapper-formatter.js';
import { convert24hTo12hTimeStringFormat } from '#lib/times.js';
import { linkedAppealStatus } from '#lib/appeals-formatter.js';
import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { mapActionComponent } from './component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';
import {
	mapDocumentDownloadUrl,
	mapVirusCheckStatus
} from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { AVSCAN_STATUS } from '@pins/appeals/constants/documents.js';
import { APPEAL_CASE_STATUS } from 'pins-data-model';

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} currentRoute
 * @param {import('../../app/auth/auth-session.service').SessionWithAuth} session
 * @param {boolean} [skipAssignedUsersData]
 * @returns {Promise<{appeal: MappedInstructions}>}
 */
export async function initialiseAndMapAppealData(
	appealDetails,
	currentRoute,
	session,
	skipAssignedUsersData = false
) {
	if (appealDetails === undefined) {
		throw new Error('appealDetails is undefined');
	}

	currentRoute =
		currentRoute[currentRoute.length - 1] === '/' ? currentRoute.slice(0, -1) : currentRoute;

	/** @type {{appeal: MappedInstructions}} */
	let mappedData = {};
	mappedData.appeal = {};

	/** @type {Instructions} */
	mappedData.appeal.appealReference = {
		id: 'appeal-reference',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal reference'
				},
				value: {
					text: appealDetails.appealReference
				},
				classes: 'appeal-appeal-reference'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appealType = {
		id: 'appeal-type',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal type'
				},
				value: {
					text: appealDetails.appealType || 'No appeal type'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/change-appeal-type/appeal-type`,
							visuallyHiddenText: 'Appeal type',
							attributes: { 'data-cy': 'change-appeal-type' }
						})
					]
				},
				classes: 'appeal-appeal-type'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.caseProcedure = {
		id: 'case-procedure',
		display: {
			summaryListItem: {
				key: {
					text: 'Case procedure'
				},
				value: {
					text: appealDetails.procedureType || `No case procedure`
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/change-appeal-details/case-procedure`,
							visuallyHiddenText: 'Case procedure',
							attributes: { 'data-cy': 'change-case-procedure' }
						})
					]
				},
				classes: 'appeal-case-procedure'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appellant = {
		id: 'appellant',
		display: {
			summaryListItem: {
				key: {
					text: 'Appellant'
				},
				value: {
					html: appealDetails.appellant
						? formatServiceUserAsHtmlList(appealDetails.appellant)
						: 'No appellant'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/service-user/change/appellant`,
							visuallyHiddenText: 'Appellant',
							attributes: { 'data-cy': 'change-appellant' }
						})
					]
				},
				classes: 'appeal-appellant'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.agent = {
		id: 'agent',
		display: {
			summaryListItem: {
				key: {
					text: 'Agent'
				},
				value: {
					html: appealDetails.agent ? formatServiceUserAsHtmlList(appealDetails.agent) : 'No agent'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: 'Change',
							href: `${currentRoute}/service-user/change/agent`,
							visuallyHiddenText: 'Agent',
							attributes: { 'data-cy': 'change-agent' }
						})
					]
				},
				classes: 'appeal-agent'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.linkedAppeals = {
		id: 'linked-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Linked appeals'
				},
				value: {
					html:
						displayPageFormatter.formatListOfLinkedAppeals(appealDetails.linkedAppeals) ||
						'No linked appeals'
				},
				actions: {
					items:
						appealDetails.linkedAppeals.filter(
							(linkedAppeal) => linkedAppeal.isParentAppeal && linkedAppeal.externalSource
						).length === 0
							? mapActionComponent(permissionNames.updateCase, session, [
									...(appealDetails.linkedAppeals.length > 0
										? [
												{
													text: 'Manage',
													href: generateLinkedAppealsManageLinkHref(appealDetails),
													visuallyHiddenText: 'Linked appeals',
													attributes: { 'data-cy': 'manage-linked-appeals' }
												}
										  ]
										: []),
									{
										text: 'Add',
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals/add`,
										visuallyHiddenText: 'Linked appeals',
										attributes: { 'data-cy': 'add-linked-appeal' }
									}
							  ])
							: []
				},
				classes: 'appeal-linked-appeals'
			}
		}
	};

	mappedData.appeal.leadOrChild = {
		id: 'lead-or-child',
		display: mapLeadOrChildStatus(appealDetails)
	};

	const otherAppealsItems = [];

	if (appealDetails.otherAppeals.length) {
		otherAppealsItems.push(
			mapActionComponent(permissionNames.updateCase, session, {
				text: 'Manage',
				href: `${currentRoute}/other-appeals/manage`,
				visuallyHiddenText: 'Related appeals',
				attributes: { 'data-cy': 'manage-related-appeals' }
			})
		);
	}

	otherAppealsItems.push(
		mapActionComponent(permissionNames.updateCase, session, {
			text: 'Add',
			href: `${currentRoute}/other-appeals/add`,
			visuallyHiddenText: 'Related appeals',
			attributes: { 'data-cy': 'add-related-appeals' }
		})
	);

	/** @type {Instructions} */
	mappedData.appeal.otherAppeals = {
		id: 'other-appeals',
		display: {
			summaryListItem: {
				key: {
					text: 'Related appeals'
				},
				value: {
					html:
						displayPageFormatter.formatListOfRelatedAppeals(appealDetails.otherAppeals || []) ||
						'<span>No related appeals</span>'
				},
				actions: {
					items: otherAppealsItems
				},
				classes: 'appeal-other-appeals'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.allocationDetails = {
		id: 'allocation-details',
		display: {
			summaryListItem: {
				key: {
					text: 'Allocation level'
				},
				value: {
					html: appealDetails.allocationDetails
						? `
						Level: ${appealDetails.allocationDetails.level}<br />
						Band: ${appealDetails.allocationDetails.band}<br />
						Specialisms:
						<ul class="govuk-!-margin-0"><li>${appealDetails.allocationDetails.specialisms.join(
							'</li><li>'
						)}</li></ul>
					`
						: 'No allocation level for this appeal'
				},
				actions: {
					items: [
						mapActionComponent(permissionNames.updateCase, session, {
							text: appealDetails.allocationDetails ? 'Change' : 'Add',
							href: `${currentRoute}/allocation-details/allocation-level`,
							visuallyHiddenText: 'Allocation level',
							attributes: {
								'data-cy':
									(appealDetails.allocationDetails ? 'change' : 'add') + '-allocation-level'
							}
						})
					]
				},
				classes: 'appeal-allocation-details'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaReference = {
		id: 'lpa-reference',
		display: {
			summaryListItem: {
				key: {
					text: 'LPA application reference'
				},
				value: {
					text:
						appealDetails.planningApplicationReference ||
						'No LPA application reference for this appeal'
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/lpa-reference/change`,
							visuallyHiddenText: 'L P A reference',
							attributes: { 'data-cy': 'change-lpa-reference' }
						}
					]
				},
				classes: 'appeal-lpa-reference'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.decision = {
		id: 'decision',
		display: {
			summaryListItem: {
				key: {
					text: 'Decision'
				},
				value: {
					text: appealDetails.decision?.outcome || 'Not yet issued'
				},
				actions: {
					items: appealDetails.decision?.outcome
						? []
						: [
								{
									text: 'Issue',
									href: generateIssueDecisionUrl(appealDetails.appealId),
									visuallyHiddenText: 'site address'
								}
						  ]
				},
				classes: 'appeal-decision'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.siteAddress = {
		id: 'site-address',
		display: {
			summaryListItem: {
				key: {
					text: 'Site address'
				},
				value: {
					text: appealSiteToAddressString(appealDetails.appealSite)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/change-appeal-details/site-address`,
							visuallyHiddenText: 'site address',
							attributes: { 'data-cy': 'change-site-address' }
						}
					]
				},
				classes: 'appeal-site-address'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.localPlanningAuthority = {
		id: 'local-planning-authority',
		display: {
			summaryListItem: {
				key: {
					text: 'Local planning authority (LPA)'
				},
				value: {
					text: appealDetails.localPlanningDepartment
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/change-appeal-details/local-planning-authority`,
							visuallyHiddenText: 'local planning authority (LPA)',
							attributes: { 'data-cy': 'change-local-planning-authority' }
						}
					]
				},
				classes: 'appeal-local-planning-authority'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appealStatus = {
		id: 'appeal-status',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal status'
				},
				value: {
					text: appealDetails.appealStatus
				},
				classes: 'appeal-appeal-status'
			},
			statusTag: {
				status: appealDetails?.appealStatus || '',
				classes: 'govuk-!-margin-bottom-4'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaInspectorAccess = {
		id: 'lpa-inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspection access (LPA answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.inspectorAccess.lpaQuestionnaire.isRequired) ??
							'No answer provided',
						appealDetails.inspectorAccess.lpaQuestionnaire.details
					)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/inspector-access/change/lpa`,
							visuallyHiddenText: 'inspection access (L P A answer)',
							attributes: { 'data-cy': 'change-inspection-access-lpa' }
						}
					]
				},
				classes: 'appeal-lpa-inspector-access'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appellantInspectorAccess = {
		id: 'appellant-case-inspector-access',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspection access (appellant answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.inspectorAccess.appellantCase.isRequired) ??
							'No answer provided',
						appealDetails.inspectorAccess.appellantCase.details
					)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/inspector-access/change/appellant`,
							visuallyHiddenText: 'inspection access (appellant answer)',
							attributes: { 'data-cy': 'change-inspection-access-appellant' }
						}
					]
				},
				classes: 'appeal-appellant-inspector-access'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.neighbouringSiteIsAffected = {
		id: 'neighbouring-site-is-affected',
		display: {
			summaryListItem: {
				key: {
					text: 'Could a neighbouring site be affected?'
				},
				value: {
					html:
						convertFromBooleanToYesNo(appealDetails.neighbouringSites?.length > 0) ||
						'No answer provided'
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/neighbouring-sites/change/affected`,
							visuallyHiddenText: 'could a neighbouring site be affected',
							attributes: { 'data-cy': 'change-neighbouuring-site-is-affected' }
						}
					]
				},
				classes: 'appeal-neighbouring-site-is-affected'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaNeighbouringSites = {
		id: 'neighbouring-sites-lpa',
		display: {
			summaryListItem: {
				key: {
					text: 'Neighbouring sites (LPA)'
				},
				value: {
					html:
						appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
							? displayPageFormatter.formatListOfAddresses(
									appealDetails.neighbouringSites.filter((site) => site.source === 'lpa')
							  )
							: 'None'
				},
				actions: {
					items: [
						...(appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
							? [
									{
										text: 'Manage',
										href: `${currentRoute}/neighbouring-sites/manage`,
										visuallyHiddenText: 'Neighbouring sites (L P A)'
									}
							  ]
							: []),
						{
							text: 'Add',
							href: `${currentRoute}/neighbouring-sites/add/lpa`,
							visuallyHiddenText: 'Neighbouring sites (LPA)',
							attributes: { 'data-cy': 'add-neighbouring-site-lpa' }
						}
					]
				},
				classes: 'appeal-neighbouring-sites-inspector'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.inspectorNeighbouringSites = {
		id: 'neighbouring-sites-inspector',
		display: {
			summaryListItem: {
				key: {
					text: 'Neighbouring sites (inspector and/or third party request)'
				},
				value: {
					html:
						appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
							? displayPageFormatter.formatListOfAddresses(
									appealDetails.neighbouringSites.filter((site) => site.source === 'back-office')
							  )
							: 'None'
				},
				actions: {
					items: [
						...(appealDetails.neighbouringSites && appealDetails.neighbouringSites.length > 0
							? [
									{
										text: 'Manage',
										href: `${currentRoute}/neighbouring-sites/manage`,
										visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)',
										attributes: { 'data-cy': 'manage-neighbouring-sites-inspector' }
									}
							  ]
							: []),
						{
							text: 'Add',
							href: `${currentRoute}/neighbouring-sites/add/back-office`,
							visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)',
							attributes: { 'data-cy': 'add-neighbouring-sites-inspector' }
						}
					]
				},
				classes: 'appeal-neighbouring-sites-inspector'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaHealthAndSafety = {
		id: 'lpa-health-and-safety',
		display: {
			summaryListItem: {
				key: {
					text: 'Potential safety risks (LPA answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.healthAndSafety.lpaQuestionnaire.hasIssues) ||
							'No answer provided',
						appealDetails.healthAndSafety.lpaQuestionnaire.details
					)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/safety-risks/change/lpa`,
							visuallyHiddenText: 'potential safety risks (L P A answer)',
							attributes: { 'data-cy': 'change-lpa-health-and-safety' }
						}
					]
				},
				classes: 'appeal-lpa-health-and-safety'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appellantHealthAndSafety = {
		id: 'appellant-case-health-and-safety',
		display: {
			summaryListItem: {
				key: {
					text: 'Potential safety risks (appellant answer)'
				},
				value: {
					html: displayPageFormatter.formatAnswerAndDetails(
						convertFromBooleanToYesNo(appealDetails.healthAndSafety.appellantCase.hasIssues) ||
							'No answer provided',
						appealDetails.healthAndSafety.appellantCase.details
					)
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/safety-risks/change/appellant`,
							visuallyHiddenText: 'potential safety risks (appellant answer)',
							attributes: { 'data-cy': 'change-appellant-case-health-and-safety' }
						}
					]
				},
				classes: 'appeal-appellant-health-and-safety'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.visitType = {
		id: 'set-visit-type',
		display: {
			summaryListItem: {
				key: {
					text: 'Visit type'
				},
				value: {
					text: appealDetails.siteVisit?.visitType || ''
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/site-visit/${
								appealDetails.siteVisit?.visitType ? 'visit-booked' : 'schedule-visit'
							}`,
							visuallyHiddenText: 'visit type',
							attributes: { 'data-cy': 'change-set-visit-type' }
						}
					]
				},
				classes: 'appeal-visit-type'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.validAt = {
		id: 'valid-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Valid date'
				},
				value: {
					html: dateToDisplayDate(appealDetails.validAt) || ''
				},
				actions: {
					items: [
						appealDetails.validAt
							? {
									text: 'Change',
									href: `${currentRoute}/appellant-case/valid/date`,
									visuallyHiddenText:
										'The date all case documentation was received and the appeal was valid',
									attributes: { 'data-cy': 'change-valid-date' }
							  }
							: {}
					]
				},
				classes: 'appeal-valid-date'
			}
		}
	};

	let startedAtActionLink = null;

	if (appealDetails.validAt) {
		if (appealDetails.startedAt) {
			if (appealDetails.documentationSummary?.lpaQuestionnaire?.status === 'not_received') {
				startedAtActionLink = {
					text: 'Change',
					href: `${currentRoute}/start-case/change`,
					attributes: { 'data-cy': 'change-start-case-date' }
				};
			}
		} else {
			startedAtActionLink = {
				text: 'Add',
				href: `${currentRoute}/start-case/add`,
				visuallyHiddenText: 'The date the case was started',
				attributes: { 'data-cy': 'add-start-case-date' }
			};
		}
	}

	/** @type {Instructions} */
	mappedData.appeal.startedAt = {
		id: 'start-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Start date'
				},
				value: {
					html: appealDetails.validAt
						? appealDetails.startedAt
							? dateToDisplayDate(appealDetails.startedAt) || ''
							: 'Not added'
						: ''
				},
				actions: {
					items: startedAtActionLink && [startedAtActionLink]
				},
				classes: 'appeal-start-date'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaQuestionnaireDueDate = {
		id: 'lpa-questionnaire-due-date',
		display: {
			summaryListItem: {
				key: {
					text: 'LPA questionnaire due'
				},
				value: {
					html:
						dateToDisplayDate(appealDetails.appealTimetable?.lpaQuestionnaireDueDate) ||
						'Due date not yet set'
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/appeal-timetables/lpa-questionnaire`,
							visuallyHiddenText: 'L P A questionnaire due',
							attributes: { 'data-cy': 'change-lpa-questionnaire-due-date' }
						}
					]
				},
				classes: 'appeal-lpa-questionnaire-due-date'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.statementReviewDueDate = {
		id: 'statement-review-due-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Statement review due'
				},
				value: {
					html:
						dateToDisplayDate(appealDetails.appealTimetable?.statementReviewDate) ||
						'Due date not yet set'
				},
				actions: {
					items: [
						{
							text: appealDetails.appealTimetable?.statementReviewDate ? 'Change' : 'Schedule',
							href: `${currentRoute}/appeal-timetables/statement-review`,
							visuallyHiddenText: 'statement review due date',
							attributes: { 'data-cy': 'statement-review-due-date' }
						}
					]
				},
				classes: 'appeal-statement-review-due-date'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.finalCommentReviewDueDate = {
		id: 'final-comment-review-due-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Final comment review due'
				},
				value: {
					html:
						dateToDisplayDate(appealDetails.appealTimetable?.finalCommentReviewDate) ||
						'Due date not yet set'
				},
				actions: {
					items: [
						{
							text: appealDetails.appealTimetable?.finalCommentReviewDate ? 'Change' : 'Schedule',
							href: `${currentRoute}/appeal-timetables/final-comment-review`,
							visuallyHiddenText: 'final comment review due date',
							attributes: { 'data-cy': 'final-comment-review-due-date' }
						}
					]
				},
				classes: 'appeal-final-comment-review-due-date'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.siteVisitDate = {
		id: 'schedule-visit',
		display: {
			summaryListItem: {
				key: {
					text: 'Site visit'
				},
				value: {
					html:
						dateAndTimeFormatter(
							dateToDisplayDate(appealDetails.siteVisit?.visitDate),
							convert24hTo12hTimeStringFormat(appealDetails.siteVisit?.visitStartTime),
							convert24hTo12hTimeStringFormat(appealDetails.siteVisit?.visitEndTime)
						) || 'Visit date not yet set'
				},
				actions: {
					items: [
						{
							text: appealDetails.siteVisit?.visitDate ? 'Change' : 'Arrange',
							href: `${currentRoute}/site-visit/${
								appealDetails.siteVisit?.visitDate ? 'manage' : 'schedule'
							}-visit`,
							visuallyHiddenText: 'site visit',
							attributes: {
								'data-cy':
									(appealDetails.siteVisit?.visitDate ? 'change' : 'arrange') + '-schedule-visit'
							}
						}
					]
				},
				classes: 'appeal-site-visit'
			}
		}
	};

	let caseOfficerRowValue = '';
	let caseOfficerUser;

	if (appealDetails.caseOfficer && !skipAssignedUsersData) {
		caseOfficerUser = await usersService.getUserByRoleAndId(
			config.referenceData.appeals.caseOfficerGroupId,
			session,
			appealDetails.caseOfficer
		);
		caseOfficerRowValue = caseOfficerUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(caseOfficerUser?.name)}</li><li>${
					caseOfficerUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">A case officer is assigned but their user account was not found';
	}

	/** @type {Instructions} */
	mappedData.appeal.caseOfficer = {
		id: 'case-officer',
		display: {
			summaryListItem: {
				key: {
					text: 'Case officer'
				},
				value: {
					html: caseOfficerRowValue
				},
				actions: {
					items: [
						{
							text: appealDetails.caseOfficer ? 'Change' : 'Assign',
							href: `${currentRoute}/assign-user/case-officer`,
							visuallyHiddenText: 'case officer',
							attributes: {
								'data-cy': (appealDetails.caseOfficer ? 'change' : 'assign') + '-case-officer'
							}
						}
					]
				},
				classes: 'appeal-case-officer'
			}
		}
	};

	let inspectorRowValue = '';
	let inspectorUser;

	if (appealDetails.inspector && !skipAssignedUsersData) {
		inspectorUser = await usersService.getUserByRoleAndId(
			config.referenceData.appeals.inspectorGroupId,
			session,
			appealDetails.inspector
		);
		inspectorRowValue = inspectorUser
			? `<ul class="govuk-list"><li>${surnameFirstToFullName(inspectorUser?.name)}</li><li>${
					inspectorUser?.email
			  }</li></ul>`
			: '<p class="govuk-body">An inspector is assigned but their user account was not found';
	}

	/** @type {Instructions} */
	mappedData.appeal.inspector = {
		id: 'inspector',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspector'
				},
				value: {
					html: inspectorRowValue
				},
				actions: {
					items: [
						{
							text: appealDetails.inspector ? 'Change' : 'Assign',
							href: `${currentRoute}/assign-user/inspector`,
							visuallyHiddenText: 'inspector',
							attributes: {
								'data-cy': (appealDetails.inspector ? 'change' : 'assign') + '-inspector'
							}
						}
					]
				},
				classes: 'appeal-inspector'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.crossTeamCorrespondence = {
		id: 'cross-team-correspondence',
		display: {
			summaryListItem: {
				key: {
					text: 'Cross-team correspondence'
				},
				actions: {
					items:
						appealDetails.internalCorrespondence?.crossTeam?.documents &&
						appealDetails.internalCorrespondence?.crossTeam?.documents.length > 0
							? [
									{
										text: 'Manage',
										visuallyHiddenText: 'cross-team correspondence documents',
										href: `${currentRoute}/internal-correspondence/cross-team/manage-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
									},
									{
										text: 'Add',
										visuallyHiddenText: 'cross-team correspondence documents',
										href: displayPageFormatter.formatDocumentActionLink(
											appealDetails.appealId,
											appealDetails.internalCorrespondence?.crossTeam,
											`${currentRoute}/internal-correspondence/cross-team/upload-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
										)
									}
							  ]
							: [
									{
										text: 'Add',
										visuallyHiddenText: 'cross-team correspondence documents',
										href: displayPageFormatter.formatDocumentActionLink(
											appealDetails.appealId,
											appealDetails.internalCorrespondence?.crossTeam,
											`${currentRoute}/internal-correspondence/cross-team/upload-documents/${appealDetails.internalCorrespondence?.crossTeam?.folderId}`
										)
									}
							  ]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.inspectorCorrespondence = {
		id: 'inspector-correspondence',
		display: {
			summaryListItem: {
				key: {
					text: 'Inspector correspondence'
				},
				actions: {
					items:
						appealDetails.internalCorrespondence?.inspector?.documents &&
						appealDetails.internalCorrespondence?.inspector?.documents.length > 0
							? [
									{
										text: 'Manage',
										visuallyHiddenText: 'inspector correspondence documents',
										href: `${currentRoute}/internal-correspondence/inspector/manage-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
									},
									{
										text: 'Add',
										visuallyHiddenText: 'inspector correspondence documents',
										href: displayPageFormatter.formatDocumentActionLink(
											appealDetails.appealId,
											appealDetails.internalCorrespondence?.inspector,
											`${currentRoute}/internal-correspondence/inspector/upload-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
										)
									}
							  ]
							: [
									{
										text: 'Add',
										visuallyHiddenText: 'inspector correspondence documents',
										href: displayPageFormatter.formatDocumentActionLink(
											appealDetails.appealId,
											appealDetails.internalCorrespondence?.inspector,
											`${currentRoute}/internal-correspondence/inspector/upload-documents/${appealDetails.internalCorrespondence?.inspector?.folderId}`
										)
									}
							  ]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.caseHistory = {
		id: 'case-history',
		display: {
			summaryListItem: {
				key: {
					text: 'Case history'
				},
				actions: {
					items: [
						{
							text: 'View',
							href: `${currentRoute}/audit`,
							visuallyHiddenText: 'View case history'
						}
					]
				}
			}
		}
	};

	const appealHasWithdrawalDocuments =
		appealDetails?.withdrawal?.withdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	const appealWithdrawalActionItem =
		appealDetails.appealStatus === APPEAL_CASE_STATUS.WITHDRAWN && appealHasWithdrawalDocuments
			? {
					text: 'View',
					href: `${currentRoute}/withdrawal/view`,
					visuallyHiddenText: 'View appeal withdrawal'
			  }
			: {
					text: 'Start',
					href: `${currentRoute}/withdrawal/start`,
					visuallyHiddenText: 'Start appeal withdrawal'
			  };

	/** @type {Instructions} */
	mappedData.appeal.appealWithdrawal = {
		id: 'appeal-withdrawal',
		display: {
			summaryListItem: {
				key: {
					text: 'Appeal withdrawal'
				},
				actions: {
					items: [appealWithdrawalActionItem]
				}
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appellantCase = {
		id: 'appellant-case',
		display: {
			tableItem: [
				{
					text: 'Appellant case'
				},
				{
					text: displayPageFormatter.mapDocumentStatus(
						appealDetails?.documentationSummary?.appellantCase?.status,
						appealDetails?.documentationSummary?.appellantCase?.dueDate
					)
				},
				{
					text: dateToDisplayDate(appealDetails?.documentationSummary?.appellantCase?.receivedAt)
				},
				{
					html:
						appealDetails?.documentationSummary?.appellantCase?.status !== 'not_received'
							? `<a href="${currentRoute}/appellant-case" data-cy="review-appellant-case" class="govuk-link">Review <span class="govuk-visually-hidden">appellant case</span></a>`
							: ''
				}
			]
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.lpaQuestionnaire = {
		id: 'lpa-questionnaire',
		display: {
			tableItem: [
				{
					text: 'LPA questionnaire'
				},
				{
					text: displayPageFormatter.mapDocumentStatus(
						appealDetails?.documentationSummary?.lpaQuestionnaire?.status
					)
				},
				{
					text: dateToDisplayDate(appealDetails?.documentationSummary?.lpaQuestionnaire?.receivedAt)
				},
				{
					html:
						appealDetails?.documentationSummary?.lpaQuestionnaire?.status !== 'not_received'
							? `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" data-cy="review-lpa-questionnaire" class="govuk-link">Review <span class="govuk-visually-hidden">L P A questionnaire</span></a>`
							: ''
				}
			]
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.appealDecision = {
		id: 'appeal-decision',
		display: {
			tableItem: [
				{
					text: 'Appeal decision',
					classes: 'appeal-decision-documentation'
				},
				{
					text:
						appealDetails.appealStatus === APPEAL_CASE_STATUS.COMPLETE
							? 'Sent'
							: 'Awaiting decision',
					classes: 'appeal-decision-status'
				},
				{
					text: 'Not applicable',
					classes: 'appeal-decision-due-date'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">${generateAppealDecisionActionListItems(
						appealDetails
					)}</ul>`,
					classes: 'appeal-decision-actions'
				}
			]
		}
	};

	const appealHasAppellantApplicationCostsDocuments =
		appealDetails?.costs?.appellantApplicationFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsAppellantApplication = {
		id: 'costs-appellant-application',
		display: {
			tableItem: [
				{
					text: 'Appellant application',
					classes: 'appeal-costs-appellant-application-documentation'
				},
				{
					text: appealHasAppellantApplicationCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-application-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasAppellantApplicationCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/application/manage-documents/${appealDetails?.costs?.appellantApplicationFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/application/upload-documents/${
						appealDetails?.costs?.appellantApplicationFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-application-actions'
				}
			]
		}
	};

	const appealHasAppellantWithdrawalCostsDocuments =
		appealDetails?.costs?.appellantWithdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsAppellantWithdrawal = {
		id: 'costs-appellant-withdrawal',
		display: {
			tableItem: [
				{
					text: 'Appellant withdrawal',
					classes: 'appeal-costs-appellant-withdrawal-documentation'
				},
				{
					text: appealHasAppellantWithdrawalCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-withdrawal-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasAppellantWithdrawalCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/withdrawal/manage-documents/${appealDetails?.costs?.appellantWithdrawalFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/withdrawal/upload-documents/${
						appealDetails?.costs?.appellantWithdrawalFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-withdrawal-actions'
				}
			]
		}
	};

	const appealHasAppellantCorrespondenceCostsDocuments =
		appealDetails?.costs?.appellantCorrespondenceFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsAppellantCorrespondence = {
		id: 'costs-appellant-correspondence',
		display: {
			tableItem: [
				{
					text: 'Appellant correspondence',
					classes: 'appeal-costs-appellant-correspondence-documentation'
				},
				{
					text: appealHasAppellantCorrespondenceCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-correspondence-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasAppellantCorrespondenceCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/correspondence/manage-documents/${appealDetails?.costs?.appellantCorrespondenceFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-appeallant" href="${currentRoute}/costs/appellant/correspondence/upload-documents/${
						appealDetails?.costs?.appellantCorrespondenceFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-correspondence-actions'
				}
			]
		}
	};

	const appealHasLPAApplicationCostsDocuments =
		appealDetails?.costs?.lpaApplicationFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsLpaApplication = {
		id: 'costs-lpa-application',
		display: {
			tableItem: [
				{
					text: 'LPA application',
					classes: 'appeal-costs-lpa-application-documentation'
				},
				{
					text: appealHasLPAApplicationCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-application-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasLPAApplicationCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/application/manage-documents/${appealDetails?.costs?.lpaApplicationFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/application/upload-documents/${
						appealDetails?.costs?.lpaApplicationFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-application-actions'
				}
			]
		}
	};

	const appealHasLPAWithdrawalCostsDocuments =
		appealDetails?.costs?.lpaWithdrawalFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsLpaWithdrawal = {
		id: 'costs-lpa-withdrawal',
		display: {
			tableItem: [
				{
					text: 'LPA withdrawal',
					classes: 'appeal-costs-lpa-withdrawal-documentation'
				},
				{
					text: appealHasLPAWithdrawalCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-withdrawal-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasLPAWithdrawalCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/withdrawal/manage-documents/${appealDetails?.costs?.lpaWithdrawalFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/withdrawal/upload-documents/${
						appealDetails?.costs?.lpaWithdrawalFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-withdrawal-actions'
				}
			]
		}
	};

	const appealHasLPACorrespondenceCostsDocuments =
		appealDetails?.costs?.lpaCorrespondenceFolder?.documents?.filter(
			(document) => document.latestDocumentVersion?.isDeleted === false
		).length;

	/** @type {Instructions} */
	mappedData.appeal.costsLpaCorrespondence = {
		id: 'costs-lpa-correspondence',
		display: {
			tableItem: [
				{
					text: 'LPA correspondence',
					classes: 'appeal-costs-lpa-correspondence-documentation'
				},
				{
					text: appealHasLPACorrespondenceCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-correspondence-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasLPACorrespondenceCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/correspondence/manage-documents/${appealDetails?.costs?.lpaCorrespondenceFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-lpa" href="${currentRoute}/costs/lpa/correspondence/upload-documents/${
						appealDetails?.costs?.lpaCorrespondenceFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-correspondence-actions'
				}
			]
		}
	};

	const appealHasCostsDecisionDocuments = appealDetails?.costs?.decisionFolder?.documents?.filter(
		(document) => document.latestDocumentVersion?.isDeleted === false
	).length;

	/** @type {Instructions} */
	mappedData.appeal.costsDecision = {
		id: 'costs-decision',
		display: {
			tableItem: [
				{
					text: 'Costs decision',
					classes: 'appeal-costs-decision-documentation'
				},
				{
					text: appealHasCostsDecisionDocuments ? 'Uploaded' : '',
					classes: 'appeal-costs-decision-status'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasCostsDecisionDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/decision/manage-documents/${appealDetails?.costs?.decisionFolder?.folderId}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" data-cy="add-costs-decision" href="${currentRoute}/costs/decision/upload-documents/${
						appealDetails?.costs?.decisionFolder?.folderId
					}" >Add</a></li></ul>`,
					classes: 'appeal-costs-decision-actions'
				}
			]
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.issueDeterminationDate = {
		id: 'issue-determination',
		display: {
			summaryListItem: {
				key: {
					text: 'Issue determination'
				},
				value: {
					html:
						dateToDisplayDate(appealDetails.appealTimetable?.issueDeterminationDate) ||
						'Due date not yet set'
				},
				actions: {
					items: [
						{
							text: appealDetails.appealTimetable?.issueDeterminationDate ? 'Change' : 'Schedule',
							href: `${currentRoute}/appeal-timetables/issue-determination`,
							attributes: {
								'data-cy':
									(appealDetails.appealTimetable?.issueDeterminationDate ? 'change' : 'schedule') +
									'-issue-determination'
							}
						}
					]
				},
				classes: 'appeal-issue-determination'
			}
		}
	};

	/** @type {Instructions} */
	mappedData.appeal.completeDate = {
		id: 'complete-date',
		display: {
			summaryListItem: {
				key: {
					text: 'Complete'
				},
				value: {
					html:
						dateToDisplayDate(appealDetails.appealTimetable?.completeDate) || 'Due date not yet set'
				},
				actions: {
					items: [
						{
							text: appealDetails.appealTimetable?.completeDate ? 'Change' : 'Schedule',
							href: `${currentRoute}/change-appeal-details/complete-date`,
							attributes: {
								'data-cy':
									(appealDetails.appealTimetable?.completeDate ? 'change' : 'schedule') +
									'-complete-date'
							}
						}
					]
				},
				classes: 'appeal-complete-date'
			}
		}
	};

	return mappedData;
}

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {string}
 */
export function generateLinkedAppealsManageLinkHref(appealDetails) {
	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals`;

	if (appealDetails.linkedAppeals.length > 0) {
		return `${baseUrl}/manage`;
	}

	return `${baseUrl}/add`;
}

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {DisplayInstructions}
 */
function mapLeadOrChildStatus(appealDetails) {
	if (appealDetails.linkedAppeals.length > 0) {
		return {
			statusTag: {
				status: linkedAppealStatus(
					appealDetails.isParentAppeal || false,
					appealDetails.isChildAppeal || false
				),
				classes: 'govuk-!-margin-left-1 govuk-!-margin-bottom-4'
			}
		};
	}

	return {};
}

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @returns {string}
 */
function generateAppealDecisionActionListItems(appealDetails) {
	switch (appealDetails.appealStatus) {
		case APPEAL_CASE_STATUS.ISSUE_DETERMINATION: {
			return `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${generateIssueDecisionUrl(
				appealDetails.appealId
			)}">Issue</a></li>`;
		}
		case APPEAL_CASE_STATUS.COMPLETE: {
			return `<li class="govuk-summary-list__actions-list-item">${generateDecisionDocumentDownloadHtml(
				appealDetails
			)}</li>`;
		}
		default: {
			return '';
		}
	}
}

/**
 * @param {import('#appeals/appeal-details/appeal-details.types.js').WebAppeal} appealDetails
 * @param {string} [linkText]
 * @returns {string}
 */
export function generateDecisionDocumentDownloadHtml(appealDetails, linkText = 'View') {
	const virusCheckStatus = mapVirusCheckStatus(
		appealDetails.decision.virusCheckStatus || AVSCAN_STATUS.NOT_SCANNED
	);

	let html = '';

	if (virusCheckStatus.checked) {
		if (virusCheckStatus.safe) {
			html = `<a class="govuk-link" href="${
				appealDetails.decision?.documentId
					? mapDocumentDownloadUrl(appealDetails.appealId, appealDetails.decision?.documentId)
					: '#'
			}">${linkText}</a>`;
		} else {
			html = '<strong class="govuk-tag govuk-tag--red single-line">Virus detected</strong>';
		}
	} else {
		html = '<strong class="govuk-tag govuk-tag--yellow single-line">Virus scanning</strong>';
	}

	return html;
}
