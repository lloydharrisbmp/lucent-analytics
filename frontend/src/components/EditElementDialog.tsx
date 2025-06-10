import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
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
  } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Node, Edge } from '@xyflow/react';

interface Props {
  element: Node | Edge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updateIntent: any) => void;
  onDelete: (elementId: string) => void; // Add onDelete handler
}

function EditElementDialog({ element, isOpen, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState<number | string>('');

  useEffect(() => {
    if (element) {
      if ('data' in element && element.data?.label) {
        setName(element.data.label);
      } else {
        setName('');
      }

      if ('data' in element && element.data?.ownershipPercentage !== undefined) {
        setPercentage(element.data.ownershipPercentage);
      } else {
        setPercentage('');
      }
    } else {
        setName('');
        setPercentage('');
    }
  }, [element]);

  const handleSave = () => {
    let updateIntent: any = { id: element?.id };
    if (element && 'position' in element) {
        updateIntent.type = 'node';
        updateIntent.data = { name };
    } else if (element && 'source' in element) {
        updateIntent.type = 'edge';
        updateIntent.data = { percentage: parseFloat(percentage as string) || 0 };
        updateIntent.source = element.source;
        updateIntent.target = element.target;
    }
    onSave(updateIntent);
  };

  const handleDeleteConfirm = () => {
    if (element && 'position' in element) { // Only allow deleting nodes for now
        onDelete(element.id);
    }
    // No action if it's an edge
  };

  const isNode = element && 'position' in element;
  const isEdge = element && 'source' in element;

  // Disable delete for edges
  const canDelete = isNode;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {isNode ? 'Entity' : isEdge ? 'Relationship' : 'Element'}</DialogTitle>
          <DialogDescription>
            {isNode ? 'Update the details or delete this entity.' : isEdge ? 'Update the ownership percentage for this relationship.' : ''}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {isEdge && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="percentage" className="text-right">
                Ownership (%)
              </Label>
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="col-span-3"
                min="0"
                max="100"
              />
            </div>
          )}
          {!isNode && !isEdge && element && (
             <p>Selected element details (ID: {element.id})</p>
          )}
        </div>

        <DialogFooter className="justify-between sm:justify-between"> {/* Adjust footer layout */}
          <div> {/* Left side buttons */}
            {canDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Entity</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the entity
                            and remove any associated ownership links.
                            <br/>
                            Entity: <strong>{name}</strong> (ID: {element?.id})
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {/* AlertDialogAction will automatically close the AlertDialog on click */}
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Delete Entity
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            {!canDelete && isEdge && (
                 <Button variant="destructive" disabled title="Deleting relationships directly is not supported. Edit parent ownership.">
                     Delete Relationship (Disabled)
                 </Button>
            )}
          </div>

          <div> {/* Right side buttons */}
            <DialogClose asChild>
                 <Button variant="outline" className="mr-2">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditElementDialog;
