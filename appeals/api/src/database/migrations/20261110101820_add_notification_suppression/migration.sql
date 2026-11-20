BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Appeal] ADD [suppressNotifications] BIT;

-- AlterTable
ALTER TABLE [dbo].[AppealType] ADD [suppressNotifications] BIT NOT NULL CONSTRAINT [AppealType_suppressNotifications_df] DEFAULT 0;

-- Initialise generic appeal types to suppressed
EXEC(N'UPDATE [dbo].[AppealType] SET [suppressNotifications] = 1 WHERE [key] IN (''G'', ''L'', ''Q'', ''TPO'', ''TRN'', ''HH'', ''HR'', ''ENV'');');

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
