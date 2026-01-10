// OG 圖片生成 API Route - 使用 Satori 生成測驗結果預覽圖（SVG 格式）
// 符合 Open Graph 標準的 1200x630 圖片尺寸

import { NextRequest, NextResponse } from "next/server";
import satori from "satori";
import { loadNotoSansTC } from "@/lib/fonts";
import React from "react";

/**
 * 根據分級取得顏色（與 ResultCard 保持一致）
 */
function getGradeColor(grade: string): string {
  switch (grade) {
    case "low":
      return "#16a34a"; // green-600
    case "medium":
      return "#ca8a04"; // yellow-600
    case "high":
      return "#dc2626"; // red-600
    default:
      return "#000000";
  }
}

/**
 * 生成測驗結果預覽圖
 */
async function generateImage(params: {
  title: string;
  totalScore: number;
  maxScore: number;
  label: string;
  description: string;
  grade: string;
}): Promise<string> {
  const font = await loadNotoSansTC();

  // Satori 需要 ArrayBuffer 格式的字體資料
  // 確保字體資料是正確的 ArrayBuffer
  let fontData: ArrayBuffer;

  if (font.data instanceof ArrayBuffer) {
    fontData = font.data;
  } else if (font.data instanceof Uint8Array) {
    // 將 Uint8Array 轉換為 ArrayBuffer
    // 創建新的 ArrayBuffer 副本
    fontData = new ArrayBuffer(font.data.length);
    const view = new Uint8Array(fontData);
    view.set(font.data);
  } else {
    throw new Error("字體資料格式不正確");
  }

  // 驗證字體資料有效性
  if (!fontData || fontData.byteLength === 0) {
    throw new Error("字體資料為空或無效");
  }

  // Satori 要求所有有多個子節點的 div 必須明確指定 display
  // 為了確保所有文字內容都被正確處理，將所有動態內容轉換為字串
  const titleText = String(params.title);
  const totalScoreText = String(params.totalScore);
  const maxScoreText = String(params.maxScore);
  const labelText = String(params.label);
  const descriptionText = String(params.description);

  const svg = await satori(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        padding: "80px",
        fontFamily: "Noto Sans TC",
      }}
    >
      <div
        style={{
          display: "block",
          fontSize: "48px",
          fontWeight: "bold",
          color: "#1a1a1a",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        {titleText}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          borderRadius: "16px",
          padding: "60px",
          width: "100%",
          maxWidth: "900px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "block",
              fontSize: "24px",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            總分
          </div>
          <div
            style={{
              display: "block",
              fontSize: "96px",
              fontWeight: "bold",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            {totalScoreText}
          </div>
          <div
            style={{
              display: "block",
              fontSize: "20px",
              color: "#6b7280",
            }}
          >
            {`滿分 ${maxScoreText} 分`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "block",
              fontSize: "24px",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            風險等級
          </div>
          <div
            style={{
              display: "block",
              fontSize: "48px",
              fontWeight: "600",
              color: getGradeColor(params.grade),
            }}
          >
            {labelText}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "block",
              fontSize: "24px",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            評估說明
          </div>
          <div
            style={{
              display: "block",
              fontSize: "20px",
              color: "#374151",
              lineHeight: "1.6",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              maxWidth: "800px",
              whiteSpace: "pre-wrap",
            }}
          >
            {descriptionText}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: font.name,
          data: fontData,
          weight: (font.weight || 400) as
            | 100
            | 200
            | 300
            | 400
            | 500
            | 600
            | 700
            | 800
            | 900,
          style: (font.style || "normal") as "normal" | "italic",
        },
      ],
    }
  );

  return svg;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 驗證必要參數
    const title = searchParams.get("title");
    const totalScore = searchParams.get("totalScore");
    const maxScore = searchParams.get("maxScore");
    const label = searchParams.get("label");
    const description = searchParams.get("description");
    const grade = searchParams.get("grade");

    if (
      !title ||
      !totalScore ||
      !maxScore ||
      !label ||
      !description ||
      !grade
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 生成 SVG
    const svg = await generateImage({
      title,
      totalScore: parseInt(totalScore, 10),
      maxScore: parseInt(maxScore, 10),
      label,
      description,
      grade,
    });

    // 返回 SVG 格式的圖片
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
