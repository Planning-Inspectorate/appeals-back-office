// @ts-nocheck
/* eslint-disable jest/expect-expect */
import { APPEAL_CASE_PROCEDURE, APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';
import { appealData } from '#testing/app/fixtures/referencedata.js';
import { getRequiredActionsForAppeal } from '../required-actions.js';

describe('required actions', () => {
	describe('getRequiredActionsForAppeal', () => {
		const pastDate = '2025-01-06T23:59:00.000Z';
		const futureDate = '3000-01-06T23:59:00.000Z';

		it('should return "assignCaseOfficer" if appeal status is "ASSIGN_CASE_OFFICER"', () => {
			expect(
				getRequiredActionsForAppeal(
					{
						...appealData,
						appealStatus: APPEAL_CASE_STATUS.ASSIGN_CASE_OFFICER
					},
					'detail'
				)
			).toEqual(['assignCaseOfficer']);
		});

		it('should return "startAppeal" if appeal status is "READY_TO_START"', () => {
			expect(
				getRequiredActionsForAppeal(
					{
						...appealData,
						appealStatus: APPEAL_CASE_STATUS.READY_TO_START
					},
					'detail'
				)
			).toEqual(['startAppeal']);
		});

		it('should return "addHorizonReference" if appeal status is "AWAITING_TRANSFER"', () => {
			expect(
				getRequiredActionsForAppeal(
					{
						...appealData,
						appealStatus: APPEAL_CASE_STATUS.AWAITING_TRANSFER
					},
					'detail'
				)
			).toEqual(['addHorizonReference']);
		});

		it('should return "arrangeSiteVisit" if appeal status is "EVENT" and no siteVisit exists', () => {
			expect(
				getRequiredActionsForAppeal(
					{
						...appealData,
						siteVisit: undefined,
						appealStatus: APPEAL_CASE_STATUS.EVENT
					},
					'detail'
				)
			).toEqual(['arrangeSiteVisit']);
		});

		it('should return "issueDecision" if appeal status is "ISSUE_DETERMINATION"', () => {
			expect(
				getRequiredActionsForAppeal(
					{
						...appealData,
						appealStatus: APPEAL_CASE_STATUS.ISSUE_DETERMINATION
					},
					'detail'
				)
			).toEqual(['issueDecision']);
		});

		describe('when appeal status is "VALIDATION"', () => {
			const appealDataWithValidationStatus = {
				...appealData,
				appealStatus: APPEAL_CASE_STATUS.VALIDATION
			};

			it('should return "appellantCaseOverdue" if the appellant case due date has passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithValidationStatus,
							documentationSummary: {
								...appealDataWithValidationStatus.documentationSummary,
								appellantCase: {
									...appealDataWithValidationStatus.documentationSummary.appellantCase,
									dueDate: pastDate
								}
							}
						},
						'detail'
					)
				).toEqual(['appellantCaseOverdue']);
			});

			it('should return "awaitingAppellantUpdate" if the appellant case due date has not passed, and the appellant case is marked as incomplete', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithValidationStatus,
							documentationSummary: {
								...appealDataWithValidationStatus.documentationSummary,
								appellantCase: {
									...appealDataWithValidationStatus.documentationSummary.appellantCase,
									dueDate: futureDate,
									status: 'Incomplete'
								}
							}
						},
						'detail'
					)
				).toEqual(['awaitingAppellantUpdate']);
			});

			it('should return "reviewAppellantCase" if the appellant case due date has not passed, and the appellant case has been received and is not marked as incomplete', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithValidationStatus,
							documentationSummary: {
								...appealDataWithValidationStatus.documentationSummary,
								appellantCase: {
									...appealDataWithValidationStatus.documentationSummary.appellantCase,
									dueDate: futureDate,
									status: 'received'
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewAppellantCase']);
			});
		});

		describe('when appeal status is "LPA_QUESTIONNAIRE"', () => {
			const appealDataWithLPAQuestionnaireStatus = {
				...appealData,
				appealStatus: APPEAL_CASE_STATUS.LPA_QUESTIONNAIRE
			};

			it('should return "reviewLpaQuestionnaire" if the lpa questionnaire has been received, and is not marked as incomplete, and the lpa questionnaire due date has not passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithLPAQuestionnaireStatus,
							documentationSummary: {
								...appealDataWithLPAQuestionnaireStatus.documentationSummary,
								lpaQuestionnaire: {
									...appealDataWithLPAQuestionnaireStatus.documentationSummary.lpaQuestionnaire,
									status: 'received',
									dueDate: futureDate
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewLpaQuestionnaire']);
			});

			it('should return "reviewLpaQuestionnaire" if the lpa questionnaire has been received, and is not marked as incomplete, and the lpa questionnaire due date has passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithLPAQuestionnaireStatus,
							documentationSummary: {
								...appealDataWithLPAQuestionnaireStatus.documentationSummary,
								lpaQuestionnaire: {
									...appealDataWithLPAQuestionnaireStatus.documentationSummary.lpaQuestionnaire,
									status: 'received',
									dueDate: pastDate
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewLpaQuestionnaire']);
			});

			it('should return "awaitingLpaQuestionnaire" if the lpa questionnaire has not been received, and the lpa questionnaire due date has not passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithLPAQuestionnaireStatus,
							documentationSummary: {
								...appealDataWithLPAQuestionnaireStatus.documentationSummary,
								lpaQuestionnaire: {
									...appealDataWithLPAQuestionnaireStatus.documentationSummary.lpaQuestionnaire,
									status: 'not_received',
									dueDate: futureDate
								}
							}
						},
						'detail'
					)
				).toEqual(['awaitingLpaQuestionnaire']);
			});

			it('should return "lpaQuestionnaireOverdue" if the lpa questionnaire has not been received, and the lpa questionnaire due date has passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithLPAQuestionnaireStatus,
							documentationSummary: {
								...appealDataWithLPAQuestionnaireStatus.documentationSummary,
								lpaQuestionnaire: {
									...appealDataWithLPAQuestionnaireStatus.documentationSummary.lpaQuestionnaire,
									status: 'not_received',
									dueDate: pastDate
								}
							}
						},
						'detail'
					)
				).toEqual(['lpaQuestionnaireOverdue']);
			});

			it('should return "awaitingLpaUpdate" if the lpa questionnaire has been received, and is marked as incomplete, and the lpa questionnaire due date has not passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithLPAQuestionnaireStatus,
							documentationSummary: {
								...appealDataWithLPAQuestionnaireStatus.documentationSummary,
								lpaQuestionnaire: {
									...appealDataWithLPAQuestionnaireStatus.documentationSummary.lpaQuestionnaire,
									status: 'Incomplete',
									dueDate: futureDate
								}
							}
						},
						'detail'
					)
				).toEqual(['awaitingLpaUpdate']);
			});
		});

		describe('when appeal status is "STATEMENTS"', () => {
			const appealDataWithStatementsStatus = {
				...appealData,
				appealStatus: APPEAL_CASE_STATUS.STATEMENTS
			};

			describe('shareIpCommentsAndLpaStatement, progressFromStatements', () => {
				const appealDataWithBothDueDatesPassed = {
					...appealDataWithStatementsStatus,
					appealTimetable: {
						...appealDataWithStatementsStatus.appealTimetable,
						ipCommentsDueDate: pastDate,
						lpaStatementDueDate: pastDate
					}
				};

				it('should return "shareIpCommentsAndLpaStatement" if ip comments due date and statements due date have both passed, and there are no ip comments or lpa statement awaiting review, and there are ip comments to share but no lpa statement to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithBothDueDatesPassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 0,
											valid: 1,
											published: 0
										}
									},
									lpaStatement: {
										status: 'not_received',
										receivedAt: null,
										representationStatus: null
									}
								}
							},
							'detail'
						)
					).toEqual(['shareIpCommentsAndLpaStatement']);
				});

				it('should return "shareIpCommentsAndLpaStatement" if ip comments due date and statements due date have both passed, and there are no ip comments or lpa statement awaiting review, and there are no ip comments to share but there is an lpa statement to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithBothDueDatesPassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'not_received',
										counts: {
											awaiting_review: 0,
											valid: 0,
											published: 0
										}
									},
									lpaStatement: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareIpCommentsAndLpaStatement']);
				});

				it('should return "shareIpCommentsAndLpaStatement" if ip comments due date and statements due date have both passed, and there are no ip comments or lpa statement awaiting review, and there are ip comments to share and an lpa statement to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithBothDueDatesPassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 0,
											valid: 1,
											published: 0
										}
									},
									lpaStatement: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareIpCommentsAndLpaStatement']);
				});

				it('should return "progressFromStatements" if ip comments due date and statements due date have both passed, and there are no ip comments or lpa statement awaiting review, and there are no ip comments or lpa statement to share', () => {
					expect(
						getRequiredActionsForAppeal({
							...appealDataWithBothDueDatesPassed,
							documentationSummary: {
								...appealDataWithStatementsStatus.documentationSummary,
								ipComments: {
									status: 'not_received',
									counts: {
										awaiting_review: 0,
										valid: 0,
										published: 0
									}
								},
								lpaStatement: {
									status: 'not_received',
									receivedAt: null,
									representationStatus: null
								}
							}
						})
					).toEqual(['progressFromStatements']);
				});

				it('should return "shareIpCommentsAndLpaStatement" and "updateLpaStatement" if ip comments due date and statements due date have both passed, and there are no ip comments or lpa statement awaiting review, and there is an lpa statement to share, and the lpa statement is marked as incomplete', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithBothDueDatesPassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									lpaStatement: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'incomplete'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareIpCommentsAndLpaStatement', 'updateLpaStatement']);
				});
			});

			describe('reviewIpComments', () => {
				it('should return "reviewIpComments" if there are ip comments awaiting review, and neither the ip comments due date nor the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});

				it('should return "reviewIpComments" if there are ip comments awaiting review, and the ip comments due date has passed but the lpa statement due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});

				it('should return "reviewIpComments" if there are ip comments awaiting review, and the lpa statement due date has passed but the ip comments due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});

				it('should return "reviewIpComments" if there are ip comments awaiting review, and both the ip comments due date and the lpa statement due date have passed and the lpa statement is awaiting review', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									},
									lpaStatement: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'awaiting_review'
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});

				it('should return "reviewIpComments" if there are ip comments awaiting review, and both the ip comments due date and the lpa statement due date have passed and the lpa statement has not been received', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									},
									lpaStatement: {
										status: 'not_received',
										receivedAt: null,
										representationStatus: null
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});

				it('should return "reviewIpComments" if there are ip comments awaiting review, and both the ip comments due date and the lpa statement due date have passed and the lpa statement is not awaiting review', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									},
									lpaStatement: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toContain('reviewIpComments');
				});
			});

			describe('awaitingIpComments', () => {
				it('should return "awaitingIpComments" if there are no ip comments awaiting review, and neither the ip comments due date nor the lpa statement due date has passed', () => {
					const appealDataWithNeitherDueDatePassed = {
						...appealDataWithStatementsStatus,
						appealTimetable: {
							...appealDataWithStatementsStatus.appealTimetable,
							ipCommentsDueDate: futureDate,
							lpaStatementDueDate: futureDate
						}
					};

					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithNeitherDueDatePassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'not_received',
										counts: {
											awaiting_review: 0,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('awaitingIpComments');

					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithNeitherDueDatePassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 0,
											valid: 1,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('awaitingIpComments');
				});

				it('should return "awaitingIpComments" if there are no ip comments awaiting review, and the lpa statement due date has passed but the ip comments due date has not passed', () => {
					const appealDataWithStatementsDueDatePassed = {
						...appealDataWithStatementsStatus,
						appealTimetable: {
							...appealDataWithStatementsStatus.appealTimetable,
							ipCommentsDueDate: futureDate,
							lpaStatementDueDate: pastDate
						}
					};

					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsDueDatePassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'not_received',
										counts: {
											awaiting_review: 0,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('awaitingIpComments');

					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsDueDatePassed,
								documentationSummary: {
									...appealDataWithStatementsStatus.documentationSummary,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 0,
											valid: 1,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('awaitingIpComments');
				});
			});

			describe('awaitingLpaStatement', () => {
				const documentationSummaryWithLpaStatementNotReceived = {
					...appealDataWithStatementsStatus.documentationSummary,
					lpaStatement: {
						status: 'not_received',
						receivedAt: null,
						representationStatus: null
					}
				};

				it('should return "awaitingLpaStatement" if the lpa statement has not been received, and neither the ip comments due date nor the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementNotReceived
								}
							},
							'detail'
						)
					).toContain('awaitingLpaStatement');
				});

				it('should return "awaitingLpaStatement" if the lpa statement has not been received, and the ip comments due date has passed but the lpa statement due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementNotReceived
								}
							},
							'detail'
						)
					).toContain('awaitingLpaStatement');
				});

				it('should return "awaitingLpaStatement" if the lpa statement has not been received, and the lpa statement due date has passed but the ip comments due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementNotReceived
								}
							},
							'detail'
						)
					).toContain('awaitingLpaStatement');
				});

				it('should return "awaitingLpaStatement" if the lpa statement has not been received, and the lpa statement due date and ip comments due date have both passed, but there are ip comments awaiting review', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementNotReceived,
									ipComments: {
										status: 'received',
										counts: {
											awaiting_review: 1,
											valid: 0,
											published: 0
										}
									}
								}
							},
							'detail'
						)
					).toContain('awaitingLpaStatement');
				});
			});

			describe('reviewLpaStatement', () => {
				const documentationSummaryWithLpaStatementAwaitingReview = {
					...appealDataWithStatementsStatus.documentationSummary,
					lpaStatement: {
						status: 'received',
						receivedAt: pastDate,
						representationStatus: 'awaiting_review'
					}
				};

				it('should return "reviewLpaStatement" if the lpa statement has been received and is awaiting review, and neither the ip comments due date nor the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementAwaitingReview
								}
							},
							'detail'
						)
					).toContain('reviewLpaStatement');
				});

				it('should return "reviewLpaStatement" if the lpa statement has been received and is awaiting review, and the ip comments due date has passed but the lpa statement due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementAwaitingReview
								}
							},
							'detail'
						)
					).toContain('reviewLpaStatement');
				});

				it('should return "reviewLpaStatement" if the lpa statement has been received and is awaiting review, and the lpa statement due date has passed but the ip comments due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementAwaitingReview
								}
							},
							'detail'
						)
					).toContain('reviewLpaStatement');
				});

				it('should return "reviewLpaStatement" if the lpa statement has been received and is awaiting review, and both the ip comments due date and the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementAwaitingReview
								}
							},
							'detail'
						)
					).toContain('reviewLpaStatement');
				});
			});

			describe('updateLpaStatement', () => {
				const documentationSummaryWithLpaStatementIncomplete = {
					...appealDataWithStatementsStatus.documentationSummary,
					lpaStatement: {
						status: 'received',
						receivedAt: pastDate,
						representationStatus: 'incomplete'
					}
				};

				it('should return "updateLpaStatement" if the lpa statement has been received and is marked as incomplete, and neither the ip comments due date nor the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementIncomplete
								}
							},
							'detail'
						)
					).toContain('updateLpaStatement');
				});

				it('should return "updateLpaStatement" if the lpa statement has been received and is marked as incomplete, and the ip comments due date has passed but the lpa statement due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: futureDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementIncomplete
								}
							},
							'detail'
						)
					).toContain('updateLpaStatement');
				});

				it('should return "updateLpaStatement" if the lpa statement has been received and is marked as incomplete, and the lpa statement due date has passed but the ip comments due date has not passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: futureDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementIncomplete
								}
							},
							'detail'
						)
					).toContain('updateLpaStatement');
				});

				it('should return "updateLpaStatement" if the lpa statement has been received and is marked as incomplete, and both the ip comments due date and the lpa statement due date have passed', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithStatementsStatus,
								appealTimetable: {
									...appealDataWithStatementsStatus.appealTimetable,
									ipCommentsDueDate: pastDate,
									lpaStatementDueDate: pastDate
								},
								documentationSummary: {
									...documentationSummaryWithLpaStatementIncomplete
								}
							},
							'detail'
						)
					).toContain('updateLpaStatement');
				});
			});
		});

		describe('when appeal status is "FINAL_COMMENTS"', () => {
			const appealDataWithFinalCommentsStatus = {
				...appealData,
				appealStatus: APPEAL_CASE_STATUS.FINAL_COMMENTS
			};
			const appealDataWithNoFinalCommentsAwaitingReview = {
				...appealDataWithFinalCommentsStatus,
				documentationSummary: {
					...appealDataWithFinalCommentsStatus.documentationSummary,
					appellantFinalComments: {
						status: 'not_received',
						receivedAt: null,
						representationStatus: null
					},
					lpaFinalComments: {
						status: 'not_received',
						receivedAt: null,
						representationStatus: null
					}
				}
			};

			describe('shareFinalComments', () => {
				it('should return "shareFinalComments" if there are no final comments awaiting review, and the final comments due date has passed, and there are appellant final comments to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithNoFinalCommentsAwaitingReview,
								documentationSummary: {
									...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
									appellantFinalComments: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareFinalComments']);
				});

				it('should return "shareFinalComments" if there are no final comments awaiting review, and the final comments due date has passed, and there are lpa final comments to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithNoFinalCommentsAwaitingReview,
								documentationSummary: {
									...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
									lpaFinalComments: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareFinalComments']);
				});

				it('should return "shareFinalComments" if there are no final comments awaiting review, and the final comments due date has passed, and there are both appellant and lpa final comments to share', () => {
					expect(
						getRequiredActionsForAppeal(
							{
								...appealDataWithNoFinalCommentsAwaitingReview,
								documentationSummary: {
									...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
									appellantFinalComments: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									},
									lpaFinalComments: {
										status: 'received',
										receivedAt: pastDate,
										representationStatus: 'valid'
									}
								}
							},
							'detail'
						)
					).toEqual(['shareFinalComments']);
				});
			});

			it('should return "progressFromFinalComments" if there are no final comments awaiting review, and the final comments due date has passed, and there are no final comments to share', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithNoFinalCommentsAwaitingReview
						},
						'detail'
					)
				).toEqual(['progressFromFinalComments']);
			});

			it('should return "awaitingFinalComments" if there are no final comments awaiting review, and the final comments due date has not passed', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithNoFinalCommentsAwaitingReview,
							appealTimetable: {
								...appealDataWithNoFinalCommentsAwaitingReview.appealTimetable,
								finalCommentsDueDate: futureDate
							}
						},
						'detail'
					)
				).toEqual(['awaitingFinalComments']);
			});

			it('should return "reviewAppellantFinalComments" if there are appellant final comments awaiting review', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithNoFinalCommentsAwaitingReview,
							documentationSummary: {
								...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
								appellantFinalComments: {
									status: 'received',
									receivedAt: pastDate,
									representationStatus: 'awaiting_review'
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewAppellantFinalComments']);
			});

			it('should return "reviewLpaFinalComments" if there are lpa final comments awaiting review', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithNoFinalCommentsAwaitingReview,
							documentationSummary: {
								...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
								lpaFinalComments: {
									status: 'received',
									receivedAt: pastDate,
									representationStatus: 'awaiting_review'
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewLpaFinalComments']);
			});

			it('should return "reviewAppellantFinalComments" and "reviewLpaFinalComments" if there are both appellant and lpa final comments awaiting review', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealDataWithNoFinalCommentsAwaitingReview,
							documentationSummary: {
								...appealDataWithNoFinalCommentsAwaitingReview.documentationSummary,
								appellantFinalComments: {
									status: 'received',
									receivedAt: pastDate,
									representationStatus: 'awaiting_review'
								},
								lpaFinalComments: {
									status: 'received',
									receivedAt: pastDate,
									representationStatus: 'awaiting_review'
								}
							}
						},
						'detail'
					)
				).toEqual(['reviewAppellantFinalComments', 'reviewLpaFinalComments']);
			});

			it('should return "setup hearing" if appeal status is "EVENT"', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealData,
							hearing: null,
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							appealStatus: APPEAL_CASE_STATUS.EVENT
						},
						'detail'
					)
				).toEqual(['setupHearing']);
			});

			it('should return "add hearing address" if appeal status is "EVENT"', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealData,
							hearing: {
								...appealData.hearing,
								addressId: null,
								address: null
							},
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							appealStatus: APPEAL_CASE_STATUS.EVENT
						},
						'detail'
					)
				).toEqual(['addHearingAddress']);
			});

			it('should return "setup hearing" if appeal status is "EVENT" and view is summary', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealData,
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							appealStatus: APPEAL_CASE_STATUS.EVENT
						},
						'summary'
					)
				).toEqual(['setupHearing']);
			});

			it('should return "add hearing address" if appeal status is "EVENT" and view is summary', () => {
				expect(
					getRequiredActionsForAppeal(
						{
							...appealData,
							isHearingSetup: true,
							hasHearingAddress: null,
							procedureType: APPEAL_CASE_PROCEDURE.HEARING,
							appealStatus: APPEAL_CASE_STATUS.EVENT
						},
						'summary'
					)
				).toEqual(['addHearingAddress']);
			});
		});
	});
});
