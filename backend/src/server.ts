import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 4000;

const negatives = await prisma.appointment.findMany({
  where: { priceSnapshot: { lt: 0 } },
  select: { id: true, status: true, priceSnapshot: true, startAt: true }
});
console.log("NEGATIVE priceSnapshot", negatives);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

