import { SiteSafety } from './site-safety.js';
import { SiteAccess } from './site-access.js';

const lpaQuestionnaire = {
	type: 'object',
	required: [],
	nullable: true,
	properties: {
		siteAccessRequired: {
			...SiteAccess
		},
		healthAndSafety: {
			...SiteSafety
		},
		isGreenBelt: {
			type: 'boolean',
			nullable: true
		},
		isAffectingNeighbouringSites: {
			type: 'boolean',
			nullable: true
		},
		lpaProcedurePreference: {
			type: 'string',
			nullable: true
		},
		lpaProcedurePreferenceDetails: {
			type: 'string',
			nullable: true
		},
		lpaProcedurePreferenceDuration: {
			type: 'number',
			nullable: true
		}
	}
};

export const LpaQuestionnaire = lpaQuestionnaire;

/* Common */
// id                                        Int                                         @id @default(autoincrement())
// appeal                                    Appeal                                      @relation(fields: [appealId], references: [id])
// appealId                                  Int                                         @unique
// lpaQuestionnaireIncompleteReasonsSelected LPAQuestionnaireIncompleteReasonsSelected[]
// lpaQuestionnaireValidationOutcome         LPAQuestionnaireValidationOutcome?          @relation(fields: [lpaQuestionnaireValidationOutcomeId], references: [id])
// lpaQuestionnaireValidationOutcomeId       Int?
// lpaNotificationMethods                    LPANotificationMethodsSelected[]
// lpaqCreatedDate                           DateTime                                    @default(now())
// lpaQuestionnaireSubmittedDate             DateTime?
// lpaStatement                              String?
// newConditionDetails                       String?
// siteAccessDetails                         String?
// siteSafetyDetails                         String?
// listedBuildingDetails                     ListedBuildingSelected[]
// isCorrectAppealType                       Boolean?
// inConservationArea                        Boolean?
// lpaCostsAppliedFor                        Boolean?
// isGreenBelt                               Boolean?
// isAffectingNeighbouringSites              Boolean?

/* S78 */

// affectsScheduledMonument            Boolean?
// hasProtectedSpecies                 Boolean?
// isAonbNationalLandscape             Boolean?
// designatedSitesNames                String?
// isGypsyOrTravellerSite              Boolean?
// isPublicRightOfWay                  Boolean?
// eiaEnvironmentalImpactSchedule      String?
// eiaDevelopmentDescription           String?
// eiaSensitiveAreaDetails             String?
// eiaColumnTwoThreshold               Boolean?
// eiaScreeningOpinion                 Boolean?
// eiaRequiresEnvironmentalStatement   Boolean?
// eiaCompletedEnvironmentalStatement  Boolean?
// eiaConsultedBodiesDetails           String?
// hasStatutoryConsultees              Boolean?
// hasInfrastructureLevy               Boolean?
// isInfrastructureLevyFormallyAdopted Boolean?
// infrastructureLevyAdoptedDate       DateTime?
// infrastructureLevyExpectedDate      DateTime?
// lpaProcedurePreference              String?
// lpaProcedurePreferenceDetails       String?
// lpaProcedurePreferenceDuration      Int?
// lpaFinalCommentDetails              String?
// lpaAddedWitnesses                   Boolean?
// siteWithinSSSI                      Boolean?
// reasonForNeighbourVisits            String?
// importantInformation                String?
// redeterminedIndicator               String?
// dateCostsReportDespatched           DateTime?
// dateNotRecoveredOrDerecovered       DateTime?
// dateRecovered                       DateTime?
// originalCaseDecisionDate            DateTime?
// targetDate                          DateTime?
// siteNoticesSentDate                 DateTime?
