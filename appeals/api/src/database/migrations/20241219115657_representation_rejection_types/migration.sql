BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[RepresentationRejectionReason] ADD [representationType] NVARCHAR(1000) NOT NULL CONSTRAINT [RepresentationRejectionReason_representationType_df] DEFAULT 'comment';

-- DropIndex
ALTER TABLE [dbo].[RepresentationRejectionReason] DROP CONSTRAINT [RepresentationRejectionReason_name_key];

-- CreateIndex
ALTER TABLE [dbo].[RepresentationRejectionReason] ADD CONSTRAINT [RepresentationRejectionReason_name_representationType_key] UNIQUE NONCLUSTERED ([name], [representationType]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
