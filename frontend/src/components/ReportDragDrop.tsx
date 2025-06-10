import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { PlusCircle, X } from "lucide-react";

interface ComponentListProps {
  components: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  onDragStart: (component: any) => void;
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onDragStart
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Components</CardTitle>
        <CardDescription>
          Drag and drop components to build your report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {components.map((component) => (
            <div
              key={component.id}
              className="flex items-center justify-between p-2 bg-background border rounded-md cursor-move hover:bg-accent/20 transition-colors"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(component));
                onDragStart(component);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <DragHandleDots2Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-medium text-sm">{component.name}</div>
                  <div className="text-xs text-muted-foreground">{component.description}</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-muted rounded-full">{component.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface ReportWorkspaceProps {
  reportLayout: Array<{
    id: string;
    componentId: string;
    name: string;
    type: string;
  }>;
  onDrop: (data: any, position: number) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

const ReportWorkspace: React.FC<ReportWorkspaceProps> = ({
  reportLayout,
  onDrop,
  onRemove,
  onMove
}) => {
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      onDrop(JSON.parse(data), index);
    }
    setDragOverIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/moveComponent', index.toString());
  };

  const handleComponentDrop = (e: React.DragEvent, dropIndex: number) => {
    const moveData = e.dataTransfer.getData('application/moveComponent');
    if (moveData) {
      const fromIndex = parseInt(moveData);
      onMove(fromIndex, dropIndex);
    } else {
      handleDrop(e, dropIndex);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Report Layout</CardTitle>
            <CardDescription>
              Arrange components to build your report
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reportLayout.length === 0 ? (
          <div
            className="h-48 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 0)}
          >
            <p className="text-center">
              Drag and drop components here<br />
              <span className="text-xs">or use the Add Section button to add a new section</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reportLayout.map((item, index) => (
              <React.Fragment key={item.id}>
                {index === 0 && dragOverIndex === 0 && (
                  <div className="h-1 bg-primary rounded-full my-2" />
                )}
                <div
                  className={`flex items-center justify-between p-3 bg-background border ${dragOverIndex === index ? 'border-primary' : 'border-border'} rounded-md cursor-move transition-all duration-200`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleComponentDrop(e, index)}
                  onDragLeave={() => setDragOverIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      <DragHandleDots2Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                    onClick={() => onRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {dragOverIndex === index + 1 && (
                  <div className="h-1 bg-primary rounded-full my-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ComponentList, ReportWorkspace };