import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Button } from "@/components/ui/button";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessEntityBase, OwnershipDetail } from 'types'; // Assuming these are in types

interface Props {
  element: Node | Edge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>; // We'll refine the type later
}

const EditEntityDialog: React.FC<Props> = ({ element, isOpen, onClose, onSave }) => {
  const [entityName, setEntityName] = useState('');
  const [ownershipPercentage, setOwnershipPercentage] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNode = element && 'position' in element; // Simple check if it's a Node
  const isEdge = element && 'source' in element; // Simple check if it's an Edge

  useEffect(() => {
    if (element) {
      if (isNode) {
        setEntityName(element.data?.label || ''); // Assuming label holds the name
        setOwnershipPercentage(''); // Reset percentage if switching from edge
      } else if (isEdge) {
        setOwnershipPercentage(element.data?.ownershipPercentage ?? ''); // Use data from edge
        setEntityName(''); // Reset name if switching from node
      }
    } else {
      // Reset fields when dialog closes or element is null
      setEntityName('');
      setOwnershipPercentage('');
    }
  }, [element, isOpen, isNode, isEdge]);

  const handleSaveClick = async () => {
    if (!element) return;

    setIsLoading(true);
    setError(null);
    try {
      let updateIntent = {};
      if (isNode) {
        // For nodes, pass back the node ID and the new name
        updateIntent = {
          type: 'node',
          id: element.id,
          data: { name: entityName }
        };
      } else if (isEdge) {
        // For edges, parse percentage and pass back edge ID, source/target IDs, and percentage
        const percentage = parseFloat(ownershipPercentage as string);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          throw new Error("Invalid percentage. Must be between 0 and 100.");
        }
        updateIntent = {
          type: 'edge',
          id: element.id,
          source: element.source,
          target: element.target,
          data: { percentage: percentage }
        };
      }

      // The onSave function (defined in the parent) now receives this structured intent
      await onSave(updateIntent);
      onClose(); // Close dialog on successful processing by parent
    } catch (err: any) {
      console.error("Save preparation failed:", err);
      setError(err.message || "Failed to prepare save data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {isNode ? 'Entity' : 'Relationship'}</DialogTitle>
          <DialogDescription>
            Make changes to the selected {isNode ? 'entity name' : 'ownership percentage'}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isNode && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                value={entityName} 
                onChange={(e) => setEntityName(e.target.value)} 
                className="col-span-3" 
              />
            </div>
          )}
          {isEdge && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="percentage" className="text-right">
                Ownership %
              </Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={ownershipPercentage}
                onChange={(e) => setOwnershipPercentage(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500 col-span-4 text-center">{error}</p>}
        </div>
        <DialogFooter>
            <DialogClose asChild>
                 <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            </DialogClose>
          <Button type="button" onClick={handleSaveClick} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntityDialog;
