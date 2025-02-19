/*
  Warnings:

  - You are about to drop the column `eiaConsultedBodiesDetails` on the `LPAQuestionnaire` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN [eiaConsultedBodiesDetails];
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [consultedBodiesDetails] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
