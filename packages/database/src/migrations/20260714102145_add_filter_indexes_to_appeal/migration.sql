BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_padsInspectorUserId_idx] ON [dbo].[Appeal]([padsInspectorUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_assignedTeamId_idx] ON [dbo].[Appeal]([assignedTeamId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
