BEGIN TRY

BEGIN TRAN;

CREATE TABLE [dbo].[CaseFilePackage] (
    [id] NVARCHAR(1000) NOT NULL,
    [appealId] INT NOT NULL,
    [requestedBy] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [CaseFilePackage_status_df] DEFAULT 'queued',
    [active] BIT NOT NULL CONSTRAINT [CaseFilePackage_active_df] DEFAULT 1,
    [requestedAt] DATETIME2 NOT NULL CONSTRAINT [CaseFilePackage_requestedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [processingStartedAt] DATETIME2,
    [completedAt] DATETIME2,
    [blobPath] NVARCHAR(1000),
    [sizeBytes] BIGINT,
    [error] NVARCHAR(max),
    CONSTRAINT [CaseFilePackage_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CaseFilePackage_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE NONCLUSTERED INDEX [CaseFilePackage_appealId_requestedAt_idx] ON [dbo].[CaseFilePackage]([appealId], [requestedAt]);
CREATE UNIQUE NONCLUSTERED INDEX [CaseFilePackage_one_active_per_appeal] ON [dbo].[CaseFilePackage]([appealId]) WHERE [active] = 1;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
