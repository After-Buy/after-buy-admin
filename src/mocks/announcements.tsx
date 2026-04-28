export type Announcement = {
  announcement_id: number;
  title: string;
  category: "NOTICE" | "MAINTENANCE" | "UPDATE";
  is_pinned: number;
  is_new: boolean;
  is_read: boolean;
  created_at: string;
};

export type AnnouncementDetail = Announcement & {
  content: string;
  created_by: number;
  updated_at: string;
};

export const announcements: Announcement[] = [
  {
    announcement_id: 1,
    title: "새로운 기능 업데이트",
    category: "UPDATE",
    is_pinned: 0,
    is_new: true,
    is_read: false,
    created_at: "2026-03-25"
  },
  {
    announcement_id: 3,
    title: "서버 점검 완료",
    category: "MAINTENANCE",
    is_pinned: 0,
    is_new: false,
    is_read: false,
    created_at: "2026-03-24"
  }
];

export const pinned_announcements: Announcement[] = [
  {
    announcement_id: 2,
    title: "제품 등록 시 주의사항 안내",
    category: "NOTICE",
    is_pinned: 1,
    is_new: false,
    is_read: true,
    created_at: "2026-03-26"
  }
];

export const announcement_details: AnnouncementDetail[] = [
  {
    announcement_id: 1,
    title: "새로운 기능 업데이트",
    category: "UPDATE",
    is_pinned: 0,
    is_new: true,
    is_read: false,
    created_at: "2026-03-25",
    updated_at: "2026-03-26",
    created_by: 1,
    content: "새로운 기능이 추가되었습니다. 관리자 페이지에서 바로 확인하세요."
  },
  {
    announcement_id: 2,
    title: "제품 등록 시 주의사항 안내",
    category: "NOTICE",
    is_pinned: 1,
    is_new: false,
    is_read: true,
    created_at: "2026-03-26",
    updated_at: "2026-03-26",
    created_by: 1,
    content: "제품 등록 전 아래 사항을 꼭 확인해 주세요."
  },
  {
    announcement_id: 3,
    title: "서버 점검 완료",
    category: "MAINTENANCE",
    is_pinned: 0,
    is_new: false,
    is_read: false,
    created_at: "2026-03-24",
    updated_at: "2026-03-24",
    created_by: 2,
    content: "서버 점검이 모두 완료되었습니다. 서비스 이용에 참고 바랍니다."
  }
];
