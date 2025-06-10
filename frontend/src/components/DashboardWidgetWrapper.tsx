import React from 'react';
import { Button } from '@/components/ui/button';
import { X as XIcon, GripVertical, LineChart, BarChart, PieChart, List } from 'lucide-react'; // Changed XIcon to X and added more icons
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Use Card for structure
import { Layout } from 'react-grid-layout';
import { WidgetConfig } from 'types'; // Assuming WidgetConfig is defined here or globally

interface Props {
  widget: Layout & { title?: string; type?: string, config?: WidgetConfig }; // Combine Layout with potential custom props
  onRemove: (widgetId: string) => void;
  children?: React.ReactNode; // Changed to optional
}

// Helper to render a placeholder based on type
const renderPlaceholder = (type?: string) => {
  switch (type) {
    case 'LineChart':
      return <LineChart className="h-16 w-16 text-muted-foreground opacity-30" strokeWidth={1} />;
    case 'KPICard':
      return <List className="h-16 w-16 text-muted-foreground opacity-30" strokeWidth={1} />;
    case 'PieChart':
      return <PieChart className="h-16 w-16 text-muted-foreground opacity-30" strokeWidth={1} />;
    case 'BarChart':
       return <BarChart className="h-16 w-16 text-muted-foreground opacity-30" strokeWidth={1} />;
    // Add more cases for other widget types
    default:
      return <div className="text-sm text-muted-foreground">Type: {type || 'Unknown'}</div>;
  }
};

export const DashboardWidgetWrapper: React.FC<Props> = ({ widget, onRemove, children }) => {
  const { i: id, title, type } = widget;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag/select actions
    onRemove(id);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden group">
      {/* Header with title, drag handle, and remove button */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/50 px-4 py-2 relative">
        {/* Drag Handle Area - subtle indicator */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-move text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity dragHandle">
            <GripVertical className="h-4 w-4" />
        </div>
        <CardTitle className="text-sm font-medium pl-4 truncate"> {/* Added padding for handle and kept truncate */}
            {title || `Widget ${id}`}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive z-10" // Kept z-10 to ensure button is clickable
          onClick={handleRemoveClick}
          aria-label={`Remove ${title || `Widget ${id}`}`}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      {/* Content area where the actual widget + edit button are rendered */}
      <CardContent className="p-4 flex-grow flex items-center justify-center relative"> {/* Added flex positioning, kept relative */}
        {/* Render actual widget content passed as children OR a placeholder */}
        {children || (
           <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                {renderPlaceholder(type)}
                <p className="text-xs mt-2">{title}</p>
           </div>
        )}
      </CardContent>
    </Card>
  );
};
