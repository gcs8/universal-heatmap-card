//#region node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: m } = Object, h = globalThis, ee = h.trustedTypes, te = ee ? ee.emptyScript : "", ne = h.reactiveElementPolyfillSupport, g = (e, t) => e, re = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ie = (e, t) => !l(e, t), ae = {
	attribute: !0,
	type: String,
	converter: re,
	reflect: !1,
	useDefault: !1,
	hasChanged: ie
};
Symbol.metadata ??= Symbol("metadata"), h.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ae) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? ae;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = m(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(Infinity).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? re : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? re : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ie)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[g("elementProperties")] = /* @__PURE__ */ new Map(), _[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: _ }), (h.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var v = globalThis, oe = (e) => e, y = v.trustedTypes, se = y ? y.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ce = "$lit$", b = `lit$${Math.random().toFixed(9).slice(2)}$`, le = "?" + b, ue = `<${le}>`, x = document, S = () => x.createComment(""), C = (e) => e === null || typeof e != "object" && typeof e != "function", de = Array.isArray, fe = (e) => de(e) || typeof e?.[Symbol.iterator] == "function", w = "[ 	\n\f\r]", T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, me = />/g, E = RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), he = /'/g, ge = /"/g, _e = /^(?:script|style|textarea|title)$/i, D = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), O = Symbol.for("lit-noChange"), k = Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), A = x.createTreeWalker(x, 129);
function ye(e, t) {
	if (!de(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return se === void 0 ? t : se.createHTML(t);
}
var be = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = T;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === T ? c[1] === "!--" ? o = pe : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = E) : (_e.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = E) : o = me : o === E ? c[0] === ">" ? (o = i ?? T, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? E : c[3] === "\"" ? ge : he) : o === ge || o === he ? o = E : o === pe || o === me ? o = T : (o = E, i = void 0);
		let d = o === E && e[t + 1].startsWith("/>") ? " " : "";
		a += o === T ? n + ue : l >= 0 ? (r.push(s), n.slice(0, l) + ce + n.slice(l) + b + d) : n + b + (l === -2 ? t : d);
	}
	return [ye(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, xe = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = be(t, n);
		if (this.el = e.createElement(l, r), A.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = A.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ce)) {
					let t = u[o++], n = i.getAttribute(e).split(b), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? Ce : r[1] === "?" ? we : r[1] === "@" ? Te : N
					}), i.removeAttribute(e);
				} else e.startsWith(b) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (_e.test(i.tagName)) {
					let e = i.textContent.split(b), t = e.length - 1;
					if (t > 0) {
						i.textContent = y ? y.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], S()), A.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], S());
					}
				}
			} else if (i.nodeType === 8) if (i.data === le) c.push({
				type: 2,
				index: a
			});
			else {
				let e = -1;
				for (; (e = i.data.indexOf(b, e + 1)) !== -1;) c.push({
					type: 7,
					index: a
				}), e += b.length - 1;
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = x.createElement("template");
		return n.innerHTML = e, n;
	}
};
function j(e, t, n = e, r) {
	if (t === O) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = C(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = j(e, i._$AS(e, t.values), i, r)), t;
}
var Se = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? x).importNode(t, !0);
		A.currentNode = r;
		let i = A.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new M(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new Ee(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = A.nextNode(), a++);
		}
		return A.currentNode = x, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, M = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = k, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = j(this, e, t), C(e) ? e === k || e == null || e === "" ? (this._$AH !== k && this._$AR(), this._$AH = k) : e !== this._$AH && e !== O && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? fe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== k && C(this._$AH) ? this._$AA.nextSibling.data = e : this.T(x.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = xe.createElement(ye(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new Se(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ve.get(e.strings);
		return t === void 0 && ve.set(e.strings, t = new xe(e)), t;
	}
	k(t) {
		de(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(S()), this.O(S()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = oe(e).nextSibling;
			oe(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, N = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = k, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = k;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = j(this, e, t, 0), a = !C(e) || e !== this._$AH && e !== O, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = j(this, r[n + o], t, o), s === O && (s = this._$AH[o]), a ||= !C(s) || s !== this._$AH[o], s === k ? e = k : e !== k && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === k ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, Ce = class extends N {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === k ? void 0 : e;
	}
}, we = class extends N {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== k);
	}
}, Te = class extends N {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = j(this, e, t, 0) ?? k) === O) return;
		let n = this._$AH, r = e === k && n !== k || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== k && (n === k || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, Ee = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		j(this, e);
	}
}, De = v.litHtmlPolyfillSupport;
De?.(xe, M), (v.litHtmlVersions ??= []).push("3.3.3");
var Oe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new M(t.insertBefore(S(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, ke = globalThis, P = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Oe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return O;
	}
};
P._$litElement$ = !0, P.finalized = !0, ke.litElementHydrateSupport?.({ LitElement: P });
var Ae = ke.litElementPolyfillSupport;
Ae?.({ LitElement: P }), (ke.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/presets.ts
var je = [
	{
		value: 55,
		color: "#315f9d",
		label: "Cool"
	},
	{
		value: 68,
		color: "#58a4b0",
		label: "Comfort"
	},
	{
		value: 76,
		color: "#f2c14e",
		label: "Warm"
	},
	{
		value: 85,
		color: "#d94841",
		label: "Hot"
	}
], F = [
	{
		value: 0,
		color: "#2f6f9f"
	},
	{
		value: 50,
		color: "#5aa469"
	},
	{
		value: 75,
		color: "#f2c14e"
	},
	{
		value: 100,
		color: "#c44536"
	}
], I = [
	{
		value: 0,
		color: "#2f6f9f"
	},
	{
		value: .5,
		color: "#5aa469"
	},
	{
		value: .75,
		color: "#f2c14e"
	},
	{
		value: 1,
		color: "#c44536"
	}
], L = [
	{
		value: 0,
		color: "#c44536",
		label: "Low"
	},
	{
		value: 35,
		color: "#f2c14e",
		label: "Watch"
	},
	{
		value: 70,
		color: "#5aa469",
		label: "Good"
	},
	{
		value: 100,
		color: "#2f6f9f",
		label: "Full"
	}
], R = {
	auto: {
		id: "auto",
		label: "Auto",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "mean"
		},
		scale: {
			preset: "auto",
			stops: [
				{
					value: 0,
					color: "#3a6ea5"
				},
				{
					value: .5,
					color: "#6fbf73"
				},
				{
					value: 1,
					color: "#f6c85f"
				}
			]
		}
	},
	temperature: {
		id: "temperature",
		label: "Temperature",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "mean"
		},
		scale: {
			preset: "temperature",
			unit: "°",
			stops: je
		}
	},
	humidity: {
		id: "humidity",
		label: "Humidity",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "mean"
		},
		scale: {
			preset: "humidity",
			min: 0,
			max: 100,
			unit: "%",
			stops: F
		}
	},
	power: {
		id: "power",
		label: "Power",
		range: { days: 14 },
		bucket: {
			interval: "hour",
			value: "mean"
		},
		scale: {
			preset: "power",
			stops: I
		},
		highIsBad: !0
	},
	energy_delta: {
		id: "energy_delta",
		label: "Energy Delta",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "change"
		},
		scale: {
			preset: "energy_delta",
			stops: I
		}
	},
	percent_health: {
		id: "percent_health",
		label: "Percent Health",
		range: { days: 90 },
		bucket: {
			interval: "day",
			value: "min"
		},
		scale: {
			preset: "percent_health",
			min: 0,
			max: 100,
			unit: "%",
			stops: L
		}
	},
	percent_utilization: {
		id: "percent_utilization",
		label: "Percent Utilization",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "mean"
		},
		scale: {
			preset: "percent_utilization",
			min: 0,
			max: 100,
			unit: "%",
			stops: F
		},
		highIsBad: !0
	},
	filter_life: {
		id: "filter_life",
		label: "Filter Life",
		range: { days: 90 },
		bucket: {
			interval: "day",
			value: "min"
		},
		scale: {
			preset: "filter_life",
			min: 0,
			max: 100,
			unit: "%",
			stops: L
		}
	},
	filter_load: {
		id: "filter_load",
		label: "Filter Load",
		range: { days: 90 },
		bucket: {
			interval: "day",
			value: "max"
		},
		scale: {
			preset: "filter_load",
			min: 0,
			max: 100,
			unit: "%",
			stops: F
		},
		highIsBad: !0
	},
	filter_dp: {
		id: "filter_dp",
		label: "Filter Differential Pressure",
		range: { days: 30 },
		bucket: {
			interval: "hour",
			value: "max"
		},
		scale: {
			preset: "filter_dp",
			stops: I
		},
		highIsBad: !0
	},
	binary_runtime: {
		id: "binary_runtime",
		label: "Binary Runtime",
		range: { days: 14 },
		bucket: {
			interval: "hour",
			value: "percent_on"
		},
		scale: {
			preset: "binary_runtime",
			min: 0,
			max: 100,
			unit: "%",
			stops: F
		}
	},
	battery: {
		id: "battery",
		label: "Battery",
		range: { days: 90 },
		bucket: {
			interval: "day",
			value: "min"
		},
		scale: {
			preset: "battery",
			min: 0,
			max: 100,
			unit: "%",
			stops: L
		}
	},
	signal_quality: {
		id: "signal_quality",
		label: "Signal Quality",
		range: { days: 30 },
		bucket: {
			interval: "day",
			value: "min"
		},
		scale: {
			preset: "signal_quality",
			stops: I
		}
	}
};
function Me(e) {
	return !e || e === "auto" ? R.auto : R[e] ?? R.auto;
}
function Ne(e) {
	if (!e) return "auto";
	let t = e.entity_id, n = t.split(".")[0] ?? "", r = String(e.attributes.device_class ?? "").toLowerCase(), i = String(e.attributes.unit_of_measurement ?? "").toLowerCase(), a = String(e.attributes.friendly_name ?? t).toLowerCase();
	return n === "binary_sensor" ? "binary_runtime" : r === "temperature" || i === "°f" || i === "°c" ? "temperature" : r === "humidity" || i === "%" ? a.includes("life") || a.includes("health") ? "percent_health" : a.includes("load") || a.includes("utilization") ? "percent_utilization" : "humidity" : r === "power" || i === "w" || i === "kw" ? "power" : r === "energy" || i === "wh" || i === "kwh" ? "energy_delta" : r === "battery" || a.includes("battery") ? "battery" : r === "pressure" || i.includes("pa") || i.includes("inh2o") ? a.includes("filter") ? "filter_dp" : "auto" : a.includes("filter") && a.includes("life") ? "filter_life" : a.includes("filter") && a.includes("load") ? "filter_load" : i === "dbm" || i === "lqi" || i === "db" ? "signal_quality" : "auto";
}
//#endregion
//#region src/data/request-queue.ts
var Pe = 2, Fe = 8, z = 0, B = [];
function Ie(e, t = {}) {
	let n = {
		...t,
		maxConcurrent: V(t.maxConcurrent)
	};
	return new Promise((t, r) => {
		B.push({
			task: e,
			resolve: t,
			reject: r,
			options: n
		}), n.onQueued?.(H(n.maxConcurrent)), Re();
	});
}
function Le(e = Pe) {
	return H(V(e));
}
function V(e) {
	return typeof e != "number" || !Number.isFinite(e) ? Pe : Math.min(Fe, Math.max(1, Math.floor(e)));
}
function Re() {
	let e = B[0];
	!e || z >= e.options.maxConcurrent || (B.shift(), z += 1, e.options.onStart?.(H(e.options.maxConcurrent)), Promise.resolve().then(e.task).then(e.resolve, e.reject).finally(() => {
		--z, Re();
	}));
}
function H(e) {
	return {
		active: z,
		queued: B.length,
		maxConcurrent: e
	};
}
//#endregion
//#region src/config.ts
var ze = 5e3, Be = 24, Ve = 300;
function U(e, t, n = 0) {
	let r = We(e, t);
	if (r.length === 0) throw Error("Universal Heatmap Card requires entity or entities.");
	let i = (Number.isInteger(n) && n >= 0 ? r[n] : void 0) ?? r[0], a = Ne(i ? t?.states[i.entity] : void 0), o = e.scale?.preset ?? a, s = Me(o), c = {
		interval: e.bucket?.interval ?? s.bucket.interval,
		value: e.bucket?.value ?? s.bucket.value
	}, l = {
		...s.range,
		...e.range,
		align: Ue(e.range?.align)
	};
	W(l);
	let u = e.navigation?.mode ?? (r.length > 8 ? "dropdown" : "tabs");
	return {
		title: e.title,
		debug: e.debug ?? !1,
		entities: r,
		range: l,
		bucket: c,
		data: {
			provider: e.data?.provider ?? "auto",
			prefetch: e.data?.prefetch ?? !1,
			max_cells: e.data?.max_cells ?? ze,
			raw_history_hours: e.data?.raw_history_hours ?? Be,
			refresh_interval: He(e.data?.refresh_interval),
			defer_until_visible: e.data?.defer_until_visible ?? !0,
			max_concurrent_requests: V(e.data?.max_concurrent_requests)
		},
		missing: { mode: e.missing?.mode ?? "empty" },
		scale: {
			...s.scale,
			...e.scale,
			preset: o
		},
		layout: {
			mode: e.layout?.mode ?? "auto",
			bound_to_grid: e.layout?.bound_to_grid ?? "auto"
		},
		navigation: { mode: u },
		axes: {
			show: e.axes?.show ?? !0,
			x_labels: e.axes?.x_labels ?? !0,
			y_labels: e.axes?.y_labels ?? !0,
			show_key: e.axes?.show_key ?? !1
		},
		tiles: {
			show_values: e.tiles?.show_values ?? !1,
			show_value_toggle: e.tiles?.show_value_toggle ?? !1
		},
		legend: { show: e.legend?.show ?? !0 },
		tooltip: { show: e.tooltip?.show ?? !0 }
	};
}
function He(e) {
	return typeof e != "number" || !Number.isFinite(e) ? Ve : Math.max(0, e);
}
function Ue(e) {
	return e === "rolling" ? "rolling" : "day";
}
function We(e, t) {
	return (e.entities?.length ? e.entities : e.entity ? [{ entity: e.entity }] : []).map((e) => {
		let n = typeof e == "string" ? { entity: e } : e, r = t?.states[n.entity], i = n.name ?? (r && t?.formatEntityName ? t.formatEntityName(r) : r?.attributes.friendly_name ? String(r.attributes.friendly_name) : n.entity), a = Ge(n.scale);
		return {
			...n,
			...a ? { scale: a } : {},
			name: i
		};
	});
}
function Ge(e) {
	return e?.preset ? {
		min: void 0,
		max: void 0,
		unit: void 0,
		stops: void 0,
		...Me(e.preset).scale,
		...e
	} : e;
}
function W(e, t = /* @__PURE__ */ new Date()) {
	let n = e.align === "day" && !e.end, r = e.end ? new Date(e.end) : n ? Ke(t) : t, i;
	if (e.start) i = new Date(e.start);
	else if (typeof e.hours == "number") i = n ? Je(r, e.hours) : /* @__PURE__ */ new Date(r.getTime() - e.hours * 60 * 60 * 1e3);
	else {
		let t = typeof e.days == "number" ? e.days : 30;
		i = n ? qe(r, t) : /* @__PURE__ */ new Date(r.getTime() - t * 24 * 60 * 60 * 1e3);
	}
	if (Number.isNaN(i.getTime()) || Number.isNaN(r.getTime())) throw Error("Universal Heatmap Card has an invalid range date.");
	if (i >= r) throw Error("Universal Heatmap Card range start must be before end.");
	return {
		start: i,
		end: r
	};
}
function Ke(e) {
	let t = new Date(e);
	return t.setHours(0, 0, 0, 0), t.setDate(t.getDate() + 1), t;
}
function qe(e, t) {
	let n = new Date(e);
	return n.setDate(n.getDate() - t), n;
}
function Je(e, t) {
	let n = Math.trunc(t), r = new Date(e);
	return r.setHours(r.getHours() - n), /* @__PURE__ */ new Date(r.getTime() - (t - n) * 60 * 60 * 1e3);
}
function Ye(e, t = /* @__PURE__ */ new Date()) {
	let n = W(e.range, t), r = (n.end.getTime() - n.start.getTime()) / 36e5;
	switch (e.bucket.interval) {
		case "5minute": return Math.ceil(r * 12);
		case "hour": return Math.ceil(r);
		case "day": return Math.ceil(r / 24);
		case "week": return Math.ceil(r / 168);
		case "month": return Math.ceil(r / 720);
		default: return Math.ceil(r / 24);
	}
}
//#endregion
//#region src/cell-values.ts
function Xe(e) {
	return e < 9 ? 0 : e < 14 ? Math.max(6, Math.min(8, Math.floor(e * .72))) : Math.max(9, Math.min(13, Math.floor(e * .48)));
}
function Ze(e, t) {
	if (t < 14) return 0;
	let n = e < 1 ? 2 : +(e < 20);
	return t < 18 ? Math.min(n, 0) : n;
}
//#endregion
//#region src/data/buckets.ts
var Qe = 36e5;
function $e(e) {
	return e;
}
function G(e) {
	return e === "last" ? "state" : [
		"mean",
		"min",
		"max",
		"state",
		"sum",
		"change"
	].includes(e) ? e : null;
}
function et(e, t) {
	let n = new Date(e);
	if (n.setMilliseconds(0), n.setSeconds(0), t === "5minute" ? n.setMinutes(Math.floor(n.getMinutes() / 5) * 5) : n.setMinutes(0), (t === "day" || t === "week" || t === "month") && n.setHours(0, 0, 0, 0), t === "week") {
		let e = n.getDay(), t = e === 0 ? -6 : 1 - e;
		n.setDate(n.getDate() + t);
	}
	return t === "month" && n.setDate(1), n;
}
function tt(e, t) {
	let n = new Date(e);
	switch (t) {
		case "5minute": return n.setTime(n.getTime() + 3e5), n;
		case "hour": return n.setTime(n.getTime() + Qe), n;
		case "day": return n.setDate(n.getDate() + 1), n;
		case "week": return n.setDate(n.getDate() + 7), n;
		case "month": return n.setMonth(n.getMonth() + 1), n;
		default: return n;
	}
}
function nt(e, t) {
	let n = [], r = et(e.start, t);
	for (; r < e.end;) {
		let i = tt(r, t);
		i > e.start && n.push({
			start: new Date(r),
			end: new Date(i)
		}), r = i;
	}
	return n;
}
function K(e, t) {
	return e.map((e) => ({
		...e,
		value: null,
		quality: "missing",
		source: t
	}));
}
function rt(e, t, n, r) {
	let i = G(n), a = K(e, "statistics");
	if (!i) return q(a, r);
	for (let n of t) {
		let t = n.start ? new Date(n.start) : void 0;
		if (!t || Number.isNaN(t.getTime())) continue;
		let r = ot(e, t);
		if (r < 0) continue;
		let o = e[r];
		if (!o) continue;
		let s = n[i], c = typeof s == "number" ? s : null;
		a[r] = {
			...o,
			value: c,
			quality: c === null ? "missing" : "ok",
			source: "statistics"
		};
	}
	return q(a, r);
}
function it(e, t, n, r) {
	let i = e.map(() => []);
	for (let n of t) {
		let t = Number(n.state);
		if (!Number.isFinite(t)) continue;
		let r = n.last_changed ?? n.last_updated;
		if (!r) continue;
		let a = new Date(r).getTime();
		if (!Number.isFinite(a)) continue;
		let o = st(e, a);
		o >= 0 && i[o]?.push({
			at: a,
			value: t
		});
	}
	return q(e.map((e, t) => {
		let r = at(i[t] ?? [], n);
		return {
			...e,
			value: r,
			quality: r === null ? "missing" : "ok",
			source: "history"
		};
	}), r);
}
function q(e, t) {
	if (t === "empty") return e;
	let n = null;
	return e.map((e) => e.value === null ? t === "zero" ? {
		...e,
		value: 0,
		quality: "ok"
	} : t === "carry_forward" && n !== null ? {
		...e,
		value: n,
		quality: "carried"
	} : e : (n = e.value, e));
}
function at(e, t) {
	if (e.length === 0) return null;
	switch (t) {
		case "min": return Math.min(...e.map((e) => e.value));
		case "max": return Math.max(...e.map((e) => e.value));
		case "last":
		case "state": return e.reduce((e, t) => t.at >= e.at ? t : e).value;
		case "sum": return e.reduce((e, t) => e + t.value, 0);
		case "delta":
		case "change": {
			let t = [...e].sort((e, t) => e.at - t.at), n = t[0]?.value, r = t[t.length - 1]?.value;
			return n === void 0 || r === void 0 ? null : r - n;
		}
		case "count": return e.length;
		default: return e.reduce((e, t) => e + t.value, 0) / e.length;
	}
}
function ot(e, t) {
	return st(e, t.getTime());
}
function st(e, t) {
	let n = 0, r = e.length - 1;
	for (; n <= r;) {
		let i = Math.floor((n + r) / 2), a = e[i];
		if (!a) return -1;
		if (t < a.start.getTime()) r = i - 1;
		else if (t >= a.end.getTime()) n = i + 1;
		else return i;
	}
	return -1;
}
//#endregion
//#region src/data/provider.ts
async function ct(e, t, n) {
	let r = Ye(t), i = nt(W(t.range), t.bucket.interval);
	if (r > t.data.max_cells) return {
		source: "current",
		buckets: K(i, "current"),
		warning: `This heatmap would render ${r.toLocaleString()} cells. Raise data.max_cells to load it.`
	};
	let a = t.data.provider, o = G(t.bucket.value) !== null;
	if ((a === "auto" || a === "statistics") && o) try {
		let r = await lt(e, t, n, i);
		if (r.some((e) => e.value !== null) || a === "statistics") return {
			source: "statistics",
			buckets: r
		};
	} catch (e) {
		if (a === "statistics") return {
			source: "statistics",
			buckets: K(i, "statistics"),
			warning: dt(e, "Statistics query failed.")
		};
	}
	return a === "auto" || a === "history" ? ut(e, t, n, i) : {
		source: "current",
		buckets: K(i, "current"),
		warning: "No supported data provider is available for this bucket value yet."
	};
}
async function lt(e, t, n, r) {
	let i = G(t.bucket.value);
	if (!i) return K(r, "statistics");
	let a = W(t.range);
	return rt(r, (await e.callWS({
		type: "recorder/statistics_during_period",
		start_time: a.start.toISOString(),
		end_time: a.end.toISOString(),
		statistic_ids: [n.entity],
		period: $e(t.bucket.interval),
		types: [i]
	}))[n.entity] ?? [], t.bucket.value, t.missing.mode);
}
async function ut(e, t, n, r) {
	let i = W(t.range), a = (i.end.getTime() - i.start.getTime()) / 36e5;
	if (!e.callApi) return {
		source: "history",
		buckets: K(r, "history"),
		warning: "This Home Assistant object does not expose callApi for history fallback."
	};
	if (a > t.data.raw_history_hours) return {
		source: "history",
		buckets: K(r, "history"),
		warning: `Raw history fallback is capped at ${t.data.raw_history_hours} hours by default. Use recorder statistics or reduce range.`
	};
	try {
		let a = new URLSearchParams({
			end_time: i.end.toISOString(),
			filter_entity_id: n.entity
		});
		return {
			source: "history",
			buckets: it(r, (await e.callApi("GET", `history/period/${i.start.toISOString()}?${a.toString()}&minimal_response&no_attributes`)).flat(), t.bucket.value, t.missing.mode)
		};
	} catch (e) {
		return {
			source: "history",
			buckets: K(r, "history"),
			warning: dt(e, "History fallback failed.")
		};
	}
}
function dt(e, t) {
	return e instanceof Error && e.message ? e.message : t;
}
//#endregion
//#region src/debug.ts
var ft = "universal-heatmap-card:debug";
function pt(e) {
	if (e?.debug === !0) return !0;
	if (e?.debug === !1 || typeof window > "u") return !1;
	try {
		let e = window.localStorage?.getItem(ft);
		return e === "1" || e === "true";
	} catch {
		return !1;
	}
}
function J() {
	return globalThis.performance?.now?.() ?? Date.now();
}
function Y(e) {
	return Math.round(e * 10) / 10;
}
function X(e, t, n) {
	if (e) {
		if (n) {
			console.debug(`[Universal Heatmap Card] ${t}`, n);
			return;
		}
		console.debug(`[Universal Heatmap Card] ${t}`);
	}
}
//#endregion
//#region src/editor-form.ts
function mt() {
	return {
		schema: [
			{
				name: "title",
				selector: { text: {} }
			},
			{
				name: "entities",
				required: !0,
				selector: { entity: {
					domain: "sensor",
					multiple: !0,
					reorder: !0
				} }
			},
			{
				name: "debug",
				selector: { boolean: {} }
			},
			{
				type: "expandable",
				name: "range",
				title: "Range",
				schema: [
					{
						name: "hours",
						selector: { number: {
							min: 1,
							max: 720,
							mode: "box"
						} }
					},
					{
						name: "days",
						selector: { number: {
							min: 1,
							max: 365,
							mode: "box"
						} }
					},
					{
						name: "align",
						selector: { select: { options: [{
							value: "day",
							label: "Fixed days, 00:00-23:59"
						}, {
							value: "rolling",
							label: "Rolling window"
						}] } }
					}
				]
			},
			{
				type: "expandable",
				name: "bucket",
				title: "Bucket",
				schema: [{
					name: "interval",
					selector: { select: { options: [
						"5minute",
						"hour",
						"day",
						"week",
						"month"
					] } }
				}, {
					name: "value",
					selector: { select: { options: [
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
					] } }
				}]
			},
			{
				type: "expandable",
				name: "scale",
				title: "Scale",
				schema: [
					{
						name: "preset",
						selector: { select: { options: [
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
						] } }
					},
					{
						name: "min",
						selector: { number: { mode: "box" } }
					},
					{
						name: "max",
						selector: { number: { mode: "box" } }
					},
					{
						name: "unit",
						selector: { text: {} }
					},
					{
						name: "sensitivity",
						selector: { number: {
							min: .2,
							max: 4,
							step: .1,
							mode: "slider"
						} }
					},
					{
						name: "outlier_clip",
						selector: { number: {
							min: 0,
							max: 20,
							step: .5,
							mode: "box"
						} }
					}
				]
			},
			{
				type: "expandable",
				name: "tiles",
				title: "Tiles",
				schema: [{
					name: "show_values",
					selector: { boolean: {} }
				}, {
					name: "show_value_toggle",
					selector: { boolean: {} }
				}]
			},
			{
				type: "expandable",
				name: "data",
				title: "Data",
				schema: [
					{
						name: "provider",
						selector: { select: { options: [
							"auto",
							"statistics",
							"history"
						] } }
					},
					{
						name: "refresh_interval",
						selector: { number: {
							min: 0,
							max: 86400,
							mode: "box"
						} }
					},
					{
						name: "defer_until_visible",
						selector: { boolean: {} }
					},
					{
						name: "max_concurrent_requests",
						selector: { number: {
							min: 1,
							max: 8,
							mode: "box"
						} }
					},
					{
						name: "max_cells",
						selector: { number: {
							min: 1,
							max: 5e4,
							mode: "box"
						} }
					}
				]
			}
		],
		computeLabel: (e) => e.name ? {
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
		}[e.name] : void 0,
		computeHelper: (e) => e.name ? {
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
		}[e.name] : void 0
	};
}
function Z(e) {
	return ht(e).map((e) => typeof e == "string" ? e : e.entity).filter((e) => typeof e == "string" && e.length > 0);
}
function ht(e) {
	return (e.entities?.length ? e.entities : e.entity ? [e.entity] : []).map((e) => typeof e == "string" ? e : { ...e });
}
function gt(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let t of ht(e)) {
		let e = typeof t == "string" ? t : t.entity;
		e && n.set(e, typeof t == "string" ? t : { ...t });
	}
	return t.map((e) => n.get(e) ?? e);
}
function _t(e, t, n) {
	let r = Z(e), i = n.trim(), a = gt(e, r).map((e) => {
		let n = typeof e == "string" ? e : e.entity;
		if (n !== t) return e;
		let r = typeof e == "string" ? { entity: n } : { ...e };
		return i ? r.name = i : delete r.name, Object.keys(r).length === 1 ? n : r;
	}), o = {
		...e,
		entities: a
	};
	return delete o.entity, o;
}
var vt = 12, yt = 560, bt = 3, xt = 7, St = 22, Ct = 14, wt = 28, Tt = 58, Et = 18;
function Dt(e, t, n = Lt(t, Math.max(1, e.length))) {
	let r = Math.max(1, Math.floor(n)), i = [];
	if (t !== "hour") return e.forEach((e, t) => {
		i.push({
			index: t,
			row: Math.floor(t / r),
			col: t % r,
			slot: 0,
			slots: 1
		});
	}), {
		rows: Math.max(1, Math.ceil(e.length / r)),
		cols: r,
		cells: i
	};
	let a = /* @__PURE__ */ new Map(), o = -1, s = "";
	e.forEach((e, t) => {
		let n = e.start, c = `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`;
		c !== s && (s = c, o += 1);
		let l = Math.min(r - 1, Math.max(0, n.getHours())), u = o * r + l, d = a.get(u) ?? 0;
		a.set(u, d + 1), i.push({
			index: t,
			row: o,
			col: l,
			slot: d,
			slots: 1
		});
	});
	for (let e of i) e.slots = a.get(e.row * r + e.col) ?? 1;
	return {
		rows: Math.max(1, o + 1),
		cols: r,
		cells: i
	};
}
function Ot(e) {
	let t = -e.getTimezoneOffset(), n = t < 0 ? "-" : "+", r = Math.abs(t);
	return `UTC${n}${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
}
function kt(e) {
	let t = Math.max(1, Math.floor(e));
	return t * 56 + Math.max(0, t - 1) * 8;
}
function At(e) {
	return !Number.isFinite(e) || e <= 0 ? 4 : Math.ceil((e + 8) / 64);
}
function jt(e, t = {}) {
	return Rt(At(Nt(e, t)), 4, vt);
}
function Mt(e, t = {}) {
	return Math.max(1, Math.ceil(Nt(e, t) / 50));
}
function Nt(e, t = {}) {
	return Pt(e, t) + Ft(e);
}
function Pt(e, t = {}) {
	let n = 58;
	return n += 16, e.entities.length > 1 && (n += It(e)), (t.loading || t.warning || t.error) && (n += 33), e.axes.show_key && (n += 24), n += 25, e.legend.show && (n += 25), n;
}
function Ft(e, t = yt) {
	let n = Math.max(1, Ye(e)), r = Lt(e.bucket.interval, n), i = Math.ceil(n / r), a = e.axes.show && e.axes.y_labels ? Tt : 0, o = e.axes.show && e.axes.x_labels ? Et : 0, s = Math.max(160, t - a), c = e.tiles.show_values || e.tiles.show_value_toggle;
	return o + i * Math.max(c ? Ct : xt, Math.min(c ? wt : St, Math.floor((s - Math.max(0, r - 1) * bt) / r))) + Math.max(0, i - 1) * bt;
}
function It(e) {
	switch (e.navigation.mode) {
		case "dots": return 24;
		case "tabs": {
			let t = Math.max(1, Math.ceil(e.entities.length / 3));
			return t * 32 + Math.max(0, t - 1) * 8 + 10;
		}
		default: return 42;
	}
}
function Lt(e, t) {
	return e === "hour" ? 24 : e === "5minute" ? 48 : e === "day" ? 7 : e === "month" ? 12 : Math.min(12, Math.ceil(Math.sqrt(t * 1.8)));
}
function Rt(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
//#endregion
//#region src/scale.ts
var zt = [
	{
		value: 0,
		color: "#3a6ea5"
	},
	{
		value: .5,
		color: "#6fbf73"
	},
	{
		value: 1,
		color: "#f6c85f"
	}
];
function Bt(e, t) {
	let n = e.map((e) => e.value).filter((e) => typeof e == "number" && Number.isFinite(e)), r = n.filter((e) => e !== 0), i = Kt(t.ignore_zero === !0 || t.ignore_zero !== !1 && r.length > 0 && n.some((e) => e === 0) && !n.some((e) => e < 0) ? r : n, t.outlier_clip), a = i.min, o = i.max, { min: s, max: c } = Ut(t, a, o), l = Gt(t.stops?.length ? t.stops : zt, s, c, t.invert ?? !1), u = Yt(t.sensitivity);
	return {
		min: s,
		max: c,
		unit: t.unit,
		sensitivity: u,
		stops: l,
		clippedLow: n.some((e) => e < s),
		clippedHigh: n.some((e) => e > c)
	};
}
function Vt(e, t) {
	if (e === null || !Number.isFinite(e)) return "rgba(127, 127, 127, 0.22)";
	let n = Xt(e, t), r = t.stops;
	if (r.length === 0) return "#999999";
	if (r.length === 1) return r[0]?.color ?? "#999999";
	for (let e = 0; e < r.length - 1; e += 1) {
		let t = r[e], i = r[e + 1];
		if (!(!t || !i) && n >= t.value && n <= i.value) {
			let e = i.value - t.value || 1, r = (n - t.value) / e;
			return Zt(t.color, i.color, r);
		}
	}
	return n < (r[0]?.value ?? t.min) ? r[0]?.color ?? "#999999" : r[r.length - 1]?.color ?? "#999999";
}
function Ht(e, t = 18) {
	let n = e.max - e.min || 1, r = Math.max(2, t);
	return Array.from({ length: r }, (t, i) => {
		let a = i / (r - 1);
		return `${Vt(e.min + n * a, e)} ${a * 100}%`;
	}).join(", ");
}
function Q(e, t, n) {
	if (e === null || !Number.isFinite(e)) return "missing";
	let r = Math.abs(e), i = r >= 100 ? 0 : r >= 10 ? 1 : 2, a = new Intl.NumberFormat(n, { maximumFractionDigits: i }).format(e);
	return t.unit ? `${a} ${t.unit}` : a;
}
function Ut(e, t, n) {
	let r = typeof e.min == "number", i = typeof e.max == "number", a = r ? e.min : t, o = i ? e.max : n;
	if (o > a) return {
		min: a,
		max: o
	};
	let s = Wt(a);
	return i ? r ? {
		min: a,
		max: a + s
	} : {
		min: o - Wt(o),
		max: o
	} : {
		min: a,
		max: a + s
	};
}
function Wt(e) {
	let t = Math.abs(e) * 2 ** -52 * 4;
	return t > 0 && Number.isFinite(t) ? t : Number.MIN_VALUE;
}
function Gt(e, t, n, r) {
	let i = e.every((e) => e.value >= 0 && e.value <= 1), a = e.map((e) => i ? {
		...e,
		value: t + e.value * (n - t)
	} : e).sort((e, t) => e.value - t.value);
	if (!r) return a;
	let o = a.map((e) => e.color).reverse();
	return a.map((e, t) => ({
		...e,
		color: o[t] ?? e.color
	}));
}
function Kt(e, t) {
	if (e.length === 0) return {
		min: 0,
		max: 1
	};
	let n = [...e].sort((e, t) => e - t), r = qt(t);
	if (!r) return {
		min: n[0] ?? 0,
		max: n[n.length - 1] ?? 1
	};
	let i = Jt(n, r.low), a = Jt(n, r.high);
	return a <= i ? {
		min: n[0] ?? 0,
		max: n[n.length - 1] ?? i + 1
	} : {
		min: i,
		max: a
	};
}
function qt(e) {
	if (typeof e == "number") {
		if (!Number.isFinite(e) || e <= 0) return null;
		let t = $(e, 0, 49);
		return {
			low: t,
			high: 100 - t
		};
	}
	if (!Array.isArray(e) || e.length !== 2) return null;
	let t = Number(e[0]), n = Number(e[1]);
	return !Number.isFinite(t) || !Number.isFinite(n) || n <= t ? null : {
		low: $(t, 0, 100),
		high: $(n, 0, 100)
	};
}
function Jt(e, t) {
	return e.length === 0 ? 0 : e[$(Math.ceil(t / 100 * e.length) - 1, 0, e.length - 1)] ?? e[0] ?? 0;
}
function Yt(e) {
	return typeof e != "number" || !Number.isFinite(e) || e <= 0 ? 1 : $(e, .1, 5);
}
function Xt(e, t) {
	let n = t.max - t.min || 1, r = $(.5 + (($(e, t.min, t.max) - t.min) / n - .5) * t.sensitivity, 0, 1);
	return t.min + r * n;
}
function Zt(e, t, n) {
	let r = Qt(e), i = Qt(t);
	return !r || !i ? n < .5 ? e : t : `rgb(${Math.round(r.r + (i.r - r.r) * n)}, ${Math.round(r.g + (i.g - r.g) * n)}, ${Math.round(r.b + (i.b - r.b) * n)})`;
}
function Qt(e) {
	let t = e.replace("#", "").trim(), n = t.length === 3 ? t.split("").map((e) => `${e}${e}`).join("") : t;
	return /^[0-9a-fA-F]{6}$/.test(n) ? {
		r: Number.parseInt(n.slice(0, 2), 16),
		g: Number.parseInt(n.slice(2, 4), 16),
		b: Number.parseInt(n.slice(4, 6), 16)
	} : null;
}
function $(e, t, n) {
	return e < t ? t : e > n ? n : e;
}
//#endregion
//#region src/types.ts
var $t = "universal-heatmap-card", en = "Universal Heatmap Card", tn = "0.1.3", nn = `${$t}-editor`, rn = class extends Error {
	constructor() {
		super("Stale heatmap load skipped.");
	}
}, an = class extends P {
	constructor(...e) {
		super(...e), this._activeIndex = 0, this._buckets = [], this._loading = !1, this._cache = /* @__PURE__ */ new Map(), this._debug = !1, this._deferredLoadPending = !1, this._visibleForLoad = globalThis.IntersectionObserver === void 0, this._loadSeq = 0, this._cellFormatCache = /* @__PURE__ */ new Map();
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_activeIndex: { state: !0 },
			_buckets: { state: !0 },
			_error: { state: !0 },
			_loading: { state: !0 },
			_normalized: { state: !0 },
			_tileValuesOverride: { state: !0 },
			_tooltip: { state: !0 },
			_warning: { state: !0 }
		};
	}
	setConfig(e) {
		let t = this._normalized?.entities[this._activeIndex]?.entity;
		this._config = e, this._debug = pt(e), this._cache.clear(), this._inFlightKey = void 0, this._loadSeq += 1, this._normalized = U(e, this.hass, this._activeIndex);
		let n = this._resolveActiveIndex(t);
		n !== this._activeIndex && (this._activeIndex = n, this._normalized = U(e, this.hass, n)), this._tileValuesOverride = void 0, this._tooltip = void 0, X(this._debug, "config applied", {
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
		let e = this._config?.grid_options?.rows, t = this._config?.grid_options?.columns, n = typeof e == "number" && Number.isFinite(e) ? Math.max(1, e) : this._estimatedGridRows(), r = typeof t == "number" && Number.isFinite(t) ? Math.max(1, t) : 12, i = this._config?.grid_options?.min_rows, a = this._config?.grid_options?.min_columns;
		return {
			rows: n,
			columns: r,
			min_rows: Math.min(typeof i == "number" && Number.isFinite(i) ? i : 4, n),
			min_columns: Math.min(typeof a == "number" && Number.isFinite(a) ? a : 6, r)
		};
	}
	connectedCallback() {
		super.connectedCallback(), this._setupVisibilityObserver(), this._requestActiveSeriesLoad();
	}
	disconnectedCallback() {
		this._visibilityObserver?.disconnect(), this._visibilityObserver = void 0, super.disconnectedCallback();
	}
	static getStubConfig() {
		return {
			entity: "sensor.example_temperature",
			range: { days: 30 },
			bucket: {
				interval: "day",
				value: "mean"
			},
			scale: { preset: "temperature" }
		};
	}
	static getConfigElement() {
		return document.createElement(nn);
	}
	static getConfigForm() {
		return mt();
	}
	updated(e) {
		this._config && (e.has("hass") || e.has("_activeIndex")) && (this._normalized = U(this._config, this.hass, this._activeIndex), this._requestActiveSeriesLoad()), (e.has("_buckets") || e.has("_loading") || e.has("_tileValuesOverride") || e.has("_warning")) && this.updateComplete.then(() => this._drawHeatmap());
	}
	render() {
		if (!this._normalized) return D`<ha-card><div class="empty">Configure ${en}</div></ha-card>`;
		let e = this._normalized.entities[this._activeIndex], t = e ? this.hass?.states[e.entity] : void 0, n = this._normalized.title ?? e?.name ?? "Universal Heatmap Card";
		return D`
      <ha-card class=${this._shouldBoundToGrid() ? "grid-bound" : ""}>
        <div class="header">
          <div>
            <div class="title">${n}</div>
            ${e ? D`<div class="subtitle">${e.entity}</div>` : k}
          </div>
          <div class="header-actions">
            ${this._normalized.tiles.show_value_toggle ? D`
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
                ` : k}
            ${t ? D`<div class="state-chip">${this._formatEntityState(t)}</div>` : k}
          </div>
        </div>

        ${this._renderNavigation()}

        <div class="body">
          ${this._loading ? D`<div class="status" role="status">Loading heatmap...</div>` : k}
          ${this._error ? D`<div class="status error" role="alert" title=${this._error}>${this._error}</div>` : k}
          ${this._warning ? D`<div class="status warning" role="status" title=${this._warning}>${this._warning}</div>` : k}
          ${this._normalized.axes.show_key ? this._renderAxisKey() : k}
          <div class="canvas-wrap">
            <canvas
              role="img"
              tabindex="0"
              aria-label=${this._heatmapDescription(n)}
              @mousemove=${this._handleCanvasMove}
              @mouseleave=${this._clearTooltip}
              @keydown=${this._handleCanvasKeyDown}
              @click=${this._handleCanvasClick}
            ></canvas>
            ${this._tooltip && this._normalized.tooltip.show ? D`<div
                  class="tooltip"
                  style=${`left:${this._tooltip.x}px;top:${this._tooltip.y}px`}
                >
                  ${this._tooltip.label}
                </div>` : k}
          </div>
          ${this._renderSummary()}
          ${this._normalized.legend.show && this._scale ? this._renderLegend() : k}
        </div>
      </ha-card>
    `;
	}
	_renderNavigation() {
		let e = this._normalized;
		if (!e || e.entities.length <= 1) return k;
		if (e.navigation.mode === "dropdown") return D`
        <div class="nav">
          <select @change=${this._handleSelectChange}>
            ${e.entities.map((e, t) => D`
                <option value=${t} ?selected=${t === this._activeIndex}>
                  ${e.name}
                </option>
              `)}
          </select>
        </div>
      `;
		if (e.navigation.mode === "arrows") {
			let t = e.entities[this._activeIndex];
			return D`
        <div class="nav arrows">
          <button type="button" @click=${this._previousEntity} aria-label="Previous entity">
            ‹
          </button>
          <span>${t?.name}</span>
          <button type="button" @click=${this._nextEntity} aria-label="Next entity">›</button>
        </div>
      `;
		}
		return e.navigation.mode === "dots" ? D`
        <div class="nav dots">
          ${e.entities.map((e, t) => D`
              <button
                type="button"
                class=${t === this._activeIndex ? "active" : ""}
                title=${e.name}
                aria-label=${e.name}
                aria-pressed=${t === this._activeIndex ? "true" : "false"}
                @click=${() => this._setActiveIndex(t)}
              ></button>
            `)}
        </div>
      ` : D`
      <div class="nav tabs">
        ${e.entities.map((e, t) => D`
            <button
              type="button"
              class=${t === this._activeIndex ? "active" : ""}
              title=${e.name}
              aria-pressed=${t === this._activeIndex ? "true" : "false"}
              @click=${() => this._setActiveIndex(t)}
            >
              ${e.name}
            </button>
          `)}
      </div>
    `;
	}
	_estimatedGridRows() {
		let e = this._normalized;
		return e ? jt(e, this._layoutState()) : 6;
	}
	_estimatedMasonryRows() {
		let e = this._normalized;
		return e ? Mt(e, this._layoutState()) : 6;
	}
	_layoutState() {
		return {
			loading: this._loading,
			warning: !!this._warning,
			error: !!this._error
		};
	}
	_renderSummary() {
		if (!this._scale || this._buckets.length === 0) return k;
		let e = this._buckets.map((e) => e.value).filter((e) => typeof e == "number" && Number.isFinite(e));
		if (e.length === 0) return D`<div class="summary">No bucket data loaded.</div>`;
		let t = this.hass?.locale?.language, n = Math.min(...e), r = Math.max(...e), i = [...this._buckets].reverse().find((e) => e.value !== null)?.value ?? null;
		return D`
      <div class="summary" aria-live="polite">
        <span>Low ${Q(n, this._scale, t)}</span>
        <span>High ${Q(r, this._scale, t)}</span>
        <span>Latest ${Q(i, this._scale, t)}</span>
      </div>
    `;
	}
	_renderAxisKey() {
		return this._normalized ? D`
      <div class="axis-key" aria-label="Heatmap encoding">
        <span><b>X</b> ${this._xAxisLabel()}</span>
        <span><b>Y</b> ${this._yAxisLabel()}</span>
        <span><b>Color</b> ${this._colorAxisLabel()}</span>
      </div>
    ` : k;
	}
	_renderLegend() {
		if (!this._scale) return k;
		let e = `${this._scale.clippedLow ? "≤ " : ""}${Q(this._scale.min, this._scale, this.hass?.locale?.language)}`, t = `${this._scale.clippedHigh ? "≥ " : ""}${Q(this._scale.max, this._scale, this.hass?.locale?.language)}`;
		return D`
      <div class="legend">
        <span>${e}</span>
        <div
          class="legend-bar"
          style=${`background: linear-gradient(90deg, ${Ht(this._scale)});`}
        ></div>
        <span>${t}</span>
      </div>
    `;
	}
	async _loadActiveSeries() {
		let e = this._normalized, t = this.hass, n = e?.entities[this._activeIndex];
		if (!e || !t || !n) return;
		let r = this._seriesCacheKey(e, n), i = this._cache.get(r);
		if (i && this._isCacheFresh(i, e.data.refresh_interval)) {
			X(this._debug, "cache hit", {
				entity: n.entity,
				source: i.result.source,
				buckets: i.result.buckets.length,
				ageMs: Date.now() - i.loadedAt
			}), this._buckets = i.result.buckets, this._scale = i.scale, this._warning = i.result.warning, this._error = void 0, this._loading = !1;
			return;
		}
		if (this._inFlightKey === r) {
			X(this._debug, "load already in flight", {
				entity: n.entity,
				queue: Le(e.data.max_concurrent_requests)
			});
			return;
		}
		i && X(this._debug, "cache stale", {
			entity: n.entity,
			ageMs: Date.now() - i.loadedAt,
			refreshInterval: e.data.refresh_interval
		});
		let a = ++this._loadSeq;
		this._inFlightKey = r, this._loading = !0, this._error = void 0, this._warning = void 0;
		let o = this._debug ? J() : 0, s = this._debug ? J() : 0;
		X(this._debug, "load start", {
			entity: n.entity,
			provider: e.data.provider,
			range: e.range,
			bucket: e.bucket
		});
		try {
			let i = await Ie(async () => {
				if (a !== this._loadSeq) throw new rn();
				return ct(t, e, n);
			}, {
				maxConcurrent: e.data.max_concurrent_requests,
				onQueued: (e) => X(this._debug, "request queued", {
					entity: n.entity,
					...e
				}),
				onStart: (e) => X(this._debug, "request start", {
					entity: n.entity,
					...e
				})
			});
			if (a !== this._loadSeq) return;
			let c = this._debug ? Y(J() - s) : 0, l = this._debug ? J() : 0, u = Bt(i.buckets, {
				...e.scale,
				...n.scale
			}), d = this._debug ? Y(J() - l) : 0;
			this._cache.set(r, {
				result: i,
				scale: u,
				loadedAt: Date.now()
			}), this._buckets = i.buckets, this._scale = u, this._warning = i.warning, X(this._debug, "load complete", {
				entity: n.entity,
				source: i.source,
				buckets: i.buckets.length,
				fetchMs: c,
				scaleMs: d,
				totalMs: Y(J() - o),
				scaleMin: u.min,
				scaleMax: u.max,
				warning: i.warning
			});
		} catch (e) {
			if (e instanceof rn) {
				X(this._debug, "stale queued load skipped", { entity: n.entity });
				return;
			}
			if (a !== this._loadSeq) return;
			this._error = e instanceof Error ? e.message : "Could not load heatmap data.", this._buckets = [], X(this._debug, "load failed", {
				entity: n.entity,
				totalMs: Y(J() - o),
				error: this._error
			});
		} finally {
			this._inFlightKey === r && (this._inFlightKey = void 0), a === this._loadSeq && (this._loading = !1);
		}
	}
	_requestActiveSeriesLoad() {
		if (!(!this._normalized || !this.hass)) {
			if (this._shouldDeferLoad()) {
				this._deferredLoadPending = !0, X(this._debug, "load deferred until visible", { queue: Le(this._normalized.data.max_concurrent_requests) });
				return;
			}
			this._deferredLoadPending = !1, this._loadActiveSeries();
		}
	}
	_shouldDeferLoad() {
		return !this._normalized?.data.defer_until_visible || globalThis.IntersectionObserver === void 0 ? !1 : !this._visibleForLoad;
	}
	_setupVisibilityObserver() {
		if (this._visibilityObserver?.disconnect(), globalThis.IntersectionObserver === void 0) {
			this._visibleForLoad = !0;
			return;
		}
		this._visibilityObserver = new IntersectionObserver((e) => {
			let t = e.some((e) => e.isIntersecting || e.intersectionRatio > 0);
			t !== this._visibleForLoad && (this._visibleForLoad = t, t && this._deferredLoadPending && this._requestActiveSeriesLoad());
		}, { rootMargin: "320px 0px" }), this._visibilityObserver.observe(this);
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
			scale: {
				...e.scale,
				...t.scale
			}
		});
	}
	_isCacheFresh(e, t) {
		return t <= 0 || Date.now() - e.loadedAt < t * 1e3;
	}
	_drawHeatmap() {
		let e = this.renderRoot.querySelector("canvas");
		if (!e || !this._scale) return;
		let t = e.getContext("2d");
		if (!t) return;
		let n = this._debug ? J() : 0, r = e.parentElement, i = Math.max(260, Math.floor(r?.clientWidth ?? 320)), a = this._boundedCanvasHeight(), o = this._calculateLayout(i, a), s = window.devicePixelRatio || 1;
		e.width = Math.floor(o.width * s), e.height = Math.floor(o.height * s), e.style.height = `${o.height}px`, e.style.width = `${o.width}px`, t.setTransform(s, 0, 0, s, 0, 0), t.clearRect(0, 0, o.width, o.height), this._drawAxes(t, o);
		for (let e of this._placement?.cells ?? []) {
			let n = this._buckets[e.index];
			if (!n) continue;
			let r = o.cell / e.slots, i = o.gridX + e.col * (o.cell + o.gap) + e.slot * r, a = o.gridY + e.row * (o.cell + o.gap), s = Vt(n.value, this._scale);
			t.fillStyle = s, t.fillRect(i, a, r, o.cell), n.quality === "carried" && (t.fillStyle = "rgba(255, 255, 255, 0.34)", t.fillRect(i, a + o.cell - 3, r, 3)), this._drawCellValue(t, n, o, i, a, s, r);
		}
		this._renderLayout = o, X(this._debug, "draw complete", {
			buckets: this._buckets.length,
			cols: o.cols,
			rows: o.rows,
			cell: o.cell,
			width: o.width,
			height: o.height,
			maxCanvasHeight: a,
			ms: Y(J() - n)
		});
	}
	_calculateLayout(e, t) {
		let n = this._normalized?.bucket.interval ?? "day", r = Lt(n, Math.max(1, this._buckets.length)), i = Dt(this._buckets, n, r);
		this._placement = i;
		let a = this._shouldShowRowLabels() ? 58 : 0, o = this._shouldShowXAxisLabels() ? 18 : 0, s = Math.max(160, e - a), c = i.rows, l = this._shouldReserveForTileValues(), u = l ? 14 : 7, d = Math.min(l ? 28 : 22, Math.floor((s - 3 * (r - 1)) / r));
		if (d = Math.max(d >= u ? u : 7, d), typeof t == "number") {
			let e = Math.max(0, t - o), n = Math.floor((e - Math.max(0, c - 1) * 3) / c);
			Number.isFinite(n) && n >= 7 && (d = Math.min(d, n));
		}
		let f = r * d + Math.max(0, r - 1) * 3, p = c * d + Math.max(0, c - 1) * 3, m = o + p;
		return {
			cols: r,
			rows: c,
			cell: d,
			gap: 3,
			width: e,
			height: m,
			gridX: a,
			gridY: o,
			gridWidth: f,
			gridHeight: p
		};
	}
	_drawCellValue(e, t, n, r, i, a, o = n.cell) {
		if (!this._showTileValues() || !this._scale || t.value === null) return;
		let s = Xe(n.cell);
		if (s <= 0) return;
		let c = this._formatCellValue(t.value, o);
		if (!c) return;
		let l = this._cellTextColor(a), u = l === "#111827" ? "rgba(255, 255, 255, 0.26)" : "rgba(0, 0, 0, 0.32)", d = r + o / 2, f = i + n.cell / 2 + .5, p = Math.max(4, o - 2);
		e.save(), e.font = `600 ${s}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`, e.textAlign = "center", e.textBaseline = "middle", e.lineJoin = "round", e.lineWidth = Math.max(1.5, s / 4), e.strokeStyle = u, e.fillStyle = l, e.strokeText(c, d, f, p), e.fillText(c, d, f, p), e.restore();
	}
	_formatCellValue(e, t) {
		if (!Number.isFinite(e) || !this._scale) return "";
		if (Math.abs(e) >= 1e3 && t < 24) return this._cellNumberFormat("compact:1", {
			compactDisplay: "short",
			maximumFractionDigits: 1,
			notation: "compact"
		}).format(e);
		let n = Ze(Math.abs(this._scale.max - this._scale.min), t);
		return this._cellNumberFormat(`fixed:${n}`, {
			maximumFractionDigits: n,
			minimumFractionDigits: n
		}).format(e);
	}
	_cellNumberFormat(e, t) {
		let n = `${this.hass?.locale?.language ?? ""}|${e}`, r = this._cellFormatCache.get(n);
		return r || (this._cellFormatCache.size >= 8 && this._cellFormatCache.clear(), r = new Intl.NumberFormat(this.hass?.locale?.language, t), this._cellFormatCache.set(n, r)), r;
	}
	_cellTextColor(e) {
		let t = this._parseColor(e);
		return t && (.2126 * t.r + .7152 * t.g + .0722 * t.b) / 255 > .62 ? "#111827" : "#ffffff";
	}
	_parseColor(e) {
		let t = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(e);
		if (t) {
			let [, e = "0", n = "0", r = "0"] = t;
			return {
				r: Number(e),
				g: Number(n),
				b: Number(r)
			};
		}
		let n = e.replace("#", "").trim(), r = n.length === 3 ? n.split("").map((e) => `${e}${e}`).join("") : n;
		if (/^[0-9a-fA-F]{6}$/.test(r)) return {
			r: Number.parseInt(r.slice(0, 2), 16),
			g: Number.parseInt(r.slice(2, 4), 16),
			b: Number.parseInt(r.slice(4, 6), 16)
		};
	}
	_boundedCanvasHeight() {
		if (!this._shouldBoundToGrid()) return;
		let e = this._config?.grid_options?.rows;
		if (typeof e != "number" || !Number.isFinite(e) || e <= 0) return;
		let t = this._normalized;
		if (!t) return;
		let n = kt(e) - Pt(t, this._layoutState());
		if (!(n <= 0)) return Math.max(120, n);
	}
	_shouldBoundToGrid() {
		let e = this._normalized?.layout.bound_to_grid ?? "auto";
		if (e === !0) return !0;
		if (e === !1) return !1;
		let t = this._config?.grid_options?.rows;
		return typeof t == "number" && Number.isFinite(t) && t > 0;
	}
	_drawAxes(e, t) {
		if (!this._normalized?.axes.show) return;
		let n = getComputedStyle(this), r = n.getPropertyValue("--secondary-text-color").trim() || "#64748b", i = n.getPropertyValue("--divider-color").trim() || "#d8dee8";
		if (e.save(), e.font = "11px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", e.fillStyle = r, e.strokeStyle = i, e.lineWidth = 1, this._normalized.axes.x_labels) for (let n of this._xAxisTicks(t)) {
			let r = t.gridX + n.col * (t.cell + t.gap);
			e.textAlign = n.align, e.textBaseline = "top", e.fillText(n.label, r, 0);
		}
		if (this._shouldShowRowLabels()) {
			e.textAlign = "right", e.textBaseline = "middle";
			for (let n = 0; n < t.rows; n += 1) {
				let r = this._firstBucketInRow(n);
				if (!r) continue;
				let i = t.gridY + n * (t.cell + t.gap) + t.cell / 2;
				e.fillText(this._rowLabel(r.start), t.gridX - 8, i);
			}
			e.beginPath(), e.moveTo(t.gridX - 3.5, t.gridY), e.lineTo(t.gridX - 3.5, t.gridY + t.gridHeight), e.stroke();
		}
		e.restore();
	}
	_handleCanvasMove(e) {
		if (!this._renderLayout || !this._scale || !this._normalized?.tooltip.show) return;
		let t = e.currentTarget.getBoundingClientRect(), n = e.clientX - t.left, r = e.clientY - t.top, i = this._renderLayout.cell + this._renderLayout.gap;
		if (n < this._renderLayout.gridX || n > this._renderLayout.gridX + this._renderLayout.gridWidth || r < this._renderLayout.gridY || r > this._renderLayout.gridY + this._renderLayout.gridHeight) {
			this._tooltip = void 0;
			return;
		}
		let a = Math.floor((n - this._renderLayout.gridX) / i), o = Math.floor((r - this._renderLayout.gridY) / i), s = (this._placement?.cells ?? []).filter((e) => e.row === o && e.col === a), c = s[0]?.slots ?? 1, l = n - this._renderLayout.gridX - a * i, u = Math.min(c - 1, Math.max(0, Math.floor(l / this._renderLayout.cell * c))), d = s.find((e) => e.slot === u) ?? s[0], f = d ? this._buckets[d.index] : void 0;
		if (!d || !f) {
			this._tooltip = void 0;
			return;
		}
		let p = d.slots > 1 ? ` (${Ot(f.start)})` : "", m = `${this._formatDate(f.start)} - ${this._formatDate(f.end)}${p}: ${Q(f.value, this._scale, this.hass?.locale?.language)}`;
		this._tooltip = {
			x: Math.min(n + 12, t.width - 160),
			y: Math.max(4, r - 28),
			bucket: f,
			label: m
		};
	}
	_handleCanvasClick() {
		this._openActiveEntityDetails();
	}
	_handleCanvasKeyDown(e) {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._openActiveEntityDetails());
	}
	_openActiveEntityDetails() {
		let e = this._normalized?.entities[this._activeIndex];
		e && this.dispatchEvent(new CustomEvent("hass-more-info", {
			bubbles: !0,
			composed: !0,
			detail: { entityId: e.entity }
		}));
	}
	_showTileValues() {
		return this._tileValuesOverride ?? this._normalized?.tiles.show_values ?? !1;
	}
	_shouldReserveForTileValues() {
		return !!(this._normalized?.tiles.show_values || this._normalized?.tiles.show_value_toggle);
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
		if (!this._normalized) return 0;
		if (e) {
			let t = this._normalized.entities.findIndex((t) => t.entity === e);
			return t >= 0 ? t : 0;
		}
		return Math.min(this._activeIndex, Math.max(0, this._normalized.entities.length - 1));
	}
	_previousEntity() {
		if (!this._normalized) return;
		let e = this._normalized.entities.length;
		this._activeIndex = (this._activeIndex + e - 1) % e;
	}
	_nextEntity() {
		this._normalized && (this._activeIndex = (this._activeIndex + 1) % this._normalized.entities.length);
	}
	_handleSelectChange(e) {
		let t = e.target;
		this._setActiveIndex(Number(t.value));
	}
	_formatEntityState(e) {
		if (this.hass?.formatEntityState) return this.hass.formatEntityState(e);
		let t = e.attributes.unit_of_measurement ? ` ${String(e.attributes.unit_of_measurement)}` : "";
		return `${e.state}${t}`;
	}
	_formatDate(e) {
		return new Intl.DateTimeFormat(this.hass?.locale?.language, {
			month: "short",
			day: "numeric",
			hour: this._normalized?.bucket.interval === "hour" ? "numeric" : void 0
		}).format(e);
	}
	_xAxisLabel() {
		switch (this._normalized?.bucket.interval) {
			case "5minute":
			case "hour": return "time of day";
			case "day": return "day of week";
			case "week": return "week";
			case "month": return "month";
			default: return "bucket";
		}
	}
	_yAxisLabel() {
		switch (this._normalized?.bucket.interval) {
			case "5minute":
			case "hour": return "date";
			case "day": return "week row";
			case "week":
			case "month": return "period row";
			default: return "row";
		}
	}
	_colorAxisLabel() {
		return `${this._bucketValueLabel(this._normalized?.bucket.value)}${this._scale?.unit ? ` (${this._scale.unit})` : ""}`;
	}
	_bucketValueLabel(e) {
		switch (e) {
			case "mean": return "average value";
			case "max": return "peak value";
			case "min": return "low value";
			case "last":
			case "state": return "last value";
			case "sum": return "total";
			case "delta":
			case "change": return "change";
			case "count": return "sample count";
			case "percent_on": return "percent on";
			case "duration_on": return "time on";
			default: return "bucket value";
		}
	}
	_shouldShowRowLabels() {
		return !!(this._normalized?.axes.show && this._normalized.axes.y_labels && this._buckets.length > 0);
	}
	_shouldShowXAxisLabels() {
		return !!(this._normalized?.axes.show && this._normalized.axes.x_labels && this._buckets.length > 0);
	}
	_xAxisTicks(e) {
		let t = this._normalized?.bucket.interval;
		return t === "hour" ? this._timeTicks([
			0,
			6,
			12,
			18,
			23
		]) : t === "5minute" ? this._timeTicks([
			0,
			12,
			24,
			36,
			47
		]) : t === "day" ? [
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat",
			"Sun"
		].map((e, t) => ({
			col: t,
			label: e,
			align: "center"
		})) : t === "month" ? [
			"Jan",
			"Apr",
			"Jul",
			"Oct",
			"Dec"
		].map((e, t) => ({
			col: [
				0,
				3,
				6,
				9,
				11
			][t] ?? 0,
			label: e,
			align: t === 0 ? "left" : t === 4 ? "right" : "center"
		})) : [{
			col: 0,
			label: "Start",
			align: "left"
		}, {
			col: Math.max(0, e.cols - 1),
			label: "End",
			align: "right"
		}];
	}
	_timeTicks(e) {
		return e.map((t, n) => {
			let r = this._firstBucketInColumn(t);
			return {
				col: t,
				label: r ? this._formatHour(r.start) : String(t),
				align: n === 0 ? "left" : n === e.length - 1 ? "right" : "center"
			};
		});
	}
	_firstBucketInRow(e) {
		let t = this._placement?.cells.find((t) => t.row === e);
		return t ? this._buckets[t.index] : void 0;
	}
	_firstBucketInColumn(e) {
		let t = this._placement?.cells.find((t) => t.col === e);
		return t ? this._buckets[t.index] : void 0;
	}
	_formatHour(e) {
		return new Intl.DateTimeFormat(this.hass?.locale?.language, { hour: "numeric" }).formatToParts(e).filter((e) => e.type === "hour" || e.type === "dayPeriod").map((e) => e.value.toLowerCase()).join("").replace(/\s/g, "");
	}
	_rowLabel(e) {
		let t = this._normalized?.bucket.interval === "month" ? { year: "2-digit" } : {
			month: "short",
			day: "numeric"
		};
		return new Intl.DateTimeFormat(this.hass?.locale?.language, t).format(e);
	}
	static {
		this.styles = o`
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
	}
}, on = class extends P {
	constructor(...e) {
		super(...e), this._form = mt();
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	setConfig(e) {
		this._config = e;
	}
	render() {
		return this._config ? D`
      <ha-form
        .hass=${this.hass}
        .data=${this._editorData()}
        .schema=${this._form.schema}
        .computeLabel=${this._form.computeLabel}
        .computeHelper=${this._form.computeHelper}
        @value-changed=${this._handleValueChanged}
      ></ha-form>
      ${this._renderEntityNameEditor()}
    ` : k;
	}
	_editorData() {
		let { entity: e, ...t } = this._config ?? {};
		return {
			...t,
			entities: Z(this._config ?? {})
		};
	}
	_handleValueChanged(e) {
		if (!this._config) return;
		let t = e.detail.value ?? {}, n = this._selectedEntities(t.entities), r = {
			...this._config,
			...t,
			entities: gt(this._config, n)
		};
		this._applyConfig(r);
	}
	_selectedEntities(e) {
		return Array.isArray(e) ? e.filter((e) => typeof e == "string" && e.length > 0) : typeof e == "string" && e.length > 0 ? [e] : Z(this._config ?? {});
	}
	_renderEntityNameEditor() {
		if (!this._config) return k;
		let e = gt(this._config, Z(this._config));
		return e.length === 0 ? k : D`
      <section class="editor-section" aria-label="Entity labels">
        <div class="editor-title">Entity labels</div>
        <div class="editor-helper">
          Optional tab/card labels. Leave blank to use Home Assistant's entity name.
        </div>
        ${e.map((e) => {
			let t = typeof e == "string" ? e : e.entity, n = typeof e == "string" ? "" : e.name ?? "";
			return D`
            <label class="alias-row">
              <span class="alias-copy">
                <span class="alias-entity">${t}</span>
                <span class="alias-default">${this._defaultEntityName(t)}</span>
              </span>
              <input
                .value=${n}
                placeholder="Use Home Assistant name"
                @input=${(e) => this._handleEntityNameInput(t, e)}
              />
            </label>
          `;
		})}
      </section>
    `;
	}
	_handleEntityNameInput(e, t) {
		if (!this._config) return;
		let n = t.target;
		this._applyConfig(_t(this._config, e, n.value));
	}
	_defaultEntityName(e) {
		let t = this.hass?.states[e];
		return t && this.hass?.formatEntityName ? this.hass.formatEntityName(t) : t?.attributes.friendly_name ? String(t.attributes.friendly_name) : e;
	}
	_applyConfig(e) {
		delete e.entity, this._config = e, this.dispatchEvent(new CustomEvent("config-changed", {
			bubbles: !0,
			composed: !0,
			detail: { config: e }
		}));
	}
	static {
		this.styles = o`
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
	}
};
customElements.get("universal-heatmap-card") || customElements.define($t, an), customElements.get(nn) || customElements.define(nn, on), window.customCards = window.customCards ?? [], window.customCards.push({
	type: $t,
	name: en,
	preview: !0,
	description: "Canvas heatmaps for Home Assistant recorder statistics and short history ranges.",
	documentationURL: "https://github.com/gcs8/universal-heatmap-card"
}), console.info(`%c${en}%c ${tn}`, "color: #3a6ea5; font-weight: 700;", "color: inherit;");
//#endregion
