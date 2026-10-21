-- AddForeignKey
ALTER TABLE "OutboxEvents" ADD CONSTRAINT "OutboxEvents_agregateId_fkey" FOREIGN KEY ("agregateId") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
