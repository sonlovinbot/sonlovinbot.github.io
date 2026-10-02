# app.danghuuson.com — trang chủ các dự án của Đặng Hữu Sơn

Trang tổng hợp phần mềm, game 3D và tài liệu thực hành AI miễn phí: **https://app.danghuuson.com**

Repo đặc biệt `sonlovinbot.github.io` (GitHub Pages của tài khoản). Vì repo này gắn tên miền `app.danghuuson.com`,
**mọi repo khác bật Pages tự có địa chỉ** `https://app.danghuuson.com/<tên-repo>/`.

## Thêm một dự án mới

1. Repo dự án bật GitHub Pages → tự có trang ở `app.danghuuson.com/<tên-repo>/`.
2. Thêm một mục vào [`projects.json`](projects.json) (sửa thẳng trên web GitHub được):

```json
{ "id": "ten-repo", "title": "Tên hiển thị", "desc": "1–2 câu: làm được gì, cho ai.",
  "category": "app | game | guide | devkit", "url": "/ten-repo/",
  "image": "assets/projects/ten-repo.jpg", "tags": ["…", "…"], "featured": false }
```

3. Ảnh thẻ: 640×360 JPG trong `assets/projects/`. Commit → khoảng 1 phút sau trang cập nhật.

`featured: true` cho đúng **một** dự án để hiện thẻ lớn đầu trang. `cta` (tuỳ chọn) đổi chữ trên nút mở.

**Không ghi link mã nguồn (repo) vào đây** — trang chỉ hiện link sử dụng. File này công khai, ai cũng đọc được.

## Meta Pixel
`index.html` và `404.html` có Meta Pixel `1152715006830829`: PageView mỗi lần xem trang, `ViewContent` khi mở một dự án,
`DownloadClick` (sự kiện tuỳ chỉnh) khi bấm "Tải miễn phí" — kèm `content_ids` = id dự án. Xem trong Meta Events Manager.

## Dự án ở tổ chức sonlovinbot-team (repo riêng tư)
Dự án muốn giữ kín mã nguồn nằm ở tổ chức `sonlovinbot-team` (GitHub Team) → trang tại
`https://studio.danghuuson.com/<tên-repo>/`. Trong `projects.json` ghi `url` đầy đủ đường dẫn studio.
Khi chuyển một repo sang tổ chức: thêm tên repo vào thư mục chuyển hướng (`<tên-repo>/index.html`) và mảng `moved` trong `404.html`
để link cũ `app.danghuuson.com/<tên-repo>/…` tự chuyển sang studio.

## Lưu ý
- **Không đổi tên repo đã có người dùng** — đường dẫn `app.danghuuson.com/<tên-repo>` đổi theo và link cũ không tự chuyển.
- DNS: bản ghi `CNAME app → sonlovinbot.github.io` tại nhà cung cấp tên miền. Tên miền gốc `danghuuson.com` đã xác minh trong GitHub → Settings → Pages.
