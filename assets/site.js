// AxisCopic · axiscopic.com — comportamento comum às páginas PT e EN.
// O modo vem do site.json (gerado por `eixo site --gerar`): <html data-modo="amostra|publicado">.
// Formulário com action (o formulário público do Kit) envia de verdade; sem action, avisa e não envia.
(function () {
  var AMOSTRA = document.documentElement.dataset.modo !== "publicado";
  var EN = document.documentElement.lang === "en";
  var T = EN
    ? { invalido: "Check the e-mail address and try again.",
        amostra: "Sample page: the Kit form plugs in here (list «{l}»). Nothing was sent.",
        enviando: "Sending…",
        ok: "Done. We sent an e-mail to {e}. Open it and confirm: the PDF arrives right after.",
        dica: "Not there in 2 minutes? Check spam, junk or the Promotions tab." }
    : { invalido: "Confira o e-mail e tente de novo.",
        amostra: "Página de amostra: aqui entra o formulário do Kit (lista «{l}»). Nada foi enviado.",
        enviando: "Enviando…",
        ok: "Pronto. Enviamos um e-mail para {e}. Abra e confirme: o PDF chega logo em seguida.",
        dica: "Não chegou em 2 minutos? Olhe no lixo eletrônico, no spam ou na aba Promoções." };

  // 23/10 — O KIT NÃO RESPONDE AO FORMULÁRIO COMUM: devolve 302 para a mesma página, e quem deixou o e-mail não via
  // NADA (Daniel: «carrega rápido mas não mostra se será enviado»; a confirmação estava no lixo eletrônico). Pedido
  // com Accept JSON, o Kit responde na hora ({status, errors}) e libera CORS — então o envio vira fetch e a resposta
  // vira mensagem na página. Qualquer outra coisa (rede, captcha do Kit, navegador antigo) cai no envio comum, inteiro.
  function enviar(f, campo, retorno) {
    var botao = f.querySelector("button[type=submit]");
    var rotulo = botao ? botao.textContent : "";
    var comum = function () { HTMLFormElement.prototype.submit.call(f); };
    var volta = function () { if (botao) { botao.disabled = false; botao.textContent = rotulo; } };
    if (botao) { botao.disabled = true; botao.textContent = T.enviando; }
    retorno.className = "retorno";
    retorno.textContent = "";
    var corte = window.AbortController ? new AbortController() : null;
    var relogio = setTimeout(function () { if (corte) corte.abort(); }, 10000);
    fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" },
                      signal: corte ? corte.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        clearTimeout(relogio);
        if (d && d.status === "success") {
          f.classList.add("enviado");
          retorno.className = "retorno ok";
          var a = document.createElement("strong");
          a.textContent = T.ok.replace("{e}", campo.value.trim());
          var b = document.createElement("span");
          b.textContent = T.dica;
          retorno.appendChild(a);
          retorno.appendChild(b);
          return;
        }
        if (d && d.status === "failed") {
          volta();
          retorno.textContent = T.invalido;
          campo.focus();
          return;
        }
        comum();
      })
      .catch(function () { clearTimeout(relogio); comum(); });
  }

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
        return;
      }
      if (!window.fetch || !window.FormData) return;
      ev.preventDefault();
      enviar(f, campo, retorno);
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
