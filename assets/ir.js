// AxisCopic · o link curto (axiscopic.com/relatorio6) leva à página do produto, com o ?… e o #… que vierem.
// 25/10 — com o contador da Cloudflare na página, espera ela carregar para a visita contar; sem ele, vai na hora.
(function () {
  var alvo = document.documentElement.getAttribute("data-alvo");
  if (!alvo) return;
  var ir = function () { location.replace(alvo + location.search + location.hash); };
  if (document.querySelector("script[data-cf-beacon]")) {
    window.addEventListener("load", function () { setTimeout(ir, 350); });
  } else {
    ir();
  }
})();
