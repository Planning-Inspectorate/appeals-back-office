BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[RepresentationRejectionReason] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [hasText] BIT NOT NULL CONSTRAINT [RepresentationRejectionReason_hasText_df] DEFAULT 0,
    CONSTRAINT [RepresentationRejectionReason_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RepresentationRejectionReason_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[RepresentationRejectionReasonsSelected] (
    [representationRejectionReasonId] INT NOT NULL,
    [representationId] INT NOT NULL,
    CONSTRAINT [RepresentationRejectionReasonsSelected_pkey] PRIMARY KEY CLUSTERED ([representationRejectionReasonId],[representationId])
);

-- CreateTable
CREATE TABLE [dbo].[RepresentationRejectionReasonText] (
    [id] INT NOT NULL IDENTITY(1,1),
    [text] NVARCHAR(1000) NOT NULL,
    [representationRejectionReasonId] INT NOT NULL,
    [representationId] INT NOT NULL,
    CONSTRAINT [RepresentationRejectionReasonText_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationRejectionReasonsSelected] ADD CONSTRAINT [RepresentationRejectionReasonsSelected_representationRejectionReasonId_fkey] FOREIGN KEY ([representationRejectionReasonId]) REFERENCES [dbo].[RepresentationRejectionReason]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationRejectionReasonsSelected] ADD CONSTRAINT [RepresentationRejectionReasonsSelected_representationId_fkey] FOREIGN KEY ([representationId]) REFERENCES [dbo].[Representation]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationRejectionReasonText] ADD CONSTRAINT [RepresentationRejectionReasonText_representationRejectionReasonId_representationId_fkey] FOREIGN KEY ([representationRejectionReasonId], [representationId]) REFERENCES [dbo].[RepresentationRejectionReasonsSelected]([representationRejectionReasonId],[representationId]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
