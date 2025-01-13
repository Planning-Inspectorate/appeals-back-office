BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [designatedSiteNameCustom] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[DesignatedSite] (
    [id] INT NOT NULL IDENTITY(1,1),
    [key] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DesignatedSite_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DesignatedSite_key_key] UNIQUE NONCLUSTERED ([key]),
    CONSTRAINT [DesignatedSite_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[DesignatedSiteSelected] (
    [designatedSiteId] INT NOT NULL,
    [lpaQuestionnaireId] INT NOT NULL,
    CONSTRAINT [DesignatedSiteSelected_pkey] PRIMARY KEY CLUSTERED ([designatedSiteId],[lpaQuestionnaireId])
);

-- AddForeignKey
ALTER TABLE [dbo].[DesignatedSiteSelected] ADD CONSTRAINT [DesignatedSiteSelected_designatedSiteId_fkey] FOREIGN KEY ([designatedSiteId]) REFERENCES [dbo].[DesignatedSite]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DesignatedSiteSelected] ADD CONSTRAINT [DesignatedSiteSelected_lpaQuestionnaireId_fkey] FOREIGN KEY ([lpaQuestionnaireId]) REFERENCES [dbo].[LPAQuestionnaire]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
