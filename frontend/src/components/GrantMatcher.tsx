import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ExternalLink, Info, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import brain from "brain";

// Form schema for business profile
const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  abn: z.string().min(11, "ABN must be at least 11 characters"),
  business_structure: z.enum(["company", "trust", "partnership", "soleTrader"]),
  industry_sector: z.string().optional(),
  annual_turnover: z.coerce.number().min(0).optional(),
  employee_count: z.coerce.number().int().min(0).optional(),
  years_in_business: z.coerce.number().min(0).optional(),
  state: z.string().optional(),
  region: z.string().optional(),
  has_exported: z.boolean().default(false),
  r_and_d_activities: z.boolean().default(false),
  innovation_focus: z.boolean().default(false),
  sustainability_initiatives: z.boolean().default(false),
});

type BusinessFormValues = z.infer<typeof formSchema>;

export function GrantMatcher() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResults, setMatchResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedGrantId, setExpandedGrantId] = useState<string | null>(null);

  // Define default values
  const defaultValues: Partial<BusinessFormValues> = {
    name: "",
    abn: "",
    business_structure: "company",
    has_exported: false,
    r_and_d_activities: false,
    innovation_focus: false,
    sustainability_initiatives: false,
  };

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const toggleGrantDetails = (grantId: string) => {
    if (expandedGrantId === grantId) {
      setExpandedGrantId(null);
    } else {
      setExpandedGrantId(grantId);
    }
  };

  const onSubmit = async (values: BusinessFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Transform the form values into the API expected format
      const businessProfile = {
        id: "temp-" + Date.now(), // Temporary ID for API call
        name: values.name,
        abn: values.abn,
        business_structure: values.business_structure,
        industry_sector: values.industry_sector,
        annual_turnover: values.annual_turnover,
        employee_count: values.employee_count,
        years_in_business: values.years_in_business,
        location: {
          state: values.state,
          region: values.region,
        },
        has_exported: values.has_exported,
        r_and_d_activities: values.r_and_d_activities,
        innovation_focus: values.innovation_focus,
        sustainability_initiatives: values.sustainability_initiatives,
      };

      // Call the grant matcher API
      const response = await brain.match_grants({
        business_profile: businessProfile,
        min_score: 40, // Minimum score to include in results
        limit: 20, // Max number of results
        include_details: true,
      });

      const data = await response.json();
      setMatchResults(data);
    } catch (err) {
      console.error("Error matching grants:", err);
      setError("Failed to match grants. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-green-300";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 50) return "bg-yellow-300";
    if (score >= 40) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>
                Enter your business details to find matching grant opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Business Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="abn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ABN</FormLabel>
                          <FormControl>
                            <Input placeholder="Australian Business Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="business_structure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Structure</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business structure" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="company">Company</SelectItem>
                              <SelectItem value="trust">Trust</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="soleTrader">Sole Trader</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="annual_turnover"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Turnover ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 1000000" 
                                {...field} 
                                onChange={(e) => 
                                  field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))
                                }
                                value={field.value === undefined ? "" : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employee_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Employees</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 25" 
                                {...field} 
                                onChange={(e) => 
                                  field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))
                                }
                                value={field.value === undefined ? "" : field.value}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="industry_sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry Sector</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Technology, Manufacturing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="years_in_business"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 5" 
                              {...field} 
                              onChange={(e) => 
                                field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))
                              }
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectItem value="New South Wales">New South Wales</SelectItem>
                                <SelectItem value="Victoria">Victoria</SelectItem>
                                <SelectItem value="Queensland">Queensland</SelectItem>
                                <SelectItem value="Western Australia">Western Australia</SelectItem>
                                <SelectItem value="South Australia">South Australia</SelectItem>
                                <SelectItem value="Tasmania">Tasmania</SelectItem>
                                <SelectItem value="Northern Territory">Northern Territory</SelectItem>
                                <SelectItem value="Australian Capital Territory">ACT</SelectItem>
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
                            <FormLabel>Region (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sydney, Melbourne" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />
                    
                    <h3 className="text-md font-medium">Business Characteristics</h3>
                    <p className="text-sm text-gray-500 mb-3">These details help match specialized grants</p>
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="has_exported"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Export Activities</FormLabel>
                              <FormDescription>
                                Has exported or plans to export goods/services
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="r_and_d_activities"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>R&D Activities</FormLabel>
                              <FormDescription>
                                Conducts research and development activities
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="innovation_focus"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Innovation Focus</FormLabel>
                              <FormDescription>
                                Focuses on creating innovative products or services
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sustainability_initiatives"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Sustainability Initiatives</FormLabel>
                              <FormDescription>
                                Has environmental or sustainability goals
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Matching Grants...
                      </>
                    ) : (
                      <>
                        Find Matching Grants
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!matchResults && !error && (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <div>
                <h3 className="text-xl font-medium mb-2">Enter Your Business Details</h3>
                <p className="text-gray-500">
                  Our algorithm will find and score grant opportunities that match your business profile.
                </p>
              </div>
            </div>
          )}
          
          {matchResults && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Matching Grants</h2>
                <p className="text-sm text-gray-500">
                  {matchResults.matches.length} grants found for {matchResults.business_profile.name}
                </p>
              </div>
              
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-1">Average Match Score</p>
                      <p className="text-3xl font-bold">
                        {Math.round(matchResults.matches.reduce((sum, match) => sum + match.match_score.total_score, 0) / matchResults.matches.length || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">out of 100</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-1">Top Grant Value</p>
                      <p className="text-3xl font-bold">
                        {matchResults.matches.length > 0 && matchResults.matches[0].grant.funding.max_amount 
                          ? `$${matchResults.matches[0].grant.funding.max_amount.toLocaleString()}`
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">maximum funding</p>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-1">Strong Matches</p>
                      <p className="text-3xl font-bold">
                        {matchResults.matches.filter(match => match.match_score.total_score >= 70).length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">score of 70 or higher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="match">
                <TabsList className="mb-4">
                  <TabsTrigger value="match">Best Matches</TabsTrigger>
                  <TabsTrigger value="eligibility">By Eligibility</TabsTrigger>
                  <TabsTrigger value="value">By Value</TabsTrigger>
                  <TabsTrigger value="effort">By Application Ease</TabsTrigger>
                </TabsList>
                
                <TabsContent value="match" className="space-y-4">
                  {matchResults.matches
                    .sort((a: any, b: any) => b.match_score.total_score - a.match_score.total_score)
                    .map((match: any) => (
                      <GrantMatchCard 
                        key={match.grant.id}
                        match={match}
                        isExpanded={expandedGrantId === match.grant.id}
                        onToggleExpand={() => toggleGrantDetails(match.grant.id)}
                        scoreType="total"
                      />
                    ))}
                </TabsContent>
                
                <TabsContent value="eligibility" className="space-y-4">
                  {matchResults.matches
                    .sort((a: any, b: any) => b.match_score.eligibility_score - a.match_score.eligibility_score)
                    .map((match: any) => (
                      <GrantMatchCard 
                        key={match.grant.id}
                        match={match}
                        isExpanded={expandedGrantId === match.grant.id}
                        onToggleExpand={() => toggleGrantDetails(match.grant.id)}
                        scoreType="eligibility"
                      />
                    ))}
                </TabsContent>
                
                <TabsContent value="value" className="space-y-4">
                  {matchResults.matches
                    .sort((a: any, b: any) => b.match_score.value_score - a.match_score.value_score)
                    .map((match: any) => (
                      <GrantMatchCard 
                        key={match.grant.id}
                        match={match}
                        isExpanded={expandedGrantId === match.grant.id}
                        onToggleExpand={() => toggleGrantDetails(match.grant.id)}
                        scoreType="value"
                      />
                    ))}
                </TabsContent>
                
                <TabsContent value="effort" className="space-y-4">
                  {matchResults.matches
                    .sort((a: any, b: any) => b.match_score.effort_score - a.match_score.effort_score)
                    .map((match: any) => (
                      <GrantMatchCard 
                        key={match.grant.id}
                        match={match}
                        isExpanded={expandedGrantId === match.grant.id}
                        onToggleExpand={() => toggleGrantDetails(match.grant.id)}
                        scoreType="effort"
                      />
                    ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GrantMatchCard({ match, isExpanded, onToggleExpand, scoreType }: { 
  match: any, 
  isExpanded: boolean, 
  onToggleExpand: () => void, 
  scoreType: 'total' | 'eligibility' | 'value' | 'effort'
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-green-300";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 50) return "bg-yellow-300";
    if (score >= 40) return "bg-orange-400";
    return "bg-red-400";
  };
  
  let displayScore: number;
  let scoreLabel: string;
  
  switch (scoreType) {
    case "eligibility":
      displayScore = Math.round(match.match_score.eligibility_score);
      scoreLabel = "Eligibility Score";
      break;
    case "value":
      displayScore = Math.round(match.match_score.value_score);
      scoreLabel = "Value Score";
      break;
    case "effort":
      displayScore = Math.round(match.match_score.effort_score);
      scoreLabel = "Application Ease";
      break;
    default:
      displayScore = Math.round(match.match_score.total_score);
      scoreLabel = "Match Score";
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{match.grant.name}</CardTitle>
          <Badge variant={match.grant.level === "Federal" ? "default" : match.grant.level === "State" ? "secondary" : "outline"}>
            {match.grant.level}
          </Badge>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>{match.grant.provider}</span>
          {match.grant.state && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {match.grant.state}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
          <div className="col-span-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {match.grant.description}
            </p>
          </div>
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">{scoreLabel}</p>
              <div className="relative h-16 w-16 rounded-full flex items-center justify-center">
                <Progress
                  value={displayScore}
                  className={`h-16 w-16 rounded-full ${getScoreColor(displayScore)}`}
                />
                <span className="absolute text-lg font-bold">{displayScore}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {match.grant.category.slice(0, 3).map((cat: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {cat}
            </Badge>
          ))}
          {match.grant.category.length > 3 && (
            <Badge variant="outline" className="text-xs">+{match.grant.category.length - 3}</Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium">Funding Type: </span>
            <span>{match.grant.funding.funding_type}</span>
          </div>
          {match.grant.funding.max_amount && (
            <div>
              <span className="font-medium">Max Amount: </span>
              <span>${match.grant.funding.max_amount.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/GrantApplicationForm/${match.grant.id}`;
            }}
          >
            Apply for Grant
          </Button>
        </div>
        
        <Collapsible open={isExpanded} className="mt-4">
          <CollapsibleContent>
            <Separator className="my-3" />
            
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Match Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Eligibility:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>How well your business meets the grant's eligibility requirements</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-medium">{Math.round(match.match_score.eligibility_score)}/100</span>
                        </div>
                        <Progress value={match.match_score.eligibility_score} className="h-2.5 mt-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Value:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>The potential financial benefit relative to your business size and needs</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-medium">{Math.round(match.match_score.value_score)}/100</span>
                        </div>
                        <Progress value={match.match_score.value_score} className="h-2.5 mt-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Application Ease:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>How easy or difficult the application process is likely to be</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-medium">{Math.round(match.match_score.effort_score)}/100</span>
                        </div>
                        <Progress value={match.match_score.effort_score} className="h-2.5 mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center border rounded-lg p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Overall Score</p>
                    <div className="relative h-20 w-20 rounded-full flex items-center justify-center">
                      <Progress
                        value={Math.round(match.match_score.total_score)}
                        className={`h-20 w-20 rounded-full ${getScoreColor(Math.round(match.match_score.total_score))}`}
                      />
                      <span className="absolute text-2xl font-bold">{Math.round(match.match_score.total_score)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">out of 100</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    <h4 className="text-sm font-semibold">Matching Strengths</h4>
                    <Badge variant="outline" className="ml-2 text-xs">{match.match_score.matching_factors.length}</Badge>
                  </div>
                  
                  <ScrollArea className="h-40 rounded border p-3">
                    <ul className="text-sm space-y-2">
                      {match.match_score.matching_factors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-0.5 h-3 w-3 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{factor}</span>
                        </li>
                      ))}
                      {match.match_score.matching_factors.length === 0 && (
                        <li className="text-gray-500 italic">No matching strengths identified</li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
                
                <div>
                  <div className="flex items-center mb-3">
                    <h4 className="text-sm font-semibold">Improvement Opportunities</h4>
                    <Badge variant="outline" className="ml-2 text-xs">{match.match_score.gap_factors.length}</Badge>
                  </div>
                  
                  <ScrollArea className="h-40 rounded border p-3">
                    <ul className="text-sm space-y-2">
                      {match.match_score.gap_factors.map((factor: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-0.5 h-3 w-3 rounded-full bg-orange-400 flex-shrink-0" />
                          <span className="text-gray-700">{factor}</span>
                        </li>
                      ))}
                      {match.match_score.gap_factors.length === 0 && (
                        <li className="text-gray-600">No improvement opportunities identified - excellent match!</li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
              
              {match.match_score.gap_factors.length > 0 && (
                <Alert>
                  <AlertTitle className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Application Strategy
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mt-1 text-sm">
                      Address the improvement opportunities in your application to increase your chances of success. Focus on how your business aligns with the grant objectives despite any gaps identified.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={match.grant.website_url} target="_blank" rel="noopener noreferrer">
                  Visit Program Website
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center" 
          onClick={onToggleExpand}
        >
          {isExpanded ? (
            <>
              Hide Details
              <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              View Match Details
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
