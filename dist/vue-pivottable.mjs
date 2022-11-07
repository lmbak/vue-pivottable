const wn = function(t, n, r) {
  const e = String(t).split(".");
  let i = e[0];
  const o = e.length > 1 ? r + e[1] : "", a = /(\d+)(\d{3})/;
  for (; a.test(i); )
    i = i.replace(a, `$1${n}$2`);
  return i + o;
}, Oe = function(t) {
  const r = Object.assign({}, {
    digitsAfterDecimal: 2,
    scaler: 1,
    thousandsSep: ",",
    decimalSep: ".",
    prefix: "",
    suffix: ""
  }, t);
  return function(e) {
    if (isNaN(e) || !isFinite(e))
      return "";
    const i = wn(
      (r.scaler * e).toFixed(r.digitsAfterDecimal),
      r.thousandsSep,
      r.decimalSep
    );
    return `${r.prefix}${i}${r.suffix}`;
  };
}, Je = /(\d+)|(\D+)/g, oe = /\d/, Qe = /^0/, Rt = (t, n) => {
  if (n !== null && t === null)
    return -1;
  if (t !== null && n === null)
    return 1;
  if (typeof t == "number" && isNaN(t))
    return -1;
  if (typeof n == "number" && isNaN(n))
    return 1;
  const r = Number(t), e = Number(n);
  if (r < e)
    return -1;
  if (r > e)
    return 1;
  if (typeof t == "number" && typeof n != "number")
    return -1;
  if (typeof n == "number" && typeof t != "number")
    return 1;
  if (typeof t == "number" && typeof n == "number")
    return 0;
  if (isNaN(e) && !isNaN(r))
    return -1;
  if (isNaN(r) && !isNaN(e))
    return 1;
  let i = String(t), o = String(n);
  if (i === o)
    return 0;
  if (!oe.test(i) || !oe.test(o))
    return i > o ? 1 : -1;
  for (i = i.match(Je), o = o.match(Je); i.length && o.length; ) {
    const a = i.shift(), s = o.shift();
    if (a !== s)
      return oe.test(a) && oe.test(s) ? a.replace(Qe, ".0") - s.replace(Qe, ".0") : a > s ? 1 : -1;
  }
  return i.length - o.length;
}, un = function(t) {
  const n = {}, r = {};
  for (const e in t) {
    const i = t[e];
    n[i] = e, typeof i == "string" && (r[i.toLowerCase()] = e);
  }
  return function(e, i) {
    return e in n && i in n ? n[e] - n[i] : e in n ? -1 : i in n ? 1 : e in r && i in r ? r[e] - r[i] : e in r ? -1 : i in r ? 1 : Rt(e, i);
  };
}, De = function(t, n) {
  if (t) {
    if (typeof t == "function") {
      const r = t(n);
      if (typeof r == "function")
        return r;
    } else if (n in t)
      return t[n];
  }
  return Rt;
}, K = Oe(), Ft = Oe({ digitsAfterDecimal: 0 }), vt = Oe({
  digitsAfterDecimal: 1,
  scaler: 100,
  suffix: "%"
}), Z = {
  count(t = Ft) {
    return () => function() {
      return {
        count: 0,
        push() {
          this.count++;
        },
        value() {
          return this.count;
        },
        format: t
      };
    };
  },
  uniques(t, n = Ft) {
    return function([r]) {
      return function() {
        return {
          uniq: [],
          push(e) {
            Array.from(this.uniq).includes(e[r]) || this.uniq.push(e[r]);
          },
          value() {
            return t(this.uniq);
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  sum(t = K) {
    return function([n]) {
      return function() {
        return {
          sum: 0,
          push(r) {
            isNaN(parseFloat(r[n])) || (this.sum += parseFloat(r[n]));
          },
          value() {
            return this.sum;
          },
          format: t,
          numInputs: typeof n < "u" ? 0 : 1
        };
      };
    };
  },
  extremes(t, n = K) {
    return function([r]) {
      return function(e) {
        return {
          val: null,
          sorter: De(
            typeof e < "u" ? e.sorters : null,
            r
          ),
          push(i) {
            let o = i[r];
            ["min", "max"].includes(t) && (o = parseFloat(o), isNaN(o) || (this.val = Math[t](o, this.val !== null ? this.val : o))), t === "first" && this.sorter(o, this.val !== null ? this.val : o) <= 0 && (this.val = o), t === "last" && this.sorter(o, this.val !== null ? this.val : o) >= 0 && (this.val = o);
          },
          value() {
            return this.val;
          },
          format(i) {
            return isNaN(i) ? i : n(i);
          },
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  quantile(t, n = K) {
    return function([r]) {
      return function() {
        return {
          vals: [],
          push(e) {
            const i = parseFloat(e[r]);
            isNaN(i) || this.vals.push(i);
          },
          value() {
            if (this.vals.length === 0)
              return null;
            this.vals.sort((i, o) => i - o);
            const e = (this.vals.length - 1) * t;
            return (this.vals[Math.floor(e)] + this.vals[Math.ceil(e)]) / 2;
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  runningStat(t = "mean", n = 1, r = K) {
    return function([e]) {
      return function() {
        return {
          n: 0,
          m: 0,
          s: 0,
          push(i) {
            const o = parseFloat(i[e]);
            if (isNaN(o))
              return;
            this.n += 1, this.n === 1 && (this.m = o);
            const a = this.m + (o - this.m) / this.n;
            this.s = this.s + (o - this.m) * (o - a), this.m = a;
          },
          value() {
            if (t === "mean")
              return this.n === 0 ? 0 / 0 : this.m;
            if (this.n <= n)
              return 0;
            switch (t) {
              case "var":
                return this.s / (this.n - n);
              case "stdev":
                return Math.sqrt(this.s / (this.n - n));
              default:
                throw new Error("unknown mode for runningStat");
            }
          },
          format: r,
          numInputs: typeof e < "u" ? 0 : 1
        };
      };
    };
  },
  sumOverSum(t = K) {
    return function([n, r]) {
      return function() {
        return {
          sumNum: 0,
          sumDenom: 0,
          push(e) {
            isNaN(parseFloat(e[n])) || (this.sumNum += parseFloat(e[n])), isNaN(parseFloat(e[r])) || (this.sumDenom += parseFloat(e[r]));
          },
          value() {
            return this.sumNum / this.sumDenom;
          },
          format: t,
          numInputs: typeof n < "u" && typeof r < "u" ? 0 : 2
        };
      };
    };
  },
  fractionOf(t, n = "total", r = vt) {
    return (...e) => function(i, o, a) {
      return {
        selector: { total: [[], []], row: [o, []], col: [[], a] }[n],
        inner: t(...Array.from(e || []))(i, o, a),
        push(s) {
          this.inner.push(s);
        },
        format: r,
        value() {
          return this.inner.value() / i.getAggregator(...Array.from(this.selector || [])).inner.value();
        },
        numInputs: t(...Array.from(e || []))().numInputs
      };
    };
  }
};
Z.countUnique = (t) => Z.uniques((n) => n.length, t);
Z.listUnique = (t) => Z.uniques((n) => n.join(t), (n) => n);
Z.max = (t) => Z.extremes("max", t);
Z.min = (t) => Z.extremes("min", t);
Z.first = (t) => Z.extremes("first", t);
Z.last = (t) => Z.extremes("last", t);
Z.median = (t) => Z.quantile(0.5, t);
Z.average = (t) => Z.runningStat("mean", 1, t);
Z.var = (t, n) => Z.runningStat("var", t, n);
Z.stdev = (t, n) => Z.runningStat("stdev", t, n);
const te = ((t) => ({
  Count: t.count(Ft),
  "Count Unique Values": t.countUnique(Ft),
  "List Unique Values": t.listUnique(", "),
  Sum: t.sum(K),
  "Integer Sum": t.sum(Ft),
  Average: t.average(K),
  Median: t.median(K),
  "Sample Variance": t.var(1, K),
  "Sample Standard Deviation": t.stdev(1, K),
  Minimum: t.min(K),
  Maximum: t.max(K),
  First: t.first(K),
  Last: t.last(K),
  "Sum over Sum": t.sumOverSum(K),
  "Sum as Fraction of Total": t.fractionOf(t.sum(), "total", vt),
  "Sum as Fraction of Rows": t.fractionOf(t.sum(), "row", vt),
  "Sum as Fraction of Columns": t.fractionOf(t.sum(), "col", vt),
  "Count as Fraction of Total": t.fractionOf(t.count(), "total", vt),
  "Count as Fraction of Rows": t.fractionOf(t.count(), "row", vt),
  "Count as Fraction of Columns": t.fractionOf(t.count(), "col", vt)
}))(Z), En = ((t) => ({
  Compte: t.count(Ft),
  "Compter les valeurs uniques": t.countUnique(Ft),
  "Liste des valeurs uniques": t.listUnique(", "),
  Somme: t.sum(K),
  "Somme de nombres entiers": t.sum(Ft),
  Moyenne: t.average(K),
  M\u00E9diane: t.median(K),
  "Variance de l'\xE9chantillon": t.var(1, K),
  "\xC9cart-type de l'\xE9chantillon": t.stdev(1, K),
  Minimum: t.min(K),
  Maximum: t.max(K),
  Premier: t.first(K),
  Dernier: t.last(K),
  "Somme Total": t.sumOverSum(K),
  "Somme en fraction du total": t.fractionOf(t.sum(), "total", vt),
  "Somme en tant que fraction de lignes": t.fractionOf(t.sum(), "row", vt),
  "Somme en tant que fraction de colonnes": t.fractionOf(t.sum(), "col", vt),
  "Comptage en tant que fraction du total": t.fractionOf(t.count(), "total", vt),
  "Comptage en tant que fraction de lignes": t.fractionOf(t.count(), "row", vt),
  "Comptage en tant que fraction de colonnes": t.fractionOf(t.count(), "col", vt)
}))(Z), cn = {
  en: {
    aggregators: te,
    localeStrings: {
      renderError: "An error occurred rendering the PivotTable results.",
      computeError: "An error occurred computing the PivotTable results.",
      uiRenderError: "An error occurred rendering the PivotTable UI.",
      selectAll: "Select All",
      selectNone: "Select None",
      tooMany: "(too many to list)",
      filterResults: "Filter values",
      totals: "Totals",
      vs: "vs",
      by: "by",
      cancel: "Cancel",
      only: "only"
    }
  },
  fr: {
    frAggregators: En,
    localeStrings: {
      renderError: "Une erreur est survenue en dessinant le tableau crois\xE9.",
      computeError: "Une erreur est survenue en calculant le tableau crois\xE9.",
      uiRenderError: "Une erreur est survenue en dessinant l'interface du tableau crois\xE9 dynamique.",
      selectAll: "S\xE9lectionner tout",
      selectNone: "Ne rien s\xE9lectionner",
      tooMany: "(trop de valeurs \xE0 afficher)",
      filterResults: "Filtrer les valeurs",
      totals: "Totaux",
      vs: "sur",
      by: "par",
      apply: "Appliquer",
      cancel: "Annuler",
      only: "seul"
    }
  }
}, Cn = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
], Tn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], zt = (t) => `0${t}`.substr(-2, 2), An = {
  bin(t, n) {
    return (r) => r[t] - r[t] % n;
  },
  dateFormat(t, n, r = !1, e = Cn, i = Tn) {
    const o = r ? "UTC" : "";
    return function(a) {
      const s = new Date(Date.parse(a[t]));
      return isNaN(s) ? "" : n.replace(/%(.)/g, function(l, u) {
        switch (u) {
          case "y":
            return s[`get${o}FullYear`]();
          case "m":
            return zt(s[`get${o}Month`]() + 1);
          case "n":
            return e[s[`get${o}Month`]()];
          case "d":
            return zt(s[`get${o}Date`]());
          case "w":
            return i[s[`get${o}Day`]()];
          case "x":
            return s[`get${o}Day`]();
          case "H":
            return zt(s[`get${o}Hours`]());
          case "M":
            return zt(s[`get${o}Minutes`]());
          case "S":
            return zt(s[`get${o}Seconds`]());
          default:
            return `%${u}`;
        }
      });
    };
  }
};
class Ot {
  constructor(n = {}) {
    this.props = Object.assign({}, Ot.defaultProps, n), this.aggregator = this.props.aggregators[this.props.aggregatorName](
      this.props.vals
    ), this.tree = {}, this.rowKeys = [], this.colKeys = [], this.rowTotals = {}, this.colTotals = {}, this.allTotal = this.aggregator(this, [], []), this.sorted = !1, this.filteredData = [], Ot.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (r) => {
        this.filter(r) && (this.filteredData.push(r), this.processRecord(r));
      }
    );
  }
  filter(n) {
    for (const r in this.props.valueFilter)
      if (n[r] in this.props.valueFilter[r])
        return !1;
    return !0;
  }
  forEachMatchingRecord(n, r) {
    return Ot.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (e) => {
        if (!!this.filter(e)) {
          for (const i in n)
            if (n[i] !== (i in e ? e[i] : "null"))
              return;
          r(e);
        }
      }
    );
  }
  arrSort(n) {
    let r;
    const e = (() => {
      const i = [];
      for (r of Array.from(n))
        i.push(De(this.props.sorters, r));
      return i;
    })();
    return function(i, o) {
      for (const a of Object.keys(e || {})) {
        const s = e[a], l = s(i[a], o[a]);
        if (l !== 0)
          return l;
      }
      return 0;
    };
  }
  sortKeys() {
    if (!this.sorted) {
      this.sorted = !0;
      const n = (r, e) => this.getAggregator(r, e).value();
      switch (this.props.rowOrder) {
        case "value_a_to_z":
          this.rowKeys.sort((r, e) => Rt(n(r, []), n(e, [])));
          break;
        case "value_z_to_a":
          this.rowKeys.sort((r, e) => -Rt(n(r, []), n(e, [])));
          break;
        default:
          this.rowKeys.sort(this.arrSort(this.props.rows));
      }
      switch (this.props.colOrder) {
        case "value_a_to_z":
          this.colKeys.sort((r, e) => Rt(n([], r), n([], e)));
          break;
        case "value_z_to_a":
          this.colKeys.sort((r, e) => -Rt(n([], r), n([], e)));
          break;
        default:
          this.colKeys.sort(this.arrSort(this.props.cols));
      }
    }
  }
  getFilteredData() {
    return this.filteredData;
  }
  getColKeys() {
    return this.sortKeys(), this.colKeys;
  }
  getRowKeys() {
    return this.sortKeys(), this.rowKeys;
  }
  processRecord(n) {
    const r = [], e = [];
    for (const a of Array.from(this.props.cols))
      r.push(a in n ? n[a] : "null");
    for (const a of Array.from(this.props.rows))
      e.push(a in n ? n[a] : "null");
    const i = e.join(String.fromCharCode(0)), o = r.join(String.fromCharCode(0));
    this.allTotal.push(n), e.length !== 0 && (this.rowTotals[i] || (this.rowKeys.push(e), this.rowTotals[i] = this.aggregator(this, e, [])), this.rowTotals[i].push(n)), r.length !== 0 && (this.colTotals[o] || (this.colKeys.push(r), this.colTotals[o] = this.aggregator(this, [], r)), this.colTotals[o].push(n)), r.length !== 0 && e.length !== 0 && (this.tree[i] || (this.tree[i] = {}), this.tree[i][o] || (this.tree[i][o] = this.aggregator(
      this,
      e,
      r
    )), this.tree[i][o].push(n));
  }
  getAggregator(n, r) {
    let e;
    const i = n.join(String.fromCharCode(0)), o = r.join(String.fromCharCode(0));
    return n.length === 0 && r.length === 0 ? e = this.allTotal : n.length === 0 ? e = this.colTotals[o] : r.length === 0 ? e = this.rowTotals[i] : e = this.tree[i][o], e || {
      value() {
        return null;
      },
      format() {
        return "";
      }
    };
  }
}
Ot.forEachRecord = function(t, n, r) {
  let e, i;
  if (Object.getOwnPropertyNames(n).length === 0 ? e = r : e = function(o) {
    for (const a in n) {
      const s = n[a](o);
      s !== null && (o[a] = s);
    }
    return r(o);
  }, typeof t == "function")
    return t(e);
  if (Array.isArray(t))
    return Array.isArray(t[0]) ? (() => {
      const o = [];
      for (const a of Object.keys(t || {})) {
        const s = t[a];
        if (a > 0) {
          i = {};
          for (const l of Object.keys(t[0] || {})) {
            const u = t[0][l];
            i[u] = s[l];
          }
          o.push(e(i));
        }
      }
      return o;
    })() : (() => {
      const o = [];
      for (i of Array.from(t))
        o.push(e(i));
      return o;
    })();
  throw new Error("unknown input format");
};
Ot.defaultProps = {
  aggregators: te,
  cols: [],
  rows: [],
  vals: [],
  aggregatorName: "Count",
  sorters: {},
  valueFilter: {},
  rowOrder: "key_a_to_z",
  colOrder: "key_a_to_z",
  derivedAttributes: {}
};
const we = {
  props: {
    data: {
      type: [Array, Object, Function],
      required: !0
    },
    aggregators: {
      type: Object,
      default: function() {
        return te;
      }
    },
    aggregatorName: {
      type: String,
      default: "Count"
    },
    heatmapMode: String,
    tableColorScaleGenerator: {
      type: Function
    },
    tableOptions: {
      type: Object,
      default: function() {
        return {};
      }
    },
    renderers: Object,
    rendererName: {
      type: String,
      default: "Table"
    },
    locale: {
      type: String,
      default: "en"
    },
    locales: {
      type: Object,
      default: function() {
        return cn;
      }
    },
    rowTotal: {
      type: Boolean,
      default: !0
    },
    colTotal: {
      type: Boolean,
      default: !0
    },
    cols: {
      type: Array,
      default: function() {
        return [];
      }
    },
    rows: {
      type: Array,
      default: function() {
        return [];
      }
    },
    vals: {
      type: Array,
      default: function() {
        return [];
      }
    },
    attributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorters: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    derivedAttributes: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    rowOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(t) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(t) !== -1;
      }
    },
    colOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(t) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(t) !== -1;
      }
    },
    tableMaxWidth: {
      type: Number,
      default: 0,
      validator: function(t) {
        return t >= 0;
      }
    }
  },
  methods: {
    renderError(t) {
      return t("span", this.locales[this.locale].localeStrings.renderError || "An error occurred rendering the PivotTable results.");
    },
    computeError(t) {
      return t("span", this.locales[this.locale].localeStrings.computeError || "An error occurred computing the PivotTable results.");
    },
    uiRenderError(t) {
      return t("span", this.locales[this.locale].localeStrings.uiRenderError || "An error occurred rendering the PivotTable UI.");
    }
  }
};
function In(t) {
  const n = Math.min.apply(Math, t), r = Math.max.apply(Math, t);
  return (e) => {
    const i = 255 - Math.round(255 * (e - n) / (r - n));
    return { backgroundColor: `rgb(255,${i},${i})` };
  };
}
function ie(t = {}) {
  return {
    name: t.name,
    mixins: [
      we
    ],
    props: {
      heatmapMode: String,
      tableColorScaleGenerator: {
        type: Function,
        default: In
      },
      tableOptions: {
        type: Object,
        default: function() {
          return {
            clickCallback: null
          };
        }
      },
      localeStrings: {
        type: Object,
        default: function() {
          return {
            totals: "Totals"
          };
        }
      }
    },
    methods: {
      spanSize(r, e, i) {
        let o;
        if (e !== 0) {
          let s, l, u = !0;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[e - 1][o] !== r[e][o] && (u = !1);
          if (u)
            return -1;
        }
        let a = 0;
        for (; e + a < r.length; ) {
          let s, l, u = !1;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[e][o] !== r[e + a][o] && (u = !0);
          if (u)
            break;
          a++;
        }
        return a;
      }
    },
    render(r) {
      let e = null;
      try {
        const g = Object.assign(
          {},
          this.$props,
          this.$attrs.props
        );
        e = new Ot(g);
      } catch (g) {
        if (console && console.error(g.stack))
          return this.computeError(r);
      }
      const i = e.props.cols, o = e.props.rows, a = e.getRowKeys(), s = e.getColKeys(), l = e.getAggregator([], []);
      let u = () => {
      }, c = () => {
      }, f = () => {
      };
      if (t.heatmapMode) {
        const g = this.tableColorScaleGenerator, h = s.map(
          (m) => e.getAggregator([], m).value()
        );
        c = g(h);
        const d = a.map(
          (m) => e.getAggregator(m, []).value()
        );
        if (f = g(d), t.heatmapMode === "full") {
          const m = [];
          a.map(
            (D) => s.map(
              (O) => m.push(e.getAggregator(D, O).value())
            )
          );
          const S = g(m);
          u = (D, O, C) => S(C);
        } else if (t.heatmapMode === "row") {
          const m = {};
          a.map((S) => {
            const D = s.map(
              (O) => e.getAggregator(S, O).value()
            );
            m[S] = g(D);
          }), u = (S, D, O) => m[S](O);
        } else if (t.heatmapMode === "col") {
          const m = {};
          s.map((S) => {
            const D = a.map(
              (O) => e.getAggregator(O, S).value()
            );
            m[S] = g(D);
          }), u = (S, D, O) => m[D](O);
        }
      }
      const p = (g, h, d) => {
        const m = this.tableOptions;
        if (m && m.clickCallback) {
          const S = {};
          let D = {};
          for (let O in i)
            !d.hasOwnProperty(O) || (D = i[O], d[O] !== null && (S[D] = d[O]));
          for (let O in o)
            !h.hasOwnProperty(O) || (D = o[O], h[O] !== null && (S[D] = h[O]));
          return (O) => m.clickCallback(O, g, S, e);
        }
      };
      return r("table", {
        staticClass: ["pvtTable"]
      }, [
        r(
          "thead",
          [
            i.map((g, h) => r(
              "tr",
              {
                attrs: {
                  key: `colAttrs${h}`
                }
              },
              [
                h === 0 && o.length !== 0 ? r("th", {
                  attrs: {
                    colSpan: o.length,
                    rowSpan: i.length
                  }
                }) : void 0,
                r("th", {
                  staticClass: ["pvtAxisLabel"]
                }, g),
                s.map((d, m) => {
                  const S = this.spanSize(s, m, h);
                  return S === -1 ? null : r("th", {
                    staticClass: ["pvtColLabel"],
                    attrs: {
                      key: `colKey${m}`,
                      colSpan: S,
                      rowSpan: h === i.length - 1 && o.length !== 0 ? 2 : 1
                    }
                  }, d[h]);
                }),
                h === 0 && this.rowTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    rowSpan: i.length + (o.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0
              ]
            )),
            o.length !== 0 ? r(
              "tr",
              [
                o.map((g, h) => r("th", {
                  staticClass: ["pvtAxisLabel"],
                  attrs: {
                    key: `rowAttr${h}`
                  }
                }, g)),
                this.rowTotal ? r("th", { staticClass: ["pvtTotalLabel"] }, i.length === 0 ? this.localeStrings.totals : null) : i.length === 0 ? void 0 : r("th", { staticClass: ["pvtTotalLabel"] }, null)
              ]
            ) : void 0
          ]
        ),
        r(
          "tbody",
          [
            a.map((g, h) => {
              const d = e.getAggregator(g, []);
              return r(
                "tr",
                {
                  attrs: {
                    key: `rowKeyRow${h}`
                  }
                },
                [
                  g.map((m, S) => {
                    const D = this.spanSize(a, h, S);
                    return D === -1 ? null : r("th", {
                      staticClass: ["pvtRowLabel"],
                      attrs: {
                        key: `rowKeyLabel${h}-${S}`,
                        rowSpan: D,
                        colSpan: S === o.length - 1 && i.length !== 0 ? 2 : 1
                      }
                    }, m);
                  }),
                  s.map((m, S) => {
                    const D = e.getAggregator(g, m);
                    return r("td", {
                      staticClass: ["pvVal"],
                      style: u(g, m, D.value()),
                      attrs: {
                        key: `pvtVal${h}-${S}`
                      },
                      on: this.tableOptions.clickCallback ? {
                        click: p(D.value(), g, m)
                      } : {}
                    }, D.format(D.value()));
                  }),
                  this.rowTotal ? r("td", {
                    staticClass: ["pvtTotal"],
                    style: f(d.value()),
                    on: this.tableOptions.clickCallback ? {
                      click: p(d.value(), g, [])
                    } : {}
                  }, d.format(d.value())) : void 0
                ]
              );
            }),
            r(
              "tr",
              [
                this.colTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    colSpan: o.length + (i.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0,
                this.colTotal ? s.map((g, h) => {
                  const d = e.getAggregator([], g);
                  return r("td", {
                    staticClass: ["pvtTotal"],
                    style: c(d.value()),
                    attrs: {
                      key: `total${h}`
                    },
                    on: this.tableOptions.clickCallback ? {
                      click: p(d.value(), [], g)
                    } : {}
                  }, d.format(d.value()));
                }) : void 0,
                this.colTotal && this.rowTotal ? r("td", {
                  staticClass: ["pvtGrandTotal"],
                  on: this.tableOptions.clickCallback ? {
                    click: p(l.value(), [], [])
                  } : {}
                }, l.format(l.value())) : void 0
              ]
            )
          ]
        )
      ]);
    },
    renderError(r, e) {
      return this.renderError(r);
    }
  };
}
const Fn = {
  name: "tsv-export-renderers",
  mixins: [we],
  render(t) {
    const n = new Ot(this.$props), r = n.getRowKeys(), e = n.getColKeys();
    r.length === 0 && r.push([]), e.length === 0 && e.push([]);
    const i = n.props.rows.map((a) => a);
    e.length === 1 && e[0].length === 0 ? i.push(this.aggregatorName) : e.map((a) => i.push(a.join("-")));
    const o = r.map((a) => {
      const s = a.map((l) => l);
      return e.map((l) => {
        const u = n.getAggregator(a, l).value();
        s.push(u || "");
      }), s;
    });
    return o.unshift(i), t("textarea", {
      style: {
        width: "100%",
        height: `${window.innerHeight / 2}px`
      },
      attrs: {
        readOnly: !0
      },
      domProps: {
        value: o.map((a) => a.join("	")).join(`
`)
      }
    });
  },
  renderError(t, n) {
    return this.renderError(t);
  }
}, We = {
  Table: ie({ name: "vue-table" }),
  "Table Heatmap": ie({ heatmapMode: "full", name: "vue-table-heatmap" }),
  "Table Col Heatmap": ie({ heatmapMode: "col", name: "vue-table-col-heatmap" }),
  "Table Row Heatmap": ie({ heatmapMode: "row", name: "vue-table-col-heatmap" }),
  "Export Table TSV": Fn
}, Ke = {
  name: "vue-pivottable",
  mixins: [
    we
  ],
  computed: {
    rendererItems() {
      return this.renderers || Object.assign({}, We);
    }
  },
  methods: {
    createPivottable(t) {
      const n = this.$props;
      return t(this.rendererItems[this.rendererName], {
        props: Object.assign(
          n,
          { localeStrings: n.locales[n.locale].localeStrings }
        )
      });
    },
    createWrapperContainer(t) {
      return t("div", {
        style: {
          display: "block",
          width: "100%",
          "overflow-x": "auto",
          "max-width": this.tableMaxWidth ? `${this.tableMaxWidth}px` : void 0
        }
      }, [
        this.createPivottable(t)
      ]);
    }
  },
  render(t) {
    return this.createWrapperContainer(t);
  },
  renderError(t, n) {
    return this.renderError(t);
  }
}, Mn = {
  name: "draggable-attribute",
  props: {
    open: {
      type: Boolean,
      default: !1
    },
    sortable: {
      type: Boolean,
      default: !0
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    name: {
      type: String,
      required: !0
    },
    attrValues: {
      type: Object,
      required: !1
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorter: {
      type: Function,
      required: !0
    },
    localeStrings: {
      type: Object,
      default: function() {
        return {
          selectAll: "Select All",
          selectNone: "Select None",
          tooMany: "(too many to list)",
          filterResults: "Filter values",
          only: "only"
        };
      }
    },
    menuLimit: Number,
    zIndex: Number,
    async: Boolean,
    unused: Boolean
  },
  data() {
    return {
      filterText: "",
      attribute: "",
      values: [],
      filter: {}
    };
  },
  computed: {
    disabled() {
      return !this.sortable && !this.draggable;
    },
    sortonly() {
      return this.sortable && !this.draggable;
    }
  },
  methods: {
    setValuesInFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] = !0, e), {});
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    addValuesToFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] = !0, e), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    removeValuesFromFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] && delete e[i], e), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    moveFilterBoxToTop(t) {
      this.$emit("moveToTop:filterbox", { attribute: t });
    },
    toggleValue(t) {
      t in this.valueFilter ? this.removeValuesFromFilter(this.name, [t]) : this.addValuesToFilter(this.name, [t]);
    },
    matchesFilter(t) {
      return t.toLowerCase().trim().includes(this.filterText.toLowerCase().trim());
    },
    selectOnly(t, n) {
      t.stopPropagation(), this.value = n, this.setValuesInFilter(this.name, Object.keys(this.attrValues).filter((r) => r !== n));
    },
    getFilterBox(t) {
      const n = Object.keys(this.attrValues).length < this.menuLimit, e = Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)).sort(this.sorter);
      return t(
        "div",
        {
          staticClass: ["pvtFilterBox"],
          style: {
            display: "block",
            cursor: "initial",
            zIndex: this.zIndex
          },
          on: {
            click: (i) => {
              i.stopPropagation(), this.moveFilterBoxToTop(this.name);
            }
          }
        },
        [
          t(
            "div",
            {
              staticClass: "pvtSearchContainer"
            },
            [
              n || t("p", this.localeStrings.tooMany),
              n && t("input", {
                staticClass: ["pvtSearch"],
                attrs: {
                  type: "text",
                  placeholder: this.localeStrings.filterResults
                },
                domProps: {
                  value: this.filterText
                },
                on: {
                  input: (i) => {
                    this.filterText = i.target.value, this.$emit("input", i.target.value);
                  }
                }
              }),
              t("a", {
                staticClass: ["pvtFilterTextClear"],
                on: {
                  click: () => {
                    this.filterText = "";
                  }
                }
              }),
              t("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.removeValuesFromFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectAll),
              t("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.addValuesToFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectNone)
            ]
          ),
          n && t(
            "div",
            {
              staticClass: ["pvtCheckContainer"]
            },
            e.map((i) => {
              const o = !(i in this.valueFilter);
              return t(
                "p",
                {
                  class: {
                    selected: o
                  },
                  attrs: {
                    key: i
                  },
                  on: {
                    click: () => this.toggleValue(i)
                  }
                },
                [
                  t("input", {
                    attrs: {
                      type: "checkbox"
                    },
                    domProps: {
                      checked: o
                    }
                  }),
                  i,
                  t("a", {
                    staticClass: ["pvtOnly"],
                    on: {
                      click: (a) => this.selectOnly(a, i)
                    }
                  }, this.localeStrings.only),
                  t("a", {
                    staticClass: ["pvtOnlySpacer"]
                  })
                ]
              );
            })
          )
        ]
      );
    },
    toggleFilterBox(t) {
      if (t.stopPropagation(), !this.attrValues) {
        this.$listeners["no:filterbox"] && this.$emit("no:filterbox");
        return;
      }
      this.openFilterBox(this.name, !this.open), this.moveFilterBoxToTop(this.name);
    },
    openFilterBox(t, n) {
      this.$emit("open:filterbox", { attribute: t, open: n });
    }
  },
  render(t) {
    const n = Object.keys(this.valueFilter).length !== 0 ? "pvtFilteredAttribute" : "", r = this.$scopedSlots.pvtAttr;
    return t(
      "li",
      {
        attrs: {
          "data-id": this.disabled ? void 0 : this.name
        }
      },
      [
        t(
          "span",
          {
            staticClass: ["pvtAttr " + n],
            class: {
              sortonly: this.sortonly,
              disabled: this.disabled
            }
          },
          [
            r ? r({ name: this.name }) : this.name,
            !this.disabled && (!this.async || !this.unused && this.async) ? t("span", {
              staticClass: ["pvtTriangle"],
              on: {
                click: this.toggleFilterBox.bind(this)
              }
            }, "  \u25BE") : void 0,
            this.open ? this.getFilterBox(t) : void 0
          ]
        )
      ]
    );
  }
}, Ce = {
  props: ["values", "value"],
  model: {
    prop: "value",
    event: "input"
  },
  created() {
    this.$emit("input", this.value || this.values[0]);
  },
  methods: {
    handleChange(t) {
      this.$emit("input", t.target.value);
    }
  },
  render(t) {
    return t(
      "select",
      {
        staticClass: ["pvtDropdown"],
        domProps: {
          value: this.value
        },
        on: {
          change: this.handleChange
        }
      },
      [
        this.values.map((n) => {
          const r = n;
          return t("option", {
            attrs: {
              value: n,
              selected: n === this.value ? "selected" : void 0
            }
          }, r);
        })
      ]
    );
  }
};
var Nn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Pn(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function jn(t) {
  var n = t.default;
  if (typeof n == "function") {
    var r = function() {
      return n.apply(this, arguments);
    };
    r.prototype = n.prototype;
  } else
    r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(t).forEach(function(e) {
    var i = Object.getOwnPropertyDescriptor(t, e);
    Object.defineProperty(r, e, i.get ? i : {
      enumerable: !0,
      get: function() {
        return t[e];
      }
    });
  }), r;
}
var fn = { exports: {} };
/**!
 * Sortable 1.10.2
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function fe(t) {
  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? fe = function(n) {
    return typeof n;
  } : fe = function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, fe(t);
}
function Rn(t, n, r) {
  return n in t ? Object.defineProperty(t, n, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[n] = r, t;
}
function bt() {
  return bt = Object.assign || function(t) {
    for (var n = 1; n < arguments.length; n++) {
      var r = arguments[n];
      for (var e in r)
        Object.prototype.hasOwnProperty.call(r, e) && (t[e] = r[e]);
    }
    return t;
  }, bt.apply(this, arguments);
}
function Mt(t) {
  for (var n = 1; n < arguments.length; n++) {
    var r = arguments[n] != null ? arguments[n] : {}, e = Object.keys(r);
    typeof Object.getOwnPropertySymbols == "function" && (e = e.concat(Object.getOwnPropertySymbols(r).filter(function(i) {
      return Object.getOwnPropertyDescriptor(r, i).enumerable;
    }))), e.forEach(function(i) {
      Rn(t, i, r[i]);
    });
  }
  return t;
}
function Ln(t, n) {
  if (t == null)
    return {};
  var r = {}, e = Object.keys(t), i, o;
  for (o = 0; o < e.length; o++)
    i = e[o], !(n.indexOf(i) >= 0) && (r[i] = t[i]);
  return r;
}
function $n(t, n) {
  if (t == null)
    return {};
  var r = Ln(t, n), e, i;
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    for (i = 0; i < o.length; i++)
      e = o[i], !(n.indexOf(e) >= 0) && (!Object.prototype.propertyIsEnumerable.call(t, e) || (r[e] = t[e]));
  }
  return r;
}
function Bn(t) {
  return Vn(t) || Un(t) || zn();
}
function Vn(t) {
  if (Array.isArray(t)) {
    for (var n = 0, r = new Array(t.length); n < t.length; n++)
      r[n] = t[n];
    return r;
  }
}
function Un(t) {
  if (Symbol.iterator in Object(t) || Object.prototype.toString.call(t) === "[object Arguments]")
    return Array.from(t);
}
function zn() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
var Gn = "1.10.2";
function Et(t) {
  if (typeof window < "u" && window.navigator)
    return !!/* @__PURE__ */ navigator.userAgent.match(t);
}
var Ct = Et(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), ee = Et(/Edge/i), qe = Et(/firefox/i), Ve = Et(/safari/i) && !Et(/chrome/i) && !Et(/android/i), dn = Et(/iP(ad|od|hone)/i), Hn = Et(/chrome/i) && Et(/android/i), hn = {
  capture: !1,
  passive: !1
};
function $(t, n, r) {
  t.addEventListener(n, r, !Ct && hn);
}
function R(t, n, r) {
  t.removeEventListener(n, r, !Ct && hn);
}
function ve(t, n) {
  if (!!n) {
    if (n[0] === ">" && (n = n.substring(1)), t)
      try {
        if (t.matches)
          return t.matches(n);
        if (t.msMatchesSelector)
          return t.msMatchesSelector(n);
        if (t.webkitMatchesSelector)
          return t.webkitMatchesSelector(n);
      } catch {
        return !1;
      }
    return !1;
  }
}
function Wn(t) {
  return t.host && t !== document && t.host.nodeType ? t.host : t.parentNode;
}
function St(t, n, r, e) {
  if (t) {
    r = r || document;
    do {
      if (n != null && (n[0] === ">" ? t.parentNode === r && ve(t, n) : ve(t, n)) || e && t === r)
        return t;
      if (t === r)
        break;
    } while (t = Wn(t));
  }
  return null;
}
var _e = /\s+/g;
function k(t, n, r) {
  if (t && n)
    if (t.classList)
      t.classList[r ? "add" : "remove"](n);
    else {
      var e = (" " + t.className + " ").replace(_e, " ").replace(" " + n + " ", " ");
      t.className = (e + (r ? " " + n : "")).replace(_e, " ");
    }
}
function w(t, n, r) {
  var e = t && t.style;
  if (e) {
    if (r === void 0)
      return document.defaultView && document.defaultView.getComputedStyle ? r = document.defaultView.getComputedStyle(t, "") : t.currentStyle && (r = t.currentStyle), n === void 0 ? r : r[n];
    !(n in e) && n.indexOf("webkit") === -1 && (n = "-webkit-" + n), e[n] = r + (typeof r == "string" ? "" : "px");
  }
}
function Lt(t, n) {
  var r = "";
  if (typeof t == "string")
    r = t;
  else
    do {
      var e = w(t, "transform");
      e && e !== "none" && (r = e + " " + r);
    } while (!n && (t = t.parentNode));
  var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return i && new i(r);
}
function pn(t, n, r) {
  if (t) {
    var e = t.getElementsByTagName(n), i = 0, o = e.length;
    if (r)
      for (; i < o; i++)
        r(e[i], i);
    return e;
  }
  return [];
}
function wt() {
  var t = document.scrollingElement;
  return t || document.documentElement;
}
function _(t, n, r, e, i) {
  if (!(!t.getBoundingClientRect && t !== window)) {
    var o, a, s, l, u, c, f;
    if (t !== window && t !== wt() ? (o = t.getBoundingClientRect(), a = o.top, s = o.left, l = o.bottom, u = o.right, c = o.height, f = o.width) : (a = 0, s = 0, l = window.innerHeight, u = window.innerWidth, c = window.innerHeight, f = window.innerWidth), (n || r) && t !== window && (i = i || t.parentNode, !Ct))
      do
        if (i && i.getBoundingClientRect && (w(i, "transform") !== "none" || r && w(i, "position") !== "static")) {
          var p = i.getBoundingClientRect();
          a -= p.top + parseInt(w(i, "border-top-width")), s -= p.left + parseInt(w(i, "border-left-width")), l = a + o.height, u = s + o.width;
          break;
        }
      while (i = i.parentNode);
    if (e && t !== window) {
      var g = Lt(i || t), h = g && g.a, d = g && g.d;
      g && (a /= d, s /= h, f /= h, c /= d, l = a + c, u = s + f);
    }
    return {
      top: a,
      left: s,
      bottom: l,
      right: u,
      width: f,
      height: c
    };
  }
}
function tn(t, n, r) {
  for (var e = It(t, !0), i = _(t)[n]; e; ) {
    var o = _(e)[r], a = void 0;
    if (r === "top" || r === "left" ? a = i >= o : a = i <= o, !a)
      return e;
    if (e === wt())
      break;
    e = It(e, !1);
  }
  return !1;
}
function me(t, n, r) {
  for (var e = 0, i = 0, o = t.children; i < o.length; ) {
    if (o[i].style.display !== "none" && o[i] !== T.ghost && o[i] !== T.dragged && St(o[i], r.draggable, t, !1)) {
      if (e === n)
        return o[i];
      e++;
    }
    i++;
  }
  return null;
}
function Xe(t, n) {
  for (var r = t.lastElementChild; r && (r === T.ghost || w(r, "display") === "none" || n && !ve(r, n)); )
    r = r.previousElementSibling;
  return r || null;
}
function q(t, n) {
  var r = 0;
  if (!t || !t.parentNode)
    return -1;
  for (; t = t.previousElementSibling; )
    t.nodeName.toUpperCase() !== "TEMPLATE" && t !== T.clone && (!n || ve(t, n)) && r++;
  return r;
}
function en(t) {
  var n = 0, r = 0, e = wt();
  if (t)
    do {
      var i = Lt(t), o = i.a, a = i.d;
      n += t.scrollLeft * o, r += t.scrollTop * a;
    } while (t !== e && (t = t.parentNode));
  return [n, r];
}
function Kn(t, n) {
  for (var r in t)
    if (!!t.hasOwnProperty(r)) {
      for (var e in n)
        if (n.hasOwnProperty(e) && n[e] === t[r][e])
          return Number(r);
    }
  return -1;
}
function It(t, n) {
  if (!t || !t.getBoundingClientRect)
    return wt();
  var r = t, e = !1;
  do
    if (r.clientWidth < r.scrollWidth || r.clientHeight < r.scrollHeight) {
      var i = w(r);
      if (r.clientWidth < r.scrollWidth && (i.overflowX == "auto" || i.overflowX == "scroll") || r.clientHeight < r.scrollHeight && (i.overflowY == "auto" || i.overflowY == "scroll")) {
        if (!r.getBoundingClientRect || r === document.body)
          return wt();
        if (e || n)
          return r;
        e = !0;
      }
    }
  while (r = r.parentNode);
  return wt();
}
function Xn(t, n) {
  if (t && n)
    for (var r in n)
      n.hasOwnProperty(r) && (t[r] = n[r]);
  return t;
}
function Te(t, n) {
  return Math.round(t.top) === Math.round(n.top) && Math.round(t.left) === Math.round(n.left) && Math.round(t.height) === Math.round(n.height) && Math.round(t.width) === Math.round(n.width);
}
var Jt;
function gn(t, n) {
  return function() {
    if (!Jt) {
      var r = arguments, e = this;
      r.length === 1 ? t.call(e, r[0]) : t.apply(e, r), Jt = setTimeout(function() {
        Jt = void 0;
      }, n);
    }
  };
}
function Yn() {
  clearTimeout(Jt), Jt = void 0;
}
function vn(t, n, r) {
  t.scrollLeft += n, t.scrollTop += r;
}
function Ye(t) {
  var n = window.Polymer, r = window.jQuery || window.Zepto;
  return n && n.dom ? n.dom(t).cloneNode(!0) : r ? r(t).clone(!0)[0] : t.cloneNode(!0);
}
function nn(t, n) {
  w(t, "position", "absolute"), w(t, "top", n.top), w(t, "left", n.left), w(t, "width", n.width), w(t, "height", n.height);
}
function Ae(t) {
  w(t, "position", ""), w(t, "top", ""), w(t, "left", ""), w(t, "width", ""), w(t, "height", "");
}
var ut = "Sortable" + new Date().getTime();
function kn() {
  var t = [], n;
  return {
    captureAnimationState: function() {
      if (t = [], !!this.options.animation) {
        var e = [].slice.call(this.el.children);
        e.forEach(function(i) {
          if (!(w(i, "display") === "none" || i === T.ghost)) {
            t.push({
              target: i,
              rect: _(i)
            });
            var o = Mt({}, t[t.length - 1].rect);
            if (i.thisAnimationDuration) {
              var a = Lt(i, !0);
              a && (o.top -= a.f, o.left -= a.e);
            }
            i.fromRect = o;
          }
        });
      }
    },
    addAnimationState: function(e) {
      t.push(e);
    },
    removeAnimationState: function(e) {
      t.splice(Kn(t, {
        target: e
      }), 1);
    },
    animateAll: function(e) {
      var i = this;
      if (!this.options.animation) {
        clearTimeout(n), typeof e == "function" && e();
        return;
      }
      var o = !1, a = 0;
      t.forEach(function(s) {
        var l = 0, u = s.target, c = u.fromRect, f = _(u), p = u.prevFromRect, g = u.prevToRect, h = s.rect, d = Lt(u, !0);
        d && (f.top -= d.f, f.left -= d.e), u.toRect = f, u.thisAnimationDuration && Te(p, f) && !Te(c, f) && (h.top - f.top) / (h.left - f.left) === (c.top - f.top) / (c.left - f.left) && (l = Jn(h, p, g, i.options)), Te(f, c) || (u.prevFromRect = c, u.prevToRect = f, l || (l = i.options.animation), i.animate(u, h, f, l)), l && (o = !0, a = Math.max(a, l), clearTimeout(u.animationResetTimer), u.animationResetTimer = setTimeout(function() {
          u.animationTime = 0, u.prevFromRect = null, u.fromRect = null, u.prevToRect = null, u.thisAnimationDuration = null;
        }, l), u.thisAnimationDuration = l);
      }), clearTimeout(n), o ? n = setTimeout(function() {
        typeof e == "function" && e();
      }, a) : typeof e == "function" && e(), t = [];
    },
    animate: function(e, i, o, a) {
      if (a) {
        w(e, "transition", ""), w(e, "transform", "");
        var s = Lt(this.el), l = s && s.a, u = s && s.d, c = (i.left - o.left) / (l || 1), f = (i.top - o.top) / (u || 1);
        e.animatingX = !!c, e.animatingY = !!f, w(e, "transform", "translate3d(" + c + "px," + f + "px,0)"), Zn(e), w(e, "transition", "transform " + a + "ms" + (this.options.easing ? " " + this.options.easing : "")), w(e, "transform", "translate3d(0,0,0)"), typeof e.animated == "number" && clearTimeout(e.animated), e.animated = setTimeout(function() {
          w(e, "transition", ""), w(e, "transform", ""), e.animated = !1, e.animatingX = !1, e.animatingY = !1;
        }, a);
      }
    }
  };
}
function Zn(t) {
  return t.offsetWidth;
}
function Jn(t, n, r, e) {
  return Math.sqrt(Math.pow(n.top - t.top, 2) + Math.pow(n.left - t.left, 2)) / Math.sqrt(Math.pow(n.top - r.top, 2) + Math.pow(n.left - r.left, 2)) * e.animation;
}
var Gt = [], Ie = {
  initializeByDefault: !0
}, ne = {
  mount: function(n) {
    for (var r in Ie)
      Ie.hasOwnProperty(r) && !(r in n) && (n[r] = Ie[r]);
    Gt.push(n);
  },
  pluginEvent: function(n, r, e) {
    var i = this;
    this.eventCanceled = !1, e.cancel = function() {
      i.eventCanceled = !0;
    };
    var o = n + "Global";
    Gt.forEach(function(a) {
      !r[a.pluginName] || (r[a.pluginName][o] && r[a.pluginName][o](Mt({
        sortable: r
      }, e)), r.options[a.pluginName] && r[a.pluginName][n] && r[a.pluginName][n](Mt({
        sortable: r
      }, e)));
    });
  },
  initializePlugins: function(n, r, e, i) {
    Gt.forEach(function(s) {
      var l = s.pluginName;
      if (!(!n.options[l] && !s.initializeByDefault)) {
        var u = new s(n, r, n.options);
        u.sortable = n, u.options = n.options, n[l] = u, bt(e, u.defaults);
      }
    });
    for (var o in n.options)
      if (!!n.options.hasOwnProperty(o)) {
        var a = this.modifyOption(n, o, n.options[o]);
        typeof a < "u" && (n.options[o] = a);
      }
  },
  getEventProperties: function(n, r) {
    var e = {};
    return Gt.forEach(function(i) {
      typeof i.eventProperties == "function" && bt(e, i.eventProperties.call(r[i.pluginName], n));
    }), e;
  },
  modifyOption: function(n, r, e) {
    var i;
    return Gt.forEach(function(o) {
      !n[o.pluginName] || o.optionListeners && typeof o.optionListeners[r] == "function" && (i = o.optionListeners[r].call(n[o.pluginName], e));
    }), i;
  }
};
function Xt(t) {
  var n = t.sortable, r = t.rootEl, e = t.name, i = t.targetEl, o = t.cloneEl, a = t.toEl, s = t.fromEl, l = t.oldIndex, u = t.newIndex, c = t.oldDraggableIndex, f = t.newDraggableIndex, p = t.originalEvent, g = t.putSortable, h = t.extraEventProperties;
  if (n = n || r && r[ut], !!n) {
    var d, m = n.options, S = "on" + e.charAt(0).toUpperCase() + e.substr(1);
    window.CustomEvent && !Ct && !ee ? d = new CustomEvent(e, {
      bubbles: !0,
      cancelable: !0
    }) : (d = document.createEvent("Event"), d.initEvent(e, !0, !0)), d.to = a || r, d.from = s || r, d.item = i || r, d.clone = o, d.oldIndex = l, d.newIndex = u, d.oldDraggableIndex = c, d.newDraggableIndex = f, d.originalEvent = p, d.pullMode = g ? g.lastPutMode : void 0;
    var D = Mt({}, h, ne.getEventProperties(e, n));
    for (var O in D)
      d[O] = D[O];
    r && r.dispatchEvent(d), m[S] && m[S].call(n, d);
  }
}
var ft = function(n, r) {
  var e = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = e.evt, o = $n(e, ["evt"]);
  ne.pluginEvent.bind(T)(n, r, Mt({
    dragEl: x,
    parentEl: rt,
    ghostEl: N,
    rootEl: Y,
    nextEl: jt,
    lastDownEl: de,
    cloneEl: Q,
    cloneHidden: At,
    dragStarted: Yt,
    putSortable: at,
    activeSortable: T.active,
    originalEvent: i,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: gt,
    newDraggableIndex: Tt,
    hideGhostForTarget: xn,
    unhideGhostForTarget: Sn,
    cloneNowHidden: function() {
      At = !0;
    },
    cloneNowShown: function() {
      At = !1;
    },
    dispatchSortableEvent: function(s) {
      ct({
        sortable: r,
        name: s,
        originalEvent: i
      });
    }
  }, o));
};
function ct(t) {
  Xt(Mt({
    putSortable: at,
    cloneEl: Q,
    targetEl: x,
    rootEl: Y,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: gt,
    newDraggableIndex: Tt
  }, t));
}
var x, rt, N, Y, jt, de, Q, At, Ut, gt, Qt, Tt, ae, at, Vt = !1, be = !1, ye = [], Nt, yt, Fe, Me, rn, on, Yt, $t, qt, _t = !1, se = !1, he, lt, Ne = [], Ue = !1, xe = [], Ee = typeof document < "u", le = dn, an = ee || Ct ? "cssFloat" : "float", Qn = Ee && !Hn && !dn && "draggable" in document.createElement("div"), mn = function() {
  if (!!Ee) {
    if (Ct)
      return !1;
    var t = document.createElement("x");
    return t.style.cssText = "pointer-events:auto", t.style.pointerEvents === "auto";
  }
}(), bn = function(n, r) {
  var e = w(n), i = parseInt(e.width) - parseInt(e.paddingLeft) - parseInt(e.paddingRight) - parseInt(e.borderLeftWidth) - parseInt(e.borderRightWidth), o = me(n, 0, r), a = me(n, 1, r), s = o && w(o), l = a && w(a), u = s && parseInt(s.marginLeft) + parseInt(s.marginRight) + _(o).width, c = l && parseInt(l.marginLeft) + parseInt(l.marginRight) + _(a).width;
  if (e.display === "flex")
    return e.flexDirection === "column" || e.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  if (e.display === "grid")
    return e.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  if (o && s.float && s.float !== "none") {
    var f = s.float === "left" ? "left" : "right";
    return a && (l.clear === "both" || l.clear === f) ? "vertical" : "horizontal";
  }
  return o && (s.display === "block" || s.display === "flex" || s.display === "table" || s.display === "grid" || u >= i && e[an] === "none" || a && e[an] === "none" && u + c > i) ? "vertical" : "horizontal";
}, qn = function(n, r, e) {
  var i = e ? n.left : n.top, o = e ? n.right : n.bottom, a = e ? n.width : n.height, s = e ? r.left : r.top, l = e ? r.right : r.bottom, u = e ? r.width : r.height;
  return i === s || o === l || i + a / 2 === s + u / 2;
}, _n = function(n, r) {
  var e;
  return ye.some(function(i) {
    if (!Xe(i)) {
      var o = _(i), a = i[ut].options.emptyInsertThreshold, s = n >= o.left - a && n <= o.right + a, l = r >= o.top - a && r <= o.bottom + a;
      if (a && s && l)
        return e = i;
    }
  }), e;
}, yn = function(n) {
  function r(o, a) {
    return function(s, l, u, c) {
      var f = s.options.group.name && l.options.group.name && s.options.group.name === l.options.group.name;
      if (o == null && (a || f))
        return !0;
      if (o == null || o === !1)
        return !1;
      if (a && o === "clone")
        return o;
      if (typeof o == "function")
        return r(o(s, l, u, c), a)(s, l, u, c);
      var p = (a ? s : l).options.group.name;
      return o === !0 || typeof o == "string" && o === p || o.join && o.indexOf(p) > -1;
    };
  }
  var e = {}, i = n.group;
  (!i || fe(i) != "object") && (i = {
    name: i
  }), e.name = i.name, e.checkPull = r(i.pull, !0), e.checkPut = r(i.put), e.revertClone = i.revertClone, n.group = e;
}, xn = function() {
  !mn && N && w(N, "display", "none");
}, Sn = function() {
  !mn && N && w(N, "display", "");
};
Ee && document.addEventListener("click", function(t) {
  if (be)
    return t.preventDefault(), t.stopPropagation && t.stopPropagation(), t.stopImmediatePropagation && t.stopImmediatePropagation(), be = !1, !1;
}, !0);
var Pt = function(n) {
  if (x) {
    n = n.touches ? n.touches[0] : n;
    var r = _n(n.clientX, n.clientY);
    if (r) {
      var e = {};
      for (var i in n)
        n.hasOwnProperty(i) && (e[i] = n[i]);
      e.target = e.rootEl = r, e.preventDefault = void 0, e.stopPropagation = void 0, r[ut]._onDragOver(e);
    }
  }
}, tr = function(n) {
  x && x.parentNode[ut]._isOutsideThisEl(n.target);
};
function T(t, n) {
  if (!(t && t.nodeType && t.nodeType === 1))
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));
  this.el = t, this.options = n = bt({}, n), t[ut] = this;
  var r = {
    group: null,
    sort: !0,
    disabled: !1,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(t.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    invertSwap: !1,
    invertedSwapThreshold: null,
    removeCloneOnHide: !0,
    direction: function() {
      return bn(t, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: !0,
    animation: 0,
    easing: null,
    setData: function(a, s) {
      a.setData("Text", s.textContent);
    },
    dropBubble: !1,
    dragoverBubble: !1,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: !1,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: !1,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: !1,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: T.supportPointer !== !1 && "PointerEvent" in window,
    emptyInsertThreshold: 5
  };
  ne.initializePlugins(this, t, r);
  for (var e in r)
    !(e in n) && (n[e] = r[e]);
  yn(n);
  for (var i in this)
    i.charAt(0) === "_" && typeof this[i] == "function" && (this[i] = this[i].bind(this));
  this.nativeDraggable = n.forceFallback ? !1 : Qn, this.nativeDraggable && (this.options.touchStartThreshold = 1), n.supportPointer ? $(t, "pointerdown", this._onTapStart) : ($(t, "mousedown", this._onTapStart), $(t, "touchstart", this._onTapStart)), this.nativeDraggable && ($(t, "dragover", this), $(t, "dragenter", this)), ye.push(this.el), n.store && n.store.get && this.sort(n.store.get(this) || []), bt(this, kn());
}
T.prototype = {
  constructor: T,
  _isOutsideThisEl: function(n) {
    !this.el.contains(n) && n !== this.el && ($t = null);
  },
  _getDirection: function(n, r) {
    return typeof this.options.direction == "function" ? this.options.direction.call(this, n, r, x) : this.options.direction;
  },
  _onTapStart: function(n) {
    if (!!n.cancelable) {
      var r = this, e = this.el, i = this.options, o = i.preventOnFilter, a = n.type, s = n.touches && n.touches[0] || n.pointerType && n.pointerType === "touch" && n, l = (s || n).target, u = n.target.shadowRoot && (n.path && n.path[0] || n.composedPath && n.composedPath()[0]) || l, c = i.filter;
      if (sr(e), !x && !(/mousedown|pointerdown/.test(a) && n.button !== 0 || i.disabled) && !u.isContentEditable && (l = St(l, i.draggable, e, !1), !(l && l.animated) && de !== l)) {
        if (Ut = q(l), Qt = q(l, i.draggable), typeof c == "function") {
          if (c.call(this, n, l, this)) {
            ct({
              sortable: r,
              rootEl: u,
              name: "filter",
              targetEl: l,
              toEl: e,
              fromEl: e
            }), ft("filter", r, {
              evt: n
            }), o && n.cancelable && n.preventDefault();
            return;
          }
        } else if (c && (c = c.split(",").some(function(f) {
          if (f = St(u, f.trim(), e, !1), f)
            return ct({
              sortable: r,
              rootEl: f,
              name: "filter",
              targetEl: l,
              fromEl: e,
              toEl: e
            }), ft("filter", r, {
              evt: n
            }), !0;
        }), c)) {
          o && n.cancelable && n.preventDefault();
          return;
        }
        i.handle && !St(u, i.handle, e, !1) || this._prepareDragStart(n, s, l);
      }
    }
  },
  _prepareDragStart: function(n, r, e) {
    var i = this, o = i.el, a = i.options, s = o.ownerDocument, l;
    if (e && !x && e.parentNode === o) {
      var u = _(e);
      if (Y = o, x = e, rt = x.parentNode, jt = x.nextSibling, de = e, ae = a.group, T.dragged = x, Nt = {
        target: x,
        clientX: (r || n).clientX,
        clientY: (r || n).clientY
      }, rn = Nt.clientX - u.left, on = Nt.clientY - u.top, this._lastX = (r || n).clientX, this._lastY = (r || n).clientY, x.style["will-change"] = "all", l = function() {
        if (ft("delayEnded", i, {
          evt: n
        }), T.eventCanceled) {
          i._onDrop();
          return;
        }
        i._disableDelayedDragEvents(), !qe && i.nativeDraggable && (x.draggable = !0), i._triggerDragStart(n, r), ct({
          sortable: i,
          name: "choose",
          originalEvent: n
        }), k(x, a.chosenClass, !0);
      }, a.ignore.split(",").forEach(function(c) {
        pn(x, c.trim(), je);
      }), $(s, "dragover", Pt), $(s, "mousemove", Pt), $(s, "touchmove", Pt), $(s, "mouseup", i._onDrop), $(s, "touchend", i._onDrop), $(s, "touchcancel", i._onDrop), qe && this.nativeDraggable && (this.options.touchStartThreshold = 4, x.draggable = !0), ft("delayStart", this, {
        evt: n
      }), a.delay && (!a.delayOnTouchOnly || r) && (!this.nativeDraggable || !(ee || Ct))) {
        if (T.eventCanceled) {
          this._onDrop();
          return;
        }
        $(s, "mouseup", i._disableDelayedDrag), $(s, "touchend", i._disableDelayedDrag), $(s, "touchcancel", i._disableDelayedDrag), $(s, "mousemove", i._delayedDragTouchMoveHandler), $(s, "touchmove", i._delayedDragTouchMoveHandler), a.supportPointer && $(s, "pointermove", i._delayedDragTouchMoveHandler), i._dragStartTimer = setTimeout(l, a.delay);
      } else
        l();
    }
  },
  _delayedDragTouchMoveHandler: function(n) {
    var r = n.touches ? n.touches[0] : n;
    Math.max(Math.abs(r.clientX - this._lastX), Math.abs(r.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
  },
  _disableDelayedDrag: function() {
    x && je(x), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._disableDelayedDrag), R(n, "touchend", this._disableDelayedDrag), R(n, "touchcancel", this._disableDelayedDrag), R(n, "mousemove", this._delayedDragTouchMoveHandler), R(n, "touchmove", this._delayedDragTouchMoveHandler), R(n, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function(n, r) {
    r = r || n.pointerType == "touch" && n, !this.nativeDraggable || r ? this.options.supportPointer ? $(document, "pointermove", this._onTouchMove) : r ? $(document, "touchmove", this._onTouchMove) : $(document, "mousemove", this._onTouchMove) : ($(x, "dragend", this), $(Y, "dragstart", this._onDragStart));
    try {
      document.selection ? pe(function() {
        document.selection.empty();
      }) : window.getSelection().removeAllRanges();
    } catch {
    }
  },
  _dragStarted: function(n, r) {
    if (Vt = !1, Y && x) {
      ft("dragStarted", this, {
        evt: r
      }), this.nativeDraggable && $(document, "dragover", tr);
      var e = this.options;
      !n && k(x, e.dragClass, !1), k(x, e.ghostClass, !0), T.active = this, n && this._appendGhost(), ct({
        sortable: this,
        name: "start",
        originalEvent: r
      });
    } else
      this._nulling();
  },
  _emulateDragOver: function() {
    if (yt) {
      this._lastX = yt.clientX, this._lastY = yt.clientY, xn();
      for (var n = document.elementFromPoint(yt.clientX, yt.clientY), r = n; n && n.shadowRoot && (n = n.shadowRoot.elementFromPoint(yt.clientX, yt.clientY), n !== r); )
        r = n;
      if (x.parentNode[ut]._isOutsideThisEl(n), r)
        do {
          if (r[ut]) {
            var e = void 0;
            if (e = r[ut]._onDragOver({
              clientX: yt.clientX,
              clientY: yt.clientY,
              target: n,
              rootEl: r
            }), e && !this.options.dragoverBubble)
              break;
          }
          n = r;
        } while (r = r.parentNode);
      Sn();
    }
  },
  _onTouchMove: function(n) {
    if (Nt) {
      var r = this.options, e = r.fallbackTolerance, i = r.fallbackOffset, o = n.touches ? n.touches[0] : n, a = N && Lt(N, !0), s = N && a && a.a, l = N && a && a.d, u = le && lt && en(lt), c = (o.clientX - Nt.clientX + i.x) / (s || 1) + (u ? u[0] - Ne[0] : 0) / (s || 1), f = (o.clientY - Nt.clientY + i.y) / (l || 1) + (u ? u[1] - Ne[1] : 0) / (l || 1);
      if (!T.active && !Vt) {
        if (e && Math.max(Math.abs(o.clientX - this._lastX), Math.abs(o.clientY - this._lastY)) < e)
          return;
        this._onDragStart(n, !0);
      }
      if (N) {
        a ? (a.e += c - (Fe || 0), a.f += f - (Me || 0)) : a = {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: c,
          f
        };
        var p = "matrix(".concat(a.a, ",").concat(a.b, ",").concat(a.c, ",").concat(a.d, ",").concat(a.e, ",").concat(a.f, ")");
        w(N, "webkitTransform", p), w(N, "mozTransform", p), w(N, "msTransform", p), w(N, "transform", p), Fe = c, Me = f, yt = o;
      }
      n.cancelable && n.preventDefault();
    }
  },
  _appendGhost: function() {
    if (!N) {
      var n = this.options.fallbackOnBody ? document.body : Y, r = _(x, !0, le, !0, n), e = this.options;
      if (le) {
        for (lt = n; w(lt, "position") === "static" && w(lt, "transform") === "none" && lt !== document; )
          lt = lt.parentNode;
        lt !== document.body && lt !== document.documentElement ? (lt === document && (lt = wt()), r.top += lt.scrollTop, r.left += lt.scrollLeft) : lt = wt(), Ne = en(lt);
      }
      N = x.cloneNode(!0), k(N, e.ghostClass, !1), k(N, e.fallbackClass, !0), k(N, e.dragClass, !0), w(N, "transition", ""), w(N, "transform", ""), w(N, "box-sizing", "border-box"), w(N, "margin", 0), w(N, "top", r.top), w(N, "left", r.left), w(N, "width", r.width), w(N, "height", r.height), w(N, "opacity", "0.8"), w(N, "position", le ? "absolute" : "fixed"), w(N, "zIndex", "100000"), w(N, "pointerEvents", "none"), T.ghost = N, n.appendChild(N), w(N, "transform-origin", rn / parseInt(N.style.width) * 100 + "% " + on / parseInt(N.style.height) * 100 + "%");
    }
  },
  _onDragStart: function(n, r) {
    var e = this, i = n.dataTransfer, o = e.options;
    if (ft("dragStart", this, {
      evt: n
    }), T.eventCanceled) {
      this._onDrop();
      return;
    }
    ft("setupClone", this), T.eventCanceled || (Q = Ye(x), Q.draggable = !1, Q.style["will-change"] = "", this._hideClone(), k(Q, this.options.chosenClass, !1), T.clone = Q), e.cloneId = pe(function() {
      ft("clone", e), !T.eventCanceled && (e.options.removeCloneOnHide || Y.insertBefore(Q, x), e._hideClone(), ct({
        sortable: e,
        name: "clone"
      }));
    }), !r && k(x, o.dragClass, !0), r ? (be = !0, e._loopId = setInterval(e._emulateDragOver, 50)) : (R(document, "mouseup", e._onDrop), R(document, "touchend", e._onDrop), R(document, "touchcancel", e._onDrop), i && (i.effectAllowed = "move", o.setData && o.setData.call(e, i, x)), $(document, "drop", e), w(x, "transform", "translateZ(0)")), Vt = !0, e._dragStartId = pe(e._dragStarted.bind(e, r, n)), $(document, "selectstart", e), Yt = !0, Ve && w(document.body, "user-select", "none");
  },
  _onDragOver: function(n) {
    var r = this.el, e = n.target, i, o, a, s = this.options, l = s.group, u = T.active, c = ae === l, f = s.sort, p = at || u, g, h = this, d = !1;
    if (Ue)
      return;
    function m(X, dt) {
      ft(X, h, Mt({
        evt: n,
        isOwner: c,
        axis: g ? "vertical" : "horizontal",
        revert: a,
        dragRect: i,
        targetRect: o,
        canSort: f,
        fromSortable: p,
        target: e,
        completed: D,
        onMove: function(it, y) {
          return Pe(Y, r, x, i, it, _(it), n, y);
        },
        changed: O
      }, dt));
    }
    function S() {
      m("dragOverAnimationCapture"), h.captureAnimationState(), h !== p && p.captureAnimationState();
    }
    function D(X) {
      return m("dragOverCompleted", {
        insertion: X
      }), X && (c ? u._hideClone() : u._showClone(h), h !== p && (k(x, at ? at.options.ghostClass : u.options.ghostClass, !1), k(x, s.ghostClass, !0)), at !== h && h !== T.active ? at = h : h === T.active && at && (at = null), p === h && (h._ignoreWhileAnimating = e), h.animateAll(function() {
        m("dragOverAnimationComplete"), h._ignoreWhileAnimating = null;
      }), h !== p && (p.animateAll(), p._ignoreWhileAnimating = null)), (e === x && !x.animated || e === r && !e.animated) && ($t = null), !s.dragoverBubble && !n.rootEl && e !== document && (x.parentNode[ut]._isOutsideThisEl(n.target), !X && Pt(n)), !s.dragoverBubble && n.stopPropagation && n.stopPropagation(), d = !0;
    }
    function O() {
      gt = q(x), Tt = q(x, s.draggable), ct({
        sortable: h,
        name: "change",
        toEl: r,
        newIndex: gt,
        newDraggableIndex: Tt,
        originalEvent: n
      });
    }
    if (n.preventDefault !== void 0 && n.cancelable && n.preventDefault(), e = St(e, s.draggable, r, !0), m("dragOver"), T.eventCanceled)
      return d;
    if (x.contains(n.target) || e.animated && e.animatingX && e.animatingY || h._ignoreWhileAnimating === e)
      return D(!1);
    if (be = !1, u && !s.disabled && (c ? f || (a = !Y.contains(x)) : at === this || (this.lastPutMode = ae.checkPull(this, u, x, n)) && l.checkPut(this, u, x, n))) {
      if (g = this._getDirection(n, e) === "vertical", i = _(x), m("dragOverValid"), T.eventCanceled)
        return d;
      if (a)
        return rt = Y, S(), this._hideClone(), m("revert"), T.eventCanceled || (jt ? Y.insertBefore(x, jt) : Y.appendChild(x)), D(!0);
      var C = Xe(r, s.draggable);
      if (!C || rr(n, g, this) && !C.animated) {
        if (C === x)
          return D(!1);
        if (C && r === n.target && (e = C), e && (o = _(e)), Pe(Y, r, x, i, e, o, n, !!e) !== !1)
          return S(), r.appendChild(x), rt = r, O(), D(!0);
      } else if (e.parentNode === r) {
        o = _(e);
        var L = 0, V, U = x.parentNode !== r, I = !qn(x.animated && x.toRect || i, e.animated && e.toRect || o, g), M = g ? "top" : "left", A = tn(e, "top", "top") || tn(x, "top", "top"), B = A ? A.scrollTop : void 0;
        $t !== e && (V = o[M], _t = !1, se = !I && s.invertSwap || U), L = or(n, e, o, g, I ? 1 : s.swapThreshold, s.invertedSwapThreshold == null ? s.swapThreshold : s.invertedSwapThreshold, se, $t === e);
        var J;
        if (L !== 0) {
          var nt = q(x);
          do
            nt -= L, J = rt.children[nt];
          while (J && (w(J, "display") === "none" || J === N));
        }
        if (L === 0 || J === e)
          return D(!1);
        $t = e, qt = L;
        var tt = e.nextElementSibling, H = !1;
        H = L === 1;
        var z = Pe(Y, r, x, i, e, o, n, H);
        if (z !== !1)
          return (z === 1 || z === -1) && (H = z === 1), Ue = !0, setTimeout(nr, 30), S(), H && !tt ? r.appendChild(x) : e.parentNode.insertBefore(x, H ? tt : e), A && vn(A, 0, B - A.scrollTop), rt = x.parentNode, V !== void 0 && !se && (he = Math.abs(V - _(e)[M])), O(), D(!0);
      }
      if (r.contains(x))
        return D(!1);
    }
    return !1;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function() {
    R(document, "mousemove", this._onTouchMove), R(document, "touchmove", this._onTouchMove), R(document, "pointermove", this._onTouchMove), R(document, "dragover", Pt), R(document, "mousemove", Pt), R(document, "touchmove", Pt);
  },
  _offUpEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._onDrop), R(n, "touchend", this._onDrop), R(n, "pointerup", this._onDrop), R(n, "touchcancel", this._onDrop), R(document, "selectstart", this);
  },
  _onDrop: function(n) {
    var r = this.el, e = this.options;
    if (gt = q(x), Tt = q(x, e.draggable), ft("drop", this, {
      evt: n
    }), rt = x && x.parentNode, gt = q(x), Tt = q(x, e.draggable), T.eventCanceled) {
      this._nulling();
      return;
    }
    Vt = !1, se = !1, _t = !1, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), ze(this.cloneId), ze(this._dragStartId), this.nativeDraggable && (R(document, "drop", this), R(r, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), Ve && w(document.body, "user-select", ""), w(x, "transform", ""), n && (Yt && (n.cancelable && n.preventDefault(), !e.dropBubble && n.stopPropagation()), N && N.parentNode && N.parentNode.removeChild(N), (Y === rt || at && at.lastPutMode !== "clone") && Q && Q.parentNode && Q.parentNode.removeChild(Q), x && (this.nativeDraggable && R(x, "dragend", this), je(x), x.style["will-change"] = "", Yt && !Vt && k(x, at ? at.options.ghostClass : this.options.ghostClass, !1), k(x, this.options.chosenClass, !1), ct({
      sortable: this,
      name: "unchoose",
      toEl: rt,
      newIndex: null,
      newDraggableIndex: null,
      originalEvent: n
    }), Y !== rt ? (gt >= 0 && (ct({
      rootEl: rt,
      name: "add",
      toEl: rt,
      fromEl: Y,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "remove",
      toEl: rt,
      originalEvent: n
    }), ct({
      rootEl: rt,
      name: "sort",
      toEl: rt,
      fromEl: Y,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), at && at.save()) : gt !== Ut && gt >= 0 && (ct({
      sortable: this,
      name: "update",
      toEl: rt,
      originalEvent: n
    }), ct({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), T.active && ((gt == null || gt === -1) && (gt = Ut, Tt = Qt), ct({
      sortable: this,
      name: "end",
      toEl: rt,
      originalEvent: n
    }), this.save()))), this._nulling();
  },
  _nulling: function() {
    ft("nulling", this), Y = x = rt = N = jt = Q = de = At = Nt = yt = Yt = gt = Tt = Ut = Qt = $t = qt = at = ae = T.dragged = T.ghost = T.clone = T.active = null, xe.forEach(function(n) {
      n.checked = !0;
    }), xe.length = Fe = Me = 0;
  },
  handleEvent: function(n) {
    switch (n.type) {
      case "drop":
      case "dragend":
        this._onDrop(n);
        break;
      case "dragenter":
      case "dragover":
        x && (this._onDragOver(n), er(n));
        break;
      case "selectstart":
        n.preventDefault();
        break;
    }
  },
  toArray: function() {
    for (var n = [], r, e = this.el.children, i = 0, o = e.length, a = this.options; i < o; i++)
      r = e[i], St(r, a.draggable, this.el, !1) && n.push(r.getAttribute(a.dataIdAttr) || ar(r));
    return n;
  },
  sort: function(n) {
    var r = {}, e = this.el;
    this.toArray().forEach(function(i, o) {
      var a = e.children[o];
      St(a, this.options.draggable, e, !1) && (r[i] = a);
    }, this), n.forEach(function(i) {
      r[i] && (e.removeChild(r[i]), e.appendChild(r[i]));
    });
  },
  save: function() {
    var n = this.options.store;
    n && n.set && n.set(this);
  },
  closest: function(n, r) {
    return St(n, r || this.options.draggable, this.el, !1);
  },
  option: function(n, r) {
    var e = this.options;
    if (r === void 0)
      return e[n];
    var i = ne.modifyOption(this, n, r);
    typeof i < "u" ? e[n] = i : e[n] = r, n === "group" && yn(e);
  },
  destroy: function() {
    ft("destroy", this);
    var n = this.el;
    n[ut] = null, R(n, "mousedown", this._onTapStart), R(n, "touchstart", this._onTapStart), R(n, "pointerdown", this._onTapStart), this.nativeDraggable && (R(n, "dragover", this), R(n, "dragenter", this)), Array.prototype.forEach.call(n.querySelectorAll("[draggable]"), function(r) {
      r.removeAttribute("draggable");
    }), this._onDrop(), this._disableDelayedDragEvents(), ye.splice(ye.indexOf(this.el), 1), this.el = n = null;
  },
  _hideClone: function() {
    if (!At) {
      if (ft("hideClone", this), T.eventCanceled)
        return;
      w(Q, "display", "none"), this.options.removeCloneOnHide && Q.parentNode && Q.parentNode.removeChild(Q), At = !0;
    }
  },
  _showClone: function(n) {
    if (n.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (At) {
      if (ft("showClone", this), T.eventCanceled)
        return;
      Y.contains(x) && !this.options.group.revertClone ? Y.insertBefore(Q, x) : jt ? Y.insertBefore(Q, jt) : Y.appendChild(Q), this.options.group.revertClone && this.animate(x, Q), w(Q, "display", ""), At = !1;
    }
  }
};
function er(t) {
  t.dataTransfer && (t.dataTransfer.dropEffect = "move"), t.cancelable && t.preventDefault();
}
function Pe(t, n, r, e, i, o, a, s) {
  var l, u = t[ut], c = u.options.onMove, f;
  return window.CustomEvent && !Ct && !ee ? l = new CustomEvent("move", {
    bubbles: !0,
    cancelable: !0
  }) : (l = document.createEvent("Event"), l.initEvent("move", !0, !0)), l.to = n, l.from = t, l.dragged = r, l.draggedRect = e, l.related = i || n, l.relatedRect = o || _(n), l.willInsertAfter = s, l.originalEvent = a, t.dispatchEvent(l), c && (f = c.call(u, l, a)), f;
}
function je(t) {
  t.draggable = !1;
}
function nr() {
  Ue = !1;
}
function rr(t, n, r) {
  var e = _(Xe(r.el, r.options.draggable)), i = 10;
  return n ? t.clientX > e.right + i || t.clientX <= e.right && t.clientY > e.bottom && t.clientX >= e.left : t.clientX > e.right && t.clientY > e.top || t.clientX <= e.right && t.clientY > e.bottom + i;
}
function or(t, n, r, e, i, o, a, s) {
  var l = e ? t.clientY : t.clientX, u = e ? r.height : r.width, c = e ? r.top : r.left, f = e ? r.bottom : r.right, p = !1;
  if (!a) {
    if (s && he < u * i) {
      if (!_t && (qt === 1 ? l > c + u * o / 2 : l < f - u * o / 2) && (_t = !0), _t)
        p = !0;
      else if (qt === 1 ? l < c + he : l > f - he)
        return -qt;
    } else if (l > c + u * (1 - i) / 2 && l < f - u * (1 - i) / 2)
      return ir(n);
  }
  return p = p || a, p && (l < c + u * o / 2 || l > f - u * o / 2) ? l > c + u / 2 ? 1 : -1 : 0;
}
function ir(t) {
  return q(x) < q(t) ? 1 : -1;
}
function ar(t) {
  for (var n = t.tagName + t.className + t.src + t.href + t.textContent, r = n.length, e = 0; r--; )
    e += n.charCodeAt(r);
  return e.toString(36);
}
function sr(t) {
  xe.length = 0;
  for (var n = t.getElementsByTagName("input"), r = n.length; r--; ) {
    var e = n[r];
    e.checked && xe.push(e);
  }
}
function pe(t) {
  return setTimeout(t, 0);
}
function ze(t) {
  return clearTimeout(t);
}
Ee && $(document, "touchmove", function(t) {
  (T.active || Vt) && t.cancelable && t.preventDefault();
});
T.utils = {
  on: $,
  off: R,
  css: w,
  find: pn,
  is: function(n, r) {
    return !!St(n, r, n, !1);
  },
  extend: Xn,
  throttle: gn,
  closest: St,
  toggleClass: k,
  clone: Ye,
  index: q,
  nextTick: pe,
  cancelNextTick: ze,
  detectDirection: bn,
  getChild: me
};
T.get = function(t) {
  return t[ut];
};
T.mount = function() {
  for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
    n[r] = arguments[r];
  n[0].constructor === Array && (n = n[0]), n.forEach(function(e) {
    if (!e.prototype || !e.prototype.constructor)
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(e));
    e.utils && (T.utils = Mt({}, T.utils, e.utils)), ne.mount(e);
  });
};
T.create = function(t, n) {
  return new T(t, n);
};
T.version = Gn;
var ot = [], kt, Ge, He = !1, Re, Le, Se, Zt;
function lr() {
  function t() {
    this.defaults = {
      scroll: !0,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: !0
    };
    for (var n in this)
      n.charAt(0) === "_" && typeof this[n] == "function" && (this[n] = this[n].bind(this));
  }
  return t.prototype = {
    dragStarted: function(r) {
      var e = r.originalEvent;
      this.sortable.nativeDraggable ? $(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? $(document, "pointermove", this._handleFallbackAutoScroll) : e.touches ? $(document, "touchmove", this._handleFallbackAutoScroll) : $(document, "mousemove", this._handleFallbackAutoScroll);
    },
    dragOverCompleted: function(r) {
      var e = r.originalEvent;
      !this.options.dragOverBubble && !e.rootEl && this._handleAutoScroll(e);
    },
    drop: function() {
      this.sortable.nativeDraggable ? R(document, "dragover", this._handleAutoScroll) : (R(document, "pointermove", this._handleFallbackAutoScroll), R(document, "touchmove", this._handleFallbackAutoScroll), R(document, "mousemove", this._handleFallbackAutoScroll)), sn(), ge(), Yn();
    },
    nulling: function() {
      Se = Ge = kt = He = Zt = Re = Le = null, ot.length = 0;
    },
    _handleFallbackAutoScroll: function(r) {
      this._handleAutoScroll(r, !0);
    },
    _handleAutoScroll: function(r, e) {
      var i = this, o = (r.touches ? r.touches[0] : r).clientX, a = (r.touches ? r.touches[0] : r).clientY, s = document.elementFromPoint(o, a);
      if (Se = r, e || ee || Ct || Ve) {
        $e(r, this.options, s, e);
        var l = It(s, !0);
        He && (!Zt || o !== Re || a !== Le) && (Zt && sn(), Zt = setInterval(function() {
          var u = It(document.elementFromPoint(o, a), !0);
          u !== l && (l = u, ge()), $e(r, i.options, u, e);
        }, 10), Re = o, Le = a);
      } else {
        if (!this.options.bubbleScroll || It(s, !0) === wt()) {
          ge();
          return;
        }
        $e(r, this.options, It(s, !1), !1);
      }
    }
  }, bt(t, {
    pluginName: "scroll",
    initializeByDefault: !0
  });
}
function ge() {
  ot.forEach(function(t) {
    clearInterval(t.pid);
  }), ot = [];
}
function sn() {
  clearInterval(Zt);
}
var $e = gn(function(t, n, r, e) {
  if (!!n.scroll) {
    var i = (t.touches ? t.touches[0] : t).clientX, o = (t.touches ? t.touches[0] : t).clientY, a = n.scrollSensitivity, s = n.scrollSpeed, l = wt(), u = !1, c;
    Ge !== r && (Ge = r, ge(), kt = n.scroll, c = n.scrollFn, kt === !0 && (kt = It(r, !0)));
    var f = 0, p = kt;
    do {
      var g = p, h = _(g), d = h.top, m = h.bottom, S = h.left, D = h.right, O = h.width, C = h.height, L = void 0, V = void 0, U = g.scrollWidth, I = g.scrollHeight, M = w(g), A = g.scrollLeft, B = g.scrollTop;
      g === l ? (L = O < U && (M.overflowX === "auto" || M.overflowX === "scroll" || M.overflowX === "visible"), V = C < I && (M.overflowY === "auto" || M.overflowY === "scroll" || M.overflowY === "visible")) : (L = O < U && (M.overflowX === "auto" || M.overflowX === "scroll"), V = C < I && (M.overflowY === "auto" || M.overflowY === "scroll"));
      var J = L && (Math.abs(D - i) <= a && A + O < U) - (Math.abs(S - i) <= a && !!A), nt = V && (Math.abs(m - o) <= a && B + C < I) - (Math.abs(d - o) <= a && !!B);
      if (!ot[f])
        for (var tt = 0; tt <= f; tt++)
          ot[tt] || (ot[tt] = {});
      (ot[f].vx != J || ot[f].vy != nt || ot[f].el !== g) && (ot[f].el = g, ot[f].vx = J, ot[f].vy = nt, clearInterval(ot[f].pid), (J != 0 || nt != 0) && (u = !0, ot[f].pid = setInterval(function() {
        e && this.layer === 0 && T.active._onTouchMove(Se);
        var H = ot[this.layer].vy ? ot[this.layer].vy * s : 0, z = ot[this.layer].vx ? ot[this.layer].vx * s : 0;
        typeof c == "function" && c.call(T.dragged.parentNode[ut], z, H, t, Se, ot[this.layer].el) !== "continue" || vn(ot[this.layer].el, z, H);
      }.bind({
        layer: f
      }), 24))), f++;
    } while (n.bubbleScroll && p !== l && (p = It(p, !1)));
    He = u;
  }
}, 30), On = function(n) {
  var r = n.originalEvent, e = n.putSortable, i = n.dragEl, o = n.activeSortable, a = n.dispatchSortableEvent, s = n.hideGhostForTarget, l = n.unhideGhostForTarget;
  if (!!r) {
    var u = e || o;
    s();
    var c = r.changedTouches && r.changedTouches.length ? r.changedTouches[0] : r, f = document.elementFromPoint(c.clientX, c.clientY);
    l(), u && !u.el.contains(f) && (a("spill"), this.onSpill({
      dragEl: i,
      putSortable: e
    }));
  }
};
function ke() {
}
ke.prototype = {
  startIndex: null,
  dragStart: function(n) {
    var r = n.oldDraggableIndex;
    this.startIndex = r;
  },
  onSpill: function(n) {
    var r = n.dragEl, e = n.putSortable;
    this.sortable.captureAnimationState(), e && e.captureAnimationState();
    var i = me(this.sortable.el, this.startIndex, this.options);
    i ? this.sortable.el.insertBefore(r, i) : this.sortable.el.appendChild(r), this.sortable.animateAll(), e && e.animateAll();
  },
  drop: On
};
bt(ke, {
  pluginName: "revertOnSpill"
});
function Ze() {
}
Ze.prototype = {
  onSpill: function(n) {
    var r = n.dragEl, e = n.putSortable, i = e || this.sortable;
    i.captureAnimationState(), r.parentNode && r.parentNode.removeChild(r), i.animateAll();
  },
  drop: On
};
bt(Ze, {
  pluginName: "removeOnSpill"
});
var mt;
function ur() {
  function t() {
    this.defaults = {
      swapClass: "sortable-swap-highlight"
    };
  }
  return t.prototype = {
    dragStart: function(r) {
      var e = r.dragEl;
      mt = e;
    },
    dragOverValid: function(r) {
      var e = r.completed, i = r.target, o = r.onMove, a = r.activeSortable, s = r.changed, l = r.cancel;
      if (!!a.options.swap) {
        var u = this.sortable.el, c = this.options;
        if (i && i !== u) {
          var f = mt;
          o(i) !== !1 ? (k(i, c.swapClass, !0), mt = i) : mt = null, f && f !== mt && k(f, c.swapClass, !1);
        }
        s(), e(!0), l();
      }
    },
    drop: function(r) {
      var e = r.activeSortable, i = r.putSortable, o = r.dragEl, a = i || this.sortable, s = this.options;
      mt && k(mt, s.swapClass, !1), mt && (s.swap || i && i.options.swap) && o !== mt && (a.captureAnimationState(), a !== e && e.captureAnimationState(), cr(o, mt), a.animateAll(), a !== e && e.animateAll());
    },
    nulling: function() {
      mt = null;
    }
  }, bt(t, {
    pluginName: "swap",
    eventProperties: function() {
      return {
        swapItem: mt
      };
    }
  });
}
function cr(t, n) {
  var r = t.parentNode, e = n.parentNode, i, o;
  !r || !e || r.isEqualNode(n) || e.isEqualNode(t) || (i = q(t), o = q(n), r.isEqualNode(e) && i < o && o++, r.insertBefore(n, r.children[i]), e.insertBefore(t, e.children[o]));
}
var F = [], pt = [], Ht, xt, Wt = !1, ht = !1, Bt = !1, W, Kt, ue;
function fr() {
  function t(n) {
    for (var r in this)
      r.charAt(0) === "_" && typeof this[r] == "function" && (this[r] = this[r].bind(this));
    n.options.supportPointer ? $(document, "pointerup", this._deselectMultiDrag) : ($(document, "mouseup", this._deselectMultiDrag), $(document, "touchend", this._deselectMultiDrag)), $(document, "keydown", this._checkKeyDown), $(document, "keyup", this._checkKeyUp), this.defaults = {
      selectedClass: "sortable-selected",
      multiDragKey: null,
      setData: function(i, o) {
        var a = "";
        F.length && xt === n ? F.forEach(function(s, l) {
          a += (l ? ", " : "") + s.textContent;
        }) : a = o.textContent, i.setData("Text", a);
      }
    };
  }
  return t.prototype = {
    multiDragKeyDown: !1,
    isMultiDrag: !1,
    delayStartGlobal: function(r) {
      var e = r.dragEl;
      W = e;
    },
    delayEnded: function() {
      this.isMultiDrag = ~F.indexOf(W);
    },
    setupClone: function(r) {
      var e = r.sortable, i = r.cancel;
      if (!!this.isMultiDrag) {
        for (var o = 0; o < F.length; o++)
          pt.push(Ye(F[o])), pt[o].sortableIndex = F[o].sortableIndex, pt[o].draggable = !1, pt[o].style["will-change"] = "", k(pt[o], this.options.selectedClass, !1), F[o] === W && k(pt[o], this.options.chosenClass, !1);
        e._hideClone(), i();
      }
    },
    clone: function(r) {
      var e = r.sortable, i = r.rootEl, o = r.dispatchSortableEvent, a = r.cancel;
      !this.isMultiDrag || this.options.removeCloneOnHide || F.length && xt === e && (ln(!0, i), o("clone"), a());
    },
    showClone: function(r) {
      var e = r.cloneNowShown, i = r.rootEl, o = r.cancel;
      !this.isMultiDrag || (ln(!1, i), pt.forEach(function(a) {
        w(a, "display", "");
      }), e(), ue = !1, o());
    },
    hideClone: function(r) {
      var e = this;
      r.sortable;
      var i = r.cloneNowHidden, o = r.cancel;
      !this.isMultiDrag || (pt.forEach(function(a) {
        w(a, "display", "none"), e.options.removeCloneOnHide && a.parentNode && a.parentNode.removeChild(a);
      }), i(), ue = !0, o());
    },
    dragStartGlobal: function(r) {
      r.sortable, !this.isMultiDrag && xt && xt.multiDrag._deselectMultiDrag(), F.forEach(function(e) {
        e.sortableIndex = q(e);
      }), F = F.sort(function(e, i) {
        return e.sortableIndex - i.sortableIndex;
      }), Bt = !0;
    },
    dragStarted: function(r) {
      var e = this, i = r.sortable;
      if (!!this.isMultiDrag) {
        if (this.options.sort && (i.captureAnimationState(), this.options.animation)) {
          F.forEach(function(a) {
            a !== W && w(a, "position", "absolute");
          });
          var o = _(W, !1, !0, !0);
          F.forEach(function(a) {
            a !== W && nn(a, o);
          }), ht = !0, Wt = !0;
        }
        i.animateAll(function() {
          ht = !1, Wt = !1, e.options.animation && F.forEach(function(a) {
            Ae(a);
          }), e.options.sort && ce();
        });
      }
    },
    dragOver: function(r) {
      var e = r.target, i = r.completed, o = r.cancel;
      ht && ~F.indexOf(e) && (i(!1), o());
    },
    revert: function(r) {
      var e = r.fromSortable, i = r.rootEl, o = r.sortable, a = r.dragRect;
      F.length > 1 && (F.forEach(function(s) {
        o.addAnimationState({
          target: s,
          rect: ht ? _(s) : a
        }), Ae(s), s.fromRect = a, e.removeAnimationState(s);
      }), ht = !1, dr(!this.options.removeCloneOnHide, i));
    },
    dragOverCompleted: function(r) {
      var e = r.sortable, i = r.isOwner, o = r.insertion, a = r.activeSortable, s = r.parentEl, l = r.putSortable, u = this.options;
      if (o) {
        if (i && a._hideClone(), Wt = !1, u.animation && F.length > 1 && (ht || !i && !a.options.sort && !l)) {
          var c = _(W, !1, !0, !0);
          F.forEach(function(p) {
            p !== W && (nn(p, c), s.appendChild(p));
          }), ht = !0;
        }
        if (!i)
          if (ht || ce(), F.length > 1) {
            var f = ue;
            a._showClone(e), a.options.animation && !ue && f && pt.forEach(function(p) {
              a.addAnimationState({
                target: p,
                rect: Kt
              }), p.fromRect = Kt, p.thisAnimationDuration = null;
            });
          } else
            a._showClone(e);
      }
    },
    dragOverAnimationCapture: function(r) {
      var e = r.dragRect, i = r.isOwner, o = r.activeSortable;
      if (F.forEach(function(s) {
        s.thisAnimationDuration = null;
      }), o.options.animation && !i && o.multiDrag.isMultiDrag) {
        Kt = bt({}, e);
        var a = Lt(W, !0);
        Kt.top -= a.f, Kt.left -= a.e;
      }
    },
    dragOverAnimationComplete: function() {
      ht && (ht = !1, ce());
    },
    drop: function(r) {
      var e = r.originalEvent, i = r.rootEl, o = r.parentEl, a = r.sortable, s = r.dispatchSortableEvent, l = r.oldIndex, u = r.putSortable, c = u || this.sortable;
      if (!!e) {
        var f = this.options, p = o.children;
        if (!Bt)
          if (f.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), k(W, f.selectedClass, !~F.indexOf(W)), ~F.indexOf(W))
            F.splice(F.indexOf(W), 1), Ht = null, Xt({
              sortable: a,
              rootEl: i,
              name: "deselect",
              targetEl: W,
              originalEvt: e
            });
          else {
            if (F.push(W), Xt({
              sortable: a,
              rootEl: i,
              name: "select",
              targetEl: W,
              originalEvt: e
            }), e.shiftKey && Ht && a.el.contains(Ht)) {
              var g = q(Ht), h = q(W);
              if (~g && ~h && g !== h) {
                var d, m;
                for (h > g ? (m = g, d = h) : (m = h, d = g + 1); m < d; m++)
                  ~F.indexOf(p[m]) || (k(p[m], f.selectedClass, !0), F.push(p[m]), Xt({
                    sortable: a,
                    rootEl: i,
                    name: "select",
                    targetEl: p[m],
                    originalEvt: e
                  }));
              }
            } else
              Ht = W;
            xt = c;
          }
        if (Bt && this.isMultiDrag) {
          if ((o[ut].options.sort || o !== i) && F.length > 1) {
            var S = _(W), D = q(W, ":not(." + this.options.selectedClass + ")");
            if (!Wt && f.animation && (W.thisAnimationDuration = null), c.captureAnimationState(), !Wt && (f.animation && (W.fromRect = S, F.forEach(function(C) {
              if (C.thisAnimationDuration = null, C !== W) {
                var L = ht ? _(C) : S;
                C.fromRect = L, c.addAnimationState({
                  target: C,
                  rect: L
                });
              }
            })), ce(), F.forEach(function(C) {
              p[D] ? o.insertBefore(C, p[D]) : o.appendChild(C), D++;
            }), l === q(W))) {
              var O = !1;
              F.forEach(function(C) {
                if (C.sortableIndex !== q(C)) {
                  O = !0;
                  return;
                }
              }), O && s("update");
            }
            F.forEach(function(C) {
              Ae(C);
            }), c.animateAll();
          }
          xt = c;
        }
        (i === o || u && u.lastPutMode !== "clone") && pt.forEach(function(C) {
          C.parentNode && C.parentNode.removeChild(C);
        });
      }
    },
    nullingGlobal: function() {
      this.isMultiDrag = Bt = !1, pt.length = 0;
    },
    destroyGlobal: function() {
      this._deselectMultiDrag(), R(document, "pointerup", this._deselectMultiDrag), R(document, "mouseup", this._deselectMultiDrag), R(document, "touchend", this._deselectMultiDrag), R(document, "keydown", this._checkKeyDown), R(document, "keyup", this._checkKeyUp);
    },
    _deselectMultiDrag: function(r) {
      if (!(typeof Bt < "u" && Bt) && xt === this.sortable && !(r && St(r.target, this.options.draggable, this.sortable.el, !1)) && !(r && r.button !== 0))
        for (; F.length; ) {
          var e = F[0];
          k(e, this.options.selectedClass, !1), F.shift(), Xt({
            sortable: this.sortable,
            rootEl: this.sortable.el,
            name: "deselect",
            targetEl: e,
            originalEvt: r
          });
        }
    },
    _checkKeyDown: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !0);
    },
    _checkKeyUp: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !1);
    }
  }, bt(t, {
    pluginName: "multiDrag",
    utils: {
      select: function(r) {
        var e = r.parentNode[ut];
        !e || !e.options.multiDrag || ~F.indexOf(r) || (xt && xt !== e && (xt.multiDrag._deselectMultiDrag(), xt = e), k(r, e.options.selectedClass, !0), F.push(r));
      },
      deselect: function(r) {
        var e = r.parentNode[ut], i = F.indexOf(r);
        !e || !e.options.multiDrag || !~i || (k(r, e.options.selectedClass, !1), F.splice(i, 1));
      }
    },
    eventProperties: function() {
      var r = this, e = [], i = [];
      return F.forEach(function(o) {
        e.push({
          multiDragElement: o,
          index: o.sortableIndex
        });
        var a;
        ht && o !== W ? a = -1 : ht ? a = q(o, ":not(." + r.options.selectedClass + ")") : a = q(o), i.push({
          multiDragElement: o,
          index: a
        });
      }), {
        items: Bn(F),
        clones: [].concat(pt),
        oldIndicies: e,
        newIndicies: i
      };
    },
    optionListeners: {
      multiDragKey: function(r) {
        return r = r.toLowerCase(), r === "ctrl" ? r = "Control" : r.length > 1 && (r = r.charAt(0).toUpperCase() + r.substr(1)), r;
      }
    }
  });
}
function dr(t, n) {
  F.forEach(function(r, e) {
    var i = n.children[r.sortableIndex + (t ? Number(e) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function ln(t, n) {
  pt.forEach(function(r, e) {
    var i = n.children[r.sortableIndex + (t ? Number(e) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function ce() {
  F.forEach(function(t) {
    t !== W && t.parentNode && t.parentNode.removeChild(t);
  });
}
T.mount(new lr());
T.mount(Ze, ke);
const hr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: T,
  MultiDrag: fr,
  Sortable: T,
  Swap: ur
}, Symbol.toStringTag, { value: "Module" })), pr = /* @__PURE__ */ jn(hr);
(function(t, n) {
  (function(e, i) {
    t.exports = i(pr);
  })(typeof self < "u" ? self : Nn, function(r) {
    return function(e) {
      var i = {};
      function o(a) {
        if (i[a])
          return i[a].exports;
        var s = i[a] = {
          i: a,
          l: !1,
          exports: {}
        };
        return e[a].call(s.exports, s, s.exports, o), s.l = !0, s.exports;
      }
      return o.m = e, o.c = i, o.d = function(a, s, l) {
        o.o(a, s) || Object.defineProperty(a, s, { enumerable: !0, get: l });
      }, o.r = function(a) {
        typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a, "__esModule", { value: !0 });
      }, o.t = function(a, s) {
        if (s & 1 && (a = o(a)), s & 8 || s & 4 && typeof a == "object" && a && a.__esModule)
          return a;
        var l = /* @__PURE__ */ Object.create(null);
        if (o.r(l), Object.defineProperty(l, "default", { enumerable: !0, value: a }), s & 2 && typeof a != "string")
          for (var u in a)
            o.d(l, u, function(c) {
              return a[c];
            }.bind(null, u));
        return l;
      }, o.n = function(a) {
        var s = a && a.__esModule ? function() {
          return a.default;
        } : function() {
          return a;
        };
        return o.d(s, "a", s), s;
      }, o.o = function(a, s) {
        return Object.prototype.hasOwnProperty.call(a, s);
      }, o.p = "", o(o.s = "fb15");
    }({
      "01f9": function(e, i, o) {
        var a = o("2d00"), s = o("5ca1"), l = o("2aba"), u = o("32e9"), c = o("84f2"), f = o("41a0"), p = o("7f20"), g = o("38fd"), h = o("2b4c")("iterator"), d = !([].keys && "next" in [].keys()), m = "@@iterator", S = "keys", D = "values", O = function() {
          return this;
        };
        e.exports = function(C, L, V, U, I, M, A) {
          f(V, L, U);
          var B = function(b) {
            if (!d && b in H)
              return H[b];
            switch (b) {
              case S:
                return function() {
                  return new V(this, b);
                };
              case D:
                return function() {
                  return new V(this, b);
                };
            }
            return function() {
              return new V(this, b);
            };
          }, J = L + " Iterator", nt = I == D, tt = !1, H = C.prototype, z = H[h] || H[m] || I && H[I], X = z || B(I), dt = I ? nt ? B("entries") : X : void 0, st = L == "Array" && H.entries || z, it, y, v;
          if (st && (v = g(st.call(new C())), v !== Object.prototype && v.next && (p(v, J, !0), !a && typeof v[h] != "function" && u(v, h, O))), nt && z && z.name !== D && (tt = !0, X = function() {
            return z.call(this);
          }), (!a || A) && (d || tt || !H[h]) && u(H, h, X), c[L] = X, c[J] = O, I)
            if (it = {
              values: nt ? X : B(D),
              keys: M ? X : B(S),
              entries: dt
            }, A)
              for (y in it)
                y in H || l(H, y, it[y]);
            else
              s(s.P + s.F * (d || tt), L, it);
          return it;
        };
      },
      "02f4": function(e, i, o) {
        var a = o("4588"), s = o("be13");
        e.exports = function(l) {
          return function(u, c) {
            var f = String(s(u)), p = a(c), g = f.length, h, d;
            return p < 0 || p >= g ? l ? "" : void 0 : (h = f.charCodeAt(p), h < 55296 || h > 56319 || p + 1 === g || (d = f.charCodeAt(p + 1)) < 56320 || d > 57343 ? l ? f.charAt(p) : h : l ? f.slice(p, p + 2) : (h - 55296 << 10) + (d - 56320) + 65536);
          };
        };
      },
      "0390": function(e, i, o) {
        var a = o("02f4")(!0);
        e.exports = function(s, l, u) {
          return l + (u ? a(s, l).length : 1);
        };
      },
      "0bfb": function(e, i, o) {
        var a = o("cb7c");
        e.exports = function() {
          var s = a(this), l = "";
          return s.global && (l += "g"), s.ignoreCase && (l += "i"), s.multiline && (l += "m"), s.unicode && (l += "u"), s.sticky && (l += "y"), l;
        };
      },
      "0d58": function(e, i, o) {
        var a = o("ce10"), s = o("e11e");
        e.exports = Object.keys || function(u) {
          return a(u, s);
        };
      },
      1495: function(e, i, o) {
        var a = o("86cc"), s = o("cb7c"), l = o("0d58");
        e.exports = o("9e1e") ? Object.defineProperties : function(c, f) {
          s(c);
          for (var p = l(f), g = p.length, h = 0, d; g > h; )
            a.f(c, d = p[h++], f[d]);
          return c;
        };
      },
      "214f": function(e, i, o) {
        o("b0c5");
        var a = o("2aba"), s = o("32e9"), l = o("79e5"), u = o("be13"), c = o("2b4c"), f = o("520a"), p = c("species"), g = !l(function() {
          var d = /./;
          return d.exec = function() {
            var m = [];
            return m.groups = { a: "7" }, m;
          }, "".replace(d, "$<a>") !== "7";
        }), h = function() {
          var d = /(?:)/, m = d.exec;
          d.exec = function() {
            return m.apply(this, arguments);
          };
          var S = "ab".split(d);
          return S.length === 2 && S[0] === "a" && S[1] === "b";
        }();
        e.exports = function(d, m, S) {
          var D = c(d), O = !l(function() {
            var M = {};
            return M[D] = function() {
              return 7;
            }, ""[d](M) != 7;
          }), C = O ? !l(function() {
            var M = !1, A = /a/;
            return A.exec = function() {
              return M = !0, null;
            }, d === "split" && (A.constructor = {}, A.constructor[p] = function() {
              return A;
            }), A[D](""), !M;
          }) : void 0;
          if (!O || !C || d === "replace" && !g || d === "split" && !h) {
            var L = /./[D], V = S(
              u,
              D,
              ""[d],
              function(A, B, J, nt, tt) {
                return B.exec === f ? O && !tt ? { done: !0, value: L.call(B, J, nt) } : { done: !0, value: A.call(J, B, nt) } : { done: !1 };
              }
            ), U = V[0], I = V[1];
            a(String.prototype, d, U), s(
              RegExp.prototype,
              D,
              m == 2 ? function(M, A) {
                return I.call(M, this, A);
              } : function(M) {
                return I.call(M, this);
              }
            );
          }
        };
      },
      "230e": function(e, i, o) {
        var a = o("d3f4"), s = o("7726").document, l = a(s) && a(s.createElement);
        e.exports = function(u) {
          return l ? s.createElement(u) : {};
        };
      },
      "23c6": function(e, i, o) {
        var a = o("2d95"), s = o("2b4c")("toStringTag"), l = a(function() {
          return arguments;
        }()) == "Arguments", u = function(c, f) {
          try {
            return c[f];
          } catch {
          }
        };
        e.exports = function(c) {
          var f, p, g;
          return c === void 0 ? "Undefined" : c === null ? "Null" : typeof (p = u(f = Object(c), s)) == "string" ? p : l ? a(f) : (g = a(f)) == "Object" && typeof f.callee == "function" ? "Arguments" : g;
        };
      },
      2621: function(e, i) {
        i.f = Object.getOwnPropertySymbols;
      },
      "2aba": function(e, i, o) {
        var a = o("7726"), s = o("32e9"), l = o("69a8"), u = o("ca5a")("src"), c = o("fa5b"), f = "toString", p = ("" + c).split(f);
        o("8378").inspectSource = function(g) {
          return c.call(g);
        }, (e.exports = function(g, h, d, m) {
          var S = typeof d == "function";
          S && (l(d, "name") || s(d, "name", h)), g[h] !== d && (S && (l(d, u) || s(d, u, g[h] ? "" + g[h] : p.join(String(h)))), g === a ? g[h] = d : m ? g[h] ? g[h] = d : s(g, h, d) : (delete g[h], s(g, h, d)));
        })(Function.prototype, f, function() {
          return typeof this == "function" && this[u] || c.call(this);
        });
      },
      "2aeb": function(e, i, o) {
        var a = o("cb7c"), s = o("1495"), l = o("e11e"), u = o("613b")("IE_PROTO"), c = function() {
        }, f = "prototype", p = function() {
          var g = o("230e")("iframe"), h = l.length, d = "<", m = ">", S;
          for (g.style.display = "none", o("fab2").appendChild(g), g.src = "javascript:", S = g.contentWindow.document, S.open(), S.write(d + "script" + m + "document.F=Object" + d + "/script" + m), S.close(), p = S.F; h--; )
            delete p[f][l[h]];
          return p();
        };
        e.exports = Object.create || function(h, d) {
          var m;
          return h !== null ? (c[f] = a(h), m = new c(), c[f] = null, m[u] = h) : m = p(), d === void 0 ? m : s(m, d);
        };
      },
      "2b4c": function(e, i, o) {
        var a = o("5537")("wks"), s = o("ca5a"), l = o("7726").Symbol, u = typeof l == "function", c = e.exports = function(f) {
          return a[f] || (a[f] = u && l[f] || (u ? l : s)("Symbol." + f));
        };
        c.store = a;
      },
      "2d00": function(e, i) {
        e.exports = !1;
      },
      "2d95": function(e, i) {
        var o = {}.toString;
        e.exports = function(a) {
          return o.call(a).slice(8, -1);
        };
      },
      "2fdb": function(e, i, o) {
        var a = o("5ca1"), s = o("d2c8"), l = "includes";
        a(a.P + a.F * o("5147")(l), "String", {
          includes: function(c) {
            return !!~s(this, c, l).indexOf(c, arguments.length > 1 ? arguments[1] : void 0);
          }
        });
      },
      "32e9": function(e, i, o) {
        var a = o("86cc"), s = o("4630");
        e.exports = o("9e1e") ? function(l, u, c) {
          return a.f(l, u, s(1, c));
        } : function(l, u, c) {
          return l[u] = c, l;
        };
      },
      "38fd": function(e, i, o) {
        var a = o("69a8"), s = o("4bf8"), l = o("613b")("IE_PROTO"), u = Object.prototype;
        e.exports = Object.getPrototypeOf || function(c) {
          return c = s(c), a(c, l) ? c[l] : typeof c.constructor == "function" && c instanceof c.constructor ? c.constructor.prototype : c instanceof Object ? u : null;
        };
      },
      "41a0": function(e, i, o) {
        var a = o("2aeb"), s = o("4630"), l = o("7f20"), u = {};
        o("32e9")(u, o("2b4c")("iterator"), function() {
          return this;
        }), e.exports = function(c, f, p) {
          c.prototype = a(u, { next: s(1, p) }), l(c, f + " Iterator");
        };
      },
      "456d": function(e, i, o) {
        var a = o("4bf8"), s = o("0d58");
        o("5eda")("keys", function() {
          return function(u) {
            return s(a(u));
          };
        });
      },
      4588: function(e, i) {
        var o = Math.ceil, a = Math.floor;
        e.exports = function(s) {
          return isNaN(s = +s) ? 0 : (s > 0 ? a : o)(s);
        };
      },
      4630: function(e, i) {
        e.exports = function(o, a) {
          return {
            enumerable: !(o & 1),
            configurable: !(o & 2),
            writable: !(o & 4),
            value: a
          };
        };
      },
      "4bf8": function(e, i, o) {
        var a = o("be13");
        e.exports = function(s) {
          return Object(a(s));
        };
      },
      5147: function(e, i, o) {
        var a = o("2b4c")("match");
        e.exports = function(s) {
          var l = /./;
          try {
            "/./"[s](l);
          } catch {
            try {
              return l[a] = !1, !"/./"[s](l);
            } catch {
            }
          }
          return !0;
        };
      },
      "520a": function(e, i, o) {
        var a = o("0bfb"), s = RegExp.prototype.exec, l = String.prototype.replace, u = s, c = "lastIndex", f = function() {
          var h = /a/, d = /b*/g;
          return s.call(h, "a"), s.call(d, "a"), h[c] !== 0 || d[c] !== 0;
        }(), p = /()??/.exec("")[1] !== void 0, g = f || p;
        g && (u = function(d) {
          var m = this, S, D, O, C;
          return p && (D = new RegExp("^" + m.source + "$(?!\\s)", a.call(m))), f && (S = m[c]), O = s.call(m, d), f && O && (m[c] = m.global ? O.index + O[0].length : S), p && O && O.length > 1 && l.call(O[0], D, function() {
            for (C = 1; C < arguments.length - 2; C++)
              arguments[C] === void 0 && (O[C] = void 0);
          }), O;
        }), e.exports = u;
      },
      "52a7": function(e, i) {
        i.f = {}.propertyIsEnumerable;
      },
      5537: function(e, i, o) {
        var a = o("8378"), s = o("7726"), l = "__core-js_shared__", u = s[l] || (s[l] = {});
        (e.exports = function(c, f) {
          return u[c] || (u[c] = f !== void 0 ? f : {});
        })("versions", []).push({
          version: a.version,
          mode: o("2d00") ? "pure" : "global",
          copyright: "\xA9 2019 Denis Pushkarev (zloirock.ru)"
        });
      },
      "5ca1": function(e, i, o) {
        var a = o("7726"), s = o("8378"), l = o("32e9"), u = o("2aba"), c = o("9b43"), f = "prototype", p = function(g, h, d) {
          var m = g & p.F, S = g & p.G, D = g & p.S, O = g & p.P, C = g & p.B, L = S ? a : D ? a[h] || (a[h] = {}) : (a[h] || {})[f], V = S ? s : s[h] || (s[h] = {}), U = V[f] || (V[f] = {}), I, M, A, B;
          S && (d = h);
          for (I in d)
            M = !m && L && L[I] !== void 0, A = (M ? L : d)[I], B = C && M ? c(A, a) : O && typeof A == "function" ? c(Function.call, A) : A, L && u(L, I, A, g & p.U), V[I] != A && l(V, I, B), O && U[I] != A && (U[I] = A);
        };
        a.core = s, p.F = 1, p.G = 2, p.S = 4, p.P = 8, p.B = 16, p.W = 32, p.U = 64, p.R = 128, e.exports = p;
      },
      "5eda": function(e, i, o) {
        var a = o("5ca1"), s = o("8378"), l = o("79e5");
        e.exports = function(u, c) {
          var f = (s.Object || {})[u] || Object[u], p = {};
          p[u] = c(f), a(a.S + a.F * l(function() {
            f(1);
          }), "Object", p);
        };
      },
      "5f1b": function(e, i, o) {
        var a = o("23c6"), s = RegExp.prototype.exec;
        e.exports = function(l, u) {
          var c = l.exec;
          if (typeof c == "function") {
            var f = c.call(l, u);
            if (typeof f != "object")
              throw new TypeError("RegExp exec method returned something other than an Object or null");
            return f;
          }
          if (a(l) !== "RegExp")
            throw new TypeError("RegExp#exec called on incompatible receiver");
          return s.call(l, u);
        };
      },
      "613b": function(e, i, o) {
        var a = o("5537")("keys"), s = o("ca5a");
        e.exports = function(l) {
          return a[l] || (a[l] = s(l));
        };
      },
      "626a": function(e, i, o) {
        var a = o("2d95");
        e.exports = Object("z").propertyIsEnumerable(0) ? Object : function(s) {
          return a(s) == "String" ? s.split("") : Object(s);
        };
      },
      6762: function(e, i, o) {
        var a = o("5ca1"), s = o("c366")(!0);
        a(a.P, "Array", {
          includes: function(u) {
            return s(this, u, arguments.length > 1 ? arguments[1] : void 0);
          }
        }), o("9c6c")("includes");
      },
      6821: function(e, i, o) {
        var a = o("626a"), s = o("be13");
        e.exports = function(l) {
          return a(s(l));
        };
      },
      "69a8": function(e, i) {
        var o = {}.hasOwnProperty;
        e.exports = function(a, s) {
          return o.call(a, s);
        };
      },
      "6a99": function(e, i, o) {
        var a = o("d3f4");
        e.exports = function(s, l) {
          if (!a(s))
            return s;
          var u, c;
          if (l && typeof (u = s.toString) == "function" && !a(c = u.call(s)) || typeof (u = s.valueOf) == "function" && !a(c = u.call(s)) || !l && typeof (u = s.toString) == "function" && !a(c = u.call(s)))
            return c;
          throw TypeError("Can't convert object to primitive value");
        };
      },
      7333: function(e, i, o) {
        var a = o("0d58"), s = o("2621"), l = o("52a7"), u = o("4bf8"), c = o("626a"), f = Object.assign;
        e.exports = !f || o("79e5")(function() {
          var p = {}, g = {}, h = Symbol(), d = "abcdefghijklmnopqrst";
          return p[h] = 7, d.split("").forEach(function(m) {
            g[m] = m;
          }), f({}, p)[h] != 7 || Object.keys(f({}, g)).join("") != d;
        }) ? function(g, h) {
          for (var d = u(g), m = arguments.length, S = 1, D = s.f, O = l.f; m > S; )
            for (var C = c(arguments[S++]), L = D ? a(C).concat(D(C)) : a(C), V = L.length, U = 0, I; V > U; )
              O.call(C, I = L[U++]) && (d[I] = C[I]);
          return d;
        } : f;
      },
      7726: function(e, i) {
        var o = e.exports = typeof window < "u" && window.Math == Math ? window : typeof self < "u" && self.Math == Math ? self : Function("return this")();
        typeof __g == "number" && (__g = o);
      },
      "77f1": function(e, i, o) {
        var a = o("4588"), s = Math.max, l = Math.min;
        e.exports = function(u, c) {
          return u = a(u), u < 0 ? s(u + c, 0) : l(u, c);
        };
      },
      "79e5": function(e, i) {
        e.exports = function(o) {
          try {
            return !!o();
          } catch {
            return !0;
          }
        };
      },
      "7f20": function(e, i, o) {
        var a = o("86cc").f, s = o("69a8"), l = o("2b4c")("toStringTag");
        e.exports = function(u, c, f) {
          u && !s(u = f ? u : u.prototype, l) && a(u, l, { configurable: !0, value: c });
        };
      },
      8378: function(e, i) {
        var o = e.exports = { version: "2.6.5" };
        typeof __e == "number" && (__e = o);
      },
      "84f2": function(e, i) {
        e.exports = {};
      },
      "86cc": function(e, i, o) {
        var a = o("cb7c"), s = o("c69a"), l = o("6a99"), u = Object.defineProperty;
        i.f = o("9e1e") ? Object.defineProperty : function(f, p, g) {
          if (a(f), p = l(p, !0), a(g), s)
            try {
              return u(f, p, g);
            } catch {
            }
          if ("get" in g || "set" in g)
            throw TypeError("Accessors not supported!");
          return "value" in g && (f[p] = g.value), f;
        };
      },
      "9b43": function(e, i, o) {
        var a = o("d8e8");
        e.exports = function(s, l, u) {
          if (a(s), l === void 0)
            return s;
          switch (u) {
            case 1:
              return function(c) {
                return s.call(l, c);
              };
            case 2:
              return function(c, f) {
                return s.call(l, c, f);
              };
            case 3:
              return function(c, f, p) {
                return s.call(l, c, f, p);
              };
          }
          return function() {
            return s.apply(l, arguments);
          };
        };
      },
      "9c6c": function(e, i, o) {
        var a = o("2b4c")("unscopables"), s = Array.prototype;
        s[a] == null && o("32e9")(s, a, {}), e.exports = function(l) {
          s[a][l] = !0;
        };
      },
      "9def": function(e, i, o) {
        var a = o("4588"), s = Math.min;
        e.exports = function(l) {
          return l > 0 ? s(a(l), 9007199254740991) : 0;
        };
      },
      "9e1e": function(e, i, o) {
        e.exports = !o("79e5")(function() {
          return Object.defineProperty({}, "a", { get: function() {
            return 7;
          } }).a != 7;
        });
      },
      a352: function(e, i) {
        e.exports = r;
      },
      a481: function(e, i, o) {
        var a = o("cb7c"), s = o("4bf8"), l = o("9def"), u = o("4588"), c = o("0390"), f = o("5f1b"), p = Math.max, g = Math.min, h = Math.floor, d = /\$([$&`']|\d\d?|<[^>]*>)/g, m = /\$([$&`']|\d\d?)/g, S = function(D) {
          return D === void 0 ? D : String(D);
        };
        o("214f")("replace", 2, function(D, O, C, L) {
          return [
            function(I, M) {
              var A = D(this), B = I == null ? void 0 : I[O];
              return B !== void 0 ? B.call(I, A, M) : C.call(String(A), I, M);
            },
            function(U, I) {
              var M = L(C, U, this, I);
              if (M.done)
                return M.value;
              var A = a(U), B = String(this), J = typeof I == "function";
              J || (I = String(I));
              var nt = A.global;
              if (nt) {
                var tt = A.unicode;
                A.lastIndex = 0;
              }
              for (var H = []; ; ) {
                var z = f(A, B);
                if (z === null || (H.push(z), !nt))
                  break;
                var X = String(z[0]);
                X === "" && (A.lastIndex = c(B, l(A.lastIndex), tt));
              }
              for (var dt = "", st = 0, it = 0; it < H.length; it++) {
                z = H[it];
                for (var y = String(z[0]), v = p(g(u(z.index), B.length), 0), b = [], E = 1; E < z.length; E++)
                  b.push(S(z[E]));
                var P = z.groups;
                if (J) {
                  var j = [y].concat(b, v, B);
                  P !== void 0 && j.push(P);
                  var G = String(I.apply(void 0, j));
                } else
                  G = V(y, B, v, b, P, I);
                v >= st && (dt += B.slice(st, v) + G, st = v + y.length);
              }
              return dt + B.slice(st);
            }
          ];
          function V(U, I, M, A, B, J) {
            var nt = M + U.length, tt = A.length, H = m;
            return B !== void 0 && (B = s(B), H = d), C.call(J, H, function(z, X) {
              var dt;
              switch (X.charAt(0)) {
                case "$":
                  return "$";
                case "&":
                  return U;
                case "`":
                  return I.slice(0, M);
                case "'":
                  return I.slice(nt);
                case "<":
                  dt = B[X.slice(1, -1)];
                  break;
                default:
                  var st = +X;
                  if (st === 0)
                    return z;
                  if (st > tt) {
                    var it = h(st / 10);
                    return it === 0 ? z : it <= tt ? A[it - 1] === void 0 ? X.charAt(1) : A[it - 1] + X.charAt(1) : z;
                  }
                  dt = A[st - 1];
              }
              return dt === void 0 ? "" : dt;
            });
          }
        });
      },
      aae3: function(e, i, o) {
        var a = o("d3f4"), s = o("2d95"), l = o("2b4c")("match");
        e.exports = function(u) {
          var c;
          return a(u) && ((c = u[l]) !== void 0 ? !!c : s(u) == "RegExp");
        };
      },
      ac6a: function(e, i, o) {
        for (var a = o("cadf"), s = o("0d58"), l = o("2aba"), u = o("7726"), c = o("32e9"), f = o("84f2"), p = o("2b4c"), g = p("iterator"), h = p("toStringTag"), d = f.Array, m = {
          CSSRuleList: !0,
          CSSStyleDeclaration: !1,
          CSSValueList: !1,
          ClientRectList: !1,
          DOMRectList: !1,
          DOMStringList: !1,
          DOMTokenList: !0,
          DataTransferItemList: !1,
          FileList: !1,
          HTMLAllCollection: !1,
          HTMLCollection: !1,
          HTMLFormElement: !1,
          HTMLSelectElement: !1,
          MediaList: !0,
          MimeTypeArray: !1,
          NamedNodeMap: !1,
          NodeList: !0,
          PaintRequestList: !1,
          Plugin: !1,
          PluginArray: !1,
          SVGLengthList: !1,
          SVGNumberList: !1,
          SVGPathSegList: !1,
          SVGPointList: !1,
          SVGStringList: !1,
          SVGTransformList: !1,
          SourceBufferList: !1,
          StyleSheetList: !0,
          TextTrackCueList: !1,
          TextTrackList: !1,
          TouchList: !1
        }, S = s(m), D = 0; D < S.length; D++) {
          var O = S[D], C = m[O], L = u[O], V = L && L.prototype, U;
          if (V && (V[g] || c(V, g, d), V[h] || c(V, h, O), f[O] = d, C))
            for (U in a)
              V[U] || l(V, U, a[U], !0);
        }
      },
      b0c5: function(e, i, o) {
        var a = o("520a");
        o("5ca1")({
          target: "RegExp",
          proto: !0,
          forced: a !== /./.exec
        }, {
          exec: a
        });
      },
      be13: function(e, i) {
        e.exports = function(o) {
          if (o == null)
            throw TypeError("Can't call method on  " + o);
          return o;
        };
      },
      c366: function(e, i, o) {
        var a = o("6821"), s = o("9def"), l = o("77f1");
        e.exports = function(u) {
          return function(c, f, p) {
            var g = a(c), h = s(g.length), d = l(p, h), m;
            if (u && f != f) {
              for (; h > d; )
                if (m = g[d++], m != m)
                  return !0;
            } else
              for (; h > d; d++)
                if ((u || d in g) && g[d] === f)
                  return u || d || 0;
            return !u && -1;
          };
        };
      },
      c649: function(e, i, o) {
        (function(a) {
          o.d(i, "c", function() {
            return g;
          }), o.d(i, "a", function() {
            return f;
          }), o.d(i, "b", function() {
            return l;
          }), o.d(i, "d", function() {
            return p;
          }), o("a481");
          function s() {
            return typeof window < "u" ? window.console : a.console;
          }
          var l = s();
          function u(h) {
            var d = /* @__PURE__ */ Object.create(null);
            return function(S) {
              var D = d[S];
              return D || (d[S] = h(S));
            };
          }
          var c = /-(\w)/g, f = u(function(h) {
            return h.replace(c, function(d, m) {
              return m ? m.toUpperCase() : "";
            });
          });
          function p(h) {
            h.parentElement !== null && h.parentElement.removeChild(h);
          }
          function g(h, d, m) {
            var S = m === 0 ? h.children[0] : h.children[m - 1].nextSibling;
            h.insertBefore(d, S);
          }
        }).call(this, o("c8ba"));
      },
      c69a: function(e, i, o) {
        e.exports = !o("9e1e") && !o("79e5")(function() {
          return Object.defineProperty(o("230e")("div"), "a", { get: function() {
            return 7;
          } }).a != 7;
        });
      },
      c8ba: function(e, i) {
        var o;
        o = function() {
          return this;
        }();
        try {
          o = o || new Function("return this")();
        } catch {
          typeof window == "object" && (o = window);
        }
        e.exports = o;
      },
      ca5a: function(e, i) {
        var o = 0, a = Math.random();
        e.exports = function(s) {
          return "Symbol(".concat(s === void 0 ? "" : s, ")_", (++o + a).toString(36));
        };
      },
      cadf: function(e, i, o) {
        var a = o("9c6c"), s = o("d53b"), l = o("84f2"), u = o("6821");
        e.exports = o("01f9")(Array, "Array", function(c, f) {
          this._t = u(c), this._i = 0, this._k = f;
        }, function() {
          var c = this._t, f = this._k, p = this._i++;
          return !c || p >= c.length ? (this._t = void 0, s(1)) : f == "keys" ? s(0, p) : f == "values" ? s(0, c[p]) : s(0, [p, c[p]]);
        }, "values"), l.Arguments = l.Array, a("keys"), a("values"), a("entries");
      },
      cb7c: function(e, i, o) {
        var a = o("d3f4");
        e.exports = function(s) {
          if (!a(s))
            throw TypeError(s + " is not an object!");
          return s;
        };
      },
      ce10: function(e, i, o) {
        var a = o("69a8"), s = o("6821"), l = o("c366")(!1), u = o("613b")("IE_PROTO");
        e.exports = function(c, f) {
          var p = s(c), g = 0, h = [], d;
          for (d in p)
            d != u && a(p, d) && h.push(d);
          for (; f.length > g; )
            a(p, d = f[g++]) && (~l(h, d) || h.push(d));
          return h;
        };
      },
      d2c8: function(e, i, o) {
        var a = o("aae3"), s = o("be13");
        e.exports = function(l, u, c) {
          if (a(u))
            throw TypeError("String#" + c + " doesn't accept regex!");
          return String(s(l));
        };
      },
      d3f4: function(e, i) {
        e.exports = function(o) {
          return typeof o == "object" ? o !== null : typeof o == "function";
        };
      },
      d53b: function(e, i) {
        e.exports = function(o, a) {
          return { value: a, done: !!o };
        };
      },
      d8e8: function(e, i) {
        e.exports = function(o) {
          if (typeof o != "function")
            throw TypeError(o + " is not a function!");
          return o;
        };
      },
      e11e: function(e, i) {
        e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
      },
      f559: function(e, i, o) {
        var a = o("5ca1"), s = o("9def"), l = o("d2c8"), u = "startsWith", c = ""[u];
        a(a.P + a.F * o("5147")(u), "String", {
          startsWith: function(p) {
            var g = l(this, p, u), h = s(Math.min(arguments.length > 1 ? arguments[1] : void 0, g.length)), d = String(p);
            return c ? c.call(g, d, h) : g.slice(h, h + d.length) === d;
          }
        });
      },
      f6fd: function(e, i) {
        (function(o) {
          var a = "currentScript", s = o.getElementsByTagName("script");
          a in o || Object.defineProperty(o, a, {
            get: function() {
              try {
                throw new Error();
              } catch (c) {
                var l, u = (/.*at [^\(]*\((.*):.+:.+\)$/ig.exec(c.stack) || [!1])[1];
                for (l in s)
                  if (s[l].src == u || s[l].readyState == "interactive")
                    return s[l];
                return null;
              }
            }
          });
        })(document);
      },
      f751: function(e, i, o) {
        var a = o("5ca1");
        a(a.S + a.F, "Object", { assign: o("7333") });
      },
      fa5b: function(e, i, o) {
        e.exports = o("5537")("native-function-to-string", Function.toString);
      },
      fab2: function(e, i, o) {
        var a = o("7726").document;
        e.exports = a && a.documentElement;
      },
      fb15: function(e, i, o) {
        if (o.r(i), typeof window < "u") {
          o("f6fd");
          var a;
          (a = window.document.currentScript) && (a = a.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)) && (o.p = a[1]);
        }
        o("f751"), o("f559"), o("ac6a"), o("cadf"), o("456d");
        function s(y) {
          if (Array.isArray(y))
            return y;
        }
        function l(y, v) {
          if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(y)))) {
            var b = [], E = !0, P = !1, j = void 0;
            try {
              for (var G = y[Symbol.iterator](), et; !(E = (et = G.next()).done) && (b.push(et.value), !(v && b.length === v)); E = !0)
                ;
            } catch (Dt) {
              P = !0, j = Dt;
            } finally {
              try {
                !E && G.return != null && G.return();
              } finally {
                if (P)
                  throw j;
              }
            }
            return b;
          }
        }
        function u(y, v) {
          (v == null || v > y.length) && (v = y.length);
          for (var b = 0, E = new Array(v); b < v; b++)
            E[b] = y[b];
          return E;
        }
        function c(y, v) {
          if (!!y) {
            if (typeof y == "string")
              return u(y, v);
            var b = Object.prototype.toString.call(y).slice(8, -1);
            if (b === "Object" && y.constructor && (b = y.constructor.name), b === "Map" || b === "Set")
              return Array.from(y);
            if (b === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(b))
              return u(y, v);
          }
        }
        function f() {
          throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }
        function p(y, v) {
          return s(y) || l(y, v) || c(y, v) || f();
        }
        o("6762"), o("2fdb");
        function g(y) {
          if (Array.isArray(y))
            return u(y);
        }
        function h(y) {
          if (typeof Symbol < "u" && Symbol.iterator in Object(y))
            return Array.from(y);
        }
        function d() {
          throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
        }
        function m(y) {
          return g(y) || h(y) || c(y) || d();
        }
        var S = o("a352"), D = /* @__PURE__ */ o.n(S), O = o("c649");
        function C(y, v, b) {
          return b === void 0 || (y = y || {}, y[v] = b), y;
        }
        function L(y, v) {
          return y.map(function(b) {
            return b.elm;
          }).indexOf(v);
        }
        function V(y, v, b, E) {
          if (!y)
            return [];
          var P = y.map(function(et) {
            return et.elm;
          }), j = v.length - E, G = m(v).map(function(et, Dt) {
            return Dt >= j ? P.length : P.indexOf(et);
          });
          return b ? G.filter(function(et) {
            return et !== -1;
          }) : G;
        }
        function U(y, v) {
          var b = this;
          this.$nextTick(function() {
            return b.$emit(y.toLowerCase(), v);
          });
        }
        function I(y) {
          var v = this;
          return function(b) {
            v.realList !== null && v["onDrag" + y](b), U.call(v, y, b);
          };
        }
        function M(y) {
          return ["transition-group", "TransitionGroup"].includes(y);
        }
        function A(y) {
          if (!y || y.length !== 1)
            return !1;
          var v = p(y, 1), b = v[0].componentOptions;
          return b ? M(b.tag) : !1;
        }
        function B(y, v, b) {
          return y[b] || (v[b] ? v[b]() : void 0);
        }
        function J(y, v, b) {
          var E = 0, P = 0, j = B(v, b, "header");
          j && (E = j.length, y = y ? [].concat(m(j), m(y)) : m(j));
          var G = B(v, b, "footer");
          return G && (P = G.length, y = y ? [].concat(m(y), m(G)) : m(G)), {
            children: y,
            headerOffset: E,
            footerOffset: P
          };
        }
        function nt(y, v) {
          var b = null, E = function(re, Dn) {
            b = C(b, re, Dn);
          }, P = Object.keys(y).filter(function(Dt) {
            return Dt === "id" || Dt.startsWith("data-");
          }).reduce(function(Dt, re) {
            return Dt[re] = y[re], Dt;
          }, {});
          if (E("attrs", P), !v)
            return b;
          var j = v.on, G = v.props, et = v.attrs;
          return E("on", j), E("props", G), Object.assign(b.attrs, et), b;
        }
        var tt = ["Start", "Add", "Remove", "Update", "End"], H = ["Choose", "Unchoose", "Sort", "Filter", "Clone"], z = ["Move"].concat(tt, H).map(function(y) {
          return "on" + y;
        }), X = null, dt = {
          options: Object,
          list: {
            type: Array,
            required: !1,
            default: null
          },
          value: {
            type: Array,
            required: !1,
            default: null
          },
          noTransitionOnDrag: {
            type: Boolean,
            default: !1
          },
          clone: {
            type: Function,
            default: function(v) {
              return v;
            }
          },
          element: {
            type: String,
            default: "div"
          },
          tag: {
            type: String,
            default: null
          },
          move: {
            type: Function,
            default: null
          },
          componentData: {
            type: Object,
            required: !1,
            default: null
          }
        }, st = {
          name: "draggable",
          inheritAttrs: !1,
          props: dt,
          data: function() {
            return {
              transitionMode: !1,
              noneFunctionalComponentMode: !1
            };
          },
          render: function(v) {
            var b = this.$slots.default;
            this.transitionMode = A(b);
            var E = J(b, this.$slots, this.$scopedSlots), P = E.children, j = E.headerOffset, G = E.footerOffset;
            this.headerOffset = j, this.footerOffset = G;
            var et = nt(this.$attrs, this.componentData);
            return v(this.getTag(), et, P);
          },
          created: function() {
            this.list !== null && this.value !== null && O.b.error("Value and list props are mutually exclusive! Please set one or another."), this.element !== "div" && O.b.warn("Element props is deprecated please use tag props instead. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#element-props"), this.options !== void 0 && O.b.warn("Options props is deprecated, add sortable options directly as vue.draggable item, or use v-bind. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#options-props");
          },
          mounted: function() {
            var v = this;
            if (this.noneFunctionalComponentMode = this.getTag().toLowerCase() !== this.$el.nodeName.toLowerCase() && !this.getIsFunctional(), this.noneFunctionalComponentMode && this.transitionMode)
              throw new Error("Transition-group inside component is not supported. Please alter tag value or remove transition-group. Current tag value: ".concat(this.getTag()));
            var b = {};
            tt.forEach(function(j) {
              b["on" + j] = I.call(v, j);
            }), H.forEach(function(j) {
              b["on" + j] = U.bind(v, j);
            });
            var E = Object.keys(this.$attrs).reduce(function(j, G) {
              return j[Object(O.a)(G)] = v.$attrs[G], j;
            }, {}), P = Object.assign({}, this.options, E, b, {
              onMove: function(G, et) {
                return v.onDragMove(G, et);
              }
            });
            !("draggable" in P) && (P.draggable = ">*"), this._sortable = new D.a(this.rootContainer, P), this.computeIndexes();
          },
          beforeDestroy: function() {
            this._sortable !== void 0 && this._sortable.destroy();
          },
          computed: {
            rootContainer: function() {
              return this.transitionMode ? this.$el.children[0] : this.$el;
            },
            realList: function() {
              return this.list ? this.list : this.value;
            }
          },
          watch: {
            options: {
              handler: function(v) {
                this.updateOptions(v);
              },
              deep: !0
            },
            $attrs: {
              handler: function(v) {
                this.updateOptions(v);
              },
              deep: !0
            },
            realList: function() {
              this.computeIndexes();
            }
          },
          methods: {
            getIsFunctional: function() {
              var v = this._vnode.fnOptions;
              return v && v.functional;
            },
            getTag: function() {
              return this.tag || this.element;
            },
            updateOptions: function(v) {
              for (var b in v) {
                var E = Object(O.a)(b);
                z.indexOf(E) === -1 && this._sortable.option(E, v[b]);
              }
            },
            getChildrenNodes: function() {
              if (this.noneFunctionalComponentMode)
                return this.$children[0].$slots.default;
              var v = this.$slots.default;
              return this.transitionMode ? v[0].child.$slots.default : v;
            },
            computeIndexes: function() {
              var v = this;
              this.$nextTick(function() {
                v.visibleIndexes = V(v.getChildrenNodes(), v.rootContainer.children, v.transitionMode, v.footerOffset);
              });
            },
            getUnderlyingVm: function(v) {
              var b = L(this.getChildrenNodes() || [], v);
              if (b === -1)
                return null;
              var E = this.realList[b];
              return {
                index: b,
                element: E
              };
            },
            getUnderlyingPotencialDraggableComponent: function(v) {
              var b = v.__vue__;
              return !b || !b.$options || !M(b.$options._componentTag) ? !("realList" in b) && b.$children.length === 1 && "realList" in b.$children[0] ? b.$children[0] : b : b.$parent;
            },
            emitChanges: function(v) {
              var b = this;
              this.$nextTick(function() {
                b.$emit("change", v);
              });
            },
            alterList: function(v) {
              if (this.list) {
                v(this.list);
                return;
              }
              var b = m(this.value);
              v(b), this.$emit("input", b);
            },
            spliceList: function() {
              var v = arguments, b = function(P) {
                return P.splice.apply(P, m(v));
              };
              this.alterList(b);
            },
            updatePosition: function(v, b) {
              var E = function(j) {
                return j.splice(b, 0, j.splice(v, 1)[0]);
              };
              this.alterList(E);
            },
            getRelatedContextFromMoveEvent: function(v) {
              var b = v.to, E = v.related, P = this.getUnderlyingPotencialDraggableComponent(b);
              if (!P)
                return {
                  component: P
                };
              var j = P.realList, G = {
                list: j,
                component: P
              };
              if (b !== E && j && P.getUnderlyingVm) {
                var et = P.getUnderlyingVm(E);
                if (et)
                  return Object.assign(et, G);
              }
              return G;
            },
            getVmIndex: function(v) {
              var b = this.visibleIndexes, E = b.length;
              return v > E - 1 ? E : b[v];
            },
            getComponent: function() {
              return this.$slots.default[0].componentInstance;
            },
            resetTransitionData: function(v) {
              if (!(!this.noTransitionOnDrag || !this.transitionMode)) {
                var b = this.getChildrenNodes();
                b[v].data = null;
                var E = this.getComponent();
                E.children = [], E.kept = void 0;
              }
            },
            onDragStart: function(v) {
              this.context = this.getUnderlyingVm(v.item), v.item._underlying_vm_ = this.clone(this.context.element), X = v.item;
            },
            onDragAdd: function(v) {
              var b = v.item._underlying_vm_;
              if (b !== void 0) {
                Object(O.d)(v.item);
                var E = this.getVmIndex(v.newIndex);
                this.spliceList(E, 0, b), this.computeIndexes();
                var P = {
                  element: b,
                  newIndex: E
                };
                this.emitChanges({
                  added: P
                });
              }
            },
            onDragRemove: function(v) {
              if (Object(O.c)(this.rootContainer, v.item, v.oldIndex), v.pullMode === "clone") {
                Object(O.d)(v.clone);
                return;
              }
              var b = this.context.index;
              this.spliceList(b, 1);
              var E = {
                element: this.context.element,
                oldIndex: b
              };
              this.resetTransitionData(b), this.emitChanges({
                removed: E
              });
            },
            onDragUpdate: function(v) {
              Object(O.d)(v.item), Object(O.c)(v.from, v.item, v.oldIndex);
              var b = this.context.index, E = this.getVmIndex(v.newIndex);
              this.updatePosition(b, E);
              var P = {
                element: this.context.element,
                oldIndex: b,
                newIndex: E
              };
              this.emitChanges({
                moved: P
              });
            },
            updateProperty: function(v, b) {
              v.hasOwnProperty(b) && (v[b] += this.headerOffset);
            },
            computeFutureIndex: function(v, b) {
              if (!v.element)
                return 0;
              var E = m(b.to.children).filter(function(et) {
                return et.style.display !== "none";
              }), P = E.indexOf(b.related), j = v.component.getVmIndex(P), G = E.indexOf(X) !== -1;
              return G || !b.willInsertAfter ? j : j + 1;
            },
            onDragMove: function(v, b) {
              var E = this.move;
              if (!E || !this.realList)
                return !0;
              var P = this.getRelatedContextFromMoveEvent(v), j = this.context, G = this.computeFutureIndex(P, v);
              Object.assign(j, {
                futureIndex: G
              });
              var et = Object.assign({}, v, {
                relatedContext: P,
                draggedContext: j
              });
              return E(et, b);
            },
            onDragEnd: function() {
              this.computeIndexes(), X = null;
            }
          }
        };
        typeof window < "u" && "Vue" in window && window.Vue.component("draggable", st);
        var it = st;
        i.default = it;
      }
    }).default;
  });
})(fn);
const gr = /* @__PURE__ */ Pn(fn.exports), vr = {
  name: "vue-pivottable-ui",
  mixins: [
    we
  ],
  model: {
    prop: "config",
    event: "onRefresh"
  },
  props: {
    async: {
      type: Boolean,
      default: !1
    },
    hiddenAttributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromAggregators: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    sortonlyFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    disabledFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    menuLimit: {
      type: Number,
      default: 500
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  computed: {
    appliedFilter() {
      return this.propsData.valueFilter;
    },
    rendererItems() {
      return this.renderers || Object.assign({}, We);
    },
    aggregatorItems() {
      return this.aggregators || te;
    },
    numValsAllowed() {
      return this.aggregatorItems[this.propsData.aggregatorName]([])().numInputs || 0;
    },
    rowAttrs() {
      return this.propsData.rows.filter(
        (t) => !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      );
    },
    colAttrs() {
      return this.propsData.cols.filter(
        (t) => !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      );
    },
    unusedAttrs() {
      return this.propsData.attributes.filter(
        (t) => !this.propsData.rows.includes(t) && !this.propsData.cols.includes(t) && !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      ).sort(un(this.unusedOrder));
    }
  },
  data() {
    return {
      propsData: {
        aggregatorName: "",
        rendererName: "",
        rowOrder: "key_a_to_z",
        colOrder: "key_a_to_z",
        vals: [],
        cols: [],
        rows: [],
        attributes: [],
        valueFilter: {},
        renderer: null
      },
      pivotData: [],
      openStatus: {},
      attrValues: {},
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1e3,
      openDropdown: !1,
      materializedInput: [],
      sortIcons: {
        key_a_to_z: {
          rowSymbol: "\u2195",
          colSymbol: "\u2194",
          next: "value_a_to_z"
        },
        value_a_to_z: {
          rowSymbol: "\u2193",
          colSymbol: "\u2192",
          next: "value_z_to_a"
        },
        value_z_to_a: {
          rowSymbol: "\u2191",
          colSymbol: "\u2190",
          next: "key_a_to_z"
        }
      }
    };
  },
  beforeUpdated(t) {
    this.materializeInput(t.data);
  },
  watch: {
    rowOrder: {
      handler(t) {
        this.propsData.rowOrder = t;
      }
    },
    colOrder: {
      handler(t) {
        this.propsData.colOrder = t;
      }
    },
    cols: {
      handler(t) {
        this.propsData.cols = t;
      }
    },
    rows: {
      handler(t) {
        this.propsData.rows = t;
      }
    },
    rendererName: {
      handler(t) {
        this.propsData.rendererName = t;
      }
    },
    appliedFilter: {
      handler(t, n) {
        this.$emit("update:valueFilter", t);
      },
      immediate: !0,
      deep: !0
    },
    valueFilter: {
      handler(t) {
        this.propsData.valueFilter = t;
      },
      immediate: !0,
      deep: !0
    },
    data: {
      handler(t) {
        this.init();
      },
      immediate: !0,
      deep: !0
    },
    attributes: {
      handler(t) {
        this.propsData.attributes = t.length > 0 ? t : Object.keys(this.attrValues);
      },
      deep: !0
    },
    propsData: {
      handler(t) {
        if (this.pivotData.length === 0)
          return;
        const n = {
          derivedAttributes: this.derivedAttributes,
          hiddenAttributes: this.hiddenAttributes,
          hiddenFromAggregators: this.hiddenFromAggregators,
          hiddenFromDragDrop: this.hiddenFromDragDrop,
          sortonlyFromDragDrop: this.sortonlyFromDragDrop,
          disabledFromDragDrop: this.disabledFromDragDrop,
          menuLimit: this.menuLimit,
          attributes: t.attributes,
          unusedAttrs: this.unusedAttrs,
          sorters: this.sorters,
          data: this.materializedInput,
          rowOrder: t.rowOrder,
          colOrder: t.colOrder,
          valueFilter: t.valueFilter,
          rows: t.rows,
          cols: t.cols,
          rendererName: t.rendererName,
          aggregatorName: t.aggregatorName,
          aggregators: this.aggregatorItems,
          vals: t.vals
        };
        this.$emit("onRefresh", n);
      },
      immediate: !1,
      deep: !0
    }
  },
  methods: {
    init() {
      this.materializeInput(this.data), this.propsData.vals = this.vals.slice(), this.propsData.rows = this.rows, this.propsData.cols = this.cols, this.propsData.rowOrder = this.rowOrder, this.propsData.colOrder = this.colOrder, this.propsData.rendererName = this.rendererName, this.propsData.aggregatorName = this.aggregatorName, this.propsData.attributes = this.attributes.length > 0 ? this.attributes : Object.keys(this.attrValues), this.unusedOrder = this.unusedAttrs, Object.keys(this.attrValues).forEach((t) => {
        let n = {};
        const r = this.valueFilter && this.valueFilter[t];
        r && Object.keys(r).length && (n = this.valueFilter[t]), this.updateValueFilter({
          attribute: t,
          valueFilter: n
        });
      });
    },
    assignValue(t) {
      this.$set(this.propsData.valueFilter, t, {});
    },
    propUpdater(t) {
      return (n) => {
        this.propsData[t] = n;
      };
    },
    updateValueFilter({ attribute: t, valueFilter: n }) {
      this.$set(this.propsData.valueFilter, t, n);
    },
    moveFilterBoxToTop({ attribute: t }) {
      this.maxZIndex += 1, this.zIndices[t] = this.maxZIndex + 1;
    },
    openFilterBox({ attribute: t, open: n }) {
      this.$set(this.openStatus, t, n);
    },
    closeFilterBox(t) {
      this.openStatus = {};
    },
    materializeInput(t) {
      if (this.pivotData === t)
        return;
      this.pivotData = t;
      const n = {}, r = [];
      let e = 0;
      Ot.forEachRecord(this.pivotData, this.derivedAttributes, function(i) {
        r.push(i);
        for (const o of Object.keys(i))
          o in n || (n[o] = {}, e > 0 && (n[o].null = e));
        for (const o in n) {
          const a = o in i ? i[o] : "null";
          a in n[o] || (n[o][a] = 0), n[o][a]++;
        }
        e++;
      }), this.materializedInput = r, this.attrValues = n;
    },
    makeDnDCell(t, n, r, e) {
      const i = this.$scopedSlots.pvtAttr;
      return e(
        gr,
        {
          attrs: {
            draggable: "li[data-id]",
            group: "sharted",
            ghostClass: ".pvtPlaceholder",
            filter: ".pvtFilterBox",
            preventOnFilter: !1,
            tag: "td"
          },
          props: {
            value: t
          },
          staticClass: r,
          on: {
            sort: n.bind(this)
          }
        },
        [
          t.map((o) => e(Mn, {
            scopedSlots: i ? {
              pvtAttr: (a) => e("slot", i(a))
            } : void 0,
            props: {
              sortable: this.sortonlyFromDragDrop.includes(o) || !this.disabledFromDragDrop.includes(o),
              draggable: !this.sortonlyFromDragDrop.includes(o) && !this.disabledFromDragDrop.includes(o),
              name: o,
              key: o,
              attrValues: this.attrValues[o],
              sorter: De(this.sorters, o),
              menuLimit: this.menuLimit,
              zIndex: this.zIndices[o] || this.maxZIndex,
              valueFilter: this.propsData.valueFilter[o],
              open: this.openStatus[o],
              async: this.async,
              unused: this.unusedAttrs.includes(o),
              localeStrings: this.locales[this.locale].localeStrings
            },
            domProps: {},
            on: {
              "update:filter": this.updateValueFilter,
              "moveToTop:filterbox": this.moveFilterBoxToTop,
              "open:filterbox": this.openFilterBox,
              "no:filterbox": () => this.$emit("no:filterbox")
            }
          }))
        ]
      );
    },
    rendererCell(t, n) {
      return this.$slots.rendererCell ? n("td", {
        staticClass: ["pvtRenderers pvtVals pvtText"]
      }, this.$slots.rendererCell) : n(
        "td",
        {
          staticClass: ["pvtRenderers"]
        },
        [
          n(Ce, {
            props: {
              values: Object.keys(this.rendererItems),
              value: t
            },
            on: {
              input: (r) => {
                this.propUpdater("rendererName")(r), this.propUpdater("renderer", this.rendererItems[this.rendererName]);
              }
            }
          })
        ]
      );
    },
    aggregatorCell(t, n, r) {
      return this.$slots.aggregatorCell ? r("td", {
        staticClass: ["pvtVals pvtText"]
      }, this.$slots.aggregatorCell) : r(
        "td",
        {
          staticClass: ["pvtVals"]
        },
        [
          r(
            "div",
            [
              r(Ce, {
                props: {
                  values: Object.keys(this.aggregatorItems),
                  value: t
                },
                on: {
                  input: (e) => {
                    this.propUpdater("aggregatorName")(e);
                  }
                }
              }),
              r("a", {
                staticClass: ["pvtRowOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("rowOrder")(this.sortIcons[this.propsData.rowOrder].next);
                  }
                }
              }, this.sortIcons[this.propsData.rowOrder].rowSymbol),
              r("a", {
                staticClass: ["pvtColOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("colOrder")(this.sortIcons[this.propsData.colOrder].next);
                  }
                }
              }, this.sortIcons[this.propsData.colOrder].colSymbol)
            ]
          ),
          this.numValsAllowed > 0 ? new Array(this.numValsAllowed).fill().map((e, i) => [
            r(Ce, {
              props: {
                values: Object.keys(this.attrValues).filter((o) => !this.hiddenAttributes.includes(o) && !this.hiddenFromAggregators.includes(o)),
                value: n[i]
              },
              on: {
                input: (o) => {
                  this.propsData.vals.splice(i, 1, o);
                }
              }
            })
          ]) : void 0
        ]
      );
    },
    outputCell(t, n, r) {
      return r(
        "td",
        {
          staticClass: ["pvtOutput"]
        },
        [
          r(Ke, {
            props: Object.assign(
              t,
              { tableMaxWidth: this.tableMaxWidth }
            )
          })
        ]
      );
    }
  },
  render(t) {
    if (this.data.length < 1)
      return;
    const n = this.$scopedSlots.output, r = this.$slots.output, e = this.propsData.rendererName, i = this.propsData.aggregatorName, o = this.propsData.vals, a = this.makeDnDCell(
      this.unusedAttrs,
      (d) => {
        const m = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(m) && (!d.from.classList.contains("pvtUnused") || !d.to.classList.contains("pvtUnused")) || (d.from.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: m, open: !1 }), this.unusedOrder.splice(d.oldIndex, 1), this.$emit("dragged:unused", m)), d.to.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: m, open: !1 }), this.unusedOrder.splice(d.newIndex, 0, m), this.$emit("dropped:unused", m)));
      },
      "pvtAxisContainer pvtUnused pvtHorizList",
      t
    ), s = this.makeDnDCell(
      this.colAttrs,
      (d) => {
        const m = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(m) && (!d.from.classList.contains("pvtCols") || !d.to.classList.contains("pvtCols")) || (d.from.classList.contains("pvtCols") && (this.propsData.cols.splice(d.oldIndex, 1), this.$emit("dragged:cols", m)), d.to.classList.contains("pvtCols") && (this.propsData.cols.splice(d.newIndex, 0, m), this.$emit("dropped:cols", m)));
      },
      "pvtAxisContainer pvtHorizList pvtCols",
      t
    ), l = this.makeDnDCell(
      this.rowAttrs,
      (d) => {
        const m = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(m) && (!d.from.classList.contains("pvtRows") || !d.to.classList.contains("pvtRows")) || (d.from.classList.contains("pvtRows") && (this.propsData.rows.splice(d.oldIndex, 1), this.$emit("dragged:rows", m)), d.to.classList.contains("pvtRows") && (this.propsData.rows.splice(d.newIndex, 0, m), this.$emit("dropped:rows", m)));
      },
      "pvtAxisContainer pvtVertList pvtRows",
      t
    ), u = Object.assign({}, this.$props, {
      localeStrings: this.localeStrings,
      data: this.materializedInput,
      rowOrder: this.propsData.rowOrder,
      colOrder: this.propsData.colOrder,
      valueFilter: this.propsData.valueFilter,
      rows: this.propsData.rows,
      cols: this.propsData.cols,
      aggregators: this.aggregatorItems,
      rendererName: e,
      aggregatorName: i,
      vals: o
    });
    let c = null;
    try {
      c = new Ot(u);
    } catch (d) {
      if (console && console.error(d.stack))
        return this.computeError(t);
    }
    const f = this.rendererCell(e, t), p = this.aggregatorCell(i, o, t), g = this.outputCell(u, e.indexOf("Chart") > -1, t), h = this.$slots.colGroup;
    return t(
      "table",
      {
        staticClass: ["pvtUi"]
      },
      [
        h,
        t(
          "tbody",
          {
            on: {
              click: this.closeFilterBox
            }
          },
          [
            t(
              "tr",
              [
                f,
                a
              ]
            ),
            t(
              "tr",
              [
                p,
                s
              ]
            ),
            t(
              "tr",
              [
                l,
                r ? t("td", { staticClass: "pvtOutput" }, r) : void 0,
                n && !r ? t("td", { staticClass: "pvtOutput" }, n({ pivotData: c })) : void 0,
                !r && !n ? g : void 0
              ]
            )
          ]
        )
      ]
    );
  },
  renderError(t, n) {
    return this.uiRenderError(t);
  }
}, mr = {
  aggregatorTemplates: Z,
  aggregators: te,
  derivers: An,
  locales: cn,
  naturalSort: Rt,
  numberFormat: Oe,
  getSort: De,
  sortAs: un,
  PivotData: Ot
}, br = {
  TableRenderer: We
}, Be = {
  VuePivottable: Ke,
  VuePivottableUi: vr
};
typeof window < "u" && window.Vue && window.Vue.use(Ke);
const yr = (t) => {
  for (const n in Be)
    t.component(Be[n].name, Be[n]);
};
export {
  mr as PivotUtilities,
  br as Renderer,
  Ke as VuePivottable,
  vr as VuePivottableUi,
  yr as default
};