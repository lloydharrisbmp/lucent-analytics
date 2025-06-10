import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReportComponentType } from 'utils/report-builder-store';

interface DraggableItemProps {
  id: string;
  name: string;
  type: ReportComponentType;
  icon?: React.ReactNode;
  description?: string;
}

export function DraggableItem({ id, name, type, icon, description }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type,
      name,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  } : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            ref={setNodeRef} 
            style={style} 
            className="p-3 cursor-move hover:bg-accent transition-colors mb-2 relative group"
            {...listeners} 
            {...attributes}
          >
            <div className="flex items-center text-sm">
              {icon && <span className="mr-2">{icon}</span>}
              <span>{name}</span>
            </div>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm">
              <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                Drag to add
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="right" className="max-w-xs">
            <p>{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
