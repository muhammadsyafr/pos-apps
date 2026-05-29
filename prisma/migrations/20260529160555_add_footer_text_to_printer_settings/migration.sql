-- DropIndex
DROP INDEX "Notification_userId_index";

-- AlterTable
ALTER TABLE "PrinterSettings" ADD COLUMN     "footerText" TEXT NOT NULL DEFAULT 'Terima kasih atas
kunjungan Anda';

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "costPrice" DROP DEFAULT;
