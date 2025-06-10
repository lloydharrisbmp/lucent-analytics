import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Added Accordion
import { toast } from "sonner";
import { Save, FolderOpen, Loader2, FilePlus2 } from "lucide-react";
import brain from "brain";
import { BusinessPlanData, BusinessPlanMetadata } from "types"; // Assuming types are generated
import DashboardLayout from "components/DashboardLayout"; // Assuming a layout component exists

// Define initial state for the sections
const initialPlanSections = {
  executiveSummary: null,
  companyDescription: null,
  marketAnalysis: null,
  organizationManagement: null,
  productsServices: null,
  marketingSalesStrategy: null,
  financialProjections: null,
  appendix: null,
};

const BusinessPlanning = () => {
  const [planName, setPlanName] = useState<string>("");
  const [planType, setPlanType] = useState<string>(""); // e.g., 'new', 'existing'
  const [versionNotes, setVersionNotes] = useState<string>(""); // Optional notes for this version
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);

  // State for loading plans and versions
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true); // Start loading initially
  const [isPerformingLoad, setIsPerformingLoad] = useState<boolean>(false);
  const [availablePlans, setAvailablePlans] = useState<BusinessPlanMetadata[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  // State to track the currently loaded plan context
  const [currentLoadedPlanId, setCurrentLoadedPlanId] = useState<string | null>(null);
  const [currentLoadedVersionId, setCurrentLoadedVersionId] = useState<string | null>(null);

  // State for plan sections content
  const [planSections, setPlanSections] = useState<Omit<BusinessPlanData, 'planName' | 'planType' | 'versionNotes'>>(initialPlanSections);

  // Helper functions to update section content
  const updateSectionContent = (section: keyof typeof initialPlanSections, content: string | null) => {
    setPlanSections(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handleSave = async () => {
    if (!planName || !planType) {
      toast.error("Please enter a Plan Name and select a Plan Type.");
      return;
    }

    setIsSaving(true);
    setSavedPlanId(null); // Reset saved ID on new save attempt

    // Construct the payload - initially just name, type, and notes.
    // Other sections will be added as the UI develops.
    const planData: BusinessPlanData = {
      planName: planName,
      planType: planType,
      versionNotes: versionNotes || null, // Send null if empty
      // Spread the section data from state
      ...planSections,
    };

    try {
      // Assuming brain client regenerates with the new endpoint
      const response = await brain.save_business_plan(planData);
      const result = await response.json();
      setSavedPlanId(result.planId); // Store the ID of the newly saved plan version
      setVersionNotes(""); // Clear notes after successful save
      toast.success(`Plan '${planName}' saved successfully (Version ID: ${result.planId})`);
      // Update loaded plan context with the newly saved version
      setCurrentLoadedPlanId(result.planId);
      setCurrentLoadedVersionId(result.versionId);
      // Optionally clear fields or navigate after save
    } catch (error: any) {
      console.error("Error saving business plan:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Failed to save business plan";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Load Plan Logic --- 

  // Fetch available plans on component mount
  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const fetchAvailablePlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await brain.list_business_plans(); // Fetches all plan versions
      const plans = await response.json();
      // Ensure plans is an array before setting
      setAvailablePlans(Array.isArray(plans) ? plans : []);
    } catch (error) {
      console.error("Error fetching available plans:", error);
      toast.error("Failed to load available business plans.");
      setAvailablePlans([]); // Ensure it's an empty array on error
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleLoadPlan = async () => {
    if (!selectedPlanId || !selectedVersionId) {
      toast.error("Please select both a plan and a version to load.");
      return;
    }

    setIsPerformingLoad(true);
    try {
      const response = await brain.load_business_plan_version({ 
        plan_id: selectedPlanId, 
        version_id: selectedVersionId 
      });
      const loadedPlanData: BusinessPlanData = await response.json();
      
      // Populate fields with loaded data
      setPlanName(loadedPlanData.planName);
      setPlanType(loadedPlanData.planType);
      setVersionNotes(loadedPlanData.versionNotes || "");
      setCurrentLoadedPlanId(selectedPlanId);
      setCurrentLoadedVersionId(selectedVersionId);
      setSavedPlanId(selectedVersionId); // Show the loaded version ID in the details section
      setVersionNotes(""); // Clear version notes after loading
      
      // Update plan sections state
      setPlanSections({
        executiveSummary: loadedPlanData.executiveSummary ?? null,
        companyDescription: loadedPlanData.companyDescription ?? null,
        marketAnalysis: loadedPlanData.marketAnalysis ?? null,
        organizationManagement: loadedPlanData.organizationManagement ?? null,
        productsServices: loadedPlanData.productsServices ?? null,
        marketingSalesStrategy: loadedPlanData.marketingSalesStrategy ?? null,
        financialProjections: loadedPlanData.financialProjections ?? null,
        appendix: loadedPlanData.appendix ?? null,
      });

      toast.success(`Plan '${loadedPlanData.planName}' (Version ${selectedVersionId.substring(0,8)}...) loaded successfully.`);

    } catch (error: any) {
      console.error("Error loading plan version:", error);
       const errorMsg = error.response?.data?.detail || error.message || "Failed to load plan version";
      toast.error(`Error: ${errorMsg}`);
      // Optionally clear state on error, depending on desired UX
      // setCurrentLoadedPlanId(null);
      // setCurrentLoadedVersionId(null);
    } finally {
      setIsPerformingLoad(false);
    }
  };

  // --- Memoized Selectors for Dropdowns ---

  // Group plans by planId and sort versions within each group
  const uniquePlanGroups = useMemo(() => {
    const groups = new Map<string, { planId: string; planName: string; versions: BusinessPlanMetadata[] }>();
    availablePlans.forEach(plan => {
      if (!groups.has(plan.planId)) {
        groups.set(plan.planId, { planId: plan.planId, planName: plan.planName, versions: [] });
      }
      groups.get(plan.planId)?.versions.push(plan);
    });
    // Sort versions within each group (newest first)
    groups.forEach(group => {
        group.versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    // Sort groups alphabetically by plan name for the dropdown
    return Array.from(groups.values()).sort((a, b) => a.planName.localeCompare(b.planName));
  }, [availablePlans]);

  // Get sorted versions for the currently selected plan ID
  const versionsForSelectedPlan = useMemo(() => {
    if (!selectedPlanId) return [];
    const group = uniquePlanGroups.find(g => g.planId === selectedPlanId);
    return group ? group.versions : []; // Already sorted
  }, [selectedPlanId, uniquePlanGroups]);

  // Reset version selection when plan selection changes
  useEffect(() => {
      setSelectedVersionId("");
  }, [selectedPlanId]);

  const handleClearForm = () => {
    setPlanName("");
    setPlanType("");
    setVersionNotes("");
    setCurrentLoadedPlanId(null);
    setCurrentLoadedVersionId(null);
    setSavedPlanId(null);
    setSelectedPlanId(""); // Also clear the load selections
    setSelectedVersionId("");
    setPlanSections(initialPlanSections); // Clear section data
    toast.info("Form cleared. Ready for new plan entry.");
  };

  // --- Render Logic ---

  // Assuming DashboardLayout handles overall page structure, nav, etc.
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Business Planning</h1>
            <p className="text-muted-foreground">Create, manage, and version your business plans.</p>
          </div>
          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving || isPerformingLoad}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save New Version"}
          </Button>
          {/* Clear Button */}
           <Button variant="outline" onClick={handleClearForm} disabled={isSaving || isPerformingLoad}>
             <FilePlus2 className="mr-2 h-4 w-4" />
             Clear / New Plan
           </Button>
        </div>

        {/* Load Plan Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Load Existing Plan</CardTitle>
            <CardDescription>Select a plan and version to load and continue working.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPlans ? (
              <div className="flex items-center justify-center text-muted-foreground py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading plans...
              </div>
            ) : uniquePlanGroups.length === 0 ? (
               <p className="text-sm text-muted-foreground italic text-center py-4">No existing plans found. Save a plan first.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label htmlFor="selectPlan">Select Plan</Label>
                  <Select
                    value={selectedPlanId}
                    onValueChange={setSelectedPlanId}
                    disabled={isPerformingLoad}
                  >
                    <SelectTrigger id="selectPlan">
                      <SelectValue placeholder="Select a plan name..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePlanGroups.map((group) => (
                        <SelectItem key={group.planId} value={group.planId}>{group.planName} ({group.versions.length} versions)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Version Selection */}
                <div className="space-y-2">
                  <Label htmlFor="selectVersion">Select Version</Label>
                  <Select
                    value={selectedVersionId}
                    onValueChange={setSelectedVersionId}
                    disabled={!selectedPlanId || isPerformingLoad || versionsForSelectedPlan.length === 0}
                  >
                    <SelectTrigger id="selectVersion">
                      <SelectValue placeholder={selectedPlanId ? "Select version..." : "Select plan first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {versionsForSelectedPlan.map(version => (
                        <SelectItem key={version.versionId} value={version.versionId}>
                          {`Version ${version.versionId.substring(0, 8)}... (${new Date(version.createdAt).toLocaleString()})`}
                          {version.versionNotes && ` - ${version.versionNotes.substring(0, 40)}${version.versionNotes.length > 40 ? '...' : ''}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Load Button */}
                <Button 
                  onClick={handleLoadPlan} 
                  disabled={!selectedPlanId || !selectedVersionId || isPerformingLoad || isSaving}
                  className="w-full md:w-auto"
                >
                   {isPerformingLoad ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                   ) : (
                      <FolderOpen className="mr-2 h-4 w-4" />
                   )}
                  {isPerformingLoad ? "Loading..." : "Load Selected Version"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

         {/* Plan Details Section (for editing/creating) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentLoadedPlanId ? `Editing: ${planName}` : "Create New Plan Version"}
              {currentLoadedVersionId && <span className="text-sm font-normal text-muted-foreground ml-2">(Loaded Version: {currentLoadedVersionId.substring(0,8)}...)</span>}
            </CardTitle>
            <CardDescription>
              {currentLoadedPlanId 
                ? "Modify the details below. Saving will create a new version of this plan."
                : "Define the basic information for a new plan version."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., My Startup Expansion Plan V1"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={isSaving || isPerformingLoad} // Disable editing name when loaded?
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type *</Label>
                <Select
                  value={planType}
                  onValueChange={setPlanType}
                  disabled={isSaving || isPerformingLoad} // Disable editing type when loaded?
                >
                  <SelectTrigger id="planType">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Business</SelectItem>
                    <SelectItem value="existing">Existing Business</SelectItem>
                    <SelectItem value="expansion">Expansion Plan</SelectItem>
                    <SelectItem value="funding">Funding Proposal</SelectItem>
                    <SelectItem value="internal">Internal Strategic Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="versionNotes">Version Notes (Optional)</Label>
                <Input
                  id="versionNotes"
                  placeholder="e.g., Updated financial projections, added marketing section"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
               {savedPlanId && (
                <p className="text-sm text-green-600 font-medium mt-2">Last saved/loaded version ID: {savedPlanId.substring(0, 8)}...</p>
               )}
          </CardContent>
        </Card>

        {/* Business Plan Sections Accordion */}
        <Accordion type="multiple" className="w-full" defaultValue={["executive-summary"]}>
          {/* Executive Summary */}
          <AccordionItem value="executive-summary">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Executive Summary</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                {/* <Label htmlFor="executiveSummary">Executive Summary Content</Label> */}
                <Textarea
                  id="executiveSummary"
                  placeholder="Provide a concise overview of your business, mission, products/services, target market, and financial highlights. This should be compelling enough to grab the reader's interest."
                  value={planSections.executiveSummary ?? ""} // Use ?? "" to handle null
                  onChange={(e) => updateSectionContent("executiveSummary", e.target.value || null)} // Send null if empty
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Company Description */}
          <AccordionItem value="company-description">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Company Description</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="companyDescription"
                  placeholder="Describe your company, mission, vision, and values."
                  value={planSections.companyDescription ?? ""} // Use ?? "" to handle null
                  onChange={(e) => updateSectionContent("companyDescription", e.target.value || null)} // Send null if empty
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* == Add New Sections Below == */}
          {/* Market Analysis */}
          <AccordionItem value="market-analysis">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Market Analysis</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="marketAnalysis"
                  placeholder="Analyze your target market, industry trends, and competition."
                  value={planSections.marketAnalysis ?? ""}
                  onChange={(e) => updateSectionContent("marketAnalysis", e.target.value || null)}
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Organization & Management */}
          <AccordionItem value="organization-management">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Organization & Management</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="organizationManagement"
                  placeholder="Describe your team structure, key personnel, and ownership."
                  value={planSections.organizationManagement ?? ""}
                  onChange={(e) => updateSectionContent("organizationManagement", e.target.value || null)}
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Products & Services */}
          <AccordionItem value="products-services">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Products/Services</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="productsServices"
                  placeholder="Detail your products or services, features, benefits, and lifecycle."
                  value={planSections.productsServices ?? ""}
                  onChange={(e) => updateSectionContent("productsServices", e.target.value || null)}
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Marketing & Sales Strategy */}
          <AccordionItem value="marketing-sales-strategy">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Marketing & Sales Strategy</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="marketingSalesStrategy"
                  placeholder="Outline your marketing plan, sales tactics, and distribution channels."
                  value={planSections.marketingSalesStrategy ?? ""}
                  onChange={(e) => updateSectionContent("marketingSalesStrategy", e.target.value || null)}
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Financial Projections */}
          <AccordionItem value="financial-projections">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Financial Projections</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="financialProjections"
                  placeholder="Provide financial forecasts, funding requests (if any), and key assumptions."
                  value={planSections.financialProjections ?? ""}
                  onChange={(e) => updateSectionContent("financialProjections", e.target.value || null)}
                  className="min-h-[150px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Appendix */}
          <AccordionItem value="appendix">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">Appendix</AccordionTrigger>
            <AccordionContent>
              <div className="grid w-full gap-1.5 p-1">
                <Textarea
                  id="appendix"
                  placeholder="Include supporting documents like resumes, permits, licenses, etc."
                  value={planSections.appendix ?? ""}
                  onChange={(e) => updateSectionContent("appendix", e.target.value || null)}
                  className="min-h-[100px] text-sm focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={isSaving || isPerformingLoad}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* == End New Sections == */}

          {/* Placeholder for other sections - to be added in MYA-74 */}

        </Accordion>

      </div>
    </DashboardLayout>
  );
};

export default BusinessPlanning;
