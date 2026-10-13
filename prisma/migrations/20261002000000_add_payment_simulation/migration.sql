-- Simulasi pembayaran: kolom metode, referensi, dan waktu bayar pada Order
ALTER TABLE `Order`
  ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
  ADD COLUMN `paymentRef` VARCHAR(191) NULL,
  ADD COLUMN `paidAt` DATETIME(3) NULL;

-- Buat index unik untuk paymentRef (NULL boleh banyak)
CREATE UNIQUE INDEX `Order_paymentRef_key` ON `Order`(`paymentRef`);
