BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Representation] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [representationType] NVARCHAR(1000) NOT NULL,
    [dateCreated] DATETIME2 NOT NULL CONSTRAINT [Representation_dateCreated_df] DEFAULT CURRENT_TIMESTAMP,
    [dateLastUpdated] DATETIME2 NOT NULL CONSTRAINT [Representation_dateLastUpdated_df] DEFAULT CURRENT_TIMESTAMP,
    [originalRepresentation] NVARCHAR(1000) NOT NULL,
    [redactedRepresentation] NVARCHAR(1000),
    [representedId] INT,
    [representativeId] INT,
    [lpaCode] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Representation_status_df] DEFAULT 'awaiting_review',
    [reviewer] NVARCHAR(1000),
    [notes] NVARCHAR(1000),
    CONSTRAINT [Representation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RepresentationAttachment] (
    [documentGuid] NVARCHAR(1000) NOT NULL,
    [version] INT NOT NULL,
    [representationId] INT NOT NULL,
    CONSTRAINT [RepresentationAttachment_pkey] PRIMARY KEY CLUSTERED ([documentGuid],[version])
);

-- AddForeignKey
ALTER TABLE [dbo].[Representation] ADD CONSTRAINT [Representation_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Representation] ADD CONSTRAINT [Representation_representedId_fkey] FOREIGN KEY ([representedId]) REFERENCES [dbo].[ServiceUser]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Representation] ADD CONSTRAINT [Representation_representativeId_fkey] FOREIGN KEY ([representativeId]) REFERENCES [dbo].[ServiceUser]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Representation] ADD CONSTRAINT [Representation_lpaCode_fkey] FOREIGN KEY ([lpaCode]) REFERENCES [dbo].[LPA]([lpaCode]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationAttachment] ADD CONSTRAINT [RepresentationAttachment_documentGuid_version_fkey] FOREIGN KEY ([documentGuid], [version]) REFERENCES [dbo].[DocumentVersion]([documentGuid],[version]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RepresentationAttachment] ADD CONSTRAINT [RepresentationAttachment_representationId_fkey] FOREIGN KEY ([representationId]) REFERENCES [dbo].[Representation]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
