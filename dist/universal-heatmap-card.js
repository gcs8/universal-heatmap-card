/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = globalThis, fe = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ge = Symbol(), De = /* @__PURE__ */ new WeakMap();
let et = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ge) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (fe && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = De.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && De.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const bt = (s) => new et(typeof s == "string" ? s : s + "", void 0, ge), tt = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new et(t, s, ge);
}, yt = (s, e) => {
  if (fe) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = G.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, He = fe ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return bt(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: vt, defineProperty: xt, getOwnPropertyDescriptor: wt, getOwnPropertyNames: $t, getOwnPropertySymbols: At, getPrototypeOf: St } = Object, x = globalThis, Pe = x.trustedTypes, kt = Pe ? Pe.emptyScript : "", se = x.reactiveElementPolyfillSupport, H = (s, e) => s, ce = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? kt : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, it = (s, e) => !vt(s, e), Oe = { attribute: !0, type: String, converter: ce, reflect: !1, useDefault: !1, hasChanged: it };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), x.litPropertyMetadata ?? (x.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let L = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Oe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && xt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = wt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: r, set(a) {
      const o = r == null ? void 0 : r.call(this);
      n == null || n.call(this, a), this.requestUpdate(e, o, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(H("elementProperties"))) return;
    const e = St(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(H("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(H("properties"))) {
      const t = this.properties, i = [...$t(t), ...At(t)];
      for (const r of i) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, r] of t) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const r = this._$Eu(t, i);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) t.unshift(He(r));
    } else e !== void 0 && t.push(He(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return yt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostConnected) == null ? void 0 : i.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var i;
      return (i = t.hostDisconnected) == null ? void 0 : i.call(t);
    });
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    var n;
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const a = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : ce).toAttribute(t, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((n = o.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? o.converter : ce;
      this._$Em = r;
      const c = l.fromAttribute(t, o.type);
      this[r] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, r = !1, n) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? it)(n, t) || i.useDefault && i.reflect && n === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: r, wrapped: n }, a) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), n !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, a] of this._$Ep) this[n] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, a] of r) {
        const { wrapped: o } = a, l = this[n];
        o !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, a, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (i = this._$EO) == null || i.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(t)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((i) => {
      var r;
      return (r = i.hostUpdated) == null ? void 0 : r.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
L.elementStyles = [], L.shadowRootOptions = { mode: "open" }, L[H("elementProperties")] = /* @__PURE__ */ new Map(), L[H("finalized")] = /* @__PURE__ */ new Map(), se == null || se({ ReactiveElement: L }), (x.reactiveElementVersions ?? (x.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis, Fe = (s) => s, K = P.trustedTypes, Ue = K ? K.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, st = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, rt = "?" + v, Et = `<${rt}>`, E = document, O = () => E.createComment(""), F = (s) => s === null || typeof s != "object" && typeof s != "function", be = Array.isArray, Mt = (s) => be(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", re = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, qe = /-->/g, Be = />/g, $ = RegExp(`>|${re}(?:([^\\s"'>=/]+)(${re}*=${re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ve = /'/g, We = /"/g, nt = /^(?:script|style|textarea|title)$/i, Ct = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), f = Ct(1), T = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Ge = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129);
function at(s, e) {
  if (!be(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ue !== void 0 ? Ue.createHTML(e) : e;
}
const Lt = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = I;
  for (let o = 0; o < t; o++) {
    const l = s[o];
    let c, u, d = -1, h = 0;
    for (; h < l.length && (a.lastIndex = h, u = a.exec(l), u !== null); ) h = a.lastIndex, a === I ? u[1] === "!--" ? a = qe : u[1] !== void 0 ? a = Be : u[2] !== void 0 ? (nt.test(u[2]) && (r = RegExp("</" + u[2], "g")), a = $) : u[3] !== void 0 && (a = $) : a === $ ? u[0] === ">" ? (a = r ?? I, d = -1) : u[1] === void 0 ? d = -2 : (d = a.lastIndex - u[2].length, c = u[1], a = u[3] === void 0 ? $ : u[3] === '"' ? We : Ve) : a === We || a === Ve ? a = $ : a === qe || a === Be ? a = I : (a = $, r = void 0);
    const p = a === $ && s[o + 1].startsWith("/>") ? " " : "";
    n += a === I ? l + Et : d >= 0 ? (i.push(c), l.slice(0, d) + st + l.slice(d) + v + p) : l + v + (d === -2 ? o : p);
  }
  return [at(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class U {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, a = 0;
    const o = e.length - 1, l = this.parts, [c, u] = Lt(e, t);
    if (this.el = U.createElement(c, i), A.currentNode = this.el.content, t === 2 || t === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = A.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(st)) {
          const h = u[a++], p = r.getAttribute(d).split(v), _ = /([.?@])?(.*)/.exec(h);
          l.push({ type: 1, index: n, name: _[2], strings: p, ctor: _[1] === "." ? Tt : _[1] === "?" ? zt : _[1] === "@" ? Rt : te }), r.removeAttribute(d);
        } else d.startsWith(v) && (l.push({ type: 6, index: n }), r.removeAttribute(d));
        if (nt.test(r.tagName)) {
          const d = r.textContent.split(v), h = d.length - 1;
          if (h > 0) {
            r.textContent = K ? K.emptyScript : "";
            for (let p = 0; p < h; p++) r.append(d[p], O()), A.nextNode(), l.push({ type: 2, index: ++n });
            r.append(d[h], O());
          }
        }
      } else if (r.nodeType === 8) if (r.data === rt) l.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(v, d + 1)) !== -1; ) l.push({ type: 7, index: n }), d += v.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = E.createElement("template");
    return i.innerHTML = e, i;
  }
}
function z(s, e, t = s, i) {
  var a, o;
  if (e === T) return e;
  let r = i !== void 0 ? (a = t._$Co) == null ? void 0 : a[i] : t._$Cl;
  const n = F(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = r : t._$Cl = r), r !== void 0 && (e = z(s, r._$AS(s, e.values), r, i)), e;
}
class Nt {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? E).importNode(t, !0);
    A.currentNode = r;
    let n = A.nextNode(), a = 0, o = 0, l = i[0];
    for (; l !== void 0; ) {
      if (a === l.index) {
        let c;
        l.type === 2 ? c = new q(n, n.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (c = new It(n, this, e)), this._$AV.push(c), l = i[++o];
      }
      a !== (l == null ? void 0 : l.index) && (n = A.nextNode(), a++);
    }
    return A.currentNode = E, r;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class q {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, i, r) {
    this.type = 2, this._$AH = m, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = z(this, e, t), F(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== T && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Mt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && F(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = U.createElement(at(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const a = new Nt(r, this), o = a.u(this.options);
      a.p(t), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = Ge.get(e.strings);
    return t === void 0 && Ge.set(e.strings, t = new U(e)), t;
  }
  k(e) {
    be(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, r = 0;
    for (const n of e) r === t.length ? t.push(i = new q(this.O(O()), this.O(O()), this, this.options)) : i = t[r], i._$AI(n), r++;
    r < t.length && (this._$AR(i && i._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const r = Fe(e).nextSibling;
      Fe(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class te {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, r, n) {
    this.type = 1, this._$AH = m, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = m;
  }
  _$AI(e, t = this, i, r) {
    const n = this.strings;
    let a = !1;
    if (n === void 0) e = z(this, e, t, 0), a = !F(e) || e !== this._$AH && e !== T, a && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = n[0], l = 0; l < n.length - 1; l++) c = z(this, o[i + l], t, l), c === T && (c = this._$AH[l]), a || (a = !F(c) || c !== this._$AH[l]), c === m ? e = m : e !== m && (e += (c ?? "") + n[l + 1]), this._$AH[l] = c;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Tt extends te {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class zt extends te {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class Rt extends te {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? m) === T) return;
    const i = this._$AH, r = e === m && i !== m || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== m && (i === m || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class It {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const ne = P.litHtmlPolyfillSupport;
ne == null || ne(U, q), (P.litHtmlVersions ?? (P.litHtmlVersions = [])).push("3.3.3");
const Dt = (s, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = r = new q(e.insertBefore(O(), n), n, void 0, t ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
class N extends L {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Dt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return T;
  }
}
var Ze;
N._$litElement$ = !0, N.finalized = !0, (Ze = S.litElementHydrateSupport) == null || Ze.call(S, { LitElement: N });
const ae = S.litElementPolyfillSupport;
ae == null || ae({ LitElement: N });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.2");
const Ht = [
  { value: 55, color: "#315f9d", label: "Cool" },
  { value: 68, color: "#58a4b0", label: "Comfort" },
  { value: 76, color: "#f2c14e", label: "Warm" },
  { value: 85, color: "#d94841", label: "Hot" }
], V = [
  { value: 0, color: "#2f6f9f" },
  { value: 50, color: "#5aa469" },
  { value: 75, color: "#f2c14e" },
  { value: 100, color: "#c44536" }
], W = [
  { value: 0, color: "#2f6f9f" },
  { value: 0.5, color: "#5aa469" },
  { value: 0.75, color: "#f2c14e" },
  { value: 1, color: "#c44536" }
], oe = [
  { value: 0, color: "#c44536", label: "Low" },
  { value: 35, color: "#f2c14e", label: "Watch" },
  { value: 70, color: "#5aa469", label: "Good" },
  { value: 100, color: "#2f6f9f", label: "Full" }
], le = {
  auto: {
    id: "auto",
    label: "Auto",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "auto",
      stops: [
        { value: 0, color: "#3a6ea5" },
        { value: 0.5, color: "#6fbf73" },
        { value: 1, color: "#f6c85f" }
      ]
    }
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: { preset: "temperature", unit: "°", stops: Ht }
  },
  humidity: {
    id: "humidity",
    label: "Humidity",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "humidity",
      min: 0,
      max: 100,
      unit: "%",
      stops: V
    }
  },
  power: {
    id: "power",
    label: "Power",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "power", stops: W },
    highIsBad: !0
  },
  energy_delta: {
    id: "energy_delta",
    label: "Energy Delta",
    range: { days: 30 },
    bucket: { interval: "day", value: "change" },
    scale: { preset: "energy_delta", stops: W }
  },
  percent_health: {
    id: "percent_health",
    label: "Percent Health",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "percent_health",
      min: 0,
      max: 100,
      unit: "%",
      stops: oe
    }
  },
  percent_utilization: {
    id: "percent_utilization",
    label: "Percent Utilization",
    range: { days: 30 },
    bucket: { interval: "day", value: "mean" },
    scale: {
      preset: "percent_utilization",
      min: 0,
      max: 100,
      unit: "%",
      stops: V
    },
    highIsBad: !0
  },
  filter_life: {
    id: "filter_life",
    label: "Filter Life",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "filter_life",
      min: 0,
      max: 100,
      unit: "%",
      stops: oe
    }
  },
  filter_load: {
    id: "filter_load",
    label: "Filter Load",
    range: { days: 90 },
    bucket: { interval: "day", value: "max" },
    scale: {
      preset: "filter_load",
      min: 0,
      max: 100,
      unit: "%",
      stops: V
    },
    highIsBad: !0
  },
  filter_dp: {
    id: "filter_dp",
    label: "Filter Differential Pressure",
    range: { days: 30 },
    bucket: { interval: "hour", value: "max" },
    scale: { preset: "filter_dp", stops: W },
    highIsBad: !0
  },
  binary_runtime: {
    id: "binary_runtime",
    label: "Binary Runtime",
    range: { days: 14 },
    bucket: { interval: "hour", value: "percent_on" },
    scale: {
      preset: "binary_runtime",
      min: 0,
      max: 100,
      unit: "%",
      stops: V
    }
  },
  battery: {
    id: "battery",
    label: "Battery",
    range: { days: 90 },
    bucket: { interval: "day", value: "min" },
    scale: {
      preset: "battery",
      min: 0,
      max: 100,
      unit: "%",
      stops: oe
    }
  },
  signal_quality: {
    id: "signal_quality",
    label: "Signal Quality",
    range: { days: 30 },
    bucket: { interval: "day", value: "min" },
    scale: { preset: "signal_quality", stops: W }
  }
};
function Pt(s) {
  return !s || s === "auto" ? le.auto : le[s] ?? le.auto;
}
function Ot(s) {
  if (!s)
    return "auto";
  const e = s.entity_id, t = e.split(".")[0] ?? "", i = String(s.attributes.device_class ?? "").toLowerCase(), r = String(s.attributes.unit_of_measurement ?? "").toLowerCase(), n = String(s.attributes.friendly_name ?? e).toLowerCase();
  return t === "binary_sensor" ? "binary_runtime" : i === "temperature" || r === "°f" || r === "°c" ? "temperature" : i === "humidity" || r === "%" ? n.includes("life") || n.includes("health") ? "percent_health" : n.includes("load") || n.includes("utilization") ? "percent_utilization" : "humidity" : i === "power" || r === "w" || r === "kw" ? "power" : i === "energy" || r === "wh" || r === "kwh" ? "energy_delta" : i === "battery" || n.includes("battery") ? "battery" : i === "pressure" || r.includes("pa") || r.includes("inh2o") ? n.includes("filter") ? "filter_dp" : "auto" : n.includes("filter") && n.includes("life") ? "filter_life" : n.includes("filter") && n.includes("load") ? "filter_load" : r === "dbm" || r === "lqi" || r === "db" ? "signal_quality" : "auto";
}
const ot = 2, Ft = 8;
let X = 0;
const Y = [];
function Ut(s, e = {}) {
  const t = {
    ...e,
    maxConcurrent: ye(e.maxConcurrent)
  };
  return new Promise((i, r) => {
    var n;
    Y.push({
      task: s,
      resolve: i,
      reject: r,
      options: t
    }), (n = t.onQueued) == null || n.call(t, ve(t.maxConcurrent)), lt();
  });
}
function Xe(s = ot) {
  return ve(ye(s));
}
function ye(s) {
  return typeof s != "number" || !Number.isFinite(s) ? ot : Math.min(Ft, Math.max(1, Math.floor(s)));
}
function lt() {
  var e, t;
  const s = Y[0];
  !s || X >= s.options.maxConcurrent || (Y.shift(), X += 1, (t = (e = s.options).onStart) == null || t.call(e, ve(s.options.maxConcurrent)), Promise.resolve().then(s.task).then(s.resolve, s.reject).finally(() => {
    X -= 1, lt();
  }));
}
function ve(s) {
  return {
    active: X,
    queued: Y.length,
    maxConcurrent: s
  };
}
const qt = 5e3, Bt = 24, Vt = 300;
function je(s, e) {
  var d, h, p, _, g, R, B, M, $e, Ae, Se, ke, Ee, Me, Ce, Le, Ne, Te, ze, Re, Ie;
  const t = Xt(s, e);
  if (t.length === 0)
    throw new Error("Universal Heatmap Card requires entity or entities.");
  const i = t[0], r = i ? e == null ? void 0 : e.states[i.entity] : void 0, n = Ot(r), a = ((d = s.scale) == null ? void 0 : d.preset) ?? n, o = Pt(a), l = {
    interval: ((h = s.bucket) == null ? void 0 : h.interval) ?? o.bucket.interval,
    value: ((p = s.bucket) == null ? void 0 : p.value) ?? o.bucket.value
  }, c = {
    ...o.range,
    ...s.range,
    align: Gt((_ = s.range) == null ? void 0 : _.align)
  }, u = ((g = s.navigation) == null ? void 0 : g.mode) ?? (t.length > 8 ? "dropdown" : "tabs");
  return {
    title: s.title,
    debug: s.debug ?? !1,
    entities: t,
    range: c,
    bucket: l,
    data: {
      provider: ((R = s.data) == null ? void 0 : R.provider) ?? "auto",
      prefetch: ((B = s.data) == null ? void 0 : B.prefetch) ?? !1,
      max_cells: ((M = s.data) == null ? void 0 : M.max_cells) ?? qt,
      raw_history_hours: (($e = s.data) == null ? void 0 : $e.raw_history_hours) ?? Bt,
      refresh_interval: Wt((Ae = s.data) == null ? void 0 : Ae.refresh_interval),
      defer_until_visible: ((Se = s.data) == null ? void 0 : Se.defer_until_visible) ?? !0,
      max_concurrent_requests: ye((ke = s.data) == null ? void 0 : ke.max_concurrent_requests)
    },
    missing: {
      mode: ((Ee = s.missing) == null ? void 0 : Ee.mode) ?? "empty"
    },
    scale: {
      ...o.scale,
      ...s.scale,
      preset: a
    },
    layout: {
      mode: ((Me = s.layout) == null ? void 0 : Me.mode) ?? "auto",
      bound_to_grid: ((Ce = s.layout) == null ? void 0 : Ce.bound_to_grid) ?? "auto"
    },
    navigation: {
      mode: u
    },
    axes: {
      show: ((Le = s.axes) == null ? void 0 : Le.show) ?? !0,
      x_labels: ((Ne = s.axes) == null ? void 0 : Ne.x_labels) ?? !0,
      y_labels: ((Te = s.axes) == null ? void 0 : Te.y_labels) ?? !0,
      show_key: ((ze = s.axes) == null ? void 0 : ze.show_key) ?? !1
    },
    legend: {
      show: ((Re = s.legend) == null ? void 0 : Re.show) ?? !0
    },
    tooltip: {
      show: ((Ie = s.tooltip) == null ? void 0 : Ie.show) ?? !0
    }
  };
}
function Wt(s) {
  return typeof s != "number" || !Number.isFinite(s) ? Vt : Math.max(0, s);
}
function Gt(s) {
  return s === "rolling" ? "rolling" : "day";
}
function Xt(s, e) {
  var i;
  return ((i = s.entities) != null && i.length ? s.entities : s.entity ? [{ entity: s.entity }] : []).map((r) => {
    const n = typeof r == "string" ? { entity: r } : r, a = e == null ? void 0 : e.states[n.entity], o = n.name ?? (a && (e != null && e.formatEntityName) ? e.formatEntityName(a) : a != null && a.attributes.friendly_name ? String(a.attributes.friendly_name) : n.entity);
    return {
      ...n,
      name: o
    };
  });
}
function ie(s, e = /* @__PURE__ */ new Date()) {
  const t = s.align === "day" && !s.end, i = s.end ? new Date(s.end) : t ? jt(e) : e;
  let r;
  if (s.start)
    r = new Date(s.start);
  else if (typeof s.hours == "number")
    r = new Date(i.getTime() - s.hours * 60 * 60 * 1e3);
  else {
    const n = typeof s.days == "number" ? s.days : 30;
    r = t ? Kt(i, n) : new Date(i.getTime() - n * 24 * 60 * 60 * 1e3);
  }
  if (Number.isNaN(r.getTime()) || Number.isNaN(i.getTime()))
    throw new Error("Universal Heatmap Card has an invalid range date.");
  if (r >= i)
    throw new Error("Universal Heatmap Card range start must be before end.");
  return { start: r, end: i };
}
function jt(s) {
  const e = new Date(s);
  return e.setHours(0, 0, 0, 0), e.setDate(e.getDate() + 1), e;
}
function Kt(s, e) {
  const t = new Date(s);
  return t.setDate(t.getDate() - e), t;
}
function ct(s, e = /* @__PURE__ */ new Date()) {
  const t = ie(s.range, e), i = (t.end.getTime() - t.start.getTime()) / 36e5;
  switch (s.bucket.interval) {
    case "5minute":
      return Math.ceil(i * 12);
    case "hour":
      return Math.ceil(i);
    case "day":
      return Math.ceil(i / 24);
    case "week":
      return Math.ceil(i / 168);
    case "month":
      return Math.ceil(i / 720);
    default:
      return Math.ceil(i / 24);
  }
}
function xe(s) {
  return s === "last" ? "state" : ["mean", "min", "max", "state", "sum", "change"].includes(s) ? s : null;
}
function Yt(s, e) {
  const t = new Date(s);
  if (t.setMilliseconds(0), t.setSeconds(0), e !== "5minute" ? t.setMinutes(0) : t.setMinutes(Math.floor(t.getMinutes() / 5) * 5), (e === "day" || e === "week" || e === "month") && t.setHours(0, 0, 0, 0), e === "week") {
    const i = t.getDay(), r = i === 0 ? -6 : 1 - i;
    t.setDate(t.getDate() + r);
  }
  return e === "month" && t.setDate(1), t;
}
function Jt(s, e) {
  const t = new Date(s);
  switch (e) {
    case "5minute":
      return t.setMinutes(t.getMinutes() + 5), t;
    case "hour":
      return t.setHours(t.getHours() + 1), t;
    case "day":
      return t.setDate(t.getDate() + 1), t;
    case "week":
      return t.setDate(t.getDate() + 7), t;
    case "month":
      return t.setMonth(t.getMonth() + 1), t;
    default:
      return t;
  }
}
function Qt(s, e) {
  const t = [];
  let i = Yt(s.start, e);
  for (; i < s.end; ) {
    const r = Jt(i, e);
    r > s.start && t.push({ start: new Date(i), end: new Date(r) }), i = r;
  }
  return t;
}
function w(s, e) {
  return s.map((t) => ({
    ...t,
    value: null,
    quality: "missing",
    source: e
  }));
}
function Zt(s, e, t, i) {
  const r = xe(t), n = w(s, "statistics");
  if (!r)
    return ue(n, i);
  for (const a of e) {
    const o = a.start ? new Date(a.start) : void 0;
    if (!o || Number.isNaN(o.getTime()))
      continue;
    const l = ii(s, o);
    if (l < 0)
      continue;
    const c = s[l];
    if (!c)
      continue;
    const u = a[r], d = typeof u == "number" ? u : null;
    n[l] = {
      ...c,
      value: d,
      quality: d === null ? "missing" : "ok",
      source: "statistics"
    };
  }
  return ue(n, i);
}
function ei(s, e, t, i) {
  var a;
  const r = s.map(() => []);
  for (const o of e) {
    const l = Number(o.state);
    if (!Number.isFinite(l))
      continue;
    const c = o.last_changed ?? o.last_updated;
    if (!c)
      continue;
    const u = new Date(c).getTime();
    if (!Number.isFinite(u))
      continue;
    const d = ut(s, u);
    d >= 0 && ((a = r[d]) == null || a.push({ at: u, value: l }));
  }
  const n = s.map((o, l) => {
    const c = r[l] ?? [], u = ti(c, t);
    return {
      ...o,
      value: u,
      quality: u === null ? "missing" : "ok",
      source: "history"
    };
  });
  return ue(n, i);
}
function ue(s, e) {
  if (e === "empty")
    return s;
  let t = null;
  return s.map((i) => i.value !== null ? (t = i.value, i) : e === "zero" ? { ...i, value: 0, quality: "ok" } : e === "carry_forward" && t !== null ? { ...i, value: t, quality: "carried" } : i);
}
function ti(s, e) {
  var t, i;
  if (s.length === 0)
    return null;
  switch (e) {
    case "min":
      return Math.min(...s.map((r) => r.value));
    case "max":
      return Math.max(...s.map((r) => r.value));
    case "last":
    case "state":
      return s.reduce(
        (n, a) => a.at >= n.at ? a : n
      ).value;
    case "sum":
      return s.reduce((r, n) => r + n.value, 0);
    case "delta":
    case "change": {
      const r = [...s].sort((o, l) => o.at - l.at), n = (t = r[0]) == null ? void 0 : t.value, a = (i = r[r.length - 1]) == null ? void 0 : i.value;
      return n === void 0 || a === void 0 ? null : a - n;
    }
    case "count":
      return s.length;
    case "mean":
    default:
      return s.reduce((r, n) => r + n.value, 0) / s.length;
  }
}
function ii(s, e) {
  return ut(s, e.getTime());
}
function ut(s, e) {
  let t = 0, i = s.length - 1;
  for (; t <= i; ) {
    const r = Math.floor((t + i) / 2), n = s[r];
    if (!n)
      return -1;
    if (e < n.start.getTime())
      i = r - 1;
    else if (e >= n.end.getTime())
      t = r + 1;
    else
      return r;
  }
  return -1;
}
async function si(s, e, t) {
  const i = ct(e), r = ie(e.range), n = Qt(r, e.bucket.interval);
  if (i > e.data.max_cells)
    return {
      source: "current",
      buckets: w(n, "current"),
      warning: `This heatmap would render ${i.toLocaleString()} cells. Raise data.max_cells to load it.`
    };
  const a = e.data.provider, o = xe(e.bucket.value) !== null;
  if ((a === "auto" || a === "statistics") && o)
    try {
      const l = await ri(s, e, t, n);
      if (l.some((c) => c.value !== null) || a === "statistics")
        return { source: "statistics", buckets: l };
    } catch (l) {
      if (a === "statistics")
        return {
          source: "statistics",
          buckets: w(n, "statistics"),
          warning: dt(l, "Statistics query failed.")
        };
    }
  return a === "auto" || a === "history" ? ni(s, e, t, n) : {
    source: "current",
    buckets: w(n, "current"),
    warning: "No supported data provider is available for this bucket value yet."
  };
}
async function ri(s, e, t, i) {
  const r = xe(e.bucket.value);
  if (!r)
    return w(i, "statistics");
  const n = ie(e.range), o = (await s.callWS({
    type: "recorder/statistics_during_period",
    start_time: n.start.toISOString(),
    end_time: n.end.toISOString(),
    statistic_ids: [t.entity],
    period: e.bucket.interval,
    types: [r]
  }))[t.entity] ?? [];
  return Zt(i, o, e.bucket.value, e.missing.mode);
}
async function ni(s, e, t, i) {
  const r = ie(e.range), n = (r.end.getTime() - r.start.getTime()) / 36e5;
  if (!s.callApi)
    return {
      source: "history",
      buckets: w(i, "history"),
      warning: "This Home Assistant object does not expose callApi for history fallback."
    };
  if (n > e.data.raw_history_hours)
    return {
      source: "history",
      buckets: w(i, "history"),
      warning: `Raw history fallback is capped at ${e.data.raw_history_hours} hours by default. Use recorder statistics or reduce range.`
    };
  try {
    const o = (await s.callApi(
      "GET",
      `history/period/${r.start.toISOString()}`,
      {
        end_time: r.end.toISOString(),
        filter_entity_id: t.entity,
        minimal_response: !0,
        no_attributes: !0
      }
    )).flat();
    return {
      source: "history",
      buckets: ei(i, o, e.bucket.value, e.missing.mode)
    };
  } catch (a) {
    return {
      source: "history",
      buckets: w(i, "history"),
      warning: dt(a, "History fallback failed.")
    };
  }
}
function dt(s, e) {
  return s instanceof Error && s.message ? s.message : e;
}
const ai = "universal-heatmap-card:debug";
function oi(s) {
  var e;
  if ((s == null ? void 0 : s.debug) === !0)
    return !0;
  if ((s == null ? void 0 : s.debug) === !1 || typeof window > "u")
    return !1;
  try {
    const t = (e = window.localStorage) == null ? void 0 : e.getItem(ai);
    return t === "1" || t === "true";
  } catch {
    return !1;
  }
}
function y() {
  var s, e;
  return ((e = (s = globalThis.performance) == null ? void 0 : s.now) == null ? void 0 : e.call(s)) ?? Date.now();
}
function D(s) {
  return Math.round(s * 10) / 10;
}
function b(s, e, t) {
  if (s) {
    if (t) {
      console.debug(`[Universal Heatmap Card] ${e}`, t);
      return;
    }
    console.debug(`[Universal Heatmap Card] ${e}`);
  }
}
function ht() {
  return {
    schema: [
      { name: "title", selector: { text: {} } },
      {
        name: "entities",
        required: !0,
        selector: {
          entity: {
            domain: "sensor",
            multiple: !0,
            reorder: !0
          }
        }
      },
      { name: "debug", selector: { boolean: {} } },
      {
        type: "expandable",
        name: "range",
        title: "Range",
        schema: [
          { name: "hours", selector: { number: { min: 1, max: 720, mode: "box" } } },
          { name: "days", selector: { number: { min: 1, max: 365, mode: "box" } } },
          { name: "align", selector: { select: { options: [
            { value: "day", label: "Fixed days, 00:00-23:59" },
            { value: "rolling", label: "Rolling window" }
          ] } } }
        ]
      },
      {
        type: "expandable",
        name: "bucket",
        title: "Bucket",
        schema: [
          { name: "interval", selector: { select: { options: ["5minute", "hour", "day", "week", "month"] } } },
          { name: "value", selector: { select: { options: [
            "mean",
            "min",
            "max",
            "last",
            "state",
            "sum",
            "delta",
            "change",
            "count",
            "percent_on",
            "duration_on"
          ] } } }
        ]
      },
      {
        type: "expandable",
        name: "scale",
        title: "Scale",
        schema: [
          { name: "preset", selector: { select: { options: [
            "auto",
            "temperature",
            "power",
            "energy_delta",
            "humidity",
            "percent_health",
            "percent_utilization",
            "filter_dp",
            "filter_life",
            "filter_load",
            "battery",
            "signal_quality",
            "binary_runtime"
          ] } } },
          { name: "min", selector: { number: { mode: "box" } } },
          { name: "max", selector: { number: { mode: "box" } } },
          { name: "unit", selector: { text: {} } },
          {
            name: "sensitivity",
            selector: { number: { min: 0.2, max: 4, step: 0.1, mode: "slider" } }
          },
          {
            name: "outlier_clip",
            selector: { number: { min: 0, max: 20, step: 0.5, mode: "box" } }
          }
        ]
      },
      {
        type: "expandable",
        name: "data",
        title: "Data",
        schema: [
          { name: "provider", selector: { select: { options: ["auto", "statistics", "history"] } } },
          { name: "refresh_interval", selector: { number: { min: 0, max: 86400, mode: "box" } } },
          { name: "defer_until_visible", selector: { boolean: {} } },
          { name: "max_concurrent_requests", selector: { number: { min: 1, max: 8, mode: "box" } } },
          { name: "max_cells", selector: { number: { min: 1, max: 5e4, mode: "box" } } }
        ]
      }
    ],
    computeLabel: (r) => {
      const n = {
        title: "Title",
        entities: "Entities",
        debug: "Debug logging",
        hours: "Hours",
        days: "Days",
        refresh_interval: "Refresh interval",
        defer_until_visible: "Load when visible",
        max_concurrent_requests: "Concurrent recorder requests",
        max_cells: "Maximum cells",
        interval: "Interval",
        value: "Value",
        provider: "Provider",
        preset: "Scale preset",
        min: "Minimum value",
        max: "Maximum value",
        unit: "Display unit",
        sensitivity: "Scale tuning",
        outlier_clip: "Outlier clip",
        align: "Alignment"
      };
      return r.name ? n[r.name] : void 0;
    },
    computeHelper: (r) => {
      const n = {
        entities: "Choose one or more numeric sensor entities. Existing YAML names and per-entity options are preserved for unchanged entities.",
        debug: "Writes cache and timing details to the browser console. Leave off unless diagnosing.",
        title: "Optional card title. Leave blank to use the active entity name.",
        hours: "Optional rolling or fixed-hour window. Usually leave empty when using days.",
        days: "Number of days to show. Hourly fixed-day heatmaps use full local days.",
        align: "Fixed days align to local midnight and render stable 00:00-23:59 columns. Rolling ends at the current time.",
        interval: "Bucket width for the heatmap cells.",
        value: "Recorder statistic or history value to aggregate into each bucket.",
        provider: "Auto prefers recorder statistics and falls back to capped raw history when needed.",
        preset: "Unit-aware color and bucket defaults. Auto infers from device class, unit, and entity name.",
        min: "Optional fixed lower scale bound. Leave empty to auto-range from observed bucket values.",
        max: "Optional fixed upper scale bound. Leave empty to auto-range from observed bucket values.",
        unit: "Optional label suffix for summary and legend values.",
        refresh_interval: "Minimum seconds between recorder refreshes during Home Assistant updates. Set to 0 to cache until the card config changes.",
        defer_until_visible: "Keeps off-screen cards from asking recorder for history until they scroll near the viewport.",
        max_concurrent_requests: "Shared browser-side limit for recorder/history requests from this card type. Default is 2.",
        sensitivity: "Higher values exaggerate close differences; lower values soften peaky data.",
        outlier_clip: "Percentile trim for auto-range scaling. Leave empty for full observed range."
      };
      return r.name ? n[r.name] : void 0;
    }
  };
}
function j(s) {
  return mt(s).map((e) => typeof e == "string" ? e : e.entity).filter((e) => typeof e == "string" && e.length > 0);
}
function mt(s) {
  var t;
  return ((t = s.entities) != null && t.length ? s.entities : s.entity ? [s.entity] : []).map((i) => typeof i == "string" ? i : { ...i });
}
function de(s, e) {
  const t = /* @__PURE__ */ new Map();
  for (const i of mt(s)) {
    const r = typeof i == "string" ? i : i.entity;
    r && t.set(r, typeof i == "string" ? i : { ...i });
  }
  return e.map((i) => t.get(i) ?? i);
}
function li(s, e, t) {
  const i = j(s), r = t.trim(), n = de(s, i).map((o) => {
    const l = typeof o == "string" ? o : o.entity;
    if (l !== e)
      return o;
    const c = typeof o == "string" ? { entity: l } : { ...o };
    return r ? c.name = r : delete c.name, Object.keys(c).length === 1 ? l : c;
  }), a = {
    ...s,
    entities: n
  };
  return delete a.entity, a;
}
const pt = 56, he = 8, ci = 12, ui = 6, we = 4, di = 12, hi = 560, Ke = 3, mi = 7, pi = 22, _i = 58, fi = 18;
function gi(s) {
  const e = Math.max(1, Math.floor(s));
  return e * pt + Math.max(0, e - 1) * he;
}
function bi(s) {
  return !Number.isFinite(s) || s <= 0 ? we : Math.ceil((s + he) / (pt + he));
}
function yi(s, e = {}) {
  return Ai(
    bi(_t(s, e)),
    we,
    di
  );
}
function vi(s, e = {}) {
  return Math.max(1, Math.ceil(_t(s, e) / 50));
}
function _t(s, e = {}) {
  return ft(s, e) + xi(s);
}
function ft(s, e = {}) {
  let t = 58;
  return t += 16, s.entities.length > 1 && (t += wi(s)), (e.loading || e.warning || e.error) && (t += 33), s.axes.show_key && (t += 24), t += 25, s.legend.show && (t += 25), t;
}
function xi(s, e = hi) {
  const t = Math.max(1, ct(s)), i = $i(s.bucket.interval, t), r = Math.ceil(t / i), n = s.axes.show && s.axes.y_labels ? _i : 0, a = s.axes.show && s.axes.x_labels ? fi : 0, o = Math.max(160, e - n), l = Math.max(
    mi,
    Math.min(
      pi,
      Math.floor((o - Math.max(0, i - 1) * Ke) / i)
    )
  );
  return a + r * l + Math.max(0, r - 1) * Ke;
}
function wi(s) {
  switch (s.navigation.mode) {
    case "dots":
      return 24;
    case "tabs": {
      const t = Math.max(1, Math.ceil(s.entities.length / 3));
      return t * 32 + Math.max(0, t - 1) * 8 + 10;
    }
    case "arrows":
    case "dropdown":
    default:
      return 42;
  }
}
function $i(s, e) {
  return s === "hour" ? 24 : s === "5minute" ? 48 : s === "day" ? 7 : s === "month" ? 12 : Math.min(12, Math.ceil(Math.sqrt(e * 1.8)));
}
function Ai(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const Si = [
  { value: 0, color: "#3a6ea5" },
  { value: 0.5, color: "#6fbf73" },
  { value: 1, color: "#f6c85f" }
];
function ki(s, e) {
  var _;
  const t = s.map((g) => g.value).filter((g) => typeof g == "number" && Number.isFinite(g)), i = t.filter((g) => g > 0), n = e.ignore_zero === !0 || e.ignore_zero !== !1 && i.length > 0 && t.some((g) => g === 0) && Math.min(...i) > 0 ? i : t, a = Ci(n, e.outlier_clip), o = a.min, l = a.max, c = typeof e.min == "number" ? e.min : o, u = typeof e.max == "number" ? e.max : l === c ? c + 1 : l, d = (_ = e.stops) != null && _.length ? e.stops : Si, h = Mi(d, c, u, e.invert ?? !1), p = Ni(e.sensitivity);
  return {
    min: c,
    max: u,
    unit: e.unit,
    sensitivity: p,
    stops: h,
    clippedLow: t.some((g) => g < c),
    clippedHigh: t.some((g) => g > u)
  };
}
function gt(s, e) {
  var r, n, a, o;
  if (s === null || !Number.isFinite(s))
    return "rgba(127, 127, 127, 0.22)";
  const t = Ti(s, e), i = e.stops;
  if (i.length === 0)
    return "#999999";
  if (i.length === 1)
    return ((r = i[0]) == null ? void 0 : r.color) ?? "#999999";
  for (let l = 0; l < i.length - 1; l += 1) {
    const c = i[l], u = i[l + 1];
    if (!(!c || !u) && t >= c.value && t <= u.value) {
      const d = u.value - c.value || 1, h = (t - c.value) / d;
      return zi(c.color, u.color, h);
    }
  }
  return t < (((n = i[0]) == null ? void 0 : n.value) ?? e.min) ? ((a = i[0]) == null ? void 0 : a.color) ?? "#999999" : ((o = i[i.length - 1]) == null ? void 0 : o.color) ?? "#999999";
}
function Ei(s, e = 18) {
  const t = s.max - s.min || 1, i = Math.max(2, e);
  return Array.from({ length: i }, (r, n) => {
    const a = n / (i - 1), o = s.min + t * a;
    return `${gt(o, s)} ${a * 100}%`;
  }).join(", ");
}
function C(s, e, t) {
  if (s === null || !Number.isFinite(s))
    return "missing";
  const i = Math.abs(s), r = i >= 100 ? 0 : i >= 10 ? 1 : 2, n = new Intl.NumberFormat(t, {
    maximumFractionDigits: r
  }).format(s);
  return e.unit ? `${n} ${e.unit}` : n;
}
function Mi(s, e, t, i) {
  const r = s.every((l) => l.value >= 0 && l.value <= 1), a = s.map((l) => r ? { ...l, value: e + l.value * (t - e) } : l).sort((l, c) => l.value - c.value);
  if (!i)
    return a;
  const o = a.map((l) => l.color).reverse();
  return a.map((l, c) => ({
    ...l,
    color: o[c] ?? l.color
  }));
}
function Ci(s, e) {
  if (s.length === 0)
    return { min: 0, max: 1 };
  const t = [...s].sort((a, o) => a - o), i = Li(e);
  if (!i)
    return {
      min: t[0] ?? 0,
      max: t[t.length - 1] ?? 1
    };
  const r = Ye(t, i.low), n = Ye(t, i.high);
  return n <= r ? {
    min: t[0] ?? 0,
    max: t[t.length - 1] ?? r + 1
  } : { min: r, max: n };
}
function Li(s) {
  if (typeof s == "number") {
    if (!Number.isFinite(s) || s <= 0)
      return null;
    const i = k(s, 0, 49);
    return { low: i, high: 100 - i };
  }
  if (!Array.isArray(s) || s.length !== 2)
    return null;
  const e = Number(s[0]), t = Number(s[1]);
  return !Number.isFinite(e) || !Number.isFinite(t) || t <= e ? null : {
    low: k(e, 0, 100),
    high: k(t, 0, 100)
  };
}
function Ye(s, e) {
  if (s.length === 0)
    return 0;
  const t = k(
    Math.ceil(e / 100 * s.length) - 1,
    0,
    s.length - 1
  );
  return s[t] ?? s[0] ?? 0;
}
function Ni(s) {
  return typeof s != "number" || !Number.isFinite(s) || s <= 0 ? 1 : k(s, 0.1, 5);
}
function Ti(s, e) {
  const t = e.max - e.min || 1, r = (k(s, e.min, e.max) - e.min) / t, n = k(0.5 + (r - 0.5) * e.sensitivity, 0, 1);
  return e.min + n * t;
}
function zi(s, e, t) {
  const i = Je(s), r = Je(e);
  if (!i || !r)
    return t < 0.5 ? s : e;
  const n = Math.round(i.r + (r.r - i.r) * t), a = Math.round(i.g + (r.g - i.g) * t), o = Math.round(i.b + (r.b - i.b) * t);
  return `rgb(${n}, ${a}, ${o})`;
}
function Je(s) {
  const e = s.replace("#", "").trim(), t = e.length === 3 ? e.split("").map((i) => `${i}${i}`).join("") : e;
  return /^[0-9a-fA-F]{6}$/.test(t) ? {
    r: Number.parseInt(t.slice(0, 2), 16),
    g: Number.parseInt(t.slice(2, 4), 16),
    b: Number.parseInt(t.slice(4, 6), 16)
  } : null;
}
function k(s, e, t) {
  return s < e ? e : s > t ? t : s;
}
const J = "universal-heatmap-card", Q = "Universal Heatmap Card", Ri = "0.1.1", me = `${J}-editor`;
class Qe extends Error {
  constructor() {
    super("Stale heatmap load skipped.");
  }
}
const Z = class Z extends N {
  constructor() {
    super(...arguments), this._activeIndex = 0, this._buckets = [], this._loading = !1, this._cache = /* @__PURE__ */ new Map(), this._debug = !1, this._deferredLoadPending = !1, this._visibleForLoad = typeof globalThis.IntersectionObserver > "u", this._loadSeq = 0;
  }
  setConfig(e) {
    var i, r;
    const t = (r = (i = this._normalized) == null ? void 0 : i.entities[this._activeIndex]) == null ? void 0 : r.entity;
    this._config = e, this._debug = oi(e), this._cache.clear(), this._inFlightKey = void 0, this._loadSeq += 1, this._normalized = je(e, this.hass), this._activeIndex = this._resolveActiveIndex(t), this._tooltip = void 0, b(this._debug, "config applied", {
      entityCount: this._normalized.entities.length,
      bucket: this._normalized.bucket,
      range: this._normalized.range,
      boundToGrid: this._normalized.layout.bound_to_grid,
      refreshInterval: this._normalized.data.refresh_interval,
      deferUntilVisible: this._normalized.data.defer_until_visible,
      maxConcurrentRequests: this._normalized.data.max_concurrent_requests
    }), this.hass && this._requestActiveSeriesLoad();
  }
  getCardSize() {
    return this._estimatedMasonryRows();
  }
  getGridOptions() {
    var o, l, c, u, d, h, p, _;
    const e = (l = (o = this._config) == null ? void 0 : o.grid_options) == null ? void 0 : l.rows, t = (u = (c = this._config) == null ? void 0 : c.grid_options) == null ? void 0 : u.columns, i = typeof e == "number" && Number.isFinite(e) ? Math.max(1, e) : this._estimatedGridRows(), r = typeof t == "number" && Number.isFinite(t) ? Math.max(1, t) : ci, n = (h = (d = this._config) == null ? void 0 : d.grid_options) == null ? void 0 : h.min_rows, a = (_ = (p = this._config) == null ? void 0 : p.grid_options) == null ? void 0 : _.min_columns;
    return {
      rows: i,
      columns: r,
      min_rows: typeof n == "number" && Number.isFinite(n) ? Math.min(n, i) : Math.min(we, i),
      min_columns: typeof a == "number" && Number.isFinite(a) ? Math.min(a, r) : Math.min(ui, r)
    };
  }
  connectedCallback() {
    super.connectedCallback(), this._setupVisibilityObserver(), this._requestActiveSeriesLoad();
  }
  disconnectedCallback() {
    var e;
    (e = this._visibilityObserver) == null || e.disconnect(), this._visibilityObserver = void 0, super.disconnectedCallback();
  }
  static getStubConfig() {
    return {
      entity: "sensor.example_temperature",
      range: { days: 30 },
      bucket: { interval: "day", value: "mean" },
      scale: { preset: "temperature" }
    };
  }
  static getConfigElement() {
    return document.createElement(me);
  }
  static getConfigForm() {
    return ht();
  }
  updated(e) {
    this._config && (e.has("hass") || e.has("_activeIndex")) && (this._normalized = je(this._config, this.hass), this._requestActiveSeriesLoad()), (e.has("_buckets") || e.has("_loading") || e.has("_warning")) && this.updateComplete.then(() => this._drawHeatmap());
  }
  render() {
    var n;
    if (!this._normalized)
      return f`<ha-card><div class="empty">Configure ${Q}</div></ha-card>`;
    const e = this._normalized.entities[this._activeIndex], t = e ? (n = this.hass) == null ? void 0 : n.states[e.entity] : void 0, i = this._normalized.title ?? (e == null ? void 0 : e.name) ?? Q, r = this._shouldBoundToGrid() ? "grid-bound" : "";
    return f`
      <ha-card class=${r}>
        <div class="header">
          <div>
            <div class="title">${i}</div>
            ${e ? f`<div class="subtitle">${e.entity}</div>` : m}
          </div>
          ${t ? f`<div class="state-chip">${this._formatEntityState(t)}</div>` : m}
        </div>

        ${this._renderNavigation()}

        <div class="body">
          ${this._loading ? f`<div class="status" role="status">Loading heatmap...</div>` : m}
          ${this._error ? f`<div class="status error" role="alert" title=${this._error}>${this._error}</div>` : m}
          ${this._warning ? f`<div class="status warning" role="status" title=${this._warning}>${this._warning}</div>` : m}
          ${this._normalized.axes.show_key ? this._renderAxisKey() : m}
          <div class="canvas-wrap">
            <canvas
              role="img"
              tabindex="0"
              aria-label=${this._heatmapDescription(i)}
              @mousemove=${this._handleCanvasMove}
              @mouseleave=${this._clearTooltip}
              @keydown=${this._handleCanvasKeyDown}
              @click=${this._handleCanvasClick}
            ></canvas>
            ${this._tooltip && this._normalized.tooltip.show ? f`<div
                  class="tooltip"
                  style=${`left:${this._tooltip.x}px;top:${this._tooltip.y}px`}
                >
                  ${this._tooltip.label}
                </div>` : m}
          </div>
          ${this._renderSummary()}
          ${this._normalized.legend.show && this._scale ? this._renderLegend() : m}
        </div>
      </ha-card>
    `;
  }
  _renderNavigation() {
    const e = this._normalized;
    if (!e || e.entities.length <= 1)
      return m;
    if (e.navigation.mode === "dropdown")
      return f`
        <div class="nav">
          <select @change=${this._handleSelectChange}>
            ${e.entities.map(
        (t, i) => f`
                <option value=${i} ?selected=${i === this._activeIndex}>
                  ${t.name}
                </option>
              `
      )}
          </select>
        </div>
      `;
    if (e.navigation.mode === "arrows") {
      const t = e.entities[this._activeIndex];
      return f`
        <div class="nav arrows">
          <button type="button" @click=${this._previousEntity} aria-label="Previous entity">
            ‹
          </button>
          <span>${t == null ? void 0 : t.name}</span>
          <button type="button" @click=${this._nextEntity} aria-label="Next entity">›</button>
        </div>
      `;
    }
    return e.navigation.mode === "dots" ? f`
        <div class="nav dots">
          ${e.entities.map(
      (t, i) => f`
              <button
                type="button"
                class=${i === this._activeIndex ? "active" : ""}
                title=${t.name}
                aria-label=${t.name}
                aria-pressed=${i === this._activeIndex ? "true" : "false"}
                @click=${() => this._setActiveIndex(i)}
              ></button>
            `
    )}
        </div>
      ` : f`
      <div class="nav tabs">
        ${e.entities.map(
      (t, i) => f`
            <button
              type="button"
              class=${i === this._activeIndex ? "active" : ""}
              title=${t.name}
              aria-pressed=${i === this._activeIndex ? "true" : "false"}
              @click=${() => this._setActiveIndex(i)}
            >
              ${t.name}
            </button>
          `
    )}
      </div>
    `;
  }
  _estimatedGridRows() {
    const e = this._normalized;
    return e ? yi(e, this._layoutState()) : 6;
  }
  _estimatedMasonryRows() {
    const e = this._normalized;
    return e ? vi(e, this._layoutState()) : 6;
  }
  _layoutState() {
    return {
      loading: this._loading,
      warning: !!this._warning,
      error: !!this._error
    };
  }
  _renderSummary() {
    var a, o, l;
    if (!this._scale || this._buckets.length === 0)
      return m;
    const e = this._buckets.map((c) => c.value).filter((c) => typeof c == "number" && Number.isFinite(c));
    if (e.length === 0)
      return f`<div class="summary">No bucket data loaded.</div>`;
    const t = (o = (a = this.hass) == null ? void 0 : a.locale) == null ? void 0 : o.language, i = Math.min(...e), r = Math.max(...e), n = ((l = [...this._buckets].reverse().find((c) => c.value !== null)) == null ? void 0 : l.value) ?? null;
    return f`
      <div class="summary" aria-live="polite">
        <span>Low ${C(i, this._scale, t)}</span>
        <span>High ${C(r, this._scale, t)}</span>
        <span>Latest ${C(n, this._scale, t)}</span>
      </div>
    `;
  }
  _renderAxisKey() {
    return this._normalized ? f`
      <div class="axis-key" aria-label="Heatmap encoding">
        <span><b>X</b> ${this._xAxisLabel()}</span>
        <span><b>Y</b> ${this._yAxisLabel()}</span>
        <span><b>Color</b> ${this._colorAxisLabel()}</span>
      </div>
    ` : m;
  }
  _renderLegend() {
    var i, r, n, a;
    if (!this._scale)
      return m;
    const e = `${this._scale.clippedLow ? "≤ " : ""}${C(
      this._scale.min,
      this._scale,
      (r = (i = this.hass) == null ? void 0 : i.locale) == null ? void 0 : r.language
    )}`, t = `${this._scale.clippedHigh ? "≥ " : ""}${C(
      this._scale.max,
      this._scale,
      (a = (n = this.hass) == null ? void 0 : n.locale) == null ? void 0 : a.language
    )}`;
    return f`
      <div class="legend">
        <span>${e}</span>
        <div
          class="legend-bar"
          style=${`background: linear-gradient(90deg, ${Ei(this._scale)});`}
        ></div>
        <span>${t}</span>
      </div>
    `;
  }
  async _loadActiveSeries() {
    const e = this._normalized, t = this.hass, i = e == null ? void 0 : e.entities[this._activeIndex];
    if (!e || !t || !i)
      return;
    const r = this._seriesCacheKey(e, i), n = this._cache.get(r);
    if (n && this._isCacheFresh(n, e.data.refresh_interval)) {
      b(this._debug, "cache hit", {
        entity: i.entity,
        source: n.result.source,
        buckets: n.result.buckets.length,
        ageMs: Date.now() - n.loadedAt
      }), this._buckets = n.result.buckets, this._scale = n.scale, this._warning = n.result.warning, this._error = void 0, this._loading = !1;
      return;
    }
    if (this._inFlightKey === r) {
      b(this._debug, "load already in flight", {
        entity: i.entity,
        queue: Xe(e.data.max_concurrent_requests)
      });
      return;
    }
    n && b(this._debug, "cache stale", {
      entity: i.entity,
      ageMs: Date.now() - n.loadedAt,
      refreshInterval: e.data.refresh_interval
    });
    const a = ++this._loadSeq;
    this._inFlightKey = r, this._loading = !0, this._error = void 0, this._warning = void 0;
    const o = this._debug ? y() : 0, l = this._debug ? y() : 0;
    b(this._debug, "load start", {
      entity: i.entity,
      provider: e.data.provider,
      range: e.range,
      bucket: e.bucket
    });
    try {
      const c = await Ut(
        async () => {
          if (a !== this._loadSeq)
            throw new Qe();
          return si(t, e, i);
        },
        {
          maxConcurrent: e.data.max_concurrent_requests,
          onQueued: (_) => b(this._debug, "request queued", {
            entity: i.entity,
            ..._
          }),
          onStart: (_) => b(this._debug, "request start", {
            entity: i.entity,
            ..._
          })
        }
      );
      if (a !== this._loadSeq)
        return;
      const u = this._debug ? D(y() - l) : 0, d = this._debug ? y() : 0, h = ki(c.buckets, {
        ...e.scale,
        ...i.scale
      }), p = this._debug ? D(y() - d) : 0;
      this._cache.set(r, { result: c, scale: h, loadedAt: Date.now() }), this._buckets = c.buckets, this._scale = h, this._warning = c.warning, b(this._debug, "load complete", {
        entity: i.entity,
        source: c.source,
        buckets: c.buckets.length,
        fetchMs: u,
        scaleMs: p,
        totalMs: D(y() - o),
        scaleMin: h.min,
        scaleMax: h.max,
        warning: c.warning
      });
    } catch (c) {
      if (c instanceof Qe) {
        b(this._debug, "stale queued load skipped", {
          entity: i.entity
        });
        return;
      }
      if (a !== this._loadSeq)
        return;
      this._error = c instanceof Error ? c.message : "Could not load heatmap data.", this._buckets = [], b(this._debug, "load failed", {
        entity: i.entity,
        totalMs: D(y() - o),
        error: this._error
      });
    } finally {
      this._inFlightKey === r && (this._inFlightKey = void 0), a === this._loadSeq && (this._loading = !1);
    }
  }
  _requestActiveSeriesLoad() {
    if (!(!this._normalized || !this.hass)) {
      if (this._shouldDeferLoad()) {
        this._deferredLoadPending = !0, b(this._debug, "load deferred until visible", {
          queue: Xe(this._normalized.data.max_concurrent_requests)
        });
        return;
      }
      this._deferredLoadPending = !1, this._loadActiveSeries();
    }
  }
  _shouldDeferLoad() {
    var e;
    return !((e = this._normalized) != null && e.data.defer_until_visible) || typeof globalThis.IntersectionObserver > "u" ? !1 : !this._visibleForLoad;
  }
  _setupVisibilityObserver() {
    var e;
    if ((e = this._visibilityObserver) == null || e.disconnect(), typeof globalThis.IntersectionObserver > "u") {
      this._visibleForLoad = !0;
      return;
    }
    this._visibilityObserver = new IntersectionObserver(
      (t) => {
        const i = t.some((r) => r.isIntersecting || r.intersectionRatio > 0);
        i !== this._visibleForLoad && (this._visibleForLoad = i, i && this._deferredLoadPending && this._requestActiveSeriesLoad());
      },
      { rootMargin: "320px 0px" }
    ), this._visibilityObserver.observe(this);
  }
  _seriesCacheKey(e, t) {
    return JSON.stringify({
      entity: t.entity,
      range: e.range,
      bucket: e.bucket,
      data: {
        provider: e.data.provider,
        max_cells: e.data.max_cells,
        raw_history_hours: e.data.raw_history_hours
      },
      missing: e.missing.mode,
      scale: { ...e.scale, ...t.scale }
    });
  }
  _isCacheFresh(e, t) {
    return t <= 0 ? !0 : Date.now() - e.loadedAt < t * 1e3;
  }
  _drawHeatmap() {
    const e = this.renderRoot.querySelector("canvas");
    if (!e || !this._scale)
      return;
    const t = e.getContext("2d");
    if (!t)
      return;
    const i = this._debug ? y() : 0, r = e.parentElement, n = Math.max(260, Math.floor((r == null ? void 0 : r.clientWidth) ?? 320)), a = this._boundedCanvasHeight(), o = this._calculateLayout(n, a), l = window.devicePixelRatio || 1;
    e.width = Math.floor(o.width * l), e.height = Math.floor(o.height * l), e.style.height = `${o.height}px`, e.style.width = `${o.width}px`, t.setTransform(l, 0, 0, l, 0, 0), t.clearRect(0, 0, o.width, o.height), this._drawAxes(t, o), this._buckets.forEach((c, u) => {
      const d = u % o.cols, h = Math.floor(u / o.cols), p = o.gridX + d * (o.cell + o.gap), _ = o.gridY + h * (o.cell + o.gap);
      t.fillStyle = gt(c.value, this._scale), t.fillRect(p, _, o.cell, o.cell), c.quality === "carried" && (t.fillStyle = "rgba(255, 255, 255, 0.34)", t.fillRect(p, _ + o.cell - 3, o.cell, 3));
    }), this._renderLayout = o, b(this._debug, "draw complete", {
      buckets: this._buckets.length,
      cols: o.cols,
      rows: o.rows,
      cell: o.cell,
      width: o.width,
      height: o.height,
      maxCanvasHeight: a,
      ms: D(y() - i)
    });
  }
  _calculateLayout(e, t) {
    var R;
    const i = ((R = this._normalized) == null ? void 0 : R.bucket.interval) ?? "day", r = Math.max(1, this._buckets.length), n = i === "hour" ? 24 : i === "5minute" ? 48 : i === "day" ? 7 : i === "month" ? 12 : Math.min(12, Math.ceil(Math.sqrt(r * 1.8))), a = 3, o = this._shouldShowRowLabels() ? 58 : 0, l = this._shouldShowXAxisLabels() ? 18 : 0, c = Math.max(160, e - o), u = Math.ceil(r / n), d = 7;
    let h = Math.max(d, Math.min(22, Math.floor((c - a * (n - 1)) / n)));
    if (typeof t == "number") {
      const B = Math.max(0, t - l), M = Math.floor((B - Math.max(0, u - 1) * a) / u);
      Number.isFinite(M) && M >= d && (h = Math.min(h, M));
    }
    const p = n * h + Math.max(0, n - 1) * a, _ = u * h + Math.max(0, u - 1) * a, g = l + _;
    return {
      cols: n,
      rows: u,
      cell: h,
      gap: a,
      width: e,
      height: g,
      gridX: o,
      gridY: l,
      gridWidth: p,
      gridHeight: _
    };
  }
  _boundedCanvasHeight() {
    var r, n;
    if (!this._shouldBoundToGrid())
      return;
    const e = (n = (r = this._config) == null ? void 0 : r.grid_options) == null ? void 0 : n.rows;
    if (typeof e != "number" || !Number.isFinite(e) || e <= 0)
      return;
    const t = this._normalized;
    if (!t)
      return;
    const i = gi(e) - ft(t, this._layoutState());
    if (!(i <= 0))
      return Math.max(120, i);
  }
  _shouldBoundToGrid() {
    var i, r, n;
    const e = ((i = this._normalized) == null ? void 0 : i.layout.bound_to_grid) ?? "auto";
    if (e === !0)
      return !0;
    if (e === !1)
      return !1;
    const t = (n = (r = this._config) == null ? void 0 : r.grid_options) == null ? void 0 : n.rows;
    return typeof t == "number" && Number.isFinite(t) && t > 0;
  }
  _drawAxes(e, t) {
    var a;
    if (!((a = this._normalized) != null && a.axes.show))
      return;
    const i = getComputedStyle(this), r = i.getPropertyValue("--secondary-text-color").trim() || "#64748b", n = i.getPropertyValue("--divider-color").trim() || "#d8dee8";
    if (e.save(), e.font = "11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", e.fillStyle = r, e.strokeStyle = n, e.lineWidth = 1, this._normalized.axes.x_labels)
      for (const o of this._xAxisTicks(t)) {
        const l = t.gridX + o.col * (t.cell + t.gap);
        e.textAlign = o.align, e.textBaseline = "top", e.fillText(o.label, l, 0);
      }
    if (this._shouldShowRowLabels()) {
      e.textAlign = "right", e.textBaseline = "middle";
      for (let o = 0; o < t.rows; o += 1) {
        const l = this._buckets[o * t.cols];
        if (!l)
          continue;
        const c = t.gridY + o * (t.cell + t.gap) + t.cell / 2;
        e.fillText(this._rowLabel(l.start), t.gridX - 8, c);
      }
      e.beginPath(), e.moveTo(t.gridX - 3.5, t.gridY), e.lineTo(t.gridX - 3.5, t.gridY + t.gridHeight), e.stroke();
    }
    e.restore();
  }
  _handleCanvasMove(e) {
    var h, p, _;
    if (!this._renderLayout || !this._scale || !((h = this._normalized) != null && h.tooltip.show))
      return;
    const i = e.currentTarget.getBoundingClientRect(), r = e.clientX - i.left, n = e.clientY - i.top, a = this._renderLayout.cell + this._renderLayout.gap;
    if (r < this._renderLayout.gridX || r > this._renderLayout.gridX + this._renderLayout.gridWidth || n < this._renderLayout.gridY || n > this._renderLayout.gridY + this._renderLayout.gridHeight) {
      this._tooltip = void 0;
      return;
    }
    const o = Math.floor((r - this._renderLayout.gridX) / a), c = Math.floor((n - this._renderLayout.gridY) / a) * this._renderLayout.cols + o, u = this._buckets[c];
    if (!u) {
      this._tooltip = void 0;
      return;
    }
    const d = `${this._formatDate(u.start)} - ${this._formatDate(u.end)}: ${C(
      u.value,
      this._scale,
      (_ = (p = this.hass) == null ? void 0 : p.locale) == null ? void 0 : _.language
    )}`;
    this._tooltip = {
      x: Math.min(r + 12, i.width - 160),
      y: Math.max(4, n - 28),
      bucket: u,
      label: d
    };
  }
  _handleCanvasClick() {
    this._openActiveEntityDetails();
  }
  _handleCanvasKeyDown(e) {
    e.key !== "Enter" && e.key !== " " || (e.preventDefault(), this._openActiveEntityDetails());
  }
  _openActiveEntityDetails() {
    const e = this._normalized, t = e == null ? void 0 : e.entities[this._activeIndex];
    t && this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        bubbles: !0,
        composed: !0,
        detail: { entityId: t.entity }
      })
    );
  }
  _heatmapDescription(e) {
    return `${e} heatmap. X axis ${this._xAxisLabel()}, Y axis ${this._yAxisLabel()}, color ${this._colorAxisLabel()}. Press Enter to open entity details.`;
  }
  _clearTooltip() {
    this._tooltip = void 0;
  }
  _setActiveIndex(e) {
    !this._normalized || e < 0 || e >= this._normalized.entities.length || (this._activeIndex = e);
  }
  _resolveActiveIndex(e) {
    if (!this._normalized)
      return 0;
    if (e) {
      const t = this._normalized.entities.findIndex(
        (i) => i.entity === e
      );
      return t >= 0 ? t : 0;
    }
    return Math.min(this._activeIndex, Math.max(0, this._normalized.entities.length - 1));
  }
  _previousEntity() {
    if (!this._normalized)
      return;
    const e = this._normalized.entities.length;
    this._activeIndex = (this._activeIndex + e - 1) % e;
  }
  _nextEntity() {
    this._normalized && (this._activeIndex = (this._activeIndex + 1) % this._normalized.entities.length);
  }
  _handleSelectChange(e) {
    const t = e.target;
    this._setActiveIndex(Number(t.value));
  }
  _formatEntityState(e) {
    var i;
    if ((i = this.hass) != null && i.formatEntityState)
      return this.hass.formatEntityState(e);
    const t = e.attributes.unit_of_measurement ? ` ${String(e.attributes.unit_of_measurement)}` : "";
    return `${e.state}${t}`;
  }
  _formatDate(e) {
    var t, i, r;
    return new Intl.DateTimeFormat((i = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : i.language, {
      month: "short",
      day: "numeric",
      hour: ((r = this._normalized) == null ? void 0 : r.bucket.interval) === "hour" ? "numeric" : void 0
    }).format(e);
  }
  _xAxisLabel() {
    var e;
    switch ((e = this._normalized) == null ? void 0 : e.bucket.interval) {
      case "5minute":
      case "hour":
        return "time of day";
      case "day":
        return "day of week";
      case "week":
        return "week";
      case "month":
        return "month";
      default:
        return "bucket";
    }
  }
  _yAxisLabel() {
    var e;
    switch ((e = this._normalized) == null ? void 0 : e.bucket.interval) {
      case "5minute":
      case "hour":
        return "date";
      case "day":
        return "week row";
      case "week":
      case "month":
        return "period row";
      default:
        return "row";
    }
  }
  _colorAxisLabel() {
    var i, r;
    const e = this._bucketValueLabel((i = this._normalized) == null ? void 0 : i.bucket.value), t = (r = this._scale) != null && r.unit ? ` (${this._scale.unit})` : "";
    return `${e}${t}`;
  }
  _bucketValueLabel(e) {
    switch (e) {
      case "mean":
        return "average value";
      case "max":
        return "peak value";
      case "min":
        return "low value";
      case "last":
      case "state":
        return "last value";
      case "sum":
        return "total";
      case "delta":
      case "change":
        return "change";
      case "count":
        return "sample count";
      case "percent_on":
        return "percent on";
      case "duration_on":
        return "time on";
      default:
        return "bucket value";
    }
  }
  _shouldShowRowLabels() {
    var e;
    return !!((e = this._normalized) != null && e.axes.show && this._normalized.axes.y_labels && this._buckets.length > 0);
  }
  _shouldShowXAxisLabels() {
    var e;
    return !!((e = this._normalized) != null && e.axes.show && this._normalized.axes.x_labels && this._buckets.length > 0);
  }
  _xAxisTicks(e) {
    var r;
    const t = (r = this._normalized) == null ? void 0 : r.bucket.interval;
    if (t === "hour")
      return this._timeTicks([0, 6, 12, 18, 23]);
    if (t === "5minute")
      return this._timeTicks([0, 12, 24, 36, 47]);
    if (t === "day")
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((n, a) => ({
        col: a,
        label: n,
        align: "center"
      }));
    if (t === "month")
      return ["Jan", "Apr", "Jul", "Oct", "Dec"].map((n, a) => ({
        col: [0, 3, 6, 9, 11][a] ?? 0,
        label: n,
        align: a === 0 ? "left" : a === 4 ? "right" : "center"
      }));
    const i = Math.max(0, e.cols - 1);
    return [
      { col: 0, label: "Start", align: "left" },
      { col: i, label: "End", align: "right" }
    ];
  }
  _timeTicks(e) {
    return e.map((t, i) => {
      const r = this._buckets[t];
      return {
        col: t,
        label: r ? this._formatHour(r.start) : String(t),
        align: i === 0 ? "left" : i === e.length - 1 ? "right" : "center"
      };
    });
  }
  _formatHour(e) {
    var i, r;
    return new Intl.DateTimeFormat((r = (i = this.hass) == null ? void 0 : i.locale) == null ? void 0 : r.language, {
      hour: "numeric"
    }).formatToParts(e).filter((n) => n.type === "hour" || n.type === "dayPeriod").map((n) => n.value.toLowerCase()).join("").replace(/\s/g, "");
  }
  _rowLabel(e) {
    var r, n, a;
    const i = ((r = this._normalized) == null ? void 0 : r.bucket.interval) === "month" ? { year: "2-digit" } : { month: "short", day: "numeric" };
    return new Intl.DateTimeFormat((a = (n = this.hass) == null ? void 0 : n.locale) == null ? void 0 : a.language, i).format(e);
  }
};
Z.properties = {
  hass: { attribute: !1 },
  _activeIndex: { state: !0 },
  _buckets: { state: !0 },
  _error: { state: !0 },
  _loading: { state: !0 },
  _normalized: { state: !0 },
  _tooltip: { state: !0 },
  _warning: { state: !0 }
}, Z.styles = tt`
    :host {
      box-sizing: border-box;
      display: block;
    }

    ha-card {
      box-sizing: border-box;
      overflow: hidden;
      width: 100%;
    }

    ha-card.grid-bound {
      max-width: 100%;
    }

    .header {
      align-items: flex-start;
      display: flex;
      gap: 12px;
      justify-content: space-between;
      padding: 16px 16px 8px;
    }

    .title {
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 600;
      line-height: 1.25;
    }

    .subtitle {
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
      margin-top: 2px;
    }

    .state-chip {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      color: var(--primary-text-color);
      font-size: 12px;
      line-height: 1;
      padding: 7px 10px;
      white-space: nowrap;
    }

    .nav {
      align-items: center;
      display: flex;
      gap: 8px;
      padding: 0 16px 10px;
    }

    .tabs {
      flex-wrap: wrap;
    }

    button,
    select {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      color: var(--primary-text-color);
      font: inherit;
      min-height: 32px;
    }

    button {
      cursor: pointer;
      padding: 0 10px;
    }

    button.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .arrows {
      justify-content: space-between;
    }

    .arrows span {
      color: var(--primary-text-color);
      font-weight: 600;
    }

    .dots button {
      border-radius: 50%;
      height: 12px;
      min-height: 12px;
      padding: 0;
      width: 12px;
    }

    .body {
      padding: 0 16px 16px;
    }

    .grid-bound .body {
      overflow: hidden;
    }

    .canvas-wrap {
      min-height: 88px;
      position: relative;
    }

    .grid-bound .canvas-wrap {
      overflow: hidden;
    }

    .axis-key {
      align-items: center;
      color: var(--secondary-text-color);
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      gap: 8px 14px;
      margin: 0 0 8px;
    }

    .axis-key b {
      color: var(--primary-text-color);
      font-weight: 700;
      margin-right: 3px;
    }

    canvas {
      display: block;
      max-width: 100%;
    }

    .status {
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-sizing: border-box;
      color: var(--secondary-text-color);
      font-size: 11px;
      line-height: 1.25;
      margin-bottom: 8px;
      max-width: 100%;
      overflow: hidden;
      padding: 6px 8px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status.warning {
      border-color: var(--warning-color, #f2c14e);
      color: var(--primary-text-color);
    }

    .status.error {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
    }

    .summary {
      color: var(--secondary-text-color);
      display: flex;
      flex-wrap: wrap;
      font-size: 12px;
      gap: 10px;
      justify-content: space-between;
      margin-top: 10px;
    }

    .legend {
      align-items: center;
      color: var(--secondary-text-color);
      display: grid;
      font-size: 12px;
      gap: 8px;
      grid-template-columns: auto 1fr auto;
      margin-top: 12px;
    }

    .legend-bar {
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      height: 9px;
    }

    .tooltip {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.22));
      color: var(--primary-text-color);
      font-size: 12px;
      max-width: 220px;
      padding: 6px 8px;
      pointer-events: none;
      position: absolute;
      z-index: 1;
    }

    .empty {
      color: var(--secondary-text-color);
      padding: 16px;
    }
  `;
let pe = Z;
const ee = class ee extends N {
  constructor() {
    super(...arguments), this._form = ht();
  }
  setConfig(e) {
    this._config = e;
  }
  render() {
    return this._config ? f`
      <ha-form
        .hass=${this.hass}
        .data=${this._editorData()}
        .schema=${this._form.schema}
        .computeLabel=${this._form.computeLabel}
        .computeHelper=${this._form.computeHelper}
        @value-changed=${this._handleValueChanged}
      ></ha-form>
      ${this._renderEntityNameEditor()}
    ` : m;
  }
  _editorData() {
    const { entity: e, ...t } = this._config ?? {};
    return {
      ...t,
      entities: j(this._config ?? {})
    };
  }
  _handleValueChanged(e) {
    if (!this._config)
      return;
    const t = e.detail.value ?? {}, i = this._selectedEntities(t.entities), r = {
      ...this._config,
      ...t,
      entities: de(this._config, i)
    };
    this._applyConfig(r);
  }
  _selectedEntities(e) {
    return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t.length > 0) : typeof e == "string" && e.length > 0 ? [e] : j(this._config ?? {});
  }
  _renderEntityNameEditor() {
    if (!this._config)
      return m;
    const e = de(this._config, j(this._config));
    return e.length === 0 ? m : f`
      <section class="editor-section" aria-label="Entity labels">
        <div class="editor-title">Entity labels</div>
        <div class="editor-helper">
          Optional tab/card labels. Leave blank to use Home Assistant's entity name.
        </div>
        ${e.map((t) => {
      const i = typeof t == "string" ? t : t.entity, r = typeof t == "string" ? "" : t.name ?? "";
      return f`
            <label class="alias-row">
              <span class="alias-copy">
                <span class="alias-entity">${i}</span>
                <span class="alias-default">${this._defaultEntityName(i)}</span>
              </span>
              <input
                .value=${r}
                placeholder="Use Home Assistant name"
                @input=${(n) => this._handleEntityNameInput(i, n)}
              />
            </label>
          `;
    })}
      </section>
    `;
  }
  _handleEntityNameInput(e, t) {
    if (!this._config)
      return;
    const i = t.target;
    this._applyConfig(li(this._config, e, i.value));
  }
  _defaultEntityName(e) {
    var i, r;
    const t = (i = this.hass) == null ? void 0 : i.states[e];
    return t && ((r = this.hass) != null && r.formatEntityName) ? this.hass.formatEntityName(t) : t != null && t.attributes.friendly_name ? String(t.attributes.friendly_name) : e;
  }
  _applyConfig(e) {
    delete e.entity, this._config = e, this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: !0,
        composed: !0,
        detail: { config: e }
      })
    );
  }
};
ee.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, ee.styles = tt`
    .editor-section {
      border-top: 1px solid var(--divider-color);
      margin-top: 16px;
      padding-top: 16px;
    }

    .editor-title {
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .editor-helper {
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .alias-row {
      align-items: center;
      display: grid;
      gap: 10px;
      grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
      margin: 0 0 10px;
    }

    .alias-copy {
      min-width: 0;
    }

    .alias-entity,
    .alias-default {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .alias-entity {
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .alias-default {
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-top: 2px;
    }

    input {
      background: var(--input-fill-color, var(--secondary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      box-sizing: border-box;
      color: var(--primary-text-color);
      font: inherit;
      min-height: 40px;
      padding: 8px 10px;
      width: 100%;
    }

    input::placeholder {
      color: var(--secondary-text-color);
    }

    input:focus {
      border-color: var(--primary-color);
      outline: none;
    }

    @media (max-width: 640px) {
      .alias-row {
        grid-template-columns: 1fr;
      }
    }
  `;
let _e = ee;
customElements.get(J) || customElements.define(J, pe);
customElements.get(me) || customElements.define(me, _e);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: J,
  name: Q,
  preview: !0,
  description: "Canvas heatmaps for Home Assistant recorder statistics and short history ranges.",
  documentationURL: "https://github.com/gcs8/universal-heatmap-card"
});
console.info(
  `%c${Q}%c ${Ri}`,
  "color: #3a6ea5; font-weight: 700;",
  "color: inherit;"
);
