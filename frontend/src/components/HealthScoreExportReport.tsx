import React, { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreResponse } from "types";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  scoreData: ScoreResponse;
  companyName: string;
  trendChartRef?: React.RefObject<HTMLDivElement>;
  radarChartRef?: React.RefObject<HTMLDivElement>;
}

const HealthScoreExportReport: React.FC<Props> = ({
  scoreData,
  companyName,
  trendChartRef,
  radarChartRef
}) => {
  // Reference to the report container
  const reportRef = useRef<HTMLDivElement>(null);

  // Function to export report as PDF
  const exportReport = async () => {
    if (!reportRef.current) return;
    
    try {
      // Import jsPDF and html2canvas
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      
      toast.info("Preparing report for export...");
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Capture the report content as an image
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      // Add charts if available
      let yOffset = 5;
      
      // Add company name and date
      pdf.setFontSize(18);
      pdf.text(`Financial Health Report: ${companyName}`, 20, yOffset + 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, 20, yOffset + 22);
      
      // Add main report content
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, yOffset + 25, 190, 100);
      
      // Add additional charts if available
      if (trendChartRef?.current) {
        const trendCanvas = await html2canvas(trendChartRef.current, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        const trendImgData = trendCanvas.toDataURL('image/png');
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Historical Trend Analysis', 20, 15);
        pdf.addImage(trendImgData, 'PNG', 10, 20, 190, 100);
      }
      
      if (radarChartRef?.current) {
        const radarCanvas = await html2canvas(radarChartRef.current, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        const radarImgData = radarCanvas.toDataURL('image/png');
        if (!trendChartRef?.current) pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Industry Comparison', 20, trendChartRef?.current ? 140 : 15);
        pdf.addImage(radarImgData, 'PNG', 10, trendChartRef?.current ? 145 : 20, 190, 100);
      }
      
      // Add recommendations page
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Key Recommendations & Insights', 20, 15);
      
      let recommendationY = 25;
      pdf.setFontSize(12);
      pdf.text('Overall Assessment:', 20, recommendationY);
      
      recommendationY += 7;
      pdf.setFontSize(10);
      const interpretation = scoreData.overall_score.interpretation;
      const wrappedText = pdf.splitTextToSize(interpretation, 170);
      pdf.text(wrappedText, 20, recommendationY);
      
      recommendationY += wrappedText.length * 5 + 10;
      
      // Add category-specific recommendations
      Object.entries(scoreData.overall_score.category_scores).forEach(([category, data]) => {
        if (data.suggestions && data.suggestions.length > 0) {
          pdf.setFontSize(12);
          pdf.text(`${category} Recommendations:`, 20, recommendationY);
          recommendationY += 7;
          
          pdf.setFontSize(10);
          data.suggestions.forEach((suggestion) => {
            const wrappedSuggestion = pdf.splitTextToSize(`• ${suggestion}`, 170);
            pdf.text(wrappedSuggestion, 20, recommendationY);
            recommendationY += wrappedSuggestion.length * 5 + 3;
          });
          
          recommendationY += 5;
        }
      });
      
      // Add footer
      pdf.setFontSize(8);
      pdf.text('© Lucent Analytics - Confidential Financial Report', 20, 285);
      
      // Save the PDF
      pdf.save(`${companyName.replace(/\s+/g, '_')}_Financial_Health_Report.pdf`);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <CardTitle>Financial Health Report</CardTitle>
            <CardDescription>
              Comprehensive report of financial health metrics and recommendations
            </CardDescription>
          </div>
          <Button 
            onClick={exportReport} 
            className="mt-4 sm:mt-0"
          >
            Export as PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={reportRef} className="space-y-6 p-4 border rounded-lg">
          {/* Report Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">{companyName}</h2>
            <p className="text-gray-500">Financial Health Assessment</p>
            <p className="text-sm text-gray-400">Generated on {format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Health Score</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{
                    backgroundColor: 
                      scoreData.overall_score.score >= 80 ? '#22c55e' : 
                      scoreData.overall_score.score >= 65 ? '#16a34a' : 
                      scoreData.overall_score.score >= 50 ? '#eab308' : 
                      scoreData.overall_score.score >= 30 ? '#f97316' : 
                      '#ef4444'
                  }}
                >
                  {scoreData.overall_score.score.toFixed(1)}
                </div>
                <div className="ml-4">
                  <p className="font-medium">Industry Percentile: {scoreData.industry_percentile.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Industry Avg: {scoreData.industry_average.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Industry Median: {scoreData.industry_median.toFixed(1)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Assessment</h3>
              <p className="text-gray-700">{scoreData.overall_score.interpretation}</p>
            </div>
          </div>
          
          {/* Category Scores */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {Object.entries(scoreData.overall_score.category_scores).map(([category, data]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{category}</h4>
                    <span className="px-2 py-1 rounded-full text-xs text-white font-medium"
                      style={{
                        backgroundColor: 
                          data.score >= 80 ? '#22c55e' : 
                          data.score >= 65 ? '#16a34a' : 
                          data.score >= 50 ? '#eab308' : 
                          data.score >= 30 ? '#f97316' : 
                          '#ef4444'
                      }}
                    >
                      {data.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{data.interpretation}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{
                        width: `${data.score}%`,
                        backgroundColor: 
                          data.score >= 80 ? '#22c55e' : 
                          data.score >= 65 ? '#16a34a' : 
                          data.score >= 50 ? '#eab308' : 
                          data.score >= 30 ? '#f97316' : 
                          '#ef4444'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Key Recommendations</h3>
            <div className="space-y-3">
              {Object.entries(scoreData.overall_score.category_scores)
                .sort((a, b) => a[1].score - b[1].score)
                .slice(0, 2)
                .flatMap(([category, data]) => 
                  data.suggestions?.map((suggestion, index) => (
                    <div key={`${category}-${index}`} className="border-l-4 pl-4 py-2" 
                      style={{ borderColor: '#4f46e5' }}
                    >
                      <p className="font-medium">{category}</p>
                      <p className="text-gray-600">{suggestion}</p>
                    </div>
                  )) || []
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScoreExportReport;