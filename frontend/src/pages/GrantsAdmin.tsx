import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brain from "brain";
import { grantsAdminClient } from "utils/grantsAdminClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, RefreshCw, Search, Edit, Trash2, AlertCircle } from "lucide-react";
import { GrantProgram } from "components/GrantsExplorer";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Admin dashboard for managing the grants database
export default function GrantsAdmin() {
  const navigate = useNavigate();
  const [grants, setGrants] = useState<GrantProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    businessTypes: [] as string[],
    states: [] as string[],
    fundingTypes: [] as string[],
  });
  const [editingGrant, setEditingGrant] = useState<GrantProgram | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [grantToDelete, setGrantToDelete] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [scrapingLogs, setScrapingLogs] = useState<string[]>([]);
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);

  // Fetch grants on component mount
  useEffect(() => {
    fetchGrants();
    fetchFilterOptions();
  }, []);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const response = await brain.list_grants({});
      const data = await response.json();
      setGrants(data.grants);
    } catch (err) {
      console.error("Error fetching grants data:", err);
      setError("Failed to load grants data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
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
      
      setFilterOptions({
        categories: categoriesData.categories,
        businessTypes: businessTypesData.business_types,
        states: statesData.states,
        fundingTypes: fundingTypesData.funding_types,
      });
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const handleEditGrant = async (grantId: string) => {
    try {
      const response = await brain.get_grant({ grantId });
      const data = await response.json();
      setEditingGrant(data);
      setIsEditDialogOpen(true);
    } catch (err) {
      console.error("Error fetching grant details:", err);
      toast.error("Failed to load grant details");
    }
  };

  const handleDeleteGrant = (grantId: string) => {
    setGrantToDelete(grantId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteGrant = async () => {
    if (!grantToDelete) return;
    
    try {
      const response = await grantsAdminClient.deleteGrant(grantToDelete);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete grant");
      }
      
      toast.success("Grant deleted successfully");
      fetchGrants(); // Refresh the list
    } catch (err) {
      console.error("Error deleting grant:", err);
      toast.error(typeof err === 'object' && err instanceof Error ? err.message : "Failed to delete grant");
    } finally {
      setIsConfirmDeleteOpen(false);
      setGrantToDelete(null);
    }
  };

  const handleUpdateDatabase = async () => {
    setIsUpdating(true);
    try {
      // Fetch the latest data from the government endpoints
      const response = await brain.list_grants({});
      const data = await response.json();
      
      if (data.grants) {
        setGrants(data.grants);
        toast.success("Grant database updated successfully");
      } else {
        throw new Error("Failed to get updated grants");
      }
    } catch (err) {
      console.error("Error updating grant database:", err);
      toast.error("Failed to update grant database");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartScraping = async () => {
    setIsScrapingRunning(true);
    setScrapingLogs(["Starting government website scraping..."]);
    
    try {
      // Get selected sources
      const sourceCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      const selectedSources = Array.from(sourceCheckboxes)
        .map(cb => (cb as HTMLInputElement).id)
        .filter(id => id !== 'enable-schedule'); // Filter out the schedule checkbox
      
      // Start scraping
      const response = await grantsAdminClient.scrapeGrants(selectedSources, true);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to start scraping");
      }
      
      // Get scraping updates
      setScrapingLogs(prev => [...prev, "Scraping initiated successfully..."]);
      
      // Poll for status updates
      const statusInterval = setInterval(async () => {
        try {
          const statusResponse = await grantsAdminClient.getScrapeStatus();
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const latestStatus = statusData.statuses[statusData.statuses.length - 1];
            
            if (latestStatus) {
              setScrapingLogs(prev => {
                // Avoid duplicate logs
                if (!prev.includes(latestStatus.message)) {
                  return [...prev, latestStatus.message];
                }
                return prev;
              });
              
              // Check if scraping is complete
              if (latestStatus.status === 'completed' || latestStatus.status === 'error') {
                clearInterval(statusInterval);
                setIsScrapingRunning(false);
                if (latestStatus.status === 'completed') {
                  setScrapingLogs(prev => [
                    ...prev, 
                    `Scraping completed successfully. Found ${latestStatus.new_grants} new grants and updated ${latestStatus.updated_grants} existing grants.`
                  ]);
                  fetchGrants(); // Refresh grants list
                }
              }
            }
          }
        } catch (err) {
          console.error("Error fetching scrape status:", err);
        }
      }, 3000);
      
      // Clean up interval after 5 minutes (failsafe)
      setTimeout(() => {
        clearInterval(statusInterval);
        if (isScrapingRunning) {
          setIsScrapingRunning(false);
          setScrapingLogs(prev => [...prev, "Scraping timeout reached. Check results manually."]);
        }
      }, 5 * 60 * 1000);
      
    } catch (err) {
      console.error("Error during scraping:", err);
      setScrapingLogs(prev => [...prev, `Error: ${err}`]);
      setIsScrapingRunning(false);
    }
  };

  const filteredGrants = grants.filter(grant => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      grant.name.toLowerCase().includes(query) ||
      grant.description.toLowerCase().includes(query) ||
      grant.provider.toLowerCase().includes(query) ||
      grant.category.some(cat => cat.toLowerCase().includes(query))
    );
  });

  // Grant edit form
  const GrantEditForm = ({ grant, onSave, onCancel }: { grant: GrantProgram, onSave: (data: any) => void, onCancel: () => void }) => {
    const form = useForm({
      defaultValues: {
        name: grant.name,
        description: grant.description,
        provider: grant.provider,
        level: grant.level,
        state: grant.state || "",
        region: grant.region || "",
        website_url: grant.website_url,
        // Other fields would be initialized here
      }
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grant Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Federal">Federal</SelectItem>
                      <SelectItem value="State">State</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {filterOptions.states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Note: This is a simplified form. A complete form would have many more fields for categories, 
              eligibility criteria, funding details, etc. */}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    );
  };

  // Add new grant form 
  const GrantAddForm = ({ onSave, onCancel }: { onSave: (data: any) => void, onCancel: () => void }) => {
    const form = useForm({
      defaultValues: {
        name: "",
        description: "",
        provider: "",
        level: "Federal",
        state: "",
        region: "",
        website_url: "",
      }
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grant Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Federal">Federal</SelectItem>
                      <SelectItem value="State">State</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {filterOptions.states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Add Grant</Button>
          </div>
        </form>
      </Form>
    );
  };

  const handleSaveGrant = async (data: any) => {
    if (!editingGrant) return;
    
    try {
      const updatedGrant = { ...editingGrant, ...data };
      const response = await grantsAdminClient.updateGrant(updatedGrant.id, updatedGrant);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update grant");
      }
      
      toast.success("Grant updated successfully");
      setIsEditDialogOpen(false);
      fetchGrants(); // Refresh the list
    } catch (err) {
      console.error("Error updating grant:", err);
      toast.error(typeof err === 'object' && err instanceof Error ? err.message : "Failed to update grant");
    }
  };

  const handleAddGrant = async (data: any) => {
    try {
      // Create a new grant object with required properties
      const newGrant = {
        id: "", // ID will be generated by the backend
        name: data.name,
        description: data.description,
        provider: data.provider,
        level: data.level,
        state: data.state || undefined,
        region: data.region || undefined,
        category: ["General"], // Default category
        eligibility: {
          business_types: ["All"]
        },
        funding: {
          funding_type: "Grant"
        },
        application_period: {
          is_ongoing: true
        },
        website_url: data.website_url,
        keywords: [data.name.toLowerCase().split(" ")[0]]
      };
      
      const response = await grantsAdminClient.createGrant(newGrant);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create grant");
      }
      
      toast.success("Grant added successfully");
      setIsAddDialogOpen(false);
      fetchGrants(); // Refresh the list
    } catch (err) {
      console.error("Error adding grant:", err);
      toast.error(typeof err === 'object' && err instanceof Error ? err.message : "Failed to add grant");
    }
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grants Database Administration</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleUpdateDatabase}
            disabled={isUpdating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Database'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Grant
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="manage">
        <TabsList className="mb-6">
          <TabsTrigger value="manage">Manage Grants</TabsTrigger>
          <TabsTrigger value="scrape">Auto-Scraping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Grant Database</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search grants..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>Manage all government grants and incentives in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            {searchQuery ? "No matching grants found" : "No grants in the database"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGrants.map((grant) => (
                          <TableRow key={grant.id}>
                            <TableCell className="font-medium">{grant.name}</TableCell>
                            <TableCell>{grant.provider}</TableCell>
                            <TableCell>
                              <Badge variant={grant.level === "Federal" ? "default" : grant.level === "State" ? "secondary" : "outline"}>
                                {grant.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{grant.state || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {grant.category.slice(0, 2).map((cat, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                                {grant.category.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{grant.category.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditGrant(grant.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteGrant(grant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scrape">
          <Card>
            <CardHeader>
              <CardTitle>Government Website Auto-Scraping</CardTitle>
              <CardDescription>
                Automatically scan government websites for new and updated grants and incentives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-muted-foreground">
                    This tool will scan official government websites to find new grants and updates to existing grants.
                    The process may take several minutes to complete.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <div className="w-2/3">
                    <div className="rounded-md border p-4 h-60">
                      <h3 className="font-medium mb-2">Scraping Targets</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="business-gov" defaultChecked />
                          <label htmlFor="business-gov" className="text-sm">business.gov.au - Grants & Programs</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="grants-gov" defaultChecked />
                          <label htmlFor="grants-gov" className="text-sm">grants.gov.au</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="innovation-gov" defaultChecked />
                          <label htmlFor="innovation-gov" className="text-sm">innovation.gov.au</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="nsw-gov" />
                          <label htmlFor="nsw-gov" className="text-sm">NSW Government Grants</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="vic-gov" />
                          <label htmlFor="vic-gov" className="text-sm">Victoria State Government Grants</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="qld-gov" />
                          <label htmlFor="qld-gov" className="text-sm">Queensland Government Grants</label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        className="w-full" 
                        onClick={handleStartScraping}
                        disabled={isScrapingRunning}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isScrapingRunning ? 'animate-spin' : ''}`} />
                        {isScrapingRunning ? 'Scraping in Progress...' : 'Start Scraping'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="w-1/3">
                    <div className="rounded-md border p-4 h-60">
                      <h3 className="font-medium mb-2">Scraping Log</h3>
                      <ScrollArea className="h-48">
                        <div className="space-y-2 text-sm">
                          {scrapingLogs.length === 0 ? (
                            <p className="text-muted-foreground italic">No scraping logs yet. Start scraping to see progress.</p>
                          ) : (
                            scrapingLogs.map((log, index) => (
                              <p key={index}>{log}</p>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Scheduled Scraping</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="enable-schedule" />
                    <label htmlFor="enable-schedule" className="text-sm font-medium">Enable automated scheduled scraping</label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm mb-1 block">Frequency</label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm mb-1 block">Day</label>
                      <Select defaultValue="monday">
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm mb-1 block">Time (AEST)</label>
                      <Select defaultValue="2am">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12am">12:00 AM</SelectItem>
                          <SelectItem value="2am">2:00 AM</SelectItem>
                          <SelectItem value="4am">4:00 AM</SelectItem>
                          <SelectItem value="6am">6:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline">Save Schedule</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Grant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Grant</DialogTitle>
            <DialogDescription>
              Update the details of this grant. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          {editingGrant && (
            <GrantEditForm 
              grant={editingGrant} 
              onSave={handleSaveGrant} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Grant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Grant</DialogTitle>
            <DialogDescription>
              Fill in the details for the new grant. Click add when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <GrantAddForm 
            onSave={handleAddGrant} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this grant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteGrant}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
