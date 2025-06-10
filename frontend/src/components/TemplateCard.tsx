import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, X } from 'lucide-react';
import { ReportTemplate } from 'utils/report-builder-store';

interface TemplateCardProps {
  template: ReportTemplate;
  isActive: boolean;
  onLoad: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  isActive, 
  onLoad, 
  onFavorite, 
  onDelete 
}) => (
  <Card 
    className={`group hover:bg-accent/10 cursor-pointer transition-colors ${isActive ? 'border-primary' : ''}`}
  >
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 mr-1 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
          >
            <Star className={`h-4 w-4 ${template.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
          </Button>
          <span 
            className="truncate" 
            onClick={onLoad}
          >
            {template.name}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="opacity-0 group-hover:opacity-100 h-6 w-6" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent onClick={onLoad}>
      <p className="text-sm text-muted-foreground mb-1 truncate">
        {template.description || 'No description'}
      </p>
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Last modified: {new Date(template.updatedAt).toLocaleDateString()}
        </p>
        <Badge variant="outline" className="text-xs">
          {template.components.length} {template.components.length === 1 ? 'component' : 'components'}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

export default TemplateCard;