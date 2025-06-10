import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BusinessEntity, 
  Company, 
  Trust, 
  Partnership, 
  SoleTrader,
  BusinessStructureType 
} from "../utils/tax-compliance-types";
import { 
  Building2Icon, 
  Users2Icon, 
  UserIcon, 
  BarChart3Icon,
  ClipboardListIcon,
  CalendarIcon,
  FileTextIcon,
  ShieldIcon,
  CheckCircleIcon,
  BriefcaseIcon
} from "lucide-react";

interface Props {
  entity: BusinessEntity;
  className?: string;
}

const businessStructureIcons = {
  company: <Building2Icon className="h-5 w-5" />,
  trust: <ShieldIcon className="h-5 w-5" />,
  partnership: <Users2Icon className="h-5 w-5" />,
  soleTrader: <UserIcon className="h-5 w-5" />,
};

export function BusinessEntityTaxView({ entity, className = "" }: Props) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Format ABN with proper spacing (XX XXX XXX XXX)
  const formatABN = (abn: string) => {
    if (!abn) return "";
    // Remove all non-numeric characters
    const cleanABN = abn.replace(/\D/g, '');
    // Format with spaces
    return cleanABN.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
  };

  // Format dates consistently
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine registration status badge
  const getRegistrationStatusBadge = (registered: boolean) => {
    return registered ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Registered
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground">
        Not Registered
      </Badge>
    );
  };

  // Entity-specific information sections
  const renderEntitySpecificInfo = () => {
    switch (entity.businessStructure) {
      case "company":
        return renderCompanyInfo(entity as Company);
      case "trust":
        return renderTrustInfo(entity as Trust);
      case "partnership":
        return renderPartnershipInfo(entity as Partnership);
      case "soleTrader":
        return renderSoleTraderInfo(entity as SoleTrader);
      default:
        return <p>No additional information available</p>;
    }
  };

  const renderCompanyInfo = (company: Company) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoItem label="Australian Company Number (ACN)" value={company.acn} />
        <InfoItem label="Company Type" value={company.companyType} format={capitalizeFirstLetter} />
      </div>
      
      {company.substitutedAccountingPeriod && (
        <div className="border rounded-lg p-3 bg-blue-50">
          <h3 className="text-sm font-medium mb-1 text-blue-700">Substituted Accounting Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Start Date:</span>{" "}
              <span className="font-medium">{formatDate(company.sapStartDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">End Date:</span>{" "}
              <span className="font-medium">{formatDate(company.sapEndDate)}</span>
            </div>
          </div>
        </div>
      )}
      
      {company.directors && company.directors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Company Directors</h3>
          <div className="space-y-2">
            {company.directors.map((director) => (
              <div key={director.directorId} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {director.firstName} {director.lastName}
                  </div>
                  <Badge variant="outline">
                    Director
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">Appointed: {formatDate(director.appointmentDate)}</div>
                {director.shareholding && director.shareholding.length > 0 && (
                  <div className="mt-2 pt-2 border-t text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Shareholding:</div>
                    {director.shareholding.map((share, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>{share.shareClass}</div>
                        <div>{share.percentageOwned}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTrustInfo = (trust: Trust) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoItem label="Trust Type" value={trust.trustType} format={capitalizeFirstLetter} />
        <InfoItem label="Trust Deed Date" value={formatDate(trust.trustDeedDate)} />
      </div>
      
      <div className="border rounded-lg p-3">
        <h3 className="text-sm font-medium mb-2">Trustee</h3>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">
            {trust.trustee && 'firstName' in trust.trustee ? 'Individual' : 'Company'}
          </Badge>
          <span className="font-medium">
            {'firstName' in trust.trustee ? 
              `${trust.trustee.firstName} ${trust.trustee.lastName}` : 
              trust.trustee.name}
          </span>
        </div>
      </div>
      
      {trust.beneficiaries && trust.beneficiaries.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Beneficiaries</h3>
          <div className="space-y-2">
            {trust.beneficiaries.map((beneficiary, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {'firstName' in beneficiary ? 
                      `${beneficiary.firstName} ${beneficiary.lastName}` : 
                      beneficiary.name}
                  </div>
                  <Badge variant="outline">
                    {'firstName' in beneficiary ? 'Individual' : 'Company'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPartnershipInfo = (partnership: Partnership) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoItem 
          label="Partnership Type" 
          value={partnership.partnershipType} 
          format={capitalizeFirstLetter} 
        />
        <InfoItem 
          label="Number of Partners" 
          value={partnership.partners ? partnership.partners.length.toString() : "0"} 
        />
      </div>
      
      {partnership.partners && partnership.partners.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Partners</h3>
          <div className="space-y-2">
            {partnership.partners.map((partner, idx) => (
              <div key={partner.entityId || idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {partner.entity && 'firstName' in partner.entity ? 
                      `${partner.entity.firstName} ${partner.entity.lastName}` : 
                      partner.entity?.name || `Partner ${idx + 1}`}
                  </div>
                  <Badge variant="outline">
                    {partner.entityType.charAt(0).toUpperCase() + partner.entityType.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Interest</div>
                    <div className="font-medium">{partner.partnershipInterest}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Profit Share</div>
                    <div className="font-medium">{partner.profitSharingRatio}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Loss Share</div>
                    <div className="font-medium">{partner.lossSharingRatio}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSoleTraderInfo = (soleTrader: SoleTrader) => (
    <div className="space-y-4">
      {soleTrader.individual && (
        <div className="border rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">Business Owner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoItem 
              label="Full Name" 
              value={`${soleTrader.individual.firstName} ${soleTrader.individual.lastName}`} 
            />
            <InfoItem 
              label="Date of Birth" 
              value={formatDate(soleTrader.individual.dateOfBirth)} 
            />
            <InfoItem 
              label="Tax File Number" 
              value={soleTrader.individual.tfn} 
              sensitive={true}
            />
            <InfoItem 
              label="Residency Status" 
              value={soleTrader.individual.residencyStatus} 
              format={formatResidencyStatus}
            />
          </div>
          
          {soleTrader.individual.contactDetails && (
            <div className="mt-3 pt-3 border-t">
              <h4 className="text-sm font-medium mb-1">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span>{soleTrader.individual.contactDetails.email}</span>
                </div>
                {soleTrader.individual.contactDetails.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span>{soleTrader.individual.contactDetails.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Helper functions
  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatResidencyStatus(status: string): string {
    switch (status) {
      case "resident":
        return "Australian Resident";
      case "foreignResident":
        return "Foreign Resident";
      case "workingHolidayMaker":
        return "Working Holiday Maker";
      default:
        return status;
    }
  }

  // Generic information item component
  const InfoItem = ({ 
    label, 
    value, 
    format, 
    sensitive = false 
  }: { 
    label: string; 
    value: string; 
    format?: (val: string) => string; 
    sensitive?: boolean;
  }) => {
    const displayValue = format ? format(value) : value;
    return (
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`font-medium ${sensitive ? 'font-mono' : ''}`}>
          {sensitive ? mask(displayValue) : displayValue}
        </span>
      </div>
    );
  };

  // Mask sensitive data (e.g., TFN)
  const mask = (value: string) => {
    if (!value || value === "N/A") return "N/A";
    const visibleChars = 3;
    return "*".repeat(Math.max(0, value.length - visibleChars)) + value.slice(-visibleChars);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {businessStructureIcons[entity.businessStructure as BusinessStructureType]}
          <div>
            <CardTitle>{entity.name}</CardTitle>
            <CardDescription>
              {entity.businessStructure.charAt(0).toUpperCase() + entity.businessStructure.slice(1)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <BarChart3Icon className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details">
              <ClipboardListIcon className="h-4 w-4 mr-1" />
              Details
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Compliance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Key entity information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <InfoItem label="ABN" value={formatABN(entity.abn)} />
              <InfoItem label="TFN" value={entity.tfn} sensitive={true} />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">GST Status</span>
                <div className="pt-1">
                  {getRegistrationStatusBadge(entity.registeredForGST)}
                </div>
              </div>
            </div>
            
            {/* GST Frequency if registered */}
            {entity.registeredForGST && entity.gstFrequency && (
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">GST Reporting Frequency</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your business is required to lodge Business Activity Statements 
                      {entity.gstFrequency === "monthly" ? "every month" : 
                       entity.gstFrequency === "quarterly" ? "every quarter" : "annually"}
                    </p>
                  </div>
                  <Badge>{entity.gstFrequency.charAt(0).toUpperCase() + entity.gstFrequency.slice(1)}</Badge>
                </div>
              </div>
            )}
            
            {/* Entity structure specific summary */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                Key {entity.businessStructure.charAt(0).toUpperCase() + entity.businessStructure.slice(1)} Information
              </h3>
              {renderEntitySpecificInfo()}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                <FileTextIcon className="h-4 w-4 mr-1" />
                Generate Tax Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {/* Detailed entity information */}
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 mb-2">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Business Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="Business Name" value={entity.name} />
                <InfoItem label="Business Structure" value={entity.businessStructure} format={capitalizeFirstLetter} />
                <InfoItem label="ABN" value={formatABN(entity.abn)} />
                <InfoItem label="TFN" value={entity.tfn} sensitive={true} />
                <InfoItem 
                  label="Entity Created" 
                  value={formatDate(entity.createdAt)} 
                />
                <InfoItem 
                  label="Last Updated" 
                  value={formatDate(entity.updatedAt)} 
                />
              </div>
            </div>
            
            {/* Structure-specific detailed information */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {businessStructureIcons[entity.businessStructure as BusinessStructureType]}
                <h3 className="text-sm font-medium">
                  {entity.businessStructure.charAt(0).toUpperCase() + entity.businessStructure.slice(1)} Structure
                </h3>
              </div>
              {renderEntitySpecificInfo()}
            </div>
          </TabsContent>
          
          <TabsContent value="compliance" className="space-y-4">
            <div className="border rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-medium">Tax Compliance Requirements</h3>
              
              <div className="space-y-2">
                {/* Income tax obligations */}
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-blue-600" />
                    <span>Income Tax Return</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {entity.businessStructure === "company" ? "Annually" : 
                    entity.businessStructure === "trust" ? "Annually" : 
                    entity.businessStructure === "partnership" ? "Annually" : 
                    "Annually"}
                  </Badge>
                </div>
                
                {/* GST obligations */}
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                    <span>Business Activity Statement</span>
                  </div>
                  <Badge className={entity.registeredForGST ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}>
                    {entity.registeredForGST ? 
                      (entity.gstFrequency?.charAt(0).toUpperCase() + entity.gstFrequency?.slice(1) || "Quarterly") : 
                      "Not Required"}
                  </Badge>
                </div>
                
                {/* PAYG obligations */}
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <div className="flex items-center gap-2">
                    <Users2Icon className="h-4 w-4 text-orange-600" />
                    <span>PAYG Withholding</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    Varies
                  </Badge>
                </div>
                
                {/* FBT obligations - only for companies */}
                {entity.businessStructure === "company" && (
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-purple-600" />
                      <span>Fringe Benefits Tax</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Annually
                    </Badge>
                  </div>
                )}
                
                {/* Superannuation */}
                <div className="flex justify-between items-center text-sm py-1">
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="h-4 w-4 text-indigo-600" />
                    <span>Superannuation Guarantee</span>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    Quarterly
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-3 space-y-2">
              <h3 className="text-sm font-medium">Structure-Specific Requirements</h3>
              
              {entity.businessStructure === "company" && (
                <>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span>Annual Company Statement</span>
                    <Badge variant="outline">ASIC Requirement</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span>Corporate Tax Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">25-30%</Badge>
                  </div>
                </>
              )}
              
              {entity.businessStructure === "trust" && (
                <>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span>Trust Distribution Resolution</span>
                    <Badge variant="outline">Before 30 June</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span>Trust Tax Return</span>
                    <Badge className="bg-blue-100 text-blue-800">Annually</Badge>
                  </div>
                </>
              )}
              
              {entity.businessStructure === "partnership" && (
                <>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span>Partnership Tax Return</span>
                    <Badge variant="outline">Non-Assessment</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span>Partner Individual Returns</span>
                    <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                  </div>
                </>
              )}
              
              {entity.businessStructure === "soleTrader" && (
                <>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span>Personal Income Tax Return</span>
                    <Badge variant="outline">Includes Business</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span>Individual Tax Rates</span>
                    <Badge className="bg-blue-100 text-blue-800">Progressive</Badge>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
