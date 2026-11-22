// Викторина: главная, 10 бесплатных вопросов, итог. Устройство: docs/ARCHITECTURE.md
(function () {
  "use strict";
  var BESPLATNO = 10;
  var $ = function (id) { return document.getElementById(id); };
  var vse = [], nabor = [], nomer = 0, verno = 0;

  // На сайт идут только проверенные вопросы. ?proverka=1 показывает все: для работы.
  var proverka = /[?&]proverka=1/.test(location.search);

  function pokazat(id) {
    ["glavnaya", "vopros", "itog"].forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
  }

  function peremeshat(m) {
    var a = m.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Бесплатный набор: поровну из каждой темы, всего 10.
  function sobratNabor() {
    var poTemam = {};
    vse.forEach(function (q) { (poTemam[q.tema] = poTemam[q.tema] || []).push(q); });
    var temy = Object.keys(poTemam), itog = [], i = 0;
    while (itog.length < BESPLATNO && temy.some(function (t) { return poTemam[t][i]; })) {
      temy.forEach(function (t) { if (poTemam[t][i] && itog.length < BESPLATNO) itog.push(poTemam[t][i]); });
      i++;
    }
    return itog;
  }

  function temyNaGlavnoy() {
    var temy = [];
    vse.forEach(function (q) { if (temy.indexOf(q.tema) < 0) temy.push(q.tema); });
    $("temy").innerHTML = "";
    temy.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; $("temy").appendChild(li); });
  }

  function vopros() {
    var q = nabor[nomer];
    $("schet").textContent = "Вопрос " + (nomer + 1) + " из " + nabor.length;
    $("polosa").style.width = (nomer / nabor.length * 100) + "%";
    $("tema-voprosa").textContent = q.tema;
    $("tekst-voprosa").textContent = q.vopros;
    $("razbor").hidden = true;
    $("dalee").hidden = true;
    var box = $("otvety");
    box.innerHTML = "";
    peremeshat(q.otvety.map(function (t, i) { return { t: t, i: i }; })).forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "otvet";
      b.textContent = o.t;
      b.dataset.i = o.i;
      b.addEventListener("click", function () { otvetit(b, o.i === q.verno); });
      box.appendChild(b);
    });
    var k = $("kartochka");
    k.classList.remove("vhod"); void k.offsetWidth; k.classList.add("vhod");
  }

  function metka(b, slovo) {
    var s = document.createElement("span");
    s.className = "metka";
    s.textContent = slovo;
    b.appendChild(s);
  }

  function otvetit(b, pravilno) {
    var q = nabor[nomer];
    Array.prototype.forEach.call($("otvety").children, function (x) {
      x.disabled = true;
      if (+x.dataset.i === q.verno) { x.classList.add("verno"); metka(x, "✓ Верно"); }
    });
    if (pravilno) verno++;
    else { b.classList.add("neverno"); metka(b, "✗ Неверно"); }
    $("poyasnenie").textContent = q.poyasnenie;
    $("istochnik").textContent = "Источник: " + q.istochnik;
    $("razbor").hidden = false;
    $("dalee").textContent = nomer + 1 < nabor.length ? "Дальше" : "Узнать итог";
    $("dalee").hidden = false;
  }

  function itog() {
    $("itog-chislo").textContent = verno + " из " + nabor.length;
    $("itog-tekst").textContent = verno >= 8 ? "Отличный результат. Проверьте себя на всех темах."
      : verno >= 5 ? "Хорошая основа. В полном доступе есть пояснения ко всем темам."
      : "Есть что повторить. Пояснения и источники помогут запомнить.";
    $("kupit-tekst").hidden = true;
    pokazat("itog");
  }

  function start() {
    nabor = sobratNabor(); nomer = 0; verno = 0;
    if (!nabor.length) { alert("Вопросы ещё на проверке."); return; }
    pokazat("vopros");
    vopros();
  }

  $("start").addEventListener("click", start);
  $("snova").addEventListener("click", start);
  $("domoy").addEventListener("click", function () { pokazat("glavnaya"); });
  $("dalee").addEventListener("click", function () {
    nomer++;
    if (nomer < nabor.length) { vopros(); window.scrollTo(0, 0); } else itog();
  });
  $("kupit").addEventListener("click", function () { $("kupit-tekst").hidden = false; });
  $("tema").addEventListener("click", function () {
    var t = document.documentElement.dataset.theme === "izumrud" ? "biryuza" : "izumrud";
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]').content = t === "izumrud" ? "#0C3B2E" : "#0A7C86";
    // Имя с приставкой проекта: хранилище браузера общее у всех сайтов на xasi88.github.io.
    try { localStorage.setItem("viktorina-tema", t); } catch (e) {}
  });

  fetch("data/voprosy.json").then(function (r) { return r.json(); }).then(function (d) {
    vse = d.filter(function (q) { return q.provereno || proverka; });
    temyNaGlavnoy();
  });
})();
