/* ==========================================================================
   YP Cloud / DaVez — comportamento do site
   Sem dependências. Tudo degrada graciosamente se o JS não carregar.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Índice no celular: o rail vira um cabeçalho com menu
     ------------------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var rail = document.querySelector('.rail');
    if (!toggle || !rail) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      rail.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    rail.addEventListener('click', function (e) {
      if (e.target.closest('.index a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     Índice: destaca a seção que está sendo lida.
     Feito na posição de scroll, não com IntersectionObserver: é
     determinístico e não depende do observer estar ativo.
     ------------------------------------------------------------------ */
  function initIndex() {
    var links = [].slice.call(document.querySelectorAll('.index a[href^="#"]'));
    if (!links.length) return;

    var secoes = [];
    links.forEach(function (a) {
      var alvo = document.getElementById(a.getAttribute('href').slice(1));
      if (alvo) secoes.push({ link: a, alvo: alvo });
    });
    if (!secoes.length) return;

    var atual = null;
    var ultimaMedicao = 0;

    function medir() {
      ultimaMedicao = Date.now();

      // A seção lida é a última cujo topo já passou de um quarto da tela.
      var linha = window.innerHeight * 0.25;
      var ativa = secoes[0];

      secoes.forEach(function (s) {
        if (s.alvo.getBoundingClientRect().top <= linha) ativa = s;
      });

      if (ativa === atual) return;
      if (atual) atual.link.classList.remove('is-current');
      ativa.link.classList.add('is-current');
      atual = ativa;
    }

    // Throttle por tempo, não por requestAnimationFrame: um quadro que nunca
    // chega deixaria o índice congelado para sempre.
    function agendar() {
      if (Date.now() - ultimaMedicao < 80) return;
      medir();
    }

    medir();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
  }

  /* ------------------------------------------------------------------
     Revelação no scroll
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = [].slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    function revelarTudo() {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revelarTudo();
      return;
    }

    // Só a partir daqui o CSS pode esconder: se algo abaixo falhar, o
    // conteúdo já ficou visível.
    document.documentElement.classList.add('js');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(function () { entry.target.classList.add('is-in'); }, delay);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });

    // Rede de segurança: se o observer não reportar nada — acontece em
    // alguns navegadores embutidos — nada pode ficar invisível.
    setTimeout(function () {
      if (!document.querySelector('.reveal.is-in')) revelarTudo();
    }, 1200);
  }

  /* ------------------------------------------------------------------
     Formulário de contato
     Sem back-end configurado, monta um e-mail com os campos preenchidos.
     Para enviar de verdade, coloque a URL do serviço em data-endpoint.
     ------------------------------------------------------------------ */
  function initForm() {
    var form = document.querySelector('.form');
    if (!form) return;

    var status = form.querySelector('.form__status');

    function say(message, isError) {
      if (!status) return;
      status.textContent = message;
      status.classList.add('is-visible');
      status.classList.toggle('is-error', !!isError);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var endpoint = form.dataset.endpoint;

      if (endpoint) {
        say('Enviando…');
        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Falha no envio');
            form.reset();
            say('Recebemos sua mensagem. Respondemos em até um dia útil.');
          })
          .catch(function () {
            say('Não conseguimos enviar agora. Escreva direto para contato@ypcloud.com.br.', true);
          });
        return;
      }

      var corpo = [
        'Nome: ' + (data.get('nome') || ''),
        'Empresa: ' + (data.get('negocio') || ''),
        'Contato: ' + (data.get('email') || ''),
        'Assunto: ' + (data.get('assunto') || ''),
        '',
        data.get('mensagem') || ''
      ].join('\n');

      window.location.href =
        'mailto:contato@ypcloud.com.br' +
        '?subject=' + encodeURIComponent('Contato pelo site — ' + (data.get('negocio') || data.get('nome') || '')) +
        '&body=' + encodeURIComponent(corpo);

      say('Abrimos seu programa de e-mail com a mensagem pronta. É só enviar.');
    });
  }

  /* ------------------------------------------------------------------
     Ano no rodapé
     ------------------------------------------------------------------ */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });
  }

  /* ------------------------------------------------------------------
     Impressão: as perguntas saem todas abertas, e voltam ao estado
     original depois. CSS não consegue abrir um <details>.
     ------------------------------------------------------------------ */
  function initPrint() {
    var perguntas = [].slice.call(document.querySelectorAll('.faq details'));
    if (!perguntas.length) return;

    var estavamAbertas = [];

    window.addEventListener('beforeprint', function () {
      estavamAbertas = perguntas.map(function (d) { return d.open; });
      perguntas.forEach(function (d) { d.open = true; });
    });

    window.addEventListener('afterprint', function () {
      perguntas.forEach(function (d, i) { d.open = estavamAbertas[i]; });
    });
  }


  /* ------------------------------------------------------------------
     Hero de vídeo com rolagem travada.

     A rolagem move o vídeo, não a página. A trava tem válvula de escape
     nos dois sentidos: chegando ao fim e continuando a empurrar, a página
     é liberada — e volta a travar se a pessoa retornar ao hero. O teclado
     também controla, e End sai direto. Com movimento reduzido nada é
     travado. Se o vídeo não carregar, a arte final entra no lugar.
     ------------------------------------------------------------------ */
  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;

    var video = hero.querySelector('.hero__video');
    var arte = hero.querySelector('.hero__arte');
    var cortina = hero.querySelector('.hero__cortina');
    var titulo = hero.querySelector('.hero__titulo');
    var frase = hero.querySelector('.hero__frase');
    var aviso = hero.querySelector('.hero__aviso');
    var barra = hero.querySelector('.hero__barra i');

    var distancia = parseInt(hero.dataset.distancia || '3200', 10);
    var saida = parseInt(hero.dataset.saida || '240', 10);

    var travado = false;
    var yTravado = 0;

    // O site usa scroll-behavior: smooth. Reposicionar o hero com ele
    // ligado vira uma animação, e o re-lock dispara no meio dela e puxa
    // a página de volta ao topo. Aqui o salto precisa ser instantâneo.
    function rolarDireto(y) {
      try {
        window.scrollTo({ top: y, left: 0, behavior: 'instant' });
      } catch (e) {
        var raiz = document.documentElement.style;
        var antes = raiz.scrollBehavior;
        raiz.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        raiz.scrollBehavior = antes;
      }
    }

    function travar() {
      if (travado) return;
      travado = true;
      excedente = 0;
      yTravado = window.scrollY;
      var b = document.body.style;
      b.position = 'fixed';
      b.top = '-' + yTravado + 'px';
      b.left = '0';
      b.right = '0';
      b.width = '100%';
    }

    function soltar(paraY) {
      if (!travado) return;
      travado = false;
      excedente = 0;
      var b = document.body.style;
      b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
      // Enquanto o body esteve fixo o documento tinha a altura da tela.
      // Sem forçar o recálculo aqui, um scrollTo para além dela é cortado
      // e a página fica presa no topo mesmo destravada.
      void document.body.offsetHeight;
      rolarDireto(paraY === undefined ? yTravado : paraY);
    }

    /** Estado final estático: sem movimento e quando o vídeo falha. */
    function mostrarFinal() {
      hero.classList.add('is-pronto');
      if (titulo) titulo.style.opacity = '0';
      if (aviso) aviso.style.opacity = '0';
      if (frase) {
        frase.style.opacity = '1';
        frase.style.filter = 'none';
        frase.style.transform = 'none';
      }
      if (arte) arte.style.opacity = '1';
      if (cortina) cortina.style.opacity = '1';
      if (barra) barra.style.transform = 'scaleX(1)';
    }

    if (reduceMotion) {
      mostrarFinal();
      return;
    }

    // Sem vídeo utilizável a cena não tem o que percorrer: mostra o fim e
    // libera a página. Vale para erro de rede e para onde o arquivo não
    // esteja disponível.
    var falhou = false;
    video.addEventListener('error', function () {
      if (falhou) return;
      falhou = true;
      // O loop precisa parar antes: ele repinta a cada quadro e desfaria
      // o estado final aplicado logo abaixo.
      cancelAnimationFrame(raf);
      mostrarFinal();
      soltar();
    });

    var duracao = 0;
    var raf = 0;
    var alvo = 0;
    var atual = 0;
    var comecou = false;
    var buscando = false;
    var pendente = null;
    var toqueY = 0;
    var excedente = 0;
    var podeTravarEm = 0;

    function aoCarregar() {
      duracao = video.duration || 0;
      hero.classList.add('is-pronto');
    }
    video.addEventListener('loadeddata', aoCarregar);
    // Em visita repetida o vídeo já está pronto antes deste código rodar.
    if (video.readyState >= 2) aoCarregar();

    video.addEventListener('seeked', function () {
      buscando = false;
      if (pendente !== null) {
        var t = pendente;
        pendente = null;
        buscando = true;
        video.currentTime = t;
      }
    });

    function buscar(t) {
      if (buscando) { pendente = t; return; }
      buscando = true;
      video.currentTime = t;
    }

    function soltarAdiante() {
      soltar(hero.offsetTop + hero.offsetHeight);
      podeTravarEm = Date.now() + 500;
    }
    function soltarAtras() {
      soltar(Math.max(0, hero.offsetTop - 1));
      podeTravarEm = Date.now() + 500;
    }

    travar();

    /** Move o vídeo. true = a trava segura o gesto; false = é da página. */
    function mover(delta) {
      if (!travado) return false;

      var noFim = alvo >= 0.999;
      var noComeco = alvo <= 0.001;

      if (noFim && delta > 0) {
        excedente += delta;
        if (excedente >= saida) { soltarAdiante(); return false; }
        return true;
      }
      if (noComeco && delta < 0) {
        excedente += delta;
        if (excedente <= -saida) { soltarAtras(); return false; }
        return true;
      }

      excedente = 0;
      alvo = Math.min(1, Math.max(0, alvo + delta / Math.max(distancia, 1)));
      if (alvo > 0.001) comecou = true;
      return true;
    }

    function aoRoda(e) { if (mover(e.deltaY)) e.preventDefault(); }
    function aoTocar(e) { toqueY = e.touches[0] ? e.touches[0].clientY : 0; }
    function aoArrastar(e) {
      var y = e.touches[0] ? e.touches[0].clientY : toqueY;
      var delta = toqueY - y;
      toqueY = y;
      if (mover(delta)) e.preventDefault();
    }

    // Sem teclado, quem navega por tabulação fica preso: com o body fixo
    // as teclas de rolagem não fazem nada. End é a saída garantida.
    function aoTeclar(e) {
      if (!travado) return;
      if (e.key === 'End') { alvo = 1; comecou = true; soltarAdiante(); e.preventDefault(); return; }
      if (e.key === 'Home') { alvo = 0; e.preventDefault(); return; }
      var d = 0;
      if (e.key === 'ArrowDown') d = 140;
      else if (e.key === 'ArrowUp') d = -140;
      else if (e.key === 'PageDown' || e.key === ' ') d = 700;
      else if (e.key === 'PageUp') d = -700;
      else return;
      if (mover(d)) e.preventDefault();
    }

    function aoRolar() {
      if (travado || Date.now() < podeTravarEm) return;
      var r = hero.getBoundingClientRect();
      if (r.top <= 0 && r.bottom >= window.innerHeight * 0.9) {
        rolarDireto(hero.offsetTop);
        travar();
      }
    }

    window.addEventListener('wheel', aoRoda, { passive: false });
    window.addEventListener('touchstart', aoTocar, { passive: true });
    window.addEventListener('touchmove', aoArrastar, { passive: false });
    window.addEventListener('keydown', aoTeclar);
    window.addEventListener('scroll', aoRolar, { passive: true });

    function quadro() {
      if (falhou) return;
      atual += (alvo - atual) * 0.18;

      if (duracao > 0) buscar(atual * duracao);
      video.style.transform = 'scale(' + (1 + atual * 0.06) + ')';

      if (titulo) {
        var t = 1 - Math.min(1, Math.max(0, atual / 0.35));
        titulo.style.opacity = String(t);
        titulo.style.transform = 'translateY(' + ((1 - t) * -24) + 'px) scale(' + (0.96 + t * 0.04) + ')';
        titulo.style.filter = 'blur(' + ((1 - t) * 10) + 'px)';
      }
      if (aviso) aviso.style.opacity = comecou ? '0' : '1';

      // O vídeo e a arte são cidades diferentes: a cena passa pelo preto
      // para as duas nunca aparecerem cruzadas.
      var apaga = Math.min(1, Math.max(0, (atual - 0.84) / 0.08));
      var revela = Math.min(1, Math.max(0, (atual - 0.92) / 0.08));
      if (cortina) cortina.style.opacity = String(apaga);
      if (arte) arte.style.opacity = String(revela);

      if (frase) {
        var f = Math.min(1, Math.max(0, (atual - 0.9) / 0.1));
        frase.style.opacity = String(f);
        frase.style.transform = 'translateY(' + ((1 - f) * 20) + 'px) scale(' + (0.97 + f * 0.03) + ')';
        frase.style.filter = 'blur(' + ((1 - f) * 8) + 'px)';
      }
      if (barra) barra.style.transform = 'scaleX(' + atual + ')';

      raf = requestAnimationFrame(quadro);
    }
    raf = requestAnimationFrame(quadro);
  }

  function init() {
    initHero();
    initNav();
    initIndex();
    initReveal();
    initForm();
    initPrint();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
