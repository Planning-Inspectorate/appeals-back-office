BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementInvalidReason] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [AppellantCaseEnforcementInvalidReason_hasText_df] DEFAULT 0,
    CONSTRAINT [AppellantCaseEnforcementInvalidReason_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AppellantCaseEnforcementInvalidReason_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementInvalidReasonsSelected] (
    [appellantCaseEnforcementInvalidReasonId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementInvalidReasonsSelected_pkey] PRIMARY KEY CLUSTERED ([appellantCaseEnforcementInvalidReasonId],[appellantCaseId])
);

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseEnforcementInvalidReasonText] (
    [id] INT NOT NULL IDENTITY(1,1),
    [text] NVARCHAR(1000) NOT NULL,
    [appellantCaseEnforcementInvalidReasonId] INT NOT NULL,
    [appellantCaseId] INT NOT NULL,
    CONSTRAINT [AppellantCaseEnforcementInvalidReasonText_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementInvalidReasonText_appellantCaseId_idx] ON [dbo].[AppellantCaseEnforcementInvalidReasonText]([appellantCaseId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseEnforcementInvalidReasonText_appellantCaseEnforcementInvalidReasonId_idx] ON [dbo].[AppellantCaseEnforcementInvalidReasonText]([appellantCaseEnforcementInvalidReasonId]);

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementInvalidReasonsSelected] ADD CONSTRAINT [AppellantCaseEnforcementInvalidReasonsSelected_appellantCaseEnforcementInvalidReasonId_fkey] FOREIGN KEY ([appellantCaseEnforcementInvalidReasonId]) REFERENCES [dbo].[AppellantCaseEnforcementInvalidReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementInvalidReasonsSelected] ADD CONSTRAINT [AppellantCaseEnforcementInvalidReasonsSelected_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseEnforcementInvalidReasonText] ADD CONSTRAINT [AppellantCaseEnforcementInvalidReasonText_appellantCaseEnforcementInvalidReasonId_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseEnforcementInvalidReasonId], [appellantCaseId]) REFERENCES [dbo].[AppellantCaseEnforcementInvalidReasonsSelected]([appellantCaseEnforcementInvalidReasonId],[appellantCaseId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
