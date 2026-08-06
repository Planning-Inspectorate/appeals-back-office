BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementMissingDocument] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [AppellantCaseEnforcementMissingDocument_hasText_df] DEFAULT 0,
    CONSTRAINT [AppellantCaseEnforcementMissingDocument_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppellantCaseEnforcementMissingDocument_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementMissingDocumentsSelected] (
    [appellantCaseEnforcementMissingDocumentId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementMissingDocumentsSelected_pkey] PRIMARY KEY CLUSTERED ([appellantCaseEnforcementMissingDocumentId],[appellantCaseId])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementMissingDocumentText] (
    [id] INT NOT NULL IDENTITY(1,1),
    [text] NVARCHAR(1000) NOT NULL,
    [appellantCaseEnforcementMissingDocumentId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementMissingDocumentText_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementMissingDocumentText_appellantCaseId_idx] ON [dbo].[AppellantCaseEnforcementMissingDocumentText]([appellantCaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementMissingDocumentText_appellantCaseEnforcementMissingDocumentId_idx] ON [dbo].[AppellantCaseEnforcementMissingDocumentText]([appellantCaseEnforcementMissingDocumentId]);

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementMissingDocumentsSelected] ADD CONSTRAINT [AppellantCaseEnforcementMissingDocumentsSelected_appellantCaseEnforcementMissingDocumentId_fkey] FOREIGN KEY ([appellantCaseEnforcementMissingDocumentId]) REFERENCES [dbo].[AppellantCaseEnforcementMissingDocument]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementMissingDocumentsSelected] ADD CONSTRAINT [AppellantCaseEnforcementMissingDocumentsSelected_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementMissingDocumentText] ADD CONSTRAINT [AppellantCaseEnforcementMissingDocumentText_appellantCaseEnforcementMissingDocumentId_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseEnforcementMissingDocumentId], [appellantCaseId]) REFERENCES [dbo].[AppellantCaseEnforcementMissingDocumentsSelected]([appellantCaseEnforcementMissingDocumentId],[appellantCaseId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
