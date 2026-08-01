/* @ds-bundle: {"format":4,"namespace":"NashvillePBSDesignSystem_8fe663","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"PatternPanel","sourcePath":"components/brand/PatternPanel.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"ShowCard","sourcePath":"components/media/ShowCard.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"3b95775253c7","components/brand/PatternPanel.jsx":"f1f48c59d284","components/core/Badge.jsx":"e925d3b84f88","components/core/Button.jsx":"4b653f3311eb","components/core/Card.jsx":"0185bb02ddbc","components/core/IconButton.jsx":"2bd11066ff17","components/core/Tag.jsx":"cec03a263438","components/forms/Checkbox.jsx":"bd4a5a102fe2","components/forms/Input.jsx":"bdfc9c5eac72","components/forms/Radio.jsx":"1052c45c03eb","components/forms/Select.jsx":"0976c0111d79","components/forms/Switch.jsx":"bb29f4482663","components/media/ShowCard.jsx":"8ee375998486","ui_kits/website/App.jsx":"d22f575563cf","ui_kits/website/BrowsePage.jsx":"a303513e3079","ui_kits/website/DetailPage.jsx":"b417f93176c8","ui_kits/website/Header.jsx":"11a82e511ff1","ui_kits/website/HomePage.jsx":"507c798e3e69","ui_kits/website/data.jsx":"6a1cf29f3ef4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NashvillePBSDesignSystem_8fe663 = window.NashvillePBSDesignSystem_8fe663 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Renders the official Nashville PBS lockups (SVG assets).
   assetPath must point at wherever the /assets/logos SVGs live for the host page. */
function Logo({
  orientation = "horizontal",
  tone = "color",
  height,
  assetPath = "assets/logos",
  style,
  alt = "Nashville PBS",
  ...props
}) {
  const O = orientation === "vertical" ? "Vertical" : "Horizontal";
  const T = tone === "white" ? "White" : "Color";
  const src = assetPath + "/NashvillePBS_Logo_" + O + "_" + T + ".svg";
  const h = height || (orientation === "vertical" ? 96 : 40);
  const hCss = typeof h === "number" || /^\d+$/.test(String(h)) ? Number(h) : h;
  return /*#__PURE__*/React.createElement("img", _extends({
    src: src,
    alt: alt,
    style: {
      height: hCss,
      width: "auto",
      display: "block",
      ...style
    }
  }, props));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/PatternPanel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const files = {
  community: "Community_Pattern_RGB_1920x1920.png",
  insight: "Insight_Pattern_RGB_1920x1920.png"
};
function PatternPanel({
  pattern = "community",
  overlay = "none",
  size = "cover",
  assetPath = "assets/patterns",
  children,
  style,
  ...props
}) {
  const src = assetPath + "/" + (files[pattern] || files.community);
  const overlays = {
    none: "none",
    brand: "linear-gradient(160deg,rgba(38,56,196,.72),rgba(10,20,90,.82))",
    deep: "linear-gradient(160deg,rgba(15,30,140,.80),rgba(10,20,90,.92))",
    scrim: "linear-gradient(0deg,rgba(10,20,90,.85),rgba(10,20,90,.15))"
  };
  const bg = overlays[overlay] === "none" ? `url(${src})` : `${overlays[overlay]}, url(${src})`;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      background: bg,
      backgroundSize: size + ", cover",
      backgroundPosition: "center",
      color: "var(--white)",
      overflow: "hidden",
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { PatternPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PatternPanel.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  brand: {
    bg: "var(--pbs-blue)",
    fg: "#fff"
  },
  navy: {
    bg: "var(--navy-blue)",
    fg: "#fff"
  },
  teal: {
    bg: "var(--teal)",
    fg: "var(--navy-blue)"
  },
  yellow: {
    bg: "var(--yellow)",
    fg: "var(--navy-blue)"
  },
  coral: {
    bg: "var(--coral)",
    fg: "var(--navy-blue)"
  },
  neutral: {
    bg: "var(--neutral-100)",
    fg: "var(--neutral-700)"
  }
};
function Badge({
  tone = "brand",
  children,
  style,
  ...props
}) {
  const t = tones[tone] || tones.brand;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: t.bg,
      color: t.fg,
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: "0.6875rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "4px 9px",
      borderRadius: "var(--radius-xs)",
      lineHeight: 1,
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    fontSize: "0.8125rem",
    padding: "8px 16px",
    gap: "6px"
  },
  md: {
    fontSize: "0.9375rem",
    padding: "11px 22px",
    gap: "8px"
  },
  lg: {
    fontSize: "1.0625rem",
    padding: "14px 28px",
    gap: "10px"
  }
};
const palette = {
  primary: {
    bg: "var(--pbs-blue)",
    fg: "var(--white)",
    border: "transparent",
    hover: "var(--medium-blue)",
    active: "var(--navy-blue)"
  },
  secondary: {
    bg: "transparent",
    fg: "var(--pbs-blue)",
    border: "var(--pbs-blue)",
    hover: "rgba(38,56,196,.08)",
    active: "rgba(38,56,196,.16)"
  },
  ghost: {
    bg: "transparent",
    fg: "var(--pbs-blue)",
    border: "transparent",
    hover: "rgba(38,56,196,.08)",
    active: "rgba(38,56,196,.16)"
  },
  inverse: {
    bg: "var(--white)",
    fg: "var(--navy-blue)",
    border: "transparent",
    hover: "#eef0fb",
    active: "#dde1f6"
  }
};
function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  as = "button",
  children,
  style,
  ...props
}) {
  const [state, setState] = React.useState("idle");
  const s = sizes[size] || sizes.md;
  const p = palette[variant] || palette.primary;
  const bg = disabled ? p.bg : state === "active" ? p.active : state === "hover" ? p.hover : p.bg;
  const Tag = as;
  const st = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    fontFamily: "var(--font-sans)",
    fontWeight: 700,
    fontSize: s.fontSize,
    lineHeight: 1,
    letterSpacing: "-0.005em",
    padding: s.padding,
    borderRadius: "var(--radius-button)",
    background: bg,
    color: p.fg,
    border: "1.5px solid " + p.border,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    width: fullWidth ? "100%" : "auto",
    transition: "background .15s ease, box-shadow .15s ease",
    boxShadow: state === "focus" ? "var(--ring-focus)" : "none",
    outline: "none",
    whiteSpace: "nowrap",
    textDecoration: "none",
    ...style
  };
  const h = disabled ? {} : {
    onMouseEnter: () => setState("hover"),
    onMouseLeave: () => setState("idle"),
    onMouseDown: () => setState("active"),
    onMouseUp: () => setState("hover"),
    onFocus: () => setState("focus"),
    onBlur: () => setState("idle")
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: st,
    disabled: as === "button" ? disabled : undefined
  }, h, props), iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flex: "none"
    }
  }, iconLeft), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flex: "none"
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  elevation = "sm",
  padded = true,
  interactive = false,
  children,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const shadow = interactive && hover ? "var(--shadow-md)" : "var(--shadow-" + elevation + ")";
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "var(--surface-card)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--border)",
      boxShadow: shadow === "var(--shadow-none)" ? "none" : shadow,
      padding: padded ? "var(--space-6)" : 0,
      overflow: "hidden",
      transform: interactive && hover ? "translateY(-2px)" : "none",
      transition: "box-shadow .18s ease, transform .18s ease",
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: 32,
  md: 40,
  lg: 48
};
const palette = {
  primary: {
    bg: "var(--pbs-blue)",
    fg: "var(--white)",
    hover: "var(--medium-blue)"
  },
  subtle: {
    bg: "var(--neutral-100)",
    fg: "var(--navy-blue)",
    hover: "var(--neutral-200)"
  },
  ghost: {
    bg: "transparent",
    fg: "var(--navy-blue)",
    hover: "var(--neutral-100)"
  },
  inverse: {
    bg: "rgba(255,255,255,.14)",
    fg: "var(--white)",
    hover: "rgba(255,255,255,.26)"
  }
};
function IconButton({
  variant = "subtle",
  size = "md",
  label,
  disabled = false,
  children,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const d = sizes[size] || sizes.md;
  const p = palette[variant] || palette.subtle;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: d,
      height: d,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? p.bg : hover ? p.hover : p.bg,
      color: p.fg,
      opacity: disabled ? 0.45 : 1,
      transition: "background .15s ease",
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  active = false,
  onRemove,
  children,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-sans)",
      fontWeight: 600,
      fontSize: "0.8125rem",
      padding: "6px 14px",
      borderRadius: "var(--radius-pill)",
      cursor: props.onClick ? "pointer" : "default",
      lineHeight: 1,
      border: "1.5px solid " + (active ? "var(--pbs-blue)" : "var(--border-strong)"),
      background: active ? "var(--pbs-blue)" : hover ? "var(--neutral-100)" : "transparent",
      color: active ? "#fff" : "var(--navy-blue)",
      transition: "all .15s ease",
      ...style
    }
  }, props), children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    style: {
      cursor: "pointer",
      opacity: 0.7,
      fontWeight: 700
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  style,
  ...props
}) {
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "0.9375rem",
      color: "var(--text-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    style: {
      width: 20,
      height: 20,
      borderRadius: "var(--radius-xs)",
      flex: "none",
      border: "1.5px solid " + (on ? "var(--pbs-blue)" : "var(--border-strong)"),
      background: on ? "var(--pbs-blue)" : "var(--white)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all .15s ease"
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), label && /*#__PURE__*/React.createElement("span", {
    onClick: toggle
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  iconLeft,
  size = "md",
  id,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const inputId = id || autoId;
  const pad = size === "lg" ? "13px 16px" : size === "sm" ? "8px 12px" : "11px 14px";
  const border = error ? "var(--coral)" : focus ? "var(--pbs-blue)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "0.8125rem",
      fontWeight: 600,
      color: "var(--navy-blue)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "var(--white)",
      border: "1.5px solid " + border,
      borderRadius: "var(--radius-sm)",
      padding: pad,
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color .15s, box-shadow .15s"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--neutral-500)",
      flex: "none"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "inherit",
      fontSize: "0.9375rem",
      color: "var(--text-body)",
      minWidth: 0
    }
  }, props))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.75rem",
      color: error ? "var(--coral)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  checked,
  name,
  value,
  onChange,
  disabled,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "0.9375rem",
      color: "var(--text-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      flex: "none",
      border: "1.5px solid " + (checked ? "var(--pbs-blue)" : "var(--border-strong)"),
      background: "var(--white)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "border-color .15s ease"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--pbs-blue)"
    }
  })), /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, props)), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  error,
  options = [],
  size = "md",
  id,
  style,
  ...props
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const selId = id || autoId;
  const pad = size === "lg" ? "13px 16px" : size === "sm" ? "8px 12px" : "11px 14px";
  const border = error ? "var(--coral)" : focus ? "var(--pbs-blue)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      fontSize: "0.8125rem",
      fontWeight: 600,
      color: "var(--navy-blue)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      appearance: "none",
      border: "1.5px solid " + border,
      background: "var(--white)",
      borderRadius: "var(--radius-sm)",
      padding: pad,
      paddingRight: 40,
      fontFamily: "inherit",
      fontSize: "0.9375rem",
      color: "var(--text-body)",
      outline: "none",
      cursor: "pointer",
      boxShadow: focus ? "var(--ring-focus)" : "none"
    }
  }, props), options.map(o => typeof o === "string" ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--neutral-500)",
      fontSize: 12
    }
  }, "\u25BE")), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.75rem",
      color: error ? "var(--coral)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled,
  style,
  ...props
}) {
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "0.9375rem",
      color: "var(--text-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": on,
    onClick: toggle,
    style: {
      width: 40,
      height: 24,
      borderRadius: 999,
      flex: "none",
      padding: 2,
      background: on ? "var(--pbs-blue)" : "var(--neutral-300)",
      transition: "background .18s ease",
      display: "inline-flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      transform: on ? "translateX(16px)" : "translateX(0)",
      transition: "transform .18s ease"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    onClick: toggle
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/media/ShowCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ShowCard({
  title,
  meta,
  badge,
  image,
  duration,
  progress,
  style,
  onClick,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: "100%",
      fontFamily: "var(--font-sans)",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "16 / 9",
      borderRadius: "var(--radius-media)",
      overflow: "hidden",
      background: image ? "#000" : "var(--gradient-brand)",
      boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-xs)",
      transition: "box-shadow .18s ease"
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      transform: hover ? "scale(1.04)" : "scale(1)",
      transition: "transform .3s ease"
    }
  }), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 10,
      left: 10,
      background: "var(--coral)",
      color: "var(--navy-blue)",
      fontSize: "0.625rem",
      fontWeight: 800,
      letterSpacing: ".06em",
      textTransform: "uppercase",
      padding: "4px 8px",
      borderRadius: "var(--radius-xs)"
    }
  }, badge), hover && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(10,20,90,.32)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "var(--white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "var(--pbs-blue)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 5v14l11-7z"
  })))), duration && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 10,
      right: 10,
      background: "rgba(10,20,90,.85)",
      color: "#fff",
      fontSize: "0.6875rem",
      fontWeight: 600,
      padding: "3px 7px",
      borderRadius: "var(--radius-xs)"
    }
  }, duration), progress != null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 4,
      background: "rgba(255,255,255,.25)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: progress + "%",
      background: "var(--coral)"
    }
  }))), title && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: "0.9375rem",
      fontWeight: 700,
      color: "var(--navy-blue)",
      lineHeight: 1.25
    }
  }, title), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      fontSize: "0.8125rem",
      color: "var(--text-muted)"
    }
  }, meta));
}
Object.assign(__ds_scope, { ShowCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/ShowCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/App.jsx
try { (() => {
/* Footer + App shell wiring the screens together. */
const {
  Logo
} = window.NashvillePBSDesignSystem_8fe663;
function Footer() {
  const cols = [['Watch', ['Shows', 'Schedule', 'Live TV', 'PBS KIDS']], ['Support', ['Donate', 'Become a Member', 'Ways to Give', 'Volunteer']], ['About', ['Our Mission', 'Press Room', 'Careers', 'Contact']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--navy-blue)',
      color: 'rgba(255,255,255,.72)',
      paddingTop: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      gap: 48,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 240px'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    orientation: "vertical",
    tone: "white",
    height: 78,
    assetPath: "../../assets/logos"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 16,
      fontSize: '.875rem',
      lineHeight: 1.55,
      maxWidth: 280
    }
  }, "Enriching Middle Tennessee by connecting our community to the wider world through the power of public media.")), cols.map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.6875rem',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: '#fff',
      marginBottom: 12
    }
  }, h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'rgba(255,255,255,.72)',
      fontSize: '.9375rem',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, i))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '40px auto 0',
      padding: '20px 24px',
      borderTop: '1px solid rgba(255,255,255,.1)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      fontSize: '.8125rem'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\\u00a9 2026 Nashville PBS (WNPT). A 501(c)(3) nonprofit."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'inherit',
      cursor: 'pointer'
    }
  }, "Privacy"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'inherit',
      cursor: 'pointer'
    }
  }, "Terms"), /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'inherit',
      cursor: 'pointer'
    }
  }, "FCC Public File"))));
}
function App() {
  const [view, setView] = React.useState('home');
  const [selected, setSelected] = React.useState(null);
  const [query, setQuery] = React.useState('');
  const open = id => {
    setSelected(id);
    setView('detail');
    window.scrollTo(0, 0);
  };
  const nav = v => {
    setView(v);
    setQuery('');
    window.scrollTo(0, 0);
  };
  const search = q => {
    setQuery(q);
    if (q) setView('browse');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    onNav: nav,
    current: view,
    onSearch: search
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1
    }
  }, view === 'home' && /*#__PURE__*/React.createElement(HomePage, {
    onOpen: open
  }), view === 'browse' && /*#__PURE__*/React.createElement(BrowsePage, {
    onOpen: open,
    query: query
  }), view === 'detail' && /*#__PURE__*/React.createElement(DetailPage, {
    id: selected,
    onOpen: open,
    onBack: () => nav('home')
  })), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/BrowsePage.jsx
try { (() => {
/* Browse page — category filters + program grid. */
const {
  ShowCard,
  Tag
} = window.NashvillePBSDesignSystem_8fe663;
function BrowsePage({
  onOpen,
  query
}) {
  const cats = ['All', 'Local', 'News', 'Nature', 'Arts', 'Kids'];
  const [cat, setCat] = React.useState('All');
  let shows = cat === 'All' ? SHOWS : SHOWS.filter(s => s.cat === cat);
  if (query) shows = shows.filter(s => s.title.toLowerCase().includes(query.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '40px 24px 64px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 6px',
      fontSize: '2.25rem',
      fontWeight: 800,
      color: 'var(--navy-blue)',
      letterSpacing: '-.02em'
    }
  }, query ? `Results for \u201c${query}\u201d` : 'Browse all programs'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 22px',
      color: 'var(--text-muted)',
      fontSize: '1rem'
    }
  }, shows.length, " program", shows.length !== 1 ? 's' : '', " \\u00b7 free to stream"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 28
    }
  }, cats.map(c => /*#__PURE__*/React.createElement(Tag, {
    key: c,
    active: cat === c,
    onClick: () => setCat(c)
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
      gap: 22
    }
  }, shows.map(s => /*#__PURE__*/React.createElement(ShowCard, {
    key: s.id,
    image: img(s.seed),
    title: s.title,
    meta: s.meta,
    badge: s.badge,
    duration: s.duration,
    progress: s.progress || undefined,
    onClick: () => onOpen(s.id)
  }))), shows.length === 0 && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      marginTop: 40
    }
  }, "No programs match your search."));
}
Object.assign(window, {
  BrowsePage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/BrowsePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/DetailPage.jsx
try { (() => {
/* Show detail — hero backdrop, synopsis, actions, episode grid. */
const {
  Button,
  Badge,
  ShowCard
} = window.NashvillePBSDesignSystem_8fe663;
function DetailPage({
  id,
  onOpen,
  onBack
}) {
  const s = findShow(id) || SHOWS[0];
  const more = SHOWS.filter(x => x.cat === s.cat && x.id !== s.id).slice(0, 4);
  const episodes = [1, 2, 3, 4].map(n => ({
    n,
    title: `Episode ${n}`,
    meta: `S${s.meta.includes('S') ? s.meta.match(/S(\d+)/)?.[1] || 1 : 1} \u00b7 E${n}`,
    seed: `${s.seed}${n}`
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 420,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: img(s.seed + 'hero'),
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(0deg,var(--navy-blue) 4%,rgba(10,20,90,.55) 55%,rgba(10,20,90,.25) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      position: 'absolute',
      top: 24,
      left: 24,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(255,255,255,.14)',
      color: '#fff',
      border: 'none',
      borderRadius: 999,
      padding: '9px 16px',
      fontFamily: 'inherit',
      fontWeight: 600,
      fontSize: '.875rem',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowL"
  }), " Back"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 12
    }
  }, s.badge && /*#__PURE__*/React.createElement(Badge, {
    tone: "coral"
  }, s.badge), /*#__PURE__*/React.createElement(Badge, {
    tone: "teal"
  }, s.cat)), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 12px',
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.03,
      letterSpacing: '-.02em',
      maxWidth: 720
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: '1.0625rem',
      lineHeight: 1.5,
      color: 'rgba(255,255,255,.88)',
      maxWidth: 620
    }
  }, s.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "play"
    })
  }, "Play"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    })
  }, "My List"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: 'rgba(255,255,255,.75)',
      fontSize: '.9375rem'
    }
  }, s.meta, " \\u00b7 ", s.duration)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 16px',
      fontSize: '1.375rem',
      fontWeight: 700,
      color: 'var(--navy-blue)'
    }
  }, "Episodes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
      gap: 22
    }
  }, episodes.map(e => /*#__PURE__*/React.createElement(ShowCard, {
    key: e.n,
    image: img(e.seed),
    title: e.title,
    meta: e.meta,
    duration: s.duration
  })))), more.length > 0 && /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      marginTop: 44,
      marginBottom: 64
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 16px',
      fontSize: '1.375rem',
      fontWeight: 700,
      color: 'var(--navy-blue)'
    }
  }, "More like this"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
      gap: 22
    }
  }, more.map(m => /*#__PURE__*/React.createElement(ShowCard, {
    key: m.id,
    image: img(m.seed),
    title: m.title,
    meta: m.meta,
    badge: m.badge,
    duration: m.duration,
    onClick: () => onOpen(m.id)
  })))));
}
Object.assign(window, {
  DetailPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/DetailPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
/* Site header — logo, primary nav, search, member actions. */
const {
  Button,
  IconButton,
  Logo
} = window.NashvillePBSDesignSystem_8fe663;
function Header({
  onNav,
  current,
  onSearch
}) {
  const links = ['Home', 'Shows', 'Schedule', 'Kids', 'Local'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--navy-blue)',
      color: '#fff',
      borderBottom: '1px solid rgba(255,255,255,.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      height: 68,
      display: 'flex',
      alignItems: 'center',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNav('home'),
    style: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    orientation: "horizontal",
    tone: "white",
    height: 30,
    assetPath: "../../assets/logos"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 6,
      marginLeft: 8
    }
  }, links.map(l => {
    const active = l === 'Home' && current === 'home' || l === 'Shows' && current === 'browse';
    return /*#__PURE__*/React.createElement("a", {
      key: l,
      onClick: () => onNav(l === 'Shows' ? 'browse' : l === 'Home' ? 'home' : 'browse'),
      style: {
        cursor: 'pointer',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: '.9375rem',
        fontWeight: 600,
        color: active ? '#fff' : 'rgba(255,255,255,.72)',
        background: active ? 'rgba(255,255,255,.12)' : 'transparent',
        textDecoration: 'none'
      }
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'rgba(255,255,255,.12)',
      borderRadius: 999,
      padding: '8px 14px',
      width: 200
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    style: {
      color: 'rgba(255,255,255,.8)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search",
    onChange: e => onSearch && onSearch(e.target.value),
    style: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#fff',
      fontFamily: 'inherit',
      fontSize: '.875rem',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement(IconButton, {
    label: "Account",
    variant: "inverse"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "sm"
  }, "Donate"))));
}
Object.assign(window, {
  Header
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomePage.jsx
try { (() => {
/* Home page — featured hero, content rows, membership band. */
const {
  Button,
  Badge,
  ShowCard,
  PatternPanel
} = window.NashvillePBSDesignSystem_8fe663;
function Row({
  title,
  shows,
  onOpen
}) {
  const ref = React.useRef(null);
  const scroll = d => ref.current && ref.current.scrollBy({
    left: d * 640,
    behavior: 'smooth'
  });
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      marginTop: 44
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: '1.375rem',
      fontWeight: 700,
      color: 'var(--navy-blue)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => scroll(-1),
    style: arrowBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevL"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => scroll(1),
    style: arrowBtn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevR"
  })))), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      display: 'grid',
      gridAutoFlow: 'column',
      gridAutoColumns: '300px',
      gap: 18,
      overflowX: 'auto',
      paddingBottom: 6,
      scrollbarWidth: 'none'
    }
  }, shows.map(s => /*#__PURE__*/React.createElement(ShowCard, {
    key: s.id,
    image: img(s.seed),
    title: s.title,
    meta: s.meta,
    badge: s.badge,
    duration: s.duration,
    progress: s.progress || undefined,
    onClick: () => onOpen(s.id)
  }))));
}
const arrowBtn = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: '#fff',
  color: 'var(--navy-blue)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};
function HomePage({
  onOpen
}) {
  const feat = findShow('masterpiece');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 460,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: img('herostage13'),
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg,rgba(10,20,90,.92) 0%,rgba(10,20,90,.72) 42%,rgba(10,20,90,.15) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '0 24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "coral"
  }, "Premieres Sunday"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '14px 0 12px',
      fontSize: '3.25rem',
      fontWeight: 800,
      lineHeight: 1.03,
      letterSpacing: '-.02em'
    }
  }, "Masterpiece: Riverside"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 22px',
      fontSize: '1.125rem',
      lineHeight: 1.5,
      color: 'rgba(255,255,255,.86)',
      maxWidth: 520
    }
  }, "A sweeping new period drama returns for its most dramatic season yet \u2014 free to stream on the PBS app."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "play"
    }),
    onClick: () => onOpen('masterpiece')
  }, "Start Watching"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    })
  }, "My List")))))), /*#__PURE__*/React.createElement(Row, {
    title: "Continue Watching",
    shows: SHOWS.filter(s => s.progress),
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Featured Programs",
    shows: [findShow('nature'), findShow('masterpiece'), findShow('antiques'), findShow('nova'), findShow('frontline')],
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(Row, {
    title: "Local & Regional",
    shows: byCat('Local'),
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement(Row, {
    title: "For Kids",
    shows: byCat('Kids').concat(findShow('nature')),
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 56
    }
  }, /*#__PURE__*/React.createElement(PatternPanel, {
    pattern: "community",
    overlay: "brand",
    assetPath: "../../assets/patterns",
    style: {
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 420px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '.6875rem',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--teal)'
    }
  }, "Support public media"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 10px',
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: '-.02em'
    }
  }, "Bring the world a little closer"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '1.0625rem',
      lineHeight: 1.5,
      color: 'rgba(255,255,255,.88)',
      maxWidth: 560
    }
  }, "Nashville PBS is a nonprofit powered by local donors. Your membership keeps trusted, educational programming free for all of Middle Tennessee.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg"
  }, "Become a Member"))))));
}
Object.assign(window, {
  HomePage,
  Row
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomePage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.jsx
try { (() => {
/* Shared demo data + tiny icon set for the Nashville PBS website UI kit. */
const ICONS = {
  search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  chevL: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  chevR: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  arrowL: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
};
const Icon = ({
  name,
  style
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: 'inline-flex',
    ...style
  },
  dangerouslySetInnerHTML: {
    __html: ICONS[name]
  }
});
const img = seed => `https://picsum.photos/seed/${seed}/640/360`;
const SHOWS = [{
  id: 'crossroads',
  title: 'Tennessee Crossroads',
  meta: 'S37 · E12 · Local',
  seed: 'nashville1',
  badge: 'New',
  duration: '27:30',
  progress: 40,
  cat: 'Local',
  desc: 'Explore the people, places, food and craft that make Middle Tennessee one of a kind — a viewer favorite for more than three decades.'
}, {
  id: 'nature',
  title: 'Nature: Sky Migrations',
  meta: 'Documentary · 54 min',
  seed: 'birds2',
  duration: '54:00',
  progress: 0,
  cat: 'Nature',
  desc: 'Follow the epic seasonal journeys of North America\u2019s migratory birds across breathtaking landscapes.'
}, {
  id: 'gardener',
  title: 'Volunteer Gardener',
  meta: 'S31 · E4 · Local',
  seed: 'garden3',
  duration: '26:15',
  progress: 0,
  cat: 'Local',
  desc: 'Tennessee\u2019s gardening experts share hands-on tips for the home grower, season after season.'
}, {
  id: 'newshour',
  title: 'PBS News Hour',
  meta: 'Tonight · News',
  seed: 'news4',
  badge: 'Live',
  duration: '56:40',
  progress: 0,
  cat: 'News',
  desc: 'In-depth reporting and analysis of the day\u2019s national and world headlines.'
}, {
  id: 'antiques',
  title: 'Antiques Roadshow',
  meta: 'S29 · E7',
  seed: 'antique5',
  duration: '52:10',
  progress: 70,
  cat: 'Arts',
  desc: 'Appraisers reveal the hidden stories \u2014 and surprising values \u2014 behind treasured heirlooms.'
}, {
  id: 'frontline',
  title: 'Frontline',
  meta: 'Documentary · 84 min',
  seed: 'doc6',
  duration: '1:24:00',
  progress: 0,
  cat: 'News',
  desc: 'Investigative journalism that gives voice to those affected by the day\u2019s biggest stories.'
}, {
  id: 'nova',
  title: 'NOVA: Rivers of Life',
  meta: 'Science · 53 min',
  seed: 'river7',
  duration: '53:00',
  progress: 0,
  cat: 'Nature',
  desc: 'Journey down the world\u2019s greatest rivers and the ecosystems and cultures they sustain.'
}, {
  id: 'masterpiece',
  title: 'Masterpiece: Riverside',
  meta: 'S3 · E1 · Drama',
  seed: 'drama8',
  badge: 'Premieres Sun',
  duration: '58:20',
  progress: 0,
  cat: 'Arts',
  desc: 'A sweeping new period drama returns for its most dramatic season yet.'
}, {
  id: 'kids-cat',
  title: 'Curious Creatures',
  meta: 'PBS KIDS · Ages 4-8',
  seed: 'kids9',
  duration: '24:00',
  progress: 0,
  cat: 'Kids',
  desc: 'Playful science adventures that spark curiosity in young minds.'
}, {
  id: 'kids-read',
  title: 'Story Time Studio',
  meta: 'PBS KIDS · Ages 3-6',
  seed: 'kids10',
  duration: '22:30',
  progress: 0,
  cat: 'Kids',
  desc: 'Beloved stories come to life to build a lifelong love of reading.'
}, {
  id: 'music',
  title: 'Bluegrass Underground',
  meta: 'Music · 55 min',
  seed: 'music11',
  duration: '55:00',
  progress: 0,
  cat: 'Arts',
  desc: 'Live performances from the heart of Tennessee\u2019s roots-music scene.'
}, {
  id: 'history',
  title: 'Tennessee: The Story',
  meta: 'History · 3 parts',
  seed: 'history12',
  duration: '1:02:00',
  progress: 15,
  cat: 'Local',
  desc: 'A landmark local production tracing the people and events that shaped our state.'
}];
const byCat = c => SHOWS.filter(s => s.cat === c);
const findShow = id => SHOWS.find(s => s.id === id);
Object.assign(window, {
  ICONS,
  Icon,
  img,
  SHOWS,
  byCat,
  findShow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.PatternPanel = __ds_scope.PatternPanel;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.ShowCard = __ds_scope.ShowCard;

})();
