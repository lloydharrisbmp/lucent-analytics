import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserGuardContext } from "app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaxObligationTimeline } from "components/TaxObligationTimeline";
import { TaxObligationSummary } from "components/TaxObligationSummary";
import { BusinessEntityTaxView } from "components/BusinessEntityTaxView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TaxObligation, 
  BusinessEntity,
  BASStatement,
  TaxReturn
} from "../utils/tax-compliance-types";
import { 
  LayoutGridIcon, 
  FileBarChart2Icon, 
  CalendarIcon, 
  SearchIcon,
  FilterIcon,
  PlusCircleIcon,
  DownloadIcon,
  ShieldCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ComplianceIssuesView from "components/ComplianceIssuesView";
import NotificationBell from "components/NotificationBell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  businessEntities?: BusinessEntity[];
  selectedEntityId?: string;
  onEntityChange?: (entityId: string) => void;
  className?: string;
  isLoading?: boolean;
}

// Sample tax obligations data - in a real app, this would come from API calls
const sampleTaxObligations: TaxObligation[] = [
  {
    id: "to-1",
    entityId: "entity-1",
    obligationType: "bas",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 12)),
    status: "upcoming",
    amount: 5620,
    description: "Quarterly BAS - Q2 2024",
    period: {
      type: "quarter",
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 5, 30),
      label: "Q2 2024"
    }
  },
  {
    id: "to-2",
    entityId: "entity-1",
    obligationType: "income",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    status: "overdue",
    amount: 12480,
    description: "Annual Income Tax",
    period: {
      type: "year",
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2024, 5, 30),
      label: "2023-2024"
    }
  },
  {
    id: "to-3",
    entityId: "entity-1",
    obligationType: "superannuation",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    status: "upcoming",
    amount: 3450,
    description: "Quarterly Superannuation Guarantee",
    period: {
      type: "quarter",
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 5, 30),
      label: "Q2 2024"
    }
  },
  {
    id: "to-4",
    entityId: "entity-1",
    obligationType: "payg",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    status: "due",
    amount: 4280,
    description: "Monthly PAYG Withholding",
    period: {
      type: "month",
      startDate: new Date(2024, 4, 1),
      endDate: new Date(2024, 4, 31),
      label: "May 2024"
    }
  },
  {
    id: "to-5",
    entityId: "entity-1",
    obligationType: "bas",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 45)),
    lodgementDate: new Date(new Date().setDate(new Date().getDate() - 48)),
    paymentDueDate: new Date(new Date().setDate(new Date().getDate() - 45)),
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 48)),
    status: "paid",
    amount: 5280,
    description: "Quarterly BAS - Q1 2024",
    period: {
      type: "quarter",
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 2, 31),
      label: "Q1 2024"
    }
  }
];

// Sample business entity data
const sampleBusinessEntity: BusinessEntity = {
  id: "entity-1",
  name: "Oceanview Tech Solutions",
  abn: "98765432109",
  businessStructure: "company",
  tfn: "123456789",
  registeredForGST: true,
  gstFrequency: "quarterly",
  createdAt: new Date(2020, 3, 15),
  updatedAt: new Date(2024, 4, 10)
};

export function ComplianceDashboard({ 
  businessEntities = [],
  selectedEntityId,
  onEntityChange,
  isLoading = false,
  className = "" 
}: Props) {
  const [activeEntity, setActiveEntity] = useState<BusinessEntity | null>(null);
  const [obligations, setObligations] = useState<TaxObligation[]>([]);
  const [filteredObligations, setFilteredObligations] = useState<TaxObligation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("obligations");
  const [complianceRefreshTrigger, setComplianceRefreshTrigger] = useState<number>(0);
  const navigate = useNavigate();

  // Initialize with sample data for demonstration
  useEffect(() => {
    // In a real application, you would fetch data based on the selected entity
    setActiveEntity(sampleBusinessEntity);
    setObligations(sampleTaxObligations);
    setFilteredObligations(sampleTaxObligations);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...obligations];
    
    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(o => o.obligationType === filterType);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.description?.toLowerCase().includes(term) || 
        o.obligationType.toLowerCase().includes(term) ||
        o.period.label.toLowerCase().includes(term)
      );
    }
    
    setFilteredObligations(filtered);
  }, [obligations, filterStatus, filterType, searchTerm]);

  const handleObligationSelect = (obligation: TaxObligation) => {
    // In a real app, this would navigate to a detailed view of the obligation
    console.log("Selected obligation:", obligation.id);
  };

  const handleCreateObligation = () => {
    // In a real app, this would open a form to create a new obligation
    console.log("Create new obligation");
  };

  const handleGenerateReport = () => {
    // In a real app, this would generate a compliance report
    console.log("Generate report");
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-3 h-24 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mr-2 align-middle"></div>
              <span className="align-middle">Loading compliance data...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Tax Compliance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your tax obligations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
          <NotificationBell entityId={activeEntity?.id} className="mr-1" />
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            className="flex-1 sm:flex-initial"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            onClick={handleCreateObligation}
            className="flex-1 sm:flex-initial"
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Obligation
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Entity details */}
        {activeEntity && (
          <BusinessEntityTaxView 
            entity={activeEntity} 
            className="lg:col-span-3"
          />
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="obligations" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Tax Obligations
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Compliance Status
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <TabsContent value="obligations" className="mt-0">
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search obligations..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filters:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select 
                  value={filterStatus} 
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="lodged">Lodged</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={filterType} 
                  onValueChange={setFilterType}
                >
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income Tax</SelectItem>
                    <SelectItem value="bas">BAS</SelectItem>
                    <SelectItem value="ias">IAS</SelectItem>
                    <SelectItem value="payg">PAYG</SelectItem>
                    <SelectItem value="fbt">FBT</SelectItem>
                    <SelectItem value="superannuation">Superannuation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tax obligation summary */}
          <TaxObligationSummary 
            obligations={filteredObligations} 
            className="md:col-span-1"
          />
          
          {/* Tax obligation timeline */}
          <TaxObligationTimeline 
            obligations={filteredObligations}
            onObligationSelect={handleObligationSelect}
            className="md:col-span-2"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="compliance" className="mt-0">
        <ComplianceIssuesView 
          entityId={activeEntity?.id} 
          refreshTrigger={complianceRefreshTrigger} 
        />
      </TabsContent>
    </div>
  );
}
