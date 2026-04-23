import { useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const response = await axios.post(
        "https://ai-data-analyzer-api-nfbk.onrender.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResponseData(response.data);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const totalMissing = useMemo(() => {
    if (!responseData?.missing_values) return 0;
    return Object.values(responseData.missing_values).reduce(
      (sum, val) => sum + Number(val),
      0
    );
  }, [responseData]);

  const numericColumnCount = useMemo(() => {
    if (!responseData?.numeric_summary) return 0;
    return Object.keys(responseData.numeric_summary).length;
  }, [responseData]);

  const insightCards = useMemo(() => {
    if (!responseData) return [];

    const insights = [];
    const missingEntries = Object.entries(responseData.missing_values || {});
    const missingColumns = missingEntries.filter(([, value]) => Number(value) > 0);
    const textColumns = Object.entries(responseData.data_types || {})
      .filter(([, type]) => type === "object" || type === "str")
      .map(([col]) => col);

    insights.push({
      title: "Dataset Shape",
      text: `This dataset has ${responseData.rows} rows and ${responseData.columns} columns.`,
      icon: "📊",
    });

    insights.push({
      title: "Data Quality",
      text:
        totalMissing === 0
          ? "No missing values detected. The dataset looks clean."
          : `${totalMissing} missing values found across ${missingColumns.length} columns.`,
      icon: "🧹",
    });

    insights.push({
      title: "Numeric Features",
      text:
        numericColumnCount > 0
          ? `${numericColumnCount} numeric columns were found for statistical analysis.`
          : "No numeric columns found in this dataset.",
      icon: "📈",
    });

    if (textColumns.length > 0) {
      insights.push({
        title: "Categorical/Text Columns",
        text: `Text-based columns include: ${textColumns.join(", ")}.`,
        icon: "🏷️",
      });
    }

    return insights;
  }, [responseData, totalMissing, numericColumnCount]);

  const missingChartData = useMemo(() => {
    if (!responseData?.missing_values) return [];
    return Object.entries(responseData.missing_values).map(([column, value]) => ({
      column,
      missing: Number(value),
    }));
  }, [responseData]);

  const meanChartData = useMemo(() => {
    if (!responseData?.numeric_summary) return [];
    return Object.entries(responseData.numeric_summary).map(([column, stats]) => ({
      column,
      mean: Number(stats.mean?.toFixed ? stats.mean.toFixed(2) : stats.mean),
    }));
  }, [responseData]);

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 15px 45px rgba(15, 23, 42, 0.08)",
  };

  const sectionTitle = {
    marginTop: 0,
    marginBottom: "18px",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: "700",
  };

  const metricCards = responseData
    ? [
        {
          title: "Rows",
          value: responseData.rows,
          subtitle: "Dataset size",
          gradient: "linear-gradient(135deg, #dbeafe, #eff6ff)",
        },
        {
          title: "Columns",
          value: responseData.columns,
          subtitle: "Feature count",
          gradient: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
        },
        {
          title: "Missing Values",
          value: totalMissing,
          subtitle: "Quality check",
          gradient: "linear-gradient(135deg, #ffedd5, #fff7ed)",
        },
        {
          title: "Numeric Columns",
          value: numericColumnCount,
          subtitle: "Ready for stats",
          gradient: "linear-gradient(135deg, #ede9fe, #f5f3ff)",
        },
      ]
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 35%, #eef2ff 65%, #fdf2f8 100%)",
        padding: "40px 20px 60px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#1e293b",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            ...cardStyle,
            padding: "36px",
            marginBottom: "26px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.88))",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            ✨ Smart Dataset Dashboard
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "48px",
              lineHeight: 1.05,
              color: "#0f172a",
              maxWidth: "760px",
            }}
          >
            AI Data Analyzer
          </h1>

          <p
            style={{
              marginTop: "14px",
              marginBottom: 0,
              maxWidth: "760px",
              color: "#475569",
              fontSize: "17px",
              lineHeight: 1.8,
            }}
          >
            Upload a CSV file and turn raw data into a polished analytical
            dashboard with insights, preview rows, data quality checks, and
            statistical summaries.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                padding: "12px 14px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "14px",
                fontSize: "14px",
              }}
            />

            <button
              onClick={handleUpload}
              style={{
                padding: "14px 24px",
                background: loading
                  ? "#93c5fd"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "700",
                boxShadow: "0 12px 28px rgba(37, 99, 235, 0.28)",
              }}
            >
              {loading ? "Analyzing..." : "Analyze Dataset"}
            </button>
          </div>

          {selectedFile && (
            <p style={{ marginTop: "16px", color: "#334155", marginBottom: 0 }}>
              Selected file: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        {!responseData && (
          <div style={{ ...cardStyle, textAlign: "center", padding: "42px" }}>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Ready to explore data</h2>
            <p style={{ color: "#64748b", marginBottom: 0, fontSize: "16px" }}>
              Upload a dataset to see overview cards, insights, charts, preview
              rows, and summary statistics.
            </p>
          </div>
        )}

        {responseData && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
                marginBottom: "24px",
              }}
            >
              {metricCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    ...cardStyle,
                    background: card.gradient,
                    padding: "22px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#475569",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {card.title}
                  </p>
                  <h3
                    style={{
                      margin: "10px 0 6px",
                      fontSize: "34px",
                      color: "#0f172a",
                    }}
                  >
                    {card.value}
                  </h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                    {card.subtitle}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, marginBottom: "24px" }}>
              <h2 style={sectionTitle}>Quick Insights</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                }}
              >
                {insightCards.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                      border: "1px solid #e2e8f0",
                      borderRadius: "18px",
                      padding: "18px",
                    }}
                  >
                    <div style={{ fontSize: "26px", marginBottom: "10px" }}>
                      {item.icon}
                    </div>
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "8px",
                        color: "#0f172a",
                        fontSize: "18px",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        lineHeight: 1.7,
                        fontSize: "14px",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Preview Table</h2>
                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {responseData.column_names.map((col, index) => (
                          <th
                            key={index}
                            style={{
                              padding: "14px",
                              textAlign: "left",
                              fontSize: "14px",
                              color: "#334155",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {responseData.preview.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {responseData.column_names.map((col, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                padding: "14px",
                                borderBottom: "1px solid #e2e8f0",
                                color: "#475569",
                              }}
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={sectionTitle}>Column Names</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {responseData.column_names.map((col, index) => (
                    <span
                      key={index}
                      style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "8px 14px",
                        borderRadius: "999px",
                        fontSize: "14px",
                        fontWeight: "700",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Data Types</h2>
                <div style={{ display: "grid", gap: "12px" }}>
                  {Object.entries(responseData.data_types).map(([col, type]) => (
                    <div
                      key={col}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span>{col}</span>
                      <strong style={{ color: "#2563eb" }}>{type}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={sectionTitle}>Missing Values</h2>
                <div style={{ display: "grid", gap: "12px" }}>
                  {Object.entries(responseData.missing_values).map(([col, val]) => (
                    <div
                      key={col}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span>{col}</span>
                      <strong
                        style={{
                          color: Number(val) > 0 ? "#dc2626" : "#16a34a",
                        }}
                      >
                        {val}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Missing Values Chart</h2>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={missingChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="column" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="missing" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={sectionTitle}>Mean Value Chart</h2>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={meanChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="column" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="mean" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Numeric Summary</h2>

              {Object.keys(responseData.numeric_summary).length === 0 ? (
                <p style={{ color: "#64748b" }}>No numeric columns found.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {Object.entries(responseData.numeric_summary).map(
                    ([column, stats]) => (
                      <div
                        key={column}
                        style={{
                          background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                          borderRadius: "18px",
                          padding: "20px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <h3 style={{ marginTop: 0, color: "#0f172a" }}>
                          {column}
                        </h3>
                        <p>Count: <strong>{stats.count}</strong></p>
                        <p>Mean: <strong>{stats.mean}</strong></p>
                        <p>Min: <strong>{stats.min}</strong></p>
                        <p>Max: <strong>{stats.max}</strong></p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;