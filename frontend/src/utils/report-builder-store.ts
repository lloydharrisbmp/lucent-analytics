import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  components: ReportComponent[];
  isFavorite: boolean;
  category?: string;
}

export interface ReportComponent {
  id: string;
  componentId: string;
  name: string;
  type: string;
  options?: Record<string, any>;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  defaultOptions?: Record<string, any>;
}

interface ReportBuilderState {
  // Report templates
  templates: ReportTemplate[];
  activeReportId: string | null;
  
  // Available components
  availableComponents: ComponentDefinition[];
  
  // Current report being edited
  reportComponents: ReportComponent[];
  
  // Template management
  addTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<ReportTemplate>) => void;
  deleteTemplate: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setActiveReport: (id: string | null) => void;
  
  // Component management
  addComponent: (component: Omit<ReportComponent, 'id'>, position?: number) => void;
  removeComponent: (index: number) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  updateComponentOptions: (index: number, options: Record<string, any>) => void;
  
  // Draft saving
  saveCurrentAsTemplate: (name: string, description: string) => string;
  loadTemplate: (id: string) => void;
  clearCurrentReport: () => void;
  loadReportComponents: (components: ReportComponent[]) => void;
}

// Some sample report components
const DEFAULT_COMPONENTS: ComponentDefinition[] = [
  {
    id: 'header',
    name: 'Report Header',
    description: 'Title and description for your report',
    type: 'Layout',
    category: 'Structure'
  },
  {
    id: 'kpi-dashboard',
    name: 'KPI Dashboard',
    description: 'Grid of key performance indicators',
    type: 'Dashboard',
    category: 'Metrics'
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Visualize trends over time',
    type: 'Chart',
    category: 'Visualization'
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    type: 'Chart',
    category: 'Visualization'
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Show proportions of a whole',
    type: 'Chart',
    category: 'Visualization'
  },
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Tabular representation of data',
    type: 'Table',
    category: 'Data'
  },
  {
    id: 'text-block',
    name: 'Text Block',
    description: 'Add explanatory text to your report',
    type: 'Content',
    category: 'Text'
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'AI-generated summary of key insights',
    type: 'Content',
    category: 'AI'
  },
  {
    id: 'recommendation-block',
    name: 'Recommendations',
    description: 'AI-generated recommendations based on data',
    type: 'Content',
    category: 'AI'
  },
  {
    id: 'financial-metrics',
    name: 'Financial Metrics',
    description: 'Key financial metrics and ratios',
    type: 'Dashboard',
    category: 'Metrics'
  },
  {
    id: 'section-divider',
    name: 'Section Divider',
    description: 'Add a section break with optional title',
    type: 'Layout',
    category: 'Structure'
  },
  {
    id: 'comparison-table',
    name: 'Comparison Table',
    description: 'Compare multiple metrics side by side',
    type: 'Table',
    category: 'Data'
  },
];

// Sample templates
const SAMPLE_TEMPLATES: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Executive Dashboard',
    description: 'High-level overview for executives',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    components: [
      { id: 'comp-1', componentId: 'header', name: 'Report Header', type: 'Layout' },
      { id: 'comp-2', componentId: 'kpi-dashboard', name: 'KPI Dashboard', type: 'Dashboard' },
      { id: 'comp-3', componentId: 'line-chart', name: 'Revenue Trend', type: 'Chart' },
      { id: 'comp-4', componentId: 'executive-summary', name: 'Executive Summary', type: 'Content' },
    ],
    isFavorite: true,
    category: 'Dashboards'
  },
  {
    id: 'template-2',
    name: 'Financial Report',
    description: 'Detailed financial analysis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    components: [
      { id: 'comp-1', componentId: 'header', name: 'Report Header', type: 'Layout' },
      { id: 'comp-2', componentId: 'financial-metrics', name: 'Financial Metrics', type: 'Dashboard' },
      { id: 'comp-3', componentId: 'bar-chart', name: 'Revenue vs Expenses', type: 'Chart' },
      { id: 'comp-4', componentId: 'data-table', name: 'Financial Data', type: 'Table' },
    ],
    isFavorite: false,
    category: 'Financial'
  },
  {
    id: 'template-3',
    name: 'Strategic Plan',
    description: 'Future planning and recommendations',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    components: [
      { id: 'comp-1', componentId: 'header', name: 'Report Header', type: 'Layout' },
      { id: 'comp-2', componentId: 'text-block', name: 'Introduction', type: 'Content' },
      { id: 'comp-3', componentId: 'recommendation-block', name: 'Strategic Recommendations', type: 'Content' },
      { id: 'comp-4', componentId: 'pie-chart', name: 'Resource Allocation', type: 'Chart' },
    ],
    isFavorite: true,
    category: 'Strategy'
  }
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useReportBuilderStore = create<ReportBuilderState>()(
  devtools(
    (set, get) => ({
      templates: SAMPLE_TEMPLATES,
      activeReportId: null,
      availableComponents: DEFAULT_COMPONENTS,
      reportComponents: [],
      
      addTemplate: (template) => {
        const newTemplate: ReportTemplate = {
          ...template,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate]
        }));
        
        return newTemplate.id;
      },
      
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map(template => 
            template.id === id ? 
              { ...template, ...updates, updatedAt: new Date().toISOString() } : 
              template
          )
        }));
      },
      
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter(template => template.id !== id),
          activeReportId: state.activeReportId === id ? null : state.activeReportId
        }));
      },
      
      toggleFavorite: (id) => {
        set((state) => ({
          templates: state.templates.map(template => 
            template.id === id ? 
              { ...template, isFavorite: !template.isFavorite } : 
              template
          )
        }));
      },
      
      setActiveReport: (id) => {
        set({ activeReportId: id });
      },
      
      addComponent: (component, position) => {
        const newComponent = {
          ...component,
          id: generateId()
        };
        
        set((state) => {
          const newComponents = [...state.reportComponents];
          if (position !== undefined) {
            newComponents.splice(position, 0, newComponent);
          } else {
            newComponents.push(newComponent);
          }
          return { reportComponents: newComponents };
        });
      },
      
      removeComponent: (index) => {
        set((state) => {
          const newComponents = [...state.reportComponents];
          newComponents.splice(index, 1);
          return { reportComponents: newComponents };
        });
      },
      
      moveComponent: (fromIndex, toIndex) => {
        set((state) => {
          const newComponents = [...state.reportComponents];
          const [movedComponent] = newComponents.splice(fromIndex, 1);
          newComponents.splice(toIndex, 0, movedComponent);
          return { reportComponents: newComponents };
        });
      },
      
      updateComponentOptions: (index, options) => {
        set((state) => {
          const newComponents = [...state.reportComponents];
          newComponents[index] = {
            ...newComponents[index],
            options: { ...newComponents[index].options, ...options }
          };
          return { reportComponents: newComponents };
        });
      },
      
      saveCurrentAsTemplate: (name, description) => {
        const newTemplateId = generateId();
        const { reportComponents } = get();
        
        const newTemplate: ReportTemplate = {
          id: newTemplateId,
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          components: [...reportComponents],
          isFavorite: false
        };
        
        set((state) => ({
          templates: [...state.templates, newTemplate],
          activeReportId: newTemplateId
        }));
        
        return newTemplateId;
      },
      
      loadTemplate: (id) => {
        const template = get().templates.find(t => t.id === id);
        if (template) {
          set({
            reportComponents: [...template.components],
            activeReportId: id
          });
        }
      },
      
      clearCurrentReport: () => {
        set({
          reportComponents: [],
          activeReportId: null
        });
      },
      
      loadReportComponents: (components) => {
        // Directly set the report components, typically from a fetched definition
        set({ reportComponents: [...components] }); 
      }
    }),
    { name: 'report-builder-store' }
  )
);