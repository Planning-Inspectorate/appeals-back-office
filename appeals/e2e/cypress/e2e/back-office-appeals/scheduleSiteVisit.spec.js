// @ts-nocheck
/// <reference types="cypress"/>

import { appealsApiRequests } from '../../fixtures/appealsApiRequests';
import { users } from '../../fixtures/users';
import { CaseDetailsPage } from '../../page_objects/caseDetailsPage';
import { CaseHistoryPage } from '../../page_objects/caseHistory/caseHistoryPage.js';
import { DateTimeSection } from '../../page_objects/dateTimeSection';
import { happyPathHelper } from '../../support/happyPathHelper';

let appeal;

const dateTimeSection = new DateTimeSection();
const caseDetailsPage = new CaseDetailsPage();
const caseHistoryPage = new CaseHistoryPage();

const setupHasTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase().then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'HAS');
	});
};

const setupCASPlanningTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'ZP' }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'CAS_PLANNING');
	});
};

const setupCASAdvertTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'ZA' }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'CAS_ADVERT');
	});
};

const setupS78TestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'W' }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S78', 'WRITTEN');
	});
};

const setupS20TestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'Y' }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'S20');
	});
};

const setupAdvertTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ caseType: 'H' }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'ADVERT');
	});
};

const setupEnforcementTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ ...appealsApiRequests.enforcementSubmission.casedata }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(ref, 'ASSIGN_CASE_OFFICER', 'LPA_QUESTIONNAIRE', 'ENFORCEMENT');
	});
};

const setupEnforcementListedBuildingTestCase = () => {
	cy.login(users.appeals.caseAdmin);
	cy.createCase({ ...appealsApiRequests.enforcementListedSubmission.casedata }).then((ref) => {
		appeal = ref;
		happyPathHelper.advanceTo(
			ref,
			'ASSIGN_CASE_OFFICER',
			'LPA_QUESTIONNAIRE',
			'ENFORCEMENT_LISTED'
		);
	});
};

// only has appeal types have site visit in the case timetable section
const appealTypesWithSiteVisitInCaseTimetableAndNotifyForAllVisitTypes = [
	['householder', setupHasTestCase],
	['CAS planning', setupCASPlanningTestCase],
	['CAS advertisement', setupCASAdvertTestCase]
];

// appeal types which send notifies for all three site visit types (unaccompanied, accompanied, access required)
const appealTypesWithoutSiteVisitInCaseTimetableAndNotifyForAllVisitTypes = [
	['full planning (S78)', setupS78TestCase],
	['listed building (S20)', setupS20TestCase],
	['full advertisement', setupAdvertTestCase]
];

// appeal types which don't send notifies for unaccompanied site visits
const appealTypesWithNotifyForAccompaniedAndAccessRequiredVisitTypes = [
	['enforcement notice', setupEnforcementTestCase],
	['enforcement listed building (elb)', setupEnforcementListedBuildingTestCase]
	//['lawful development certificate (ldc)', setupLdcTestCase], // TODO: add LDC test case when we have a way to create an LDC appeal
];

appealTypesWithSiteVisitInCaseTimetableAndNotifyForAllVisitTypes.forEach(
	([appealType, setupTestCase], index) => {
		describe(`Schedule site visit - ${appealType}`, () => {
			beforeEach(() => {
				setupTestCase();
			});

			afterEach(() => {
				cy.deleteAppeals(appeal);
			});

			const visitTypeTestCases = [
				['Accompanied', 'accompaniedSiteVisitScheduled'],
				['Access required', 'accessRequiredSiteVisitScheduled'],
				['Unaccompanied', 'unaccompaniedSiteVisitScheduled']
			];

			visitTypeTestCases.forEach(([visitType, caseHistoryCheckName], index) => {
				it(`Arrange ${visitType} visit from Site details`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');

					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
					caseHistoryPage.verifyCaseHistory(caseHistoryCheckName, appeal.reference);
				});

				it(`Arrange ${visitType} site visit with time from case timetable`, () => {
					caseDetailsPage.clickArrangeVisitTypeHasCaseTimetable();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');

					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('12', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
				});

				it(`Cancel Site Visit`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('12', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Cancel site visit');
					caseDetailsPage.clickButtonByText('Cancel site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
				});

				it('Missed Site Visit', () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), -28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('13', '00'); //
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('14', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Record missed site visit');
					caseDetailsPage.selectRadioButtonByValue('Appellant');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Record missed site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Missed site visit recorded');
					caseHistoryPage.verifyCaseHistory('missedSiteVisit', appeal.reference);
				});
			});

			it('should show an error when visit type is not selected', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				// Don’t select a radio button
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Select visit type');
				caseDetailsPage.validateInLineErrorMessage('Select visit type');
			});

			// start time only required for accompanied visits and access required
			// end time only required for access required
			// no times required for unnaccompanied visits
			it('should show a success banner when a past date is entered for the site visit', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), -28).then((pastDate) => {
					dateTimeSection.enterVisitDate(pastDate);
				});
				dateTimeSection.enterVisitStartTime('08', '00');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Set up site visit');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			});

			it('should show an error when the start time is after the end time', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Access required');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
					dateTimeSection.enterVisitDate(visitDate);
				});
				dateTimeSection.enterVisitStartTime('15', '00'); // 3:00 PM
				dateTimeSection.enterVisitEndTime('12', '00');

				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Start time must be before end time');
				caseDetailsPage.validateInLineErrorMessage('Start time must be before end time');
			});
		});
	}
);

appealTypesWithoutSiteVisitInCaseTimetableAndNotifyForAllVisitTypes.forEach(
	([appealType, setupTestCase], index) => {
		describe(`Schedule site visit - ${appealType}`, () => {
			beforeEach(() => {
				setupTestCase();
			});

			afterEach(() => {
				cy.deleteAppeals(appeal);
			});

			const visitTypeTestCases = [
				['Accompanied', 'accompaniedSiteVisitScheduled'],
				['Access required', 'accessRequiredSiteVisitScheduled'],
				['Unaccompanied', 'unaccompaniedSiteVisitScheduled']
			];

			visitTypeTestCases.forEach(([visitType, caseHistoryCheckName], index) => {
				it(`Arrange ${visitType} visit from Site details`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');

					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
					caseHistoryPage.verifyCaseHistory(caseHistoryCheckName, appeal.reference);
				});

				it(`Cancel Site Visit`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('12', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Cancel site visit');
					caseDetailsPage.clickButtonByText('Cancel site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
				});

				it('Missed Site Visit', () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), -28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('13', '00'); //
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('14', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Record missed site visit');
					caseDetailsPage.selectRadioButtonByValue('Appellant');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Record missed site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Missed site visit recorded');
					caseHistoryPage.verifyCaseHistory('missedSiteVisit', appeal.reference);
				});
			});

			it('should show an error when visit type is not selected', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				// Don’t select a radio button
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Select visit type');
				caseDetailsPage.validateInLineErrorMessage('Select visit type');
			});

			// start time only required for accompanied visits and access required
			// end time only required for access required
			// no times required for unnaccompanied visits
			it('should show a success banner when a past date is entered for the site visit', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), -28).then((pastDate) => {
					dateTimeSection.enterVisitDate(pastDate);
				});
				dateTimeSection.enterVisitStartTime('08', '00');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Set up site visit');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			});

			it('should show an error when the start time is after the end time', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Access required');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
					dateTimeSection.enterVisitDate(visitDate);
				});
				dateTimeSection.enterVisitStartTime('15', '00'); // 3:00 PM
				dateTimeSection.enterVisitEndTime('12', '00');

				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Start time must be before end time');
				caseDetailsPage.validateInLineErrorMessage('Start time must be before end time');
			});
		});
	}
);

appealTypesWithNotifyForAccompaniedAndAccessRequiredVisitTypes.forEach(
	([appealType, setupTestCase], index) => {
		describe(`Schedule site visit - ${appealType}`, () => {
			beforeEach(() => {
				setupTestCase();
			});

			afterEach(() => {
				cy.deleteAppeals(appeal);
			});

			const noNotifyVisitTypeTestCases = ['Unaccompanied'];
			const notifyVisitTypeTestCases = [
				['Accompanied', 'accompaniedSiteVisitScheduled'],
				['Access required', 'accessRequiredSiteVisitScheduled']
			];

			noNotifyVisitTypeTestCases.forEach((visitType, index) => {
				it(`Arrange ${visitType} visit from Site details`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');

					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
					caseDetailsPage.clickViewCaseHistory();
					caseHistoryPage.verifyNotCaseHistoryValue(
						`Inspector visit to appeal site: ${appeal.reference} sent to agent`
					);
					caseHistoryPage.verifyNotCaseHistoryValue(
						'Inspector visit to appeal site: ${appeal.reference} sent to LPA'
					);
				});

				it(`Cancel Site Visit`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('12', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Cancel site visit');
					caseDetailsPage.clickButtonByText('Cancel site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
				});

				it('Missed Site Visit', () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), -28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('13', '00'); //
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('14', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Record missed site visit');
					caseDetailsPage.selectRadioButtonByValue('Appellant');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Record missed site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Missed site visit recorded');
					caseHistoryPage.verifyCaseHistory('missedSiteVisit', appeal.reference);
				});
			});

			notifyVisitTypeTestCases.forEach(([visitType, caseHistoryCheckName], index) => {
				it(`Arrange ${visitType} visit from Site details`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');

					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.validateAnswer('Type', visitType, { matchQuestionCase: true });
					caseHistoryPage.verifyCaseHistory(caseHistoryCheckName, appeal.reference);
				});

				it(`Cancel Site Visit`, () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('08', '00');
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('12', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Cancel site visit');
					caseDetailsPage.clickButtonByText('Cancel site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit cancelled');
				});

				it('Missed Site Visit', () => {
					caseDetailsPage.clickSetUpSiteVisitType();
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch(visitType));
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
					caseDetailsPage.clickButtonByText('Continue');
					cy.getBusinessActualDate(new Date(), -28).then((visitDate) => {
						dateTimeSection.enterVisitDate(visitDate);
					});
					dateTimeSection.enterVisitStartTime('13', '00'); //
					if (visitType !== 'Unaccompanied') {
						dateTimeSection.enterVisitEndTime('14', '00');
					}
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Set up site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
					caseDetailsPage.clickLinkByText('Record missed site visit');
					caseDetailsPage.selectRadioButtonByValue('Appellant');
					caseDetailsPage.clickButtonByText('Continue');
					caseDetailsPage.clickButtonByText('Record missed site visit');
					caseDetailsPage.validateConfirmationPanelMessage('Success', 'Missed site visit recorded');
					caseHistoryPage.verifyCaseHistory('missedSiteVisit', appeal.reference);
				});
			});

			it('should show an error when visit type is not selected', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				// Don’t select a radio button
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Select visit type');
				caseDetailsPage.validateInLineErrorMessage('Select visit type');
			});

			// start time only required for accompanied visits and access required
			// end time only required for access required
			// no times required for unnaccompanied visits
			it('should show a success banner when a past date is entered for the site visit', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Unaccompanied');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), -28).then((pastDate) => {
					dateTimeSection.enterVisitDate(pastDate);
				});
				dateTimeSection.enterVisitStartTime('08', '00');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.clickButtonByText('Set up site visit');
				caseDetailsPage.validateConfirmationPanelMessage('Success', 'Site visit set up');
			});

			it('should show an error when the start time is after the end time', () => {
				caseDetailsPage.clickSetUpSiteVisitType();
				caseDetailsPage.selectRadioButtonByValue('Access required');
				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.selectRadioButtonByValue(caseDetailsPage.exactMatch('Yes'));
				caseDetailsPage.clickButtonByText('Continue');
				cy.getBusinessActualDate(new Date(), 28).then((visitDate) => {
					dateTimeSection.enterVisitDate(visitDate);
				});
				dateTimeSection.enterVisitStartTime('15', '00'); // 3:00 PM
				dateTimeSection.enterVisitEndTime('12', '00');

				caseDetailsPage.clickButtonByText('Continue');
				caseDetailsPage.validateErrorMessage('Start time must be before end time');
				caseDetailsPage.validateInLineErrorMessage('Start time must be before end time');
			});
		});
	}
);
