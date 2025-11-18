BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealSpecialism_appealId_idx] ON [dbo].[AppealSpecialism]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealSpecialism_specialismId_idx] ON [dbo].[AppealSpecialism]([specialismId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealStatus_valid_appealId_idx] ON [dbo].[AppealStatus]([valid], [appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseIncompleteReasonText_appellantCaseId_idx] ON [dbo].[AppellantCaseIncompleteReasonText]([appellantCaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseIncompleteReasonText_appellantCaseIncompleteReasonId_idx] ON [dbo].[AppellantCaseIncompleteReasonText]([appellantCaseIncompleteReasonId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseInvalidReasonText_appellantCaseId_idx] ON [dbo].[AppellantCaseInvalidReasonText]([appellantCaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseInvalidReasonText_appellantCaseInvalidReasonId_idx] ON [dbo].[AppellantCaseInvalidReasonText]([appellantCaseInvalidReasonId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
