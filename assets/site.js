// AxisCopic · axiscopic.com — comportamento comum às páginas PT e EN.
// O modo vem do site.json (gerado por `eixo site --gerar`): <html data-modo="amostra|publicado">.
// Formulário com action (o formulário público do Kit) envia de verdade; sem action, avisa e não envia.
(function () {
  var AMOSTRA = document.documentElement.dataset.modo !== "publicado";
  var EN = document.documentElement.lang === "en";
  var T = EN
    ? { invalido: "Check the e-mail address and try again.",
        amostra: "Sample page: the Kit form plugs in here (list «{l}»). Nothing was sent." }
    : { invalido: "Confira o e-mail e tente de novo.",
        amostra: "Página de amostra: aqui entra o formulário do Kit (lista «{l}»). Nada foi enviado." };

  document.querySelectorAll("form[data-lista]").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      // 18/10 — o campo-isca: invisível para gente, preenchido por robô. Robô não entra na lista (e não sabe disso)
      var isca = f.querySelector("input.hp");
      if (isca && isca.value) { ev.preventDefault(); return; }
      var campo = f.querySelector("input[type=email]");
      var retorno = f.querySelector(".retorno");
      var ok = campo && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim());
      if (!ok) {
        ev.preventDefault();
        retorno.textContent = T.invalido;
        campo && campo.focus();
        return;
      }
      if (!f.getAttribute("action")) {
        ev.preventDefault();
        retorno.textContent = T.amostra.replace("{l}", f.dataset.lista);
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("vista"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".revela").forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll(".revela").forEach(function (el) { el.classList.add("vista"); });
  }

  // AMOSTRA: o checkout da Hotmart e o número do WhatsApp ainda não existem
  document.querySelectorAll("[data-checkout],[data-whatsapp]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      if (a.getAttribute("href") && a.getAttribute("href") !== "#") return;
      ev.preventDefault();
      var t = document.querySelector(".aviso-amostra") || document.body.appendChild(Object.assign(document.createElement("p"), { className: "aviso-amostra", role: "status" }));
      t.textContent = a.dataset.checkout
        ? (EN ? "Sample: the checkout link goes here. Nothing was charged." : "Amostra: aqui entra o link do checkout da Hotmart. Nada foi cobrado.")
        : "Amostra: aqui entra o número do WhatsApp comercial.";
      t.classList.add("vista");
      clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("vista"); }, 3600);
    });
  });

  // a barra fixa só aparece quando o botão da abertura sai da tela
  var barra = document.querySelector(".barra-fixa"), alvo = document.querySelector(".hero .botao");
  if (barra && alvo) {
    var conferir = function () { barra.classList.toggle("escondida", alvo.getBoundingClientRect().bottom > 0); };
    window.addEventListener("scroll", conferir, { passive: true });
    conferir();
  }

  var ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();
})();
