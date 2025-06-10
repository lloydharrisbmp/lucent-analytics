import React, { useState, useCallback, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "../styles/react-resizable.css";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon } from "lucide-react"; // Import PencilIcon for edit
import { WidgetSettingsModal } from "components/WidgetSettingsModal";
import { DashboardWidgetWrapper } from "components/DashboardWidgetWrapper";
import { WidgetConfig, WidgetConfiguration } from "types"; // Assuming these are updated or correct
import { toast } from "sonner";
import brain from "brain"; // Assuming brain client is used for saving/loading dashboards eventually

// Provide ResponsiveGridLayout with WidthProvider HOC
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define sample metrics for the multi-select box
const availableMetrics = [
  { value: "revenue", label: "Total Revenue" },
  { value: "cogs", label: "Cost of Goods Sold" },
  { value: "gross_profit", label: "Gross Profit" },
  { value: "operating_expenses", label: "Operating Expenses" },
  { value: "net_income", label: "Net Income" },
  { value: "ebitda", label: "EBITDA" },
  { value: "operating_cash_flow", label: "Operating Cash Flow" },
];

// Placeholder function for loading dashboard layout
// In a real app, this would fetch from an API or local storage
async function loadDashboardLayout(dashboardId: string): Promise<WidgetConfiguration[]> {
  console.log(`Placeholder: Loading layout for dashboard ${dashboardId}`);
  // Example initial layout
  return [
    { id: 'widget-1', x: 0, y: 0, w: 4, h: 2, title: "Monthly Revenue", type: 'LineChart', config: { chartType: 'line', primaryMetrics: ['revenue'], title: "Monthly Revenue" } },
    { id: 'widget-2', x: 4, y: 0, w: 4, h: 2, title: "Profit Margin", type: 'KPICard', config: { chartType: 'kpi', primaryMetrics: ['gross_profit', 'net_income'], title: "Profit Margin"} },
    { id: 'widget-3', x: 8, y: 0, w: 4, h: 2, title: "Expenses Breakdown", type: 'PieChart', config: { chartType: 'pie', primaryMetrics: ['cogs', 'operating_expenses'], title: "Expenses Breakdown" } },
  ];
}

// Placeholder function for saving dashboard layout
async function saveDashboardLayout(dashboardId: string, widgets: WidgetConfiguration[]) {
  console.log(`Placeholder: Saving layout for dashboard ${dashboardId}`, widgets);
  // In a real app, send this to the backend API
  // await brain.update_dashboard(...)
  toast.info("Dashboard layout saved (placeholder).");
}


const Dashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [widgets, setWidgets] = useState<WidgetConfiguration[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // State to track the widget being edited, null if adding new
  const [editingWidget, setEditingWidget] = useState<WidgetConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading dashboard layout
  useEffect(() => {
    const dashboardId = "default-dashboard"; // Example ID
    loadDashboardLayout(dashboardId)
      .then(initialWidgets => {
        setWidgets(initialWidgets);
        // Initialize layout from loaded widgets
        const initialLayout = initialWidgets.map(w => ({
          i: w.id, x: w.x, y: w.y, w: w.w, h: w.h,
        }));
        setLayouts({ lg: initialLayout }); // Assuming 'lg' breakpoint initially
      })
      .catch(err => {
        console.error("Failed to load dashboard layout:", err);
        toast.error("Failed to load dashboard layout.");
      })
      .finally(() => {
        setIsLoading(false);
        setIsMounted(true); // Mount grid layout only after loading state/initial layout
      });
  }, []);


  const onLayoutChange = useCallback((layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    // Only save if layouts actually change and component is mounted
    if (isMounted && !isLoading) {
        setLayouts(allLayouts);
        // Update widget positions based on layout change
        const updatedWidgets = widgets.map(widget => {
            const layoutItem = layout.find(l => l.i === widget.id);
            if (layoutItem) {
                return { ...widget, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
            }
            return widget;
        });
        setWidgets(updatedWidgets);
        // Consider debouncing save operations in a real app
        saveDashboardLayout("default-dashboard", updatedWidgets);
    }
  }, [widgets, isMounted, isLoading]);


  const handleAddWidgetClick = () => {
    setEditingWidget(null); // Ensure we are in "add" mode
    setIsSettingsModalOpen(true);
  };

  // Function to open the modal for editing a specific widget
  const handleEditWidgetClick = (widget: WidgetConfiguration) => {
    setEditingWidget(widget);
    setIsSettingsModalOpen(true);
  };

  const handleSaveWidgetSettings = useCallback((configUpdate: Partial<WidgetConfig>) => {
    if (editingWidget) {
      // --- Update existing widget ---
      setWidgets(prevWidgets =>
        prevWidgets.map(w =>
          w.id === editingWidget.id
            ? {
                ...w,
                title: configUpdate.title || w.title, // Update top-level title too?
                // Determine widget 'type' based on chartType? Needs clear mapping.
                type: configUpdate.chartType ? `${configUpdate.chartType.charAt(0).toUpperCase() + configUpdate.chartType.slice(1)}Chart` : w.type, // Basic example mapping
                config: {
                  ...(w.config || {}), // Keep existing config fields
                  ...configUpdate,    // Merge updates
                },
              }
            : w
        )
      );
      toast.success(`Widget "${configUpdate.title || editingWidget.title}" updated.`);
    } else {
      // --- Add new widget ---
      const newWidgetId = `widget-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      // Find the lowest available Y position for the new widget
      const maxY = widgets.reduce((max, w) => Math.max(max, w.y + w.h), 0);

      const newWidget: WidgetConfiguration = {
        id: newWidgetId,
        x: 0, // Default position, layout will adjust
        y: maxY, // Place below existing widgets
        w: 4, // Default size
        h: 2,
        title: configUpdate.title || "New Widget",
        // Determine widget 'type' based on chartType? Needs clear mapping.
        type: configUpdate.chartType ? `${configUpdate.chartType.charAt(0).toUpperCase() + configUpdate.chartType.slice(1)}Chart` : 'GenericChart', // Basic example mapping
        config: {
          ...configUpdate, // Use the config from the modal
          title: configUpdate.title || "New Widget", // Ensure title is in config too
        },
      };
      setWidgets(prevWidgets => [...prevWidgets, newWidget]);
      toast.success(`Widget "${newWidget.title}" added.`);
    }
    // Reset editing state and close modal happens in onClose handler passed to modal
  }, [editingWidget, widgets]); // Include widgets in dependency array


  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets(prevWidgets => prevWidgets.filter(w => w.id !== widgetId));
    toast.info(`Widget removed.`);
    // TODO: Trigger saveDashboardLayout after removal if needed
  }, []);

  const handleCloseModal = () => {
      setIsSettingsModalOpen(false);
      setEditingWidget(null); // Clear editing state when modal closes
  }

  if (isLoading) {
    return <div className="p-4">Loading Dashboard...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Dashboard</h1>
        <div className="flex gap-2">
            <Button onClick={handleAddWidgetClick} size="sm">
                <PlusIcon className="h-4 w-4 mr-1" /> Add Widget
            </Button>
             {/* Add save button if auto-save on layout change is not desired */}
             {/* <Button onClick={() => saveDashboardLayout("default-dashboard", widgets)} size="sm" variant="outline">Save Layout</Button> */}
        </div>
      </div>

        {isMounted && ( // Only render grid layout when mounted and layout is ready
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100} // Adjust row height as needed
                draggableHandle=".drag-handle" // Specify drag handle class
                onLayoutChange={onLayoutChange}
            >
                {widgets.map((widget) => (
                    <div key={widget.id} className="bg-card border rounded-lg shadow overflow-hidden">
                        {/* Wrap widget content for styling and potentially the drag handle */}
                        <DashboardWidgetWrapper
                            title={widget.config?.title || widget.title || "Widget"}
                            onRemove={() => handleRemoveWidget(widget.id)}
                        >
                           {/* Edit Button Added Here */}
                           <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-10 h-6 w-6 text-muted-foreground hover:text-foreground z-10" // Position near remove
                              onClick={() => handleEditWidgetClick(widget)}
                              title="Edit Widget"
                           >
                               <PencilIcon className="h-4 w-4" />
                           </Button>
                            {/* Placeholder for actual widget content based on widget.type */}
                            <div className="p-4 h-full flex items-center justify-center text-muted-foreground">
                                Widget Type: {widget.type} ({widget.config?.chartType || 'N/A'})
                                <br />
                                Metrics: {widget.config?.primaryMetrics?.join(', ') || 'None'}
                            </div>
                        </DashboardWidgetWrapper>
                    </div>
                ))}
            </ResponsiveGridLayout>
        )}


      {/* Settings Modal */}
      <WidgetSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveWidgetSettings}
        initialConfig={editingWidget?.config || {}} // Pass config of widget being edited, or empty object for new
        availableMetrics={availableMetrics} // Pass static metrics
      />
    </div>
  );
};

export default Dashboard;