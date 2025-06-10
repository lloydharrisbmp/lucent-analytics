import React, { useState, useEffect } from "react";
import brain from "brain";
import {
  Anomaly,
  VarianceItem,
  TimeSeriesData,
  VarianceAnalysisRequest,
  AnomalyDetectionResponse, // Assuming the endpoint returns this structure
  VarianceAnalysisResponse, // Assuming the endpoint returns this structure
} from "types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

const AnalysisHighlights = () => {
  const [anomaliesData, setAnomaliesData] = useState<Anomaly[] | null>(null);
  const [varianceData, setVarianceData] = useState<VarianceItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [anomalyError, setAnomalyError] = useState<string | null>(null);
  const [varianceError, setVarianceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setAnomalyError(null);
      setVarianceError(null);

      // --- Placeholder Request Data ---
      // TODO: Replace with dynamic data based on user selection
      // Generate 24 months of sample data
      const generateSampleTimeSeries = (startDate: Date, numMonths: number): { ds: string, y: number }[] => {
        const data: { ds: string, y: number }[] = [];
        let currentValue = 1000;
        for (let i = 0; i < numMonths; i++) {
          const date = new Date(startDate);
          date.setMonth(startDate.getMonth() + i);
          const ds = date.toISOString().split('T')[0];

          // Add some seasonality and trend
          const monthFactor = Math.sin((i % 12) * (Math.PI / 6)) * 150; // Seasonal fluctuation
          const trendFactor = i * 10; // Linear trend
          let noise = (Math.random() - 0.5) * 200; // Random noise

          // Introduce a couple of potential anomalies
          if (i === 10) noise += 800; // Spike
          if (i > 18 && i < 22) noise -= 500; // Dip

          currentValue = 1000 + trendFactor + monthFactor + noise;
          data.push({ ds, y: Math.max(0, Math.round(currentValue)) }); // Ensure non-negative
        }
        return data;
      };

      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      startDate.setDate(1);

      const anomalyRequest: TimeSeriesData = {
        data: generateSampleTimeSeries(startDate, 24),
      };

      const varianceRequest: VarianceAnalysisRequest = {
        entity_id: "placeholder-entity-id",
        report_type: "pnl",
        period_end_date: new Date().toISOString().split('T')[0], // Use today's date as placeholder
        comparison_type: "prior_period",
        thresholds: { absolute: 500, percentage: 0.1 },
      };
      // --- End Placeholder Request Data ---

      try {
        const results = await Promise.allSettled([
          brain.detect_tax_anomalies(anomalyRequest),
          brain.calculate_variances(varianceRequest),
        ]);

        // Handle API call results
        const [anomalyResult, varianceResult] = results;

        if (anomalyResult.status === "fulfilled") {
          console.log("Anomalies fetched:", anomalyResult.value);
          try {
            const response: AnomalyDetectionResponse = await anomalyResult.value.json();
            setAnomaliesData(response.anomalies || []);
            setAnomalyError(null);
          } catch (parseError) {
            console.error("Error parsing anomaly response:", parseError);
            setAnomaliesData([]);
            setAnomalyError("Failed to parse anomaly detection results.");
          }
        } else {
          console.error("Error fetching anomalies:", anomalyResult.reason);
          setAnomaliesData([]);
          // Attempt to parse error details if available
          let detail = "Failed to load anomalies. Please try again.";
          try {
            if (anomalyResult.reason instanceof Error) {
              detail = anomalyResult.reason.message;
            }
          } catch (e) {
            console.error("Error parsing anomaly error response:", e);
          }
          setAnomalyError(`Error loading anomalies: ${detail}`);
        }

        if (varianceResult.status === "fulfilled") {
          console.log("Variances fetched:", varianceResult.value);
          try {
            const response: VarianceAnalysisResponse = await varianceResult.value.json();
            setVarianceData(response.variances || []);
            setVarianceError(null);
          } catch (parseError) {
            console.error("Error parsing variance response:", parseError);
            setVarianceData([]);
            setVarianceError("Failed to parse variance analysis results.");
          }
        } else {
          console.error("Error fetching variances:", varianceResult.reason);
          setVarianceData([]);
          // Attempt to parse error details if available
          let detail = "Failed to load variances. Please try again.";
          try {
            if (varianceResult.reason instanceof Error) {
              detail = varianceResult.reason.message;
            }
          } catch (e) {
            console.error("Error parsing variance error response:", e);
          }
          setVarianceError(`Error loading variances: ${detail}`);
        }

        // Set general error if both failed
        if (anomalyResult.status === "rejected" && varianceResult.status === "rejected") {
          setError("Failed to fetch data. Please try again later.");
        } else {
          setError(null);
        }

      } catch (err) {
        // Catch errors not caught by individual promises (e.g., network errors before requests start)
        console.error("Error in Promise.allSettled block:", err);
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Lightbulb className="mr-2 h-7 w-7" /> Analysis Highlights
        </h1>
        <p className="text-muted-foreground">
          Key insights, anomalies, and significant variances detected across your financial data.
        </p>
      </div>

      {/* TODO: Add sections for Anomalies and Variances */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
                        {isLoading && <p>Loading anomalies...</p>}
            {anomalyError && <p className="text-red-500">{anomalyError}</p>}
            {!isLoading && !anomalyError && (
              anomaliesData && anomaliesData.length > 0 ? (
                <ul>
                  {anomaliesData.map((anomaly, index) => (
                    <li key={index}>
                      {anomaly.ds}: {anomaly.anomaly_type} (Value: {anomaly.y})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No anomalies detected or data unavailable.</p>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Significant Variances</CardTitle>
          </CardHeader>
          <CardContent>
                        {isLoading && <p>Loading variances...</p>}
            {varianceError && <p className="text-red-500">{varianceError}</p>}
            {!isLoading && !varianceError && (
              varianceData && varianceData.length > 0 ? (
                <ul>
                  {varianceData
                    .filter(v => v.is_significant) // Only show significant variances for now
                    .map((variance, index) => (
                    <li key={index}>
                      {variance.account_name}: {variance.absolute_variance?.toFixed(2)} ({variance.percentage_variance ? (variance.percentage_variance * 100).toFixed(1) + '%' : 'N/A'})
                      {variance.variance_direction && ` (${variance.variance_direction})`}
                    </li>
                  ))}
                  {varianceData.filter(v => v.is_significant).length === 0 && (
                    <p className="text-muted-foreground">No significant variances detected.</p>
                  )}
                </ul>
              ) : (
                <p className="text-muted-foreground">No variance data available.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisHighlights;
