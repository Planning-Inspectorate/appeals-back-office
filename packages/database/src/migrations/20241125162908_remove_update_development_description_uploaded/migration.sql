/*
  Warnings:

  - You are about to drop the column `updateDevelopmentDescriptionUploaded` on the `AppellantCase` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [updateDevelopmentDescriptionUploaded];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
