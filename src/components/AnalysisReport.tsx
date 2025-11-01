import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Heart,
  Brain,
  TrendingUp,
} from "lucide-react";

interface AnalysisResult {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  riskLevel: "low" | "medium" | "high";
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  confidence: number;
  recommendations: string[];
  modelResults?: any[]; // Add model results for detailed view
  analyzedContent?: string[]; // Add analyzed content (tweets/text)
  contentSummary?: string; // Add content summary
}

interface AnalysisReportProps {
  result: AnalysisResult;
}

const AnalysisReport = ({ result }: AnalysisReportProps) => {
  const sentimentData = [
    {
      name: "Positive",
      value: Math.round(result.sentiment.positive * 100),
      color: "#10b981",
    },
    {
      name: "Negative",
      value: Math.round(result.sentiment.negative * 100),
      color: "#ef4444",
    },
    {
      name: "Neutral",
      value: Math.round(result.sentiment.neutral * 100),
      color: "#6b7280",
    },
  ].filter((item) => item.value > 0); // Filter out zero values to prevent them from taking up space

  const emotionData = Object.entries(result.emotions).map(
    ([emotion, value]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: Math.round((value || 0) * 100), // Convert decimal to percentage with fallback
      color: getEmotionColor(emotion),
    })
  );

  // Ensure we have valid data for the chart
  const validEmotionData = emotionData.filter(
    (item) => item.value >= 0 && item.value <= 100
  );

  function getEmotionColor(emotion: string) {
    const colors: { [key: string]: string } = {
      joy: "#fbbf24",
      sadness: "#3b82f6",
      anger: "#ef4444",
      fear: "#8b5cf6",
      surprise: "#f59e0b",
      disgust: "#059669",
    };
    return colors[emotion] || "#6b7280";
  }

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case "low":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "medium":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "high":
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (result.riskLevel) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      ...result,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mental-health-analysis-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Brain className="h-6 w-6 text-primary-600 mr-2" />
              Analysis Report
            </h2>
            <p className="text-gray-600">
              Comprehensive mental health analysis results
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="btn-secondary mt-4 md:mt-0 inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>

        {/* Confidence Score */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-primary-800 font-medium">
              Analysis Confidence
            </span>
            <span className="text-2xl font-bold text-primary-600">
              {Math.round(result.confidence)}%
            </span>
          </div>
          <div className="mt-2 bg-primary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${result.confidence}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          Risk Assessment
        </h3>

        <div className={`border rounded-lg p-6 ${getRiskColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getRiskIcon()}
              <div className="ml-3">
                <h4 className="font-semibold text-lg capitalize">
                  {result.riskLevel} Risk Level
                </h4>
                <p className="text-sm opacity-75">
                  {result.riskLevel === "low" &&
                    "Indicators suggest generally positive mental health"}
                  {result.riskLevel === "medium" &&
                    "Some concerning patterns detected, monitoring recommended"}
                  {result.riskLevel === "high" &&
                    "Significant risk factors identified, immediate attention advised"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Sentiment Analysis */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Sentiment Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion Detection */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Emotion Detection
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={validEmotionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="emotion"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      {/* <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Recommendations
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
              </div>
              <p className="ml-3 text-blue-800">{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </div> */}

      {/* Detailed Metrics */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Detailed Metrics
        </h3>

        {/* Model Performance Summary */}
        {result.modelResults && result.modelResults.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-medium text-blue-900 mb-3">
              Model Performance Summary
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {
                    result.modelResults.filter((m) => m.status === "success")
                      .length
                  }
                  /{result.modelResults.length}
                </div>
                <div className="text-sm text-blue-700">Models Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {result.modelResults
                    .reduce((sum, m) => sum + (m.processing_time || 0), 0)
                    .toFixed(1)}
                  s
                </div>
                <div className="text-sm text-green-700">
                  Total Processing Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(
                    (result.modelResults.reduce(
                      (sum, m) => sum + (m.confidence || 0),
                      0
                    ) /
                      result.modelResults.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-purple-700">
                  Average Confidence
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sentiment Analysis Metrics */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            Sentiment Analysis
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(result.sentiment.positive * 100)}%
              </div>
              <div className="text-sm text-green-700">Positive Sentiment</div>
            </div>
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {Math.round(result.sentiment.negative * 100)}%
              </div>
              <div className="text-sm text-red-700">Negative Sentiment</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 mb-1">
                {Math.round(result.sentiment.neutral * 100)}%
              </div>
              <div className="text-sm text-gray-700">Neutral Sentiment</div>
            </div>
          </div>
        </div>

        {/* Data Correlation Analysis */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-lg font-medium text-yellow-900 mb-3">
            Data Correlation Analysis
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-yellow-800">
                Sentiment-Emotion Alignment:
              </span>
              <span
                className={`font-medium ${
                  result.sentiment.positive > 0.5 && result.emotions.joy > 0.5
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {result.sentiment.positive > 0.5 && result.emotions.joy > 0.5
                  ? "✓ Aligned"
                  : "⚠ Partial"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-800">
                Risk-Sentiment Consistency:
              </span>
              <span
                className={`font-medium ${
                  result.riskLevel === "low" &&
                  result.sentiment.positive > result.sentiment.negative
                    ? "text-green-600"
                    : result.riskLevel === "high" &&
                      result.sentiment.negative > result.sentiment.positive
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {result.riskLevel === "low" &&
                result.sentiment.positive > result.sentiment.negative
                  ? "✓ Consistent"
                  : result.riskLevel === "high" &&
                    result.sentiment.negative > result.sentiment.positive
                  ? "✓ Consistent"
                  : "⚠ Mixed"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-800">
                Overall Analysis Confidence:
              </span>
              <span
                className={`font-medium ${
                  result.confidence > 80
                    ? "text-green-600"
                    : result.confidence > 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {result.confidence.toFixed(1)}%{" "}
                {result.confidence > 80
                  ? "(High)"
                  : result.confidence > 60
                  ? "(Medium)"
                  : "(Low)"}
              </span>
            </div>
          </div>
        </div>

        {/* Model Agreement Analysis */}
        {result.modelResults && result.modelResults.length > 0 && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="text-lg font-medium text-indigo-900 mb-3">
              Model Agreement Analysis
            </h4>
            <div className="space-y-3">
              {result.modelResults.map((model, index) => (
                <div
                  key={model.model_name}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-indigo-800 capitalize">
                      {model.model_name.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        model.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-indigo-900">
                      {(model.confidence * 100).toFixed(1)}% confidence
                    </div>
                    {model.sentiment && (
                      <div className="text-xs text-indigo-600">
                        {model.sentiment.overall} sentiment
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analyzed Content Section */}
      {result.analyzedContent && result.analyzedContent.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            Analyzed Content
          </h3>
          {result.contentSummary && (
            <p className="text-gray-600 mb-4">{result.contentSummary}</p>
          )}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {result.analyzedContent.slice(0, 15).map((content, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <p className="ml-3 text-gray-800 leading-relaxed">
                    {content}
                  </p>
                </div>
              </motion.div>
            ))}
            {result.analyzedContent.length > 15 && (
              <div className="text-center text-gray-500 text-sm py-2">
                Showing first 15 tweets out of {result.analyzedContent.length}{" "}
                total
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual Model Results */}
      {result.modelResults && result.modelResults.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            Individual Model Results
          </h3>
          <div className="space-y-4">
            {result.modelResults.map((model, index) => (
              <motion.div
                key={model.model_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900 capitalize">
                    {model.model_name.replace("_", " ")}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        model.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {model.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {(model.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>

                {model.sentiment && (
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {Math.round(model.sentiment.positive * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Positive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        {Math.round(model.sentiment.negative * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Negative</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-600">
                        {Math.round(model.sentiment.neutral * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Neutral</div>
                    </div>
                  </div>
                )}

                {model.risk && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        model.risk.level === "low"
                          ? "bg-green-100 text-green-800"
                          : model.risk.level === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {model.risk.level.toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisReport;
