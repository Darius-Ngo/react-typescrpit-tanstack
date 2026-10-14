# Ghi chú học tập — Cách tư duy & Pattern trong dự án

File này không lặp lại nội dung source code — mục đích là ghi lại **vì sao** code được viết như vậy, và **cách tư duy** để tái sử dụng khi làm tính năng mới (Auth, Users...) mà không cần đọc lại toàn bộ `ProductsPage.tsx`.

---

## 1. Khung tư duy chung khi xây 1 màn hình mới

Áp dụng đúng thứ tự này cho mọi feature (đã dùng để xây Products, sẽ dùng lại cho Auth):

1. **Gọi thử API thật trước khi viết code** (Postman/curl/browser) — xác nhận đúng field, đúng tên param, đúng response shape. *Bài học từ lỗi `title` vs `q`: đừng đoán theo convention, luôn kiểm tra thực tế.*
2. **Viết type khớp với response thật** (`features/<name>/types.ts`).
3. **Viết hàm gọi API thô** (`features/<name>/api/*.ts`) — chỉ lo gọi HTTP, trả JSON, không biết gì về React/UI.
4. **Bọc TanStack Query quanh hàm ở bước 3** (`features/<name>/hooks/*.ts`) — đây là lớp duy nhất biết đến `useQuery`/`useMutation`.
5. **Viết UI dùng hook ở bước 4** (`features/<name>/pages/*.tsx`) — component không import axios, không biết URL nào cả.
6. Thêm tương tác (search, mutation, form) **từng lớp một**, test lại bằng `tsc -b` sau mỗi lớp thay vì viết hết rồi mới kiểm tra.

Lý do tách lớp 3-4-5: đổi nguồn dữ liệu (đổi API, đổi từ axios sang fetch) chỉ sửa lớp 3, không đụng lớp 5. Test lớp 3 không cần React.

---

## 2. Luồng chạy ứng dụng (kiến trúc tổng)

```
main.tsx → App.tsx → AppProviders (bơm QueryClient) → RouterProvider (routes.tsx)
  → Layout (Sidebar/Topbar + <Outlet/>) → Page → custom hook → api/*.ts → apiClient (axios) → API thật
```

Thư mục `app/`, `lib/`, `components/layout/` là hạ tầng dùng chung — không chứa nghiệp vụ. Mỗi `features/<name>/` gom đủ 4 lớp (types → api → hooks → pages) của **1** nghiệp vụ, để sửa 1 tính năng chỉ cần mở 1 thư mục.

---

## 3. TanStack Query — các quyết định mấu chốt đã dùng

- **`queryOptions()` factory** (`use-products.ts`): gom `queryKey` + `queryFn` vào 1 hàm để không viết lặp, và để dùng chung được cho cả `useQuery` lẫn `queryClient.prefetchQuery` sau này nếu cần.
- **Thiết kế `queryKey`**: `['products', { page, pageSize, search }]` — mỗi tổ hợp tham số khác nhau là 1 "ngăn cache" riêng. Nhớ điều này khi debug: đổi trang/search thực chất là **query key mới**, không phải "cùng 1 query fetch lại".
- **`isPending` vs `isFetching`**: `isPending` = chưa từng có data (lần đầu tải). `isFetching` = đang tải, kể cả khi đã có data cũ hiển thị (background refetch). Dùng `isPending` để show skeleton toàn trang, dùng `isFetching` để show spinner nhỏ góc màn hình.
- **`setQueriesData` thay vì `invalidateQueries` sau mutation** — vì DummyJSON là mock, không lưu thật; `invalidateQueries` sẽ fetch lại và mất luôn thay đổi vừa làm. `setQueriesData({queryKey: ['products']}, updater)` tự viết tay dữ liệu mới vào **mọi** cache khớp tiền tố `['products']` (mọi trang/search đang được cache), không cần gọi lại server. **Quy tắc chọn:** backend thật đáng tin → `invalidateQueries` (đơn giản, luôn đúng). Backend mock/không chắc chắn hoặc cần UI phản hồi tức thì không đợi round-trip → tự cập nhật cache bằng `setQueryData`/`setQueriesData`.
- **`useMutation` chỉ nhận 1 tham số** (`variables`) cho `mutationFn`. Cần nhiều giá trị (như `updateProduct(id, payload)`) → gói vào 1 object: `mutationFn: ({id, payload}) => updateProduct(id, payload)`.
- **`onSuccess` có 2 tầng**: khai trong hook (`use-product-mutations.ts`) lo phần "dữ liệu" (cập nhật cache, toast) — chạy cho **mọi** lần gọi. Khai thêm khi gọi `.mutate(values, {onSuccess})` lo phần "UI cục bộ" (đóng modal) — chỉ cho lần gọi đó. Tách vậy để hook tái sử dụng được ở nhiều nơi mà không phải lúc nào cũng đóng modal.
- **`mutation.variables`**: giá trị vừa truyền vào `.mutate(...)` gần nhất — dùng để biết "dòng nào đang pending" khi có nhiều nút cùng loại trên 1 bảng (vd. disable đúng nút Delete của đúng dòng, không disable cả bảng).

---

## 4. React Hook Form + Zod — các điểm dễ nhầm

- **`register('field')`** (uncontrolled) khác **`value`/`onChange`** (controlled, dùng cho ô search). Form nhiều field → dùng `register` để tránh re-render mỗi phím gõ. Cần đọc giá trị *ngay lúc gõ* để xử lý logic khác (debounce) → phải dùng controlled.
- **`z.coerce.number()`**: input HTML luôn trả về **string**, kể cả `type="number"`. `z.coerce.number()` tự ép kiểu trước khi validate. Hệ quả: schema có **2 kiểu khác nhau**:
  - `z.input<typeof schema>` — kiểu *trước* khi Zod xử lý (`price: unknown`).
  - `z.output<typeof schema>` (= `z.infer`) — kiểu *sau* khi xử lý xong (`price: number`).
- **`useForm` cần khai đủ 3 generic** khi input/output khác nhau:
  ```ts
  useForm<TFieldValues, TContext, TTransformedValues>({ resolver: zodResolver(schema) })
  // TFieldValues = z.input<typeof schema>   — field đang giữ lúc gõ
  // TContext = unknown                       — không dùng
  // TTransformedValues = z.output<typeof schema> — dữ liệu handleSubmit đưa cho onSubmit
  ```
  Thiếu tham số thứ 3 → TypeScript hiểu input = output, `onSubmit` bị suy sai kiểu (`price: unknown` thay vì `number`) → lỗi "not assignable" ở nơi gọi.
- **`handleSubmit(onSubmit)`**: tự `preventDefault`, tự validate qua Zod, chỉ gọi `onSubmit` nếu hợp lệ. Không hợp lệ → tự đổ lỗi vào `formState.errors`, không gọi `onSubmit`.

---

## 5. TypeScript ôn lại qua thực chiến (không phải lý thuyết suông)

| Khái niệm | Áp dụng ở đâu | Vì sao cần |
|---|---|---|
| Generic `<T>` | `useDebouncedValue<T>(value: T, delayMs: number)` | 1 hook debounce dùng được cho mọi kiểu dữ liệu |
| Discriminated union | `ActionState`, `ModalState` (`{mode: 'closed'\|'create'\|'edit'; product?}`) | Gom nhiều state rời rạc thành 1 giá trị, tránh trạng thái vô lý (vd. "đang sửa nhưng không có product") |
| Narrowing | `if (modalState.mode === 'edit') modalState.product...` | Sau khi check `mode`, TS tự biết field nào chắc chắn tồn tại, không cần ép kiểu |
| `z.infer` / `z.input` / `z.output` | `schema.ts` | Không viết type 2 lần (1 lần cho validate, 1 lần cho TS) — 1 nguồn sự thật duy nhất |
| Mapped type | `PaginatedResponse<Key, T>` (`types/common.ts`) | Tái sử dụng shape `{total, skip, limit}` cho mọi resource của DummyJSON mà key mảng khác tên nhau |
| Nullish coalescing `??` | `searchParams.get('q') ?? ''` | Đảm bảo luôn ra `string`, không bao giờ `null` |
| Template literal | `` `/products/${id}` `` | Ghép URL động, thay cho nối chuỗi `+` |

---

## 6. Các bug thực tế đã gặp — vì sao xảy ra, cách nhận diện lại

1. **Search không lọc được gì dù không lỗi.** Nguyên nhân: gửi nhầm param `title` thay vì `q` cho `/products/search`. Nhận diện: gọi thẳng API bằng curl/Postman với từng param nghi ngờ, so sánh kết quả — đừng chỉ đọc code, phải test cả API thật.
2. **`react-hooks/set-state-in-effect` warning.** Nguyên nhân: gọi `setPage(0)` bên trong `useEffect` phản ứng theo `debouncedSearch`, trong khi có thể set ngay tại `onChange` (nơi thực sự gây ra thay đổi). Quy tắc chung: nếu 1 state cần đổi *ngay khi* 1 sự kiện xảy ra, đặt trong handler của sự kiện đó; chỉ dùng `useEffect` khi phải đồng bộ với thứ **ngoài** vòng đời React (URL, subscription, timer).
3. **Lỗi `Resolver<...unknown...> not assignable`.** Nguyên nhân gốc: `z.coerce` làm input/output khác kiểu, nhưng `useForm` chỉ khai 1 generic. Cách nhận diện lỗi tương tự trong tương lai: thấy `unknown` xuất hiện ở đúng field nào có `.coerce()`/`.transform()` trong schema → nghĩ ngay đến việc thiếu `z.input`/`z.output` tách biệt.

---

## 7. Checklist áp dụng cho tính năng tiếp theo (Auth)

- [ ] Gọi thử `POST /auth/login` bằng curl trước, ghi lại đúng field response (đã làm — xem kế hoạch Auth).
- [ ] Type khớp response thật (không đoán).
- [ ] Tách lớp api/hooks/pages như Products.
- [ ] Nghĩ trước: state nào cần sống **ngoài** 1 component (ai đang đăng nhập) → dùng store (Zustand), không dùng `useState` cục bộ.
- [ ] Nơi nào không phải React component nhưng vẫn cần đọc state (axios interceptor) → dùng `store.getState()` thay vì hook.
- [ ] Mọi input số/ngày từ form → nhớ kiểm tra có cần `z.coerce` không, nếu có thì khai đủ 3 generic cho `useForm` ngay từ đầu, không đợi lỗi mới sửa.

---

## 8. Bản đồ file nhanh (tra cứu, không cần đọc lại source)

| File | Vai trò 1 dòng |
|---|---|
| `lib/api-client.ts` | axios instance dùng chung, tự đính token, tự xử lý 401 |
| `lib/query-client.ts` | cấu hình mặc định của TanStack Query (staleTime, retry) |
| `types/common.ts` | type/mapped-type dùng chung nhiều feature |
| `hooks/use-debounced-value.ts` | hook debounce dùng chung, không thuộc riêng feature nào |
| `features/products/types.ts` | shape dữ liệu Product khớp API thật |
| `features/products/schema.ts` | luật validate form (Zod) + type input/output |
| `features/products/api/products-api.ts` | gọi HTTP thô, không biết React |
| `features/products/hooks/use-products.ts` | `useQuery` đọc danh sách |
| `features/products/hooks/use-product-mutations.ts` | `useMutation` create/update/delete + tự cập nhật cache |
| `features/products/components/ProductFormModal.tsx` | form dùng chung cho create/edit |
| `features/products/pages/ProductsPage.tsx` | ráp tất cả lại thành màn hình hoàn chỉnh |
