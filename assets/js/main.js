/* Deva Exim INC — site behaviour. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement.getAttribute('data-root') || '';
  // Translated pages sit one folder down: pages link relative to root, images and files to assetsRoot.
  var assetsRoot = doc.documentElement.getAttribute('data-assets');
  if (assetsRoot === null) assetsRoot = root;
  var isEnglish = (doc.documentElement.lang || 'en').indexOf('en') === 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- translations (embedded in translated pages; English pages have none) ----------

  var strings = {};
  try { strings = JSON.parse((doc.getElementById('deva-i18n') || {}).textContent || '{}'); } catch (e) { strings = {}; }
  // t(text, vars) returns the translation of text if there is one; {name}-style gaps are filled from vars.
  function t(text, vars) {
    var out = Object.prototype.hasOwnProperty.call(strings, text) ? strings[text] : text;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }

  // ---------- catalogue (embedded in every page) ----------

  var catalogue = [];
  try { catalogue = JSON.parse(($('#deva-catalogue') || {}).textContent || '[]'); } catch (e) { catalogue = []; }
  var bySlug = {};
  catalogue.forEach(function (p) { bySlug[p.slug] = p; });

  // ---------- storage that never throws ----------

  var memory = {};
  var storage = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return memory[k] || null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { memory[k] = v; } },
  };
  var session = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  // ---------- enquiry list ----------

  var KEY = 'deva-enquiry-v1';
  var listeners = [];

  var enquiry = {
    get: function () {
      try {
        var v = JSON.parse(storage.get(KEY) || '[]');
        return Array.isArray(v) ? v.filter(function (s) { return bySlug[s]; }) : [];
      } catch (e) { return []; }
    },
    save: function (list) {
      storage.set(KEY, JSON.stringify(list));
      listeners.forEach(function (fn) { fn(list); });
    },
    has: function (slug) { return enquiry.get().indexOf(slug) !== -1; },
    add: function (slug) {
      var list = enquiry.get();
      if (list.indexOf(slug) === -1) { list.push(slug); enquiry.save(list); }
    },
    remove: function (slug) {
      enquiry.save(enquiry.get().filter(function (s) { return s !== slug; }));
    },
    clear: function () { enquiry.save([]); },
    onChange: function (fn) { listeners.push(fn); },
  };

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { var list = enquiry.get(); listeners.forEach(function (fn) { fn(list); }); }
  });

  // ---------- toast ----------

  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  // ---------- header ----------

  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- dialogs (drawer + mobile menu) ----------

  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  }
  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { closeDialog(d); return; }
      var r = d.getBoundingClientRect();
      var outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside && e.clientX !== 0 && e.clientY !== 0) closeDialog(d);
    });
  });

  var drawer = $('#enquiry-drawer');
  var menu = $('#site-menu');

  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-drawer]')) { renderDrawer(); openDialog(drawer); }
    if (e.target.closest('[data-open-menu]')) openDialog(menu);
    if (menu && e.target.closest('#site-menu a')) closeDialog(menu);
  });

  // ---------- enquiry UI: buttons, count, drawer ----------

  function syncButtons(list) {
    $$('[data-enquire]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', list.indexOf(btn.getAttribute('data-enquire')) !== -1 ? 'true' : 'false');
    });
  }

  var lastCount = null;
  function syncCount(list) {
    $$('[data-count]').forEach(function (el) {
      el.textContent = String(list.length);
      el.classList.toggle('has-items', list.length > 0);
      if (lastCount !== null && lastCount !== list.length && !reduceMotion) {
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    });
    $$('[data-count-label]').forEach(function (el) {
      el.textContent = list.length === 1 ? t('1 product') : t('{n} products', { n: list.length });
    });
    lastCount = list.length;
  }

  function renderDrawer() {
    var body = drawer && $('[data-drawer-list]', drawer);
    if (!body) return;
    var list = enquiry.get();
    var foot = $('[data-drawer-foot]', drawer);
    if (!list.length) {
      body.innerHTML =
        '<div class="drawer-empty"><p>' + escapeHTML(t('Your list is empty. Add products from the catalogue, then send one enquiry for all of them.')) + '</p>' +
        '<p><a class="btn btn--outline btn--sm" href="' + root + 'products.html">' + escapeHTML(t('Browse the catalogue')) + '</a></p></div>';
      if (foot) foot.hidden = true;
      return;
    }
    if (foot) foot.hidden = false;
    body.innerHTML = '<ul>' + list.map(function (slug) {
      var p = bySlug[slug];
      return '<li class="drawer-item">' +
        '<img src="' + assetsRoot + p.img + '" alt="" width="52" height="64" loading="lazy">' +
        '<div><a href="' + root + p.url + '">' + escapeHTML(p.name) + '</a><span class="bot">' + escapeHTML(p.bot) + '</span></div>' +
        '<button class="icon-btn" type="button" data-remove="' + slug + '" aria-label="' + escapeHTML(t('Remove {name}', { name: p.name })) + '">' +
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>';
    }).join('') + '</ul>';
  }

  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-remove]');
      if (!rm) return;
      var slug = rm.getAttribute('data-remove');
      enquiry.remove(slug);
      toast(t('{name} removed from your enquiry list.', { name: bySlug[slug].name }));
      var next = $('[data-remove]', drawer) || $('a', drawer);
      if (next) next.focus();
    });
    // On the contact page, "continue" should just close the drawer and move to the form.
    drawer.addEventListener('click', function (e) {
      var go = e.target.closest('[data-continue]');
      var form = $('#enquiry-form');
      if (go && form) { e.preventDefault(); closeDialog(drawer); form.scrollIntoView(); var first = $('input, select, textarea', form); if (first) first.focus({ preventScroll: true }); }
    });
  }

  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-enquire]');
    if (!btn) return;
    var slug = btn.getAttribute('data-enquire');
    var p = bySlug[slug];
    if (!p) return;
    if (enquiry.has(slug)) {
      enquiry.remove(slug);
      toast(t('{name} removed from your enquiry list.', { name: p.name }));
    } else {
      enquiry.add(slug);
      var n = enquiry.get().length;
      toast(n === 1 ? t('{name} added. Your enquiry list has 1 product.', { name: p.name })
        : t('{name} added. Your enquiry list has {n} products.', { name: p.name, n: n }));
    }
  });

  enquiry.onChange(function (list) { syncButtons(list); syncCount(list); if (drawer && drawer.open) renderDrawer(); });
  (function () { var list = enquiry.get(); syncButtons(list); syncCount(list); })();

  // ---------- hero thali ----------

  var thali = $('[data-thali]');
  if (thali) {
    var caption = $('[data-thali-caption]');
    var bowls = $$('.katori', thali);
    var current = null;

    var select = function (slug) {
      var p = bySlug[slug];
      if (!p || slug === current) return;
      current = slug;
      bowls.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-slug') === slug ? 'true' : 'false'); });
      if (!caption) return;
      $('[data-cap-deva]', caption).textContent = p.deva;
      $('[data-cap-name]', caption).textContent = p.name;
      $('[data-cap-bot]', caption).innerHTML = '<i>' + escapeHTML(p.bot) + '</i>, ' + escapeHTML(isEnglish ? p.part.toLowerCase() : p.part);
      var link = $('[data-cap-link]', caption);
      link.setAttribute('href', root + p.url);
      link.textContent = t('See the {short} specification', { short: p.short });
      if (!reduceMotion) { caption.classList.remove('is-changing'); void caption.offsetWidth; caption.classList.add('is-changing'); }
    };

    // A bowl is "armed" once its caption has been seen: mouse hover or keyboard focus arms it
    // immediately, a tap arms it on the first tap. Activating an armed bowl opens the product.
    var arm = function (b) { bowls.forEach(function (x) { x.removeAttribute('data-armed'); }); b.setAttribute('data-armed', '1'); };
    var keyboardFocus = function (b) { try { return b.matches(':focus-visible'); } catch (e) { return true; } };

    bowls.forEach(function (b) {
      var slug = b.getAttribute('data-slug');
      b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { select(slug); arm(b); } });
      b.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') b.removeAttribute('data-armed'); });
      b.addEventListener('focus', function () { select(slug); if (keyboardFocus(b)) arm(b); });
      b.addEventListener('blur', function () { b.removeAttribute('data-armed'); });
      b.addEventListener('click', function () {
        if (current === slug && b.getAttribute('data-armed') === '1') { window.location.href = root + bySlug[slug].url; return; }
        select(slug);
        arm(b);
      });
    });

    var initial = thali.getAttribute('data-initial');
    if (initial) {
      current = null;
      select(initial);
    }
  }

  // ---------- catalogue index: floating preview ----------

  var previewList = $('[data-preview-list]');
  var floatEl = $('.preview-float');
  if (previewList && floatEl && finePointer) {
    var img = $('img', floatEl);
    var target = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, raf = null, visible = false;

    var tick = function () {
      var k = reduceMotion ? 1 : 0.18;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      floatEl.style.transform = 'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,0) rotate(' + (reduceMotion ? 0 : ((target.x - pos.x) * 0.03).toFixed(2)) + 'deg)';
      raf = visible || Math.abs(target.x - pos.x) > 0.5 ? requestAnimationFrame(tick) : null;
    };
    var place = function (e) {
      var w = floatEl.offsetWidth, h = floatEl.offsetHeight;
      var x = e.clientX + 28, y = e.clientY - h / 2;
      if (x + w > window.innerWidth - 12) x = e.clientX - w - 28;
      y = Math.max(12, Math.min(window.innerHeight - h - 12, y));
      target.x = x; target.y = y;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    $$('[data-preview]', previewList).forEach(function (row) {
      row.addEventListener('pointerenter', function (e) {
        var src = row.getAttribute('data-preview');
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
        if (!visible) { place(e); pos.x = target.x; pos.y = target.y; }
        visible = true;
        floatEl.classList.add('is-visible');
      });
      row.addEventListener('pointermove', place);
    });
    previewList.addEventListener('pointerleave', function () { visible = false; floatEl.classList.remove('is-visible'); });
  }

  // ---------- catalogue page: filter + search ----------

  var grid = $('[data-catalogue]');
  if (grid) {
    var cards = $$('[data-card]', grid);
    var filterBtns = $$('[data-filter]');
    var search = $('[data-search]');
    var note = $('[data-result-note]');
    var empty = $('[data-empty]');
    var state = { cat: 'all', q: '' };

    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

    var apply = function (fromUser) {
      var q = norm(state.q.trim());
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = state.cat === 'all' || c.getAttribute('data-cat') === state.cat;
        var okQ = !q || norm(c.getAttribute('data-keywords')).indexOf(q) !== -1;
        c.hidden = !(okCat && okQ);
        if (!c.hidden) shown++;
      });
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === state.cat ? 'true' : 'false'); });
      if (note) note.textContent = shown === cards.length ? t('Showing all {n} products.', { n: cards.length }) : t('Showing {shown} of {n} products.', { shown: shown, n: cards.length });
      if (empty) empty.hidden = shown !== 0;
      if (fromUser && window.history && history.replaceState) {
        var url = new URL(window.location.href);
        if (state.q) url.searchParams.set('q', state.q); else url.searchParams.delete('q');
        url.hash = state.cat === 'all' ? '' : state.cat;
        history.replaceState(null, '', url.toString());
      }
    };

    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () { state.cat = b.getAttribute('data-filter'); apply(true); });
    });
    if (search) search.addEventListener('input', function () { state.q = search.value; apply(true); });
    $$('[data-reset]').forEach(function (b) {
      b.addEventListener('click', function () { state.cat = 'all'; state.q = ''; if (search) { search.value = ''; search.focus(); } apply(true); });
    });

    var hash = window.location.hash.replace('#', '');
    if (filterBtns.some(function (b) { return b.getAttribute('data-filter') === hash; })) state.cat = hash;
    var q0 = new URLSearchParams(window.location.search).get('q');
    if (q0 && search) { state.q = q0; search.value = q0; }
    apply(false);
  }

  // ---------- contact form ----------

  var form = $('#enquiry-form');
  if (form) {
    var qtyList = $('[data-qty-list]', form);
    var status = $('.form-status', form);
    var sentPanel = $('[data-sent]');
    var picks = $$('input[name="products"]', form);
    var qtyValues = {};

    var checked = function () { return picks.filter(function (i) { return i.checked; }).map(function (i) { return i.value; }); };

    var renderQty = function () {
      $$('[data-qty]', qtyList).forEach(function (row) {
        var slug = row.getAttribute('data-qty');
        qtyValues[slug] = { n: $('input', row).value, unit: $('select', row).value };
      });
      var list = checked();
      if (!list.length) { qtyList.innerHTML = '<p class="qty-empty">' + escapeHTML(t('Tick a product above to add a quantity for it.')) + '</p>'; return; }
      qtyList.innerHTML = list.map(function (slug) {
        var p = bySlug[slug], v = qtyValues[slug] || { n: '', unit: 'kg' };
        var id = 'qty-' + slug;
        return '<div class="qty-row" data-qty="' + slug + '">' +
          '<label class="name" for="' + id + '"><span class="dot" style="--c:' + p.hex + '"></span>' + escapeHTML(p.name) + '</label>' +
          '<input id="' + id + '" type="number" inputmode="decimal" min="0" step="any" placeholder="25" value="' + escapeHTML(v.n) + '" aria-label="' + escapeHTML(t('Quantity of {name}', { name: p.name })) + '">' +
          '<select aria-label="' + escapeHTML(t('Unit for {name}', { name: p.name })) + '"><option value="kg"' + (v.unit === 'kg' ? ' selected' : '') + '>kg</option><option value="MT"' + (v.unit === 'MT' ? ' selected' : '') + '>MT</option></select>' +
          '</div>';
      }).join('');
    };

    // Pre-tick from the enquiry list and from ?product=slug
    var pre = enquiry.get();
    var fromUrl = new URLSearchParams(window.location.search).get('product');
    if (fromUrl && bySlug[fromUrl] && pre.indexOf(fromUrl) === -1) { enquiry.add(fromUrl); pre = enquiry.get(); }
    picks.forEach(function (i) { i.checked = pre.indexOf(i.value) !== -1; });
    renderQty();
    if (new URLSearchParams(window.location.search).get('samples') && $('[data-samples]', form)) $('[data-samples]', form).checked = true;

    picks.forEach(function (i) {
      i.addEventListener('change', function () {
        if (i.checked) enquiry.add(i.value); else enquiry.remove(i.value);
        renderQty();
        clearError($('[data-error-for="products"]', form));
      });
    });
    enquiry.onChange(function (list) {
      var changed = false;
      picks.forEach(function (i) { var on = list.indexOf(i.value) !== -1; if (i.checked !== on) { i.checked = on; changed = true; } });
      if (changed) renderQty();
    });

    var fields = {
      name: $('[name="name"]', form),
      company: $('[name="company"]', form),
      email: $('[name="email"]', form),
      phone: $('[name="phone"]', form),
      country: $('[name="country"]', form),
      port: $('[name="port"]', form),
      incoterm: $('[name="incoterm"]', form),
      packaging: $('[name="packaging"]', form),
      samples: $('[name="samples"]', form),
      message: $('[name="message"]', form),
    };

    var setError = function (input, msgEl, message) {
      if (input) input.setAttribute('aria-invalid', 'true');
      if (msgEl) { msgEl.textContent = message; msgEl.hidden = false; }
    };
    function clearError(msgEl, input) {
      if (input) input.removeAttribute('aria-invalid');
      if (msgEl) { msgEl.hidden = true; msgEl.textContent = ''; }
    }

    Object.keys(fields).forEach(function (k) {
      var input = fields[k];
      if (input) input.addEventListener('input', function () { clearError($('[data-error-for="' + k + '"]', form), input); });
    });

    var validate = function (channel) {
      var problems = [];
      var err = function (k) { return $('[data-error-for="' + k + '"]', form); };
      ['products', 'name', 'company', 'email', 'country'].forEach(function (k) { clearError(err(k), fields[k]); });

      if (!checked().length) { setError(null, err('products'), t('Tick at least one product so we know what to quote.')); problems.push(picks[0]); }
      if (!fields.country.value.trim()) { setError(fields.country, err('country'), t('Enter the destination country so we can quote freight.')); problems.push(fields.country); }
      if (!fields.name.value.trim()) { setError(fields.name, err('name'), t('Enter your name.')); problems.push(fields.name); }
      if (channel === 'email') {
        if (!fields.company.value.trim()) { setError(fields.company, err('company'), t('Enter your company name. Write “Individual” if you buy for yourself.')); problems.push(fields.company); }
        var email = fields.email.value.trim();
        if (!email) { setError(fields.email, err('email'), t('Enter an email address we can reply to.')); problems.push(fields.email); }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError(fields.email, err('email'), t('Check the email address. It should look like name@company.com.')); problems.push(fields.email); }
      }

      if (problems.length) {
        problems[0].focus();
        status.textContent = problems.length === 1 ? t('One detail needs your attention.') : t('{n} details need your attention.', { n: problems.length });
        status.classList.add('is-error');
        return false;
      }
      status.textContent = '';
      status.classList.remove('is-error');
      return true;
    };

    var compose = function () {
      renderQty();
      // This message goes to the Deva Exim team, so it is always in English, whatever language the page is in.
      var lines = ['Enquiry from the Deva Exim website (page language: ' + (doc.documentElement.lang || 'en') + ')', '', 'Products:'];
      checked().forEach(function (slug) {
        var v = qtyValues[slug];
        var qty = v && v.n ? v.n + ' ' + v.unit : 'quantity to discuss';
        lines.push('- ' + bySlug[slug].en + ': ' + qty);
      });
      lines.push('');
      var dest = fields.country.value.trim() + (fields.port.value.trim() ? ' (' + fields.port.value.trim() + ')' : '');
      lines.push('Destination: ' + dest);
      lines.push('Incoterm: ' + (fields.incoterm.value || 'Not sure yet, please advise'));
      lines.push('Packaging: ' + (fields.packaging.value || 'Standard 25 kg bags'));
      lines.push('Samples first: ' + (fields.samples.checked ? 'Yes' : 'No'));
      lines.push('');
      lines.push('Name: ' + fields.name.value.trim());
      if (fields.company.value.trim()) lines.push('Company: ' + fields.company.value.trim());
      if (fields.email.value.trim()) lines.push('Email: ' + fields.email.value.trim());
      if (fields.phone.value.trim()) lines.push('Phone / WhatsApp: ' + fields.phone.value.trim());
      if (fields.message.value.trim()) { lines.push(''); lines.push('Message:'); lines.push(fields.message.value.trim()); }
      return lines.join('\n');
    };

    var subjectLine = function () {
      var names = checked().map(function (s) { return bySlug[s].enShort; });
      return 'Enquiry: ' + (names.length > 3 ? names.slice(0, 3).join(', ') + ' and ' + (names.length - 3) + ' more' : names.join(', '));
    };

    var showSent = function (how) {
      if (!sentPanel) return;
      $('[data-sent-how]', sentPanel).textContent = how;
      form.hidden = true;
      sentPanel.hidden = false;
      sentPanel.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var trap = $('.hp input', form);
      if (trap && trap.value) return; // filled in by a bot
      if (!validate('email')) return;
      var endpoint = form.getAttribute('data-endpoint');
      var text = compose();
      if (endpoint) {
        var data = new FormData(form);
        data.append('summary', text);
        data.append('_subject', subjectLine());
        status.textContent = t('Sending your enquiry…');
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); })
          .then(function () { enquiry.clear(); showSent(t('We have received your enquiry and will reply by email.')); })
          .catch(function () {
            status.classList.add('is-error');
            status.textContent = t('Your enquiry did not go through. Check your connection and try again, or send it on WhatsApp.');
          });
        return;
      }
      var to = form.getAttribute('data-email');
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subjectLine()) + '&body=' + encodeURIComponent(text);
      status.classList.remove('is-error');
      status.textContent = t('Your email app should now open with the enquiry ready to send. If nothing opened, send it on WhatsApp or email us at {email}.', { email: to });
    });

    var waBtn = $('[data-send-whatsapp]', form);
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        if (!validate('whatsapp')) return;
        var url = 'https://wa.me/' + form.getAttribute('data-whatsapp') + '?text=' + encodeURIComponent(compose());
        window.open(url, '_blank', 'noopener');
        status.classList.remove('is-error');
        status.textContent = t('WhatsApp should open in a new tab with your enquiry filled in. Press send there to reach us.');
      });
    }

    $$('[data-new-enquiry]').forEach(function (b) {
      b.addEventListener('click', function () { sentPanel.hidden = true; form.hidden = false; form.reset(); picks.forEach(function (i) { i.checked = false; }); renderQty(); fields.name.focus(); });
    });
  }

  // ---------- copy to clipboard ----------

  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var value = btn.getAttribute('data-copy');
    var label = $('.copy-label', btn) || btn;
    var original = label.textContent;
    var done = function () {
      label.textContent = t('Copied');
      setTimeout(function () { label.textContent = original; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done, function () { toast(t('Copy did not work. Select the text and copy it instead.')); });
    } else {
      var ta = doc.createElement('textarea');
      ta.value = value; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy'); done(); } catch (err) { toast(t('Copy did not work. Select the text and copy it instead.')); }
      doc.body.removeChild(ta);
    }
  });

  // ---------- print spec sheet ----------

  // The date is stamped on every print, including Ctrl+P, not only the button.
  window.addEventListener('beforeprint', function () {
    var stamp = $('[data-print-date]');
    var when = new Date().toLocaleDateString(isEnglish ? 'en-GB' : doc.documentElement.lang, { day: 'numeric', month: 'long', year: 'numeric' });
    if (stamp) stamp.textContent = t(', printed {date}', { date: when });
  });
  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-print]')) window.print();
  });

  // ---------- language menu ----------

  var langMenu = $('[data-lang-menu]');
  if (langMenu) {
    // close the dropdown on an outside click or Escape
    doc.addEventListener('click', function (e) { if (langMenu.open && !langMenu.contains(e.target)) langMenu.open = false; });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && langMenu.open) { langMenu.open = false; $('summary', langMenu).focus(); }
    });
  }
  // remember the visitor's choice, so we only offer a language once
  doc.addEventListener('click', function (e) {
    var choice = e.target.closest('[data-lang-choice]');
    if (choice) storage.set('deva-lang', choice.getAttribute('data-lang-choice'));
  });

  // On English pages, offer the visitor's browser language once if we have it.
  (function () {
    var offersEl = doc.getElementById('deva-langs');
    if (!offersEl || !isEnglish || storage.get('deva-lang')) return;
    var offers = [];
    try { offers = JSON.parse(offersEl.textContent); } catch (e) { return; }
    var prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).map(function (l) { return String(l).toLowerCase().split('-')[0]; });
    var offer = null;
    for (var i = 0; i < prefs.length && !offer; i++) {
      if (prefs[i] === 'en') break;                      // English comes first: no need to offer anything
      offer = offers.filter(function (o) { return o.code === prefs[i]; })[0] || null;
    }
    if (!offer) return;
    var bar = doc.createElement('div');
    bar.className = 'lang-offer';
    bar.setAttribute('role', 'region');
    bar.setAttribute('lang', offer.lang);
    bar.setAttribute('dir', offer.code === 'ar' ? 'rtl' : 'ltr');
    bar.innerHTML = '<p>' + escapeHTML(offer.text) + '</p><a class="btn btn--haldi btn--sm" data-lang-choice="' + offer.code + '" href="' + escapeHTML(offer.href) + '">' + escapeHTML(offer.cta) + '</a>' +
      '<button class="icon-btn" type="button" data-lang-dismiss aria-label="' + escapeHTML(offer.close || 'Close') + '"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    var mainEl = $('#main');
    if (!mainEl) return;
    mainEl.parentNode.insertBefore(bar, mainEl);
    bar.addEventListener('click', function (e) {
      if (e.target.closest('[data-lang-dismiss]')) { storage.set('deva-lang', 'en'); bar.remove(); }
    });
  })();

  // ---------- review mode: highlight content that still needs confirmation ----------

  (function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get('review') === 'off') session.del('deva-review');
    else if (params.has('review')) session.set('deva-review', '1');
    if (session.get('deva-review') !== '1') return;

    doc.documentElement.classList.add('is-review');
    var items = $$('.tbc');
    var seen = {}, unique = [];
    items.forEach(function (el) {
      var note = el.getAttribute('data-tbc');
      el.setAttribute('title', note);
      if (!seen[note]) { seen[note] = true; unique.push(el); }
    });

    var panel = doc.createElement('aside');
    panel.className = 'review-panel';
    panel.setAttribute('aria-label', 'Review mode');
    panel.innerHTML =
      '<header><strong>Review mode</strong><span>' + unique.length + ' to confirm on this page</span></header>' +
      '<ol>' + unique.map(function (el, i) { return '<li><span class="n" aria-hidden="true">' + (i + 1) + '</span><button type="button" data-goto="' + i + '">' + escapeHTML(el.getAttribute('data-tbc')) + '</button></li>'; }).join('') + '</ol>' +
      '<header class="actions"><button class="btn btn--outline" type="button" data-hide-review>Hide list</button><button class="btn btn--leaf" type="button" data-exit-review>Exit review</button></header>';
    doc.body.appendChild(panel);

    panel.addEventListener('click', function (e) {
      var go = e.target.closest('[data-goto]');
      if (go) {
        var el = unique[Number(go.getAttribute('data-goto'))];
        el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash');
      }
      if (e.target.closest('[data-hide-review]')) { var ol = $('ol', panel); ol.hidden = !ol.hidden; e.target.textContent = ol.hidden ? 'Show list' : 'Hide list'; }
      if (e.target.closest('[data-exit-review]')) {
        session.del('deva-review');
        doc.documentElement.classList.remove('is-review');
        panel.remove();
      }
    });
  })();
})();
