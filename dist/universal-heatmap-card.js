/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, ye = K.ShadowRoot && (K.ShadyCSS === void 0 || K.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xe = Symbol(), Oe = /* @__PURE__ */ new WeakMap();
let st = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ye && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = Oe.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && Oe.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const yt = (s) => new st(typeof s == "string" ? s : s + "", void 0, xe), rt = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new st(t, s, xe);
}, xt = (s, e) => {
  if (ye) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = K.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, Fe = ye ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return yt(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: wt, defineProperty: $t, getOwnPropertyDescriptor: At, getOwnPropertyNames: St, getOwnPropertySymbols: kt, getPrototypeOf: Et } = Object, x = globalThis, Ue = x.trustedTypes, Mt = Ue ? Ue.emptyScript : "", ae = x.reactiveElementPolyfillSupport, P = (s, e) => s, de = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? Mt : null;
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
} }, nt = (s, e) => !wt(s, e), qe = { attribute: !0, type: String, converter: de, reflect: !1, useDefault: !1, hasChanged: nt };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), x.litPropertyMetadata ?? (x.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let N = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = qe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && $t(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = At(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? qe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const e = Et(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const t = this.properties, i = [...St(t), ...kt(t)];
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
      for (const r of i) t.unshift(Fe(r));
    } else e !== void 0 && t.push(Fe(e));
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
    return xt(e, this.constructor.elementStyles), e;
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
      const a = (((n = i.converter) == null ? void 0 : n.toAttribute) !== void 0 ? i.converter : de).toAttribute(t, i.type);
      this._$Em = e, a == null ? this.removeAttribute(r) : this.setAttribute(r, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, a;
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), l = typeof o.converter == "function" ? { fromAttribute: o.converter } : ((n = o.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? o.converter : de;
      this._$Em = r;
      const c = l.fromAttribute(t, o.type);
      this[r] = c ?? ((a = this._$Ej) == null ? void 0 : a.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, r = !1, n) {
    var a;
    if (e !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[e]), i ?? (i = o.getPropertyOptions(e)), !((i.hasChanged ?? nt)(n, t) || i.useDefault && i.reflect && n === ((a = this._$Ej) == null ? void 0 : a.get(e)) && !this.hasAttribute(o._$Eu(e, i)))) return;
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
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[P("elementProperties")] = /* @__PURE__ */ new Map(), N[P("finalized")] = /* @__PURE__ */ new Map(), ae == null || ae({ ReactiveElement: N }), (x.reactiveElementVersions ?? (x.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis, Ve = (s) => s, Q = O.trustedTypes, Be = Q ? Q.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, at = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ot = "?" + y, Ct = `<${ot}>`, E = document, F = () => E.createComment(""), U = (s) => s === null || typeof s != "object" && typeof s != "function", we = Array.isArray, Nt = (s) => we(s) || typeof (s == null ? void 0 : s[Symbol.iterator]) == "function", oe = `[ 	
\f\r]`, D = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, We = /-->/g, Ge = />/g, $ = RegExp(`>|${oe}(?:([^\\s"'>=/]+)(${oe}*=${oe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Xe = /'/g, je = /"/g, lt = /^(?:script|style|textarea|title)$/i, Tt = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), g = Tt(1), L = Symbol.for("lit-noChange"), m = Symbol.for("lit-nothing"), Ke = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129);
function ct(s, e) {
  if (!we(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Be !== void 0 ? Be.createHTML(e) : e;
}
const Lt = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = D;
  for (let o = 0; o < t; o++) {
    const l = s[o];
    let c, u, h = -1, d = 0;
    for (; d < l.length && (a.lastIndex = d, u = a.exec(l), u !== null); ) d = a.lastIndex, a === D ? u[1] === "!--" ? a = We : u[1] !== void 0 ? a = Ge : u[2] !== void 0 ? (lt.test(u[2]) && (r = RegExp("</" + u[2], "g")), a = $) : u[3] !== void 0 && (a = $) : a === $ ? u[0] === ">" ? (a = r ?? D, h = -1) : u[1] === void 0 ? h = -2 : (h = a.lastIndex - u[2].length, c = u[1], a = u[3] === void 0 ? $ : u[3] === '"' ? je : Xe) : a === je || a === Xe ? a = $ : a === We || a === Ge ? a = D : (a = $, r = void 0);
    const p = a === $ && s[o + 1].startsWith("/>") ? " " : "";
    n += a === D ? l + Ct : h >= 0 ? (i.push(c), l.slice(0, h) + at + l.slice(h) + y + p) : l + y + (h === -2 ? o : p);
  }
  return [ct(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class q {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, a = 0;
    const o = e.length - 1, l = this.parts, [c, u] = Lt(e, t);
    if (this.el = q.createElement(c, i), A.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = A.nextNode()) !== null && l.length < o; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(at)) {
          const d = u[a++], p = r.getAttribute(h).split(y), _ = /([.?@])?(.*)/.exec(d);
          l.push({ type: 1, index: n, name: _[2], strings: p, ctor: _[1] === "." ? It : _[1] === "?" ? Rt : _[1] === "@" ? Dt : re }), r.removeAttribute(h);
        } else h.startsWith(y) && (l.push({ type: 6, index: n }), r.removeAttribute(h));
        if (lt.test(r.tagName)) {
          const h = r.textContent.split(y), d = h.length - 1;
          if (d > 0) {
            r.textContent = Q ? Q.emptyScript : "";
            for (let p = 0; p < d; p++) r.append(h[p], F()), A.nextNode(), l.push({ type: 2, index: ++n });
            r.append(h[d], F());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ot) l.push({ type: 2, index: n });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(y, h + 1)) !== -1; ) l.push({ type: 7, index: n }), h += y.length - 1;
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
  if (e === L) return e;
  let r = i !== void 0 ? (a = t._$Co) == null ? void 0 : a[i] : t._$Cl;
  const n = U(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((o = r == null ? void 0 : r._$AO) == null || o.call(r, !1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = r : t._$Cl = r), r !== void 0 && (e = z(s, r._$AS(s, e.values), r, i)), e;
}
class zt {
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
        l.type === 2 ? c = new V(n, n.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (c = new Ht(n, this, e)), this._$AV.push(c), l = i[++o];
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
class V {
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
    e = z(this, e, t), U(e) ? e === m || e == null || e === "" ? (this._$AH !== m && this._$AR(), this._$AH = m) : e !== this._$AH && e !== L && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Nt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== m && U(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = q.createElement(ct(i.h, i.h[0]), this.options)), i);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const a = new zt(r, this), o = a.u(this.options);
      a.p(t), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = Ke.get(e.strings);
    return t === void 0 && Ke.set(e.strings, t = new q(e)), t;
  }
  k(e) {
    we(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, r = 0;
    for (const n of e) r === t.length ? t.push(i = new V(this.O(F()), this.O(F()), this, this.options)) : i = t[r], i._$AI(n), r++;
    r < t.length && (this._$AR(i && i._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, t); e !== this._$AB; ) {
      const r = Ve(e).nextSibling;
      Ve(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class re {
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
    if (n === void 0) e = z(this, e, t, 0), a = !U(e) || e !== this._$AH && e !== L, a && (this._$AH = e);
    else {
      const o = e;
      let l, c;
      for (e = n[0], l = 0; l < n.length - 1; l++) c = z(this, o[i + l], t, l), c === L && (c = this._$AH[l]), a || (a = !U(c) || c !== this._$AH[l]), c === m ? e = m : e !== m && (e += (c ?? "") + n[l + 1]), this._$AH[l] = c;
    }
    a && !r && this.j(e);
  }
  j(e) {
    e === m ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class It extends re {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === m ? void 0 : e;
  }
}
class Rt extends re {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== m);
  }
}
class Dt extends re {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? m) === L) return;
    const i = this._$AH, r = e === m && i !== m || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== m && (i === m || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ht {
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
const le = O.litHtmlPolyfillSupport;
le == null || le(q, V), (O.litHtmlVersions ?? (O.litHtmlVersions = [])).push("3.3.3");
const Pt = (s, e, t) => {
  const i = (t == null ? void 0 : t.renderBefore) ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    i._$litPart$ = r = new V(e.insertBefore(F(), n), n, void 0, t ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
class T extends N {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Pt(t, this.renderRoot, this.renderOptions);
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
    return L;
  }
}
var it;
T._$litElement$ = !0, T.finalized = !0, (it = S.litElementHydrateSupport) == null || it.call(S, { LitElement: T });
const ce = S.litElementPolyfillSupport;
ce == null || ce({ LitElement: T });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.2");
const Ot = [
  { value: 55, color: "#315f9d", label: "Cool" },
  { value: 68, color: "#58a4b0", label: "Comfort" },
  { value: 76, color: "#f2c14e", label: "Warm" },
  { value: 85, color: "#d94841", label: "Hot" }
], X = [
  { value: 0, color: "#2f6f9f" },
  { value: 50, color: "#5aa469" },
  { value: 75, color: "#f2c14e" },
  { value: 100, color: "#c44536" }
], j = [
  { value: 0, color: "#2f6f9f" },
  { value: 0.5, color: "#5aa469" },
  { value: 0.75, color: "#f2c14e" },
  { value: 1, color: "#c44536" }
], ue = [
  { value: 0, color: "#c44536", label: "Low" },
  { value: 35, color: "#f2c14e", label: "Watch" },
  { value: 70, color: "#5aa469", label: "Good" },
  { value: 100, color: "#2f6f9f", label: "Full" }
], he = {
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
    scale: { preset: "temperature", unit: "°", stops: Ot }
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
      stops: X
    }
  },
  power: {
    id: "power",
    label: "Power",
    range: { days: 14 },
    bucket: { interval: "hour", value: "mean" },
    scale: { preset: "power", stops: j },
    highIsBad: !0
  },
  energy_delta: {
    id: "energy_delta",
    label: "Energy Delta",
    range: { days: 30 },
    bucket: { interval: "day", value: "change" },
    scale: { preset: "energy_delta", stops: j }
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
      stops: ue
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
      stops: X
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
      stops: ue
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
      stops: X
    },
    highIsBad: !0
  },
  filter_dp: {
    id: "filter_dp",
    label: "Filter Differential Pressure",
    range: { days: 30 },
    bucket: { interval: "hour", value: "max" },
    scale: { preset: "filter_dp", stops: j },
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
      stops: X
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
      stops: ue
    }
  },
  signal_quality: {
    id: "signal_quality",
    label: "Signal Quality",
    range: { days: 30 },
    bucket: { interval: "day", value: "min" },
    scale: { preset: "signal_quality", stops: j }
  }
};
function Ft(s) {
  return !s || s === "auto" ? he.auto : he[s] ?? he.auto;
}
function Ut(s) {
  if (!s)
    return "auto";
  const e = s.entity_id, t = e.split(".")[0] ?? "", i = String(s.attributes.device_class ?? "").toLowerCase(), r = String(s.attributes.unit_of_measurement ?? "").toLowerCase(), n = String(s.attributes.friendly_name ?? e).toLowerCase();
  return t === "binary_sensor" ? "binary_runtime" : i === "temperature" || r === "°f" || r === "°c" ? "temperature" : i === "humidity" || r === "%" ? n.includes("life") || n.includes("health") ? "percent_health" : n.includes("load") || n.includes("utilization") ? "percent_utilization" : "humidity" : i === "power" || r === "w" || r === "kw" ? "power" : i === "energy" || r === "wh" || r === "kwh" ? "energy_delta" : i === "battery" || n.includes("battery") ? "battery" : i === "pressure" || r.includes("pa") || r.includes("inh2o") ? n.includes("filter") ? "filter_dp" : "auto" : n.includes("filter") && n.includes("life") ? "filter_life" : n.includes("filter") && n.includes("load") ? "filter_load" : r === "dbm" || r === "lqi" || r === "db" ? "signal_quality" : "auto";
}
const ut = 2, qt = 8;
let Y = 0;
const Z = [];
function Vt(s, e = {}) {
  const t = {
    ...e,
    maxConcurrent: $e(e.maxConcurrent)
  };
  return new Promise((i, r) => {
    var n;
    Z.push({
      task: s,
      resolve: i,
      reject: r,
      options: t
    }), (n = t.onQueued) == null || n.call(t, Ae(t.maxConcurrent)), ht();
  });
}
function Ye(s = ut) {
  return Ae($e(s));
}
function $e(s) {
  return typeof s != "number" || !Number.isFinite(s) ? ut : Math.min(qt, Math.max(1, Math.floor(s)));
}
function ht() {
  var e, t;
  const s = Z[0];
  !s || Y >= s.options.maxConcurrent || (Z.shift(), Y += 1, (t = (e = s.options).onStart) == null || t.call(e, Ae(s.options.maxConcurrent)), Promise.resolve().then(s.task).then(s.resolve, s.reject).finally(() => {
    Y -= 1, ht();
  }));
}
function Ae(s) {
  return {
    active: Y,
    queued: Z.length,
    maxConcurrent: s
  };
}
const Bt = 5e3, Wt = 24, Gt = 300;
function Je(s, e) {
  var h, d, p, _, f, B, I, W, R, G, M, Ee, Me, Ce, Ne, Te, Le, ze, Ie, Re, De, He, Pe;
  const t = Kt(s, e);
  if (t.length === 0)
    throw new Error("Universal Heatmap Card requires entity or entities.");
  const i = t[0], r = i ? e == null ? void 0 : e.states[i.entity] : void 0, n = Ut(r), a = ((h = s.scale) == null ? void 0 : h.preset) ?? n, o = Ft(a), l = {
    interval: ((d = s.bucket) == null ? void 0 : d.interval) ?? o.bucket.interval,
    value: ((p = s.bucket) == null ? void 0 : p.value) ?? o.bucket.value
  }, c = {
    ...o.range,
    ...s.range,
    align: jt((_ = s.range) == null ? void 0 : _.align)
  }, u = ((f = s.navigation) == null ? void 0 : f.mode) ?? (t.length > 8 ? "dropdown" : "tabs");
  return {
    title: s.title,
    debug: s.debug ?? !1,
    entities: t,
    range: c,
    bucket: l,
    data: {
      provider: ((B = s.data) == null ? void 0 : B.provider) ?? "auto",
      prefetch: ((I = s.data) == null ? void 0 : I.prefetch) ?? !1,
      max_cells: ((W = s.data) == null ? void 0 : W.max_cells) ?? Bt,
      raw_history_hours: ((R = s.data) == null ? void 0 : R.raw_history_hours) ?? Wt,
      refresh_interval: Xt((G = s.data) == null ? void 0 : G.refresh_interval),
      defer_until_visible: ((M = s.data) == null ? void 0 : M.defer_until_visible) ?? !0,
      max_concurrent_requests: $e((Ee = s.data) == null ? void 0 : Ee.max_concurrent_requests)
    },
    missing: {
      mode: ((Me = s.missing) == null ? void 0 : Me.mode) ?? "empty"
    },
    scale: {
      ...o.scale,
      ...s.scale,
      preset: a
    },
    layout: {
      mode: ((Ce = s.layout) == null ? void 0 : Ce.mode) ?? "auto",
      bound_to_grid: ((Ne = s.layout) == null ? void 0 : Ne.bound_to_grid) ?? "auto"
    },
    navigation: {
      mode: u
    },
    axes: {
      show: ((Te = s.axes) == null ? void 0 : Te.show) ?? !0,
      x_labels: ((Le = s.axes) == null ? void 0 : Le.x_labels) ?? !0,
      y_labels: ((ze = s.axes) == null ? void 0 : ze.y_labels) ?? !0,
      show_key: ((Ie = s.axes) == null ? void 0 : Ie.show_key) ?? !1
    },
    tiles: {
      show_values: ((Re = s.tiles) == null ? void 0 : Re.show_values) ?? !1,
      show_value_toggle: ((De = s.tiles) == null ? void 0 : De.show_value_toggle) ?? !1
    },
    legend: {
      show: ((He = s.legend) == null ? void 0 : He.show) ?? !0
    },
    tooltip: {
      show: ((Pe = s.tooltip) == null ? void 0 : Pe.show) ?? !0
    }
  };
}
function Xt(s) {
  return typeof s != "number" || !Number.isFinite(s) ? Gt : Math.max(0, s);
}
function jt(s) {
  return s === "rolling" ? "rolling" : "day";
}
function Kt(s, e) {
  var i;
  return ((i = s.entities) != null && i.length ? s.entities : s.entity ? [{ entity: s.entity }] : []).map((r) => {
    const n = typeof r == "string" ? { entity: r } : r, a = e == null ? void 0 : e.states[n.entity], o = n.name ?? (a && (e != null && e.formatEntityName) ? e.formatEntityName(a) : a != null && a.attributes.friendly_name ? String(a.attributes.friendly_name) : n.entity);
    return {
      ...n,
      name: o
    };
  });
}
function ne(s, e = /* @__PURE__ */ new Date()) {
  const t = s.align === "day" && !s.end, i = s.end ? new Date(s.end) : t ? Yt(e) : e;
  let r;
  if (s.start)
    r = new Date(s.start);
  else if (typeof s.hours == "number")
    r = new Date(i.getTime() - s.hours * 60 * 60 * 1e3);
  else {
    const n = typeof s.days == "number" ? s.days : 30;
    r = t ? Jt(i, n) : new Date(i.getTime() - n * 24 * 60 * 60 * 1e3);
  }
  if (Number.isNaN(r.getTime()) || Number.isNaN(i.getTime()))
    throw new Error("Universal Heatmap Card has an invalid range date.");
  if (r >= i)
    throw new Error("Universal Heatmap Card range start must be before end.");
  return { start: r, end: i };
}
function Yt(s) {
  const e = new Date(s);
  return e.setHours(0, 0, 0, 0), e.setDate(e.getDate() + 1), e;
}
function Jt(s, e) {
  const t = new Date(s);
  return t.setDate(t.getDate() - e), t;
}
function dt(s, e = /* @__PURE__ */ new Date()) {
  const t = ne(s.range, e), i = (t.end.getTime() - t.start.getTime()) / 36e5;
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
function Qt(s) {
  return s < 9 ? 0 : s < 14 ? Math.max(6, Math.min(8, Math.floor(s * 0.72))) : Math.max(9, Math.min(13, Math.floor(s * 0.48)));
}
function Zt(s, e) {
  if (e < 14)
    return 0;
  const t = s < 1 ? 2 : s < 20 ? 1 : 0;
  return e < 18 ? Math.min(t, 0) : t;
}
function Se(s) {
  return s === "last" ? "state" : ["mean", "min", "max", "state", "sum", "change"].includes(s) ? s : null;
}
function ei(s, e) {
  const t = new Date(s);
  if (t.setMilliseconds(0), t.setSeconds(0), e !== "5minute" ? t.setMinutes(0) : t.setMinutes(Math.floor(t.getMinutes() / 5) * 5), (e === "day" || e === "week" || e === "month") && t.setHours(0, 0, 0, 0), e === "week") {
    const i = t.getDay(), r = i === 0 ? -6 : 1 - i;
    t.setDate(t.getDate() + r);
  }
  return e === "month" && t.setDate(1), t;
}
function ti(s, e) {
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
function ii(s, e) {
  const t = [];
  let i = ei(s.start, e);
  for (; i < s.end; ) {
    const r = ti(i, e);
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
function si(s, e, t, i) {
  const r = Se(t), n = w(s, "statistics");
  if (!r)
    return me(n, i);
  for (const a of e) {
    const o = a.start ? new Date(a.start) : void 0;
    if (!o || Number.isNaN(o.getTime()))
      continue;
    const l = ai(s, o);
    if (l < 0)
      continue;
    const c = s[l];
    if (!c)
      continue;
    const u = a[r], h = typeof u == "number" ? u : null;
    n[l] = {
      ...c,
      value: h,
      quality: h === null ? "missing" : "ok",
      source: "statistics"
    };
  }
  return me(n, i);
}
function ri(s, e, t, i) {
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
    const h = mt(s, u);
    h >= 0 && ((a = r[h]) == null || a.push({ at: u, value: l }));
  }
  const n = s.map((o, l) => {
    const c = r[l] ?? [], u = ni(c, t);
    return {
      ...o,
      value: u,
      quality: u === null ? "missing" : "ok",
      source: "history"
    };
  });
  return me(n, i);
}
function me(s, e) {
  if (e === "empty")
    return s;
  let t = null;
  return s.map((i) => i.value !== null ? (t = i.value, i) : e === "zero" ? { ...i, value: 0, quality: "ok" } : e === "carry_forward" && t !== null ? { ...i, value: t, quality: "carried" } : i);
}
function ni(s, e) {
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
function ai(s, e) {
  return mt(s, e.getTime());
}
function mt(s, e) {
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
async function oi(s, e, t) {
  const i = dt(e), r = ne(e.range), n = ii(r, e.bucket.interval);
  if (i > e.data.max_cells)
    return {
      source: "current",
      buckets: w(n, "current"),
      warning: `This heatmap would render ${i.toLocaleString()} cells. Raise data.max_cells to load it.`
    };
  const a = e.data.provider, o = Se(e.bucket.value) !== null;
  if ((a === "auto" || a === "statistics") && o)
    try {
      const l = await li(s, e, t, n);
      if (l.some((c) => c.value !== null) || a === "statistics")
        return { source: "statistics", buckets: l };
    } catch (l) {
      if (a === "statistics")
        return {
          source: "statistics",
          buckets: w(n, "statistics"),
          warning: pt(l, "Statistics query failed.")
        };
    }
  return a === "auto" || a === "history" ? ci(s, e, t, n) : {
    source: "current",
    buckets: w(n, "current"),
    warning: "No supported data provider is available for this bucket value yet."
  };
}
async function li(s, e, t, i) {
  const r = Se(e.bucket.value);
  if (!r)
    return w(i, "statistics");
  const n = ne(e.range), o = (await s.callWS({
    type: "recorder/statistics_during_period",
    start_time: n.start.toISOString(),
    end_time: n.end.toISOString(),
    statistic_ids: [t.entity],
    period: e.bucket.interval,
    types: [r]
  }))[t.entity] ?? [];
  return si(i, o, e.bucket.value, e.missing.mode);
}
async function ci(s, e, t, i) {
  const r = ne(e.range), n = (r.end.getTime() - r.start.getTime()) / 36e5;
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
      buckets: ri(i, o, e.bucket.value, e.missing.mode)
    };
  } catch (a) {
    return {
      source: "history",
      buckets: w(i, "history"),
      warning: pt(a, "History fallback failed.")
    };
  }
}
function pt(s, e) {
  return s instanceof Error && s.message ? s.message : e;
}
const ui = "universal-heatmap-card:debug";
function hi(s) {
  var e;
  if ((s == null ? void 0 : s.debug) === !0)
    return !0;
  if ((s == null ? void 0 : s.debug) === !1 || typeof window > "u")
    return !1;
  try {
    const t = (e = window.localStorage) == null ? void 0 : e.getItem(ui);
    return t === "1" || t === "true";
  } catch {
    return !1;
  }
}
function v() {
  var s, e;
  return ((e = (s = globalThis.performance) == null ? void 0 : s.now) == null ? void 0 : e.call(s)) ?? Date.now();
}
function H(s) {
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
function _t() {
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
        name: "tiles",
        title: "Tiles",
        schema: [
          { name: "show_values", selector: { boolean: {} } },
          { name: "show_value_toggle", selector: { boolean: {} } }
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
        show_values: "Show values in cells",
        show_value_toggle: "Show value toggle on card",
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
        show_values: "Draw compact bucket values inside each tile. Off by default; works best when the card has enough width for larger cells.",
        show_value_toggle: "Adds a compact 123 button beside the current value chip so values can be toggled without opening edit mode.",
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
function J(s) {
  return ft(s).map((e) => typeof e == "string" ? e : e.entity).filter((e) => typeof e == "string" && e.length > 0);
}
function ft(s) {
  var t;
  return ((t = s.entities) != null && t.length ? s.entities : s.entity ? [s.entity] : []).map((i) => typeof i == "string" ? i : { ...i });
}
function pe(s, e) {
  const t = /* @__PURE__ */ new Map();
  for (const i of ft(s)) {
    const r = typeof i == "string" ? i : i.entity;
    r && t.set(r, typeof i == "string" ? i : { ...i });
  }
  return e.map((i) => t.get(i) ?? i);
}
function di(s, e, t) {
  const i = J(s), r = t.trim(), n = pe(s, i).map((o) => {
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
const gt = 56, _e = 8, mi = 12, pi = 6, ke = 4, _i = 12, fi = 560, Qe = 3, gi = 7, bi = 22, vi = 14, yi = 28, xi = 58, wi = 18;
function $i(s) {
  const e = Math.max(1, Math.floor(s));
  return e * gt + Math.max(0, e - 1) * _e;
}
function Ai(s) {
  return !Number.isFinite(s) || s <= 0 ? ke : Math.ceil((s + _e) / (gt + _e));
}
function Si(s, e = {}) {
  return Ni(
    Ai(bt(s, e)),
    ke,
    _i
  );
}
function ki(s, e = {}) {
  return Math.max(1, Math.ceil(bt(s, e) / 50));
}
function bt(s, e = {}) {
  return vt(s, e) + Ei(s);
}
function vt(s, e = {}) {
  let t = 58;
  return t += 16, s.entities.length > 1 && (t += Mi(s)), (e.loading || e.warning || e.error) && (t += 33), s.axes.show_key && (t += 24), t += 25, s.legend.show && (t += 25), t;
}
function Ei(s, e = fi) {
  const t = Math.max(1, dt(s)), i = Ci(s.bucket.interval, t), r = Math.ceil(t / i), n = s.axes.show && s.axes.y_labels ? xi : 0, a = s.axes.show && s.axes.x_labels ? wi : 0, o = Math.max(160, e - n), l = s.tiles.show_values || s.tiles.show_value_toggle, h = Math.max(
    l ? vi : gi,
    Math.min(
      l ? yi : bi,
      Math.floor((o - Math.max(0, i - 1) * Qe) / i)
    )
  );
  return a + r * h + Math.max(0, r - 1) * Qe;
}
function Mi(s) {
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
function Ci(s, e) {
  return s === "hour" ? 24 : s === "5minute" ? 48 : s === "day" ? 7 : s === "month" ? 12 : Math.min(12, Math.ceil(Math.sqrt(e * 1.8)));
}
function Ni(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
const Ti = [
  { value: 0, color: "#3a6ea5" },
  { value: 0.5, color: "#6fbf73" },
  { value: 1, color: "#f6c85f" }
];
function Li(s, e) {
  var _;
  const t = s.map((f) => f.value).filter((f) => typeof f == "number" && Number.isFinite(f)), i = t.filter((f) => f > 0), n = e.ignore_zero === !0 || e.ignore_zero !== !1 && i.length > 0 && t.some((f) => f === 0) && Math.min(...i) > 0 ? i : t, a = Ri(n, e.outlier_clip), o = a.min, l = a.max, c = typeof e.min == "number" ? e.min : o, u = typeof e.max == "number" ? e.max : l === c ? c + 1 : l, h = (_ = e.stops) != null && _.length ? e.stops : Ti, d = Ii(h, c, u, e.invert ?? !1), p = Hi(e.sensitivity);
  return {
    min: c,
    max: u,
    unit: e.unit,
    sensitivity: p,
    stops: d,
    clippedLow: t.some((f) => f < c),
    clippedHigh: t.some((f) => f > u)
  };
}
function fe(s, e) {
  var r, n, a, o;
  if (s === null || !Number.isFinite(s))
    return "rgba(127, 127, 127, 0.22)";
  const t = Pi(s, e), i = e.stops;
  if (i.length === 0)
    return "#999999";
  if (i.length === 1)
    return ((r = i[0]) == null ? void 0 : r.color) ?? "#999999";
  for (let l = 0; l < i.length - 1; l += 1) {
    const c = i[l], u = i[l + 1];
    if (!(!c || !u) && t >= c.value && t <= u.value) {
      const h = u.value - c.value || 1, d = (t - c.value) / h;
      return Oi(c.color, u.color, d);
    }
  }
  return t < (((n = i[0]) == null ? void 0 : n.value) ?? e.min) ? ((a = i[0]) == null ? void 0 : a.color) ?? "#999999" : ((o = i[i.length - 1]) == null ? void 0 : o.color) ?? "#999999";
}
function zi(s, e = 18) {
  const t = s.max - s.min || 1, i = Math.max(2, e);
  return Array.from({ length: i }, (r, n) => {
    const a = n / (i - 1), o = s.min + t * a;
    return `${fe(o, s)} ${a * 100}%`;
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
function Ii(s, e, t, i) {
  const r = s.every((l) => l.value >= 0 && l.value <= 1), a = s.map((l) => r ? { ...l, value: e + l.value * (t - e) } : l).sort((l, c) => l.value - c.value);
  if (!i)
    return a;
  const o = a.map((l) => l.color).reverse();
  return a.map((l, c) => ({
    ...l,
    color: o[c] ?? l.color
  }));
}
function Ri(s, e) {
  if (s.length === 0)
    return { min: 0, max: 1 };
  const t = [...s].sort((a, o) => a - o), i = Di(e);
  if (!i)
    return {
      min: t[0] ?? 0,
      max: t[t.length - 1] ?? 1
    };
  const r = Ze(t, i.low), n = Ze(t, i.high);
  return n <= r ? {
    min: t[0] ?? 0,
    max: t[t.length - 1] ?? r + 1
  } : { min: r, max: n };
}
function Di(s) {
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
function Ze(s, e) {
  if (s.length === 0)
    return 0;
  const t = k(
    Math.ceil(e / 100 * s.length) - 1,
    0,
    s.length - 1
  );
  return s[t] ?? s[0] ?? 0;
}
function Hi(s) {
  return typeof s != "number" || !Number.isFinite(s) || s <= 0 ? 1 : k(s, 0.1, 5);
}
function Pi(s, e) {
  const t = e.max - e.min || 1, r = (k(s, e.min, e.max) - e.min) / t, n = k(0.5 + (r - 0.5) * e.sensitivity, 0, 1);
  return e.min + n * t;
}
function Oi(s, e, t) {
  const i = et(s), r = et(e);
  if (!i || !r)
    return t < 0.5 ? s : e;
  const n = Math.round(i.r + (r.r - i.r) * t), a = Math.round(i.g + (r.g - i.g) * t), o = Math.round(i.b + (r.b - i.b) * t);
  return `rgb(${n}, ${a}, ${o})`;
}
function et(s) {
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
const ee = "universal-heatmap-card", te = "Universal Heatmap Card", Fi = "0.1.3", ge = `${ee}-editor`;
class tt extends Error {
  constructor() {
    super("Stale heatmap load skipped.");
  }
}
const ie = class ie extends T {
  constructor() {
    super(...arguments), this._activeIndex = 0, this._buckets = [], this._loading = !1, this._cache = /* @__PURE__ */ new Map(), this._debug = !1, this._deferredLoadPending = !1, this._visibleForLoad = typeof globalThis.IntersectionObserver > "u", this._loadSeq = 0;
  }
  setConfig(e) {
    var i, r;
    const t = (r = (i = this._normalized) == null ? void 0 : i.entities[this._activeIndex]) == null ? void 0 : r.entity;
    this._config = e, this._debug = hi(e), this._cache.clear(), this._inFlightKey = void 0, this._loadSeq += 1, this._normalized = Je(e, this.hass), this._activeIndex = this._resolveActiveIndex(t), this._tileValuesOverride = void 0, this._tooltip = void 0, b(this._debug, "config applied", {
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
    var o, l, c, u, h, d, p, _;
    const e = (l = (o = this._config) == null ? void 0 : o.grid_options) == null ? void 0 : l.rows, t = (u = (c = this._config) == null ? void 0 : c.grid_options) == null ? void 0 : u.columns, i = typeof e == "number" && Number.isFinite(e) ? Math.max(1, e) : this._estimatedGridRows(), r = typeof t == "number" && Number.isFinite(t) ? Math.max(1, t) : mi, n = (d = (h = this._config) == null ? void 0 : h.grid_options) == null ? void 0 : d.min_rows, a = (_ = (p = this._config) == null ? void 0 : p.grid_options) == null ? void 0 : _.min_columns;
    return {
      rows: i,
      columns: r,
      min_rows: typeof n == "number" && Number.isFinite(n) ? Math.min(n, i) : Math.min(ke, i),
      min_columns: typeof a == "number" && Number.isFinite(a) ? Math.min(a, r) : Math.min(pi, r)
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
    return document.createElement(ge);
  }
  static getConfigForm() {
    return _t();
  }
  updated(e) {
    this._config && (e.has("hass") || e.has("_activeIndex")) && (this._normalized = Je(this._config, this.hass), this._requestActiveSeriesLoad()), (e.has("_buckets") || e.has("_loading") || e.has("_tileValuesOverride") || e.has("_warning")) && this.updateComplete.then(() => this._drawHeatmap());
  }
  render() {
    var n;
    if (!this._normalized)
      return g`<ha-card><div class="empty">Configure ${te}</div></ha-card>`;
    const e = this._normalized.entities[this._activeIndex], t = e ? (n = this.hass) == null ? void 0 : n.states[e.entity] : void 0, i = this._normalized.title ?? (e == null ? void 0 : e.name) ?? te, r = this._shouldBoundToGrid() ? "grid-bound" : "";
    return g`
      <ha-card class=${r}>
        <div class="header">
          <div>
            <div class="title">${i}</div>
            ${e ? g`<div class="subtitle">${e.entity}</div>` : m}
          </div>
          <div class="header-actions">
            ${this._normalized.tiles.show_value_toggle ? g`
                  <button
                    type="button"
                    class=${`tile-value-toggle ${this._showTileValues() ? "active" : ""}`}
                    title="Toggle cell values"
                    aria-label="Toggle cell values"
                    aria-pressed=${this._showTileValues() ? "true" : "false"}
                    @click=${this._toggleTileValues}
                  >
                    123
                  </button>
                ` : m}
            ${t ? g`<div class="state-chip">${this._formatEntityState(t)}</div>` : m}
          </div>
        </div>

        ${this._renderNavigation()}

        <div class="body">
          ${this._loading ? g`<div class="status" role="status">Loading heatmap...</div>` : m}
          ${this._error ? g`<div class="status error" role="alert" title=${this._error}>${this._error}</div>` : m}
          ${this._warning ? g`<div class="status warning" role="status" title=${this._warning}>${this._warning}</div>` : m}
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
            ${this._tooltip && this._normalized.tooltip.show ? g`<div
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
      return g`
        <div class="nav">
          <select @change=${this._handleSelectChange}>
            ${e.entities.map(
        (t, i) => g`
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
      return g`
        <div class="nav arrows">
          <button type="button" @click=${this._previousEntity} aria-label="Previous entity">
            ‹
          </button>
          <span>${t == null ? void 0 : t.name}</span>
          <button type="button" @click=${this._nextEntity} aria-label="Next entity">›</button>
        </div>
      `;
    }
    return e.navigation.mode === "dots" ? g`
        <div class="nav dots">
          ${e.entities.map(
      (t, i) => g`
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
      ` : g`
      <div class="nav tabs">
        ${e.entities.map(
      (t, i) => g`
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
    return e ? Si(e, this._layoutState()) : 6;
  }
  _estimatedMasonryRows() {
    const e = this._normalized;
    return e ? ki(e, this._layoutState()) : 6;
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
      return g`<div class="summary">No bucket data loaded.</div>`;
    const t = (o = (a = this.hass) == null ? void 0 : a.locale) == null ? void 0 : o.language, i = Math.min(...e), r = Math.max(...e), n = ((l = [...this._buckets].reverse().find((c) => c.value !== null)) == null ? void 0 : l.value) ?? null;
    return g`
      <div class="summary" aria-live="polite">
        <span>Low ${C(i, this._scale, t)}</span>
        <span>High ${C(r, this._scale, t)}</span>
        <span>Latest ${C(n, this._scale, t)}</span>
      </div>
    `;
  }
  _renderAxisKey() {
    return this._normalized ? g`
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
    return g`
      <div class="legend">
        <span>${e}</span>
        <div
          class="legend-bar"
          style=${`background: linear-gradient(90deg, ${zi(this._scale)});`}
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
        queue: Ye(e.data.max_concurrent_requests)
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
    const o = this._debug ? v() : 0, l = this._debug ? v() : 0;
    b(this._debug, "load start", {
      entity: i.entity,
      provider: e.data.provider,
      range: e.range,
      bucket: e.bucket
    });
    try {
      const c = await Vt(
        async () => {
          if (a !== this._loadSeq)
            throw new tt();
          return oi(t, e, i);
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
      const u = this._debug ? H(v() - l) : 0, h = this._debug ? v() : 0, d = Li(c.buckets, {
        ...e.scale,
        ...i.scale
      }), p = this._debug ? H(v() - h) : 0;
      this._cache.set(r, { result: c, scale: d, loadedAt: Date.now() }), this._buckets = c.buckets, this._scale = d, this._warning = c.warning, b(this._debug, "load complete", {
        entity: i.entity,
        source: c.source,
        buckets: c.buckets.length,
        fetchMs: u,
        scaleMs: p,
        totalMs: H(v() - o),
        scaleMin: d.min,
        scaleMax: d.max,
        warning: c.warning
      });
    } catch (c) {
      if (c instanceof tt) {
        b(this._debug, "stale queued load skipped", {
          entity: i.entity
        });
        return;
      }
      if (a !== this._loadSeq)
        return;
      this._error = c instanceof Error ? c.message : "Could not load heatmap data.", this._buckets = [], b(this._debug, "load failed", {
        entity: i.entity,
        totalMs: H(v() - o),
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
          queue: Ye(this._normalized.data.max_concurrent_requests)
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
    const i = this._debug ? v() : 0, r = e.parentElement, n = Math.max(260, Math.floor((r == null ? void 0 : r.clientWidth) ?? 320)), a = this._boundedCanvasHeight(), o = this._calculateLayout(n, a), l = window.devicePixelRatio || 1;
    e.width = Math.floor(o.width * l), e.height = Math.floor(o.height * l), e.style.height = `${o.height}px`, e.style.width = `${o.width}px`, t.setTransform(l, 0, 0, l, 0, 0), t.clearRect(0, 0, o.width, o.height), this._drawAxes(t, o), this._buckets.forEach((c, u) => {
      const h = u % o.cols, d = Math.floor(u / o.cols), p = o.gridX + h * (o.cell + o.gap), _ = o.gridY + d * (o.cell + o.gap);
      t.fillStyle = fe(c.value, this._scale), t.fillRect(p, _, o.cell, o.cell), c.quality === "carried" && (t.fillStyle = "rgba(255, 255, 255, 0.34)", t.fillRect(p, _ + o.cell - 3, o.cell, 3)), this._drawCellValue(t, c, o, p, _);
    }), this._renderLayout = o, b(this._debug, "draw complete", {
      buckets: this._buckets.length,
      cols: o.cols,
      rows: o.rows,
      cell: o.cell,
      width: o.width,
      height: o.height,
      maxCanvasHeight: a,
      ms: H(v() - i)
    });
  }
  _calculateLayout(e, t) {
    var R;
    const i = ((R = this._normalized) == null ? void 0 : R.bucket.interval) ?? "day", r = Math.max(1, this._buckets.length), n = i === "hour" ? 24 : i === "5minute" ? 48 : i === "day" ? 7 : i === "month" ? 12 : Math.min(12, Math.ceil(Math.sqrt(r * 1.8))), a = 3, o = this._shouldShowRowLabels() ? 58 : 0, l = this._shouldShowXAxisLabels() ? 18 : 0, c = Math.max(160, e - o), u = Math.ceil(r / n), h = this._shouldReserveForTileValues(), d = 7, p = h ? 14 : d;
    let f = Math.min(h ? 28 : 22, Math.floor((c - a * (n - 1)) / n));
    if (f = Math.max(f >= p ? p : d, f), typeof t == "number") {
      const G = Math.max(0, t - l), M = Math.floor((G - Math.max(0, u - 1) * a) / u);
      Number.isFinite(M) && M >= d && (f = Math.min(f, M));
    }
    const B = n * f + Math.max(0, n - 1) * a, I = u * f + Math.max(0, u - 1) * a, W = l + I;
    return {
      cols: n,
      rows: u,
      cell: f,
      gap: a,
      width: e,
      height: W,
      gridX: o,
      gridY: l,
      gridWidth: B,
      gridHeight: I
    };
  }
  _drawCellValue(e, t, i, r, n) {
    if (!this._showTileValues() || !this._scale || t.value === null)
      return;
    const a = Qt(i.cell);
    if (a <= 0)
      return;
    const o = this._formatCellValue(t.value, i.cell);
    if (!o)
      return;
    const l = fe(t.value, this._scale), c = this._cellTextColor(l), u = c === "#111827" ? "rgba(255, 255, 255, 0.26)" : "rgba(0, 0, 0, 0.32)", h = r + i.cell / 2, d = n + i.cell / 2 + 0.5, p = Math.max(4, i.cell - 2);
    e.save(), e.font = `600 ${a}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`, e.textAlign = "center", e.textBaseline = "middle", e.lineJoin = "round", e.lineWidth = Math.max(1.5, a / 4), e.strokeStyle = u, e.fillStyle = c, e.strokeText(o, h, d, p), e.fillText(o, h, d, p), e.restore();
  }
  _formatCellValue(e, t) {
    var a, o, l, c;
    if (!Number.isFinite(e) || !this._scale)
      return "";
    if (Math.abs(e) >= 1e3 && t < 24)
      return new Intl.NumberFormat((o = (a = this.hass) == null ? void 0 : a.locale) == null ? void 0 : o.language, {
        compactDisplay: "short",
        maximumFractionDigits: 1,
        notation: "compact"
      }).format(e);
    const r = Math.abs(this._scale.max - this._scale.min), n = Zt(r, t);
    return new Intl.NumberFormat((c = (l = this.hass) == null ? void 0 : l.locale) == null ? void 0 : c.language, {
      maximumFractionDigits: n,
      minimumFractionDigits: n
    }).format(e);
  }
  _cellTextColor(e) {
    const t = this._parseColor(e);
    return t && (0.2126 * t.r + 0.7152 * t.g + 0.0722 * t.b) / 255 > 0.62 ? "#111827" : "#ffffff";
  }
  _parseColor(e) {
    const t = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(e);
    if (t) {
      const [, n = "0", a = "0", o = "0"] = t;
      return {
        r: Number(n),
        g: Number(a),
        b: Number(o)
      };
    }
    const i = e.replace("#", "").trim(), r = i.length === 3 ? i.split("").map((n) => `${n}${n}`).join("") : i;
    if (/^[0-9a-fA-F]{6}$/.test(r))
      return {
        r: Number.parseInt(r.slice(0, 2), 16),
        g: Number.parseInt(r.slice(2, 4), 16),
        b: Number.parseInt(r.slice(4, 6), 16)
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
    const i = $i(e) - vt(t, this._layoutState());
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
    var d, p, _;
    if (!this._renderLayout || !this._scale || !((d = this._normalized) != null && d.tooltip.show))
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
    const h = `${this._formatDate(u.start)} - ${this._formatDate(u.end)}: ${C(
      u.value,
      this._scale,
      (_ = (p = this.hass) == null ? void 0 : p.locale) == null ? void 0 : _.language
    )}`;
    this._tooltip = {
      x: Math.min(r + 12, i.width - 160),
      y: Math.max(4, n - 28),
      bucket: u,
      label: h
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
  _showTileValues() {
    var e;
    return this._tileValuesOverride ?? ((e = this._normalized) == null ? void 0 : e.tiles.show_values) ?? !1;
  }
  _shouldReserveForTileValues() {
    var e, t;
    return !!((e = this._normalized) != null && e.tiles.show_values || (t = this._normalized) != null && t.tiles.show_value_toggle);
  }
  _toggleTileValues(e) {
    e.stopPropagation(), this._tileValuesOverride = !this._showTileValues();
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
ie.properties = {
  hass: { attribute: !1 },
  _activeIndex: { state: !0 },
  _buckets: { state: !0 },
  _error: { state: !0 },
  _loading: { state: !0 },
  _normalized: { state: !0 },
  _tileValuesOverride: { state: !0 },
  _tooltip: { state: !0 },
  _warning: { state: !0 }
}, ie.styles = rt`
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

    .header-actions {
      align-items: center;
      display: flex;
      flex: 0 0 auto;
      gap: 6px;
    }

    .tile-value-toggle {
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      min-height: 28px;
      padding: 0 8px;
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
let be = ie;
const se = class se extends T {
  constructor() {
    super(...arguments), this._form = _t();
  }
  setConfig(e) {
    this._config = e;
  }
  render() {
    return this._config ? g`
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
      entities: J(this._config ?? {})
    };
  }
  _handleValueChanged(e) {
    if (!this._config)
      return;
    const t = e.detail.value ?? {}, i = this._selectedEntities(t.entities), r = {
      ...this._config,
      ...t,
      entities: pe(this._config, i)
    };
    this._applyConfig(r);
  }
  _selectedEntities(e) {
    return Array.isArray(e) ? e.filter((t) => typeof t == "string" && t.length > 0) : typeof e == "string" && e.length > 0 ? [e] : J(this._config ?? {});
  }
  _renderEntityNameEditor() {
    if (!this._config)
      return m;
    const e = pe(this._config, J(this._config));
    return e.length === 0 ? m : g`
      <section class="editor-section" aria-label="Entity labels">
        <div class="editor-title">Entity labels</div>
        <div class="editor-helper">
          Optional tab/card labels. Leave blank to use Home Assistant's entity name.
        </div>
        ${e.map((t) => {
      const i = typeof t == "string" ? t : t.entity, r = typeof t == "string" ? "" : t.name ?? "";
      return g`
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
    this._applyConfig(di(this._config, e, i.value));
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
se.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, se.styles = rt`
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
let ve = se;
customElements.get(ee) || customElements.define(ee, be);
customElements.get(ge) || customElements.define(ge, ve);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: ee,
  name: te,
  preview: !0,
  description: "Canvas heatmaps for Home Assistant recorder statistics and short history ranges.",
  documentationURL: "https://github.com/gcs8/universal-heatmap-card"
});
console.info(
  `%c${te}%c ${Fi}`,
  "color: #3a6ea5; font-weight: 700;",
  "color: inherit;"
);
