BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFacts] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFacts_hasText_df] DEFAULT 0,
    CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFacts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFacts_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFactsSelected] (
    [appellantCaseEnforcementGroundsMismatchFactsId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFactsSelected_pkey] PRIMARY KEY CLUSTERED ([appellantCaseEnforcementGroundsMismatchFactsId],[appellantCaseId])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFactsText] (
    [id] INT NOT NULL IDENTITY(1,1),
    [text] NVARCHAR(1000) NOT NULL,
    [appellantCaseEnforcementGroundsMismatchFactsId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFactsText_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementGroundsMismatchFactsText_appellantCaseId_idx] ON [dbo].[AppellantCaseEnforcementGroundsMismatchFactsText]([appellantCaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementGroundsMismatchFactsText_appellantCaseEnforcementGroundsMismatchFactsId_idx] ON [dbo].[AppellantCaseEnforcementGroundsMismatchFactsText]([appellantCaseEnforcementGroundsMismatchFactsId]);

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFactsSelected] ADD CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFactsSelected_appellantCaseEnforcementGroundsMismatchFactsId_fkey] FOREIGN KEY ([appellantCaseEnforcementGroundsMismatchFactsId]) REFERENCES [dbo].[AppellantCaseEnforcementGroundsMismatchFacts]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFactsSelected] ADD CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFactsSelected_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementGroundsMismatchFactsText] ADD CONSTRAINT [AppellantCaseEnforcementGroundsMismatchFactsText_appellantCaseEnforcementGroundsMismatchFactsId_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseEnforcementGroundsMismatchFactsId], [appellantCaseId]) REFERENCES [dbo].[AppellantCaseEnforcementGroundsMismatchFactsSelected]([appellantCaseEnforcementGroundsMismatchFactsId],[appellantCaseId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
