import { convertFromBooleanToYesNo } from '../boolean-formatter.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { dateToDisplayDate } from '#lib/dates.js';
import * as displayPageFormatter from '#lib/display-page-formatter.js';
import usersService from '../../appeals/appeal-users/users-service.js';
import config from '#environment/config.js';
import { surnameFirstToFullName } from '#lib/person-name-formatter.js';
import {
	conditionalFormatter,
	dateAndTimeFormatter,
	mapAddressInput
} from './global-mapper-formatter.js';
import { convert24hTo12hTimeStringFormat } from '#lib/times.js';
import { linkedAppealStatus } from '#lib/appeals-formatter.js';
import { generateIssueDecisionUrl } from '#appeals/appeal-details/issue-decision/issue-decision.mapper.js';
import { mapActionComponent } from './component-permissions.mapper.js';
import { permissionNames } from '#environment/permissions.js';
import { formatServiceUserAsHtmlList } from '#lib/service-user-formatter.js';

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
							visuallyHiddenText: 'Appeal type'
						})
					]
				},
				classes: 'appeal-appeal-type'
			}
		},
		input: {
			displayName: 'Appeal type',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'appeal-type',
						items: [
							{
								value: '1013',
								text: 'Householder planning',
								checked:
									displayPageFormatter.nullToEmptyString(appealDetails.appealType) === 'Householder'
							}
						]
					}
				}
			]
		},
		submitApi: '#',
		inputItemApi: '#'
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
							visuallyHiddenText: 'Case procedure'
						})
					]
				},
				classes: 'appeal-case-procedure'
			}
		},
		input: {
			displayName: 'Case procedure',
			instructions: [
				{
					type: 'checkboxes',
					properties: {
						name: 'case-procedure',
						items: [
							{
								value: '3',
								text: 'Written Representation',
								checked: appealDetails.procedureType === 'Written'
							},
							{
								value: '1',
								text: 'Hearing',
								checked: appealDetails.procedureType === 'Hearing'
							},
							{
								value: '2',
								text: 'Inquiry',
								checked: appealDetails.procedureType === 'Inquiry'
							}
						]
					}
				}
			]
		},
		submitApi: `/appeals/${appealDetails.appealId}/lpa-questionnaire/${appealDetails.lpaQuestionnaireId}`,
		inputItemApi: '#'
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
							visuallyHiddenText: 'Appellant'
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
							visuallyHiddenText: 'Agent'
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
													visuallyHiddenText: 'Linked appeals'
												}
										  ]
										: []),
									{
										text: 'Add',
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/linked-appeals/add`,
										visuallyHiddenText: 'Linked appeals'
									}
							  ])
							: []
				},
				classes: 'appeal-linked-appeals'
			}
		},
		input: {
			displayName: 'Linked appeals',
			instructions: [
				{
					type: 'input',
					properties: {
						id: 'linked-appeals',
						name: 'linkedAppeals',
						value: displayPageFormatter.nullToEmptyString(appealDetails.linkedAppeals),
						label: {
							text: 'What appeals are linked to this appeal?'
						}
					}
				}
			]
		},
		submitApi: '#'
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
				visuallyHiddenText: 'Related appeals'
			})
		);
	}

	otherAppealsItems.push(
		mapActionComponent(permissionNames.updateCase, session, {
			text: 'Add',
			href: `${currentRoute}/other-appeals/add`,
			visuallyHiddenText: 'Related appeals'
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
		},
		input: {
			displayName: 'Related appeals',
			instructions: [
				{
					type: 'input',
					properties: {
						id: 'other-appeals',
						name: 'otherAppeals',
						value: displayPageFormatter.nullToEmptyString(appealDetails.otherAppeals),
						label: {
							text: 'What appeals are the other associated with this appeal?'
						}
					}
				}
			]
		},
		submitApi: '#'
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
							visuallyHiddenText: 'Allocation level'
						})
					]
				},
				classes: 'appeal-allocation-details'
			}
		},
		input: {
			// TODO: Multipage change?
			displayName: 'Allocation level',
			instructions: [
				{
					type: 'checkboxes',
					properties: {
						name: 'allocationDetails',
						items: [
							{
								value: '3',
								text: 'Written Representation',
								hint: {
									text: 'For appeals where the issues are clear from written statements and a site visit. This is the quickest and most common way to make an appeal.'
								},
								checked: appealDetails.procedureType === 'Written'
							},
							{
								value: '1',
								text: 'Hearing',
								hint: {
									text: 'For appeals with more complex issues. The Inspector leads a discussion to answer questions they have about the appeal.'
								},
								checked: appealDetails.procedureType === 'Hearing'
							},
							{
								value: '2',
								text: 'Inquiry',
								hint: {
									text: 'For appeals with very complex issues. Appeal evidence is tested by legal representatives, who question witnesses under oath.'
								},
								checked: appealDetails.procedureType === 'Inquiry'
							}
						]
					}
				}
			]
		},
		submitApi: '#'
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
							visuallyHiddenText: 'L P A reference'
						}
					]
				},
				classes: 'appeal-lpa-reference'
			}
		}
	};

	// TODO: Add radio options
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
		},
		input: {
			displayName: 'Decision',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'appealDecision',
						value: displayPageFormatter.nullToEmptyString(appealDetails.decision),
						items: [
							{
								text: '',
								value: '#'
							}
						]
					}
				}
			]
		},
		submitApi: '#'
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
							visuallyHiddenText: 'site address'
						}
					]
				},
				classes: 'appeal-site-address'
			}
		},
		input: {
			instructions: mapAddressInput(appealDetails.appealSite)
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
							visuallyHiddenText: 'local planning authority (LPA)'
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
							visuallyHiddenText: 'inspection access (L P A answer)'
						}
					]
				},
				classes: 'appeal-lpa-inspector-access'
			}
		},
		input: {
			displayName: 'Inspection access (LPA answer)',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'lpaInspectorAccess',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								conditional: conditionalFormatter(
									'lpa-inspector-access-text',
									'lpaInspectorAccessText',
									'Tell us why the inspector will need to enter the appeal site',
									displayPageFormatter.nullToEmptyString(
										appealDetails.inspectorAccess.lpaQuestionnaire.details
									)
								),
								checked: appealDetails.inspectorAccess.lpaQuestionnaire.isRequired
							},
							{
								text: 'No',
								value: 'no',
								checked: !appealDetails.inspectorAccess.lpaQuestionnaire.isRequired
							}
						]
					}
				}
			]
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
							visuallyHiddenText: 'inspection access (appellant answer)'
						}
					]
				},
				classes: 'appeal-appellant-inspector-access'
			}
		},
		input: {
			displayName: 'Inspection access (appellant answer)',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'appellantCaseInspectorAccess',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								conditional: conditionalFormatter(
									'appellant-case-inspector-access-text',
									'appellantCaseInspectorAccessText',
									'Tell us why the inspector will need to enter the appeal site',
									displayPageFormatter.nullToEmptyString(
										appealDetails.inspectorAccess.appellantCase.details
									)
								),
								checked: appealDetails.inspectorAccess.appellantCase.isRequired
							},
							{
								text: 'No',
								value: 'no',
								checked: !appealDetails.inspectorAccess.appellantCase.isRequired
							}
						]
					}
				}
			]
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
						convertFromBooleanToYesNo(appealDetails.isAffectingNeighbouringSites) ||
						'No answer provided'
				},
				actions: {
					items: [
						{
							text: 'Change',
							href: `${currentRoute}/neighbouring-sites/change/affected`,
							visuallyHiddenText: 'could a neighbouring site be affected'
						}
					]
				},
				classes: 'appeal-neighbouring-site-is-affected'
			}
		},
		input: {
			displayName: 'Could a neighbouring site be affected?',
			instructions: [
				{
					type: 'radios',
					properties: {
						name: 'neighbouringSiteIsAffected',
						items: [
							{
								text: 'Yes',
								value: 'yes',
								checked: appealDetails.isAffectingNeighbouringSites
							},
							{
								text: 'No',
								value: 'no',
								checked: !appealDetails.isAffectingNeighbouringSites
							}
						]
					}
				}
			]
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
							visuallyHiddenText: 'Neighbouring sites (LPA)'
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
										visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)'
									}
							  ]
							: []),
						{
							text: 'Add',
							href: `${currentRoute}/neighbouring-sites/add/back-office`,
							visuallyHiddenText: 'Neighbouring sites (inspector and or third party request)'
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
							visuallyHiddenText: 'potential safety risks (L P A answer)'
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
							visuallyHiddenText: 'potential safety risks (appellant answer)'
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
							visuallyHiddenText: 'visit type'
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
										'The date all case documentation was received and the appeal was valid'
							  }
							: {}
					]
				},
				classes: 'appeal-valid-date'
			}
		}
	};

	let startedAtActionLink = {};

	if (appealDetails.validAt) {
		if (appealDetails.startedAt) {
			startedAtActionLink = {
				text: 'Change',
				href: `${currentRoute}/#`
			};
		} else {
			startedAtActionLink = {
				text: 'Add',
				href: `${currentRoute}/start-case/add`,
				visuallyHiddenText: 'The date the case was started'
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
					items: [startedAtActionLink]
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
							visuallyHiddenText: 'L P A questionnaire due'
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
							visuallyHiddenText: 'statement review due date'
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
							visuallyHiddenText: 'final comment review due date'
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
							visuallyHiddenText: 'site visit'
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
							visuallyHiddenText: 'case officer'
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
							visuallyHiddenText: 'inspector'
						}
					]
				},
				classes: 'appeal-inspector'
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
							? `<a href="${currentRoute}/appellant-case" class="govuk-link">Review <span class="govuk-visually-hidden">appellant case</span></a>`
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
							? `<a href="${currentRoute}/lpa-questionnaire/${appealDetails?.lpaQuestionnaireId}" class="govuk-link">Review <span class="govuk-visually-hidden">L P A questionnaire</span></a>`
							: ''
				}
			]
		}
	};

	const appealHasAppellantCostsDocuments = appealDetails?.costs?.appellantFolder?.documents?.filter(
		(document) => document.isDeleted === false
	).length;

	/** @type {Instructions} */
	mappedData.appeal.costsAppellant = {
		id: 'costs-appellant',
		display: {
			tableItem: [
				{
					text: 'Costs (appellant)',
					classes: 'appeal-costs-appellant-documentation'
				},
				{
					text: appealHasAppellantCostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-appellant-status'
				},
				{
					text: '',
					classes: 'appeal-costs-appellant-due-date'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasAppellantCostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/manage-documents/${appealDetails?.costs?.appellantFolder?.id}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/appellant/select-document-type/${
						appealDetails?.costs?.appellantFolder?.id
					}">Add</a></li></ul>`,
					classes: 'appeal-costs-appellant-actions'
				}
			]
		}
	};

	const appealHasLPACostsDocuments = appealDetails?.costs?.lpaFolder?.documents?.filter(
		(document) => document.isDeleted === false
	).length;

	/** @type {Instructions} */
	mappedData.appeal.costsLpa = {
		id: 'costs-lpa',
		display: {
			tableItem: [
				{
					text: 'Costs (LPA)',
					classes: 'appeal-costs-lpa-documentation'
				},
				{
					text: appealHasLPACostsDocuments ? 'Received' : '',
					classes: 'appeal-costs-lpa-status'
				},
				{
					text: '',
					classes: 'appeal-costs-lpa-due-date'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasLPACostsDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/manage-documents/${appealDetails?.costs?.lpaFolder?.id}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/lpa/select-document-type/${
						appealDetails?.costs?.lpaFolder?.id
					}">Add</a></li></ul>`,
					classes: 'appeal-costs-lpa-actions'
				}
			]
		}
	};

	const appealHasCostsDecisionDocuments = appealDetails?.costs?.decisionFolder?.documents?.filter(
		(document) => document.isDeleted === false
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
					text: '',
					classes: 'appeal-costs-decision-due-date'
				},
				{
					html: `<ul class="govuk-summary-list__actions-list">
						${
							appealHasCostsDecisionDocuments
								? `<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/decision/manage-documents/${appealDetails?.costs?.decisionFolder?.id}">Manage</a></li>`
								: ''
						}<li class="govuk-summary-list__actions-list-item"><a class="govuk-link" href="${currentRoute}/costs/decision/upload-documents/${
						appealDetails?.costs?.decisionFolder?.id
					}">Add</a></li></ul>`,
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
							href: `${currentRoute}/appeal-timetables/issue-determination`
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
							href: `${currentRoute}/change-appeal-details/complete-date`
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
