import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import TemplateCard from "./TemplateCard";
import { ReportTemplate } from "utils/report-builder-store";

interface TemplatesSectionProps {
  templates: ReportTemplate[];
  activeReportId: string | null;
  loadTemplate: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleDeleteTemplate: (id: string) => void;
  // Optional external state management
  activeTemplateFilter?: 'all' | 'favorites';
  setActiveTemplateFilter?: (filter: 'all' | 'favorites') => void;
  sortBy?: 'name' | 'date';
  setSortBy?: (sort: 'name' | 'date') => void;
}

const TemplatesSection: React.FC<TemplatesSectionProps> = ({
  templates,
  activeReportId,
  loadTemplate,
  toggleFavorite,
  handleDeleteTemplate,
  // If external state management is provided, use it
  activeTemplateFilter: externalFilter,
  setActiveTemplateFilter: externalSetFilter,
  sortBy: externalSortBy,
  setSortBy: externalSetSortBy
}) => {
  // Internal state used if external state is not provided
  const [internalFilter, setInternalFilter] = React.useState<'all' | 'favorites'>('all');
  const [internalSortBy, setInternalSortBy] = React.useState<'name' | 'date'>('name');
  
  // Use external state if provided, otherwise use internal state
  const activeTemplateFilter = externalFilter !== undefined ? externalFilter : internalFilter;
  const setActiveTemplateFilter = externalSetFilter || setInternalFilter;
  const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;
  const setSortBy = externalSetSortBy || setInternalSortBy;

  // Filter and sort templates
  let filteredTemplates = [...templates];
  
  // Apply filters
  if (activeTemplateFilter === 'favorites') {
    filteredTemplates = filteredTemplates.filter(t => t.isFavorite);
  }
  
  // Apply sorting
  filteredTemplates.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Saved Templates</CardTitle>
            <CardDescription>
              Load and manage your saved report templates
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex">
              <Button 
                variant={activeTemplateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setActiveTemplateFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={activeTemplateFilter === 'favorites' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setActiveTemplateFilter('favorites')}
              >
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </div>
            
            <div className="flex">
              <Button 
                variant="outline"
                size="sm"
                className={sortBy === 'name' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => setSortBy('name')}
              >
                By Name
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className={sortBy === 'date' ? 'bg-accent text-accent-foreground' : ''}
                onClick={() => setSortBy('date')}
              >
                By Date
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {templates.length > 0 ? (
          <>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No templates match your current filter.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={() => setActiveTemplateFilter('all')}
                >
                  Show All Templates
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isActive={template.id === activeReportId}
                    onLoad={() => loadTemplate(template.id)}
                    onFavorite={() => toggleFavorite(template.id)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>You don't have any saved templates yet.</p>
            <p className="text-sm mt-1">Build your report and click Save to create your first template.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatesSection;