import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 실제로는 데이터베이스에 모든 알림의 읽음 상태를 업데이트해야 하지만,
    // 현재는 간단한 구현으로 성공 응답만 반환
    // TODO: Notification 모델 추가 및 읽음 상태 관리
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("모든 알림 읽음 처리 실패:", error);
    return NextResponse.json(
      { error: "모든 알림 읽음 처리에 실패했습니다." },
      { status: 500 }
    );
  }
}
