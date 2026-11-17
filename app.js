(function () {
  "use strict";

  var WA = "201154178640";
  var products = (window.STORE && window.STORE.products) || [];

  var GOVS = {
    ar: ["القاهرة","الجيزة","الإسكندرية","الدقهلية","البحر الأحمر","البحيرة","الفيوم","الغربية","الإسماعيلية","المنوفية","المنيا","القليوبية","الوادي الجديد","السويس","أسوان","أسيوط","بني سويف","بورسعيد","دمياط","الشرقية","جنوب سيناء","كفر الشيخ","مطروح","الأقصر","شمال سيناء","سوهاج","قنا"],
    en: ["Cairo","Giza","Alexandria","Dakahlia","Red Sea","Beheira","Fayoum","Gharbia","Ismailia","Menofia","Minya","Qalyubia","New Valley","Suez","Aswan","Assiut","Beni Suef","Port Said","Damietta","Sharqia","South Sinai","Kafr El Sheikh","Matrouh","Luxor","North Sinai","Sohag","Qena"]
  };

  var T = {
    ar: {
      size: "مقاس", made: "صناعة إيطالية", egp: "ج.م",
      add: "أضف للطلب", inCart: "في الطلب ✓",
      added: "اتضافت للطلب ✓", removed: "اتشالت من الطلب",
      photos: "صور", view: "مشاهدة الصورة",
      cats: { all: "الكل", shoes: "أحذية", jackets: "جاكيتات", tshirts: "تيشيرتات" },
      count: function (n) { return n + " قطع متاحة"; },
      pieces: function (n) { return n === 1 ? "قطعة واحدة" : n + " قطع"; },
      govPh: "اختار المحافظة",
      deliverTo: "التوصيل إلى",
      total: "الإجمالي",
      items: "القطع",
      shipping: "الشحن",
      shippingVal: "بيتحدد وقت التأكيد",
      emptyCart: "طلبك فاضي — اختار قطع الأول.",
      orderTitle: "طلب جديد — LUXUIRAEGY.COM",
      orderNo: "رقم الطلب",
      orderItems: "القطع",
      orderTotal: "الإجمالي",
      orderPay: "الدفع: عند الاستلام",
      fName: "الاسم", fPhone: "الموبايل", fGov: "المحافظة", fCity: "المنطقة", fAddr: "العنوان", fNote: "ملاحظات",
      year: "© " + new Date().getFullYear() + " LUXUIRAEGY.COM"
    },
    en: {
      size: "Size", made: "Made in Italy", egp: "EGP",
      add: "Add to order", inCart: "In order ✓",
      added: "Added to your order ✓", removed: "Removed from order",
      photos: "photos", view: "View photo",
      cats: { all: "All", shoes: "Shoes", jackets: "Jackets", tshirts: "T-shirts" },
      count: function (n) { return n + " pieces available"; },
      pieces: function (n) { return n === 1 ? "1 piece" : n + " pieces"; },
      govPh: "Choose a governorate",
      deliverTo: "Deliver to",
      total: "Total",
      items: "Items",
      shipping: "Shipping",
      shippingVal: "confirmed with you",
      emptyCart: "Your order is empty — pick some pieces first.",
      orderTitle: "New order — LUXUIRAEGY.COM",
      orderNo: "Order no.",
      orderItems: "Items",
      orderTotal: "Total",
      orderPay: "Payment: cash on delivery",
      fName: "Name", fPhone: "Phone", fGov: "Governorate", fCity: "Area", fAddr: "Address", fNote: "Notes",
      year: "© " + new Date().getFullYear() + " LUXUIRAEGY.COM"
    }
  };

  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  /* ── state ── */
  var lang = "en";
  try { lang = localStorage.getItem("luxuira-lang") === "ar" ? "ar" : "en"; } catch (e) {}

  var cart = [];
  try {
    var saved = JSON.parse(localStorage.getItem("luxuira-cart-v1") || "[]");
    if (Array.isArray(saved)) cart = saved.filter(function (id) {
      return products.some(function (p) { return p.id === id; });
    });
  } catch (e) {}

  var filter = "all";
  var lastOrderUrl = "";

  function persist() {
    try { localStorage.setItem("luxuira-cart-v1", JSON.stringify(cart)); } catch (e) {}
  }
  function product(id) {
    return products.find(function (p) { return p.id === id; });
  }
  function cartTotal() {
    return cart.reduce(function (sum, id) { return sum + product(id).price; }, 0);
  }

  /* ── language ── */
  function applyLang(next) {
    lang = next;
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar" ? "LUXUIRAEGY.COM — اطلب أونلاين" : "LUXUIRAEGY.COM — Order online";

    document.querySelectorAll("[data-ar]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang);
      if (v !== null) el.textContent = v;
    });
    document.querySelectorAll("[data-ar-ph]").forEach(function (el) {
      var v = el.getAttribute("data-" + lang + "-ph");
      if (v !== null) el.setAttribute("placeholder", v);
    });

    var btn = $("langBtn");
    btn.textContent = lang === "ar" ? "EN" : "ع";
    btn.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    $("cartBtn").setAttribute("aria-label", lang === "ar" ? "افتح الطلب" : "Open your order");
    $("drawer").setAttribute("aria-label", lang === "ar" ? "الطلب" : "Your order");
    document.querySelector(".btn-arrow").textContent = lang === "ar" ? "←" : "→";
    $("year").textContent = T[lang].year;

    try { localStorage.setItem("luxuira-lang", lang); } catch (e) {}
    buildStrip();
    renderFilters();
    renderGrid();
    renderCart();
    renderGovSelect();
    renderCheckout();
  }

  /* ── strip ── */
  function buildStrip() {
    var items = lang === "ar"
      ? ["الدفع عند الاستلام", "توصيل لكل المحافظات", "كل قطعة بمقاس واحد", "قطع ماركات مختارة"]
      : ["Cash on delivery", "All governorates", "One size per piece", "Curated designer pieces"];
    var group = items.map(function (s) { return "<span>" + s + " <i>✦</i></span>"; }).join("");
    $("stripIn").innerHTML = group + group + group + group;
  }

  /* ── filters + grid ── */
  function renderFilters() {
    var t = T[lang];
    var counts = { all: products.length };
    products.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var cats = ["all", "shoes", "jackets", "tshirts"];
    $("filters").innerHTML = cats.map(function (c) {
      return '<button class="chip-f' + (filter === c ? " on" : "") + '" type="button" data-cat="' + c + '">' +
        esc(t.cats[c]) + "<small>" + (counts[c] || 0) + "</small></button>";
    }).join("");
    $("prodCount").textContent = t.count(products.length);
  }

  function visibleProducts() {
    return filter === "all" ? products : products.filter(function (p) { return p.category === filter; });
  }

  function renderGrid() {
    var grid = $("grid");
    var t = T[lang];
    if (!products.length) {
      grid.hidden = true;
      $("gridEmpty").hidden = false;
      return;
    }
    grid.hidden = false;
    $("gridEmpty").hidden = true;
    grid.innerHTML = "";

    visibleProducts().forEach(function (p, i) {
      var idx = products.indexOf(p);
      var imgs = p.images || [];
      var inCart = cart.indexOf(p.id) !== -1;
      var note = lang === "ar" ? p.note_ar : p.note_en;

      var chips =
        '<span class="chip">' + t.size + " " + esc(p.size) + "</span>" +
        (p.madeInItaly ? '<span class="chip">' + t.made + "</span>" : "");

      var thumbs = imgs.map(function (src, j) {
        return '<button class="th' + (j === 0 ? " on" : "") + '" type="button" data-j="' + j + '" aria-label="' + esc(t.view) + " " + (j + 1) + '">' +
          '<img src="' + esc(src) + '" alt="" loading="lazy"></button>';
      }).join("");

      var card = document.createElement("article");
      card.className = "item reveal";
      card.dataset.i = idx;
      card.style.transitionDelay = Math.min(i, 8) * 45 + "ms";
      card.innerHTML =
        '<button class="item-fig" type="button" data-j="0" aria-label="' + esc(t.view) + '">' +
          '<span class="tag">' + esc(t.cats[p.category] || p.category) + "</span>" +
          (imgs.length > 1 ? '<span class="shot-n">' + imgs.length + " " + t.photos + "</span>" : "") +
          '<img src="' + esc(imgs[0] || "") + '" alt="' + esc(p.name) + '" loading="lazy">' +
        "</button>" +
        '<div class="thumbs"' + (imgs.length > 1 ? "" : " hidden") + ">" + thumbs + "</div>" +
        '<div class="item-body">' +
          '<p class="item-brand">' + esc(p.brand) + "</p>" +
          '<h3 class="item-name">' + esc(p.name) + "</h3>" +
          '<div class="item-meta">' + chips + "</div>" +
          (note ? '<p class="item-note">' + esc(note) + "</p>" : "") +
          '<div class="item-foot">' +
            '<span class="price" dir="ltr">' + fmt(p.price) + "<small>" + t.egp + "</small></span>" +
            '<button class="add' + (inCart ? " in" : "") + '" type="button" data-id="' + esc(p.id) + '">' +
              (inCart ? t.inCart : t.add) +
            "</button>" +
          "</div>" +
        "</div>";
      grid.appendChild(card);
    });
    observe();
  }

  function showShot(card, j) {
    var p = products[+card.dataset.i];
    card.querySelector(".item-fig img").src = p.images[j];
    card.querySelector(".item-fig").dataset.j = j;
    card.querySelectorAll(".th").forEach(function (th) {
      th.classList.toggle("on", +th.dataset.j === j);
    });
  }

  /* ── cart ── */
  function toggleCart(id) {
    var i = cart.indexOf(id);
    if (i === -1) {
      cart.push(id);
      toast(T[lang].added);
    } else {
      cart.splice(i, 1);
      toast(T[lang].removed);
    }
    persist();
    syncCartUI();
    var n = $("cartN");
    n.classList.remove("bump");
    void n.offsetWidth;
    n.classList.add("bump");
  }

  function syncCartUI() {
    $("cartN").textContent = cart.length;
    document.querySelectorAll(".add").forEach(function (btn) {
      var inCart = cart.indexOf(btn.dataset.id) !== -1;
      btn.classList.toggle("in", inCart);
      btn.textContent = inCart ? T[lang].inCart : T[lang].add;
    });
    renderCart();
    renderCheckout();
  }

  function lineItem(p, withRemove) {
    var t = T[lang];
    return '<div class="co-item">' +
      '<img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '">' +
      '<div class="co-info"><h3>' + esc(p.name) + "</h3>" +
      "<p>" + t.size + " " + esc(p.size) + " · " + esc(p.brand) + "</p></div>" +
      '<span class="co-price" dir="ltr">' + fmt(p.price) + " " + t.egp + "</span>" +
      (withRemove ? '<button class="co-x" type="button" data-id="' + esc(p.id) + '" aria-label="' + (lang === "ar" ? "شيل من الطلب" : "Remove") + '">&times;</button>' : "") +
    "</div>";
  }

  function renderCart() {
    var t = T[lang];
    var body = $("drawerBody");
    var empty = $("drawerEmpty");
    var foot = $("drawerFoot");
    $("cartN").textContent = cart.length;
    $("drawerN").textContent = cart.length ? "(" + cart.length + ")" : "";
    if (!cart.length) {
      body.hidden = true;
      foot.hidden = true;
      empty.hidden = false;
      body.innerHTML = "";
      return;
    }
    body.hidden = false;
    foot.hidden = false;
    empty.hidden = true;
    body.innerHTML = cart.map(function (id) { return lineItem(product(id), true); }).join("");
    $("cartTotal").textContent = fmt(cartTotal()) + " " + t.egp;
  }

  /* ── drawer ── */
  var drawerOpen = false;
  function openDrawer() {
    drawerOpen = true;
    $("drawer").inert = false;
    $("overlay").hidden = false;
    requestAnimationFrame(function () { $("overlay").classList.add("on"); });
    $("drawer").classList.add("on");
    document.body.classList.add("locked");
    $("drawerX").focus();
  }
  function closeDrawer() {
    drawerOpen = false;
    $("drawer").inert = true;
    $("overlay").classList.remove("on");
    setTimeout(function () { if (!drawerOpen) $("overlay").hidden = true; }, 300);
    $("drawer").classList.remove("on");
    document.body.classList.remove("locked");
  }

  /* ── views ── */
  function showCheckout() {
    closeDrawer();
    $("shopView").hidden = true;
    $("checkoutView").hidden = false;
    $("orderSuccess").hidden = true;
    $("stepsWrap").hidden = false;
    $("checkoutHead").hidden = false;
    renderCheckout();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function showShop(scrollTo) {
    $("checkoutView").hidden = true;
    $("shopView").hidden = false;
    if (scrollTo) {
      var el = $(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ── checkout ── */
  function renderGovSelect() {
    var sel = $("cGov");
    var cur = sel.value;
    var names = GOVS[lang];
    sel.innerHTML = '<option value="">' + esc(T[lang].govPh) + "</option>" +
      names.map(function (g, i) {
        return '<option value="' + esc(GOVS.ar[i]) + '">' + esc(g) + "</option>";
      }).join("");
    sel.value = cur;
  }

  function govLabel(v) {
    var i = GOVS.ar.indexOf(v);
    return i === -1 ? v : GOVS[lang][i];
  }

  function normalizePhone(v) {
    var n = v.replace(/\D/g, "");
    if (n.indexOf("0020") === 0) n = n.slice(4);
    else if (n.indexOf("20") === 0 && n.length === 12) n = n.slice(2);
    if (n.length === 10 && n.indexOf("1") === 0) n = "0" + n;
    return n;
  }
  function phoneOk(v) { return /^01[0125][0-9]{8}$/.test(normalizePhone(v)); }

  function setErr(inputId, errId, bad) {
    $(errId).hidden = !bad;
    $(inputId).closest(".field").classList.toggle("bad", bad);
    return !bad;
  }
  function validStep2(show) {
    var name = $("cName").value.trim();
    var okName = name.length >= 2;
    var okPhone = phoneOk($("cPhone").value);
    if (show) {
      setErr("cName", "errName", !okName);
      setErr("cPhone", "errPhone", !okPhone);
    }
    return okName && okPhone;
  }
  function validStep3(show) {
    var okGov = $("cGov").value !== "";
    var okCity = $("cCity").value.trim().length >= 2;
    var okAddr = $("cAddr").value.trim().length >= 6;
    if (show) {
      setErr("cGov", "errGov", !okGov);
      setErr("cCity", "errCity", !okCity);
      setErr("cAddr", "errAddr", !okAddr);
    }
    return okGov && okCity && okAddr;
  }

  function renderCheckout() {
    var t = T[lang];
    var wrap = $("stepsWrap");
    wrap.classList.toggle("empty", !cart.length);
    $("coEmpty").hidden = cart.length > 0;
    $("coItems").innerHTML = cart.map(function (id) { return lineItem(product(id), true); }).join("");
    $("step1Count").textContent = cart.length ? t.pieces(cart.length) : "";
    $("step1").classList.toggle("done", cart.length > 0);

    var html = "";
    cart.forEach(function (id) {
      var p = product(id);
      html += '<div class="sum-row"><span>' + esc(p.name) + " · " + t.size + " " + esc(p.size) + "</span>" +
        '<b dir="ltr">' + fmt(p.price) + " " + t.egp + "</b></div>";
    });
    html += '<div class="sum-row"><span>' + t.shipping + "</span><b>" + t.shippingVal + "</b></div>";
    html += '<div class="sum-row sum-total"><span>' + t.total + "</span>" +
      '<b dir="ltr">' + fmt(cartTotal()) + " " + t.egp + "</b></div>";

    var name = $("cName").value.trim();
    if (name || $("cGov").value) {
      var addr = [name, $("cPhone").value.trim(), govLabel($("cGov").value), $("cCity").value.trim(), $("cAddr").value.trim()]
        .filter(Boolean).join(" — ");
      html += '<div class="sum-addr"><b>' + t.deliverTo + ":</b> " + esc(addr) + "</div>";
    }
    $("coSummary").innerHTML = html;
    updateStepStates();
  }

  function updateStepStates() {
    $("step2").classList.toggle("done", validStep2(false));
    $("step3").classList.toggle("done", validStep3(false));
  }

  function buildOrderMessage(orderNo) {
    var t = T[lang];
    var lines = [t.orderTitle, t.orderNo + ": " + orderNo, "", t.orderItems + " (" + cart.length + "):"];
    cart.forEach(function (id, i) {
      var p = product(id);
      lines.push((i + 1) + ") " + p.name + " — " + t.size + " " + p.size + " — " + fmt(p.price) + " " + t.egp);
    });
    lines.push("", t.orderTotal + ": " + fmt(cartTotal()) + " " + t.egp, t.orderPay, "");
    lines.push(t.fName + ": " + $("cName").value.trim());
    lines.push(t.fPhone + ": " + normalizePhone($("cPhone").value));
    lines.push(t.fGov + ": " + govLabel($("cGov").value));
    lines.push(t.fCity + ": " + $("cCity").value.trim());
    lines.push(t.fAddr + ": " + $("cAddr").value.trim());
    var note = $("cNote").value.trim();
    if (note) lines.push(t.fNote + ": " + note);
    return lines.join("\n");
  }

  function placeOrder() {
    var t = T[lang];
    if (!cart.length) { toast(t.emptyCart); return; }

    var ok2 = validStep2(true);
    var ok3 = validStep3(true);
    if (!ok2 || !ok3) {
      var step = !ok2 ? $("step2") : $("step3");
      step.scrollIntoView({ behavior: "smooth", block: "center" });
      var firstBad = step.querySelector(".field.bad input, .field.bad select, .field.bad textarea");
      if (firstBad) setTimeout(function () { firstBad.focus({ preventScroll: true }); }, 350);
      return;
    }

    var orderNo = "LX-" + String(Date.now()).slice(-6);
    lastOrderUrl = "https://wa.me/" + WA + "?text=" + encodeURIComponent(buildOrderMessage(orderNo));
    window.open(lastOrderUrl, "_blank", "noopener");

    $("orderNo").textContent = orderNo;
    $("waAgain").href = lastOrderUrl;
    $("stepsWrap").hidden = true;
    $("checkoutHead").hidden = true;
    $("orderSuccess").hidden = false;
    cart = [];
    persist();
    syncCartUI();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ── lightbox ── */
  var lb = { i: 0, j: 0, from: null };
  function lbOpen(i, j, trigger) {
    lb.i = i; lb.j = j; lb.from = trigger;
    lbPaint();
    $("lb").inert = false;
    $("lb").classList.add("on");
    document.body.classList.add("locked");
    $("lbX").focus();
  }
  function lbClose() {
    $("lb").classList.remove("on");
    $("lb").inert = true;
    if (!drawerOpen) document.body.classList.remove("locked");
    if (lb.from) lb.from.focus();
  }
  function lbStep(dir) {
    var n = products[lb.i].images.length;
    lb.j = (lb.j + dir + n) % n;
    lbPaint();
  }
  function lbPaint() {
    var p = products[lb.i];
    $("lbImg").src = p.images[lb.j];
    $("lbImg").alt = p.name;
    $("lbCap").textContent = p.name + " · " + (lb.j + 1) + " / " + p.images.length;
    $("lbRow").style.visibility = p.images.length > 1 ? "visible" : "hidden";
  }

  /* ── toast ── */
  var toastTimer;
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("on"); }, 2200);
  }

  /* ── reveal ── */
  var seen;
  function observe() {
    if (!seen) return;
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { seen.observe(el); });
  }
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); seen.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    observe();
  }

  /* ── events ── */
  function wire() {
    $("langBtn").addEventListener("click", function () { applyLang(lang === "ar" ? "en" : "ar"); });
    $("cartBtn").addEventListener("click", openDrawer);
    $("heroCart").addEventListener("click", openDrawer);
    $("drawerX").addEventListener("click", closeDrawer);
    $("overlay").addEventListener("click", closeDrawer);
    $("drawerShop").addEventListener("click", function () { closeDrawer(); showShop("products"); });
    $("checkoutBtn").addEventListener("click", showCheckout);
    $("backToShop").addEventListener("click", function () { showShop(); });
    $("emptyBack").addEventListener("click", function () { showShop("products"); });
    $("successBack").addEventListener("click", function () { showShop("products"); });
    $("placeOrder").addEventListener("click", placeOrder);

    $("filters").addEventListener("click", function (e) {
      var btn = e.target.closest(".chip-f");
      if (!btn) return;
      filter = btn.dataset.cat;
      renderFilters();
      renderGrid();
    });

    $("grid").addEventListener("click", function (e) {
      var add = e.target.closest(".add");
      if (add) { toggleCart(add.dataset.id); return; }
      var th = e.target.closest(".th");
      if (th) { showShot(th.closest(".item"), +th.dataset.j); return; }
      var fig = e.target.closest(".item-fig");
      if (fig) lbOpen(+fig.closest(".item").dataset.i, +fig.dataset.j, fig);
    });

    $("drawerBody").addEventListener("click", function (e) {
      var x = e.target.closest(".co-x");
      if (x) toggleCart(x.dataset.id);
    });
    $("coItems").addEventListener("click", function (e) {
      var x = e.target.closest(".co-x");
      if (x) toggleCart(x.dataset.id);
    });

    ["cName", "cPhone", "cCity", "cAddr", "cNote"].forEach(function (id) {
      $(id).addEventListener("input", function () {
        var f = $(id).closest(".field");
        if (f.classList.contains("bad")) {
          f.classList.remove("bad");
          var err = f.querySelector(".err");
          if (err) err.hidden = true;
        }
        renderCheckout();
      });
    });
    $("cGov").addEventListener("change", function () {
      setErr("cGov", "errGov", false);
      renderCheckout();
    });

    $("lbX").addEventListener("click", lbClose);
    $("lbPrev").addEventListener("click", function () { lbStep(-1); });
    $("lbNext").addEventListener("click", function () { lbStep(1); });
    $("lb").addEventListener("click", function (e) { if (e.target === $("lb")) lbClose(); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if ($("lb").classList.contains("on")) lbClose();
        else if (drawerOpen) closeDrawer();
        $("nav").classList.remove("open");
        $("burger").setAttribute("aria-expanded", "false");
      }
      if ($("lb").classList.contains("on")) {
        if (e.key === "ArrowRight") lbStep(lang === "ar" ? -1 : 1);
        if (e.key === "ArrowLeft") lbStep(lang === "ar" ? 1 : -1);
      }
    });

    var burger = $("burger");
    burger.addEventListener("click", function () {
      var open = $("nav").classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a, .mark").forEach(function (a) {
      a.addEventListener("click", function (e) {
        $("nav").classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        if (!$("checkoutView").hidden) {
          e.preventDefault();
          var id = a.getAttribute("href").slice(1);
          showShop(id === "top" ? null : id);
        }
      });
    });

    var head = $("masthead");
    var onScroll = function () { head.classList.toggle("tight", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── boot ── */
  $("drawer").inert = true;
  $("lb").inert = true;
  document.querySelectorAll(".how-grid li, .hero-fig, .checkout-head").forEach(function (el) {
    el.classList.add("reveal");
  });
  wire();
  applyLang(lang);
  initReveal();
})();