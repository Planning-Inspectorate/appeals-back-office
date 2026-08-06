/*
  Warnings:

  - You are about to drop the column `designAccessStatementProvided` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `newPlansDrawingsProvided` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `ownershipCertificateSubmitted` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `hasConsultationResponses` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasEmergingPlan` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasSupplementaryPlanningDocs` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `hasTreePreservationOrder` on the `LPAQuestionnaire` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [designAccessStatementProvided],
[newPlansDrawingsProvided],
[ownershipCertificateSubmitted];

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [hasConsultationResponses],
[hasEmergingPlan],
[hasSupplementaryPlanningDocs],
[hasTreePreservationOrder];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
