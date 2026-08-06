/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `AppealType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `DocumentRedactionStatus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `KnowledgeOfOtherLandowners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `LPANotificationMethods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `ProcedureType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `SiteVisitType` will be added. If there are existing duplicate values, this will fail.
  - Made the column `key` on table `AppealType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `DocumentRedactionStatus` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `KnowledgeOfOtherLandowners` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `LPANotificationMethods` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `ProcedureType` required. This step will fail if there are existing NULL values in that column.
  - Made the column `key` on table `SiteVisitType` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;



-- Tidy up
UPDATE SiteVisitType SET [key] = NEWID()
UPDATE ProcedureType SET [key] = NEWID()
UPDATE AppealType SET [key] = NEWID()
UPDATE DocumentRedactionStatus SET [key] = NEWID()
UPDATE LPANotificationMethods SET [key] = NEWID()
UPDATE KnowledgeOfOtherLandowners SET [key] = NEWID()


-- AlterTable
ALTER TABLE [dbo].[AppealType] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[DocumentRedactionStatus] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[KnowledgeOfOtherLandowners] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[LPANotificationMethods] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ProcedureType] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[SiteVisitType] ALTER COLUMN [key] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[AppealType] ADD CONSTRAINT [AppealType_key_key] UNIQUE NONCLUSTERED ([key]);

-- CreateIndex
ALTER TABLE [dbo].[DocumentRedactionStatus] ADD CONSTRAINT [DocumentRedactionStatus_key_key] UNIQUE NONCLUSTERED ([key]);

-- CreateIndex
ALTER TABLE [dbo].[KnowledgeOfOtherLandowners] ADD CONSTRAINT [KnowledgeOfOtherLandowners_key_key] UNIQUE NONCLUSTERED ([key]);

-- CreateIndex
ALTER TABLE [dbo].[LPANotificationMethods] ADD CONSTRAINT [LPANotificationMethods_key_key] UNIQUE NONCLUSTERED ([key]);

-- CreateIndex
ALTER TABLE [dbo].[ProcedureType] ADD CONSTRAINT [ProcedureType_key_key] UNIQUE NONCLUSTERED ([key]);

-- CreateIndex
ALTER TABLE [dbo].[SiteVisitType] ADD CONSTRAINT [SiteVisitType_key_key] UNIQUE NONCLUSTERED ([key]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
