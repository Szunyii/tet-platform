/* <tet-world-map> — TéT posztok világtérképe. d3-geo + world-atlas TopoJSON.
   Attribútumok: data (JSON: { orszagok: [...], szinek: { iparag: {...}, allapot: {...} } }),
   metric ("iparag"|"allapot"), iparag (szűrő), selected (ország kódja).
   Az orszagok elemei: { kod, nev, geo, lonlat, attase, ev, allapot, iparagak }. A geo a
   world-atlas országneve; üres, ha a 110m atlaszban nincs poligon (pl. Szingapúr) – ekkor
   csak pin rajzolódik. A színtáblák a lib/orszagprofil-szotar.ts-ből jönnek, itt nincs lista. */
(function () {
  var worldPromise = null;
  function loadWorld() {
    if (!worldPromise) {
      worldPromise = fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(function (r) { return r.json(); });
    }
    return worldPromise;
  }
  var D3_TIMEOUT_MS = 15000;
  /* Korlátos várakozás a CDN-ről töltődő d3/topojson-ra; lejárat után elutasít, nem pollol örökké. */
  function waitForD3() {
    return new Promise(function (res, rej) {
      var kezdet = Date.now();
      (function tick() {
        if (window.d3 && window.topojson) return res();
        if (Date.now() - kezdet > D3_TIMEOUT_MS) return rej(new Error('d3 timeout'));
        setTimeout(tick, 60);
      })();
    });
  }
  var HIBA_SZOVEG = 'A térkép nem tölthető be (nincs internetkapcsolat a d3/world-atlas CDN-hez).';

  var NINCS_SZIN = '#eceff3', HALVANY = '#e3e7ec', SEMLEGES = '#5f6b7a';
  var ALLAPOT_SORREND = ['friss', 'elavult', 'nincs'];
  var ALLAPOT_CIMKE = { friss: 'idei profil', elavult: 'elavult profil', nincs: 'nincs profil' };

  var W = 960, H = 505;

  var CSS = '' +
    ':host{display:block;position:relative;width:100%;font:400 12px/1.4 "IBM Plex Sans",system-ui,sans-serif;color:#10151d}' +
    'svg{display:block;width:100%;height:auto}' +
    '.c{stroke:#ffffff;stroke-width:.5px;cursor:default;transition:fill .15s}' +
    '.c.post{cursor:pointer}' +
    '.c.post:hover{stroke:#10151d;stroke-width:1.1px}' +
    '.c.sel{stroke:#10151d;stroke-width:1.6px}' +
    '.pin{cursor:pointer}' +
    '.pin.sel circle:first-child{stroke:#10151d;stroke-width:2px}' +
    '.hiba{padding:24px 16px;color:#6b7684;font-size:12.5px;text-align:center}' +
    '.tip{position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;background:#10151d;color:#fff;' +
    'padding:8px 10px;border-radius:5px;max-width:230px;z-index:5;box-shadow:0 6px 18px rgba(0,0,0,.28);transform:translate(-50%,-100%)}' +
    '.tip b{display:block;font-weight:600;font-size:12.5px;margin-bottom:3px}' +
    '.tip span{display:block;color:#b9c2cf;font-size:11px}' +
    '.lg{display:flex;flex-wrap:wrap;gap:4px 14px;padding:10px 12px 2px;border-top:1px solid #dde1e7;margin-top:6px}' +
    '.lg div{display:flex;align-items:center;gap:6px;color:#454f5e;font-size:11px}' +
    '.lg i{width:11px;height:11px;border-radius:2px;display:block}';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var TetWorldMap = class extends HTMLElement {
    constructor() {
      super();
      this._data = []; this._szinek = { iparag: {}, allapot: {} };
      this._metric = 'iparag'; this._iparag = ''; this._sel = ''; this._ready = false;
    }
    static get observedAttributes() { return ['data', 'metric', 'iparag', 'selected']; }
    set data(v) {
      try {
        var o = typeof v === 'string' ? JSON.parse(v || '{}') : (v || {});
        this._data = (o.orszagok || []).map(function (r) {
          r.iparagak = Array.isArray(r.iparagak) ? r.iparagak : [];
          return r;
        });
        this._szinek = o.szinek || { iparag: {}, allapot: {} };
      } catch (e) {
        this._data = []; this._szinek = { iparag: {}, allapot: {} };
      }
      this._paint();
    }
    get data() { return this._data; }
    set metric(v) { this._metric = v || 'iparag'; this._paint(); }
    set iparag(v) { this._iparag = v || ''; this._paint(); }
    set selected(v) { this._sel = v || ''; this._paint(); }
    attributeChangedCallback(n, o, v) {
      if (o === v) return;
      if (n === 'data') this.data = v;
      else if (n === 'metric') this.metric = v;
      else if (n === 'iparag') this.iparag = v;
      else if (n === 'selected') this.selected = v;
    }
    connectedCallback() {
      if (this._root) return;
      this._root = this.attachShadow({ mode: 'open' });
      var st = document.createElement('style'); st.textContent = CSS; this._root.appendChild(st);
      this._tip = document.createElement('div'); this._tip.className = 'tip'; this._root.appendChild(this._tip);
      this._legend = document.createElement('div'); this._legend.className = 'lg';
      var self = this;
      Promise.all([waitForD3(), loadWorld()]).then(function (r) {
        var topo = r[1];
        self._feats = window.topojson.feature(topo, topo.objects.countries).features;
        self._build();
        self._ready = true;
        self._paint();
      }).catch(function () {
        var h = document.createElement('div'); h.className = 'hiba'; h.textContent = HIBA_SZOVEG;
        self._root.appendChild(h);
      });
    }
    _build() {
      var d3 = window.d3;
      var svg = d3.create('svg').attr('viewBox', '0 0 ' + W + ' ' + H).attr('role', 'img')
        .attr('aria-label', 'TéT attasé posztok világtérképe');
      this._proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 30]], { type: 'Sphere' });
      var path = d3.geoPath(this._proj);
      svg.append('path').attr('d', path({ type: 'Sphere' })).attr('fill', '#f4f7fb')
        .attr('stroke', '#dde1e7').attr('stroke-width', .8);
      svg.append('path').attr('d', d3.geoPath(this._proj)(d3.geoGraticule10()))
        .attr('fill', 'none').attr('stroke', '#e7ebf1').attr('stroke-width', .5);
      this._g = svg.append('g');
      this._pins = svg.append('g');
      var self = this;
      this._paths = this._g.selectAll('path').data(this._feats).join('path')
        .attr('d', path).attr('class', 'c')
        .on('mousemove', function (ev, d) { self._hover(ev, self._rec(d.properties.name), d.properties.name); })
        .on('mouseleave', function () { self._tip.style.opacity = 0; })
        .on('click', function (ev, d) { self._pick(self._rec(d.properties.name)); });
      this._root.appendChild(svg.node());
      this._root.appendChild(this._legend);
      this._svg = svg;
    }
    /* Poligon-név → rekord. Üres geo (nincs poligon az atlaszban) sosem találhat. */
    _rec(name) {
      if (!name) return null;
      for (var i = 0; i < this._data.length; i++) if (this._data[i].geo === name) return this._data[i];
      return null;
    }
    _dim(r) { return !!(this._iparag && r && r.iparagak.indexOf(this._iparag) === -1); }
    _fill(r) {
      if (!r) return NINCS_SZIN;
      if (this._dim(r)) return HALVANY;
      if (this._metric === 'allapot') return this._szinek.allapot[r.allapot] || NINCS_SZIN;
      return r.iparagak.length ? (this._szinek.iparag[r.iparagak[0]] || SEMLEGES) : SEMLEGES;
    }
    _hover(ev, r, name) {
      var box = this.getBoundingClientRect();
      this._tip.style.left = (ev.clientX - box.left) + 'px';
      this._tip.style.top = (ev.clientY - box.top - 12) + 'px';
      this._tip.style.opacity = 1;
      if (!r) { this._tip.innerHTML = '<b>' + esc(name) + '</b><span>Nincs kihelyezett TéT attasé</span>'; return; }
      this._tip.innerHTML = '<b>' + esc(r.nev) + '</b>' +
        '<span>' + esc(r.attase || 'nincs aktív attasé') + '</span>' +
        '<span>' + (ALLAPOT_CIMKE[r.allapot] || '') + (r.ev ? ' · ' + esc(r.ev) : '') + '</span>' +
        (r.iparagak.length ? '<span>Kiemelt iparág: ' + esc(r.iparagak[0]) + '</span>' : '');
    }
    _pick(r) {
      if (!r) return;
      this.dispatchEvent(new CustomEvent('tet-country-select', { bubbles: true, composed: true, detail: { kod: r.kod } }));
    }
    _paint() {
      if (!this._ready) return;
      var self = this;
      this._paths.attr('fill', function (d) { return self._fill(self._rec(d.properties.name)); })
        .attr('class', function (d) {
          var r = self._rec(d.properties.name);
          return 'c' + (r ? ' post' : '') + (r && r.kod === self._sel ? ' sel' : '');
        });
      /* Minden rekordhoz pin – a poligon nélküli országoknak (üres geo) csak ez látszik. */
      var pins = this._data;
      this._pins.selectAll('g').data(pins, function (d) { return d.kod; }).join(
        function (enter) {
          var g = enter.append('g').attr('class', 'pin');
          g.append('circle').attr('r', 5.5).attr('stroke', '#fff').attr('stroke-width', 1.4);
          g.append('circle').attr('r', 1.8).attr('fill', '#fff');
          g.on('mousemove', function (ev, d) { self._hover(ev, d, d.nev); })
            .on('mouseleave', function () { self._tip.style.opacity = 0; })
            .on('click', function (ev, d) { self._pick(d); });
          return g;
        }
      ).attr('class', function (d) { return 'pin' + (d.kod === self._sel ? ' sel' : ''); })
        .attr('transform', function (d) { var p = self._proj(d.lonlat); return 'translate(' + p[0] + ',' + p[1] + ')'; })
        .select('circle').attr('fill', function (d) { return self._fill(d); });
      this._drawLegend();
    }
    _drawLegend() {
      var self = this, html = '', i;
      if (this._metric === 'iparag') {
        var used = [];
        this._data.forEach(function (r) { if (r.iparagak.length && used.indexOf(r.iparagak[0]) === -1) used.push(r.iparagak[0]); });
        used.sort();
        for (i = 0; i < used.length; i++) html += '<div><i style="background:' + (self._szinek.iparag[used[i]] || SEMLEGES) + '"></i>' + esc(used[i]) + '</div>';
        html += '<div><i style="background:' + SEMLEGES + '"></i>nincs kiemelt iparág</div>';
      } else {
        for (i = 0; i < ALLAPOT_SORREND.length; i++) html += '<div><i style="background:' + (self._szinek.allapot[ALLAPOT_SORREND[i]] || NINCS_SZIN) + '"></i>' + ALLAPOT_CIMKE[ALLAPOT_SORREND[i]] + '</div>';
      }
      html += '<div style="margin-left:auto"><i style="background:' + NINCS_SZIN + ';border:1px solid #dde1e7"></i>nincs poszt</div>';
      this._legend.innerHTML = html;
    }
  };
  if (!customElements.get('tet-world-map')) customElements.define('tet-world-map', TetWorldMap);
})();
