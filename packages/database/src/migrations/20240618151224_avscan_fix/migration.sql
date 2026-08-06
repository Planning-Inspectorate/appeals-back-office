BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[DocumentVersionAvScan] DROP CONSTRAINT [DocumentVersionAvScan_documentGuid_version_fkey];

-- AlterTable
ALTER TABLE [dbo].[DocumentVersion] ADD [virusCheckStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [DocumentVersion_virusCheckStatus_df] DEFAULT 'not_scanned';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
