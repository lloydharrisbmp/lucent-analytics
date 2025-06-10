import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { RecommendedAction } from "types";

export interface ActionImplementationStatus {
  actionId: string; // This can be the action title or another unique identifier
  status: "not_started" | "in_progress" | "completed" | "deferred";
  notes?: string;
  startDate?: string;
  completionDate?: string;
  impactAssessment?: {
    actualImpact: number;
    notes: string;
  };
}

interface Props {
  recommendations: RecommendedAction[];
  implementationStatus: Record<string, ActionImplementationStatus>; 
  onStatusChange: (actionId: string, status: ActionImplementationStatus["status"]) => void;
  onImpactAssessmentChange?: (actionId: string, actualImpact: number, notes: string) => void;
}

const RecommendationTracker: React.FC<Props> = ({
  recommendations,
  implementationStatus,
  onStatusChange,
  onImpactAssessmentChange
}) => {
  // Calculate overall implementation progress
  const totalActions = recommendations.length;
  const completedActions = Object.values(implementationStatus).filter(status => 
    status.status === "completed"
  ).length;
  const inProgressActions = Object.values(implementationStatus).filter(status => 
    status.status === "in_progress"
  ).length;
  
  const implementationProgress = totalActions > 0 
    ? Math.round((completedActions / totalActions) * 100) 
    : 0;

  const getStatusIcon = (status: ActionImplementationStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "deferred":
        return <RotateCcw className="h-5 w-5 text-orange-500" />;
      default: // not_started
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ActionImplementationStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "deferred":
        return <Badge className="bg-orange-100 text-orange-800">Deferred</Badge>;
      default: // not_started
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    }
  };

  const getPriorityLabel = (priority: number): { label: string; color: string } => {
    switch (priority) {
      case 1:
        return { label: "Critical", color: "bg-red-500 text-white" };
      case 2:
        return { label: "High", color: "bg-orange-500 text-white" };
      case 3:
        return { label: "Medium", color: "bg-yellow-500 text-white" };
      case 4:
        return { label: "Low", color: "bg-blue-500 text-white" };
      case 5:
        return { label: "Optional", color: "bg-gray-500 text-white" };
      default:
        return { label: "Unknown", color: "bg-gray-500 text-white" };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
          <CardDescription>
            Track the status of your financial health improvement actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{implementationProgress}%</span>
              </div>
              <Progress value={implementationProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{totalActions}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressActions}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedActions}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {recommendations
          .sort((a, b) => a.priority - b.priority) // Sort by priority
          .map(action => {
            const actionId = action.title; // Using title as the ID
            const status = implementationStatus[actionId] || { status: "not_started" };
            const priorityInfo = getPriorityLabel(action.priority);

            return (
              <Card key={actionId} className="overflow-hidden">
                <div className={`h-1 ${action.priority <= 2 ? "bg-red-500" : action.priority === 3 ? "bg-yellow-500" : "bg-blue-500"}`} />
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
                        <h3 className="font-semibold">{action.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{action.description.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        {getStatusBadge(status.status)}
                        {status.status === "completed" && status.impactAssessment && (
                          <span className="text-sm ml-2">
                            Actual impact: <strong className="text-green-600">+{status.impactAssessment.actualImpact.toFixed(1)}</strong> points
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant={status.status === "not_started" ? "default" : "outline"}
                        className={status.status === "not_started" ? "" : "text-gray-500"}
                        onClick={() => onStatusChange(actionId, "not_started")}
                      >
                        Not Started
                      </Button>
                      <Button 
                        size="sm" 
                        variant={status.status === "in_progress" ? "default" : "outline"}
                        className={status.status === "in_progress" ? "bg-blue-600" : "text-gray-500"}
                        onClick={() => onStatusChange(actionId, "in_progress")}
                      >
                        In Progress
                      </Button>
                      <Button 
                        size="sm" 
                        variant={status.status === "completed" ? "default" : "outline"}
                        className={status.status === "completed" ? "bg-green-600" : "text-gray-500"}
                        onClick={() => onStatusChange(actionId, "completed")}
                      >
                        Completed
                      </Button>
                      <Button 
                        size="sm" 
                        variant={status.status === "deferred" ? "default" : "outline"}
                        className={status.status === "deferred" ? "bg-orange-600" : "text-gray-500"}
                        onClick={() => onStatusChange(actionId, "deferred")}
                      >
                        Defer
                      </Button>
                    </div>
                  </div>
                  
                  {status.status === "completed" && onImpactAssessmentChange && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Impact Assessment</h4>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <p className="text-sm mb-1">Actual Score Improvement</p>
                          <input 
                            type="number" 
                            className="w-full border rounded p-1 text-sm"
                            min="0" 
                            max="100" 
                            step="0.1"
                            value={status.impactAssessment?.actualImpact || 0}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              onImpactAssessmentChange(actionId, value, status.impactAssessment?.notes || '');
                            }}
                          />
                        </div>
                        <div className="flex-[2]">
                          <p className="text-sm mb-1">Notes</p>
                          <input 
                            type="text" 
                            className="w-full border rounded p-1 text-sm"
                            placeholder="Add notes about the actual impact..."
                            value={status.impactAssessment?.notes || ''}
                            onChange={(e) => {
                              onImpactAssessmentChange(
                                actionId, 
                                status.impactAssessment?.actualImpact || 0, 
                                e.target.value
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default RecommendationTracker;
