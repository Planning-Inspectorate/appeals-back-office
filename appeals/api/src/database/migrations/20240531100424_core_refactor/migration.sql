/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `planningApplicationReference` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `resubmitTypeId` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `transferredCaseId` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `validAt` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `resubmitAppealTypeDate` on the `AppealTimetable` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `AppealType` table. All the data in the column will be lost.
  - You are about to drop the column `shorthand` on the `AppealType` table. All the data in the column will be lost.
  - You are about to drop the column `applicantFirstName` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `applicantSurname` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `areAllOwnersKnown` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `costsAppliedForIndicator` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `decision` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `doesSiteRequireInspectorAccess` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasAttemptedToIdentifyOwners` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasDesignAndAccessStatement` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasHealthAndSafetyIssues` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasNewPlansOrDrawings` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasNewSupportingDocuments` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasOtherTenants` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasPlanningObligation` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasSeparateOwnershipCertificate` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasSubmittedDesignAndAccessStatement` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasToldOwners` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasToldTenants` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `healthAndSafetyIssues` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `inspectorAccessDetails` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isAgriculturalHolding` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isAgriculturalHoldingTenant` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isAppellantNamedOnApplication` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isDevelopmentDescriptionStillCorrect` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isSiteFullyOwned` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isSitePartiallyOwned` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `isSiteVisibleFromPublicRoad` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `knowledgeOfOtherLandownersId` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `newDevelopmentDescription` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `originalCaseDecisionDate` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `planningObligationStatusId` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `visibilityRestrictions` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `redacted` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `representative` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `securityClassification` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `virusCheckStatus` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `procedureTypeId` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleTypeId` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `sapId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_lpa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppellantCaseIncompleteReasonOnAppellantCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppellantCaseInvalidReasonOnAppellantCase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DesignatedSite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DesignatedSitesOnLPAQuestionnaires` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListedBuildingDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LPANotificationMethodsOnLPAQuestionnaires` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanningObligationStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Representation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RepresentationAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RepresentationAttachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RepresentationContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewQuestionnaire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValidationDecision` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key]` on the table `AppealType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `DocumentRedactionStatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `KnowledgeOfOtherLandowners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `LPANotificationMethods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `ProcedureType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `SiteVisitType` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[_lpa] DROP CONSTRAINT [_lpa_A_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[_lpa] DROP CONSTRAINT [_lpa_B_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCase] DROP CONSTRAINT [AppellantCase_knowledgeOfOtherLandownersId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCase] DROP CONSTRAINT [AppellantCase_planningObligationStatusId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonOnAppellantCase] DROP CONSTRAINT [AppellantCaseIncompleteReasonOnAppellantCase_appellantCaseId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonOnAppellantCase] DROP CONSTRAINT [AppellantCaseIncompleteReasonOnAppellantCase_appellantCaseIncompleteReasonId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonText] DROP CONSTRAINT [AppellantCaseIncompleteReasonText_appellantCaseIncompleteReasonId_appellantCaseId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonOnAppellantCase] DROP CONSTRAINT [AppellantCaseInvalidReasonOnAppellantCase_appellantCaseId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonOnAppellantCase] DROP CONSTRAINT [AppellantCaseInvalidReasonOnAppellantCase_appellantCaseInvalidReasonId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonText] DROP CONSTRAINT [AppellantCaseInvalidReasonText_appellantCaseInvalidReasonId_appellantCaseId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[DesignatedSitesOnLPAQuestionnaires] DROP CONSTRAINT [DesignatedSitesOnLPAQuestionnaires_designatedSiteId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[DesignatedSitesOnLPAQuestionnaires] DROP CONSTRAINT [DesignatedSitesOnLPAQuestionnaires_lpaQuestionnaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ListedBuildingDetails] DROP CONSTRAINT [ListedBuildingDetails_lpaQuestionnaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPANotificationMethodsOnLPAQuestionnaires] DROP CONSTRAINT [LPANotificationMethodsOnLPAQuestionnaires_lpaQuestionnaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPANotificationMethodsOnLPAQuestionnaires] DROP CONSTRAINT [LPANotificationMethodsOnLPAQuestionnaires_notificationMethodId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPAQuestionnaire] DROP CONSTRAINT [LPAQuestionnaire_procedureTypeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPAQuestionnaire] DROP CONSTRAINT [LPAQuestionnaire_scheduleTypeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire] DROP CONSTRAINT [LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire_lpaQuestionnaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire] DROP CONSTRAINT [LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire_lpaQuestionnaireIncompleteReasonId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonText] DROP CONSTRAINT [LPAQuestionnaireIncompleteReasonText_lpaQuestionnaireIncompleteReasonId_lpaQuestionnaireId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Representation] DROP CONSTRAINT [Representation_userId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationAction] DROP CONSTRAINT [RepresentationAction_representationId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationAttachment] DROP CONSTRAINT [RepresentationAttachment_documentGuid_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationAttachment] DROP CONSTRAINT [RepresentationAttachment_representationId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationContact] DROP CONSTRAINT [RepresentationContact_addressId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[RepresentationContact] DROP CONSTRAINT [RepresentationContact_representationId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ReviewQuestionnaire] DROP CONSTRAINT [ReviewQuestionnaire_appealId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[ValidationDecision] DROP CONSTRAINT [ValidationDecision_appealId_fkey];

-- DropIndex
ALTER TABLE [dbo].[AppealType] DROP CONSTRAINT [AppealType_shorthand_key];

-- DropConstraint
ALTER TABLE [dbo].[Appeal] DROP CONSTRAINT [Appeal_createdAt_df]
-- DropConstraint
ALTER TABLE [dbo].[Appeal] DROP CONSTRAINT [Appeal_updatedAt_df]

-- AlterTable
ALTER TABLE [dbo].[Appeal] DROP COLUMN [createdAt],
[dueDate],
[planningApplicationReference],
[resubmitTypeId],
[startedAt],
[transferredCaseId],
[updatedAt],
[validAt];
ALTER TABLE [dbo].[Appeal] ADD [applicationReference] NVARCHAR(1000),
[caseCompletedDate] DATETIME2,
[caseCreatedDate] DATETIME2 NOT NULL CONSTRAINT [Appeal_caseCreatedDate_df] DEFAULT CURRENT_TIMESTAMP,
[caseExtensionDate] DATETIME2,
[casePublishedDate] DATETIME2,
[caseResubmittedTypeId] INT,
[caseStartedDate] DATETIME2,
[caseTransferredId] NVARCHAR(1000),
[caseUpdatedDate] DATETIME2 NOT NULL CONSTRAINT [Appeal_caseUpdatedDate_df] DEFAULT CURRENT_TIMESTAMP,
[caseValidDate] DATETIME2,
[procedureTypeId] INT;

-- AlterTable
ALTER TABLE [dbo].[AppealTimetable] DROP COLUMN [resubmitAppealTypeDate];

-- AlterTable
ALTER TABLE [dbo].[AppealType] DROP COLUMN [code],
[shorthand];
ALTER TABLE [dbo].[AppealType] ADD [key] NVARCHAR(1000) NULL,
[processCode] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [applicantFirstName],
[applicantSurname],
[areAllOwnersKnown],
[costsAppliedForIndicator],
[decision],
[doesSiteRequireInspectorAccess],
[hasAttemptedToIdentifyOwners],
[hasDesignAndAccessStatement],
[hasHealthAndSafetyIssues],
[hasNewPlansOrDrawings],
[hasNewSupportingDocuments],
[hasOtherTenants],
[hasPlanningObligation],
[hasSeparateOwnershipCertificate],
[hasSubmittedDesignAndAccessStatement],
[hasToldOwners],
[hasToldTenants],
[healthAndSafetyIssues],
[inspectorAccessDetails],
[isAgriculturalHolding],
[isAgriculturalHoldingTenant],
[isAppellantNamedOnApplication],
[isDevelopmentDescriptionStillCorrect],
[isSiteFullyOwned],
[isSitePartiallyOwned],
[isSiteVisibleFromPublicRoad],
[knowledgeOfOtherLandownersId],
[newDevelopmentDescription],
[originalCaseDecisionDate],
[planningObligationStatusId],
[visibilityRestrictions];
ALTER TABLE [dbo].[AppellantCase] ADD [appellantCostsAppliedFor] BIT,
[applicationDate] DATETIME2 NOT NULL CONSTRAINT [AppellantCase_applicationDate_df] DEFAULT CURRENT_TIMESTAMP,
[applicationDecision] NVARCHAR(1000) NOT NULL CONSTRAINT [AppellantCase_applicationDecision_df] DEFAULT 'refused',
[applicationDecisionDate] DATETIME2,
[caseSubmissionDueDate] DATETIME2,
[caseSubmittedDate] DATETIME2 NOT NULL CONSTRAINT [AppellantCase_caseSubmittedDate_df] DEFAULT CURRENT_TIMESTAMP,
[floorSpaceSquareMetres] DECIMAL(32,16),
[knowsAllOwnersId] INT,
[knowsOtherOwnersId] INT,
[ownsAllLand] BIT,
[ownsSomeLand] BIT,
[siteAccessDetails] NVARCHAR(1000),
[siteAreaSquareMetres] DECIMAL(32,16),
[siteSafetyDetails] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[DocumentRedactionStatus] ADD [key] NVARCHAR(1000) NULL;

-- DropConstraint
ALTER TABLE [dbo].[DocumentVersion] DROP CONSTRAINT [DocumentVersion_redacted_df]
-- DropConstraint
ALTER TABLE [dbo].[DocumentVersion] DROP CONSTRAINT [DocumentVersion_virusCheckStatus_df]

-- AlterTable
ALTER TABLE [dbo].[DocumentVersion] DROP COLUMN [path],
[redacted],
[representative],
[securityClassification],
[virusCheckStatus];

-- AlterTable
ALTER TABLE [dbo].[KnowledgeOfOtherLandowners] ADD [key] NVARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE [dbo].[LPANotificationMethods] ADD [key] NVARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [procedureTypeId],
[scheduleTypeId];

-- AlterTable
ALTER TABLE [dbo].[ProcedureType] ADD [key] NVARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE [dbo].[ServiceUser] ADD [salutation] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[SiteVisitType] ADD [key] NVARCHAR(1000) NULL;

-- AlterTable
ALTER TABLE [dbo].[User] DROP COLUMN [sapId];

-- DropTable
DROP TABLE [dbo].[_lpa];

-- DropTable
DROP TABLE [dbo].[AppellantCaseIncompleteReasonOnAppellantCase];

-- DropTable
DROP TABLE [dbo].[AppellantCaseInvalidReasonOnAppellantCase];

-- DropTable
DROP TABLE [dbo].[DesignatedSite];

-- DropTable
DROP TABLE [dbo].[DesignatedSitesOnLPAQuestionnaires];

-- DropTable
DROP TABLE [dbo].[ListedBuildingDetails];

-- DropTable
DROP TABLE [dbo].[LPANotificationMethodsOnLPAQuestionnaires];

-- DropTable
DROP TABLE [dbo].[LPAQuestionnaireIncompleteReasonOnLPAQuestionnaire];

-- DropTable
DROP TABLE [dbo].[PlanningObligationStatus];

-- DropTable
DROP TABLE [dbo].[Representation];

-- DropTable
DROP TABLE [dbo].[RepresentationAction];

-- DropTable
DROP TABLE [dbo].[RepresentationAttachment];

-- DropTable
DROP TABLE [dbo].[RepresentationContact];

-- DropTable
DROP TABLE [dbo].[ReviewQuestionnaire];

-- DropTable
DROP TABLE [dbo].[ScheduleType];

-- DropTable
DROP TABLE [dbo].[ValidationDecision];

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseIncompleteReasonsSelected] (
    [appellantCaseIncompleteReasonId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseIncompleteReasonsSelected_pkey] PRIMARY KEY CLUSTERED ([appellantCaseIncompleteReasonId],[appellantCaseId])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseInvalidReasonsSelected] (
    [appellantCaseInvalidReasonId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseInvalidReasonsSelected_pkey] PRIMARY KEY CLUSTERED ([appellantCaseInvalidReasonId],[appellantCaseId])
);

-- CreateTable
CREATE TABLE [dbo].[LPAQuestionnaireIncompleteReasonsSelected] (
    [lpaQuestionnaireIncompleteReasonId] INT NOT NULL,
    [lpaQuestionnaireId] INT NOT NULL,
    CONSTRAINT [LPAQuestionnaireIncompleteReasonsSelected_pkey] PRIMARY KEY CLUSTERED ([lpaQuestionnaireIncompleteReasonId],[lpaQuestionnaireId])
);

-- CreateTable
CREATE TABLE [dbo].[ListedBuildingSelected] (
    [id] INT NOT NULL IDENTITY(1,1),
    [lpaQuestionnaireId] INT,
    [listEntry] NVARCHAR(1000),
    [affectsListedBuilding] BIT NOT NULL CONSTRAINT [ListedBuildingSelected_affectsListedBuilding_df] DEFAULT 1,
    CONSTRAINT [ListedBuildingSelected_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LPANotificationMethodsSelected] (
    [notificationMethodId] INT NOT NULL,
    [lpaQuestionnaireId] INT NOT NULL,
    CONSTRAINT [LPANotificationMethodsSelected_pkey] PRIMARY KEY CLUSTERED ([notificationMethodId],[lpaQuestionnaireId])
);

-- CreateTable
CREATE TABLE [dbo].[DocumentVersionAvScan] (
    [documentGuid] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL,
    [avScanSuccess] BIT NOT NULL,
    [avScanDate] DATETIME2 NOT NULL CONSTRAINT [DocumentVersionAvScan_avScanDate_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DocumentVersionAvScan_pkey] PRIMARY KEY CLUSTERED ([documentGuid],[version])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [documentGuid] ON [dbo].[DocumentVersionAvScan]([documentGuid]);

-- AddForeignKey
ALTER TABLE [dbo].[Appeal] ADD CONSTRAINT [Appeal_procedureTypeId_fkey] FOREIGN KEY ([procedureTypeId]) REFERENCES [dbo].[ProcedureType]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCase] ADD CONSTRAINT [AppellantCase_knowsOtherOwnersId_fkey] FOREIGN KEY ([knowsOtherOwnersId]) REFERENCES [dbo].[KnowledgeOfOtherLandowners]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCase] ADD CONSTRAINT [AppellantCase_knowsAllOwnersId_fkey] FOREIGN KEY ([knowsAllOwnersId]) REFERENCES [dbo].[KnowledgeOfOtherLandowners]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonsSelected] ADD CONSTRAINT [AppellantCaseIncompleteReasonsSelected_appellantCaseIncompleteReasonId_fkey] FOREIGN KEY ([appellantCaseIncompleteReasonId]) REFERENCES [dbo].[AppellantCaseIncompleteReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonsSelected] ADD CONSTRAINT [AppellantCaseIncompleteReasonsSelected_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonsSelected] ADD CONSTRAINT [AppellantCaseInvalidReasonsSelected_appellantCaseInvalidReasonId_fkey] FOREIGN KEY ([appellantCaseInvalidReasonId]) REFERENCES [dbo].[AppellantCaseInvalidReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonsSelected] ADD CONSTRAINT [AppellantCaseInvalidReasonsSelected_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseIncompleteReasonText] ADD CONSTRAINT [AppellantCaseIncompleteReasonText_appellantCaseIncompleteReasonId_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseIncompleteReasonId], [appellantCaseId]) REFERENCES [dbo].[AppellantCaseIncompleteReasonsSelected]([appellantCaseIncompleteReasonId],[appellantCaseId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseInvalidReasonText] ADD CONSTRAINT [AppellantCaseInvalidReasonText_appellantCaseInvalidReasonId_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseInvalidReasonId], [appellantCaseId]) REFERENCES [dbo].[AppellantCaseInvalidReasonsSelected]([appellantCaseInvalidReasonId],[appellantCaseId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonsSelected] ADD CONSTRAINT [LPAQuestionnaireIncompleteReasonsSelected_lpaQuestionnaireIncompleteReasonId_fkey] FOREIGN KEY ([lpaQuestionnaireIncompleteReasonId]) REFERENCES [dbo].[LPAQuestionnaireIncompleteReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonsSelected] ADD CONSTRAINT [LPAQuestionnaireIncompleteReasonsSelected_lpaQuestionnaireId_fkey] FOREIGN KEY ([lpaQuestionnaireId]) REFERENCES [dbo].[LPAQuestionnaire]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LPAQuestionnaireIncompleteReasonText] ADD CONSTRAINT [LPAQuestionnaireIncompleteReasonText_lpaQuestionnaireIncompleteReasonId_lpaQuestionnaireId_fkey] FOREIGN KEY ([lpaQuestionnaireIncompleteReasonId], [lpaQuestionnaireId]) REFERENCES [dbo].[LPAQuestionnaireIncompleteReasonsSelected]([lpaQuestionnaireIncompleteReasonId],[lpaQuestionnaireId]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ListedBuildingSelected] ADD CONSTRAINT [ListedBuildingSelected_lpaQuestionnaireId_fkey] FOREIGN KEY ([lpaQuestionnaireId]) REFERENCES [dbo].[LPAQuestionnaire]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LPANotificationMethodsSelected] ADD CONSTRAINT [LPANotificationMethodsSelected_notificationMethodId_fkey] FOREIGN KEY ([notificationMethodId]) REFERENCES [dbo].[LPANotificationMethods]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LPANotificationMethodsSelected] ADD CONSTRAINT [LPANotificationMethodsSelected_lpaQuestionnaireId_fkey] FOREIGN KEY ([lpaQuestionnaireId]) REFERENCES [dbo].[LPAQuestionnaire]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DocumentVersionAvScan] ADD CONSTRAINT [DocumentVersionAvScan_documentGuid_version_fkey] FOREIGN KEY ([documentGuid], [version]) REFERENCES [dbo].[DocumentVersion]([documentGuid],[version]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
