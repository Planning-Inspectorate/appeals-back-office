/*
  Warnings:

  - You are about to drop the column `numberOfResidences` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `inspectorNeedToEnterSite` on the `LPAQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `siteNoticesSent` on the `LPAQuestionnaire` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [numberOfResidences];
ALTER TABLE [dbo].[AppellantCase] ADD [numberOfResidencesNetChange] INT;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [inspectorNeedToEnterSite],
[siteNoticesSent];
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [reasonForNeighbourVisits] BIT,
[siteNoticesSentDate] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
