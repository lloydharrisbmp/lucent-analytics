  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Grip, X, Settings, Copy, ArrowUp, ArrowDown, Edit, Trash2 } from 'lucide-react';
import { ReportComponent } from 'utils/report-builder-store';

interface SortableComponentProps {
  component: ReportComponent;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

export function SortableComponent({ 
  component, 
  onRemove, 
  onEdit,
  onDuplicate,
  onMoveUp,
  onMoveDown
}: SortableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-4 relative cursor-default"
    >
      <div className="absolute top-3 left-3 cursor-move text-muted-foreground hover:text-foreground transition-colors" {...attributes} {...listeners}>
        <Grip className="h-5 w-5" />
      </div>
      
      <CardHeader className="pb-2 pl-12">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{component.name}</CardTitle>
          <div className="flex space-x-1">
            <DropdownMenu open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => {
                    onEdit(component.id);
                    setIsEditMenuOpen(false);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Component
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => {
                    onDuplicate(component.id);
                    setIsEditMenuOpen(false);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onMoveUp && (
                  <DropdownMenuItem onClick={() => {
                    onMoveUp(component.id);
                    setIsEditMenuOpen(false);
                  }}>
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Move Up
                  </DropdownMenuItem>
                )}
                {onMoveDown && (
                  <DropdownMenuItem onClick={() => {
                    onMoveDown(component.id);
                    setIsEditMenuOpen(false);
                  }}>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Move Down
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {
                  onRemove(component.id);
                  setIsEditMenuOpen(false);
                }} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemove(component.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Render appropriate component based on type */}
        <div className="p-4 border rounded bg-muted/30">
          {getRenderPreview(component.type)}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to render a preview based on component type
function getRenderPreview(type: string) {
  switch (type) {
    case 'financialHighlights':
      return (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-primary/10 h-16 rounded flex items-center justify-center">
              <div className="w-10 h-2 bg-primary/30 rounded"></div>
            </div>
          ))}
        </div>
      );
    case 'keyInsights':
      return (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex">
              <div className="w-4 h-4 rounded-full bg-primary/20 mt-1 mr-2"></div>
              <div className="flex-1">
                <div className="w-1/3 h-2 bg-primary/30 rounded mb-1"></div>
                <div className="w-full h-2 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'performanceTrend':
      return (
        <div className="h-40 flex items-end space-x-1 px-4">
          {[30, 45, 25, 60, 40, 80, 70].map((h, i) => (
            <div 
              key={i} 
              className="flex-1 bg-primary/20 rounded-t" 
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      );
    case 'financialStatements':
      return (
        <div className="space-y-2">
          <div className="w-full h-2 bg-muted rounded"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between">
              <div className="w-1/3 h-2 bg-muted rounded"></div>
              <div className="w-1/4 h-2 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      );
    case 'metricGroup':
      return (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted p-2 rounded">
              <div className="w-1/2 h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-1/3 h-3 bg-primary/30 rounded"></div>
            </div>
          ))}
        </div>
      );
    case 'cashFlow':
      return (
        <div className="space-y-2">
          <div className="h-20 bg-muted/50 rounded flex items-center justify-center">
            <div className="w-3/4 h-px bg-primary/20 relative">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className="absolute w-4 h-4 rounded-full bg-primary/20" 
                  style={{ 
                    left: `${i * 20}%`, 
                    top: i % 2 === 0 ? '-8px' : '4px' 
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4 h-2 bg-muted rounded"></div>
            <div className="w-1/4 h-2 bg-muted rounded"></div>
          </div>
        </div>
      );
    case 'revenueAnalysis':
      return (
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="h-32 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <div className="w-1/3 h-2 bg-muted rounded"></div>
                <div className="w-1/5 h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div className="text-muted-foreground text-center">Component Preview</div>;
  }
}
