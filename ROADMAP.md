# Giáo án 7 ngày — TypeScript + Tailwind CSS + TanStack Query
## Capstone: Admin Dashboard (CRUD) dùng DummyJSON

Mục tiêu: sau 1 tuần có 1 dự án admin dashboard cấu trúc chuẩn doanh nghiệp,
đủ để đưa vào portfolio/phỏng vấn — không chỉ "chạy được" mà đúng pattern
người ta dùng trong công ty thật.

Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query v5 +
React Router + React Hook Form + Zod + Axios.

Data source: [DummyJSON](https://dummyjson.com) — có auth (JWT), pagination,
search, sort thật, phù hợp mô phỏng admin CRUD hơn JSONPlaceholder.

---

### Ngày 1 — Nền tảng & TypeScript review
- Setup Tailwind v4, TanStack Query, React Router, path alias `@/`
- Cấu trúc thư mục theo feature (không chia theo loại file)
- Ôn TS qua thực hành: type cho API response, generic, discriminated union
  cho trạng thái async (`idle | loading | success | error`)
- Axios instance + interceptor (base API layer)

### Ngày 2 — Tailwind CSS + Layout
- Admin shell: Sidebar + Topbar + responsive layout
- Component pattern tránh lặp class dài (biến thể bằng `cva`/`clsx` +
  `tailwind-merge`)
- Dark mode, design token cơ bản (spacing/color scale nhất quán)

### Ngày 3 — TanStack Query cơ bản
- `QueryClientProvider`, `useQuery`, query key convention
- `queryOptions()` factory tái sử dụng
- Bảng dữ liệu: danh sách products — loading/error/empty state chuẩn
  (phân biệt `isPending` vs `isFetching`)
- Pagination (page-based, đồng bộ với URL query params)

### Ngày 4 — Mutations & Forms
- `useMutation` — create/update/delete + cache invalidation
- Optimistic update (ví dụ xoá 1 dòng ngay trên UI trước khi server trả về)
- Form thêm/sửa: React Hook Form + Zod validation, type-safe từ schema

### Ngày 5 — Tính năng nâng cao
- Search/filter debounce, đồng bộ URL
- Auth: login qua DummyJSON `/auth/login`, lưu token, protected routes
  (React Router loader/guard)
- Toast notification cho thành công/lỗi

### Ngày 6 — Pattern doanh nghiệp
- Tách API layer / custom hooks (`useProducts`, `useCreateProduct`...)
- Error boundary + fallback UI
- `.env` config (base URL theo môi trường)
- Code splitting theo route (`React.lazy`)
- ESLint/Prettier rule chuẩn

### Ngày 7 — Hoàn thiện & review
- Test cơ bản (Vitest + Testing Library) cho 1-2 component/hook quan trọng
- Deploy (Vercel/Netlify)
- Checklist review lại toàn bộ + chuẩn bị câu hỏi phỏng vấn thường gặp
  (khi nào dùng `useQuery` vs `useEffect+fetch`, cache invalidation strategy,
  stale-while-revalidate là gì...)

---
Ghi chú: 1 tuần là mốc chặt — ưu tiên hiểu đúng bản chất hơn là làm nhiều
tính năng. Có thể lùi/gộp ngày nếu cần, miễn giữ đúng thứ tự phụ thuộc
(Query → Mutation → Auth → Pattern doanh nghiệp).
