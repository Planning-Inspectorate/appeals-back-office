BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Representation] ALTER COLUMN [originalRepresentation] NVARCHAR(1000) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
