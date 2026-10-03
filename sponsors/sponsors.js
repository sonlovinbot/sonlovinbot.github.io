/* Khung tài trợ + popup giới thiệu game — dùng chung cho app./studio.danghuuson.com
 *
 * 1) Khung tài trợ cuối trang:
 *      <div data-sponsor-page="hub"></div>                 (thêm data-theme="dark" nếu trang luôn nền tối)
 *      <script src="https://app.danghuuson.com/sponsors/sponsors.js" defer></script>
 *
 * 2) Nhãn "Về game" + popup (tác giả, chương trình tài trợ) trong game:
 *      <script src="https://app.danghuuson.com/sponsors/sponsors.js" defer
 *        data-game="Tên game" data-desc="Một câu giới thiệu" data-landing="https://…/games/#id"
 *        data-source="game_id" data-pos="top-left|top-right|bottom-left|bottom-right"
 *        data-hide-when="#hud:not(.hidden)"   (có phần tử khớp → ẩn nhãn, vd lúc đang chơi)
 *        data-anchor=".author-link"           (đặt nhãn đúng chỗ phần tử này, ẩn phần tử đó)
 *        data-label="Về game" data-kicker="🎮 Game 3D làm bằng AI · Vibe Code" data-close="Chơi tiếp"></script>
 *    Đổi vị trí theo màn hình: CSS của game ghi đè `body .spk-game.pos-…` (top/left/bottom/right).
 *
 * Dữ liệu: sponsors.json cùng thư mục — items (chương trình) + pages (trang nào hiện gì).
 * Xem trước giờ khác: thêm ?spk_now=2026-10-04T21:00:00%2B07:00 vào URL trang; ?spk_preview hiện cả mục chưa có link.
 */
(function () {
  "use strict";
  if (window.__spk) return;
  window.__spk = true;
  var me = document.currentScript;
  var BASE = me ? me.src.replace(/[?#].*$/, "").replace(/[^/]*$/, "") : "/sponsors/";
  var qs = new URLSearchParams(location.search);
  var PREVIEW = qs.has("spk_preview");
  var H = 3600e3, D = 24 * H;
  var AUTHOR = { name: "Đặng Hữu Sơn", title: "CEO & Co-Founder LovinBot AI", url: "https://www.facebook.com/danghuuson.182/",
                 avatar: "https://app.danghuuson.com/assets/brand/avatar.jpg" };

  var KINDS = {
    workshop:  { label: "Workshop online",    icon: '<path d="M2 4h20v12H2z"/><path d="M8 20h8M12 16v4"/><path d="m10 8 4 2-4 2z"/>' },
    community: { label: "Cộng đồng Zalo",     icon: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>' },
    course:    { label: "Khoá học Zoom",      icon: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>' },
    elearning: { label: "E-learning + Ebook", icon: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>' }
  };
  var ICON_CAL = '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>';
  var ICON_INF = '<path d="M7 9a3 3 0 1 0 0 6c3 0 7-6 10-6a3 3 0 1 1 0 6c-3 0-7-6-10-6z"/>';
  var WD = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  function svg(p) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function now() { var t = qs.get("spk_now"); var d = t ? new Date(t) : null; return d && !isNaN(d) ? d.getTime() : Date.now(); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function hm(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function dayDiff(t, ref) { var a = new Date(t), b = new Date(ref); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0); return Math.round((a - b) / D); }
  function relDay(t, ref) {
    var d = new Date(t), n = dayDiff(t, ref), h = d.getHours(), part = h >= 22 ? "đêm" : h >= 18 ? "tối" : "";
    if (n === 0) return part ? part + " nay" : "hôm nay";
    if (n === 1) return part ? part + " mai" : "ngày mai";
    return WD[d.getDay()] + " " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1);
  }
  function full(t) { var d = new Date(t); return hm(d) + " · " + WD[d.getDay()] + ", " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function short(t) { var d = new Date(t); return hm(d) + " · " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function left(ms) {
    if (ms < H) return "Còn " + Math.max(1, Math.ceil(ms / 60e3)) + " phút";
    if (ms < 2 * D) return "Còn " + Math.floor(ms / H) + " giờ " + pad(Math.floor(ms % H / 60e3)) + " phút";
    return "Còn " + Math.floor(ms / D) + " ngày " + Math.floor(ms % D / H) + " giờ";
  }

  // Trạng thái 1 chương trình tại thời điểm t
  function state(it, t) {
    var s = { key: Infinity, tier: "ever", badge: "Học mọi lúc", when: "Không giới hạn thời gian", whenFull: "", ended: false, live: false };
    if (it.start) {
      var st = Date.parse(it.start), en = st + (it.duration_min || 120) * 60e3;
      s.key = st; s.whenFull = full(st);
      s.when = hm(new Date(st)) + " " + relDay(st, t);
      if (t >= en) { s.ended = true; s.tier = "ended"; s.badge = "Đã diễn ra"; s.when = short(st); }
      else if (t >= st) { s.live = true; s.tier = "live"; s.badge = "Đang diễn ra"; }
      else { s.tier = st - t <= D ? "urgent" : st - t <= 3 * D ? "soon" : "open"; s.badge = left(st - t); }
    } else if (it.deadline) {
      var dl = Date.parse(it.deadline);
      s.key = dl; s.whenFull = full(dl);
      s.when = (it.deadline_label || "Hạn") + " " + hm(new Date(dl)) + " " + relDay(dl, t);
      if (t >= dl) { s.ended = true; s.tier = "ended"; s.badge = "Hết ưu đãi"; s.when = (it.deadline_label || "Hạn") + " " + short(dl); }
      else { s.tier = dl - t <= D ? "urgent" : dl - t <= 3 * D ? "soon" : "open"; s.badge = left(dl - t); }
    }
    return s;
  }
  function rank(s, t) { return s.live ? -1 : s.ended ? 2e15 + (t - s.key) : s.key === Infinity ? 1e15 : s.key; }

  function link(it, source, medium, content) {
    if (!it.url) return "";
    try {
      var u = new URL(it.url);
      u.searchParams.set("utm_source", source);
      u.searchParams.set("utm_medium", medium);
      u.searchParams.set("utm_campaign", it.campaign || it.id);
      u.searchParams.set("utm_content", content);
      return u.toString();
    } catch (e) { return it.url; }
  }

  // Các chương trình của 1 trang, gấp nhất trước
  function pick(data, page, t) {
    var cfg = (data.pages && data.pages[page]) || { items: ["*"] };
    var want = cfg.items || ["*"];
    var list = (data.items || []).filter(function (it) {
      return (want.indexOf("*") >= 0 || want.indexOf(it.id) >= 0) && it.image && (it.url || PREVIEW);
    }).map(function (it) { return { it: it, s: state(it, t) }; });
    list.sort(function (a, b) { return rank(a.s, t) - rank(b.s, t); });
    return { cfg: cfg, list: list };
  }

  function track(id, kind, placement) {
    if (typeof window.fbq === "function") window.fbq("trackCustom", "SponsorClick", { content_ids: [id], content_type: kind, placement: placement });
  }

  /* ---------- 1) Khung tài trợ ---------- */
  function card(it, s, page, cfg, pos) {
    var k = KINDS[it.kind] || KINDS.course, href = link(it, cfg.source || page, "sponsor_box", page + "-" + pos);
    var flag = s.tier === "urgent" ? "Gấp" : s.live ? "Live" : "";
    var price = it.price ? '<span class="spk-price"><b>' + esc(it.price) + "</b>" +
      (it.price_note ? "<small>" + esc(it.price_note) + "</small>" : "") + "</span>" : "<span></span>";
    var cta = s.ended ? (it.cta_ended || "Xem lại") : (it.cta || "Xem ngay");
    var tag = href ? "a" : "div";
    var attrs = href ? ' href="' + esc(href) + '" target="_blank" rel="noopener sponsored"' : ' aria-disabled="true"';
    return "<" + tag + ' class="spk-card t-' + s.tier + (href ? "" : " no-link") + '"' + attrs +
      ' data-spk="' + esc(it.id) + '" data-kind="' + esc(it.kind) + '" style="--a:' + esc(it.accent || "#C2410C") + '">' +
      '<span class="spk-media" style="background:' + esc(it.bg || "var(--spk-soft)") + '">' +
        '<img src="' + esc(BASE + it.image) + '" alt="" decoding="async" class="fit-' + esc(it.fit || "cover") + '" style="object-position:' + esc(it.pos || "50% 50%") + '">' +
        (flag ? '<span class="spk-flag">' + flag + "</span>" : "") +
      "</span>" +
      '<span class="spk-body">' +
        '<span class="spk-top"><span class="spk-kind">' + svg(k.icon) + esc(k.label) + "</span>" +
          '<span class="spk-badge">' + esc(s.badge) + "</span></span>" +
        '<span class="spk-title">' + esc(it.title) + "</span>" +
        '<span class="spk-desc">' + esc(it.desc) + "</span>" +
        '<span class="spk-when" title="' + esc(s.whenFull) + '">' + svg(s.key === Infinity ? ICON_INF : ICON_CAL) + esc(s.when) + "</span>" +
        '<span class="spk-foot">' + price +
          '<span class="spk-cta">' + (href ? esc(cta) + " →" : "Chưa có link") + "</span></span>" +
      "</span></" + tag + ">";
  }

  function renderBox(box, data) {
    var page = box.getAttribute("data-sponsor-page") || "hub";
    var r = pick(data, page, now()), cfg = r.cfg;
    if (!r.list.length) { box.hidden = true; return; }
    box.hidden = false;
    var title = box.getAttribute("data-title") || cfg.title || "Chương trình đang mở";
    var lead = box.getAttribute("data-lead") || cfg.lead ||
      "Khoá học và sự kiện của Coachio Academy — đơn vị đồng hành giúp các dự án miễn phí ở đây được duy trì.";
    box.classList.add("spk");
    if (cfg.layout === "wide") box.classList.add("spk-wide");
    box.innerHTML =
      '<div class="spk-head"><h2 class="spk-h">' + esc(title) + "</h2>" +
      '<span class="spk-ad">Ad · Sponsor</span></div>' +
      '<p class="spk-lead">' + esc(lead) + "</p>" +
      '<div class="spk-grid">' + r.list.map(function (x, i) { return card(x.it, x.s, page, cfg, i + 1); }).join("") + "</div>";
  }

  /* ---------- 2) Nhãn + popup trong game ---------- */
  function gameIntro(data) {
    var o = me.dataset, page = o.page || "game", source = o.source || "game";
    var t = now(), r = data ? pick(data, page, t) : { list: [] };
    var top = r.list.filter(function (x) { return !x.s.ended && x.it.url; })[0];
    var hot = top && (top.s.tier === "urgent" || top.s.tier === "live");

    var root = document.createElement("div");
    root.className = "spk spk-game pos-" + (o.pos || "top-left");
    root.innerHTML =
      '<button type="button" class="spk-gtag" aria-haspopup="dialog">' +
        '<img src="' + AUTHOR.avatar + '" alt="" width="26" height="26">' +
        "<span>" + esc(o.label || "Về game") + "</span>" +
        (top ? '<span class="spk-gtag-sp' + (hot ? " hot" : "") + '">' + esc(top.it.short || KINDS[top.it.kind].label) +
          (top.s.tier === "urgent" || top.s.live ? " · " + esc(top.s.live ? "đang live" : relDay(top.s.key, t)) : "") + "</span>" : "") +
      "</button>" +
      '<div class="spk-gback" hidden>' +
        '<div class="spk-gpop" role="dialog" aria-modal="true" aria-labelledby="spk-gtitle">' +
          '<button type="button" class="spk-gx" aria-label="Đóng">×</button>' +
          '<div class="spk-ghead">' +
            '<span class="spk-gbubble">Chào bạn! 👋</span>' +
            '<img class="spk-gav" src="' + AUTHOR.avatar + '" alt="' + esc(AUTHOR.name) + '" width="72" height="72">' +
          "</div>" +
          '<div class="spk-gbody">' +
            '<p class="spk-gkick">' + esc(o.kicker || "🎮 Game 3D làm bằng AI · Vibe Code") + "</p>" +
            '<h3 id="spk-gtitle">' + esc(o.game || document.title) + "</h3>" +
            (o.desc ? '<p class="spk-gdesc">' + esc(o.desc) + "</p>" : "") +
            '<p class="spk-gauthor">Tác giả <a href="' + AUTHOR.url + '" target="_blank" rel="noopener">' + esc(AUTHOR.name) + "</a><br><small>" +
              esc(AUTHOR.title) + "</small></p>" +
            (top ? sponsorMini(top, source) : "") +
            '<div class="spk-gfoot">' +
              (o.landing ? '<a href="' + esc(o.landing) + '" target="_blank" rel="noopener">Giới thiệu các game ↗</a>' : "<span></span>") +
              '<button type="button" class="spk-gplay">' + esc(o.close || "Chơi tiếp") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";
    document.body.appendChild(root);

    var tagBtn = root.querySelector(".spk-gtag"), back = root.querySelector(".spk-gback"), last = null;
    function open() { last = document.activeElement; back.hidden = false; root.classList.add("open"); root.querySelector(".spk-gplay").focus(); }
    function close() { back.hidden = true; root.classList.remove("open"); try { (last && last.focus ? last : tagBtn).focus(); } catch (e) {} }
    tagBtn.addEventListener("click", open);
    root.querySelector(".spk-gx").addEventListener("click", close);
    root.querySelector(".spk-gplay").addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    root.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-spk]");
      if (a) track(a.getAttribute("data-spk"), a.getAttribute("data-kind"), source);
    });
    // Không để thao tác trên nhãn/popup lọt xuống game (bắn, di chuyển camera…)
    ["pointerdown", "mousedown", "touchstart", "pointerup", "mouseup", "touchend", "click", "wheel", "contextmenu"].forEach(function (ev) {
      root.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    // Popup mở: phím chỉ dành cho popup (Esc đóng), game không nhận phím
    window.addEventListener("keydown", function (e) {
      if (back.hidden) return;
      e.stopImmediatePropagation();
      if (e.key === "Escape") { e.preventDefault(); close(); }
    }, true);
    window.addEventListener("keyup", function (e) { if (!back.hidden) e.stopImmediatePropagation(); }, true);

    // data-anchor: đặt nhãn đè đúng chỗ 1 phần tử có sẵn của game (vd chip "Tác giả") và ẩn phần tử đó;
    //   phần tử không có trên màn hình → ẩn nhãn. data-hide-when: có phần tử khớp → ẩn nhãn (vd đang chơi).
    if (o.anchor || o.hideWhen) {
      var sync = function () {
        var busy = false;
        try { busy = !!(o.hideWhen && document.querySelector(o.hideWhen)); } catch (e) {}
        if (o.anchor) {
          var el = null; try { el = document.querySelector(o.anchor); } catch (e) {}
          var r = el && el.getBoundingClientRect();
          if (r && r.width) {
            el.style.visibility = "hidden";
            var w = root.offsetWidth || 220;
            root.style.left = Math.round(Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8))) + "px";
            root.style.top = Math.round(r.top + r.height / 2) + "px";
          } else busy = true;
        }
        root.classList.toggle("spk-busy", busy && back.hidden);
      };
      if (o.anchor) root.className = "spk spk-game pos-anchor";
      sync(); setInterval(sync, o.anchor ? 400 : 800);
    }
  }

  function sponsorMini(x, source) {
    var it = x.it, s = x.s, k = KINDS[it.kind] || KINDS.course;
    var href = link(it, source, "game_popup", "popup");
    return '<p class="spk-gask">' + esc(it.pitch || "Muốn tự làm game 3D như thế này?") + "</p>" +
      '<a class="spk-gsp t-' + s.tier + '" href="' + esc(href) + '" target="_blank" rel="noopener sponsored" data-spk="' + esc(it.id) +
        '" data-kind="' + esc(it.kind) + '" style="--a:' + esc(it.accent || "#C2410C") + '">' +
        '<span class="spk-gsp-img" style="background:' + esc(it.bg || "#eee") + '"><img src="' + esc(BASE + it.image) + '" alt="" class="fit-' +
          esc(it.fit || "cover") + '" style="object-position:' + esc(it.pos || "50% 50%") + '"></span>' +
        '<span class="spk-gsp-tx"><span class="spk-kind">' + svg(k.icon) + esc(k.label) + "</span>" +
          "<b>" + esc(it.title) + "</b>" +
          '<span class="spk-badge">' + esc(s.live ? "Đang diễn ra" : s.key === Infinity ? s.badge : s.when) + "</span></span>" +
      "</a>" +
      '<a class="spk-gcta" href="' + esc(href) + '" target="_blank" rel="noopener sponsored" data-spk="' + esc(it.id) + '" data-kind="' + esc(it.kind) +
        '" style="--a:' + esc(it.accent || "#C2410C") + '">' + esc(it.cta_popup || it.cta || "Xem ngay") + " →</a>" +
      '<p class="spk-gad">Ad · Sponsor — Coachio Academy</p>';
  }

  /* ---------- Khởi động ---------- */
  function init() {
    var boxes = document.querySelectorAll("[data-sponsor-page]");
    var isGame = me && me.hasAttribute("data-game");
    if (!boxes.length && !isGame) return;
    if (!document.querySelector("link[data-spk-css]")) {
      var l = document.createElement("link");
      l.rel = "stylesheet"; l.href = BASE + "sponsors.css?v=2"; l.setAttribute("data-spk-css", "");
      document.head.appendChild(l);
    }
    fetch(BASE + "sponsors.json?v=" + Math.floor(Date.now() / 6e5), { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (isGame) gameIntro(data);
        if (!boxes.length) return;
        var draw = function () { boxes.forEach(function (b) { renderBox(b, data); }); };
        draw();
        setInterval(draw, 60e3);
        document.addEventListener("click", function (e) {
          var a = e.target.closest && e.target.closest("a.spk-card");
          if (!a) return;
          var box = a.closest("[data-sponsor-page]");
          track(a.getAttribute("data-spk"), a.getAttribute("data-kind"), box ? box.getAttribute("data-sponsor-page") : "");
        }, true);
      })
      .catch(function () {
        boxes.forEach(function (b) { b.hidden = true; });
        if (isGame) gameIntro(null);
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
