/* <tet-world-map> — TéT posztok világtérképe. d3-geo + world-atlas TopoJSON.
   Attribútumok: data (JSON tömb), metric ("focus"|"risk"|"open"), field (szűrő), selected (ország neve) */
(function () {
  var worldPromise = null;
  function loadWorld() {
    if (!worldPromise) {
      worldPromise = fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(function (r) { return r.json(); });
    }
    return worldPromise;
  }
  function waitForD3() {
    return new Promise(function (res) {
      (function tick() {
        if (window.d3 && window.topojson) return res();
        setTimeout(tick, 60);
      })();
    });
  }

  var FIELD_COLORS = {
    'Mesterséges intelligencia': '#1f4e9c',
    'Kvantumtechnológia': '#6b46c1',
    'Biotechnológia és élettudomány': '#0f7a68',
    'Félvezetők és mikroelektronika': '#b45309',
    'Energetika és fenntarthatóság': '#2f7d32',
    'Űrtechnológia': '#0e7490',
    'Agrár- és élelmiszertechnológia': '#8a6d1f',
    'Digitális egészségügy': '#a8326f',
    'Anyagtudomány': '#525c6b',
    'Mobilitás és autonóm rendszerek': '#9a3412'
  };
  var SEQ = ['#e6ecf5', '#c3d3e9', '#96b3d8', '#5f87bd', '#2f5d9e', '#1b3a6b'];
  var RISK_COLORS = { 'Alacsony': '#0f7a68', 'Közepes': '#a86a00', 'Magas': '#b3261e' };
  var RISK_ORDER = ['Alacsony', 'Közepes', 'Magas'];

  var W = 960, H = 505;

  var CSS = '' +
    ':host{display:block;position:relative;width:100%;font:400 12px/1.4 "IBM Plex Sans",system-ui,sans-serif;color:#10151d}' +
    'svg{display:block;width:100%;height:auto}' +
    '.c{stroke:#ffffff;stroke-width:.5px;cursor:default;transition:fill .15s}' +
    '.c.post{cursor:pointer}' +
    '.c.post:hover{stroke:#10151d;stroke-width:1.1px}' +
    '.c.sel{stroke:#10151d;stroke-width:1.6px}' +
    '.pin{cursor:pointer}' +
    '.tip{position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;background:#10151d;color:#fff;' +
    'padding:8px 10px;border-radius:5px;max-width:230px;z-index:5;box-shadow:0 6px 18px rgba(0,0,0,.28);transform:translate(-50%,-100%)}' +
    '.tip b{display:block;font-weight:600;font-size:12.5px;margin-bottom:3px}' +
    '.tip span{display:block;color:#b9c2cf;font-size:11px}' +
    '.lg{display:flex;flex-wrap:wrap;gap:4px 14px;padding:10px 12px 2px;border-top:1px solid #dde1e7;margin-top:6px}' +
    '.lg div{display:flex;align-items:center;gap:6px;color:#454f5e;font-size:11px}' +
    '.lg i{width:11px;height:11px;border-radius:2px;display:block}';

  var TetWorldMap = function () {};
  TetWorldMap = class extends HTMLElement {
    constructor() {
      super();
      this._data = []; this._metric = 'focus'; this._field = ''; this._sel = ''; this._ready = false;
    }
    static get observedAttributes() { return ['data', 'metric', 'field', 'selected']; }
    set data(v) { try { this._data = typeof v === 'string' ? JSON.parse(v || '[]') : (v || []); } catch (e) { this._data = []; } this._paint(); }
    get data() { return this._data; }
    set metric(v) { this._metric = v || 'focus'; this._paint(); }
    set field(v) { this._field = v || ''; this._paint(); }
    set selected(v) { this._sel = v || ''; this._paint(); }
    attributeChangedCallback(n, o, v) {
      if (o === v) return;
      if (n === 'data') this.data = v;
      else if (n === 'metric') this.metric = v;
      else if (n === 'field') this.field = v;
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
        .on('mousemove', function (ev, d) { self._hover(ev, d.properties.name); })
        .on('mouseleave', function () { self._tip.style.opacity = 0; })
        .on('click', function (ev, d) { self._pick(d.properties.name); });
      this._root.appendChild(svg.node());
      this._root.appendChild(this._legend);
      this._svg = svg;
    }
    _rec(name) {
      for (var i = 0; i < this._data.length; i++) if (this._data[i].geo === name) return this._data[i];
      return null;
    }
    _dim(r) { return !!(this._field && r && r.fokusz.indexOf(this._field) === -1); }
    _fill(r) {
      if (!r) return '#eceff3';
      if (this._dim(r)) return '#e3e7ec';
      if (this._metric === 'focus') return FIELD_COLORS[r.fokusz[0]] || '#1f4e9c';
      if (this._metric === 'risk') return RISK_COLORS[r.kockazat] || '#eceff3';
      var v = Math.max(0, Math.min(1, ((r.nyitottsag || 0) - 1) / 4));
      return SEQ[Math.max(0, Math.min(SEQ.length - 1, Math.round(v * (SEQ.length - 1))))];
    }
    _hover(ev, name) {
      var r = this._rec(name);
      var box = this.getBoundingClientRect();
      this._tip.style.left = (ev.clientX - box.left) + 'px';
      this._tip.style.top = (ev.clientY - box.top - 12) + 'px';
      this._tip.style.opacity = 1;
      if (!r) { this._tip.innerHTML = '<b>' + name + '</b><span>Nincs kihelyezett TéT attasé</span>'; return; }
      this._tip.innerHTML = '<b>' + r.orszag + '</b><span>' + r.attase + ' · ' + r.varos + '</span>' +
        '<span>Fókusz: ' + r.fokusz.join(', ') + '</span>' +
        '<span>' + r.ciklus + ' országjelentés · ' + r.utolso + '</span>' +
        '<span>Szabályozási kockázat: ' + r.kockazat + ' · nyitottság ' + (r.nyitottsag || 0).toFixed(1) + '/5</span>';
    }
    _pick(name) {
      var r = this._rec(name);
      if (!r) return;
      this.dispatchEvent(new CustomEvent('tet-country-select', { bubbles: true, composed: true, detail: r }));
    }
    _paint() {
      if (!this._ready) return;
      var self = this, d3 = window.d3;
      this._paths.attr('fill', function (d) { return self._fill(self._rec(d.properties.name)); })
        .attr('class', function (d) {
          var r = self._rec(d.properties.name);
          return 'c' + (r ? ' post' : '') + (r && r.geo === self._sel ? ' sel' : '');
        });
      var pins = this._data.filter(function (r) { return r.pin; });
      this._pins.selectAll('g').data(pins, function (d) { return d.geo; }).join(
        function (enter) {
          var g = enter.append('g').attr('class', 'pin');
          g.append('circle').attr('r', 5.5).attr('stroke', '#fff').attr('stroke-width', 1.4);
          g.append('circle').attr('r', 1.8).attr('fill', '#fff');
          g.on('mousemove', function (ev, d) { self._hover(ev, d.geo); })
            .on('mouseleave', function () { self._tip.style.opacity = 0; })
            .on('click', function (ev, d) { self._pick(d.geo); });
          return g;
        }
      ).attr('transform', function (d) { var p = self._proj(d.lonlat); return 'translate(' + p[0] + ',' + p[1] + ')'; })
        .select('circle').attr('fill', function (d) { return self._fill(d); });
      this._drawLegend();
    }
    _drawLegend() {
      var html = '', i;
      if (this._metric === 'focus') {
        var used = [];
        this._data.forEach(function (r) { if (used.indexOf(r.fokusz[0]) === -1) used.push(r.fokusz[0]); });
        used.sort();
        for (i = 0; i < used.length; i++) html += '<div><i style="background:' + (FIELD_COLORS[used[i]] || '#1f4e9c') + '"></i>' + used[i] + '</div>';
      } else if (this._metric === 'risk') {
        for (i = 0; i < RISK_ORDER.length; i++) html += '<div><i style="background:' + RISK_COLORS[RISK_ORDER[i]] + '"></i>' + RISK_ORDER[i] + ' kockázat</div>';
      } else {
        html += '<div style="color:#6b7684">zárkózott (1/5)</div>';
        for (i = 0; i < SEQ.length; i++) html += '<div><i style="background:' + SEQ[i] + '"></i></div>';
        html += '<div style="color:#6b7684">nyitott (5/5)</div>';
      }
      html += '<div style="margin-left:auto"><i style="background:#eceff3;border:1px solid #dde1e7"></i>nincs poszt</div>';
      this._legend.innerHTML = html;
    }
  };
  if (!customElements.get('tet-world-map')) customElements.define('tet-world-map', TetWorldMap);
})();
