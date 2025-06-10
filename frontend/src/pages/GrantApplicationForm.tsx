import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import brain from "brain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function GrantApplicationForm() {
  const { grantId } = useParams<{ grantId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [grant, setGrant] = useState<any>(null);
  const [businessEntities, setBusinessEntities] = useState<any[]>([]);
  
  // Form state
  const [businessId, setBusinessId] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch grant details
        if (grantId) {
          const grantResponse = await brain.get_grant({ grant_id: grantId });
          const grantData = await grantResponse.json();
          setGrant(grantData);
        }
        
        // Fetch business entities
        try {
          const entitiesResponse = await brain.list_business_entities({});
          const entitiesData = await entitiesResponse.json();
          setBusinessEntities(entitiesData.entities || []);
        } catch (err) {
          console.error("Error fetching business entities:", err);
          // Non-critical error, so we don't show it to the user
          setBusinessEntities([]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load grant information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [grantId]);
  
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grantId) {
      setError("Grant ID is required");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await brain.create_application({
        grant_id: grantId,
        business_id: businessId || undefined,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        notes: notes,
      });
      
      const data = await response.json();
      
      // Set success state
      setSuccess(true);
      
      // Navigate to the application details page after a short delay to show success message
      setTimeout(() => {
        navigate(`/GrantApplicationDetails/${data.application.id}`);
      }, 1500);
      
    } catch (err) {
      console.error("Error creating application:", err);
      setError("Failed to create application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex animate-pulse space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !grant) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="container mx-auto py-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Application Created</AlertTitle>
          <AlertDescription>
            Your application has been created successfully. Redirecting to application details...
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">New Grant Application</h1>
      </div>
      
      {grant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Apply for {grant.name}</CardTitle>
                <CardDescription>
                  Complete the form below to start your application for this grant
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateApplication}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Business Entity */}
                  {businessEntities.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="business-entity">Business Entity</Label>
                      <Select value={businessId} onValueChange={setBusinessId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business entity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None (Personal Application)</SelectItem>
                          {businessEntities.map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Select the business entity applying for this grant
                      </p>
                    </div>
                  )}
                  
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Contact Name</Label>
                        <Input
                          id="contact-name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone">Phone</Label>
                        <Input
                          id="contact-phone"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Phone Number"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any initial notes about your application here"
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Application"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Grant Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Grant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Provider</h3>
                  <p>{grant.provider}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p>{grant.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Funding Type</h3>
                  <p>{grant.funding.funding_type}</p>
                </div>
                {grant.funding.max_amount && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Maximum Amount</h3>
                    <p>${grant.funding.max_amount.toLocaleString()}</p>
                  </div>
                )}
                {grant.eligibility && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Eligibility</h3>
                    <p className="text-sm">{grant.eligibility}</p>
                  </div>
                )}
                {grant.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-sm">{grant.description}</p>
                  </div>
                )}
                {grant.deadline && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Application Deadline</h3>
                    <p className="text-sm">{new Date(grant.deadline).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(grant.url, "_blank")}
                >
                  View Official Website
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
