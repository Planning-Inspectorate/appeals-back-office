/*
  Warnings:

  - You are about to drop the column `siteWithinGreenBelt` on the `LPAQuestionnaire` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [isGreenBelt] BIT;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [siteWithinGreenBelt];
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [isGreenBelt] BIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
