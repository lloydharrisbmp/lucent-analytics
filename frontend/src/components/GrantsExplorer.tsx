import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brain from "brain";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface GrantProgram {
  id: string;
  name: string;
  description: string;
  provider: string;
  level: string;
  state?: string;
  region?: string;
  category: string[];
  eligibility: {
    business_types: string[];
    turnover_range?: string;
    employee_count_range?: string;
    industry_sectors?: string[];
    location_requirements?: string[];
    years_in_business?: string;
    additional_requirements?: string[];
  };
  funding: {
    min_amount?: number;
    max_amount?: number;
    co_contribution_required?: boolean;
    co_contribution_percentage?: number;
    funding_type: string;
  };
  application_period: {
    start_date?: string;
    end_date?: string;
    is_ongoing: boolean;
    next_round_expected?: string;
  };
  website_url: string;
  contact_information?: Record<string, string>;
  keywords: string[];
}

interface FilterOptions {
  categories: string[];
  businessTypes: string[];
  states: string[];
  fundingTypes: string[];
}

export function GrantsExplorer() {
  const navigate = useNavigate();
  const [grants, setGrants] = useState<GrantProgram[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<GrantProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    businessTypes: [],
    states: [],
    fundingTypes: [],
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [selectedFundingType, setSelectedFundingType] = useState<string | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<GrantProgram | null>(null);

  // Fetch grants and filter options on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch grants
        const grantsResponse = await brain.list_grants();
        const grantsData = await grantsResponse.json();
        
        // Fetch categories
        const categoriesResponse = await brain.get_grant_categories();
        const categoriesData = await categoriesResponse.json();
        
        // Fetch business types
        const businessTypesResponse = await brain.get_business_types();
        const businessTypesData = await businessTypesResponse.json();
        
        // Fetch states
        const statesResponse = await brain.get_states();
        const statesData = await statesResponse.json();
        
        // Fetch funding types
        const fundingTypesResponse = await brain.get_funding_types();
        const fundingTypesData = await fundingTypesResponse.json();
        
        setGrants(grantsData.grants);
        setFilteredGrants(grantsData.grants);
        setFilterOptions({
          categories: categoriesData.categories,
          businessTypes: businessTypesData.business_types,
          states: statesData.states,
          fundingTypes: fundingTypesData.funding_types,
        });
      } catch (err) {
        console.error("Error fetching grants data:", err);
        setError("Failed to load grants data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        // Build query parameters for API call
        const params: Record<string, any> = {};
        if (selectedLevel) params.level = selectedLevel;
        if (selectedState) params.state = selectedState;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBusinessType) params.business_type = selectedBusinessType;
        if (selectedFundingType) params.funding_type = selectedFundingType;
        if (searchQuery) params.q = searchQuery;

        // Make API call with filters
        const response = await brain.list_grants(params);
        const data = await response.json();
        setFilteredGrants(data.grants);
      } catch (err) {
        console.error("Error applying filters:", err);
        setError("Failed to apply filters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Only apply filters if initial data has been loaded
    if (grants.length > 0) {
      applyFilters();
    }
  }, [selectedLevel, selectedState, selectedCategory, selectedBusinessType, selectedFundingType, searchQuery, grants.length]);

  // View details handler
  const handleViewDetails = async (grantId: string) => {
    try {
      const response = await brain.get_grant({ grant_id: grantId });
      const data = await response.json();
      setSelectedGrant(data);
    } catch (err) {
      console.error("Error fetching grant details:", err);
      setError("Failed to load grant details. Please try again later.");
    }
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLevel(null);
    setSelectedState(null);
    setSelectedCategory(null);
    setSelectedBusinessType(null);
    setSelectedFundingType(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Find Government Grants & Incentives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">Search</label>
            <Input
              id="search"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Level</label>
            <Select value={selectedLevel || ""} onValueChange={(value) => setSelectedLevel(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="Federal">Federal</SelectItem>
                <SelectItem value="State">State</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Select value={selectedState || ""} onValueChange={(value) => setSelectedState(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {filterOptions.states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type</label>
            <Select value={selectedBusinessType || ""} onValueChange={(value) => setSelectedBusinessType(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Business Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Business Types</SelectItem>
                {filterOptions.businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Funding Type</label>
            <Select value={selectedFundingType || ""} onValueChange={(value) => setSelectedFundingType(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="All Funding Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Funding Types</SelectItem>
                {filterOptions.fundingTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {loading ? "Loading..." : `${filteredGrants.length} grants found`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50"
              onClick={() => navigate("/GrantsAdmin")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Admin
            </Button>
          </div>
        </div>
      </div>
      
      {/* Grant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
              </CardFooter>
            </Card>
          ))
        ) : filteredGrants.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <h3 className="text-xl font-semibold mb-2">No grants found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </div>
        ) : (
          filteredGrants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">{grant.name}</CardTitle>
                  <Badge variant={grant.level === "Federal" ? "default" : grant.level === "State" ? "secondary" : "outline"}>
                    {grant.level}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <span>{grant.provider}</span>
                  {grant.state && (
                    <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {grant.state}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {grant.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {grant.category.slice(0, 3).map((cat, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {grant.category.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{grant.category.length - 3}</Badge>
                  )}
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Funding Type:</span>
                    <span>{grant.funding.funding_type}</span>
                  </div>
                  {grant.funding.max_amount && (
                    <div className="flex justify-between">
                      <span className="font-medium">Max Amount:</span>
                      <span>${grant.funding.max_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleViewDetails(grant.id)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={() => navigate(`/GrantApplicationForm/${grant.id}`)}
                  >
                    Apply
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Grant Details Dialog */}
      <AlertDialog open={!!selectedGrant} onOpenChange={(open) => !open && setSelectedGrant(null)}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedGrant && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold flex justify-between items-center">
                  <span>{selectedGrant.name}</span>
                  <Badge variant={selectedGrant.level === "Federal" ? "default" : selectedGrant.level === "State" ? "secondary" : "outline"}>
                    {selectedGrant.level}
                  </Badge>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base text-black font-normal mt-2">
                  {selectedGrant.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Provider Information</h3>
                <p className="mb-1"><span className="font-medium">Provider:</span> {selectedGrant.provider}</p>
                {selectedGrant.state && (
                  <p className="mb-1"><span className="font-medium">State:</span> {selectedGrant.state}</p>
                )}
                {selectedGrant.region && (
                  <p className="mb-1"><span className="font-medium">Region:</span> {selectedGrant.region}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGrant.category.map((cat, index) => (
                    <Badge key={index} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold mb-2">Eligibility</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Business Types:</span> {selectedGrant.eligibility.business_types.join(", ")}</p>
                  
                  {selectedGrant.eligibility.turnover_range && (
                    <p><span className="font-medium">Turnover Range:</span> {selectedGrant.eligibility.turnover_range}</p>
                  )}
                  
                  {selectedGrant.eligibility.employee_count_range && (
                    <p><span className="font-medium">Employee Count:</span> {selectedGrant.eligibility.employee_count_range}</p>
                  )}
                  
                  {selectedGrant.eligibility.years_in_business && (
                    <p><span className="font-medium">Years in Business:</span> {selectedGrant.eligibility.years_in_business}</p>
                  )}
                  
                  {selectedGrant.eligibility.industry_sectors && selectedGrant.eligibility.industry_sectors.length > 0 && (
                    <p><span className="font-medium">Industry Sectors:</span> {selectedGrant.eligibility.industry_sectors.join(", ")}</p>
                  )}
                  
                  {selectedGrant.eligibility.location_requirements && selectedGrant.eligibility.location_requirements.length > 0 && (
                    <p><span className="font-medium">Location Requirements:</span> {selectedGrant.eligibility.location_requirements.join(", ")}</p>
                  )}
                  
                  {selectedGrant.eligibility.additional_requirements && selectedGrant.eligibility.additional_requirements.length > 0 && (
                    <div>
                      <p className="font-medium">Additional Requirements:</p>
                      <ul className="list-disc list-inside ml-2">
                        {selectedGrant.eligibility.additional_requirements.map((req, index) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold mb-2">Funding Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Funding Type:</span> {selectedGrant.funding.funding_type}</p>
                  
                  {(selectedGrant.funding.min_amount || selectedGrant.funding.max_amount) && (
                    <p>
                      <span className="font-medium">Amount:</span> {
                        selectedGrant.funding.min_amount && selectedGrant.funding.max_amount
                          ? `$${selectedGrant.funding.min_amount.toLocaleString()} - $${selectedGrant.funding.max_amount.toLocaleString()}`
                          : selectedGrant.funding.min_amount
                            ? `Minimum $${selectedGrant.funding.min_amount.toLocaleString()}`
                            : `Up to $${selectedGrant.funding.max_amount!.toLocaleString()}`
                      }
                    </p>
                  )}
                  
                  {selectedGrant.funding.co_contribution_required !== undefined && (
                    <p>
                      <span className="font-medium">Co-contribution Required:</span> {
                        selectedGrant.funding.co_contribution_required 
                          ? `Yes${selectedGrant.funding.co_contribution_percentage ? ` (${selectedGrant.funding.co_contribution_percentage}%)` : ''}` 
                          : 'No'
                      }
                    </p>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold mb-2">Application Period</h3>
                <div className="space-y-2">
                  {selectedGrant.application_period.is_ongoing ? (
                    <p><span className="font-medium">Status:</span> Ongoing applications accepted</p>
                  ) : (
                    <>
                      {(selectedGrant.application_period.start_date || selectedGrant.application_period.end_date) && (
                        <p>
                          <span className="font-medium">Application Period:</span> {
                            selectedGrant.application_period.start_date && selectedGrant.application_period.end_date
                              ? `${selectedGrant.application_period.start_date} to ${selectedGrant.application_period.end_date}`
                              : selectedGrant.application_period.start_date
                                ? `Starting from ${selectedGrant.application_period.start_date}`
                                : `Until ${selectedGrant.application_period.end_date}`
                          }
                        </p>
                      )}
                      
                      {selectedGrant.application_period.next_round_expected && (
                        <p><span className="font-medium">Next Round Expected:</span> {selectedGrant.application_period.next_round_expected}</p>
                      )}
                    </>
                  )}
                </div>
                
                {selectedGrant.contact_information && Object.keys(selectedGrant.contact_information).length > 0 && (
                  <>
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      {Object.entries(selectedGrant.contact_information).map(([key, value]) => (
                        <p key={key}>
                          <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <AlertDialogFooter className="mt-6 gap-2">
                <AlertDialogCancel>Close</AlertDialogCancel>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedGrant(null);
                      navigate(`/GrantApplicationForm/${selectedGrant.id}`);
                    }}
                  >
                    Apply for Grant
                  </Button>
                  <AlertDialogAction asChild>
                    <Button 
                      onClick={() => window.open(selectedGrant.website_url, "_blank")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Visit Official Website
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
