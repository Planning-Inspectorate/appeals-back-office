BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [AppellantCase_appealId_idx] ON [dbo].[AppellantCase];

-- DropIndex
DROP INDEX [LPAQuestionnaire_appealId_idx] ON [dbo].[LPAQuestionnaire];

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealRelationship_type_parentRef_childRef_idx] ON [dbo].[AppealRelationship]([type], [parentRef], [childRef]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Document_folderId_idx] ON [dbo].[Document]([folderId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
