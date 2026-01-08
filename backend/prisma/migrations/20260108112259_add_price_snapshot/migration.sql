-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "priceSnapshot" INTEGER;

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
