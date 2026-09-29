BEGIN TRY

BEGIN TRAN;

-- DropIndex
-- by far largest index and 0 reads
DROP INDEX [DocumentVersion_documentURI_idx] ON [dbo].[DocumentVersion];

-- CreateIndex
-- lookups go via appellant case
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementGroundsMismatchFactsSelected_appellantCaseId_appellantCaseEnforcementGroundsMismatchFactsId_idx] ON [dbo].[AppellantCaseEnforcementGroundsMismatchFactsSelected]([appellantCaseId], [appellantCaseEnforcementGroundsMismatchFactsId]);

-- lookups go via appellant case
-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementInvalidReasonsSelected_appellantCaseId_appellantCaseEnforcementInvalidReasonId_idx] ON [dbo].[AppellantCaseEnforcementInvalidReasonsSelected]([appellantCaseId], [appellantCaseEnforcementInvalidReasonId]);

-- CreateIndex
-- lookups go via appellant case
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementMissingDocumentsSelected_appellantCaseId_appellantCaseEnforcementMissingDocumentId_idx] ON [dbo].[AppellantCaseEnforcementMissingDocumentsSelected]([appellantCaseId], [appellantCaseEnforcementMissingDocumentId]);

-- CreateIndex
-- lookups go via appellant case
CREATE NONCLUSTERED INDEX [AppellantCaseIncompleteReasonsSelected_appellantCaseId_appellantCaseIncompleteReasonId_idx] ON [dbo].[AppellantCaseIncompleteReasonsSelected]([appellantCaseId], [appellantCaseIncompleteReasonId]);

-- CreateIndex
-- lookups go via appellant case
CREATE NONCLUSTERED INDEX [AppellantCaseInvalidReasonsSelected_appellantCaseId_appellantCaseInvalidReasonId_idx] ON [dbo].[AppellantCaseInvalidReasonsSelected]([appellantCaseId], [appellantCaseInvalidReasonId]);

-- CreateIndex
-- lookups go via LPAQ
CREATE NONCLUSTERED INDEX [DesignatedSiteSelected_lpaQuestionnaireId_designatedSiteId_idx] ON [dbo].[DesignatedSiteSelected]([lpaQuestionnaireId], [designatedSiteId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Document_folderId_isDeleted_createdAt_idx] ON [dbo].[Document]([folderId], [isDeleted], [createdAt]) INCLUDE ([name], [latestVersionId], [caseId]);

-- CreateIndex
-- lookups go via document
CREATE NONCLUSTERED INDEX [DocumentVersionAudit_documentGuid_idx] ON [dbo].[DocumentVersionAudit]([documentGuid]);

-- CreateIndex
-- lookups go via LPAQ
CREATE NONCLUSTERED INDEX [ListedBuildingSelected_lpaQuestionnaireId_listEntry_idx] ON [dbo].[ListedBuildingSelected]([lpaQuestionnaireId], [listEntry]);

-- CreateIndex
-- lookups go via LPAQ
CREATE NONCLUSTERED INDEX [LPAQuestionnaireIncompleteReasonsSelected_lpaQuestionnaireId_lpaQuestionnaireIncompleteReasonId_idx] ON [dbo].[LPAQuestionnaireIncompleteReasonsSelected]([lpaQuestionnaireId], [lpaQuestionnaireIncompleteReasonId]);

-- CreateIndex
-- lookups go via LPAQ
CREATE NONCLUSTERED INDEX [LPAQuestionnaireIncompleteReasonText_lpaQuestionnaireId_lpaQuestionnaireIncompleteReasonId_idx] ON [dbo].[LPAQuestionnaireIncompleteReasonText]([lpaQuestionnaireId], [lpaQuestionnaireIncompleteReasonId]);

-- CreateIndex
-- linked appeal lookup
CREATE NONCLUSTERED INDEX [PersonalList_leadAppealId_dueDate_idx] ON [dbo].[PersonalList]([leadAppealId], [dueDate]) INCLUDE ([appealId], [linkType]);

-- CreateIndex
-- lookups go via representation
CREATE NONCLUSTERED INDEX [RepresentationRejectionReasonsSelected_representationId_representationRejectionReasonId_idx] ON [dbo].[RepresentationRejectionReasonsSelected]([representationId], [representationRejectionReasonId]);

-- CreateIndex
-- lookups go via representation
CREATE NONCLUSTERED INDEX [RepresentationRejectionReasonText_representationId_idx] ON [dbo].[RepresentationRejectionReasonText]([representationId]);

-- UpdateIndex
-- updates rep index to include columns for most common lookups - listing pages and deprecated calls
CREATE NONCLUSTERED INDEX [Representation_appealId_representationType_dateCreated_idx]
ON [dbo].[Representation] ([appealId], [representationType], [dateCreated] ASC)
INCLUDE ([representedId], [status], [isRedacted])
WITH (DROP_EXISTING = ON);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
