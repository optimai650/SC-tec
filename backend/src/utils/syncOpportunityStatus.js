const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncOpportunityStatus(opportunity) {
  const now = new Date();
  let newStatus = opportunity.status;

  if (opportunity.endDate < now && opportunity.status !== 'Closed') {
    newStatus = 'Closed';
  } else if (opportunity.remainingSlots <= 0 && opportunity.status === 'Published') {
    newStatus = 'Full';
  } else if (opportunity.remainingSlots > 0 && opportunity.status === 'Full') {
    newStatus = 'Published';
  }

  if (newStatus !== opportunity.status) {
    await prisma.opportunity.update({
      where: { id: opportunity.id },
      data: { status: newStatus },
    });
    opportunity.status = newStatus;
  }
  return opportunity;
}

module.exports = syncOpportunityStatus;
