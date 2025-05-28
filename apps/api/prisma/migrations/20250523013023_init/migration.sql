BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [email] VARCHAR(100),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [User_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [name] VARCHAR(30) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[UserRole] (
    [userId] NVARCHAR(1000) NOT NULL,
    [roleId] VARCHAR(30) NOT NULL,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([userId],[roleId])
);

-- CreateTable
CREATE TABLE [dbo].[Product] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] VARCHAR(50) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [description] VARCHAR(255),
    [price] DECIMAL(18,2) NOT NULL,
    [unit] VARCHAR(20) NOT NULL,
    [isDeleted] BIT NOT NULL CONSTRAINT [Product_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Product_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Product_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdById] NVARCHAR(1000),
    CONSTRAINT [Product_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Product_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Discount] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] VARCHAR(50) NOT NULL,
    [percentage] SMALLINT NOT NULL,
    [validFrom] DATETIME2 NOT NULL,
    [validTo] DATETIME2,
    [isActive] BIT NOT NULL CONSTRAINT [Discount_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Discount_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Discount_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdById] NVARCHAR(1000),
    [productId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Discount_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Discount_code_key] UNIQUE NONCLUSTERED ([code]),
    CONSTRAINT [Discount_productId_key] UNIQUE NONCLUSTERED ([productId])
);

-- CreateTable
CREATE TABLE [dbo].[Client] (
    [id] NVARCHAR(1000) NOT NULL,
    [code] VARCHAR(50) NOT NULL,
    [name] VARCHAR(100) NOT NULL,
    [nit] VARCHAR(20) NOT NULL,
    [phone] VARCHAR(20),
    [email] VARCHAR(100),
    [isDeleted] BIT NOT NULL CONSTRAINT [Client_isDeleted_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Client_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Client_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdById] NVARCHAR(1000),
    CONSTRAINT [Client_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Client_code_key] UNIQUE NONCLUSTERED ([code]),
    CONSTRAINT [Client_nit_key] UNIQUE NONCLUSTERED ([nit])
);

-- CreateTable
CREATE TABLE [dbo].[Sale] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [Sale_date_df] DEFAULT CURRENT_TIMESTAMP,
    [subtotal] DECIMAL(18,2) NOT NULL,
    [discountTotal] DECIMAL(18,2) NOT NULL,
    [total] DECIMAL(18,2) NOT NULL,
    [paymentMethod] VARCHAR(20) NOT NULL,
    [isCanceled] BIT NOT NULL CONSTRAINT [Sale_isCanceled_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Sale_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Sale_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdById] NVARCHAR(1000),
    [clientId] NVARCHAR(1000),
    CONSTRAINT [Sale_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[SaleItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [quantity] INT NOT NULL,
    [unitPrice] DECIMAL(18,2) NOT NULL,
    [discountApplied] DECIMAL(18,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SaleItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [SaleItem_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [saleId] NVARCHAR(1000) NOT NULL,
    [productId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [SaleItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Product_code] ON [dbo].[Product]([code]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Product_name] ON [dbo].[Product]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Discount_productId] ON [dbo].[Discount]([productId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Client_nit] ON [dbo].[Client]([nit]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Sale_date] ON [dbo].[Sale]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_Sale_clientId] ON [dbo].[Sale]([clientId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_SaleItem_saleId] ON [dbo].[SaleItem]([saleId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [idx_SaleItem_productId] ON [dbo].[SaleItem]([productId]);

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserRole] ADD CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([name]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Product] ADD CONSTRAINT [Product_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Discount] ADD CONSTRAINT [Discount_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Discount] ADD CONSTRAINT [Discount_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Product]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Client] ADD CONSTRAINT [Client_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Sale] ADD CONSTRAINT [Sale_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Sale] ADD CONSTRAINT [Sale_clientId_fkey] FOREIGN KEY ([clientId]) REFERENCES [dbo].[Client]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SaleItem] ADD CONSTRAINT [SaleItem_saleId_fkey] FOREIGN KEY ([saleId]) REFERENCES [dbo].[Sale]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SaleItem] ADD CONSTRAINT [SaleItem_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Product]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
