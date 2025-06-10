import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Download, Image as ImageIcon, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner"; // Added for toast notifications
import { ScoreResponse } from "types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Props {
  scoreData: ScoreResponse;
  companyName: string;
  onCategorySelect: (category: string) => void;
}

const FinancialHealthScoreCard: React.FC<Props> = ({ 
  scoreData, 
  companyName,
  onCategorySelect 
}) => {
  const cardRef = useRef<HTMLDivElement>(null); // Ref for the card element
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Green
    if (score >= 65) return "#16a34a"; // Dark green
    if (score >= 50) return "#eab308"; // Yellow
    if (score >= 30) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  // Get gradient ID for the score
  const getGradientId = (score: number) => {
    if (score >= 80) return "gradient-excellent";
    if (score >= 65) return "gradient-good";
    if (score >= 50) return "gradient-fair";
    if (score >= 30) return "gradient-poor";
    return "gradient-critical";
  };

  const scoreColor = getScoreColor(scoreData.overall_score.score);
  const gradientId = getGradientId(scoreData.overall_score.score);

  // --- PNG Export Handler ---
  const handleExportPNG = () => {
    if (cardRef.current) {
      toast.info("Generating PNG...");
      html2canvas(cardRef.current, {
        backgroundColor: null, // Use transparent background or specify card bg
        scale: 2, 
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `${companyName}_Financial_Health_Score.png`.replace(/\s+/g, "_"); // Sanitize filename
          link.href = canvas.toDataURL("image/png");
          link.click();
          toast.success("PNG Exported Successfully!");
        })
        .catch((err) => {
          console.error("PNG Export Error:", err);
          toast.error("Failed to export PNG.");
        });
    } else {
      console.error("Card ref not found for PNG export.");
      toast.error("Could not find card element to export.");
    }
  };
  // --- End PNG Export Handler ---

  // --- CSV Export Handler ---
  const handleExportCSV = () => {
    if (!scoreData) {
      toast.warning("No score data available to export.");
      return;
    }

    toast.info("Generating CSV...");

    const headers = ["Metric", "Value", "Interpretation"];
    const rows = [
      // Overall Score
      ["Overall Score", scoreData.overall_score.score.toFixed(1), `"${scoreData.overall_score.interpretation}"`],
      // Category Scores
      ...Object.entries(scoreData.overall_score.category_scores).map(([category, data]) => [
        `${category} Score`, 
        data.score.toFixed(1),
        `"${data.interpretation}"` // Assuming interpretation exists per category, add safety if not
      ])
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${companyName}_Financial_Health_Score_Data.csv`.replace(/\s+/g, "_")); // Sanitize filename
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported Successfully!");
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV.");
    }
  };
  // --- End CSV Export Handler ---
  
  return (
    <Card className="h-full" ref={cardRef}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Financial Health Score</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleExportPNG} title="Export Card as PNG">
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">Export PNG</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export Data as CSV">
              <FileText className="h-4 w-4" />
              <span className="sr-only">Export CSV</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          {companyName} • {scoreData.industry} • {scoreData.size.charAt(0).toUpperCase() + scoreData.size.slice(1)} Business
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* SVG Definitions for Gradients */}
        <svg style={{ height: 0, width: 0 }} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="gradient-excellent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-fair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="gradient-poor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="w-52 h-52 mb-4">
          <CircularProgressbar
            value={scoreData.overall_score.score}
            maxValue={100}
            text={`${scoreData.overall_score.score.toFixed(1)}`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: `url(#${gradientId})`,
              textColor: scoreColor,
              trailColor: '#e5e7eb',
              pathTransitionDuration: 0.5,
            })}
          />
        </div>

        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-1">Overall Rating</h3>
          <p className="text-gray-600">{scoreData.overall_score.interpretation}</p>
        </div>

        <div className="w-full space-y-3 mt-2">
          <h4 className="font-medium">Category Breakdown</h4>
          
          {Object.entries(scoreData.overall_score.category_scores).map(([category, data]) => (
            <div key={category} className="w-full">
              <div className="flex justify-between items-center text-sm">
                <span>{category}</span>
                <span>{data.score.toFixed(1)}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="h-2 rounded-full" 
                  style={{
                    width: `${data.score}%`,
                    backgroundColor: getScoreColor(data.score)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="mt-6 w-full"
          onClick={() => onCategorySelect(Object.keys(scoreData.overall_score.category_scores)[0])}
        >
          Explore Categories
        </Button>
      </CardContent>
      <Toaster richColors /> {/* Add Toaster for notifications */}
    </Card>
  );
};

export default FinancialHealthScoreCard;