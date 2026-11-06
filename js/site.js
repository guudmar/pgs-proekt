// ПГС-Проект · сайт, вариант 2: разрез дома, счётчики, полоса света на слогане, заявка, появление блоков.
document.documentElement.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const once = (els, fn, opts = { threshold: 0.35 }) => {
  if (!("IntersectionObserver" in window)) return els.forEach(fn);
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); }
  }), opts);
  els.forEach((el) => io.observe(el));
};

// Услуги: выбранная услуга загорается на разрезе дома.
const items = [...document.querySelectorAll(".srv-item")];
const zones = [...document.querySelectorAll(".srv-house .zone")];
const pick = (zone) => {
  items.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.zone === zone)));
  zones.forEach((z) => z.classList.toggle("lit", z.dataset.zone === zone));
};
items.forEach((b) => {
  b.addEventListener("click", () => pick(b.dataset.zone));
  b.addEventListener("mouseenter", () => matchMedia("(hover: hover)").matches && pick(b.dataset.zone));
});
pick("structure");

// Счётчики: от нуля до значения, когда цифра попала в экран.
const counters = [...document.querySelectorAll("[data-count]")];
const run = (el) => {
  const end = Number(el.dataset.count);
  if (reduce) { el.textContent = String(end); return; }
  const t0 = performance.now();
  const dur = 1200;
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  };
  el.textContent = "0";
  requestAnimationFrame(tick);
};
once(counters, run, { threshold: 0.6 });

// Шкала 2100 + 4500: графитовая часть «доезжает» при появлении.
const bar = document.querySelector(".nm-bar");
if (bar && !reduce) {
  bar.style.setProperty("--bar", "0");
  once([bar], (el) => requestAnimationFrame(() => el.style.setProperty("--bar", "1")), { threshold: 0.5 });
}

// Слоган: жёлтая полоса проходит кадр и «включает свет», затем зачёркивается «пожары».
const slogan = document.querySelector(".slogan");
if (slogan) {
  if (reduce) {
    slogan.style.setProperty("--p", "1");
    slogan.classList.add("lit");
  } else {
    once([slogan], (el) => {
      const t0 = performance.now();
      const dur = 1300;
      const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.style.setProperty("--p", ease(k).toFixed(4));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      el.classList.add("lit");
    }, { threshold: 0.45 });
  }
}

// Ссылки «Обсудить проект» подставляют вид работ в заявку.
const type = document.getElementById("f-type");
document.querySelectorAll(".more[data-type]").forEach((a) => a.addEventListener("click", () => { if (type) type.value = a.dataset.type; }));

// Заявка: без сервера — собираем письмо с темой «ХОЧУ ПРОЕКТ» (как в буклете) и открываем почтовую программу.
const form = document.getElementById("lead");
const msg = document.getElementById("form-msg");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const tel = form.tel.value.trim();
  if (!name || !tel || !document.getElementById("f-ok").checked) {
    msg.className = "form-msg err";
    msg.textContent = !name ? "Укажите имя." : !tel ? "Укажите телефон, чтобы мы перезвонили." : "Отметьте согласие на обработку данных.";
    return;
  }
  const body = `Имя: ${name}\nТелефон: ${tel}\nВид работ: ${form.type.value}\nОб объекте: ${form.about.value.trim()}`;
  location.href = `mailto:pro@pgskr.ru?subject=${encodeURIComponent("ХОЧУ ПРОЕКТ")}&body=${encodeURIComponent(body)}`;
  msg.className = "form-msg";
  msg.textContent = "Открываем почтовую программу с готовым письмом. Если она не открылась — позвоните: +7 (863) 203-83-83.";
});

// Появление блоков: заголовок, текст, карточки — с шагом 80 мс.
const groups = [".sec-head > *", ".srv-house", ".srv-item", ".step", ".cl", ".fact", ".nm-big", ".nm-map", ".why-pic", ".why-body > *", ".ct-say", ".form", ".hero-text > *", ".hero-pic"];
const rv = [];
groups.forEach((sel) => document.querySelectorAll(sel).forEach((el, k) => {
  el.classList.add("rv");
  el.style.setProperty("--i", String(k % 5));
  rv.push(el);
}));
if (reduce) rv.forEach((el) => el.classList.add("in"));
else once(rv, (el) => el.classList.add("in"), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
