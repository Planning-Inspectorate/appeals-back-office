/*
  Warnings:

  - Made the column `factsForGround` on table `AppealGround` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppealGround] ALTER COLUMN [factsForGround] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[AppealGround] ADD CONSTRAINT [AppealGround_factsForGround_df] DEFAULT '' FOR [factsForGround];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
