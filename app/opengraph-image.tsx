import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "터치더월드 | 교육여행·체험학습·AI 교육 프로그램";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadKoreanFont(): Promise<ArrayBuffer | undefined> {
  try {
    const text = encodeURIComponent(
      "터치더월드교육여행체험학습AI프로그램Since1996초중고등학교지자체대상전문기업·"
    );
    // 구형 UA 사용 시 Google Fonts가 TTF 형식 반환 — ImageResponse는 woff2 미지원
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${text}`,
      {
        headers: {
          "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)",
        },
      }
    ).then((r) => r.text());

    const match = css.match(/src: url\((.+?)\) format\('truetype'\)/);
    if (!match?.[1]) return undefined;

    return fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

export default async function Image() {
  const [fontData, logoBuffer] = await Promise.all([
    loadKoreanFont(),
    (async () => {
      try {
        const logoPath = path.join(process.cwd(), "public", "ttw_logo.png");
        return fs.readFileSync(logoPath);
      } catch {
        return null;
      }
    })(),
  ]);

  const logoSrc = logoBuffer
    ? `data:image/png;base64,${logoBuffer.toString("base64")}`
    : null;

  const fontFamily = fontData ? "Noto Sans KR" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0a0a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.05)",
            display: "flex",
          }}
        />

        {/* 로고 + 회사명 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "36px",
          }}
        >
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              width={88}
              height={88}
              alt=""
              style={{ borderRadius: "16px" }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "62px",
                fontWeight: 700,
                fontFamily,
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              터치더월드
            </span>
            <span
              style={{
                color: "#3b82f6",
                fontSize: "22px",
                fontFamily: "sans-serif",
                letterSpacing: "2px",
              }}
            >
              TOUCH THE WORLD
            </span>
          </div>
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: "480px",
            height: "1px",
            background: "rgba(255,255,255,0.12)",
            marginBottom: "32px",
            display: "flex",
          }}
        />

        {/* 슬로건 */}
        <div
          style={{
            color: "#94a3b8",
            fontSize: "28px",
            fontFamily,
            textAlign: "center",
            lineHeight: 1.5,
            letterSpacing: "0.5px",
          }}
        >
          교육여행 · 체험학습 · AI 교육 프로그램
        </div>

        {/* Since */}
        <div
          style={{
            color: "#475569",
            fontSize: "18px",
            marginTop: "20px",
            fontFamily,
            letterSpacing: "1px",
          }}
        >
          Since 1996 · 초·중·고등학교 및 지자체 대상 전문 교육여행 기업
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Noto Sans KR",
                data: fontData,
                weight: 700 as const,
                style: "normal" as const,
              },
            ],
          }
        : {}),
    }
  );
}
