/*
  Warnings:

  - You are about to drop the column `appellantCaseIncompleteReasonId` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `appellantCaseInvalidReasonId` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `communityInfrastructureLevyAdoptionDate` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `developmentDescription` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `doesAffectAListedBuilding` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `doesAffectAScheduledMonument` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `doesSiteHaveHealthAndSafetyIssues` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `doesSiteRequireInspectorAccess` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `extraConditions` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasCommunityInfrastructureLevy` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasCompletedAnEnvironmentalStatement` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasEmergingPlan` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasExtraConditions` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasOtherAppeals` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasProtectedSpecies` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasRepresentationsFromOtherParties` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasResponsesOrStandingAdviceToUpload` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasStatementOfCase` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasStatutoryConsultees` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasSupplementaryPlanningDocuments` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasTreePreservationOrder` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `healthAndSafetyDetails` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `inCAOrrelatesToCA` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `includesScreeningOption` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `inquiryDays` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `inspectorAccessDetails` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isAffectingNeighbouringSites` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isCommunityInfrastructureLevyFormallyAdopted` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isConservationArea` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isDevelopmentInOrNearDesignatedSites` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isEnvironmentalStatementRequired` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isGypsyOrTravellerSite` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isListedBuilding` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isPublicRightOfWay` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isSensitiveArea` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isSiteVisible` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `isTheSiteWithinAnAONB` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `meetsOrExceedsThresholdOrCriteriaInColumn2` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `receivedAt` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `sensitiveAreaDetails` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `statutoryConsulteesDetails` on the `LPAQuestionnaire` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCase] DROP CONSTRAINT [AppellantCase_appellantCaseIncompleteReasonId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCase] DROP CONSTRAINT [AppellantCase_appellantCaseInvalidReasonId_fkey];

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [appellantCaseIncompleteReasonId],
[appellantCaseInvalidReasonId];

ALTER TABLE [dbo].[LPAQuestionnaire] DROP CONSTRAINT [LPAQuestionnaire_sentAt_df];
-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [communityInfrastructureLevyAdoptionDate],
[developmentDescription],
[doesAffectAListedBuilding],
[doesAffectAScheduledMonument],
[doesSiteHaveHealthAndSafetyIssues],
[doesSiteRequireInspectorAccess],
[extraConditions],
[hasCommunityInfrastructureLevy],
[hasCompletedAnEnvironmentalStatement],
[hasEmergingPlan],
[hasExtraConditions],
[hasOtherAppeals],
[hasProtectedSpecies],
[hasRepresentationsFromOtherParties],
[hasResponsesOrStandingAdviceToUpload],
[hasStatementOfCase],
[hasStatutoryConsultees],
[hasSupplementaryPlanningDocuments],
[hasTreePreservationOrder],
[healthAndSafetyDetails],
[inCAOrrelatesToCA],
[includesScreeningOption],
[inquiryDays],
[inspectorAccessDetails],
[isAffectingNeighbouringSites],
[isCommunityInfrastructureLevyFormallyAdopted],
[isConservationArea],
[isDevelopmentInOrNearDesignatedSites],
[isEnvironmentalStatementRequired],
[isGypsyOrTravellerSite],
[isListedBuilding],
[isPublicRightOfWay],
[isSensitiveArea],
[isSiteVisible],
[isTheSiteWithinAnAONB],
[meetsOrExceedsThresholdOrCriteriaInColumn2],
[receivedAt],
[sensitiveAreaDetails],
[sentAt],
[statutoryConsulteesDetails];
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [inConservationArea] BIT,
[lpaCostsAppliedFor] BIT,
[lpaQuestionnaireSubmittedDate] DATETIME2,
[lpaStatement] NVARCHAR(1000),
[lpaqCreatedDate] DATETIME2 NOT NULL CONSTRAINT [LPAQuestionnaire_lpaqCreatedDate_df] DEFAULT CURRENT_TIMESTAMP,
[newConditionDetails] NVARCHAR(1000),
[siteAccessDetails] NVARCHAR(1000),
[siteSafetyDetails] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
