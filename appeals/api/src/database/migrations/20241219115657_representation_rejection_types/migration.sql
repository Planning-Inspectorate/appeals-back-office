BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[RepresentationRejectionReason] ADD [representationType] NVARCHAR(1000) NOT NULL CONSTRAINT [RepresentationRejectionReason_representationType_df] DEFAULT 'comment';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
