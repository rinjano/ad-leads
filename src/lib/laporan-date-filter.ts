// Utility to generate consistent Prisma filter for laporan endpoints
// type: 'prospek' | 'leads'
// periode: 'today' | 'yesterday' | 'thisweek' | 'thismonth' | 'lastmonth' | 'custom'
// startDate, endDate: string (yyyy-mm-dd)

export function getLaporanDateFilter({
  type,
  periode,
  startDate,
  endDate,
  now = new Date()
}: {
  type: 'prospek' | 'leads',
  periode: string,
  startDate?: string,
  endDate?: string,
  now?: Date
}) {
  let field = type === 'prospek' ? 'tanggalProspek' : 'tanggalJadiLeads';
  let filter: any = {};

  // Hanya filter waktu di field yang benar, tidak pernah di baseFilter
  if (type === 'prospek') {
    if (periode === 'custom' && startDate && endDate) {
      filter.tanggalProspek = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (periode) {
        case 'today':
          filter.tanggalProspek = { gte: today };
          break;
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          filter.tanggalProspek = { gte: yesterday, lt: today };
          break;
        }
        case 'thisweek': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          filter.tanggalProspek = { gte: startOfWeek };
          break;
        }
        case 'thismonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filter.tanggalProspek = { gte: startOfMonth };
          break;
        }
        case 'lastmonth': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          filter.tanggalProspek = { gte: startOfLastMonth, lte: endOfLastMonth };
          break;
        }
      }
    }
  } else if (type === 'leads') {
    if (periode === 'custom' && startDate && endDate) {
      filter.tanggalJadiLeads = {
        not: null,
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (periode) {
        case 'today':
          filter.tanggalJadiLeads = { not: null, gte: today };
          break;
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          filter.tanggalJadiLeads = { not: null, gte: yesterday, lt: today };
          break;
        }
        case 'thisweek': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          filter.tanggalJadiLeads = { not: null, gte: startOfWeek };
          break;
        }
        case 'thismonth': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          filter.tanggalJadiLeads = { not: null, gte: startOfMonth, lt: startOfNextMonth };
          break;
        }
        case 'lastmonth': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          filter.tanggalJadiLeads = { not: null, gte: startOfLastMonth, lte: endOfLastMonth };
          break;
        }
      }
    }
  }
  return filter;
}
