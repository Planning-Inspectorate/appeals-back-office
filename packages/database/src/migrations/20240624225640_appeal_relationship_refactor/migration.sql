BEGIN TRY

BEGIN TRAN;

-- AddForeignKey
ALTER TABLE [dbo].[AppealRelationship] ADD CONSTRAINT [AppealRelationship_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[AppealRelationship] ADD CONSTRAINT [AppealRelationship_childId_fkey] FOREIGN KEY ([childId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
