-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "price" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WorkingHour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");

-- CreateIndex
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");
