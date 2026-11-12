/* ==========================================================================
   01 FINANÇAS — Comportamentos da landing page
   Sem dependências. Degrada bem sem JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var prices = cfg.prices || {};
  var supportEmail = cfg.supportEmail || 'contato@01financas.com.br';
  var checkout = cfg.checkout || {};
  var money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function formatMoney(value) {
    return money.format(Number(value));
  }

  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }

  /* ------------------------------------------------------------------------
     Preços — mantém cards, CTA e barra mobile sincronizados com config.js
     ------------------------------------------------------------------------ */
  function priceParts(value) {
    var fixed = Number(value).toFixed(2).split('.');
    return { reais: fixed[0], centavos: fixed[1] };
  }

  document.querySelectorAll('[data-plan-price]').forEach(function (el) {
    var value = prices[el.getAttribute('data-plan-price')];
    if (typeof value !== 'number') return;
    var parts = priceParts(value);
    el.innerHTML = '<span class="plan-price__currency">R$</span>' +
      '<span class="plan-price__number">' + parts.reais + '</span>' +
      '<span class="plan-price__cents">,' + parts.centavos + '</span>';
  });

  document.querySelectorAll('[data-price-inline]').forEach(function (el) {
    var value = prices[el.getAttribute('data-price-inline')];
    if (typeof value === 'number') el.textContent = formatMoney(value);
  });

  document.querySelectorAll('[data-price-min]').forEach(function (el) {
    var values = Object.keys(prices)
      .map(function (key) { return Number(prices[key]); })
      .filter(function (value) { return isFinite(value); });
    if (values.length) el.textContent = formatMoney(Math.min.apply(null, values));
  });

  /* ------------------------------------------------------------------------
     Checkout
     ------------------------------------------------------------------------ */
  function isValidCheckout(url) {
    return typeof url === 'string' && /^https?:\/\/\S+$/i.test(url.trim());
  }

  document.querySelectorAll('[data-checkout]').forEach(function (el) {
    var plan = el.getAttribute('data-checkout') || 'completa';
    var url = checkout[plan];

    if (isValidCheckout(url)) {
      el.setAttribute('href', url.trim());
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.addEventListener('click', function () {
        track('begin_checkout', {
          plan: plan,
          value: prices[plan] || 0,
          currency: 'BRL',
          items: [{ item_id: plan, item_name: '01 Finanças ' + plan, price: prices[plan] || 0 }]
        });
      });
    }
  });

  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_click', {
        cta_id: el.getAttribute('data-cta'),
        plan: el.getAttribute('data-checkout') || null
      });
    });
  });

  /* ------------------------------------------------------------------------
     Contagem regressiva honesta + data do lote
     ------------------------------------------------------------------------ */
  (function launchCountdown() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-countdown]'));
    var expiredNodes = Array.prototype.slice.call(document.querySelectorAll('[data-countdown-expired]'));
    var dateNodes = Array.prototype.slice.call(document.querySelectorAll('[data-launch-date]'));
    if (!nodes.length) return;

    var launch = cfg.launch || {};
    var deadline = launch.enabled ? Date.parse(launch.endsAt) : NaN;
    var validDeadline = isFinite(deadline);

    if (validDeadline) {
      var dateFormatter = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
      });
      dateNodes.forEach(function (node) { node.textContent = dateFormatter.format(new Date(deadline)); });
    }

    function expire() {
      nodes.forEach(function (node) { node.classList.add('is-expired'); });
      expiredNodes.forEach(function (node) { node.classList.add('is-visible'); });
    }

    if (!validDeadline || Date.now() >= deadline) {
      expire();
      return;
    }

    function setValue(node, name, value) {
      var el = node.querySelector('[data-' + name + ']');
      if (!el) return false;
      var next = String(value).padStart(2, '0');
      if (el.textContent !== next) {
        el.textContent = next;
        return true;
      }
      return false;
    }

    function render() {
      var remaining = deadline - Date.now();
      if (remaining <= 0) {
        expire();
        clearInterval(timer);
        return;
      }

      var totalSeconds = Math.floor(remaining / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      nodes.forEach(function (node) {
        setValue(node, 'days', days);
        setValue(node, 'hours', hours);
        setValue(node, 'minutes', minutes);
        var changed = setValue(node, 'seconds', seconds);
        if (changed && !reduceMotion) {
          var secondsEl = node.querySelector('[data-seconds]');
          if (secondsEl && secondsEl.animate) {
            secondsEl.animate(
              [{ opacity: .45, transform: 'translateY(-2px)' }, { opacity: 1, transform: 'translateY(0)' }],
              { duration: 220, easing: 'ease-out' }
            );
          }
        }
      });
    }

    render();
    var timer = setInterval(render, 1000);
  })();

  /* ------------------------------------------------------------------------
     Header + progresso de leitura
     ------------------------------------------------------------------------ */
  var header = document.getElementById('header');
  var progressBar = document.querySelector('[data-scroll-progress]');
  var ticking = false;

  function updateScrollUI() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      progressBar.style.transform = 'scaleX(' + ratio + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  /* ------------------------------------------------------------------------
     Barra fixa mobile
     ------------------------------------------------------------------------ */
  var sticky = document.querySelector('[data-sticky-cta]');
  var hero = document.querySelector('.hero-section');
  var finalCta = document.querySelector('.final-cta');
  var heroPassed = false;
  var finalVisible = false;

  function updateSticky() {
    if (!sticky) return;
    sticky.classList.toggle('is-visible', heroPassed && !finalVisible);
  }

  if (sticky && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroPassed = !entries[0].isIntersecting;
      updateSticky();
    }, { threshold: 0 }).observe(hero);

    if (finalCta) {
      new IntersectionObserver(function (entries) {
        finalVisible = entries[0].isIntersecting;
        updateSticky();
      }, { threshold: 0.18 }).observe(finalCta);
    }
  } else if (sticky) {
    window.addEventListener('scroll', function () {
      heroPassed = window.scrollY > (hero ? hero.offsetHeight : 600);
      updateSticky();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */
  (function reveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion) {
      nodes.forEach(function (node) { node.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    nodes.forEach(function (node) {
      // Elementos escondidos por breakpoint (ex.: preço mobile no desktop)
      // não têm área para observar. Marca como visíveis para não ficarem presos.
      if (!node.getClientRects().length) {
        node.classList.add('is-visible');
        return;
      }
      observer.observe(node);
    });
  })();

  /* ------------------------------------------------------------------------
     Micro-interações: botão magnético + spotlight nos planos
     ------------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.js-magnetic').forEach(function (el) {
      var frame = null;

      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        var x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        var y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(function () {
          el.style.transform = 'translate3d(' + (x * 7).toFixed(2) + 'px,' + (y * 5).toFixed(2) + 'px,0)';
        });
      });

      el.addEventListener('pointerleave', function () {
        if (frame) window.cancelAnimationFrame(frame);
        el.style.transform = '';
      });
    });

    document.querySelectorAll('.spotlight').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top).toFixed(0) + 'px');
      });
    });
  }

  /* ------------------------------------------------------------------------
     Mockup interativo da planilha no Hero (6 abas clicáveis)
     ------------------------------------------------------------------------ */
  (function interactiveMockup() {
    var root = document.querySelector('[data-mockup]');
    if (!root) return;

    var triggers = Array.prototype.slice.call(root.querySelectorAll('[data-sheet-trigger]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-sheet-panel]'));
    var cellEl = root.querySelector('[data-mockup-cell]');
    var formulaEl = root.querySelector('[data-mockup-formula]');
    if (!triggers.length || !panels.length) return;

    var formulas = {
      painel: { cell: 'C4', fx: '=SOMA(Patrimonio!D4:D15)-SOMA(Dividas!E4:E10)' },
      fluxo: { cell: 'E18', fx: '=SOMASE(C5:C42;"Renda";D5:D42)-SOMASE(C5:C42;"<>Renda";D5:D42)' },
      orcamento: { cell: 'F8', fx: '=SE(D8/C8>=0,9;"ATENÇÃO";SE(D8<=C8;"DENTRO DA META";"ACIMA"))' },
      metas: { cell: 'D6', fx: '=ARRED(Acumulado/Meta_Total*100;0)&"% concluído"' },
      dividas: { cell: 'G5', fx: '=ORDEM.EQ(Taxa_Juros;$D$5:$D$12;0)&"ª prioridade"' },
      patrimonio: { cell: 'D14', fx: '=SOMA(Reserva!D4:D8;Investimentos!F4:F16;Bens!C4:C9)' }
    };

    var order = ['painel', 'fluxo', 'orcamento', 'metas', 'dividas', 'patrimonio'];
    var activeKey = 'painel';

    function activate(key, userTriggered) {
      if (!key) return;
      activeKey = key;

      triggers.forEach(function (btn) {
        var match = btn.getAttribute('data-sheet-trigger') === key;
        btn.classList.toggle('is-active', match);
        if (btn.getAttribute('role') === 'tab') {
          btn.setAttribute('aria-selected', match ? 'true' : 'false');
        }
      });

      panels.forEach(function (panel) {
        var match = panel.getAttribute('data-sheet-panel') === key;
        panel.hidden = !match;
        panel.classList.toggle('is-active', match);
      });

      if (formulas[key]) {
        if (cellEl) cellEl.textContent = formulas[key].cell;
        if (formulaEl) formulaEl.textContent = formulas[key].fx;
      }

      if (userTriggered) {
        track('mockup_sheet_select', { sheet: key });
      }
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.getAttribute('data-sheet-trigger'), true);
      });

      btn.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        var idx = order.indexOf(activeKey);
        var nextIdx = event.key === 'ArrowRight'
          ? (idx + 1) % order.length
          : (idx - 1 + order.length) % order.length;
        var nextKey = order[nextIdx];
        activate(nextKey, true);
        var tabBtn = root.querySelector('.mockup__sheet[data-sheet-trigger="' + nextKey + '"]');
        if (tabBtn) tabBtn.focus();
      });
    });
  })();

  /* ------------------------------------------------------------------------
     Toast FOMO — notificações de pessoas comprando a planilha
     ------------------------------------------------------------------------ */
  (function socialProof() {
    var sp = cfg.socialProof || {};
    var root = document.querySelector('[data-social-proof]');
    if (!root || !sp.enabled || !Array.isArray(sp.items) || !sp.items.length) return;

    var nameEl = root.querySelector('[data-sp-name]');
    var planEl = root.querySelector('[data-sp-plan]');
    var metaEl = root.querySelector('[data-sp-meta]');
    var closeBtn = root.querySelector('[data-social-proof-close]');
    var maxPerSession = Number(sp.maxPerSession) || 12;
    var dismissedKey = '01financas:social-proof-dismissed';
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(dismissedKey) === '1'; } catch (e) {}
    var count = 0;

    var labels = {
      basica: '01 Básica',
      dinamica: '01 Dinâmica',
      completa: '01 Completa',
      '01 basica': '01 Básica',
      '01 dinamica': '01 Dinâmica',
      '01 completa': '01 Completa'
    };

    function planLabel(value) {
      var key = String(value || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      return labels[key] || String(value || '01 Completa').trim();
    }

    function formatAgo(item) {
      if (typeof item.time === 'string' && item.time.trim()) return item.time.trim();
      var mins = Number(item.minutesAgo);
      if (isFinite(mins) && mins >= 0) {
        if (mins <= 1) return 'agora mesmo';
        if (mins < 60) return 'há ' + Math.round(mins) + ' min';
        var h = Math.round(mins / 60);
        return 'há ' + h + ' h';
      }
      var ts = Date.parse(item.purchasedAt || '');
      if (isFinite(ts)) {
        var diff = Math.max(1, Math.floor((Date.now() - ts) / 60000));
        return diff < 60 ? 'há ' + diff + ' min' : 'há ' + Math.floor(diff / 60) + ' h';
      }
      return 'há poucos minutos';
    }

    var entries = sp.items.map(function (item) {
      if (!item || typeof item.name !== 'string' || !item.name.trim()) return null;
      return {
        name: item.name.trim().slice(0, 40),
        city: typeof item.city === 'string' ? item.city.trim().slice(0, 40) : '',
        plan: planLabel(item.plan),
        ago: formatAgo(item)
      };
    }).filter(Boolean);

    if (!entries.length || dismissed) return;

    var index = 0;
    var timer = null;
    var hideTimer = null;
    var hovering = false;

    function show(entry) {
      if (document.hidden || !entry) return;
      if (nameEl) nameEl.textContent = entry.name;
      if (planEl) planEl.textContent = entry.plan;
      if (metaEl) metaEl.textContent = (entry.city ? entry.city + ' · ' : '') + entry.ago + ' · compra verificada';

      root.hidden = false;
      void root.offsetWidth;
      root.classList.add('is-visible');
      count += 1;
      track('social_proof_view', { plan: entry.plan });
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, Number(sp.displayDuration) || 5500);
    }

    function hide() {
      window.clearTimeout(hideTimer);
      root.classList.remove('is-visible');
      hideTimer = window.setTimeout(function () { root.hidden = true; }, 350);
    }

    function schedule() {
      window.clearTimeout(timer);
      if (dismissed || count >= maxPerSession) return;
      timer = window.setTimeout(function () {
        index = (index + 1) % entries.length;
        show(entries[index]);
        schedule();
      }, Number(sp.interval) || 9500);
    }

    function start() {
      if (dismissed || count >= maxPerSession) return;
      show(entries[0]);
      schedule();
    }

    closeBtn.addEventListener('click', function () {
      hide();
      window.clearTimeout(timer);
      dismissed = true;
      try { sessionStorage.setItem(dismissedKey, '1'); } catch (e) {}
    });

    root.addEventListener('mouseenter', function () {
      hovering = true;
      window.clearTimeout(timer);
      window.clearTimeout(hideTimer);
    });
    root.addEventListener('mouseleave', function () {
      hovering = false;
      if (!root.hidden) {
        hideTimer = window.setTimeout(hide, 2500);
        schedule();
      }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        window.clearTimeout(timer);
      } else if (!hovering && !root.hidden) {
        schedule();
      }
    });

    timer = window.setTimeout(start, Number(sp.startDelay) || 2200);
  })();

  /* ------------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-support-link]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + supportEmail + '?subject=01%20Finan%C3%A7as%20%E2%80%94%20d%C3%BAvida');
  });

  window.__siteReady = true;
})();
