BEGIN TRY

BEGIN TRAN;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_addressId_idx] ON [dbo].[Appeal]([addressId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_appealTypeId_idx] ON [dbo].[Appeal]([appealTypeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_procedureTypeId_idx] ON [dbo].[Appeal]([procedureTypeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_lpaId_idx] ON [dbo].[Appeal]([lpaId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_caseOfficerUserId_idx] ON [dbo].[Appeal]([caseOfficerUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_inspectorUserId_idx] ON [dbo].[Appeal]([inspectorUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_applicationReference_idx] ON [dbo].[Appeal]([applicationReference]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealRelationship_parentId_idx] ON [dbo].[AppealRelationship]([parentId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealRelationship_childId_idx] ON [dbo].[AppealRelationship]([childId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppealStatus_appealId_idx] ON [dbo].[AppealStatus]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCase_appealId_idx] ON [dbo].[AppellantCase]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditTrail_appealId_idx] ON [dbo].[AuditTrail]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CaseNote_caseId_idx] ON [dbo].[CaseNote]([caseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Document_caseId_folderId_idx] ON [dbo].[Document]([caseId], [folderId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentVersion_documentURI_idx] ON [dbo].[DocumentVersion]([documentURI]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentVersion_documentType_idx] ON [dbo].[DocumentVersion]([documentType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentVersion_stage_idx] ON [dbo].[DocumentVersion]([stage]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Folder_path_idx] ON [dbo].[Folder]([path]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LPAQuestionnaire_appealId_idx] ON [dbo].[LPAQuestionnaire]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LPAQuestionnaire_isGreenBelt_idx] ON [dbo].[LPAQuestionnaire]([isGreenBelt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Representation_appealId_idx] ON [dbo].[Representation]([appealId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RepresentationAttachment_representationId_idx] ON [dbo].[RepresentationAttachment]([representationId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
