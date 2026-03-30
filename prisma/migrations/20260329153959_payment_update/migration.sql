/*
  Warnings:

  - Added the required column `paymentMethod` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_orderId_key";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "orderId" DROP NOT NULL;
