/*
  Warnings:

  - You are about to alter the column `visitEndTime` on the `SiteVisit` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `DateTime2`.
  - You are about to alter the column `visitStartTime` on the `SiteVisit` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `DateTime2`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[SiteVisit] ALTER COLUMN [visitEndTime] DATETIME2 NULL;
ALTER TABLE [dbo].[SiteVisit] ALTER COLUMN [visitStartTime] DATETIME2 NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
