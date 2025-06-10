import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { ReportComponent } from 'utils/report-builder-store';

interface DroppableCanvasProps {
  id: string;
  items: ReportComponent[];
  children: React.ReactNode;
  isEmpty?: boolean;
}

export function DroppableCanvas({ id, items, children, isEmpty = false }: DroppableCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-6 min-h-[600px] ${isOver 
        ? 'border-primary/60 bg-primary/5' 
        : isEmpty 
          ? 'bg-muted/20 border-muted-foreground/30' 
          : 'bg-muted/10 border-muted-foreground/20'
      } transition-colors relative`}
    >
      {isOver && (
        <div className="absolute inset-0 bg-grid-primary/5 pointer-events-none" />
      )}
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
