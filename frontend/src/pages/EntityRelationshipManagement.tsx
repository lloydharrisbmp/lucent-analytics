import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, // Optional: Add description if needed
  } from "@/components/ui/dialog"; // Import Dialog components
import { Button } from "@/components/ui/button";
import { BuildingIcon, Loader2, AlertCircle, PlusCircle } from "lucide-react";
import {
  ReactFlow, // Correct: Import as named export
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Position,
  MarkerType,
} from "@xyflow/react";
import brain from "brain";
import { BusinessEntityBase, OwnershipDetail, BusinessEntityCreateRequest } from "types";
import { toast } from "sonner";
import EditElementDialog from "components/EditElementDialog";
import EntityForm from "components/EntityForm"; // Import the adapted form

// Import React Flow styles
import "@xyflow/react/dist/style.css";

// Helper function (keep existing transformDataForFlow)
const transformDataForFlow = (
  entities: BusinessEntityBase[],
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!entities || entities.length === 0) {
    return { nodes, edges };
  }

  const levelMap: { [key: string]: number } = {};
  const positionMap: { [key: string]: { x: number; y: number } } = {};
  const nodesAtLevel: { [key: number]: number } = {};
  const visited = new Set<string>();

  function getNodeLevel(entityId: string): number {
    if (visited.has(entityId)) return Infinity; // Cycle detected
    if (levelMap[entityId] !== undefined) return levelMap[entityId];

    visited.add(entityId);
    const entity = entities.find((e) => e.id === entityId);
    let level = 0;
    if (entity?.parent_entity_id) {
        // Check if parent exists in the list to avoid errors
        const parentExists = entities.some(e => e.id === entity.parent_entity_id);
        if (parentExists) {
            const parentLevel = getNodeLevel(entity.parent_entity_id);
            if (parentLevel !== Infinity) {
                level = parentLevel + 1;
            }
        } else {
            console.warn(`Parent entity ${entity.parent_entity_id} for ${entity.id} not found.`);
            // Assign level 0 if parent is missing? Or handle differently?
            // For now, keep level 0 as default if parent missing/cycle.
        }
    }
    visited.delete(entityId);

    levelMap[entityId] = level;
    return level;
  }

  entities.forEach((entity) => {
    const level = getNodeLevel(entity.id);
    if (level === Infinity) {
        console.warn(`Cycle detected involving entity ${entity.id}, skipping layout.`);
        return;
    }
    const countAtLevel = nodesAtLevel[level] || 0;
    positionMap[entity.id] = {
      x: countAtLevel * 250 + (level % 2) * 50,
      y: level * 150,
    };
    nodesAtLevel[level] = countAtLevel + 1;
  });

  entities.forEach((entity) => {
     if (!positionMap[entity.id]) return;

    nodes.push({
      id: entity.id,
      type: "default",
      position: positionMap[entity.id],
      data: { label: entity.name },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    if (entity.ownership_details) {
      entity.ownership_details.forEach((ownership) => {
        const ownedEntityExists = entities.some(e => e.id === ownership.owned_entity_id);
        if (!ownedEntityExists || !positionMap[entity.id] || !positionMap[ownership.owned_entity_id]) {
            console.warn(`Skipping edge from ${entity.id} to ${ownership.owned_entity_id} due to missing entity or cycle.`);
            return;
        }
        edges.push({
          id: `e-${entity.id}-${ownership.owned_entity_id}`,
          source: entity.id,
          target: ownership.owned_entity_id,
          label: `${ownership.percentage}%`,
          markerEnd: { type: MarkerType.ArrowClosed },
          data: {
            ownershipPercentage: ownership.percentage,
            parentEntityId: entity.id,
            childEntityId: ownership.owned_entity_id,
          },
        });
      });
    }
  });

  return { nodes, edges };
};

function EntityRelationshipManagement() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [allEntities, setAllEntities] = useState<BusinessEntityBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Loading state for creation

  const fetchData = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      const loadingToast = toast.loading("Loading entity structure...");
      try {
        const response = await brain.list_business_entities();
        const result = await response.json();
        if (!result || !Array.isArray(result.entities)) {
          throw new Error("Invalid data format received.");
        }
        const entities: BusinessEntityBase[] = result.entities;
        setAllEntities(entities);
        const { nodes: transformedNodes, edges: transformedEdges } = transformDataForFlow(entities);
        setNodes(transformedNodes);
        setEdges(transformedEdges);
        toast.success("Entity structure loaded", { id: loadingToast });
      } catch (err: any) {
        const errorMessage = err.message || "Unknown error fetching data.";
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`, { id: loadingToast });
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedElement(node);
    setIsEditDialogOpen(true);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedElement(edge);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedElement(null);
    setError(null);
  };

  const handleSaveDialog = async (updateIntent: any) => {
    if (!updateIntent?.id) return;
    const savingToastId = toast.loading("Saving changes...");
    setError(null);
    try {
      if (updateIntent.type === 'node') {
        const nodeId = updateIntent.id;
        const newName = updateIntent.data.name;
        const currentEntity = allEntities.find(e => e.id === nodeId);
        if (!currentEntity) throw new Error("Original entity not found for update.");
        const requestBody: BusinessEntityCreateRequest = {
            name: newName,
            abn: currentEntity.abn || "",
            business_structure: currentEntity.business_structure,
            registered_for_gst: currentEntity.registered_for_gst || false,
            gst_frequency: currentEntity.gst_frequency,
            tfn: currentEntity.tfn,
            parent_entity_id: currentEntity.parent_entity_id,
            ownership_details: currentEntity.ownership_details,
        };
        await brain.update_business_entity({ entity_id: nodeId }, requestBody);
        setAllEntities(prevEntities =>
          prevEntities.map(e => e.id === nodeId ? { ...currentEntity, name: newName } : e)
        );
        setNodes((nds) =>
          nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: newName } } : n)
        );
        toast.success("Entity name updated!", { id: savingToastId });
      } else if (updateIntent.type === 'edge') {
        const parentId = updateIntent.source;
        const childId = updateIntent.target;
        const newPercentage = updateIntent.data.percentage;
        if (!parentId || !childId) throw new Error("Edge update missing source or target ID.");
        const parentEntity = allEntities.find(e => e.id === parentId);
        if (!parentEntity) throw new Error("Parent entity not found for ownership update.");
        let detailFound = false;
        const updatedOwnershipDetails = (parentEntity.ownership_details || []).map(od => {
          if (od.owned_entity_id === childId) {
            detailFound = true;
            return { ...od, percentage: newPercentage };
          }
          return od;
        });
        if (!detailFound) {
             console.warn(`Ownership detail for child ${childId} not found on parent ${parentId}. Adding.`);
             updatedOwnershipDetails.push({ owned_entity_id: childId, percentage: newPercentage });
        }
        const requestBody: BusinessEntityCreateRequest = {
            ...parentEntity,
            ownership_details: updatedOwnershipDetails,
            abn: parentEntity.abn || "",
            business_structure: parentEntity.business_structure,
            registered_for_gst: parentEntity.registered_for_gst || false,
            gst_frequency: parentEntity.gst_frequency,
            tfn: parentEntity.tfn,
            parent_entity_id: parentEntity.parent_entity_id,
        };
        await brain.update_business_entity({ entity_id: parentId }, requestBody);
        setAllEntities(prevEntities =>
          prevEntities.map(e => e.id === parentId ? { ...parentEntity, ownership_details: updatedOwnershipDetails } : e)
        );
        setEdges((eds) =>
          eds.map((e) => e.source === parentId && e.target === childId ? {
                  ...e,
                  label: `${newPercentage}%`,
                  data: { ...e.data, ownershipPercentage: newPercentage }
                } : e)
        );
        toast.success("Ownership percentage updated!", { id: savingToastId });
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error("Save failed:", err);
      const errorMessage = err.message || "An unknown error occurred saving changes.";
      setError(errorMessage); // Show error in the dialog or a general area?
      toast.error(`Save failed: ${errorMessage}`, { id: savingToastId });
    }
  };

  // --- Delete Logic --- 
  const handleDeleteNode = async (nodeId: string) => {
    const deletingToastId = toast.loading(`Deleting entity ${nodeId}...`);
    setError(null);
    try {
        await brain.delete_business_entity({ entity_id: nodeId });

        // Update local state
        setAllEntities(prev => prev.filter(e => e.id !== nodeId));
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));

        toast.success(`Entity ${nodeId} deleted successfully!`, { id: deletingToastId });
        handleCloseDialog(); // Close the dialog after successful deletion
    } catch (err: any) {
        console.error("Delete failed:", err);
        const errorMessage = err.message || "An unknown error occurred deleting the entity.";
        // Option 1: Show error in dialog (if you add an error state there)
        // setError(errorMessage); 
        // Option 2: Show error via toast (current implementation)
        toast.error(`Deletion failed: ${errorMessage}`, { id: deletingToastId });
        // Decide whether to close the dialog on error or keep it open
        // handleCloseDialog(); // Uncomment to close even on error
    }
  };
  // --- End Delete Logic ---

  // --- Create Logic Stubs ---
    const handleOpenCreateDialog = () => {
        setIsCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        setIsCreateDialogOpen(false);
    };

    const handleCreateEntity = async (formData: BusinessEntityCreateRequest) => {
        setIsCreating(true); // Set loading state
        const creatingToastId = toast.loading("Creating new entity...");
        setError(null); // Clear previous errors

        try {
            // Ensure ownership_details is an empty array if not provided, as API might expect it
            const payload = {
                ...formData,
                ownership_details: formData.ownership_details || []
            };

            // Call the create API endpoint
            await brain.create_entity(payload);

            toast.success("Entity created successfully!", { id: creatingToastId });
            handleCloseCreateDialog(); // Close the dialog
            fetchData(); // Refetch data to update the graph

        } catch (err: any) {
            console.error("Create failed:", err);
            const errorMessage = err.message || "An unknown error occurred creating the entity.";
            setError(errorMessage); // Optionally display error message near form
            toast.error(`Creation failed: ${errorMessage}`, { id: creatingToastId });
            // Keep dialog open on error for user to correct

        } finally {
            setIsCreating(false); // Reset loading state
        }
    };
  // --- End Create Logic Stubs ---

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="h-[80vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Adjust header layout */}
          <CardTitle className="flex items-center gap-2 text-lg font-medium"> {/* Adjust title size */}
            <BuildingIcon className="h-5 w-5" /> {/* Adjust icon size */}
            Entity Relationship Management
          </CardTitle>
          <Button onClick={handleOpenCreateDialog} size="sm"> {/* Add Button */}
             <PlusCircle className="mr-2 h-4 w-4" /> Create New Entity
          </Button>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)] p-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading entity data...</p>
            </div>
          )}
          {error && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full p-4">
               <AlertCircle className="h-10 w-10 text-destructive mb-2" />
               <p className="text-destructive font-semibold">Error</p>
               <p className="text-sm text-muted-foreground text-center">{error}</p>
               <Button onClick={fetchData} variant="outline" className="mt-4">Retry</Button>
             </div>
          )}
          {!isLoading && !error && (
            <div style={{ height: "100%", width: "100%" }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                fitView
                className="bg-background"
              >
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render the Edit Dialog, passing the delete handler */}
      <EditElementDialog
        element={selectedElement}
        isOpen={isEditDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveDialog}
        onDelete={handleDeleteNode}
      />

      {/* --- Create Entity Dialog --- */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && handleCloseCreateDialog()}>
          <DialogContent className="sm:max-w-[600px]"> {/* Adjust width if needed */}
              <DialogHeader>
                  <DialogTitle>Create New Business Entity</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new entity. Select a parent if applicable.
                  </DialogDescription>
              </DialogHeader>
              <EntityForm
                  onSubmit={handleCreateEntity}
                  onCancel={handleCloseCreateDialog}
                  potentialParents={allEntities} // Pass existing entities as potential parents
                  isLoading={isCreating} // Pass loading state
                  // initialData={null} // Explicitly null for create mode
              />
              {/* Footer is handled within EntityForm */}
          </DialogContent>
      </Dialog>
    </div>
  );
}

export default EntityRelationshipManagement;
