export interface Client {
  id: string;
  name: string;
  industry: string;
  businessType: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  annualRevenue: number;
  taxFileNumber: string;
  abn: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
  profileImage?: string;
}

export interface ClientSummary {
  totalRevenue: number;
  totalProfit: number;
  activeBenchmarks: number;
  complianceScore: number;
  cashConversionCycle: number;
  lastActivityDate: string;
}

/**
 * Generates a set of sample clients for testing the clients page
 */
export function generateSampleClients(count = 15): Client[] {
  const industries = [
    'Retail', 'Manufacturing', 'Healthcare', 'Technology', 'Construction',
    'Finance', 'Hospitality', 'Education', 'Transportation', 'Agriculture'
  ];
  
  const businessTypes = [
    'Sole Trader', 'Partnership', 'Company', 'Trust', 'Non-Profit'
  ];
  
  const locations = [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
    'Canberra', 'Hobart', 'Darwin', 'Gold Coast', 'Newcastle'
  ];
  
  const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
  
  const clients: Client[] = [];
  
  for (let i = 0; i < count; i++) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
    
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(updatedAt.getDate() + Math.floor(Math.random() * 30));
    
    const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
    const randomBusinessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate a fake ABN in the Australian format (11 digits)
    const abn = ''.padStart(11, '0').split('').map(() => Math.floor(Math.random() * 10)).join('');
    
    // Generate a fake TFN (9 digits)
    const tfn = ''.padStart(9, '0').split('').map(() => Math.floor(Math.random() * 10)).join('');
    
    clients.push({
      id: `client-${i + 1}`,
      name: `Client ${String.fromCharCode(65 + i % 26)}${i > 25 ? Math.floor(i / 26) : ''}`,
      industry: randomIndustry,
      businessType: randomBusinessType,
      location: randomLocation,
      contactName: `Contact ${String.fromCharCode(65 + i % 26)}`,
      contactEmail: `contact${i + 1}@example.com`,
      contactPhone: `+61 4${Math.floor(10000000 + Math.random() * 90000000)}`,
      annualRevenue: Math.floor(500000 + Math.random() * 9500000),
      taxFileNumber: tfn,
      abn: abn,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      status: randomStatus,
      notes: Math.random() > 0.3 ? `Notes for client ${i + 1}` : undefined,
      profileImage: Math.random() > 0.5 ? `https://i.pravatar.cc/150?u=${i}` : undefined
    });
  }
  
  return clients;
}

/**
 * Generate sample client summary data
 */
export function generateClientSummary(clientId: string): ClientSummary {
  return {
    totalRevenue: Math.floor(500000 + Math.random() * 5000000),
    totalProfit: Math.floor(100000 + Math.random() * 1000000),
    activeBenchmarks: Math.floor(1 + Math.random() * 5),
    complianceScore: Math.floor(60 + Math.random() * 40),
    cashConversionCycle: Math.floor(30 + Math.random() * 50),
    lastActivityDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
