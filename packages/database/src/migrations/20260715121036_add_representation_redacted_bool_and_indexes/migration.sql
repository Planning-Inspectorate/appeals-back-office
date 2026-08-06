BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Representation] ADD [isRedacted] BIT NOT NULL CONSTRAINT [Representation_isRedacted_df] DEFAULT 0;

-- Set current isRedacted values
EXEC('UPDATE [dbo].[Representation] SET [isRedacted] = 1 WHERE [redactedRepresentation] IS NOT NULL and [redactedRepresentation] <> [originalRepresentation];');

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealGround_appealId_isDeleted_idx] ON [dbo].[AppealGround]([appealId], [isDeleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LPANotificationMethodsSelected_lpaQuestionnaireId_idx] ON [dbo].[LPANotificationMethodsSelected]([lpaQuestionnaireId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
