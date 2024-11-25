/*
  Warnings:

  - You are about to drop the column `inquiryHowManyWitnesses` on the `AppellantCase` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [inquiryHowManyWitnesses];
ALTER TABLE [dbo].[AppellantCase] ADD [appellantProcedurePreferenceWitnessCount] INT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
