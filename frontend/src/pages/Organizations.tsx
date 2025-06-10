import { useEffect, useState } from 'react';
import { firebaseApp } from 'app';
import { collection, doc, setDoc, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, getFirestore } from 'firebase/firestore';
import { useOrganizationStore } from "utils/organization-store";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useUserGuardContext } from 'app';
import { useOrg } from 'components/OrgProvider';
import DashboardLayout from 'components/DashboardLayout';
import { toast } from 'sonner';
import { Plus, Trash } from 'lucide-react';

export default function Organizations() {
  const [open, setOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgAbn, setNewOrgAbn] = useState('');
  const { user } = useUserGuardContext();
  const { organizations, setCurrentOrganization, currentOrgId } = useOrg();

  const handleSelectOrganization = (orgId: string) => {
    setCurrentOrganization(orgId);
    // Optional: Navigate to dashboard or another page after selection
    // navigate('/dashboard'); 
    toast.info(`Switched to organization: ${organizations.find(o => o.id === orgId)?.name || 'Selected Org'}`);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    try {
      // Create new organization document
      const docRef = await addDoc(collection(getFirestore(firebaseApp), 'organizations'), {
        name: newOrgName,
        abn: newOrgAbn,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Update the document with its ID
      await setDoc(doc(getFirestore(firebaseApp), 'organizations', docRef.id), {
        id: docRef.id,
        name: newOrgName,
        abn: newOrgAbn,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Clear form and close dialog
      setNewOrgName('');
      setNewOrgAbn('');
      setOpen(false);
      
      // Switch to the new organization
      setCurrentOrganization(docRef.id);
      
      toast.success('Organization created successfully');
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(getFirestore(firebaseApp), 'organizations', orgId));
      toast.success('Organization deleted successfully');
      
      // If the deleted org was the current one, clear the current selection
      if (currentOrgId === orgId) {
        setCurrentOrganization(null);
      }
      
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <p className="text-muted-foreground mt-1">Manage your organizations and clients</p>
      </div>

      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization or client to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="abn">ABN (optional)</Label>
                <Input
                  id="abn"
                  value={newOrgAbn}
                  onChange={(e) => setNewOrgAbn(e.target.value)}
                  placeholder="12 345 678 901"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateOrganization}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {organizations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ABN</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow 
                    key={org.id}
                    onClick={() => handleSelectOrganization(org.id)}
                    className={`cursor-pointer ${currentOrgId === org.id ? 'bg-muted/50 hover:bg-muted/60' : 'hover:bg-muted/30'}`}
                  >
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.abn || '—'}</TableCell>
                    <TableCell>
                      {org.createdAt?.toDate ? 
                        org.createdAt.toDate().toLocaleDateString() : 
                        'Recently'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteOrganization(org.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Organizations</CardTitle>
            <CardDescription>
              You haven't created any organizations yet. 
              Get started by creating your first organization.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Organization
            </Button>
          </CardFooter>
        </Card>
      )}
    </DashboardLayout>
  );
}