// @ts-nocheck
import {
	advertisementAppeal,
	casAdvertAppeal,
	casPlanningAppeal,
	fullPlanningAppeal,
	householdAppeal,
	listedBuildingAppeal
} from '#tests/appeals/mocks.js';

const houseAppealWithTimetable = {
	...householdAppeal,
	caseStartedDate: new Date(2022, 4, 18),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z')
	}
};

const advertisementAppealWithTimetable = {
	...advertisementAppeal,
	caseStartedDate: new Date(2022, 4, 18),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z')
	}
};

const casPlanningAppealWithTimetable = {
	...casPlanningAppeal,
	caseStartedDate: new Date(2022, 4, 18),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z')
	}
};

const casAdvertAppealWithTimetable = {
	...casAdvertAppeal,
	caseStartedDate: new Date(2022, 4, 18),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z')
	}
};

const fullPlanningAppealWithTimetable = {
	...fullPlanningAppeal,
	caseStartedDate: new Date(2022, 4, 22),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z'),
		lpaStatementDueDate: null
	}
};

const listedBuildingAppealWithTimetable = {
	...listedBuildingAppeal,
	caseStartedDate: new Date(2022, 4, 22),
	caseValidationDate: new Date(2022, 4, 20),
	caseValidDate: new Date(2022, 4, 20),
	appealTimetable: {
		appealId: 1,
		id: 101,
		lpaQuestionnaireDueDate: new Date('2023-05-16T01:00:00.000Z'),
		lpaStatementDueDate: null
	}
};

export {
	advertisementAppealWithTimetable,
	casAdvertAppealWithTimetable,
	casPlanningAppealWithTimetable,
	fullPlanningAppealWithTimetable,
	houseAppealWithTimetable,
	listedBuildingAppealWithTimetable
};
