(function () {
  "use strict";
  var C = window.PAY_CONFIG;

  /* ---------- VietQR (EMVCo) ---------- */
  function tlv(id, v) { return id + String(v.length).padStart(2, "0") + v; }
  function crc16(s) {
    var crc = 0xffff;
    for (var i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) { crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1; crc &= 0xffff; }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  function sanitize(t) {
    return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
      .toUpperCase().replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 25).trim();
  }
  function buildPayload(amount, message) {
    var has = amount && amount > 0;
    var merchant = tlv("00", "A000000727") + tlv("01", tlv("00", C.bin) + tlv("01", C.accountNumber)) + tlv("02", "QRIBFTTA");
    var msg = message ? sanitize(message) : "";
    var p = tlv("00", "01") + tlv("01", has ? "12" : "11") + tlv("38", merchant) + tlv("53", "704") +
      (has ? tlv("54", String(Math.round(amount))) : "") + tlv("58", "VN") + (msg ? tlv("62", tlv("08", msg)) : "") + "6304";
    return p + crc16(p);
  }
  function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function parse(t) { var d = String(t).replace(/\D/g, ""); return d ? Number(d) : null; }

  function matrix(payload) {
    var qr = qrcode(0, "M"); qr.addData(payload, "Byte"); qr.make();
    return qr;
  }
  function svgFor(payload) {
    var qr = matrix(payload), n = qr.getModuleCount(), d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
    return '<svg viewBox="-1 -1 ' + (n + 2) + " " + (n + 2) + '" shape-rendering="crispEdges" role="img" aria-label="Mã QR chuyển khoản">' +
      '<rect x="-1" y="-1" width="' + (n + 2) + '" height="' + (n + 2) + '" fill="#fff"/><path d="' + d + '" fill="#14161f"/></svg>';
  }

  /* ---------- State ---------- */
  var selectedId = null, customAmount = null, debounce = null;
  var $ = function (s) { return document.querySelector(s); };
  var menuEl = $("#menu"), input = $("#amount"), btnCreate = $("#create"), hint = $("#hint"),
      lockNote = $("#lock-note"), unpick = $("#unpick");

  function current() {
    var item = C.menu.find(function (m) { return m.id === selectedId; });
    return {
      item: item,
      amount: item ? item.amount : customAmount,
      message: sanitize(item ? item.message : C.defaultMessage)
    };
  }

  function render() {
    var s = current();
    var payload = buildPayload(s.amount, s.message);
    var box = $("#qr");
    box.innerHTML = svgFor(payload);
    box.classList.remove("qr-in"); void box.offsetWidth; box.classList.add("qr-in");
    var amt = s.amount ? fmt(s.amount) + " VNĐ" : "Chưa chọn số tiền";
    $("#qr-amount").textContent = amt;
    $("#qr-empty").hidden = !!s.amount;
    $("#v-amount").textContent = s.amount ? fmt(s.amount) + " VNĐ" : "—";
    $("#v-message").textContent = s.message;

    document.querySelectorAll(".ticket").forEach(function (b) {
      var on = b.dataset.id === selectedId;
      b.dataset.selected = on; b.setAttribute("aria-pressed", on);
    });
    input.disabled = btnCreate.disabled = !!s.item;
    lockNote.hidden = unpick.hidden = !s.item;
    if (s.item) unpick.querySelector("span").textContent = s.item.title;
    updateHint();
  }

  function validate(n) {
    if (n === null) return null;
    if (n < C.customMin || n > C.customMax) return "Số tiền từ " + fmt(C.customMin) + " đến " + fmt(C.customMax) + " VNĐ";
    return null;
  }
  function updateHint() {
    var n = parse(input.value), err = validate(n);
    if (selectedId) { hint.innerHTML = ""; return; }
    hint.className = "hint" + (err ? " error" : "");
    hint.innerHTML = err ? err : n ? "Mã QR sẽ chứa: <b>" + fmt(n) + " VNĐ</b>" : "";
  }

  function scrollToPanel() {
    if (window.innerWidth < 1024) $("#thanh-toan").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Menu ---------- */
  C.menu.forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ticket"; b.dataset.id = m.id;
    b.innerHTML = '<div class="ticket-img"><img src="' + m.image + '" alt="' + m.title + '" loading="lazy"><span class="check">✓</span></div>' +
      '<div class="ticket-body"><div class="ticket-title">' + m.title + '</div><div class="ticket-note">' + m.note + '</div>' +
      '<div class="perf"></div><div class="ticket-price">' + fmt(m.amount) + "<small>VNĐ</small></div></div>";
    b.addEventListener("click", function () {
      var was = selectedId === m.id;
      selectedId = was ? null : m.id;
      render();
      if (!was) setTimeout(scrollToPanel, 60);
    });
    menuEl.appendChild(b);
  });
  unpick.addEventListener("click", function () { selectedId = null; render(); });

  /* ---------- Custom amount ---------- */
  input.addEventListener("input", function () {
    var n = parse(input.value);
    input.value = n === null ? "" : fmt(Math.min(n, 9999999999));
    updateHint();
    clearTimeout(debounce);
    debounce = setTimeout(function () {
      var v = parse(input.value);
      customAmount = v !== null && !validate(v) ? v : null;
      render();
    }, 350);
  });
  $("#custom-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = parse(input.value), err = validate(n);
    if (n === null) return toast("Bạn chưa nhập số tiền.", true);
    if (err) return toast(err, true);
    customAmount = n; render(); toast("Đã tạo QR " + fmt(n) + " VNĐ"); scrollToPanel();
  });

  /* ---------- Copy ---------- */
  function copy(text, label) {
    var done = function () { toast("Đã sao chép " + label + ": " + text); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Không sao chép được.", true); }
      ta.remove();
    }
  }
  $("#copy-acc").addEventListener("click", function () { copy(C.accountNumber, "số tài khoản"); });
  $("#copy-msg").addEventListener("click", function () { copy(current().message, "nội dung"); });

  /* ---------- Download ---------- */
  $("#download").addEventListener("click", function () {
    var s = current(), qr = matrix(buildPayload(s.amount, s.message)), n = qr.getModuleCount();
    var W = 900, H = 1200, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var x = cv.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#1f4fe0"; x.fillRect(0, 0, W, 150);
    x.fillStyle = "#fff"; x.textBaseline = "middle";
    x.font = "800 54px 'Bricolage Grotesque', sans-serif"; x.fillText(C.bankName.toUpperCase(), 60, 78);
    x.textAlign = "right"; x.font = "700 34px 'JetBrains Mono', monospace"; x.fillText("VietQR · NAPAS 247", W - 60, 78);
    var size = 640, qx = (W - size) / 2, qy = 200, cell = size / (n + 2);
    x.fillStyle = "#14161f";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) x.fillRect(qx + (c + 1) * cell, qy + (r + 1) * cell, Math.ceil(cell), Math.ceil(cell));
    x.textAlign = "center";
    x.font = "800 44px 'Bricolage Grotesque', sans-serif"; x.fillText(C.accountHolderAscii, W / 2, 900);
    x.fillStyle = "#5b6274"; x.font = "700 34px 'JetBrains Mono', monospace"; x.fillText(C.bankName + " · " + C.accountNumber, W / 2, 956);
    x.fillStyle = "#1f4fe0"; x.font = "800 64px 'Bricolage Grotesque', sans-serif"; x.fillText(s.amount ? fmt(s.amount) + " VNĐ" : "Tự nhập số tiền", W / 2, 1050);
    x.fillStyle = "#14161f"; x.font = "600 30px 'JetBrains Mono', monospace"; x.fillText(s.message, W / 2, 1120);
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "QR-" + C.bankName + "-" + C.accountNumber + (s.amount ? "-" + s.amount : "") + ".png";
    document.body.appendChild(a); a.click(); a.remove();
    toast("Đã tải mã QR về máy");
  });

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg, isErr) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast show" + (isErr ? " error" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "toast"; }, 2400);
  }

  /* ---------- Static text from config ---------- */
  document.querySelectorAll("[data-bank]").forEach(function (el) { el.textContent = C[el.dataset.bank]; });
  document.querySelectorAll("[data-bank-upper]").forEach(function (el) { el.textContent = C[el.dataset.bankUpper].toUpperCase(); });
  $("#year").textContent = new Date().getFullYear();

  render();
})();
