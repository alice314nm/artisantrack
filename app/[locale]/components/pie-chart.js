"use client";

import { Chart } from "chart.js";
import "chart.js/auto";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export default function PieChart({ income, expenses }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const t = useTranslations(); // useTranslations hook to get translations

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const context = chartRef.current.getContext("2d");

      if (!context) {
        console.error("Could not get 2D context");
        return;
      }

      try {
        const newChart = new Chart(context, {
          type: "doughnut",
          data: {
            labels: [
              t("chart.expenses"), // Use translated label for Expenses
              t("chart.income"), // Use translated label for Income
            ],
            datasets: [
              {
                label: t("chart.financial"), // Use translated label for the dataset
                data: [expenses, income],
                backgroundColor: ["#CF4D4D", "#ACC86C"],
                spacing: 5,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {},
          },
        });

        chartInstanceRef.current = newChart;
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [income, expenses, t]); // Add 't' as a dependency

  return (
    <div>
      <canvas
        ref={chartRef}
        className="w-full h-full max-w-[300px] max-h-[300px]"
      />
    </div>
  );
}
