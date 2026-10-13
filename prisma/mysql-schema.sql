-- ============================================================
-- Database: gilakomputer_db (MySQL 8.x)
-- Schema SQL murni — alternatif jika tidak memakai Prisma Migrate.
-- Jalankan: mysql -u root -p < prisma/mysql-schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS gilakomputer_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gilakomputer_db;

-- Kategori produk (VGA, Processor, RAM, dst.)
CREATE TABLE Category (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Brand / merk produk
CREATE TABLE Brand (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Produk
CREATE TABLE Product (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(191) NOT NULL,
  slug        VARCHAR(191) NOT NULL UNIQUE,
  description TEXT         NOT NULL,
  price       INT          NOT NULL,               -- harga dalam Rupiah (tanpa koma)
  stock       INT          NOT NULL,
  status      VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  imageUrl    VARCHAR(191) NOT NULL,
  specs       JSON         NULL,                   -- contoh: {"CPU": "...", "RAM": "..."}
  categoryId  INT          NOT NULL,
  brandId     INT          NULL,
  createdAt   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX Product_categoryId_idx (categoryId),
  INDEX Product_brandId_idx (brandId),
  INDEX Product_status_idx (status),

  CONSTRAINT Product_category_fk FOREIGN KEY (categoryId) REFERENCES Category(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT Product_brand_fk   FOREIGN KEY (brandId)    REFERENCES Brand(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Stok/inventaris per produk
CREATE TABLE Inventory (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  productId INT         NOT NULL UNIQUE,
  quantity  INT         NOT NULL DEFAULT 0,
  reserved  INT         NOT NULL DEFAULT 0,
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  CONSTRAINT Inventory_product_fk FOREIGN KEY (productId) REFERENCES Product(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Akun pembeli & admin
CREATE TABLE `User` (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(191) NOT NULL,
  email        VARCHAR(191) NOT NULL UNIQUE,
  phone        VARCHAR(191) NULL,
  passwordHash VARCHAR(191) NOT NULL,
  role         VARCHAR(191) NOT NULL DEFAULT 'PEMBELI',
  createdAt    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX User_role_idx (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Sesi login (id = hash SHA-256 dari token di cookie)
CREATE TABLE `Session` (
  id        VARCHAR(191) NOT NULL PRIMARY KEY,
  userId    INT          NOT NULL,
  expiresAt DATETIME(3)  NOT NULL,
  createdAt DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX Session_userId_idx (userId),
  CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Pesanan (checkout)
CREATE TABLE `Order` (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber    VARCHAR(191) NOT NULL UNIQUE,
  customerName   VARCHAR(191) NOT NULL,
  email          VARCHAR(191) NOT NULL,
  phone          VARCHAR(191) NOT NULL,
  address        TEXT         NOT NULL,
  city           VARCHAR(191) NOT NULL,
  postalCode     VARCHAR(191) NOT NULL,
  shippingMethod VARCHAR(191) NOT NULL,
  shippingFee    INT          NOT NULL,
  subtotal       INT          NOT NULL,
  total          INT          NOT NULL,
  status         VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  userId         INT          NULL,
  payToken       VARCHAR(191) NULL UNIQUE,
  createdAt      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX Order_email_idx (email),
  INDEX Order_status_idx (status),
  CONSTRAINT Order_userId_fkey FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Item dalam sebuah pesanan (snapshot nama & harga saat beli)
CREATE TABLE OrderItem (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  orderId   INT          NOT NULL,
  productId INT          NOT NULL,
  name      VARCHAR(191) NOT NULL,
  quantity  INT          NOT NULL,
  unitPrice INT          NOT NULL,

  INDEX OrderItem_orderId_idx (orderId),
  INDEX OrderItem_productId_idx (productId),

  CONSTRAINT OrderItem_order_fk   FOREIGN KEY (orderId)   REFERENCES `Order`(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT OrderItem_product_fk FOREIGN KEY (productId) REFERENCES Product(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
