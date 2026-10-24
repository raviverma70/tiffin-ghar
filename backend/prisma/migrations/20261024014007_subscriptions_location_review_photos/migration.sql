-- CreateEnum
CREATE TYPE "MealTime" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('REQUESTED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "mealTime" "MealTime" NOT NULL DEFAULT 'LUNCH';

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "area" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ReviewPhoto" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "days" INTEGER NOT NULL,
    "mealTimes" "MealTime"[],
    "pricePaise" INTEGER NOT NULL,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanDayMenu" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "mealTime" "MealTime" NOT NULL,
    "dishes" TEXT[],

    CONSTRAINT "PlanDayMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "planName" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "mealTimes" "MealTime"[],
    "pricePaise" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "note" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'REQUESTED',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favourite" (
    "userId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("userId","providerId")
);

-- CreateIndex
CREATE INDEX "ReviewPhoto_reviewId_idx" ON "ReviewPhoto"("reviewId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_providerId_idx" ON "SubscriptionPlan"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanDayMenu_planId_day_mealTime_key" ON "PlanDayMenu"("planId", "day", "mealTime");

-- CreateIndex
CREATE INDEX "Subscription_userId_createdAt_idx" ON "Subscription"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Subscription_providerId_status_idx" ON "Subscription"("providerId", "status");

-- AddForeignKey
ALTER TABLE "ReviewPhoto" ADD CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDayMenu" ADD CONSTRAINT "PlanDayMenu_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
