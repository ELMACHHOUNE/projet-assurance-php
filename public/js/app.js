/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ "./node_modules/animejs/lib/anime.js":
      /*!*******************************************!*\
  !*** ./node_modules/animejs/lib/anime.js ***!
  \*******************************************/
      /***/ (module) => {
        "use strict";
        /*
         * anime.js v3.2.1
         * (c) 2020 Julian Garnier
         * Released under the MIT license
         * animejs.com
         */

        // Defaults

        var defaultInstanceSettings = {
          update: null,
          begin: null,
          loopBegin: null,
          changeBegin: null,
          change: null,
          changeComplete: null,
          loopComplete: null,
          complete: null,
          loop: 1,
          direction: "normal",
          autoplay: true,
          timelineOffset: 0,
        };

        var defaultTweenSettings = {
          duration: 1000,
          delay: 0,
          endDelay: 0,
          easing: "easeOutElastic(1, .5)",
          round: 0,
        };

        var validTransforms = [
          "translateX",
          "translateY",
          "translateZ",
          "rotate",
          "rotateX",
          "rotateY",
          "rotateZ",
          "scale",
          "scaleX",
          "scaleY",
          "scaleZ",
          "skew",
          "skewX",
          "skewY",
          "perspective",
          "matrix",
          "matrix3d",
        ];

        // Caching

        var cache = {
          CSS: {},
          springs: {},
        };

        // Utils

        function minMax(val, min, max) {
          return Math.min(Math.max(val, min), max);
        }

        function stringContains(str, text) {
          return str.indexOf(text) > -1;
        }

        function applyArguments(func, args) {
          return func.apply(null, args);
        }

        var is = {
          arr: function (a) {
            return Array.isArray(a);
          },
          obj: function (a) {
            return stringContains(Object.prototype.toString.call(a), "Object");
          },
          pth: function (a) {
            return is.obj(a) && a.hasOwnProperty("totalLength");
          },
          svg: function (a) {
            return a instanceof SVGElement;
          },
          inp: function (a) {
            return a instanceof HTMLInputElement;
          },
          dom: function (a) {
            return a.nodeType || is.svg(a);
          },
          str: function (a) {
            return typeof a === "string";
          },
          fnc: function (a) {
            return typeof a === "function";
          },
          und: function (a) {
            return typeof a === "undefined";
          },
          nil: function (a) {
            return is.und(a) || a === null;
          },
          hex: function (a) {
            return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
          },
          rgb: function (a) {
            return /^rgb/.test(a);
          },
          hsl: function (a) {
            return /^hsl/.test(a);
          },
          col: function (a) {
            return is.hex(a) || is.rgb(a) || is.hsl(a);
          },
          key: function (a) {
            return (
              !defaultInstanceSettings.hasOwnProperty(a) &&
              !defaultTweenSettings.hasOwnProperty(a) &&
              a !== "targets" &&
              a !== "keyframes"
            );
          },
        };

        // Easings

        function parseEasingParameters(string) {
          var match = /\(([^)]+)\)/.exec(string);
          return match
            ? match[1].split(",").map(function (p) {
                return parseFloat(p);
              })
            : [];
        }

        // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

        function spring(string, duration) {
          var params = parseEasingParameters(string);
          var mass = minMax(is.und(params[0]) ? 1 : params[0], 0.1, 100);
          var stiffness = minMax(is.und(params[1]) ? 100 : params[1], 0.1, 100);
          var damping = minMax(is.und(params[2]) ? 10 : params[2], 0.1, 100);
          var velocity = minMax(is.und(params[3]) ? 0 : params[3], 0.1, 100);
          var w0 = Math.sqrt(stiffness / mass);
          var zeta = damping / (2 * Math.sqrt(stiffness * mass));
          var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
          var a = 1;
          var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

          function solver(t) {
            var progress = duration ? (duration * t) / 1000 : t;
            if (zeta < 1) {
              progress =
                Math.exp(-progress * zeta * w0) *
                (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
            } else {
              progress = (a + b * progress) * Math.exp(-progress * w0);
            }
            if (t === 0 || t === 1) {
              return t;
            }
            return 1 - progress;
          }

          function getDuration() {
            var cached = cache.springs[string];
            if (cached) {
              return cached;
            }
            var frame = 1 / 6;
            var elapsed = 0;
            var rest = 0;
            while (true) {
              elapsed += frame;
              if (solver(elapsed) === 1) {
                rest++;
                if (rest >= 16) {
                  break;
                }
              } else {
                rest = 0;
              }
            }
            var duration = elapsed * frame * 1000;
            cache.springs[string] = duration;
            return duration;
          }

          return duration ? solver : getDuration;
        }

        // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

        function steps(steps) {
          if (steps === void 0) steps = 10;

          return function (t) {
            return Math.ceil(minMax(t, 0.000001, 1) * steps) * (1 / steps);
          };
        }

        // BezierEasing https://github.com/gre/bezier-easing

        var bezier = (function () {
          var kSplineTableSize = 11;
          var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

          function A(aA1, aA2) {
            return 1.0 - 3.0 * aA2 + 3.0 * aA1;
          }
          function B(aA1, aA2) {
            return 3.0 * aA2 - 6.0 * aA1;
          }
          function C(aA1) {
            return 3.0 * aA1;
          }

          function calcBezier(aT, aA1, aA2) {
            return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
          }
          function getSlope(aT, aA1, aA2) {
            return (
              3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1)
            );
          }

          function binarySubdivide(aX, aA, aB, mX1, mX2) {
            var currentX,
              currentT,
              i = 0;
            do {
              currentT = aA + (aB - aA) / 2.0;
              currentX = calcBezier(currentT, mX1, mX2) - aX;
              if (currentX > 0.0) {
                aB = currentT;
              } else {
                aA = currentT;
              }
            } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
            return currentT;
          }

          function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
            for (var i = 0; i < 4; ++i) {
              var currentSlope = getSlope(aGuessT, mX1, mX2);
              if (currentSlope === 0.0) {
                return aGuessT;
              }
              var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
              aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
          }

          function bezier(mX1, mY1, mX2, mY2) {
            if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
              return;
            }
            var sampleValues = new Float32Array(kSplineTableSize);

            if (mX1 !== mY1 || mX2 !== mY2) {
              for (var i = 0; i < kSplineTableSize; ++i) {
                sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
              }
            }

            function getTForX(aX) {
              var intervalStart = 0;
              var currentSample = 1;
              var lastSample = kSplineTableSize - 1;

              for (
                ;
                currentSample !== lastSample &&
                sampleValues[currentSample] <= aX;
                ++currentSample
              ) {
                intervalStart += kSampleStepSize;
              }

              --currentSample;

              var dist =
                (aX - sampleValues[currentSample]) /
                (sampleValues[currentSample + 1] - sampleValues[currentSample]);
              var guessForT = intervalStart + dist * kSampleStepSize;
              var initialSlope = getSlope(guessForT, mX1, mX2);

              if (initialSlope >= 0.001) {
                return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
              } else if (initialSlope === 0.0) {
                return guessForT;
              } else {
                return binarySubdivide(
                  aX,
                  intervalStart,
                  intervalStart + kSampleStepSize,
                  mX1,
                  mX2
                );
              }
            }

            return function (x) {
              if (mX1 === mY1 && mX2 === mY2) {
                return x;
              }
              if (x === 0 || x === 1) {
                return x;
              }
              return calcBezier(getTForX(x), mY1, mY2);
            };
          }

          return bezier;
        })();

        var penner = (function () {
          // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

          var eases = {
            linear: function () {
              return function (t) {
                return t;
              };
            },
          };

          var functionEasings = {
            Sine: function () {
              return function (t) {
                return 1 - Math.cos((t * Math.PI) / 2);
              };
            },
            Circ: function () {
              return function (t) {
                return 1 - Math.sqrt(1 - t * t);
              };
            },
            Back: function () {
              return function (t) {
                return t * t * (3 * t - 2);
              };
            },
            Bounce: function () {
              return function (t) {
                var pow2,
                  b = 4;
                while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
                return (
                  1 / Math.pow(4, 3 - b) -
                  7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2)
                );
              };
            },
            Elastic: function (amplitude, period) {
              if (amplitude === void 0) amplitude = 1;
              if (period === void 0) period = 0.5;

              var a = minMax(amplitude, 1, 10);
              var p = minMax(period, 0.1, 2);
              return function (t) {
                return t === 0 || t === 1
                  ? t
                  : -a *
                      Math.pow(2, 10 * (t - 1)) *
                      Math.sin(
                        ((t - 1 - (p / (Math.PI * 2)) * Math.asin(1 / a)) *
                          (Math.PI * 2)) /
                          p
                      );
              };
            },
          };

          var baseEasings = ["Quad", "Cubic", "Quart", "Quint", "Expo"];

          baseEasings.forEach(function (name, i) {
            functionEasings[name] = function () {
              return function (t) {
                return Math.pow(t, i + 2);
              };
            };
          });

          Object.keys(functionEasings).forEach(function (name) {
            var easeIn = functionEasings[name];
            eases["easeIn" + name] = easeIn;
            eases["easeOut" + name] = function (a, b) {
              return function (t) {
                return 1 - easeIn(a, b)(1 - t);
              };
            };
            eases["easeInOut" + name] = function (a, b) {
              return function (t) {
                return t < 0.5
                  ? easeIn(a, b)(t * 2) / 2
                  : 1 - easeIn(a, b)(t * -2 + 2) / 2;
              };
            };
            eases["easeOutIn" + name] = function (a, b) {
              return function (t) {
                return t < 0.5
                  ? (1 - easeIn(a, b)(1 - t * 2)) / 2
                  : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
              };
            };
          });

          return eases;
        })();

        function parseEasings(easing, duration) {
          if (is.fnc(easing)) {
            return easing;
          }
          var name = easing.split("(")[0];
          var ease = penner[name];
          var args = parseEasingParameters(easing);
          switch (name) {
            case "spring":
              return spring(easing, duration);
            case "cubicBezier":
              return applyArguments(bezier, args);
            case "steps":
              return applyArguments(steps, args);
            default:
              return applyArguments(ease, args);
          }
        }

        // Strings

        function selectString(str) {
          try {
            var nodes = document.querySelectorAll(str);
            return nodes;
          } catch (e) {
            return;
          }
        }

        // Arrays

        function filterArray(arr, callback) {
          var len = arr.length;
          var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
          var result = [];
          for (var i = 0; i < len; i++) {
            if (i in arr) {
              var val = arr[i];
              if (callback.call(thisArg, val, i, arr)) {
                result.push(val);
              }
            }
          }
          return result;
        }

        function flattenArray(arr) {
          return arr.reduce(function (a, b) {
            return a.concat(is.arr(b) ? flattenArray(b) : b);
          }, []);
        }

        function toArray(o) {
          if (is.arr(o)) {
            return o;
          }
          if (is.str(o)) {
            o = selectString(o) || o;
          }
          if (o instanceof NodeList || o instanceof HTMLCollection) {
            return [].slice.call(o);
          }
          return [o];
        }

        function arrayContains(arr, val) {
          return arr.some(function (a) {
            return a === val;
          });
        }

        // Objects

        function cloneObject(o) {
          var clone = {};
          for (var p in o) {
            clone[p] = o[p];
          }
          return clone;
        }

        function replaceObjectProps(o1, o2) {
          var o = cloneObject(o1);
          for (var p in o1) {
            o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
          }
          return o;
        }

        function mergeObjects(o1, o2) {
          var o = cloneObject(o1);
          for (var p in o2) {
            o[p] = is.und(o1[p]) ? o2[p] : o1[p];
          }
          return o;
        }

        // Colors

        function rgbToRgba(rgbValue) {
          var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
          return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
        }

        function hexToRgba(hexValue) {
          var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
          var hex = hexValue.replace(rgx, function (m, r, g, b) {
            return r + r + g + g + b + b;
          });
          var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          var r = parseInt(rgb[1], 16);
          var g = parseInt(rgb[2], 16);
          var b = parseInt(rgb[3], 16);
          return "rgba(" + r + "," + g + "," + b + ",1)";
        }

        function hslToRgba(hslValue) {
          var hsl =
            /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) ||
            /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(
              hslValue
            );
          var h = parseInt(hsl[1], 10) / 360;
          var s = parseInt(hsl[2], 10) / 100;
          var l = parseInt(hsl[3], 10) / 100;
          var a = hsl[4] || 1;
          function hue2rgb(p, q, t) {
            if (t < 0) {
              t += 1;
            }
            if (t > 1) {
              t -= 1;
            }
            if (t < 1 / 6) {
              return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
              return q;
            }
            if (t < 2 / 3) {
              return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
          }
          var r, g, b;
          if (s == 0) {
            r = g = b = l;
          } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
          }
          return (
            "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")"
          );
        }

        function colorToRgb(val) {
          if (is.rgb(val)) {
            return rgbToRgba(val);
          }
          if (is.hex(val)) {
            return hexToRgba(val);
          }
          if (is.hsl(val)) {
            return hslToRgba(val);
          }
        }

        // Units

        function getUnit(val) {
          var split =
            /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(
              val
            );
          if (split) {
            return split[1];
          }
        }

        function getTransformUnit(propName) {
          if (
            stringContains(propName, "translate") ||
            propName === "perspective"
          ) {
            return "px";
          }
          if (
            stringContains(propName, "rotate") ||
            stringContains(propName, "skew")
          ) {
            return "deg";
          }
        }

        // Values

        function getFunctionValue(val, animatable) {
          if (!is.fnc(val)) {
            return val;
          }
          return val(animatable.target, animatable.id, animatable.total);
        }

        function getAttribute(el, prop) {
          return el.getAttribute(prop);
        }

        function convertPxToUnit(el, value, unit) {
          var valueUnit = getUnit(value);
          if (arrayContains([unit, "deg", "rad", "turn"], valueUnit)) {
            return value;
          }
          var cached = cache.CSS[value + unit];
          if (!is.und(cached)) {
            return cached;
          }
          var baseline = 100;
          var tempEl = document.createElement(el.tagName);
          var parentEl =
            el.parentNode && el.parentNode !== document
              ? el.parentNode
              : document.body;
          parentEl.appendChild(tempEl);
          tempEl.style.position = "absolute";
          tempEl.style.width = baseline + unit;
          var factor = baseline / tempEl.offsetWidth;
          parentEl.removeChild(tempEl);
          var convertedUnit = factor * parseFloat(value);
          cache.CSS[value + unit] = convertedUnit;
          return convertedUnit;
        }

        function getCSSValue(el, prop, unit) {
          if (prop in el.style) {
            var uppercasePropName = prop
              .replace(/([a-z])([A-Z])/g, "$1-$2")
              .toLowerCase();
            var value =
              el.style[prop] ||
              getComputedStyle(el).getPropertyValue(uppercasePropName) ||
              "0";
            return unit ? convertPxToUnit(el, value, unit) : value;
          }
        }

        function getAnimationType(el, prop) {
          if (
            is.dom(el) &&
            !is.inp(el) &&
            (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))
          ) {
            return "attribute";
          }
          if (is.dom(el) && arrayContains(validTransforms, prop)) {
            return "transform";
          }
          if (is.dom(el) && prop !== "transform" && getCSSValue(el, prop)) {
            return "css";
          }
          if (el[prop] != null) {
            return "object";
          }
        }

        function getElementTransforms(el) {
          if (!is.dom(el)) {
            return;
          }
          var str = el.style.transform || "";
          var reg = /(\w+)\(([^)]*)\)/g;
          var transforms = new Map();
          var m;
          while ((m = reg.exec(str))) {
            transforms.set(m[1], m[2]);
          }
          return transforms;
        }

        function getTransformValue(el, propName, animatable, unit) {
          var defaultVal = stringContains(propName, "scale")
            ? 1
            : 0 + getTransformUnit(propName);
          var value = getElementTransforms(el).get(propName) || defaultVal;
          if (animatable) {
            animatable.transforms.list.set(propName, value);
            animatable.transforms["last"] = propName;
          }
          return unit ? convertPxToUnit(el, value, unit) : value;
        }

        function getOriginalTargetValue(target, propName, unit, animatable) {
          switch (getAnimationType(target, propName)) {
            case "transform":
              return getTransformValue(target, propName, animatable, unit);
            case "css":
              return getCSSValue(target, propName, unit);
            case "attribute":
              return getAttribute(target, propName);
            default:
              return target[propName] || 0;
          }
        }

        function getRelativeValue(to, from) {
          var operator = /^(\*=|\+=|-=)/.exec(to);
          if (!operator) {
            return to;
          }
          var u = getUnit(to) || 0;
          var x = parseFloat(from);
          var y = parseFloat(to.replace(operator[0], ""));
          switch (operator[0][0]) {
            case "+":
              return x + y + u;
            case "-":
              return x - y + u;
            case "*":
              return x * y + u;
          }
        }

        function validateValue(val, unit) {
          if (is.col(val)) {
            return colorToRgb(val);
          }
          if (/\s/g.test(val)) {
            return val;
          }
          var originalUnit = getUnit(val);
          var unitLess = originalUnit
            ? val.substr(0, val.length - originalUnit.length)
            : val;
          if (unit) {
            return unitLess + unit;
          }
          return unitLess;
        }

        // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
        // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

        function getDistance(p1, p2) {
          return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        }

        function getCircleLength(el) {
          return Math.PI * 2 * getAttribute(el, "r");
        }

        function getRectLength(el) {
          return getAttribute(el, "width") * 2 + getAttribute(el, "height") * 2;
        }

        function getLineLength(el) {
          return getDistance(
            { x: getAttribute(el, "x1"), y: getAttribute(el, "y1") },
            { x: getAttribute(el, "x2"), y: getAttribute(el, "y2") }
          );
        }

        function getPolylineLength(el) {
          var points = el.points;
          var totalLength = 0;
          var previousPos;
          for (var i = 0; i < points.numberOfItems; i++) {
            var currentPos = points.getItem(i);
            if (i > 0) {
              totalLength += getDistance(previousPos, currentPos);
            }
            previousPos = currentPos;
          }
          return totalLength;
        }

        function getPolygonLength(el) {
          var points = el.points;
          return (
            getPolylineLength(el) +
            getDistance(
              points.getItem(points.numberOfItems - 1),
              points.getItem(0)
            )
          );
        }

        // Path animation

        function getTotalLength(el) {
          if (el.getTotalLength) {
            return el.getTotalLength();
          }
          switch (el.tagName.toLowerCase()) {
            case "circle":
              return getCircleLength(el);
            case "rect":
              return getRectLength(el);
            case "line":
              return getLineLength(el);
            case "polyline":
              return getPolylineLength(el);
            case "polygon":
              return getPolygonLength(el);
          }
        }

        function setDashoffset(el) {
          var pathLength = getTotalLength(el);
          el.setAttribute("stroke-dasharray", pathLength);
          return pathLength;
        }

        // Motion path

        function getParentSvgEl(el) {
          var parentEl = el.parentNode;
          while (is.svg(parentEl)) {
            if (!is.svg(parentEl.parentNode)) {
              break;
            }
            parentEl = parentEl.parentNode;
          }
          return parentEl;
        }

        function getParentSvg(pathEl, svgData) {
          var svg = svgData || {};
          var parentSvgEl = svg.el || getParentSvgEl(pathEl);
          var rect = parentSvgEl.getBoundingClientRect();
          var viewBoxAttr = getAttribute(parentSvgEl, "viewBox");
          var width = rect.width;
          var height = rect.height;
          var viewBox =
            svg.viewBox ||
            (viewBoxAttr ? viewBoxAttr.split(" ") : [0, 0, width, height]);
          return {
            el: parentSvgEl,
            viewBox: viewBox,
            x: viewBox[0] / 1,
            y: viewBox[1] / 1,
            w: width,
            h: height,
            vW: viewBox[2],
            vH: viewBox[3],
          };
        }

        function getPath(path, percent) {
          var pathEl = is.str(path) ? selectString(path)[0] : path;
          var p = percent || 100;
          return function (property) {
            return {
              property: property,
              el: pathEl,
              svg: getParentSvg(pathEl),
              totalLength: getTotalLength(pathEl) * (p / 100),
            };
          };
        }

        function getPathProgress(path, progress, isPathTargetInsideSVG) {
          function point(offset) {
            if (offset === void 0) offset = 0;

            var l = progress + offset >= 1 ? progress + offset : 0;
            return path.el.getPointAtLength(l);
          }
          var svg = getParentSvg(path.el, path.svg);
          var p = point();
          var p0 = point(-1);
          var p1 = point(+1);
          var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
          var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
          switch (path.property) {
            case "x":
              return (p.x - svg.x) * scaleX;
            case "y":
              return (p.y - svg.y) * scaleY;
            case "angle":
              return (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
          }
        }

        // Decompose value

        function decomposeValue(val, unit) {
          // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
          // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
          var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
          var value =
            validateValue(is.pth(val) ? val.totalLength : val, unit) + "";
          return {
            original: value,
            numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
            strings: is.str(val) || unit ? value.split(rgx) : [],
          };
        }

        // Animatables

        function parseTargets(targets) {
          var targetsArray = targets
            ? flattenArray(
                is.arr(targets) ? targets.map(toArray) : toArray(targets)
              )
            : [];
          return filterArray(targetsArray, function (item, pos, self) {
            return self.indexOf(item) === pos;
          });
        }

        function getAnimatables(targets) {
          var parsed = parseTargets(targets);
          return parsed.map(function (t, i) {
            return {
              target: t,
              id: i,
              total: parsed.length,
              transforms: { list: getElementTransforms(t) },
            };
          });
        }

        // Properties

        function normalizePropertyTweens(prop, tweenSettings) {
          var settings = cloneObject(tweenSettings);
          // Override duration if easing is a spring
          if (/^spring/.test(settings.easing)) {
            settings.duration = spring(settings.easing);
          }
          if (is.arr(prop)) {
            var l = prop.length;
            var isFromTo = l === 2 && !is.obj(prop[0]);
            if (!isFromTo) {
              // Duration divided by the number of tweens
              if (!is.fnc(tweenSettings.duration)) {
                settings.duration = tweenSettings.duration / l;
              }
            } else {
              // Transform [from, to] values shorthand to a valid tween value
              prop = { value: prop };
            }
          }
          var propArray = is.arr(prop) ? prop : [prop];
          return propArray
            .map(function (v, i) {
              var obj = is.obj(v) && !is.pth(v) ? v : { value: v };
              // Default delay value should only be applied to the first tween
              if (is.und(obj.delay)) {
                obj.delay = !i ? tweenSettings.delay : 0;
              }
              // Default endDelay value should only be applied to the last tween
              if (is.und(obj.endDelay)) {
                obj.endDelay =
                  i === propArray.length - 1 ? tweenSettings.endDelay : 0;
              }
              return obj;
            })
            .map(function (k) {
              return mergeObjects(k, settings);
            });
        }

        function flattenKeyframes(keyframes) {
          var propertyNames = filterArray(
            flattenArray(
              keyframes.map(function (key) {
                return Object.keys(key);
              })
            ),
            function (p) {
              return is.key(p);
            }
          ).reduce(function (a, b) {
            if (a.indexOf(b) < 0) {
              a.push(b);
            }
            return a;
          }, []);
          var properties = {};
          var loop = function (i) {
            var propName = propertyNames[i];
            properties[propName] = keyframes.map(function (key) {
              var newKey = {};
              for (var p in key) {
                if (is.key(p)) {
                  if (p == propName) {
                    newKey.value = key[p];
                  }
                } else {
                  newKey[p] = key[p];
                }
              }
              return newKey;
            });
          };

          for (var i = 0; i < propertyNames.length; i++) loop(i);
          return properties;
        }

        function getProperties(tweenSettings, params) {
          var properties = [];
          var keyframes = params.keyframes;
          if (keyframes) {
            params = mergeObjects(flattenKeyframes(keyframes), params);
          }
          for (var p in params) {
            if (is.key(p)) {
              properties.push({
                name: p,
                tweens: normalizePropertyTweens(params[p], tweenSettings),
              });
            }
          }
          return properties;
        }

        // Tweens

        function normalizeTweenValues(tween, animatable) {
          var t = {};
          for (var p in tween) {
            var value = getFunctionValue(tween[p], animatable);
            if (is.arr(value)) {
              value = value.map(function (v) {
                return getFunctionValue(v, animatable);
              });
              if (value.length === 1) {
                value = value[0];
              }
            }
            t[p] = value;
          }
          t.duration = parseFloat(t.duration);
          t.delay = parseFloat(t.delay);
          return t;
        }

        function normalizeTweens(prop, animatable) {
          var previousTween;
          return prop.tweens.map(function (t) {
            var tween = normalizeTweenValues(t, animatable);
            var tweenValue = tween.value;
            var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
            var toUnit = getUnit(to);
            var originalValue = getOriginalTargetValue(
              animatable.target,
              prop.name,
              toUnit,
              animatable
            );
            var previousValue = previousTween
              ? previousTween.to.original
              : originalValue;
            var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
            var fromUnit = getUnit(from) || getUnit(originalValue);
            var unit = toUnit || fromUnit;
            if (is.und(to)) {
              to = previousValue;
            }
            tween.from = decomposeValue(from, unit);
            tween.to = decomposeValue(getRelativeValue(to, from), unit);
            tween.start = previousTween ? previousTween.end : 0;
            tween.end =
              tween.start + tween.delay + tween.duration + tween.endDelay;
            tween.easing = parseEasings(tween.easing, tween.duration);
            tween.isPath = is.pth(tweenValue);
            tween.isPathTargetInsideSVG =
              tween.isPath && is.svg(animatable.target);
            tween.isColor = is.col(tween.from.original);
            if (tween.isColor) {
              tween.round = 1;
            }
            previousTween = tween;
            return tween;
          });
        }

        // Tween progress

        var setProgressValue = {
          css: function (t, p, v) {
            return (t.style[p] = v);
          },
          attribute: function (t, p, v) {
            return t.setAttribute(p, v);
          },
          object: function (t, p, v) {
            return (t[p] = v);
          },
          transform: function (t, p, v, transforms, manual) {
            transforms.list.set(p, v);
            if (p === transforms.last || manual) {
              var str = "";
              transforms.list.forEach(function (value, prop) {
                str += prop + "(" + value + ") ";
              });
              t.style.transform = str;
            }
          },
        };

        // Set Value helper

        function setTargetsValue(targets, properties) {
          var animatables = getAnimatables(targets);
          animatables.forEach(function (animatable) {
            for (var property in properties) {
              var value = getFunctionValue(properties[property], animatable);
              var target = animatable.target;
              var valueUnit = getUnit(value);
              var originalValue = getOriginalTargetValue(
                target,
                property,
                valueUnit,
                animatable
              );
              var unit = valueUnit || getUnit(originalValue);
              var to = getRelativeValue(
                validateValue(value, unit),
                originalValue
              );
              var animType = getAnimationType(target, property);
              setProgressValue[animType](
                target,
                property,
                to,
                animatable.transforms,
                true
              );
            }
          });
        }

        // Animations

        function createAnimation(animatable, prop) {
          var animType = getAnimationType(animatable.target, prop.name);
          if (animType) {
            var tweens = normalizeTweens(prop, animatable);
            var lastTween = tweens[tweens.length - 1];
            return {
              type: animType,
              property: prop.name,
              animatable: animatable,
              tweens: tweens,
              duration: lastTween.end,
              delay: tweens[0].delay,
              endDelay: lastTween.endDelay,
            };
          }
        }

        function getAnimations(animatables, properties) {
          return filterArray(
            flattenArray(
              animatables.map(function (animatable) {
                return properties.map(function (prop) {
                  return createAnimation(animatable, prop);
                });
              })
            ),
            function (a) {
              return !is.und(a);
            }
          );
        }

        // Create Instance

        function getInstanceTimings(animations, tweenSettings) {
          var animLength = animations.length;
          var getTlOffset = function (anim) {
            return anim.timelineOffset ? anim.timelineOffset : 0;
          };
          var timings = {};
          timings.duration = animLength
            ? Math.max.apply(
                Math,
                animations.map(function (anim) {
                  return getTlOffset(anim) + anim.duration;
                })
              )
            : tweenSettings.duration;
          timings.delay = animLength
            ? Math.min.apply(
                Math,
                animations.map(function (anim) {
                  return getTlOffset(anim) + anim.delay;
                })
              )
            : tweenSettings.delay;
          timings.endDelay = animLength
            ? timings.duration -
              Math.max.apply(
                Math,
                animations.map(function (anim) {
                  return getTlOffset(anim) + anim.duration - anim.endDelay;
                })
              )
            : tweenSettings.endDelay;
          return timings;
        }

        var instanceID = 0;

        function createNewInstance(params) {
          var instanceSettings = replaceObjectProps(
            defaultInstanceSettings,
            params
          );
          var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
          var properties = getProperties(tweenSettings, params);
          var animatables = getAnimatables(params.targets);
          var animations = getAnimations(animatables, properties);
          var timings = getInstanceTimings(animations, tweenSettings);
          var id = instanceID;
          instanceID++;
          return mergeObjects(instanceSettings, {
            id: id,
            children: [],
            animatables: animatables,
            animations: animations,
            duration: timings.duration,
            delay: timings.delay,
            endDelay: timings.endDelay,
          });
        }

        // Core

        var activeInstances = [];

        var engine = (function () {
          var raf;

          function play() {
            if (
              !raf &&
              (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) &&
              activeInstances.length > 0
            ) {
              raf = requestAnimationFrame(step);
            }
          }
          function step(t) {
            // memo on algorithm issue:
            // dangerous iteration over mutable `activeInstances`
            // (that collection may be updated from within callbacks of `tick`-ed animation instances)
            var activeInstancesLength = activeInstances.length;
            var i = 0;
            while (i < activeInstancesLength) {
              var activeInstance = activeInstances[i];
              if (!activeInstance.paused) {
                activeInstance.tick(t);
                i++;
              } else {
                activeInstances.splice(i, 1);
                activeInstancesLength--;
              }
            }
            raf = i > 0 ? requestAnimationFrame(step) : undefined;
          }

          function handleVisibilityChange() {
            if (!anime.suspendWhenDocumentHidden) {
              return;
            }

            if (isDocumentHidden()) {
              // suspend ticks
              raf = cancelAnimationFrame(raf);
            } else {
              // is back to active tab
              // first adjust animations to consider the time that ticks were suspended
              activeInstances.forEach(function (instance) {
                return instance._onDocumentVisibility();
              });
              engine();
            }
          }
          if (typeof document !== "undefined") {
            document.addEventListener(
              "visibilitychange",
              handleVisibilityChange
            );
          }

          return play;
        })();

        function isDocumentHidden() {
          return !!document && document.hidden;
        }

        // Public Instance

        function anime(params) {
          if (params === void 0) params = {};

          var startTime = 0,
            lastTime = 0,
            now = 0;
          var children,
            childrenLength = 0;
          var resolve = null;

          function makePromise(instance) {
            var promise =
              window.Promise &&
              new Promise(function (_resolve) {
                return (resolve = _resolve);
              });
            instance.finished = promise;
            return promise;
          }

          var instance = createNewInstance(params);
          var promise = makePromise(instance);

          function toggleInstanceDirection() {
            var direction = instance.direction;
            if (direction !== "alternate") {
              instance.direction =
                direction !== "normal" ? "normal" : "reverse";
            }
            instance.reversed = !instance.reversed;
            children.forEach(function (child) {
              return (child.reversed = instance.reversed);
            });
          }

          function adjustTime(time) {
            return instance.reversed ? instance.duration - time : time;
          }

          function resetTime() {
            startTime = 0;
            lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
          }

          function seekChild(time, child) {
            if (child) {
              child.seek(time - child.timelineOffset);
            }
          }

          function syncInstanceChildren(time) {
            if (!instance.reversePlayback) {
              for (var i = 0; i < childrenLength; i++) {
                seekChild(time, children[i]);
              }
            } else {
              for (var i$1 = childrenLength; i$1--; ) {
                seekChild(time, children[i$1]);
              }
            }
          }

          function setAnimationsProgress(insTime) {
            var i = 0;
            var animations = instance.animations;
            var animationsLength = animations.length;
            while (i < animationsLength) {
              var anim = animations[i];
              var animatable = anim.animatable;
              var tweens = anim.tweens;
              var tweenLength = tweens.length - 1;
              var tween = tweens[tweenLength];
              // Only check for keyframes if there is more than one tween
              if (tweenLength) {
                tween =
                  filterArray(tweens, function (t) {
                    return insTime < t.end;
                  })[0] || tween;
              }
              var elapsed =
                minMax(insTime - tween.start - tween.delay, 0, tween.duration) /
                tween.duration;
              var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
              var strings = tween.to.strings;
              var round = tween.round;
              var numbers = [];
              var toNumbersLength = tween.to.numbers.length;
              var progress = void 0;
              for (var n = 0; n < toNumbersLength; n++) {
                var value = void 0;
                var toNumber = tween.to.numbers[n];
                var fromNumber = tween.from.numbers[n] || 0;
                if (!tween.isPath) {
                  value = fromNumber + eased * (toNumber - fromNumber);
                } else {
                  value = getPathProgress(
                    tween.value,
                    eased * toNumber,
                    tween.isPathTargetInsideSVG
                  );
                }
                if (round) {
                  if (!(tween.isColor && n > 2)) {
                    value = Math.round(value * round) / round;
                  }
                }
                numbers.push(value);
              }
              // Manual Array.reduce for better performances
              var stringsLength = strings.length;
              if (!stringsLength) {
                progress = numbers[0];
              } else {
                progress = strings[0];
                for (var s = 0; s < stringsLength; s++) {
                  var a = strings[s];
                  var b = strings[s + 1];
                  var n$1 = numbers[s];
                  if (!isNaN(n$1)) {
                    if (!b) {
                      progress += n$1 + " ";
                    } else {
                      progress += n$1 + b;
                    }
                  }
                }
              }
              setProgressValue[anim.type](
                animatable.target,
                anim.property,
                progress,
                animatable.transforms
              );
              anim.currentValue = progress;
              i++;
            }
          }

          function setCallback(cb) {
            if (instance[cb] && !instance.passThrough) {
              instance[cb](instance);
            }
          }

          function countIteration() {
            if (instance.remaining && instance.remaining !== true) {
              instance.remaining--;
            }
          }

          function setInstanceProgress(engineTime) {
            var insDuration = instance.duration;
            var insDelay = instance.delay;
            var insEndDelay = insDuration - instance.endDelay;
            var insTime = adjustTime(engineTime);
            instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
            instance.reversePlayback = insTime < instance.currentTime;
            if (children) {
              syncInstanceChildren(insTime);
            }
            if (!instance.began && instance.currentTime > 0) {
              instance.began = true;
              setCallback("begin");
            }
            if (!instance.loopBegan && instance.currentTime > 0) {
              instance.loopBegan = true;
              setCallback("loopBegin");
            }
            if (insTime <= insDelay && instance.currentTime !== 0) {
              setAnimationsProgress(0);
            }
            if (
              (insTime >= insEndDelay &&
                instance.currentTime !== insDuration) ||
              !insDuration
            ) {
              setAnimationsProgress(insDuration);
            }
            if (insTime > insDelay && insTime < insEndDelay) {
              if (!instance.changeBegan) {
                instance.changeBegan = true;
                instance.changeCompleted = false;
                setCallback("changeBegin");
              }
              setCallback("change");
              setAnimationsProgress(insTime);
            } else {
              if (instance.changeBegan) {
                instance.changeCompleted = true;
                instance.changeBegan = false;
                setCallback("changeComplete");
              }
            }
            instance.currentTime = minMax(insTime, 0, insDuration);
            if (instance.began) {
              setCallback("update");
            }
            if (engineTime >= insDuration) {
              lastTime = 0;
              countIteration();
              if (!instance.remaining) {
                instance.paused = true;
                if (!instance.completed) {
                  instance.completed = true;
                  setCallback("loopComplete");
                  setCallback("complete");
                  if (!instance.passThrough && "Promise" in window) {
                    resolve();
                    promise = makePromise(instance);
                  }
                }
              } else {
                startTime = now;
                setCallback("loopComplete");
                instance.loopBegan = false;
                if (instance.direction === "alternate") {
                  toggleInstanceDirection();
                }
              }
            }
          }

          instance.reset = function () {
            var direction = instance.direction;
            instance.passThrough = false;
            instance.currentTime = 0;
            instance.progress = 0;
            instance.paused = true;
            instance.began = false;
            instance.loopBegan = false;
            instance.changeBegan = false;
            instance.completed = false;
            instance.changeCompleted = false;
            instance.reversePlayback = false;
            instance.reversed = direction === "reverse";
            instance.remaining = instance.loop;
            children = instance.children;
            childrenLength = children.length;
            for (var i = childrenLength; i--; ) {
              instance.children[i].reset();
            }
            if (
              (instance.reversed && instance.loop !== true) ||
              (direction === "alternate" && instance.loop === 1)
            ) {
              instance.remaining++;
            }
            setAnimationsProgress(instance.reversed ? instance.duration : 0);
          };

          // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
          instance._onDocumentVisibility = resetTime;

          // Set Value helper

          instance.set = function (targets, properties) {
            setTargetsValue(targets, properties);
            return instance;
          };

          instance.tick = function (t) {
            now = t;
            if (!startTime) {
              startTime = now;
            }
            setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
          };

          instance.seek = function (time) {
            setInstanceProgress(adjustTime(time));
          };

          instance.pause = function () {
            instance.paused = true;
            resetTime();
          };

          instance.play = function () {
            if (!instance.paused) {
              return;
            }
            if (instance.completed) {
              instance.reset();
            }
            instance.paused = false;
            activeInstances.push(instance);
            resetTime();
            engine();
          };

          instance.reverse = function () {
            toggleInstanceDirection();
            instance.completed = instance.reversed ? false : true;
            resetTime();
          };

          instance.restart = function () {
            instance.reset();
            instance.play();
          };

          instance.remove = function (targets) {
            var targetsArray = parseTargets(targets);
            removeTargetsFromInstance(targetsArray, instance);
          };

          instance.reset();

          if (instance.autoplay) {
            instance.play();
          }

          return instance;
        }

        // Remove targets from animation

        function removeTargetsFromAnimations(targetsArray, animations) {
          for (var a = animations.length; a--; ) {
            if (arrayContains(targetsArray, animations[a].animatable.target)) {
              animations.splice(a, 1);
            }
          }
        }

        function removeTargetsFromInstance(targetsArray, instance) {
          var animations = instance.animations;
          var children = instance.children;
          removeTargetsFromAnimations(targetsArray, animations);
          for (var c = children.length; c--; ) {
            var child = children[c];
            var childAnimations = child.animations;
            removeTargetsFromAnimations(targetsArray, childAnimations);
            if (!childAnimations.length && !child.children.length) {
              children.splice(c, 1);
            }
          }
          if (!animations.length && !children.length) {
            instance.pause();
          }
        }

        function removeTargetsFromActiveInstances(targets) {
          var targetsArray = parseTargets(targets);
          for (var i = activeInstances.length; i--; ) {
            var instance = activeInstances[i];
            removeTargetsFromInstance(targetsArray, instance);
          }
        }

        // Stagger helpers

        function stagger(val, params) {
          if (params === void 0) params = {};

          var direction = params.direction || "normal";
          var easing = params.easing ? parseEasings(params.easing) : null;
          var grid = params.grid;
          var axis = params.axis;
          var fromIndex = params.from || 0;
          var fromFirst = fromIndex === "first";
          var fromCenter = fromIndex === "center";
          var fromLast = fromIndex === "last";
          var isRange = is.arr(val);
          var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
          var val2 = isRange ? parseFloat(val[1]) : 0;
          var unit = getUnit(isRange ? val[1] : val) || 0;
          var start = params.start || 0 + (isRange ? val1 : 0);
          var values = [];
          var maxValue = 0;
          return function (el, i, t) {
            if (fromFirst) {
              fromIndex = 0;
            }
            if (fromCenter) {
              fromIndex = (t - 1) / 2;
            }
            if (fromLast) {
              fromIndex = t - 1;
            }
            if (!values.length) {
              for (var index = 0; index < t; index++) {
                if (!grid) {
                  values.push(Math.abs(fromIndex - index));
                } else {
                  var fromX = !fromCenter
                    ? fromIndex % grid[0]
                    : (grid[0] - 1) / 2;
                  var fromY = !fromCenter
                    ? Math.floor(fromIndex / grid[0])
                    : (grid[1] - 1) / 2;
                  var toX = index % grid[0];
                  var toY = Math.floor(index / grid[0]);
                  var distanceX = fromX - toX;
                  var distanceY = fromY - toY;
                  var value = Math.sqrt(
                    distanceX * distanceX + distanceY * distanceY
                  );
                  if (axis === "x") {
                    value = -distanceX;
                  }
                  if (axis === "y") {
                    value = -distanceY;
                  }
                  values.push(value);
                }
                maxValue = Math.max.apply(Math, values);
              }
              if (easing) {
                values = values.map(function (val) {
                  return easing(val / maxValue) * maxValue;
                });
              }
              if (direction === "reverse") {
                values = values.map(function (val) {
                  return axis
                    ? val < 0
                      ? val * -1
                      : -val
                    : Math.abs(maxValue - val);
                });
              }
            }
            var spacing = isRange ? (val2 - val1) / maxValue : val1;
            return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
          };
        }

        // Timeline

        function timeline(params) {
          if (params === void 0) params = {};

          var tl = anime(params);
          tl.duration = 0;
          tl.add = function (instanceParams, timelineOffset) {
            var tlIndex = activeInstances.indexOf(tl);
            var children = tl.children;
            if (tlIndex > -1) {
              activeInstances.splice(tlIndex, 1);
            }
            function passThrough(ins) {
              ins.passThrough = true;
            }
            for (var i = 0; i < children.length; i++) {
              passThrough(children[i]);
            }
            var insParams = mergeObjects(
              instanceParams,
              replaceObjectProps(defaultTweenSettings, params)
            );
            insParams.targets = insParams.targets || params.targets;
            var tlDuration = tl.duration;
            insParams.autoplay = false;
            insParams.direction = tl.direction;
            insParams.timelineOffset = is.und(timelineOffset)
              ? tlDuration
              : getRelativeValue(timelineOffset, tlDuration);
            passThrough(tl);
            tl.seek(insParams.timelineOffset);
            var ins = anime(insParams);
            passThrough(ins);
            children.push(ins);
            var timings = getInstanceTimings(children, params);
            tl.delay = timings.delay;
            tl.endDelay = timings.endDelay;
            tl.duration = timings.duration;
            tl.seek(0);
            tl.reset();
            if (tl.autoplay) {
              tl.play();
            }
            return tl;
          };
          return tl;
        }

        anime.version = "3.2.1";
        anime.speed = 1;
        // TODO:#review: naming, documentation
        anime.suspendWhenDocumentHidden = true;
        anime.running = activeInstances;
        anime.remove = removeTargetsFromActiveInstances;
        anime.get = getOriginalTargetValue;
        anime.set = setTargetsValue;
        anime.convertPx = convertPxToUnit;
        anime.path = getPath;
        anime.setDashoffset = setDashoffset;
        anime.stagger = stagger;
        anime.timeline = timeline;
        anime.easing = parseEasings;
        anime.penner = penner;
        anime.random = function (min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        module.exports = anime;

        /***/
      },

    /***/ "./resources/js/app.js":
      /*!*****************************!*\
  !*** ./resources/js/app.js ***!
  \*****************************/
      /***/ (
        __unused_webpack_module,
        __unused_webpack_exports,
        __webpack_require__
      ) => {
        window.$ = window.jQuery = __webpack_require__(
          /*! jquery */ "./node_modules/jquery/dist/jquery.js"
        );
        /* select for motif oui OU non*/

        $("#myselect1").on("change", function (e) {
          var optionSelected = $("option:selected", this);
          var valueSelected = this.value;

          if (this.value == "NON") {
            $("#motif").hide();
            $("#myselect2").hide();
          } else {
            $("#motif").show();
            $("#myselect2").show();
          }
        });
        /*----------------------key up form--------------------------*/

        /*----------------------key up form--------------------------*/

        $("#nom").keyup(function () {
          if ($("#nom").val() == "")
            $("#nom").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
          else
            $("#nom").css({
              "border-color": "none",
              "border-style": "none",
            });
        });
        $("#prenom").keyup(function () {
          if ($("#prenom").val() == "")
            $("#prenom").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
          else
            $("#prenom").css({
              "border-color": "none",
              "border-style": "none",
            });
        });
        $("#marque").keyup(function () {
          if ($("#marque").val() == "")
            $("#marque").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
          else
            $("#marque").css({
              "border-color": "none",
              "border-style": "none",
            });
        });
        $("#code").keyup(function () {
          if ($("#code").val() == "" || $("#code").val().length != 5)
            $("#code").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
          else
            $("#code").css({
              "border-color": "none",
              "border-style": "none",
            });
          var textme = 5 - $(this).val().length;
        });
        $("#email").keyup(function () {
          var pattern = new RegExp(
            /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i
          );
          if (pattern.test($("#email").val()))
            $("#email").css({
              "border-color": "none",
              "border-style": "none",
            });
          else
            $("#email").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
        });
        $("#tele").keyup(function () {
          if ($("#tele").val() == "" || $("#tele").val().length != 10)
            $("#tele").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
          else
            $("#tele").css({
              "border-color": "none",
              "border-style": "none",
            });
          var textme = 10 - $(this).val().length;
        });
        /*---------------------------------------------------------- */

        $("#bt1").click(function () {
          /*----------------------------------verfication form*/
          if ($("#nom").val() == "") {
            $("#nom").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
            return false;
          }

          if ($("#prenom").val() == "") {
            $("#prenom").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if ($("#marque").val() == "") {
            $("#marque").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if ($("#myselect00").val() == "") {
            $("#myselect00").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if ($("#myselect0").val() == "") {
            $("#myselect0").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if ($("#myselect1").val() == "") {
            $("#myselect1").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if ($("#code").val() == "" || $("#code").val().length != 5) {
            $("#code").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
            return false;
          }

          if ($("#tele").val() == "" || $("#tele").val().length != 10) {
            $("#tele").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
            return false;
          }

          if ($("#email").val() == "") {
            $("#email").css({
              "border-color": "#c14c4c",
              "border-style": "solid",
            });
            return false;
          }

          if (!pattern.test($("#email").val())) {
            $("#email").css({
              "border-color": "#c14c4c",
              "border-style": "groove",
            });
            return false;
          }
        });
        $(document).ready(function () {
          setInterval('$(".myicon").fadeOut(900).fadeIn(800)', 800);
        }); // Wrap every letter in a span

        /***/
      },

    /***/ "./node_modules/bootstrap/dist/js/bootstrap.min.js":
      /*!*********************************************************!*\
  !*** ./node_modules/bootstrap/dist/js/bootstrap.min.js ***!
  \*********************************************************/
      /***/ function (__unused_webpack_module, exports, __webpack_require__) {
        /*!
         * Bootstrap v4.6.0 (https://getbootstrap.com/)
         * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
         * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
         */
        !(function (t, e) {
          true
            ? e(
                exports,
                __webpack_require__(
                  /*! jquery */ "./node_modules/jquery/dist/jquery.js"
                ),
                __webpack_require__(
                  /*! popper.js */ "./node_modules/popper.js/dist/esm/popper.js"
                )
              )
            : 0;
        })(this, function (t, e, n) {
          "use strict";
          function i(t) {
            return t && "object" == typeof t && "default" in t
              ? t
              : { default: t };
          }
          var o = i(e),
            a = i(n);
          function s(t, e) {
            for (var n = 0; n < e.length; n++) {
              var i = e[n];
              (i.enumerable = i.enumerable || !1),
                (i.configurable = !0),
                "value" in i && (i.writable = !0),
                Object.defineProperty(t, i.key, i);
            }
          }
          function l(t, e, n) {
            return e && s(t.prototype, e), n && s(t, n), t;
          }
          function r() {
            return (r =
              Object.assign ||
              function (t) {
                for (var e = 1; e < arguments.length; e++) {
                  var n = arguments[e];
                  for (var i in n)
                    Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i]);
                }
                return t;
              }).apply(this, arguments);
          }
          function u(t) {
            var e = this,
              n = !1;
            return (
              o.default(this).one(d.TRANSITION_END, function () {
                n = !0;
              }),
              setTimeout(function () {
                n || d.triggerTransitionEnd(e);
              }, t),
              this
            );
          }
          var d = {
            TRANSITION_END: "bsTransitionEnd",
            getUID: function (t) {
              do {
                t += ~~(1e6 * Math.random());
              } while (document.getElementById(t));
              return t;
            },
            getSelectorFromElement: function (t) {
              var e = t.getAttribute("data-target");
              if (!e || "#" === e) {
                var n = t.getAttribute("href");
                e = n && "#" !== n ? n.trim() : "";
              }
              try {
                return document.querySelector(e) ? e : null;
              } catch (t) {
                return null;
              }
            },
            getTransitionDurationFromElement: function (t) {
              if (!t) return 0;
              var e = o.default(t).css("transition-duration"),
                n = o.default(t).css("transition-delay"),
                i = parseFloat(e),
                a = parseFloat(n);
              return i || a
                ? ((e = e.split(",")[0]),
                  (n = n.split(",")[0]),
                  1e3 * (parseFloat(e) + parseFloat(n)))
                : 0;
            },
            reflow: function (t) {
              return t.offsetHeight;
            },
            triggerTransitionEnd: function (t) {
              o.default(t).trigger("transitionend");
            },
            supportsTransitionEnd: function () {
              return Boolean("transitionend");
            },
            isElement: function (t) {
              return (t[0] || t).nodeType;
            },
            typeCheckConfig: function (t, e, n) {
              for (var i in n)
                if (Object.prototype.hasOwnProperty.call(n, i)) {
                  var o = n[i],
                    a = e[i],
                    s =
                      a && d.isElement(a)
                        ? "element"
                        : null === (l = a) || "undefined" == typeof l
                        ? "" + l
                        : {}.toString
                            .call(l)
                            .match(/\s([a-z]+)/i)[1]
                            .toLowerCase();
                  if (!new RegExp(o).test(s))
                    throw new Error(
                      t.toUpperCase() +
                        ': Option "' +
                        i +
                        '" provided type "' +
                        s +
                        '" but expected type "' +
                        o +
                        '".'
                    );
                }
              var l;
            },
            findShadowRoot: function (t) {
              if (!document.documentElement.attachShadow) return null;
              if ("function" == typeof t.getRootNode) {
                var e = t.getRootNode();
                return e instanceof ShadowRoot ? e : null;
              }
              return t instanceof ShadowRoot
                ? t
                : t.parentNode
                ? d.findShadowRoot(t.parentNode)
                : null;
            },
            jQueryDetection: function () {
              if ("undefined" == typeof o.default)
                throw new TypeError(
                  "Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript."
                );
              var t = o.default.fn.jquery.split(" ")[0].split(".");
              if (
                (t[0] < 2 && t[1] < 9) ||
                (1 === t[0] && 9 === t[1] && t[2] < 1) ||
                t[0] >= 4
              )
                throw new Error(
                  "Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0"
                );
            },
          };
          d.jQueryDetection(),
            (o.default.fn.emulateTransitionEnd = u),
            (o.default.event.special[d.TRANSITION_END] = {
              bindType: "transitionend",
              delegateType: "transitionend",
              handle: function (t) {
                if (o.default(t.target).is(this))
                  return t.handleObj.handler.apply(this, arguments);
              },
            });
          var f = "alert",
            c = o.default.fn[f],
            h = (function () {
              function t(t) {
                this._element = t;
              }
              var e = t.prototype;
              return (
                (e.close = function (t) {
                  var e = this._element;
                  t && (e = this._getRootElement(t)),
                    this._triggerCloseEvent(e).isDefaultPrevented() ||
                      this._removeElement(e);
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.alert"),
                    (this._element = null);
                }),
                (e._getRootElement = function (t) {
                  var e = d.getSelectorFromElement(t),
                    n = !1;
                  return (
                    e && (n = document.querySelector(e)),
                    n || (n = o.default(t).closest(".alert")[0]),
                    n
                  );
                }),
                (e._triggerCloseEvent = function (t) {
                  var e = o.default.Event("close.bs.alert");
                  return o.default(t).trigger(e), e;
                }),
                (e._removeElement = function (t) {
                  var e = this;
                  if (
                    (o.default(t).removeClass("show"),
                    o.default(t).hasClass("fade"))
                  ) {
                    var n = d.getTransitionDurationFromElement(t);
                    o.default(t)
                      .one(d.TRANSITION_END, function (n) {
                        return e._destroyElement(t, n);
                      })
                      .emulateTransitionEnd(n);
                  } else this._destroyElement(t);
                }),
                (e._destroyElement = function (t) {
                  o.default(t).detach().trigger("closed.bs.alert").remove();
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this),
                      i = n.data("bs.alert");
                    i || ((i = new t(this)), n.data("bs.alert", i)),
                      "close" === e && i[e](this);
                  });
                }),
                (t._handleDismiss = function (t) {
                  return function (e) {
                    e && e.preventDefault(), t.close(this);
                  };
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.alert.data-api",
              '[data-dismiss="alert"]',
              h._handleDismiss(new h())
            ),
            (o.default.fn[f] = h._jQueryInterface),
            (o.default.fn[f].Constructor = h),
            (o.default.fn[f].noConflict = function () {
              return (o.default.fn[f] = c), h._jQueryInterface;
            });
          var g = o.default.fn.button,
            m = (function () {
              function t(t) {
                (this._element = t), (this.shouldAvoidTriggerChange = !1);
              }
              var e = t.prototype;
              return (
                (e.toggle = function () {
                  var t = !0,
                    e = !0,
                    n = o
                      .default(this._element)
                      .closest('[data-toggle="buttons"]')[0];
                  if (n) {
                    var i = this._element.querySelector(
                      'input:not([type="hidden"])'
                    );
                    if (i) {
                      if ("radio" === i.type)
                        if (
                          i.checked &&
                          this._element.classList.contains("active")
                        )
                          t = !1;
                        else {
                          var a = n.querySelector(".active");
                          a && o.default(a).removeClass("active");
                        }
                      t &&
                        (("checkbox" !== i.type && "radio" !== i.type) ||
                          (i.checked =
                            !this._element.classList.contains("active")),
                        this.shouldAvoidTriggerChange ||
                          o.default(i).trigger("change")),
                        i.focus(),
                        (e = !1);
                    }
                  }
                  this._element.hasAttribute("disabled") ||
                    this._element.classList.contains("disabled") ||
                    (e &&
                      this._element.setAttribute(
                        "aria-pressed",
                        !this._element.classList.contains("active")
                      ),
                    t && o.default(this._element).toggleClass("active"));
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.button"),
                    (this._element = null);
                }),
                (t._jQueryInterface = function (e, n) {
                  return this.each(function () {
                    var i = o.default(this),
                      a = i.data("bs.button");
                    a || ((a = new t(this)), i.data("bs.button", a)),
                      (a.shouldAvoidTriggerChange = n),
                      "toggle" === e && a[e]();
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.button.data-api",
              '[data-toggle^="button"]',
              function (t) {
                var e = t.target,
                  n = e;
                if (
                  (o.default(e).hasClass("btn") ||
                    (e = o.default(e).closest(".btn")[0]),
                  !e ||
                    e.hasAttribute("disabled") ||
                    e.classList.contains("disabled"))
                )
                  t.preventDefault();
                else {
                  var i = e.querySelector('input:not([type="hidden"])');
                  if (
                    i &&
                    (i.hasAttribute("disabled") ||
                      i.classList.contains("disabled"))
                  )
                    return void t.preventDefault();
                  ("INPUT" !== n.tagName && "LABEL" === e.tagName) ||
                    m._jQueryInterface.call(
                      o.default(e),
                      "toggle",
                      "INPUT" === n.tagName
                    );
                }
              }
            )
            .on(
              "focus.bs.button.data-api blur.bs.button.data-api",
              '[data-toggle^="button"]',
              function (t) {
                var e = o.default(t.target).closest(".btn")[0];
                o.default(e).toggleClass("focus", /^focus(in)?$/.test(t.type));
              }
            ),
            o.default(window).on("load.bs.button.data-api", function () {
              for (
                var t = [].slice.call(
                    document.querySelectorAll('[data-toggle="buttons"] .btn')
                  ),
                  e = 0,
                  n = t.length;
                e < n;
                e++
              ) {
                var i = t[e],
                  o = i.querySelector('input:not([type="hidden"])');
                o.checked || o.hasAttribute("checked")
                  ? i.classList.add("active")
                  : i.classList.remove("active");
              }
              for (
                var a = 0,
                  s = (t = [].slice.call(
                    document.querySelectorAll('[data-toggle="button"]')
                  )).length;
                a < s;
                a++
              ) {
                var l = t[a];
                "true" === l.getAttribute("aria-pressed")
                  ? l.classList.add("active")
                  : l.classList.remove("active");
              }
            }),
            (o.default.fn.button = m._jQueryInterface),
            (o.default.fn.button.Constructor = m),
            (o.default.fn.button.noConflict = function () {
              return (o.default.fn.button = g), m._jQueryInterface;
            });
          var p = "carousel",
            _ = ".bs.carousel",
            v = o.default.fn[p],
            b = {
              interval: 5e3,
              keyboard: !0,
              slide: !1,
              pause: "hover",
              wrap: !0,
              touch: !0,
            },
            y = {
              interval: "(number|boolean)",
              keyboard: "boolean",
              slide: "(boolean|string)",
              pause: "(string|boolean)",
              wrap: "boolean",
              touch: "boolean",
            },
            E = { TOUCH: "touch", PEN: "pen" },
            w = (function () {
              function t(t, e) {
                (this._items = null),
                  (this._interval = null),
                  (this._activeElement = null),
                  (this._isPaused = !1),
                  (this._isSliding = !1),
                  (this.touchTimeout = null),
                  (this.touchStartX = 0),
                  (this.touchDeltaX = 0),
                  (this._config = this._getConfig(e)),
                  (this._element = t),
                  (this._indicatorsElement = this._element.querySelector(
                    ".carousel-indicators"
                  )),
                  (this._touchSupported =
                    "ontouchstart" in document.documentElement ||
                    navigator.maxTouchPoints > 0),
                  (this._pointerEvent = Boolean(
                    window.PointerEvent || window.MSPointerEvent
                  )),
                  this._addEventListeners();
              }
              var e = t.prototype;
              return (
                (e.next = function () {
                  this._isSliding || this._slide("next");
                }),
                (e.nextWhenVisible = function () {
                  var t = o.default(this._element);
                  !document.hidden &&
                    t.is(":visible") &&
                    "hidden" !== t.css("visibility") &&
                    this.next();
                }),
                (e.prev = function () {
                  this._isSliding || this._slide("prev");
                }),
                (e.pause = function (t) {
                  t || (this._isPaused = !0),
                    this._element.querySelector(
                      ".carousel-item-next, .carousel-item-prev"
                    ) &&
                      (d.triggerTransitionEnd(this._element), this.cycle(!0)),
                    clearInterval(this._interval),
                    (this._interval = null);
                }),
                (e.cycle = function (t) {
                  t || (this._isPaused = !1),
                    this._interval &&
                      (clearInterval(this._interval), (this._interval = null)),
                    this._config.interval &&
                      !this._isPaused &&
                      (this._updateInterval(),
                      (this._interval = setInterval(
                        (document.visibilityState
                          ? this.nextWhenVisible
                          : this.next
                        ).bind(this),
                        this._config.interval
                      )));
                }),
                (e.to = function (t) {
                  var e = this;
                  this._activeElement = this._element.querySelector(
                    ".active.carousel-item"
                  );
                  var n = this._getItemIndex(this._activeElement);
                  if (!(t > this._items.length - 1 || t < 0))
                    if (this._isSliding)
                      o.default(this._element).one(
                        "slid.bs.carousel",
                        function () {
                          return e.to(t);
                        }
                      );
                    else {
                      if (n === t) return this.pause(), void this.cycle();
                      var i = t > n ? "next" : "prev";
                      this._slide(i, this._items[t]);
                    }
                }),
                (e.dispose = function () {
                  o.default(this._element).off(_),
                    o.default.removeData(this._element, "bs.carousel"),
                    (this._items = null),
                    (this._config = null),
                    (this._element = null),
                    (this._interval = null),
                    (this._isPaused = null),
                    (this._isSliding = null),
                    (this._activeElement = null),
                    (this._indicatorsElement = null);
                }),
                (e._getConfig = function (t) {
                  return (t = r({}, b, t)), d.typeCheckConfig(p, t, y), t;
                }),
                (e._handleSwipe = function () {
                  var t = Math.abs(this.touchDeltaX);
                  if (!(t <= 40)) {
                    var e = t / this.touchDeltaX;
                    (this.touchDeltaX = 0),
                      e > 0 && this.prev(),
                      e < 0 && this.next();
                  }
                }),
                (e._addEventListeners = function () {
                  var t = this;
                  this._config.keyboard &&
                    o
                      .default(this._element)
                      .on("keydown.bs.carousel", function (e) {
                        return t._keydown(e);
                      }),
                    "hover" === this._config.pause &&
                      o
                        .default(this._element)
                        .on("mouseenter.bs.carousel", function (e) {
                          return t.pause(e);
                        })
                        .on("mouseleave.bs.carousel", function (e) {
                          return t.cycle(e);
                        }),
                    this._config.touch && this._addTouchEventListeners();
                }),
                (e._addTouchEventListeners = function () {
                  var t = this;
                  if (this._touchSupported) {
                    var e = function (e) {
                        t._pointerEvent &&
                        E[e.originalEvent.pointerType.toUpperCase()]
                          ? (t.touchStartX = e.originalEvent.clientX)
                          : t._pointerEvent ||
                            (t.touchStartX =
                              e.originalEvent.touches[0].clientX);
                      },
                      n = function (e) {
                        t._pointerEvent &&
                          E[e.originalEvent.pointerType.toUpperCase()] &&
                          (t.touchDeltaX =
                            e.originalEvent.clientX - t.touchStartX),
                          t._handleSwipe(),
                          "hover" === t._config.pause &&
                            (t.pause(),
                            t.touchTimeout && clearTimeout(t.touchTimeout),
                            (t.touchTimeout = setTimeout(function (e) {
                              return t.cycle(e);
                            }, 500 + t._config.interval)));
                      };
                    o
                      .default(
                        this._element.querySelectorAll(".carousel-item img")
                      )
                      .on("dragstart.bs.carousel", function (t) {
                        return t.preventDefault();
                      }),
                      this._pointerEvent
                        ? (o
                            .default(this._element)
                            .on("pointerdown.bs.carousel", function (t) {
                              return e(t);
                            }),
                          o
                            .default(this._element)
                            .on("pointerup.bs.carousel", function (t) {
                              return n(t);
                            }),
                          this._element.classList.add("pointer-event"))
                        : (o
                            .default(this._element)
                            .on("touchstart.bs.carousel", function (t) {
                              return e(t);
                            }),
                          o
                            .default(this._element)
                            .on("touchmove.bs.carousel", function (e) {
                              return (function (e) {
                                e.originalEvent.touches &&
                                e.originalEvent.touches.length > 1
                                  ? (t.touchDeltaX = 0)
                                  : (t.touchDeltaX =
                                      e.originalEvent.touches[0].clientX -
                                      t.touchStartX);
                              })(e);
                            }),
                          o
                            .default(this._element)
                            .on("touchend.bs.carousel", function (t) {
                              return n(t);
                            }));
                  }
                }),
                (e._keydown = function (t) {
                  if (!/input|textarea/i.test(t.target.tagName))
                    switch (t.which) {
                      case 37:
                        t.preventDefault(), this.prev();
                        break;
                      case 39:
                        t.preventDefault(), this.next();
                    }
                }),
                (e._getItemIndex = function (t) {
                  return (
                    (this._items =
                      t && t.parentNode
                        ? [].slice.call(
                            t.parentNode.querySelectorAll(".carousel-item")
                          )
                        : []),
                    this._items.indexOf(t)
                  );
                }),
                (e._getItemByDirection = function (t, e) {
                  var n = "next" === t,
                    i = "prev" === t,
                    o = this._getItemIndex(e),
                    a = this._items.length - 1;
                  if (((i && 0 === o) || (n && o === a)) && !this._config.wrap)
                    return e;
                  var s = (o + ("prev" === t ? -1 : 1)) % this._items.length;
                  return -1 === s
                    ? this._items[this._items.length - 1]
                    : this._items[s];
                }),
                (e._triggerSlideEvent = function (t, e) {
                  var n = this._getItemIndex(t),
                    i = this._getItemIndex(
                      this._element.querySelector(".active.carousel-item")
                    ),
                    a = o.default.Event("slide.bs.carousel", {
                      relatedTarget: t,
                      direction: e,
                      from: i,
                      to: n,
                    });
                  return o.default(this._element).trigger(a), a;
                }),
                (e._setActiveIndicatorElement = function (t) {
                  if (this._indicatorsElement) {
                    var e = [].slice.call(
                      this._indicatorsElement.querySelectorAll(".active")
                    );
                    o.default(e).removeClass("active");
                    var n =
                      this._indicatorsElement.children[this._getItemIndex(t)];
                    n && o.default(n).addClass("active");
                  }
                }),
                (e._updateInterval = function () {
                  var t =
                    this._activeElement ||
                    this._element.querySelector(".active.carousel-item");
                  if (t) {
                    var e = parseInt(t.getAttribute("data-interval"), 10);
                    e
                      ? ((this._config.defaultInterval =
                          this._config.defaultInterval ||
                          this._config.interval),
                        (this._config.interval = e))
                      : (this._config.interval =
                          this._config.defaultInterval ||
                          this._config.interval);
                  }
                }),
                (e._slide = function (t, e) {
                  var n,
                    i,
                    a,
                    s = this,
                    l = this._element.querySelector(".active.carousel-item"),
                    r = this._getItemIndex(l),
                    u = e || (l && this._getItemByDirection(t, l)),
                    f = this._getItemIndex(u),
                    c = Boolean(this._interval);
                  if (
                    ("next" === t
                      ? ((n = "carousel-item-left"),
                        (i = "carousel-item-next"),
                        (a = "left"))
                      : ((n = "carousel-item-right"),
                        (i = "carousel-item-prev"),
                        (a = "right")),
                    u && o.default(u).hasClass("active"))
                  )
                    this._isSliding = !1;
                  else if (
                    !this._triggerSlideEvent(u, a).isDefaultPrevented() &&
                    l &&
                    u
                  ) {
                    (this._isSliding = !0),
                      c && this.pause(),
                      this._setActiveIndicatorElement(u),
                      (this._activeElement = u);
                    var h = o.default.Event("slid.bs.carousel", {
                      relatedTarget: u,
                      direction: a,
                      from: r,
                      to: f,
                    });
                    if (o.default(this._element).hasClass("slide")) {
                      o.default(u).addClass(i),
                        d.reflow(u),
                        o.default(l).addClass(n),
                        o.default(u).addClass(n);
                      var g = d.getTransitionDurationFromElement(l);
                      o.default(l)
                        .one(d.TRANSITION_END, function () {
                          o
                            .default(u)
                            .removeClass(n + " " + i)
                            .addClass("active"),
                            o.default(l).removeClass("active " + i + " " + n),
                            (s._isSliding = !1),
                            setTimeout(function () {
                              return o.default(s._element).trigger(h);
                            }, 0);
                        })
                        .emulateTransitionEnd(g);
                    } else
                      o.default(l).removeClass("active"),
                        o.default(u).addClass("active"),
                        (this._isSliding = !1),
                        o.default(this._element).trigger(h);
                    c && this.cycle();
                  }
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this).data("bs.carousel"),
                      i = r({}, b, o.default(this).data());
                    "object" == typeof e && (i = r({}, i, e));
                    var a = "string" == typeof e ? e : i.slide;
                    if (
                      (n ||
                        ((n = new t(this, i)),
                        o.default(this).data("bs.carousel", n)),
                      "number" == typeof e)
                    )
                      n.to(e);
                    else if ("string" == typeof a) {
                      if ("undefined" == typeof n[a])
                        throw new TypeError('No method named "' + a + '"');
                      n[a]();
                    } else i.interval && i.ride && (n.pause(), n.cycle());
                  });
                }),
                (t._dataApiClickHandler = function (e) {
                  var n = d.getSelectorFromElement(this);
                  if (n) {
                    var i = o.default(n)[0];
                    if (i && o.default(i).hasClass("carousel")) {
                      var a = r(
                          {},
                          o.default(i).data(),
                          o.default(this).data()
                        ),
                        s = this.getAttribute("data-slide-to");
                      s && (a.interval = !1),
                        t._jQueryInterface.call(o.default(i), a),
                        s && o.default(i).data("bs.carousel").to(s),
                        e.preventDefault();
                    }
                  }
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return b;
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.carousel.data-api",
              "[data-slide], [data-slide-to]",
              w._dataApiClickHandler
            ),
            o.default(window).on("load.bs.carousel.data-api", function () {
              for (
                var t = [].slice.call(
                    document.querySelectorAll('[data-ride="carousel"]')
                  ),
                  e = 0,
                  n = t.length;
                e < n;
                e++
              ) {
                var i = o.default(t[e]);
                w._jQueryInterface.call(i, i.data());
              }
            }),
            (o.default.fn[p] = w._jQueryInterface),
            (o.default.fn[p].Constructor = w),
            (o.default.fn[p].noConflict = function () {
              return (o.default.fn[p] = v), w._jQueryInterface;
            });
          var T = "collapse",
            C = o.default.fn[T],
            S = { toggle: !0, parent: "" },
            N = { toggle: "boolean", parent: "(string|element)" },
            D = (function () {
              function t(t, e) {
                (this._isTransitioning = !1),
                  (this._element = t),
                  (this._config = this._getConfig(e)),
                  (this._triggerArray = [].slice.call(
                    document.querySelectorAll(
                      '[data-toggle="collapse"][href="#' +
                        t.id +
                        '"],[data-toggle="collapse"][data-target="#' +
                        t.id +
                        '"]'
                    )
                  ));
                for (
                  var n = [].slice.call(
                      document.querySelectorAll('[data-toggle="collapse"]')
                    ),
                    i = 0,
                    o = n.length;
                  i < o;
                  i++
                ) {
                  var a = n[i],
                    s = d.getSelectorFromElement(a),
                    l = [].slice
                      .call(document.querySelectorAll(s))
                      .filter(function (e) {
                        return e === t;
                      });
                  null !== s &&
                    l.length > 0 &&
                    ((this._selector = s), this._triggerArray.push(a));
                }
                (this._parent = this._config.parent ? this._getParent() : null),
                  this._config.parent ||
                    this._addAriaAndCollapsedClass(
                      this._element,
                      this._triggerArray
                    ),
                  this._config.toggle && this.toggle();
              }
              var e = t.prototype;
              return (
                (e.toggle = function () {
                  o.default(this._element).hasClass("show")
                    ? this.hide()
                    : this.show();
                }),
                (e.show = function () {
                  var e,
                    n,
                    i = this;
                  if (
                    !this._isTransitioning &&
                    !o.default(this._element).hasClass("show") &&
                    (this._parent &&
                      0 ===
                        (e = [].slice
                          .call(
                            this._parent.querySelectorAll(".show, .collapsing")
                          )
                          .filter(function (t) {
                            return "string" == typeof i._config.parent
                              ? t.getAttribute("data-parent") ===
                                  i._config.parent
                              : t.classList.contains("collapse");
                          })).length &&
                      (e = null),
                    !(
                      e &&
                      (n = o
                        .default(e)
                        .not(this._selector)
                        .data("bs.collapse")) &&
                      n._isTransitioning
                    ))
                  ) {
                    var a = o.default.Event("show.bs.collapse");
                    if (
                      (o.default(this._element).trigger(a),
                      !a.isDefaultPrevented())
                    ) {
                      e &&
                        (t._jQueryInterface.call(
                          o.default(e).not(this._selector),
                          "hide"
                        ),
                        n || o.default(e).data("bs.collapse", null));
                      var s = this._getDimension();
                      o
                        .default(this._element)
                        .removeClass("collapse")
                        .addClass("collapsing"),
                        (this._element.style[s] = 0),
                        this._triggerArray.length &&
                          o
                            .default(this._triggerArray)
                            .removeClass("collapsed")
                            .attr("aria-expanded", !0),
                        this.setTransitioning(!0);
                      var l = "scroll" + (s[0].toUpperCase() + s.slice(1)),
                        r = d.getTransitionDurationFromElement(this._element);
                      o
                        .default(this._element)
                        .one(d.TRANSITION_END, function () {
                          o
                            .default(i._element)
                            .removeClass("collapsing")
                            .addClass("collapse show"),
                            (i._element.style[s] = ""),
                            i.setTransitioning(!1),
                            o.default(i._element).trigger("shown.bs.collapse");
                        })
                        .emulateTransitionEnd(r),
                        (this._element.style[s] = this._element[l] + "px");
                    }
                  }
                }),
                (e.hide = function () {
                  var t = this;
                  if (
                    !this._isTransitioning &&
                    o.default(this._element).hasClass("show")
                  ) {
                    var e = o.default.Event("hide.bs.collapse");
                    if (
                      (o.default(this._element).trigger(e),
                      !e.isDefaultPrevented())
                    ) {
                      var n = this._getDimension();
                      (this._element.style[n] =
                        this._element.getBoundingClientRect()[n] + "px"),
                        d.reflow(this._element),
                        o
                          .default(this._element)
                          .addClass("collapsing")
                          .removeClass("collapse show");
                      var i = this._triggerArray.length;
                      if (i > 0)
                        for (var a = 0; a < i; a++) {
                          var s = this._triggerArray[a],
                            l = d.getSelectorFromElement(s);
                          if (null !== l)
                            o
                              .default(
                                [].slice.call(document.querySelectorAll(l))
                              )
                              .hasClass("show") ||
                              o
                                .default(s)
                                .addClass("collapsed")
                                .attr("aria-expanded", !1);
                        }
                      this.setTransitioning(!0);
                      this._element.style[n] = "";
                      var r = d.getTransitionDurationFromElement(this._element);
                      o.default(this._element)
                        .one(d.TRANSITION_END, function () {
                          t.setTransitioning(!1),
                            o
                              .default(t._element)
                              .removeClass("collapsing")
                              .addClass("collapse")
                              .trigger("hidden.bs.collapse");
                        })
                        .emulateTransitionEnd(r);
                    }
                  }
                }),
                (e.setTransitioning = function (t) {
                  this._isTransitioning = t;
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.collapse"),
                    (this._config = null),
                    (this._parent = null),
                    (this._element = null),
                    (this._triggerArray = null),
                    (this._isTransitioning = null);
                }),
                (e._getConfig = function (t) {
                  return (
                    ((t = r({}, S, t)).toggle = Boolean(t.toggle)),
                    d.typeCheckConfig(T, t, N),
                    t
                  );
                }),
                (e._getDimension = function () {
                  return o.default(this._element).hasClass("width")
                    ? "width"
                    : "height";
                }),
                (e._getParent = function () {
                  var e,
                    n = this;
                  d.isElement(this._config.parent)
                    ? ((e = this._config.parent),
                      "undefined" != typeof this._config.parent.jquery &&
                        (e = this._config.parent[0]))
                    : (e = document.querySelector(this._config.parent));
                  var i =
                      '[data-toggle="collapse"][data-parent="' +
                      this._config.parent +
                      '"]',
                    a = [].slice.call(e.querySelectorAll(i));
                  return (
                    o.default(a).each(function (e, i) {
                      n._addAriaAndCollapsedClass(t._getTargetFromElement(i), [
                        i,
                      ]);
                    }),
                    e
                  );
                }),
                (e._addAriaAndCollapsedClass = function (t, e) {
                  var n = o.default(t).hasClass("show");
                  e.length &&
                    o
                      .default(e)
                      .toggleClass("collapsed", !n)
                      .attr("aria-expanded", n);
                }),
                (t._getTargetFromElement = function (t) {
                  var e = d.getSelectorFromElement(t);
                  return e ? document.querySelector(e) : null;
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this),
                      i = n.data("bs.collapse"),
                      a = r(
                        {},
                        S,
                        n.data(),
                        "object" == typeof e && e ? e : {}
                      );
                    if (
                      (!i &&
                        a.toggle &&
                        "string" == typeof e &&
                        /show|hide/.test(e) &&
                        (a.toggle = !1),
                      i || ((i = new t(this, a)), n.data("bs.collapse", i)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof i[e])
                        throw new TypeError('No method named "' + e + '"');
                      i[e]();
                    }
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return S;
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.collapse.data-api",
              '[data-toggle="collapse"]',
              function (t) {
                "A" === t.currentTarget.tagName && t.preventDefault();
                var e = o.default(this),
                  n = d.getSelectorFromElement(this),
                  i = [].slice.call(document.querySelectorAll(n));
                o.default(i).each(function () {
                  var t = o.default(this),
                    n = t.data("bs.collapse") ? "toggle" : e.data();
                  D._jQueryInterface.call(t, n);
                });
              }
            ),
            (o.default.fn[T] = D._jQueryInterface),
            (o.default.fn[T].Constructor = D),
            (o.default.fn[T].noConflict = function () {
              return (o.default.fn[T] = C), D._jQueryInterface;
            });
          var k = "dropdown",
            A = o.default.fn[k],
            I = new RegExp("38|40|27"),
            j = {
              offset: 0,
              flip: !0,
              boundary: "scrollParent",
              reference: "toggle",
              display: "dynamic",
              popperConfig: null,
            },
            O = {
              offset: "(number|string|function)",
              flip: "boolean",
              boundary: "(string|element)",
              reference: "(string|element)",
              display: "string",
              popperConfig: "(null|object)",
            },
            x = (function () {
              function t(t, e) {
                (this._element = t),
                  (this._popper = null),
                  (this._config = this._getConfig(e)),
                  (this._menu = this._getMenuElement()),
                  (this._inNavbar = this._detectNavbar()),
                  this._addEventListeners();
              }
              var e = t.prototype;
              return (
                (e.toggle = function () {
                  if (
                    !this._element.disabled &&
                    !o.default(this._element).hasClass("disabled")
                  ) {
                    var e = o.default(this._menu).hasClass("show");
                    t._clearMenus(), e || this.show(!0);
                  }
                }),
                (e.show = function (e) {
                  if (
                    (void 0 === e && (e = !1),
                    !(
                      this._element.disabled ||
                      o.default(this._element).hasClass("disabled") ||
                      o.default(this._menu).hasClass("show")
                    ))
                  ) {
                    var n = { relatedTarget: this._element },
                      i = o.default.Event("show.bs.dropdown", n),
                      s = t._getParentFromElement(this._element);
                    if ((o.default(s).trigger(i), !i.isDefaultPrevented())) {
                      if (!this._inNavbar && e) {
                        if ("undefined" == typeof a.default)
                          throw new TypeError(
                            "Bootstrap's dropdowns require Popper (https://popper.js.org)"
                          );
                        var l = this._element;
                        "parent" === this._config.reference
                          ? (l = s)
                          : d.isElement(this._config.reference) &&
                            ((l = this._config.reference),
                            "undefined" !=
                              typeof this._config.reference.jquery &&
                              (l = this._config.reference[0])),
                          "scrollParent" !== this._config.boundary &&
                            o.default(s).addClass("position-static"),
                          (this._popper = new a.default(
                            l,
                            this._menu,
                            this._getPopperConfig()
                          ));
                      }
                      "ontouchstart" in document.documentElement &&
                        0 === o.default(s).closest(".navbar-nav").length &&
                        o
                          .default(document.body)
                          .children()
                          .on("mouseover", null, o.default.noop),
                        this._element.focus(),
                        this._element.setAttribute("aria-expanded", !0),
                        o.default(this._menu).toggleClass("show"),
                        o
                          .default(s)
                          .toggleClass("show")
                          .trigger(o.default.Event("shown.bs.dropdown", n));
                    }
                  }
                }),
                (e.hide = function () {
                  if (
                    !this._element.disabled &&
                    !o.default(this._element).hasClass("disabled") &&
                    o.default(this._menu).hasClass("show")
                  ) {
                    var e = { relatedTarget: this._element },
                      n = o.default.Event("hide.bs.dropdown", e),
                      i = t._getParentFromElement(this._element);
                    o.default(i).trigger(n),
                      n.isDefaultPrevented() ||
                        (this._popper && this._popper.destroy(),
                        o.default(this._menu).toggleClass("show"),
                        o
                          .default(i)
                          .toggleClass("show")
                          .trigger(o.default.Event("hidden.bs.dropdown", e)));
                  }
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.dropdown"),
                    o.default(this._element).off(".bs.dropdown"),
                    (this._element = null),
                    (this._menu = null),
                    null !== this._popper &&
                      (this._popper.destroy(), (this._popper = null));
                }),
                (e.update = function () {
                  (this._inNavbar = this._detectNavbar()),
                    null !== this._popper && this._popper.scheduleUpdate();
                }),
                (e._addEventListeners = function () {
                  var t = this;
                  o.default(this._element).on(
                    "click.bs.dropdown",
                    function (e) {
                      e.preventDefault(), e.stopPropagation(), t.toggle();
                    }
                  );
                }),
                (e._getConfig = function (t) {
                  return (
                    (t = r(
                      {},
                      this.constructor.Default,
                      o.default(this._element).data(),
                      t
                    )),
                    d.typeCheckConfig(k, t, this.constructor.DefaultType),
                    t
                  );
                }),
                (e._getMenuElement = function () {
                  if (!this._menu) {
                    var e = t._getParentFromElement(this._element);
                    e && (this._menu = e.querySelector(".dropdown-menu"));
                  }
                  return this._menu;
                }),
                (e._getPlacement = function () {
                  var t = o.default(this._element.parentNode),
                    e = "bottom-start";
                  return (
                    t.hasClass("dropup")
                      ? (e = o
                          .default(this._menu)
                          .hasClass("dropdown-menu-right")
                          ? "top-end"
                          : "top-start")
                      : t.hasClass("dropright")
                      ? (e = "right-start")
                      : t.hasClass("dropleft")
                      ? (e = "left-start")
                      : o.default(this._menu).hasClass("dropdown-menu-right") &&
                        (e = "bottom-end"),
                    e
                  );
                }),
                (e._detectNavbar = function () {
                  return o.default(this._element).closest(".navbar").length > 0;
                }),
                (e._getOffset = function () {
                  var t = this,
                    e = {};
                  return (
                    "function" == typeof this._config.offset
                      ? (e.fn = function (e) {
                          return (
                            (e.offsets = r(
                              {},
                              e.offsets,
                              t._config.offset(e.offsets, t._element) || {}
                            )),
                            e
                          );
                        })
                      : (e.offset = this._config.offset),
                    e
                  );
                }),
                (e._getPopperConfig = function () {
                  var t = {
                    placement: this._getPlacement(),
                    modifiers: {
                      offset: this._getOffset(),
                      flip: { enabled: this._config.flip },
                      preventOverflow: {
                        boundariesElement: this._config.boundary,
                      },
                    },
                  };
                  return (
                    "static" === this._config.display &&
                      (t.modifiers.applyStyle = { enabled: !1 }),
                    r({}, t, this._config.popperConfig)
                  );
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this).data("bs.dropdown");
                    if (
                      (n ||
                        ((n = new t(this, "object" == typeof e ? e : null)),
                        o.default(this).data("bs.dropdown", n)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof n[e])
                        throw new TypeError('No method named "' + e + '"');
                      n[e]();
                    }
                  });
                }),
                (t._clearMenus = function (e) {
                  if (
                    !e ||
                    (3 !== e.which && ("keyup" !== e.type || 9 === e.which))
                  )
                    for (
                      var n = [].slice.call(
                          document.querySelectorAll('[data-toggle="dropdown"]')
                        ),
                        i = 0,
                        a = n.length;
                      i < a;
                      i++
                    ) {
                      var s = t._getParentFromElement(n[i]),
                        l = o.default(n[i]).data("bs.dropdown"),
                        r = { relatedTarget: n[i] };
                      if ((e && "click" === e.type && (r.clickEvent = e), l)) {
                        var u = l._menu;
                        if (
                          o.default(s).hasClass("show") &&
                          !(
                            e &&
                            (("click" === e.type &&
                              /input|textarea/i.test(e.target.tagName)) ||
                              ("keyup" === e.type && 9 === e.which)) &&
                            o.default.contains(s, e.target)
                          )
                        ) {
                          var d = o.default.Event("hide.bs.dropdown", r);
                          o.default(s).trigger(d),
                            d.isDefaultPrevented() ||
                              ("ontouchstart" in document.documentElement &&
                                o
                                  .default(document.body)
                                  .children()
                                  .off("mouseover", null, o.default.noop),
                              n[i].setAttribute("aria-expanded", "false"),
                              l._popper && l._popper.destroy(),
                              o.default(u).removeClass("show"),
                              o
                                .default(s)
                                .removeClass("show")
                                .trigger(
                                  o.default.Event("hidden.bs.dropdown", r)
                                ));
                        }
                      }
                    }
                }),
                (t._getParentFromElement = function (t) {
                  var e,
                    n = d.getSelectorFromElement(t);
                  return (
                    n && (e = document.querySelector(n)), e || t.parentNode
                  );
                }),
                (t._dataApiKeydownHandler = function (e) {
                  if (
                    !(/input|textarea/i.test(e.target.tagName)
                      ? 32 === e.which ||
                        (27 !== e.which &&
                          ((40 !== e.which && 38 !== e.which) ||
                            o.default(e.target).closest(".dropdown-menu")
                              .length))
                      : !I.test(e.which)) &&
                    !this.disabled &&
                    !o.default(this).hasClass("disabled")
                  ) {
                    var n = t._getParentFromElement(this),
                      i = o.default(n).hasClass("show");
                    if (i || 27 !== e.which) {
                      if (
                        (e.preventDefault(),
                        e.stopPropagation(),
                        !i || 27 === e.which || 32 === e.which)
                      )
                        return (
                          27 === e.which &&
                            o
                              .default(
                                n.querySelector('[data-toggle="dropdown"]')
                              )
                              .trigger("focus"),
                          void o.default(this).trigger("click")
                        );
                      var a = [].slice
                        .call(
                          n.querySelectorAll(
                            ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)"
                          )
                        )
                        .filter(function (t) {
                          return o.default(t).is(":visible");
                        });
                      if (0 !== a.length) {
                        var s = a.indexOf(e.target);
                        38 === e.which && s > 0 && s--,
                          40 === e.which && s < a.length - 1 && s++,
                          s < 0 && (s = 0),
                          a[s].focus();
                      }
                    }
                  }
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return j;
                    },
                  },
                  {
                    key: "DefaultType",
                    get: function () {
                      return O;
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "keydown.bs.dropdown.data-api",
              '[data-toggle="dropdown"]',
              x._dataApiKeydownHandler
            )
            .on(
              "keydown.bs.dropdown.data-api",
              ".dropdown-menu",
              x._dataApiKeydownHandler
            )
            .on(
              "click.bs.dropdown.data-api keyup.bs.dropdown.data-api",
              x._clearMenus
            )
            .on(
              "click.bs.dropdown.data-api",
              '[data-toggle="dropdown"]',
              function (t) {
                t.preventDefault(),
                  t.stopPropagation(),
                  x._jQueryInterface.call(o.default(this), "toggle");
              }
            )
            .on("click.bs.dropdown.data-api", ".dropdown form", function (t) {
              t.stopPropagation();
            }),
            (o.default.fn[k] = x._jQueryInterface),
            (o.default.fn[k].Constructor = x),
            (o.default.fn[k].noConflict = function () {
              return (o.default.fn[k] = A), x._jQueryInterface;
            });
          var P = o.default.fn.modal,
            R = { backdrop: !0, keyboard: !0, focus: !0, show: !0 },
            L = {
              backdrop: "(boolean|string)",
              keyboard: "boolean",
              focus: "boolean",
              show: "boolean",
            },
            q = (function () {
              function t(t, e) {
                (this._config = this._getConfig(e)),
                  (this._element = t),
                  (this._dialog = t.querySelector(".modal-dialog")),
                  (this._backdrop = null),
                  (this._isShown = !1),
                  (this._isBodyOverflowing = !1),
                  (this._ignoreBackdropClick = !1),
                  (this._isTransitioning = !1),
                  (this._scrollbarWidth = 0);
              }
              var e = t.prototype;
              return (
                (e.toggle = function (t) {
                  return this._isShown ? this.hide() : this.show(t);
                }),
                (e.show = function (t) {
                  var e = this;
                  if (!this._isShown && !this._isTransitioning) {
                    o.default(this._element).hasClass("fade") &&
                      (this._isTransitioning = !0);
                    var n = o.default.Event("show.bs.modal", {
                      relatedTarget: t,
                    });
                    o.default(this._element).trigger(n),
                      this._isShown ||
                        n.isDefaultPrevented() ||
                        ((this._isShown = !0),
                        this._checkScrollbar(),
                        this._setScrollbar(),
                        this._adjustDialog(),
                        this._setEscapeEvent(),
                        this._setResizeEvent(),
                        o
                          .default(this._element)
                          .on(
                            "click.dismiss.bs.modal",
                            '[data-dismiss="modal"]',
                            function (t) {
                              return e.hide(t);
                            }
                          ),
                        o
                          .default(this._dialog)
                          .on("mousedown.dismiss.bs.modal", function () {
                            o.default(e._element).one(
                              "mouseup.dismiss.bs.modal",
                              function (t) {
                                o.default(t.target).is(e._element) &&
                                  (e._ignoreBackdropClick = !0);
                              }
                            );
                          }),
                        this._showBackdrop(function () {
                          return e._showElement(t);
                        }));
                  }
                }),
                (e.hide = function (t) {
                  var e = this;
                  if (
                    (t && t.preventDefault(),
                    this._isShown && !this._isTransitioning)
                  ) {
                    var n = o.default.Event("hide.bs.modal");
                    if (
                      (o.default(this._element).trigger(n),
                      this._isShown && !n.isDefaultPrevented())
                    ) {
                      this._isShown = !1;
                      var i = o.default(this._element).hasClass("fade");
                      if (
                        (i && (this._isTransitioning = !0),
                        this._setEscapeEvent(),
                        this._setResizeEvent(),
                        o.default(document).off("focusin.bs.modal"),
                        o.default(this._element).removeClass("show"),
                        o.default(this._element).off("click.dismiss.bs.modal"),
                        o
                          .default(this._dialog)
                          .off("mousedown.dismiss.bs.modal"),
                        i)
                      ) {
                        var a = d.getTransitionDurationFromElement(
                          this._element
                        );
                        o.default(this._element)
                          .one(d.TRANSITION_END, function (t) {
                            return e._hideModal(t);
                          })
                          .emulateTransitionEnd(a);
                      } else this._hideModal();
                    }
                  }
                }),
                (e.dispose = function () {
                  [window, this._element, this._dialog].forEach(function (t) {
                    return o.default(t).off(".bs.modal");
                  }),
                    o.default(document).off("focusin.bs.modal"),
                    o.default.removeData(this._element, "bs.modal"),
                    (this._config = null),
                    (this._element = null),
                    (this._dialog = null),
                    (this._backdrop = null),
                    (this._isShown = null),
                    (this._isBodyOverflowing = null),
                    (this._ignoreBackdropClick = null),
                    (this._isTransitioning = null),
                    (this._scrollbarWidth = null);
                }),
                (e.handleUpdate = function () {
                  this._adjustDialog();
                }),
                (e._getConfig = function (t) {
                  return (t = r({}, R, t)), d.typeCheckConfig("modal", t, L), t;
                }),
                (e._triggerBackdropTransition = function () {
                  var t = this,
                    e = o.default.Event("hidePrevented.bs.modal");
                  if (
                    (o.default(this._element).trigger(e),
                    !e.isDefaultPrevented())
                  ) {
                    var n =
                      this._element.scrollHeight >
                      document.documentElement.clientHeight;
                    n || (this._element.style.overflowY = "hidden"),
                      this._element.classList.add("modal-static");
                    var i = d.getTransitionDurationFromElement(this._dialog);
                    o.default(this._element).off(d.TRANSITION_END),
                      o
                        .default(this._element)
                        .one(d.TRANSITION_END, function () {
                          t._element.classList.remove("modal-static"),
                            n ||
                              o
                                .default(t._element)
                                .one(d.TRANSITION_END, function () {
                                  t._element.style.overflowY = "";
                                })
                                .emulateTransitionEnd(t._element, i);
                        })
                        .emulateTransitionEnd(i),
                      this._element.focus();
                  }
                }),
                (e._showElement = function (t) {
                  var e = this,
                    n = o.default(this._element).hasClass("fade"),
                    i = this._dialog
                      ? this._dialog.querySelector(".modal-body")
                      : null;
                  (this._element.parentNode &&
                    this._element.parentNode.nodeType === Node.ELEMENT_NODE) ||
                    document.body.appendChild(this._element),
                    (this._element.style.display = "block"),
                    this._element.removeAttribute("aria-hidden"),
                    this._element.setAttribute("aria-modal", !0),
                    this._element.setAttribute("role", "dialog"),
                    o
                      .default(this._dialog)
                      .hasClass("modal-dialog-scrollable") && i
                      ? (i.scrollTop = 0)
                      : (this._element.scrollTop = 0),
                    n && d.reflow(this._element),
                    o.default(this._element).addClass("show"),
                    this._config.focus && this._enforceFocus();
                  var a = o.default.Event("shown.bs.modal", {
                      relatedTarget: t,
                    }),
                    s = function () {
                      e._config.focus && e._element.focus(),
                        (e._isTransitioning = !1),
                        o.default(e._element).trigger(a);
                    };
                  if (n) {
                    var l = d.getTransitionDurationFromElement(this._dialog);
                    o.default(this._dialog)
                      .one(d.TRANSITION_END, s)
                      .emulateTransitionEnd(l);
                  } else s();
                }),
                (e._enforceFocus = function () {
                  var t = this;
                  o.default(document)
                    .off("focusin.bs.modal")
                    .on("focusin.bs.modal", function (e) {
                      document !== e.target &&
                        t._element !== e.target &&
                        0 === o.default(t._element).has(e.target).length &&
                        t._element.focus();
                    });
                }),
                (e._setEscapeEvent = function () {
                  var t = this;
                  this._isShown
                    ? o
                        .default(this._element)
                        .on("keydown.dismiss.bs.modal", function (e) {
                          t._config.keyboard && 27 === e.which
                            ? (e.preventDefault(), t.hide())
                            : t._config.keyboard ||
                              27 !== e.which ||
                              t._triggerBackdropTransition();
                        })
                    : this._isShown ||
                      o.default(this._element).off("keydown.dismiss.bs.modal");
                }),
                (e._setResizeEvent = function () {
                  var t = this;
                  this._isShown
                    ? o.default(window).on("resize.bs.modal", function (e) {
                        return t.handleUpdate(e);
                      })
                    : o.default(window).off("resize.bs.modal");
                }),
                (e._hideModal = function () {
                  var t = this;
                  (this._element.style.display = "none"),
                    this._element.setAttribute("aria-hidden", !0),
                    this._element.removeAttribute("aria-modal"),
                    this._element.removeAttribute("role"),
                    (this._isTransitioning = !1),
                    this._showBackdrop(function () {
                      o.default(document.body).removeClass("modal-open"),
                        t._resetAdjustments(),
                        t._resetScrollbar(),
                        o.default(t._element).trigger("hidden.bs.modal");
                    });
                }),
                (e._removeBackdrop = function () {
                  this._backdrop &&
                    (o.default(this._backdrop).remove(),
                    (this._backdrop = null));
                }),
                (e._showBackdrop = function (t) {
                  var e = this,
                    n = o.default(this._element).hasClass("fade") ? "fade" : "";
                  if (this._isShown && this._config.backdrop) {
                    if (
                      ((this._backdrop = document.createElement("div")),
                      (this._backdrop.className = "modal-backdrop"),
                      n && this._backdrop.classList.add(n),
                      o.default(this._backdrop).appendTo(document.body),
                      o
                        .default(this._element)
                        .on("click.dismiss.bs.modal", function (t) {
                          e._ignoreBackdropClick
                            ? (e._ignoreBackdropClick = !1)
                            : t.target === t.currentTarget &&
                              ("static" === e._config.backdrop
                                ? e._triggerBackdropTransition()
                                : e.hide());
                        }),
                      n && d.reflow(this._backdrop),
                      o.default(this._backdrop).addClass("show"),
                      !t)
                    )
                      return;
                    if (!n) return void t();
                    var i = d.getTransitionDurationFromElement(this._backdrop);
                    o.default(this._backdrop)
                      .one(d.TRANSITION_END, t)
                      .emulateTransitionEnd(i);
                  } else if (!this._isShown && this._backdrop) {
                    o.default(this._backdrop).removeClass("show");
                    var a = function () {
                      e._removeBackdrop(), t && t();
                    };
                    if (o.default(this._element).hasClass("fade")) {
                      var s = d.getTransitionDurationFromElement(
                        this._backdrop
                      );
                      o.default(this._backdrop)
                        .one(d.TRANSITION_END, a)
                        .emulateTransitionEnd(s);
                    } else a();
                  } else t && t();
                }),
                (e._adjustDialog = function () {
                  var t =
                    this._element.scrollHeight >
                    document.documentElement.clientHeight;
                  !this._isBodyOverflowing &&
                    t &&
                    (this._element.style.paddingLeft =
                      this._scrollbarWidth + "px"),
                    this._isBodyOverflowing &&
                      !t &&
                      (this._element.style.paddingRight =
                        this._scrollbarWidth + "px");
                }),
                (e._resetAdjustments = function () {
                  (this._element.style.paddingLeft = ""),
                    (this._element.style.paddingRight = "");
                }),
                (e._checkScrollbar = function () {
                  var t = document.body.getBoundingClientRect();
                  (this._isBodyOverflowing =
                    Math.round(t.left + t.right) < window.innerWidth),
                    (this._scrollbarWidth = this._getScrollbarWidth());
                }),
                (e._setScrollbar = function () {
                  var t = this;
                  if (this._isBodyOverflowing) {
                    var e = [].slice.call(
                        document.querySelectorAll(
                          ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top"
                        )
                      ),
                      n = [].slice.call(
                        document.querySelectorAll(".sticky-top")
                      );
                    o.default(e).each(function (e, n) {
                      var i = n.style.paddingRight,
                        a = o.default(n).css("padding-right");
                      o.default(n)
                        .data("padding-right", i)
                        .css(
                          "padding-right",
                          parseFloat(a) + t._scrollbarWidth + "px"
                        );
                    }),
                      o.default(n).each(function (e, n) {
                        var i = n.style.marginRight,
                          a = o.default(n).css("margin-right");
                        o.default(n)
                          .data("margin-right", i)
                          .css(
                            "margin-right",
                            parseFloat(a) - t._scrollbarWidth + "px"
                          );
                      });
                    var i = document.body.style.paddingRight,
                      a = o.default(document.body).css("padding-right");
                    o.default(document.body)
                      .data("padding-right", i)
                      .css(
                        "padding-right",
                        parseFloat(a) + this._scrollbarWidth + "px"
                      );
                  }
                  o.default(document.body).addClass("modal-open");
                }),
                (e._resetScrollbar = function () {
                  var t = [].slice.call(
                    document.querySelectorAll(
                      ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top"
                    )
                  );
                  o.default(t).each(function (t, e) {
                    var n = o.default(e).data("padding-right");
                    o.default(e).removeData("padding-right"),
                      (e.style.paddingRight = n || "");
                  });
                  var e = [].slice.call(
                    document.querySelectorAll(".sticky-top")
                  );
                  o.default(e).each(function (t, e) {
                    var n = o.default(e).data("margin-right");
                    "undefined" != typeof n &&
                      o
                        .default(e)
                        .css("margin-right", n)
                        .removeData("margin-right");
                  });
                  var n = o.default(document.body).data("padding-right");
                  o.default(document.body).removeData("padding-right"),
                    (document.body.style.paddingRight = n || "");
                }),
                (e._getScrollbarWidth = function () {
                  var t = document.createElement("div");
                  (t.className = "modal-scrollbar-measure"),
                    document.body.appendChild(t);
                  var e = t.getBoundingClientRect().width - t.clientWidth;
                  return document.body.removeChild(t), e;
                }),
                (t._jQueryInterface = function (e, n) {
                  return this.each(function () {
                    var i = o.default(this).data("bs.modal"),
                      a = r(
                        {},
                        R,
                        o.default(this).data(),
                        "object" == typeof e && e ? e : {}
                      );
                    if (
                      (i ||
                        ((i = new t(this, a)),
                        o.default(this).data("bs.modal", i)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof i[e])
                        throw new TypeError('No method named "' + e + '"');
                      i[e](n);
                    } else a.show && i.show(n);
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return R;
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.modal.data-api",
              '[data-toggle="modal"]',
              function (t) {
                var e,
                  n = this,
                  i = d.getSelectorFromElement(this);
                i && (e = document.querySelector(i));
                var a = o.default(e).data("bs.modal")
                  ? "toggle"
                  : r({}, o.default(e).data(), o.default(this).data());
                ("A" !== this.tagName && "AREA" !== this.tagName) ||
                  t.preventDefault();
                var s = o.default(e).one("show.bs.modal", function (t) {
                  t.isDefaultPrevented() ||
                    s.one("hidden.bs.modal", function () {
                      o.default(n).is(":visible") && n.focus();
                    });
                });
                q._jQueryInterface.call(o.default(e), a, this);
              }
            ),
            (o.default.fn.modal = q._jQueryInterface),
            (o.default.fn.modal.Constructor = q),
            (o.default.fn.modal.noConflict = function () {
              return (o.default.fn.modal = P), q._jQueryInterface;
            });
          var F = [
              "background",
              "cite",
              "href",
              "itemtype",
              "longdesc",
              "poster",
              "src",
              "xlink:href",
            ],
            Q = {
              "*": ["class", "dir", "id", "lang", "role", /^aria-[\w-]*$/i],
              a: ["target", "href", "title", "rel"],
              area: [],
              b: [],
              br: [],
              col: [],
              code: [],
              div: [],
              em: [],
              hr: [],
              h1: [],
              h2: [],
              h3: [],
              h4: [],
              h5: [],
              h6: [],
              i: [],
              img: ["src", "srcset", "alt", "title", "width", "height"],
              li: [],
              ol: [],
              p: [],
              pre: [],
              s: [],
              small: [],
              span: [],
              sub: [],
              sup: [],
              strong: [],
              u: [],
              ul: [],
            },
            B = /^(?:(?:https?|mailto|ftp|tel|file):|[^#&/:?]*(?:[#/?]|$))/gi,
            H =
              /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;
          function U(t, e, n) {
            if (0 === t.length) return t;
            if (n && "function" == typeof n) return n(t);
            for (
              var i = new window.DOMParser().parseFromString(t, "text/html"),
                o = Object.keys(e),
                a = [].slice.call(i.body.querySelectorAll("*")),
                s = function (t, n) {
                  var i = a[t],
                    s = i.nodeName.toLowerCase();
                  if (-1 === o.indexOf(i.nodeName.toLowerCase()))
                    return i.parentNode.removeChild(i), "continue";
                  var l = [].slice.call(i.attributes),
                    r = [].concat(e["*"] || [], e[s] || []);
                  l.forEach(function (t) {
                    (function (t, e) {
                      var n = t.nodeName.toLowerCase();
                      if (-1 !== e.indexOf(n))
                        return (
                          -1 === F.indexOf(n) ||
                          Boolean(t.nodeValue.match(B) || t.nodeValue.match(H))
                        );
                      for (
                        var i = e.filter(function (t) {
                            return t instanceof RegExp;
                          }),
                          o = 0,
                          a = i.length;
                        o < a;
                        o++
                      )
                        if (n.match(i[o])) return !0;
                      return !1;
                    })(t, r) || i.removeAttribute(t.nodeName);
                  });
                },
                l = 0,
                r = a.length;
              l < r;
              l++
            )
              s(l);
            return i.body.innerHTML;
          }
          var M = "tooltip",
            W = o.default.fn[M],
            V = new RegExp("(^|\\s)bs-tooltip\\S+", "g"),
            z = ["sanitize", "whiteList", "sanitizeFn"],
            K = {
              animation: "boolean",
              template: "string",
              title: "(string|element|function)",
              trigger: "string",
              delay: "(number|object)",
              html: "boolean",
              selector: "(string|boolean)",
              placement: "(string|function)",
              offset: "(number|string|function)",
              container: "(string|element|boolean)",
              fallbackPlacement: "(string|array)",
              boundary: "(string|element)",
              customClass: "(string|function)",
              sanitize: "boolean",
              sanitizeFn: "(null|function)",
              whiteList: "object",
              popperConfig: "(null|object)",
            },
            X = {
              AUTO: "auto",
              TOP: "top",
              RIGHT: "right",
              BOTTOM: "bottom",
              LEFT: "left",
            },
            Y = {
              animation: !0,
              template:
                '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
              trigger: "hover focus",
              title: "",
              delay: 0,
              html: !1,
              selector: !1,
              placement: "top",
              offset: 0,
              container: !1,
              fallbackPlacement: "flip",
              boundary: "scrollParent",
              customClass: "",
              sanitize: !0,
              sanitizeFn: null,
              whiteList: Q,
              popperConfig: null,
            },
            $ = {
              HIDE: "hide.bs.tooltip",
              HIDDEN: "hidden.bs.tooltip",
              SHOW: "show.bs.tooltip",
              SHOWN: "shown.bs.tooltip",
              INSERTED: "inserted.bs.tooltip",
              CLICK: "click.bs.tooltip",
              FOCUSIN: "focusin.bs.tooltip",
              FOCUSOUT: "focusout.bs.tooltip",
              MOUSEENTER: "mouseenter.bs.tooltip",
              MOUSELEAVE: "mouseleave.bs.tooltip",
            },
            J = (function () {
              function t(t, e) {
                if ("undefined" == typeof a.default)
                  throw new TypeError(
                    "Bootstrap's tooltips require Popper (https://popper.js.org)"
                  );
                (this._isEnabled = !0),
                  (this._timeout = 0),
                  (this._hoverState = ""),
                  (this._activeTrigger = {}),
                  (this._popper = null),
                  (this.element = t),
                  (this.config = this._getConfig(e)),
                  (this.tip = null),
                  this._setListeners();
              }
              var e = t.prototype;
              return (
                (e.enable = function () {
                  this._isEnabled = !0;
                }),
                (e.disable = function () {
                  this._isEnabled = !1;
                }),
                (e.toggleEnabled = function () {
                  this._isEnabled = !this._isEnabled;
                }),
                (e.toggle = function (t) {
                  if (this._isEnabled)
                    if (t) {
                      var e = this.constructor.DATA_KEY,
                        n = o.default(t.currentTarget).data(e);
                      n ||
                        ((n = new this.constructor(
                          t.currentTarget,
                          this._getDelegateConfig()
                        )),
                        o.default(t.currentTarget).data(e, n)),
                        (n._activeTrigger.click = !n._activeTrigger.click),
                        n._isWithActiveTrigger()
                          ? n._enter(null, n)
                          : n._leave(null, n);
                    } else {
                      if (o.default(this.getTipElement()).hasClass("show"))
                        return void this._leave(null, this);
                      this._enter(null, this);
                    }
                }),
                (e.dispose = function () {
                  clearTimeout(this._timeout),
                    o.default.removeData(
                      this.element,
                      this.constructor.DATA_KEY
                    ),
                    o.default(this.element).off(this.constructor.EVENT_KEY),
                    o
                      .default(this.element)
                      .closest(".modal")
                      .off("hide.bs.modal", this._hideModalHandler),
                    this.tip && o.default(this.tip).remove(),
                    (this._isEnabled = null),
                    (this._timeout = null),
                    (this._hoverState = null),
                    (this._activeTrigger = null),
                    this._popper && this._popper.destroy(),
                    (this._popper = null),
                    (this.element = null),
                    (this.config = null),
                    (this.tip = null);
                }),
                (e.show = function () {
                  var t = this;
                  if ("none" === o.default(this.element).css("display"))
                    throw new Error("Please use show on visible elements");
                  var e = o.default.Event(this.constructor.Event.SHOW);
                  if (this.isWithContent() && this._isEnabled) {
                    o.default(this.element).trigger(e);
                    var n = d.findShadowRoot(this.element),
                      i = o.default.contains(
                        null !== n
                          ? n
                          : this.element.ownerDocument.documentElement,
                        this.element
                      );
                    if (e.isDefaultPrevented() || !i) return;
                    var s = this.getTipElement(),
                      l = d.getUID(this.constructor.NAME);
                    s.setAttribute("id", l),
                      this.element.setAttribute("aria-describedby", l),
                      this.setContent(),
                      this.config.animation && o.default(s).addClass("fade");
                    var r =
                        "function" == typeof this.config.placement
                          ? this.config.placement.call(this, s, this.element)
                          : this.config.placement,
                      u = this._getAttachment(r);
                    this.addAttachmentClass(u);
                    var f = this._getContainer();
                    o.default(s).data(this.constructor.DATA_KEY, this),
                      o.default.contains(
                        this.element.ownerDocument.documentElement,
                        this.tip
                      ) || o.default(s).appendTo(f),
                      o
                        .default(this.element)
                        .trigger(this.constructor.Event.INSERTED),
                      (this._popper = new a.default(
                        this.element,
                        s,
                        this._getPopperConfig(u)
                      )),
                      o.default(s).addClass("show"),
                      o.default(s).addClass(this.config.customClass),
                      "ontouchstart" in document.documentElement &&
                        o
                          .default(document.body)
                          .children()
                          .on("mouseover", null, o.default.noop);
                    var c = function () {
                      t.config.animation && t._fixTransition();
                      var e = t._hoverState;
                      (t._hoverState = null),
                        o.default(t.element).trigger(t.constructor.Event.SHOWN),
                        "out" === e && t._leave(null, t);
                    };
                    if (o.default(this.tip).hasClass("fade")) {
                      var h = d.getTransitionDurationFromElement(this.tip);
                      o.default(this.tip)
                        .one(d.TRANSITION_END, c)
                        .emulateTransitionEnd(h);
                    } else c();
                  }
                }),
                (e.hide = function (t) {
                  var e = this,
                    n = this.getTipElement(),
                    i = o.default.Event(this.constructor.Event.HIDE),
                    a = function () {
                      "show" !== e._hoverState &&
                        n.parentNode &&
                        n.parentNode.removeChild(n),
                        e._cleanTipClass(),
                        e.element.removeAttribute("aria-describedby"),
                        o
                          .default(e.element)
                          .trigger(e.constructor.Event.HIDDEN),
                        null !== e._popper && e._popper.destroy(),
                        t && t();
                    };
                  if (
                    (o.default(this.element).trigger(i),
                    !i.isDefaultPrevented())
                  ) {
                    if (
                      (o.default(n).removeClass("show"),
                      "ontouchstart" in document.documentElement &&
                        o
                          .default(document.body)
                          .children()
                          .off("mouseover", null, o.default.noop),
                      (this._activeTrigger.click = !1),
                      (this._activeTrigger.focus = !1),
                      (this._activeTrigger.hover = !1),
                      o.default(this.tip).hasClass("fade"))
                    ) {
                      var s = d.getTransitionDurationFromElement(n);
                      o.default(n)
                        .one(d.TRANSITION_END, a)
                        .emulateTransitionEnd(s);
                    } else a();
                    this._hoverState = "";
                  }
                }),
                (e.update = function () {
                  null !== this._popper && this._popper.scheduleUpdate();
                }),
                (e.isWithContent = function () {
                  return Boolean(this.getTitle());
                }),
                (e.addAttachmentClass = function (t) {
                  o.default(this.getTipElement()).addClass("bs-tooltip-" + t);
                }),
                (e.getTipElement = function () {
                  return (
                    (this.tip = this.tip || o.default(this.config.template)[0]),
                    this.tip
                  );
                }),
                (e.setContent = function () {
                  var t = this.getTipElement();
                  this.setElementContent(
                    o.default(t.querySelectorAll(".tooltip-inner")),
                    this.getTitle()
                  ),
                    o.default(t).removeClass("fade show");
                }),
                (e.setElementContent = function (t, e) {
                  "object" != typeof e || (!e.nodeType && !e.jquery)
                    ? this.config.html
                      ? (this.config.sanitize &&
                          (e = U(
                            e,
                            this.config.whiteList,
                            this.config.sanitizeFn
                          )),
                        t.html(e))
                      : t.text(e)
                    : this.config.html
                    ? o.default(e).parent().is(t) || t.empty().append(e)
                    : t.text(o.default(e).text());
                }),
                (e.getTitle = function () {
                  var t = this.element.getAttribute("data-original-title");
                  return (
                    t ||
                      (t =
                        "function" == typeof this.config.title
                          ? this.config.title.call(this.element)
                          : this.config.title),
                    t
                  );
                }),
                (e._getPopperConfig = function (t) {
                  var e = this;
                  return r(
                    {},
                    {
                      placement: t,
                      modifiers: {
                        offset: this._getOffset(),
                        flip: { behavior: this.config.fallbackPlacement },
                        arrow: { element: ".arrow" },
                        preventOverflow: {
                          boundariesElement: this.config.boundary,
                        },
                      },
                      onCreate: function (t) {
                        t.originalPlacement !== t.placement &&
                          e._handlePopperPlacementChange(t);
                      },
                      onUpdate: function (t) {
                        return e._handlePopperPlacementChange(t);
                      },
                    },
                    this.config.popperConfig
                  );
                }),
                (e._getOffset = function () {
                  var t = this,
                    e = {};
                  return (
                    "function" == typeof this.config.offset
                      ? (e.fn = function (e) {
                          return (
                            (e.offsets = r(
                              {},
                              e.offsets,
                              t.config.offset(e.offsets, t.element) || {}
                            )),
                            e
                          );
                        })
                      : (e.offset = this.config.offset),
                    e
                  );
                }),
                (e._getContainer = function () {
                  return !1 === this.config.container
                    ? document.body
                    : d.isElement(this.config.container)
                    ? o.default(this.config.container)
                    : o.default(document).find(this.config.container);
                }),
                (e._getAttachment = function (t) {
                  return X[t.toUpperCase()];
                }),
                (e._setListeners = function () {
                  var t = this;
                  this.config.trigger.split(" ").forEach(function (e) {
                    if ("click" === e)
                      o.default(t.element).on(
                        t.constructor.Event.CLICK,
                        t.config.selector,
                        function (e) {
                          return t.toggle(e);
                        }
                      );
                    else if ("manual" !== e) {
                      var n =
                          "hover" === e
                            ? t.constructor.Event.MOUSEENTER
                            : t.constructor.Event.FOCUSIN,
                        i =
                          "hover" === e
                            ? t.constructor.Event.MOUSELEAVE
                            : t.constructor.Event.FOCUSOUT;
                      o.default(t.element)
                        .on(n, t.config.selector, function (e) {
                          return t._enter(e);
                        })
                        .on(i, t.config.selector, function (e) {
                          return t._leave(e);
                        });
                    }
                  }),
                    (this._hideModalHandler = function () {
                      t.element && t.hide();
                    }),
                    o
                      .default(this.element)
                      .closest(".modal")
                      .on("hide.bs.modal", this._hideModalHandler),
                    this.config.selector
                      ? (this.config = r({}, this.config, {
                          trigger: "manual",
                          selector: "",
                        }))
                      : this._fixTitle();
                }),
                (e._fixTitle = function () {
                  var t = typeof this.element.getAttribute(
                    "data-original-title"
                  );
                  (this.element.getAttribute("title") || "string" !== t) &&
                    (this.element.setAttribute(
                      "data-original-title",
                      this.element.getAttribute("title") || ""
                    ),
                    this.element.setAttribute("title", ""));
                }),
                (e._enter = function (t, e) {
                  var n = this.constructor.DATA_KEY;
                  (e = e || o.default(t.currentTarget).data(n)) ||
                    ((e = new this.constructor(
                      t.currentTarget,
                      this._getDelegateConfig()
                    )),
                    o.default(t.currentTarget).data(n, e)),
                    t &&
                      (e._activeTrigger[
                        "focusin" === t.type ? "focus" : "hover"
                      ] = !0),
                    o.default(e.getTipElement()).hasClass("show") ||
                    "show" === e._hoverState
                      ? (e._hoverState = "show")
                      : (clearTimeout(e._timeout),
                        (e._hoverState = "show"),
                        e.config.delay && e.config.delay.show
                          ? (e._timeout = setTimeout(function () {
                              "show" === e._hoverState && e.show();
                            }, e.config.delay.show))
                          : e.show());
                }),
                (e._leave = function (t, e) {
                  var n = this.constructor.DATA_KEY;
                  (e = e || o.default(t.currentTarget).data(n)) ||
                    ((e = new this.constructor(
                      t.currentTarget,
                      this._getDelegateConfig()
                    )),
                    o.default(t.currentTarget).data(n, e)),
                    t &&
                      (e._activeTrigger[
                        "focusout" === t.type ? "focus" : "hover"
                      ] = !1),
                    e._isWithActiveTrigger() ||
                      (clearTimeout(e._timeout),
                      (e._hoverState = "out"),
                      e.config.delay && e.config.delay.hide
                        ? (e._timeout = setTimeout(function () {
                            "out" === e._hoverState && e.hide();
                          }, e.config.delay.hide))
                        : e.hide());
                }),
                (e._isWithActiveTrigger = function () {
                  for (var t in this._activeTrigger)
                    if (this._activeTrigger[t]) return !0;
                  return !1;
                }),
                (e._getConfig = function (t) {
                  var e = o.default(this.element).data();
                  return (
                    Object.keys(e).forEach(function (t) {
                      -1 !== z.indexOf(t) && delete e[t];
                    }),
                    "number" ==
                      typeof (t = r(
                        {},
                        this.constructor.Default,
                        e,
                        "object" == typeof t && t ? t : {}
                      )).delay && (t.delay = { show: t.delay, hide: t.delay }),
                    "number" == typeof t.title &&
                      (t.title = t.title.toString()),
                    "number" == typeof t.content &&
                      (t.content = t.content.toString()),
                    d.typeCheckConfig(M, t, this.constructor.DefaultType),
                    t.sanitize &&
                      (t.template = U(t.template, t.whiteList, t.sanitizeFn)),
                    t
                  );
                }),
                (e._getDelegateConfig = function () {
                  var t = {};
                  if (this.config)
                    for (var e in this.config)
                      this.constructor.Default[e] !== this.config[e] &&
                        (t[e] = this.config[e]);
                  return t;
                }),
                (e._cleanTipClass = function () {
                  var t = o.default(this.getTipElement()),
                    e = t.attr("class").match(V);
                  null !== e && e.length && t.removeClass(e.join(""));
                }),
                (e._handlePopperPlacementChange = function (t) {
                  (this.tip = t.instance.popper),
                    this._cleanTipClass(),
                    this.addAttachmentClass(this._getAttachment(t.placement));
                }),
                (e._fixTransition = function () {
                  var t = this.getTipElement(),
                    e = this.config.animation;
                  null === t.getAttribute("x-placement") &&
                    (o.default(t).removeClass("fade"),
                    (this.config.animation = !1),
                    this.hide(),
                    this.show(),
                    (this.config.animation = e));
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this),
                      i = n.data("bs.tooltip"),
                      a = "object" == typeof e && e;
                    if (
                      (i || !/dispose|hide/.test(e)) &&
                      (i || ((i = new t(this, a)), n.data("bs.tooltip", i)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof i[e])
                        throw new TypeError('No method named "' + e + '"');
                      i[e]();
                    }
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return Y;
                    },
                  },
                  {
                    key: "NAME",
                    get: function () {
                      return M;
                    },
                  },
                  {
                    key: "DATA_KEY",
                    get: function () {
                      return "bs.tooltip";
                    },
                  },
                  {
                    key: "Event",
                    get: function () {
                      return $;
                    },
                  },
                  {
                    key: "EVENT_KEY",
                    get: function () {
                      return ".bs.tooltip";
                    },
                  },
                  {
                    key: "DefaultType",
                    get: function () {
                      return K;
                    },
                  },
                ]),
                t
              );
            })();
          (o.default.fn[M] = J._jQueryInterface),
            (o.default.fn[M].Constructor = J),
            (o.default.fn[M].noConflict = function () {
              return (o.default.fn[M] = W), J._jQueryInterface;
            });
          var G = "popover",
            Z = o.default.fn[G],
            tt = new RegExp("(^|\\s)bs-popover\\S+", "g"),
            et = r({}, J.Default, {
              placement: "right",
              trigger: "click",
              content: "",
              template:
                '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
            }),
            nt = r({}, J.DefaultType, { content: "(string|element|function)" }),
            it = {
              HIDE: "hide.bs.popover",
              HIDDEN: "hidden.bs.popover",
              SHOW: "show.bs.popover",
              SHOWN: "shown.bs.popover",
              INSERTED: "inserted.bs.popover",
              CLICK: "click.bs.popover",
              FOCUSIN: "focusin.bs.popover",
              FOCUSOUT: "focusout.bs.popover",
              MOUSEENTER: "mouseenter.bs.popover",
              MOUSELEAVE: "mouseleave.bs.popover",
            },
            ot = (function (t) {
              var e, n;
              function i() {
                return t.apply(this, arguments) || this;
              }
              (n = t),
                ((e = i).prototype = Object.create(n.prototype)),
                (e.prototype.constructor = e),
                (e.__proto__ = n);
              var a = i.prototype;
              return (
                (a.isWithContent = function () {
                  return this.getTitle() || this._getContent();
                }),
                (a.addAttachmentClass = function (t) {
                  o.default(this.getTipElement()).addClass("bs-popover-" + t);
                }),
                (a.getTipElement = function () {
                  return (
                    (this.tip = this.tip || o.default(this.config.template)[0]),
                    this.tip
                  );
                }),
                (a.setContent = function () {
                  var t = o.default(this.getTipElement());
                  this.setElementContent(
                    t.find(".popover-header"),
                    this.getTitle()
                  );
                  var e = this._getContent();
                  "function" == typeof e && (e = e.call(this.element)),
                    this.setElementContent(t.find(".popover-body"), e),
                    t.removeClass("fade show");
                }),
                (a._getContent = function () {
                  return (
                    this.element.getAttribute("data-content") ||
                    this.config.content
                  );
                }),
                (a._cleanTipClass = function () {
                  var t = o.default(this.getTipElement()),
                    e = t.attr("class").match(tt);
                  null !== e && e.length > 0 && t.removeClass(e.join(""));
                }),
                (i._jQueryInterface = function (t) {
                  return this.each(function () {
                    var e = o.default(this).data("bs.popover"),
                      n = "object" == typeof t ? t : null;
                    if (
                      (e || !/dispose|hide/.test(t)) &&
                      (e ||
                        ((e = new i(this, n)),
                        o.default(this).data("bs.popover", e)),
                      "string" == typeof t)
                    ) {
                      if ("undefined" == typeof e[t])
                        throw new TypeError('No method named "' + t + '"');
                      e[t]();
                    }
                  });
                }),
                l(i, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return et;
                    },
                  },
                  {
                    key: "NAME",
                    get: function () {
                      return G;
                    },
                  },
                  {
                    key: "DATA_KEY",
                    get: function () {
                      return "bs.popover";
                    },
                  },
                  {
                    key: "Event",
                    get: function () {
                      return it;
                    },
                  },
                  {
                    key: "EVENT_KEY",
                    get: function () {
                      return ".bs.popover";
                    },
                  },
                  {
                    key: "DefaultType",
                    get: function () {
                      return nt;
                    },
                  },
                ]),
                i
              );
            })(J);
          (o.default.fn[G] = ot._jQueryInterface),
            (o.default.fn[G].Constructor = ot),
            (o.default.fn[G].noConflict = function () {
              return (o.default.fn[G] = Z), ot._jQueryInterface;
            });
          var at = "scrollspy",
            st = o.default.fn[at],
            lt = { offset: 10, method: "auto", target: "" },
            rt = {
              offset: "number",
              method: "string",
              target: "(string|element)",
            },
            ut = (function () {
              function t(t, e) {
                var n = this;
                (this._element = t),
                  (this._scrollElement = "BODY" === t.tagName ? window : t),
                  (this._config = this._getConfig(e)),
                  (this._selector =
                    this._config.target +
                    " .nav-link," +
                    this._config.target +
                    " .list-group-item," +
                    this._config.target +
                    " .dropdown-item"),
                  (this._offsets = []),
                  (this._targets = []),
                  (this._activeTarget = null),
                  (this._scrollHeight = 0),
                  o
                    .default(this._scrollElement)
                    .on("scroll.bs.scrollspy", function (t) {
                      return n._process(t);
                    }),
                  this.refresh(),
                  this._process();
              }
              var e = t.prototype;
              return (
                (e.refresh = function () {
                  var t = this,
                    e =
                      this._scrollElement === this._scrollElement.window
                        ? "offset"
                        : "position",
                    n =
                      "auto" === this._config.method ? e : this._config.method,
                    i = "position" === n ? this._getScrollTop() : 0;
                  (this._offsets = []),
                    (this._targets = []),
                    (this._scrollHeight = this._getScrollHeight()),
                    [].slice
                      .call(document.querySelectorAll(this._selector))
                      .map(function (t) {
                        var e,
                          a = d.getSelectorFromElement(t);
                        if ((a && (e = document.querySelector(a)), e)) {
                          var s = e.getBoundingClientRect();
                          if (s.width || s.height)
                            return [o.default(e)[n]().top + i, a];
                        }
                        return null;
                      })
                      .filter(function (t) {
                        return t;
                      })
                      .sort(function (t, e) {
                        return t[0] - e[0];
                      })
                      .forEach(function (e) {
                        t._offsets.push(e[0]), t._targets.push(e[1]);
                      });
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.scrollspy"),
                    o.default(this._scrollElement).off(".bs.scrollspy"),
                    (this._element = null),
                    (this._scrollElement = null),
                    (this._config = null),
                    (this._selector = null),
                    (this._offsets = null),
                    (this._targets = null),
                    (this._activeTarget = null),
                    (this._scrollHeight = null);
                }),
                (e._getConfig = function (t) {
                  if (
                    "string" !=
                      typeof (t = r({}, lt, "object" == typeof t && t ? t : {}))
                        .target &&
                    d.isElement(t.target)
                  ) {
                    var e = o.default(t.target).attr("id");
                    e ||
                      ((e = d.getUID(at)), o.default(t.target).attr("id", e)),
                      (t.target = "#" + e);
                  }
                  return d.typeCheckConfig(at, t, rt), t;
                }),
                (e._getScrollTop = function () {
                  return this._scrollElement === window
                    ? this._scrollElement.pageYOffset
                    : this._scrollElement.scrollTop;
                }),
                (e._getScrollHeight = function () {
                  return (
                    this._scrollElement.scrollHeight ||
                    Math.max(
                      document.body.scrollHeight,
                      document.documentElement.scrollHeight
                    )
                  );
                }),
                (e._getOffsetHeight = function () {
                  return this._scrollElement === window
                    ? window.innerHeight
                    : this._scrollElement.getBoundingClientRect().height;
                }),
                (e._process = function () {
                  var t = this._getScrollTop() + this._config.offset,
                    e = this._getScrollHeight(),
                    n = this._config.offset + e - this._getOffsetHeight();
                  if ((this._scrollHeight !== e && this.refresh(), t >= n)) {
                    var i = this._targets[this._targets.length - 1];
                    this._activeTarget !== i && this._activate(i);
                  } else {
                    if (
                      this._activeTarget &&
                      t < this._offsets[0] &&
                      this._offsets[0] > 0
                    )
                      return (this._activeTarget = null), void this._clear();
                    for (var o = this._offsets.length; o--; ) {
                      this._activeTarget !== this._targets[o] &&
                        t >= this._offsets[o] &&
                        ("undefined" == typeof this._offsets[o + 1] ||
                          t < this._offsets[o + 1]) &&
                        this._activate(this._targets[o]);
                    }
                  }
                }),
                (e._activate = function (t) {
                  (this._activeTarget = t), this._clear();
                  var e = this._selector.split(",").map(function (e) {
                      return (
                        e +
                        '[data-target="' +
                        t +
                        '"],' +
                        e +
                        '[href="' +
                        t +
                        '"]'
                      );
                    }),
                    n = o.default(
                      [].slice.call(document.querySelectorAll(e.join(",")))
                    );
                  n.hasClass("dropdown-item")
                    ? (n
                        .closest(".dropdown")
                        .find(".dropdown-toggle")
                        .addClass("active"),
                      n.addClass("active"))
                    : (n.addClass("active"),
                      n
                        .parents(".nav, .list-group")
                        .prev(".nav-link, .list-group-item")
                        .addClass("active"),
                      n
                        .parents(".nav, .list-group")
                        .prev(".nav-item")
                        .children(".nav-link")
                        .addClass("active")),
                    o
                      .default(this._scrollElement)
                      .trigger("activate.bs.scrollspy", { relatedTarget: t });
                }),
                (e._clear = function () {
                  [].slice
                    .call(document.querySelectorAll(this._selector))
                    .filter(function (t) {
                      return t.classList.contains("active");
                    })
                    .forEach(function (t) {
                      return t.classList.remove("active");
                    });
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this).data("bs.scrollspy");
                    if (
                      (n ||
                        ((n = new t(this, "object" == typeof e && e)),
                        o.default(this).data("bs.scrollspy", n)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof n[e])
                        throw new TypeError('No method named "' + e + '"');
                      n[e]();
                    }
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return lt;
                    },
                  },
                ]),
                t
              );
            })();
          o.default(window).on("load.bs.scrollspy.data-api", function () {
            for (
              var t = [].slice.call(
                  document.querySelectorAll('[data-spy="scroll"]')
                ),
                e = t.length;
              e--;

            ) {
              var n = o.default(t[e]);
              ut._jQueryInterface.call(n, n.data());
            }
          }),
            (o.default.fn[at] = ut._jQueryInterface),
            (o.default.fn[at].Constructor = ut),
            (o.default.fn[at].noConflict = function () {
              return (o.default.fn[at] = st), ut._jQueryInterface;
            });
          var dt = o.default.fn.tab,
            ft = (function () {
              function t(t) {
                this._element = t;
              }
              var e = t.prototype;
              return (
                (e.show = function () {
                  var t = this;
                  if (
                    !(
                      (this._element.parentNode &&
                        this._element.parentNode.nodeType ===
                          Node.ELEMENT_NODE &&
                        o.default(this._element).hasClass("active")) ||
                      o.default(this._element).hasClass("disabled")
                    )
                  ) {
                    var e,
                      n,
                      i = o
                        .default(this._element)
                        .closest(".nav, .list-group")[0],
                      a = d.getSelectorFromElement(this._element);
                    if (i) {
                      var s =
                        "UL" === i.nodeName || "OL" === i.nodeName
                          ? "> li > .active"
                          : ".active";
                      n = (n = o.default.makeArray(o.default(i).find(s)))[
                        n.length - 1
                      ];
                    }
                    var l = o.default.Event("hide.bs.tab", {
                        relatedTarget: this._element,
                      }),
                      r = o.default.Event("show.bs.tab", { relatedTarget: n });
                    if (
                      (n && o.default(n).trigger(l),
                      o.default(this._element).trigger(r),
                      !r.isDefaultPrevented() && !l.isDefaultPrevented())
                    ) {
                      a && (e = document.querySelector(a)),
                        this._activate(this._element, i);
                      var u = function () {
                        var e = o.default.Event("hidden.bs.tab", {
                            relatedTarget: t._element,
                          }),
                          i = o.default.Event("shown.bs.tab", {
                            relatedTarget: n,
                          });
                        o.default(n).trigger(e),
                          o.default(t._element).trigger(i);
                      };
                      e ? this._activate(e, e.parentNode, u) : u();
                    }
                  }
                }),
                (e.dispose = function () {
                  o.default.removeData(this._element, "bs.tab"),
                    (this._element = null);
                }),
                (e._activate = function (t, e, n) {
                  var i = this,
                    a = (
                      !e || ("UL" !== e.nodeName && "OL" !== e.nodeName)
                        ? o.default(e).children(".active")
                        : o.default(e).find("> li > .active")
                    )[0],
                    s = n && a && o.default(a).hasClass("fade"),
                    l = function () {
                      return i._transitionComplete(t, a, n);
                    };
                  if (a && s) {
                    var r = d.getTransitionDurationFromElement(a);
                    o.default(a)
                      .removeClass("show")
                      .one(d.TRANSITION_END, l)
                      .emulateTransitionEnd(r);
                  } else l();
                }),
                (e._transitionComplete = function (t, e, n) {
                  if (e) {
                    o.default(e).removeClass("active");
                    var i = o
                      .default(e.parentNode)
                      .find("> .dropdown-menu .active")[0];
                    i && o.default(i).removeClass("active"),
                      "tab" === e.getAttribute("role") &&
                        e.setAttribute("aria-selected", !1);
                  }
                  if (
                    (o.default(t).addClass("active"),
                    "tab" === t.getAttribute("role") &&
                      t.setAttribute("aria-selected", !0),
                    d.reflow(t),
                    t.classList.contains("fade") && t.classList.add("show"),
                    t.parentNode &&
                      o.default(t.parentNode).hasClass("dropdown-menu"))
                  ) {
                    var a = o.default(t).closest(".dropdown")[0];
                    if (a) {
                      var s = [].slice.call(
                        a.querySelectorAll(".dropdown-toggle")
                      );
                      o.default(s).addClass("active");
                    }
                    t.setAttribute("aria-expanded", !0);
                  }
                  n && n();
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this),
                      i = n.data("bs.tab");
                    if (
                      (i || ((i = new t(this)), n.data("bs.tab", i)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof i[e])
                        throw new TypeError('No method named "' + e + '"');
                      i[e]();
                    }
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                ]),
                t
              );
            })();
          o
            .default(document)
            .on(
              "click.bs.tab.data-api",
              '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
              function (t) {
                t.preventDefault(),
                  ft._jQueryInterface.call(o.default(this), "show");
              }
            ),
            (o.default.fn.tab = ft._jQueryInterface),
            (o.default.fn.tab.Constructor = ft),
            (o.default.fn.tab.noConflict = function () {
              return (o.default.fn.tab = dt), ft._jQueryInterface;
            });
          var ct = o.default.fn.toast,
            ht = { animation: "boolean", autohide: "boolean", delay: "number" },
            gt = { animation: !0, autohide: !0, delay: 500 },
            mt = (function () {
              function t(t, e) {
                (this._element = t),
                  (this._config = this._getConfig(e)),
                  (this._timeout = null),
                  this._setListeners();
              }
              var e = t.prototype;
              return (
                (e.show = function () {
                  var t = this,
                    e = o.default.Event("show.bs.toast");
                  if (
                    (o.default(this._element).trigger(e),
                    !e.isDefaultPrevented())
                  ) {
                    this._clearTimeout(),
                      this._config.animation &&
                        this._element.classList.add("fade");
                    var n = function () {
                      t._element.classList.remove("showing"),
                        t._element.classList.add("show"),
                        o.default(t._element).trigger("shown.bs.toast"),
                        t._config.autohide &&
                          (t._timeout = setTimeout(function () {
                            t.hide();
                          }, t._config.delay));
                    };
                    if (
                      (this._element.classList.remove("hide"),
                      d.reflow(this._element),
                      this._element.classList.add("showing"),
                      this._config.animation)
                    ) {
                      var i = d.getTransitionDurationFromElement(this._element);
                      o.default(this._element)
                        .one(d.TRANSITION_END, n)
                        .emulateTransitionEnd(i);
                    } else n();
                  }
                }),
                (e.hide = function () {
                  if (this._element.classList.contains("show")) {
                    var t = o.default.Event("hide.bs.toast");
                    o.default(this._element).trigger(t),
                      t.isDefaultPrevented() || this._close();
                  }
                }),
                (e.dispose = function () {
                  this._clearTimeout(),
                    this._element.classList.contains("show") &&
                      this._element.classList.remove("show"),
                    o.default(this._element).off("click.dismiss.bs.toast"),
                    o.default.removeData(this._element, "bs.toast"),
                    (this._element = null),
                    (this._config = null);
                }),
                (e._getConfig = function (t) {
                  return (
                    (t = r(
                      {},
                      gt,
                      o.default(this._element).data(),
                      "object" == typeof t && t ? t : {}
                    )),
                    d.typeCheckConfig("toast", t, this.constructor.DefaultType),
                    t
                  );
                }),
                (e._setListeners = function () {
                  var t = this;
                  o.default(this._element).on(
                    "click.dismiss.bs.toast",
                    '[data-dismiss="toast"]',
                    function () {
                      return t.hide();
                    }
                  );
                }),
                (e._close = function () {
                  var t = this,
                    e = function () {
                      t._element.classList.add("hide"),
                        o.default(t._element).trigger("hidden.bs.toast");
                    };
                  if (
                    (this._element.classList.remove("show"),
                    this._config.animation)
                  ) {
                    var n = d.getTransitionDurationFromElement(this._element);
                    o.default(this._element)
                      .one(d.TRANSITION_END, e)
                      .emulateTransitionEnd(n);
                  } else e();
                }),
                (e._clearTimeout = function () {
                  clearTimeout(this._timeout), (this._timeout = null);
                }),
                (t._jQueryInterface = function (e) {
                  return this.each(function () {
                    var n = o.default(this),
                      i = n.data("bs.toast");
                    if (
                      (i ||
                        ((i = new t(this, "object" == typeof e && e)),
                        n.data("bs.toast", i)),
                      "string" == typeof e)
                    ) {
                      if ("undefined" == typeof i[e])
                        throw new TypeError('No method named "' + e + '"');
                      i[e](this);
                    }
                  });
                }),
                l(t, null, [
                  {
                    key: "VERSION",
                    get: function () {
                      return "4.6.0";
                    },
                  },
                  {
                    key: "DefaultType",
                    get: function () {
                      return ht;
                    },
                  },
                  {
                    key: "Default",
                    get: function () {
                      return gt;
                    },
                  },
                ]),
                t
              );
            })();
          (o.default.fn.toast = mt._jQueryInterface),
            (o.default.fn.toast.Constructor = mt),
            (o.default.fn.toast.noConflict = function () {
              return (o.default.fn.toast = ct), mt._jQueryInterface;
            }),
            (t.Alert = h),
            (t.Button = m),
            (t.Carousel = w),
            (t.Collapse = D),
            (t.Dropdown = x),
            (t.Modal = q),
            (t.Popover = ot),
            (t.Scrollspy = ut),
            (t.Tab = ft),
            (t.Toast = mt),
            (t.Tooltip = J),
            (t.Util = d),
            Object.defineProperty(t, "__esModule", { value: !0 });
        });
        //# sourceMappingURL=bootstrap.min.js.map

        /***/
      },

    /***/ "./node_modules/jquery/dist/jquery.js":
      /*!********************************************!*\
  !*** ./node_modules/jquery/dist/jquery.js ***!
  \********************************************/
      /***/ function (module, exports) {
        var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        /*!
         * jQuery JavaScript Library v3.5.1
         * https://jquery.com/
         *
         * Includes Sizzle.js
         * https://sizzlejs.com/
         *
         * Copyright JS Foundation and other contributors
         * Released under the MIT license
         * https://jquery.org/license
         *
         * Date: 2020-05-04T22:49Z
         */
        (function (global, factory) {
          "use strict";

          if (true && typeof module.exports === "object") {
            // For CommonJS and CommonJS-like environments where a proper `window`
            // is present, execute the factory and get jQuery.
            // For environments that do not have a `window` with a `document`
            // (such as Node.js), expose a factory as module.exports.
            // This accentuates the need for the creation of a real `window`.
            // e.g. var jQuery = require("jquery")(window);
            // See ticket #14549 for more info.
            module.exports = global.document
              ? factory(global, true)
              : function (w) {
                  if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                  }
                  return factory(w);
                };
          } else {
            factory(global);
          }

          // Pass this if window is not defined yet
        })(
          typeof window !== "undefined" ? window : this,
          function (window, noGlobal) {
            // Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
            // throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
            // arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
            // enough that all such attempts are guarded in a try block.
            "use strict";

            var arr = [];

            var getProto = Object.getPrototypeOf;

            var slice = arr.slice;

            var flat = arr.flat
              ? function (array) {
                  return arr.flat.call(array);
                }
              : function (array) {
                  return arr.concat.apply([], array);
                };

            var push = arr.push;

            var indexOf = arr.indexOf;

            var class2type = {};

            var toString = class2type.toString;

            var hasOwn = class2type.hasOwnProperty;

            var fnToString = hasOwn.toString;

            var ObjectFunctionString = fnToString.call(Object);

            var support = {};

            var isFunction = function isFunction(obj) {
              // Support: Chrome <=57, Firefox <=52
              // In some browsers, typeof returns "function" for HTML <object> elements
              // (i.e., `typeof document.createElement( "object" ) === "function"`).
              // We don't want to classify *any* DOM node as a function.
              return (
                typeof obj === "function" && typeof obj.nodeType !== "number"
              );
            };

            var isWindow = function isWindow(obj) {
              return obj != null && obj === obj.window;
            };

            var document = window.document;

            var preservedScriptAttributes = {
              type: true,
              src: true,
              nonce: true,
              noModule: true,
            };

            function DOMEval(code, node, doc) {
              doc = doc || document;

              var i,
                val,
                script = doc.createElement("script");

              script.text = code;
              if (node) {
                for (i in preservedScriptAttributes) {
                  // Support: Firefox 64+, Edge 18+
                  // Some browsers don't support the "nonce" property on scripts.
                  // On the other hand, just using `getAttribute` is not enough as
                  // the `nonce` attribute is reset to an empty string whenever it
                  // becomes browsing-context connected.
                  // See https://github.com/whatwg/html/issues/2369
                  // See https://html.spec.whatwg.org/#nonce-attributes
                  // The `node.getAttribute` check was added for the sake of
                  // `jQuery.globalEval` so that it can fake a nonce-containing node
                  // via an object.
                  val = node[i] || (node.getAttribute && node.getAttribute(i));
                  if (val) {
                    script.setAttribute(i, val);
                  }
                }
              }
              doc.head.appendChild(script).parentNode.removeChild(script);
            }

            function toType(obj) {
              if (obj == null) {
                return obj + "";
              }

              // Support: Android <=2.3 only (functionish RegExp)
              return typeof obj === "object" || typeof obj === "function"
                ? class2type[toString.call(obj)] || "object"
                : typeof obj;
            }
            /* global Symbol */
            // Defining this global in .eslintrc.json would create a danger of using the global
            // unguarded in another place, it seems safer to define global only for this module

            var version = "3.5.1",
              // Define a local copy of jQuery
              jQuery = function (selector, context) {
                // The jQuery object is actually just the init constructor 'enhanced'
                // Need init if jQuery is called (just allow error to be thrown if not included)
                return new jQuery.fn.init(selector, context);
              };

            jQuery.fn = jQuery.prototype = {
              // The current version of jQuery being used
              jquery: version,

              constructor: jQuery,

              // The default length of a jQuery object is 0
              length: 0,

              toArray: function () {
                return slice.call(this);
              },

              // Get the Nth element in the matched element set OR
              // Get the whole matched element set as a clean array
              get: function (num) {
                // Return all the elements in a clean array
                if (num == null) {
                  return slice.call(this);
                }

                // Return just the one element from the set
                return num < 0 ? this[num + this.length] : this[num];
              },

              // Take an array of elements and push it onto the stack
              // (returning the new matched element set)
              pushStack: function (elems) {
                // Build a new jQuery matched element set
                var ret = jQuery.merge(this.constructor(), elems);

                // Add the old object onto the stack (as a reference)
                ret.prevObject = this;

                // Return the newly-formed element set
                return ret;
              },

              // Execute a callback for every element in the matched set.
              each: function (callback) {
                return jQuery.each(this, callback);
              },

              map: function (callback) {
                return this.pushStack(
                  jQuery.map(this, function (elem, i) {
                    return callback.call(elem, i, elem);
                  })
                );
              },

              slice: function () {
                return this.pushStack(slice.apply(this, arguments));
              },

              first: function () {
                return this.eq(0);
              },

              last: function () {
                return this.eq(-1);
              },

              even: function () {
                return this.pushStack(
                  jQuery.grep(this, function (_elem, i) {
                    return (i + 1) % 2;
                  })
                );
              },

              odd: function () {
                return this.pushStack(
                  jQuery.grep(this, function (_elem, i) {
                    return i % 2;
                  })
                );
              },

              eq: function (i) {
                var len = this.length,
                  j = +i + (i < 0 ? len : 0);
                return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
              },

              end: function () {
                return this.prevObject || this.constructor();
              },

              // For internal use only.
              // Behaves like an Array's method, not like a jQuery method.
              push: push,
              sort: arr.sort,
              splice: arr.splice,
            };

            jQuery.extend = jQuery.fn.extend = function () {
              var options,
                name,
                src,
                copy,
                copyIsArray,
                clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

              // Handle a deep copy situation
              if (typeof target === "boolean") {
                deep = target;

                // Skip the boolean and the target
                target = arguments[i] || {};
                i++;
              }

              // Handle case when target is a string or something (possible in deep copy)
              if (typeof target !== "object" && !isFunction(target)) {
                target = {};
              }

              // Extend jQuery itself if only one argument is passed
              if (i === length) {
                target = this;
                i--;
              }

              for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) != null) {
                  // Extend the base object
                  for (name in options) {
                    copy = options[name];

                    // Prevent Object.prototype pollution
                    // Prevent never-ending loop
                    if (name === "__proto__" || target === copy) {
                      continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (
                      deep &&
                      copy &&
                      (jQuery.isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))
                    ) {
                      src = target[name];

                      // Ensure proper type for the source value
                      if (copyIsArray && !Array.isArray(src)) {
                        clone = [];
                      } else if (!copyIsArray && !jQuery.isPlainObject(src)) {
                        clone = {};
                      } else {
                        clone = src;
                      }
                      copyIsArray = false;

                      // Never move original objects, clone them
                      target[name] = jQuery.extend(deep, clone, copy);

                      // Don't bring in undefined values
                    } else if (copy !== undefined) {
                      target[name] = copy;
                    }
                  }
                }
              }

              // Return the modified object
              return target;
            };

            jQuery.extend({
              // Unique for each copy of jQuery on the page
              expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

              // Assume jQuery is ready without the ready module
              isReady: true,

              error: function (msg) {
                throw new Error(msg);
              },

              noop: function () {},

              isPlainObject: function (obj) {
                var proto, Ctor;

                // Detect obvious negatives
                // Use toString instead of jQuery.type to catch host objects
                if (!obj || toString.call(obj) !== "[object Object]") {
                  return false;
                }

                proto = getProto(obj);

                // Objects with no prototype (e.g., `Object.create( null )`) are plain
                if (!proto) {
                  return true;
                }

                // Objects with prototype are plain iff they were constructed by a global Object function
                Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
                return (
                  typeof Ctor === "function" &&
                  fnToString.call(Ctor) === ObjectFunctionString
                );
              },

              isEmptyObject: function (obj) {
                var name;

                for (name in obj) {
                  return false;
                }
                return true;
              },

              // Evaluates a script in a provided context; falls back to the global one
              // if not specified.
              globalEval: function (code, options, doc) {
                DOMEval(code, { nonce: options && options.nonce }, doc);
              },

              each: function (obj, callback) {
                var length,
                  i = 0;

                if (isArrayLike(obj)) {
                  length = obj.length;
                  for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                      break;
                    }
                  }
                } else {
                  for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                      break;
                    }
                  }
                }

                return obj;
              },

              // results is for internal usage only
              makeArray: function (arr, results) {
                var ret = results || [];

                if (arr != null) {
                  if (isArrayLike(Object(arr))) {
                    jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
                  } else {
                    push.call(ret, arr);
                  }
                }

                return ret;
              },

              inArray: function (elem, arr, i) {
                return arr == null ? -1 : indexOf.call(arr, elem, i);
              },

              // Support: Android <=4.0 only, PhantomJS 1 only
              // push.apply(_, arraylike) throws on ancient WebKit
              merge: function (first, second) {
                var len = +second.length,
                  j = 0,
                  i = first.length;

                for (; j < len; j++) {
                  first[i++] = second[j];
                }

                first.length = i;

                return first;
              },

              grep: function (elems, callback, invert) {
                var callbackInverse,
                  matches = [],
                  i = 0,
                  length = elems.length,
                  callbackExpect = !invert;

                // Go through the array, only saving the items
                // that pass the validator function
                for (; i < length; i++) {
                  callbackInverse = !callback(elems[i], i);
                  if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                  }
                }

                return matches;
              },

              // arg is for internal usage only
              map: function (elems, callback, arg) {
                var length,
                  value,
                  i = 0,
                  ret = [];

                // Go through the array, translating each of the items to their new values
                if (isArrayLike(elems)) {
                  length = elems.length;
                  for (; i < length; i++) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                      ret.push(value);
                    }
                  }

                  // Go through every key on the object,
                } else {
                  for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                      ret.push(value);
                    }
                  }
                }

                // Flatten any nested arrays
                return flat(ret);
              },

              // A global GUID counter for objects
              guid: 1,

              // jQuery.support is not used in Core but other projects attach their
              // properties to it so it needs to exist.
              support: support,
            });

            if (typeof Symbol === "function") {
              jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
            }

            // Populate the class2type map
            jQuery.each(
              "Boolean Number String Function Array Date RegExp Object Error Symbol".split(
                " "
              ),
              function (_i, name) {
                class2type["[object " + name + "]"] = name.toLowerCase();
              }
            );

            function isArrayLike(obj) {
              // Support: real iOS 8.2 only (not reproducible in simulator)
              // `in` check used to prevent JIT error (gh-2145)
              // hasOwn isn't used here due to false negatives
              // regarding Nodelist length in IE
              var length = !!obj && "length" in obj && obj.length,
                type = toType(obj);

              if (isFunction(obj) || isWindow(obj)) {
                return false;
              }

              return (
                type === "array" ||
                length === 0 ||
                (typeof length === "number" && length > 0 && length - 1 in obj)
              );
            }
            var Sizzle =
              /*!
               * Sizzle CSS Selector Engine v2.3.5
               * https://sizzlejs.com/
               *
               * Copyright JS Foundation and other contributors
               * Released under the MIT license
               * https://js.foundation/
               *
               * Date: 2020-03-14
               */
              (function (window) {
                var i,
                  support,
                  Expr,
                  getText,
                  isXML,
                  tokenize,
                  compile,
                  select,
                  outermostContext,
                  sortInput,
                  hasDuplicate,
                  // Local document vars
                  setDocument,
                  document,
                  docElem,
                  documentIsHTML,
                  rbuggyQSA,
                  rbuggyMatches,
                  matches,
                  contains,
                  // Instance-specific data
                  expando = "sizzle" + 1 * new Date(),
                  preferredDoc = window.document,
                  dirruns = 0,
                  done = 0,
                  classCache = createCache(),
                  tokenCache = createCache(),
                  compilerCache = createCache(),
                  nonnativeSelectorCache = createCache(),
                  sortOrder = function (a, b) {
                    if (a === b) {
                      hasDuplicate = true;
                    }
                    return 0;
                  },
                  // Instance methods
                  hasOwn = {}.hasOwnProperty,
                  arr = [],
                  pop = arr.pop,
                  pushNative = arr.push,
                  push = arr.push,
                  slice = arr.slice,
                  // Use a stripped-down indexOf as it's faster than native
                  // https://jsperf.com/thor-indexof-vs-for/5
                  indexOf = function (list, elem) {
                    var i = 0,
                      len = list.length;
                    for (; i < len; i++) {
                      if (list[i] === elem) {
                        return i;
                      }
                    }
                    return -1;
                  },
                  booleans =
                    "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
                    "ismap|loop|multiple|open|readonly|required|scoped",
                  // Regular expressions

                  // http://www.w3.org/TR/css3-selectors/#whitespace
                  whitespace = "[\\x20\\t\\r\\n\\f]",
                  // https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
                  identifier =
                    "(?:\\\\[\\da-fA-F]{1,6}" +
                    whitespace +
                    "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",
                  // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
                  attributes =
                    "\\[" +
                    whitespace +
                    "*(" +
                    identifier +
                    ")(?:" +
                    whitespace +
                    // Operator (capture 2)
                    "*([*^$|!~]?=)" +
                    whitespace +
                    // "Attribute values must be CSS identifiers [capture 5]
                    // or strings [capture 3 or capture 4]"
                    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" +
                    identifier +
                    "))|)" +
                    whitespace +
                    "*\\]",
                  pseudos =
                    ":(" +
                    identifier +
                    ")(?:\\((" +
                    // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
                    // 1. quoted (capture 3; capture 4 or capture 5)
                    "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
                    // 2. simple (capture 6)
                    "((?:\\\\.|[^\\\\()[\\]]|" +
                    attributes +
                    ")*)|" +
                    // 3. anything else (capture 2)
                    ".*" +
                    ")\\)|)",
                  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
                  rwhitespace = new RegExp(whitespace + "+", "g"),
                  rtrim = new RegExp(
                    "^" +
                      whitespace +
                      "+|((?:^|[^\\\\])(?:\\\\.)*)" +
                      whitespace +
                      "+$",
                    "g"
                  ),
                  rcomma = new RegExp(
                    "^" + whitespace + "*," + whitespace + "*"
                  ),
                  rcombinators = new RegExp(
                    "^" +
                      whitespace +
                      "*([>+~]|" +
                      whitespace +
                      ")" +
                      whitespace +
                      "*"
                  ),
                  rdescend = new RegExp(whitespace + "|>"),
                  rpseudo = new RegExp(pseudos),
                  ridentifier = new RegExp("^" + identifier + "$"),
                  matchExpr = {
                    ID: new RegExp("^#(" + identifier + ")"),
                    CLASS: new RegExp("^\\.(" + identifier + ")"),
                    TAG: new RegExp("^(" + identifier + "|[*])"),
                    ATTR: new RegExp("^" + attributes),
                    PSEUDO: new RegExp("^" + pseudos),
                    CHILD: new RegExp(
                      "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
                        whitespace +
                        "*(even|odd|(([+-]|)(\\d*)n|)" +
                        whitespace +
                        "*(?:([+-]|)" +
                        whitespace +
                        "*(\\d+)|))" +
                        whitespace +
                        "*\\)|)",
                      "i"
                    ),
                    bool: new RegExp("^(?:" + booleans + ")$", "i"),

                    // For use in libraries implementing .is()
                    // We use this for POS matching in `select`
                    needsContext: new RegExp(
                      "^" +
                        whitespace +
                        "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                        whitespace +
                        "*((?:-\\d)?\\d*)" +
                        whitespace +
                        "*\\)|)(?=[^-]|$)",
                      "i"
                    ),
                  },
                  rhtml = /HTML$/i,
                  rinputs = /^(?:input|select|textarea|button)$/i,
                  rheader = /^h\d$/i,
                  rnative = /^[^{]+\{\s*\[native \w/,
                  // Easily-parseable/retrievable ID or TAG or CLASS selectors
                  rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                  rsibling = /[+~]/,
                  // CSS escapes
                  // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
                  runescape = new RegExp(
                    "\\\\[\\da-fA-F]{1,6}" +
                      whitespace +
                      "?|\\\\([^\\r\\n\\f])",
                    "g"
                  ),
                  funescape = function (escape, nonHex) {
                    var high = "0x" + escape.slice(1) - 0x10000;

                    return nonHex
                      ? // Strip the backslash prefix from a non-hex escape sequence
                        nonHex
                      : // Replace a hexadecimal escape sequence with the encoded Unicode code point
                      // Support: IE <=11+
                      // For values outside the Basic Multilingual Plane (BMP), manually construct a
                      // surrogate pair
                      high < 0
                      ? String.fromCharCode(high + 0x10000)
                      : String.fromCharCode(
                          (high >> 10) | 0xd800,
                          (high & 0x3ff) | 0xdc00
                        );
                  },
                  // CSS string/identifier serialization
                  // https://drafts.csswg.org/cssom/#common-serializing-idioms
                  rcssescape =
                    /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
                  fcssescape = function (ch, asCodePoint) {
                    if (asCodePoint) {
                      // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
                      if (ch === "\0") {
                        return "\uFFFD";
                      }

                      // Control characters and (dependent upon position) numbers get escaped as code points
                      return (
                        ch.slice(0, -1) +
                        "\\" +
                        ch.charCodeAt(ch.length - 1).toString(16) +
                        " "
                      );
                    }

                    // Other potentially-special ASCII characters get backslash-escaped
                    return "\\" + ch;
                  },
                  // Used for iframes
                  // See setDocument()
                  // Removing the function wrapper causes a "Permission Denied"
                  // error in IE
                  unloadHandler = function () {
                    setDocument();
                  },
                  inDisabledFieldset = addCombinator(
                    function (elem) {
                      return (
                        elem.disabled === true &&
                        elem.nodeName.toLowerCase() === "fieldset"
                      );
                    },
                    { dir: "parentNode", next: "legend" }
                  );

                // Optimize for push.apply( _, NodeList )
                try {
                  push.apply(
                    (arr = slice.call(preferredDoc.childNodes)),
                    preferredDoc.childNodes
                  );

                  // Support: Android<4.0
                  // Detect silently failing push.apply
                  // eslint-disable-next-line no-unused-expressions
                  arr[preferredDoc.childNodes.length].nodeType;
                } catch (e) {
                  push = {
                    apply: arr.length
                      ? // Leverage slice if possible
                        function (target, els) {
                          pushNative.apply(target, slice.call(els));
                        }
                      : // Support: IE<9
                        // Otherwise append directly
                        function (target, els) {
                          var j = target.length,
                            i = 0;

                          // Can't trust NodeList.length
                          while ((target[j++] = els[i++])) {}
                          target.length = j - 1;
                        },
                  };
                }

                function Sizzle(selector, context, results, seed) {
                  var m,
                    i,
                    elem,
                    nid,
                    match,
                    groups,
                    newSelector,
                    newContext = context && context.ownerDocument,
                    // nodeType defaults to 9, since context defaults to document
                    nodeType = context ? context.nodeType : 9;

                  results = results || [];

                  // Return early from calls with invalid selector or context
                  if (
                    typeof selector !== "string" ||
                    !selector ||
                    (nodeType !== 1 && nodeType !== 9 && nodeType !== 11)
                  ) {
                    return results;
                  }

                  // Try to shortcut find operations (as opposed to filters) in HTML documents
                  if (!seed) {
                    setDocument(context);
                    context = context || document;

                    if (documentIsHTML) {
                      // If the selector is sufficiently simple, try using a "get*By*" DOM method
                      // (excepting DocumentFragment context, where the methods don't exist)
                      if (
                        nodeType !== 11 &&
                        (match = rquickExpr.exec(selector))
                      ) {
                        // ID selector
                        if ((m = match[1])) {
                          // Document context
                          if (nodeType === 9) {
                            if ((elem = context.getElementById(m))) {
                              // Support: IE, Opera, Webkit
                              // TODO: identify versions
                              // getElementById can match elements by name instead of ID
                              if (elem.id === m) {
                                results.push(elem);
                                return results;
                              }
                            } else {
                              return results;
                            }

                            // Element context
                          } else {
                            // Support: IE, Opera, Webkit
                            // TODO: identify versions
                            // getElementById can match elements by name instead of ID
                            if (
                              newContext &&
                              (elem = newContext.getElementById(m)) &&
                              contains(context, elem) &&
                              elem.id === m
                            ) {
                              results.push(elem);
                              return results;
                            }
                          }

                          // Type selector
                        } else if (match[2]) {
                          push.apply(
                            results,
                            context.getElementsByTagName(selector)
                          );
                          return results;

                          // Class selector
                        } else if (
                          (m = match[3]) &&
                          support.getElementsByClassName &&
                          context.getElementsByClassName
                        ) {
                          push.apply(
                            results,
                            context.getElementsByClassName(m)
                          );
                          return results;
                        }
                      }

                      // Take advantage of querySelectorAll
                      if (
                        support.qsa &&
                        !nonnativeSelectorCache[selector + " "] &&
                        (!rbuggyQSA || !rbuggyQSA.test(selector)) &&
                        // Support: IE 8 only
                        // Exclude object elements
                        (nodeType !== 1 ||
                          context.nodeName.toLowerCase() !== "object")
                      ) {
                        newSelector = selector;
                        newContext = context;

                        // qSA considers elements outside a scoping root when evaluating child or
                        // descendant combinators, which is not what we want.
                        // In such cases, we work around the behavior by prefixing every selector in the
                        // list with an ID selector referencing the scope context.
                        // The technique has to be used as well when a leading combinator is used
                        // as such selectors are not recognized by querySelectorAll.
                        // Thanks to Andrew Dupont for this technique.
                        if (
                          nodeType === 1 &&
                          (rdescend.test(selector) ||
                            rcombinators.test(selector))
                        ) {
                          // Expand context for sibling selectors
                          newContext =
                            (rsibling.test(selector) &&
                              testContext(context.parentNode)) ||
                            context;

                          // We can use :scope instead of the ID hack if the browser
                          // supports it & if we're not changing the context.
                          if (newContext !== context || !support.scope) {
                            // Capture the context ID, setting it first if necessary
                            if ((nid = context.getAttribute("id"))) {
                              nid = nid.replace(rcssescape, fcssescape);
                            } else {
                              context.setAttribute("id", (nid = expando));
                            }
                          }

                          // Prefix every selector in the list
                          groups = tokenize(selector);
                          i = groups.length;
                          while (i--) {
                            groups[i] =
                              (nid ? "#" + nid : ":scope") +
                              " " +
                              toSelector(groups[i]);
                          }
                          newSelector = groups.join(",");
                        }

                        try {
                          push.apply(
                            results,
                            newContext.querySelectorAll(newSelector)
                          );
                          return results;
                        } catch (qsaError) {
                          nonnativeSelectorCache(selector, true);
                        } finally {
                          if (nid === expando) {
                            context.removeAttribute("id");
                          }
                        }
                      }
                    }
                  }

                  // All others
                  return select(
                    selector.replace(rtrim, "$1"),
                    context,
                    results,
                    seed
                  );
                }

                /**
                 * Create key-value caches of limited size
                 * @returns {function(string, object)} Returns the Object data after storing it on itself with
                 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
                 *	deleting the oldest entry
                 */
                function createCache() {
                  var keys = [];

                  function cache(key, value) {
                    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
                    if (keys.push(key + " ") > Expr.cacheLength) {
                      // Only keep the most recent entries
                      delete cache[keys.shift()];
                    }
                    return (cache[key + " "] = value);
                  }
                  return cache;
                }

                /**
                 * Mark a function for special use by Sizzle
                 * @param {Function} fn The function to mark
                 */
                function markFunction(fn) {
                  fn[expando] = true;
                  return fn;
                }

                /**
                 * Support testing using an element
                 * @param {Function} fn Passed the created element and returns a boolean result
                 */
                function assert(fn) {
                  var el = document.createElement("fieldset");

                  try {
                    return !!fn(el);
                  } catch (e) {
                    return false;
                  } finally {
                    // Remove from its parent by default
                    if (el.parentNode) {
                      el.parentNode.removeChild(el);
                    }

                    // release memory in IE
                    el = null;
                  }
                }

                /**
                 * Adds the same handler for all of the specified attrs
                 * @param {String} attrs Pipe-separated list of attributes
                 * @param {Function} handler The method that will be applied
                 */
                function addHandle(attrs, handler) {
                  var arr = attrs.split("|"),
                    i = arr.length;

                  while (i--) {
                    Expr.attrHandle[arr[i]] = handler;
                  }
                }

                /**
                 * Checks document order of two siblings
                 * @param {Element} a
                 * @param {Element} b
                 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
                 */
                function siblingCheck(a, b) {
                  var cur = b && a,
                    diff =
                      cur &&
                      a.nodeType === 1 &&
                      b.nodeType === 1 &&
                      a.sourceIndex - b.sourceIndex;

                  // Use IE sourceIndex if available on both nodes
                  if (diff) {
                    return diff;
                  }

                  // Check if b follows a
                  if (cur) {
                    while ((cur = cur.nextSibling)) {
                      if (cur === b) {
                        return -1;
                      }
                    }
                  }

                  return a ? 1 : -1;
                }

                /**
                 * Returns a function to use in pseudos for input types
                 * @param {String} type
                 */
                function createInputPseudo(type) {
                  return function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return name === "input" && elem.type === type;
                  };
                }

                /**
                 * Returns a function to use in pseudos for buttons
                 * @param {String} type
                 */
                function createButtonPseudo(type) {
                  return function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return (
                      (name === "input" || name === "button") &&
                      elem.type === type
                    );
                  };
                }

                /**
                 * Returns a function to use in pseudos for :enabled/:disabled
                 * @param {Boolean} disabled true for :disabled; false for :enabled
                 */
                function createDisabledPseudo(disabled) {
                  // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
                  return function (elem) {
                    // Only certain elements can match :enabled or :disabled
                    // https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
                    // https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
                    if ("form" in elem) {
                      // Check for inherited disabledness on relevant non-disabled elements:
                      // * listed form-associated elements in a disabled fieldset
                      //   https://html.spec.whatwg.org/multipage/forms.html#category-listed
                      //   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
                      // * option elements in a disabled optgroup
                      //   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
                      // All such elements have a "form" property.
                      if (elem.parentNode && elem.disabled === false) {
                        // Option elements defer to a parent optgroup if present
                        if ("label" in elem) {
                          if ("label" in elem.parentNode) {
                            return elem.parentNode.disabled === disabled;
                          } else {
                            return elem.disabled === disabled;
                          }
                        }

                        // Support: IE 6 - 11
                        // Use the isDisabled shortcut property to check for disabled fieldset ancestors
                        return (
                          elem.isDisabled === disabled ||
                          // Where there is no isDisabled, check manually
                          /* jshint -W018 */
                          (elem.isDisabled !== !disabled &&
                            inDisabledFieldset(elem) === disabled)
                        );
                      }

                      return elem.disabled === disabled;

                      // Try to winnow out elements that can't be disabled before trusting the disabled property.
                      // Some victims get caught in our net (label, legend, menu, track), but it shouldn't
                      // even exist on them, let alone have a boolean value.
                    } else if ("label" in elem) {
                      return elem.disabled === disabled;
                    }

                    // Remaining elements are neither :enabled nor :disabled
                    return false;
                  };
                }

                /**
                 * Returns a function to use in pseudos for positionals
                 * @param {Function} fn
                 */
                function createPositionalPseudo(fn) {
                  return markFunction(function (argument) {
                    argument = +argument;
                    return markFunction(function (seed, matches) {
                      var j,
                        matchIndexes = fn([], seed.length, argument),
                        i = matchIndexes.length;

                      // Match elements found at the specified indexes
                      while (i--) {
                        if (seed[(j = matchIndexes[i])]) {
                          seed[j] = !(matches[j] = seed[j]);
                        }
                      }
                    });
                  });
                }

                /**
                 * Checks a node for validity as a Sizzle context
                 * @param {Element|Object=} context
                 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
                 */
                function testContext(context) {
                  return (
                    context &&
                    typeof context.getElementsByTagName !== "undefined" &&
                    context
                  );
                }

                // Expose support vars for convenience
                support = Sizzle.support = {};

                /**
                 * Detects XML nodes
                 * @param {Element|Object} elem An element or a document
                 * @returns {Boolean} True iff elem is a non-HTML XML node
                 */
                isXML = Sizzle.isXML = function (elem) {
                  var namespace = elem.namespaceURI,
                    docElem = (elem.ownerDocument || elem).documentElement;

                  // Support: IE <=8
                  // Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
                  // https://bugs.jquery.com/ticket/4833
                  return !rhtml.test(
                    namespace || (docElem && docElem.nodeName) || "HTML"
                  );
                };

                /**
                 * Sets document-related variables once based on the current document
                 * @param {Element|Object} [doc] An element or document object to use to set the document
                 * @returns {Object} Returns the current document
                 */
                setDocument = Sizzle.setDocument = function (node) {
                  var hasCompare,
                    subWindow,
                    doc = node ? node.ownerDocument || node : preferredDoc;

                  // Return early if doc is invalid or already selected
                  // Support: IE 11+, Edge 17 - 18+
                  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                  // two documents; shallow comparisons work.
                  // eslint-disable-next-line eqeqeq
                  if (
                    doc == document ||
                    doc.nodeType !== 9 ||
                    !doc.documentElement
                  ) {
                    return document;
                  }

                  // Update global variables
                  document = doc;
                  docElem = document.documentElement;
                  documentIsHTML = !isXML(document);

                  // Support: IE 9 - 11+, Edge 12 - 18+
                  // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
                  // Support: IE 11+, Edge 17 - 18+
                  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                  // two documents; shallow comparisons work.
                  // eslint-disable-next-line eqeqeq
                  if (
                    preferredDoc != document &&
                    (subWindow = document.defaultView) &&
                    subWindow.top !== subWindow
                  ) {
                    // Support: IE 11, Edge
                    if (subWindow.addEventListener) {
                      subWindow.addEventListener(
                        "unload",
                        unloadHandler,
                        false
                      );

                      // Support: IE 9 - 10 only
                    } else if (subWindow.attachEvent) {
                      subWindow.attachEvent("onunload", unloadHandler);
                    }
                  }

                  // Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
                  // Safari 4 - 5 only, Opera <=11.6 - 12.x only
                  // IE/Edge & older browsers don't support the :scope pseudo-class.
                  // Support: Safari 6.0 only
                  // Safari 6.0 supports :scope but it's an alias of :root there.
                  support.scope = assert(function (el) {
                    docElem
                      .appendChild(el)
                      .appendChild(document.createElement("div"));
                    return (
                      typeof el.querySelectorAll !== "undefined" &&
                      !el.querySelectorAll(":scope fieldset div").length
                    );
                  });

                  /* Attributes
	---------------------------------------------------------------------- */

                  // Support: IE<8
                  // Verify that getAttribute really returns attributes and not properties
                  // (excepting IE8 booleans)
                  support.attributes = assert(function (el) {
                    el.className = "i";
                    return !el.getAttribute("className");
                  });

                  /* getElement(s)By*
	---------------------------------------------------------------------- */

                  // Check if getElementsByTagName("*") returns only elements
                  support.getElementsByTagName = assert(function (el) {
                    el.appendChild(document.createComment(""));
                    return !el.getElementsByTagName("*").length;
                  });

                  // Support: IE<9
                  support.getElementsByClassName = rnative.test(
                    document.getElementsByClassName
                  );

                  // Support: IE<10
                  // Check if getElementById returns elements by name
                  // The broken getElementById methods don't pick up programmatically-set names,
                  // so use a roundabout getElementsByName test
                  support.getById = assert(function (el) {
                    docElem.appendChild(el).id = expando;
                    return (
                      !document.getElementsByName ||
                      !document.getElementsByName(expando).length
                    );
                  });

                  // ID filter and find
                  if (support.getById) {
                    Expr.filter["ID"] = function (id) {
                      var attrId = id.replace(runescape, funescape);
                      return function (elem) {
                        return elem.getAttribute("id") === attrId;
                      };
                    };
                    Expr.find["ID"] = function (id, context) {
                      if (
                        typeof context.getElementById !== "undefined" &&
                        documentIsHTML
                      ) {
                        var elem = context.getElementById(id);
                        return elem ? [elem] : [];
                      }
                    };
                  } else {
                    Expr.filter["ID"] = function (id) {
                      var attrId = id.replace(runescape, funescape);
                      return function (elem) {
                        var node =
                          typeof elem.getAttributeNode !== "undefined" &&
                          elem.getAttributeNode("id");
                        return node && node.value === attrId;
                      };
                    };

                    // Support: IE 6 - 7 only
                    // getElementById is not reliable as a find shortcut
                    Expr.find["ID"] = function (id, context) {
                      if (
                        typeof context.getElementById !== "undefined" &&
                        documentIsHTML
                      ) {
                        var node,
                          i,
                          elems,
                          elem = context.getElementById(id);

                        if (elem) {
                          // Verify the id attribute
                          node = elem.getAttributeNode("id");
                          if (node && node.value === id) {
                            return [elem];
                          }

                          // Fall back on getElementsByName
                          elems = context.getElementsByName(id);
                          i = 0;
                          while ((elem = elems[i++])) {
                            node = elem.getAttributeNode("id");
                            if (node && node.value === id) {
                              return [elem];
                            }
                          }
                        }

                        return [];
                      }
                    };
                  }

                  // Tag
                  Expr.find["TAG"] = support.getElementsByTagName
                    ? function (tag, context) {
                        if (
                          typeof context.getElementsByTagName !== "undefined"
                        ) {
                          return context.getElementsByTagName(tag);

                          // DocumentFragment nodes don't have gEBTN
                        } else if (support.qsa) {
                          return context.querySelectorAll(tag);
                        }
                      }
                    : function (tag, context) {
                        var elem,
                          tmp = [],
                          i = 0,
                          // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
                          results = context.getElementsByTagName(tag);

                        // Filter out possible comments
                        if (tag === "*") {
                          while ((elem = results[i++])) {
                            if (elem.nodeType === 1) {
                              tmp.push(elem);
                            }
                          }

                          return tmp;
                        }
                        return results;
                      };

                  // Class
                  Expr.find["CLASS"] =
                    support.getElementsByClassName &&
                    function (className, context) {
                      if (
                        typeof context.getElementsByClassName !== "undefined" &&
                        documentIsHTML
                      ) {
                        return context.getElementsByClassName(className);
                      }
                    };

                  /* QSA/matchesSelector
	---------------------------------------------------------------------- */

                  // QSA and matchesSelector support

                  // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
                  rbuggyMatches = [];

                  // qSa(:focus) reports false when true (Chrome 21)
                  // We allow this because of a bug in IE8/9 that throws an error
                  // whenever `document.activeElement` is accessed on an iframe
                  // So, we allow :focus to pass through QSA all the time to avoid the IE error
                  // See https://bugs.jquery.com/ticket/13378
                  rbuggyQSA = [];

                  if ((support.qsa = rnative.test(document.querySelectorAll))) {
                    // Build QSA regex
                    // Regex strategy adopted from Diego Perini
                    assert(function (el) {
                      var input;

                      // Select is set to empty string on purpose
                      // This is to test IE's treatment of not explicitly
                      // setting a boolean content attribute,
                      // since its presence should be enough
                      // https://bugs.jquery.com/ticket/12359
                      docElem.appendChild(el).innerHTML =
                        "<a id='" +
                        expando +
                        "'></a>" +
                        "<select id='" +
                        expando +
                        "-\r\\' msallowcapture=''>" +
                        "<option selected=''></option></select>";

                      // Support: IE8, Opera 11-12.16
                      // Nothing should be selected when empty strings follow ^= or $= or *=
                      // The test attribute must be unknown in Opera but "safe" for WinRT
                      // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
                      if (el.querySelectorAll("[msallowcapture^='']").length) {
                        rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                      }

                      // Support: IE8
                      // Boolean attributes and "value" are not treated correctly
                      if (!el.querySelectorAll("[selected]").length) {
                        rbuggyQSA.push(
                          "\\[" + whitespace + "*(?:value|" + booleans + ")"
                        );
                      }

                      // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
                      if (
                        !el.querySelectorAll("[id~=" + expando + "-]").length
                      ) {
                        rbuggyQSA.push("~=");
                      }

                      // Support: IE 11+, Edge 15 - 18+
                      // IE 11/Edge don't find elements on a `[name='']` query in some cases.
                      // Adding a temporary attribute to the document before the selection works
                      // around the issue.
                      // Interestingly, IE 10 & older don't seem to have the issue.
                      input = document.createElement("input");
                      input.setAttribute("name", "");
                      el.appendChild(input);
                      if (!el.querySelectorAll("[name='']").length) {
                        rbuggyQSA.push(
                          "\\[" +
                            whitespace +
                            "*name" +
                            whitespace +
                            "*=" +
                            whitespace +
                            "*(?:''|\"\")"
                        );
                      }

                      // Webkit/Opera - :checked should return selected option elements
                      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                      // IE8 throws error here and will not see later tests
                      if (!el.querySelectorAll(":checked").length) {
                        rbuggyQSA.push(":checked");
                      }

                      // Support: Safari 8+, iOS 8+
                      // https://bugs.webkit.org/show_bug.cgi?id=136851
                      // In-page `selector#id sibling-combinator selector` fails
                      if (!el.querySelectorAll("a#" + expando + "+*").length) {
                        rbuggyQSA.push(".#.+[+~]");
                      }

                      // Support: Firefox <=3.6 - 5 only
                      // Old Firefox doesn't throw on a badly-escaped identifier.
                      el.querySelectorAll("\\\f");
                      rbuggyQSA.push("[\\r\\n\\f]");
                    });

                    assert(function (el) {
                      el.innerHTML =
                        "<a href='' disabled='disabled'></a>" +
                        "<select disabled='disabled'><option/></select>";

                      // Support: Windows 8 Native Apps
                      // The type and name attributes are restricted during .innerHTML assignment
                      var input = document.createElement("input");
                      input.setAttribute("type", "hidden");
                      el.appendChild(input).setAttribute("name", "D");

                      // Support: IE8
                      // Enforce case-sensitivity of name attribute
                      if (el.querySelectorAll("[name=d]").length) {
                        rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                      }

                      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                      // IE8 throws error here and will not see later tests
                      if (el.querySelectorAll(":enabled").length !== 2) {
                        rbuggyQSA.push(":enabled", ":disabled");
                      }

                      // Support: IE9-11+
                      // IE's :disabled selector does not pick up the children of disabled fieldsets
                      docElem.appendChild(el).disabled = true;
                      if (el.querySelectorAll(":disabled").length !== 2) {
                        rbuggyQSA.push(":enabled", ":disabled");
                      }

                      // Support: Opera 10 - 11 only
                      // Opera 10-11 does not throw on post-comma invalid pseudos
                      el.querySelectorAll("*,:x");
                      rbuggyQSA.push(",.*:");
                    });
                  }

                  if (
                    (support.matchesSelector = rnative.test(
                      (matches =
                        docElem.matches ||
                        docElem.webkitMatchesSelector ||
                        docElem.mozMatchesSelector ||
                        docElem.oMatchesSelector ||
                        docElem.msMatchesSelector)
                    ))
                  ) {
                    assert(function (el) {
                      // Check to see if it's possible to do matchesSelector
                      // on a disconnected node (IE 9)
                      support.disconnectedMatch = matches.call(el, "*");

                      // This should fail with an exception
                      // Gecko does not error, returns false instead
                      matches.call(el, "[s!='']:x");
                      rbuggyMatches.push("!=", pseudos);
                    });
                  }

                  rbuggyQSA =
                    rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
                  rbuggyMatches =
                    rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

                  /* Contains
	---------------------------------------------------------------------- */
                  hasCompare = rnative.test(docElem.compareDocumentPosition);

                  // Element contains another
                  // Purposefully self-exclusive
                  // As in, an element does not contain itself
                  contains =
                    hasCompare || rnative.test(docElem.contains)
                      ? function (a, b) {
                          var adown = a.nodeType === 9 ? a.documentElement : a,
                            bup = b && b.parentNode;
                          return (
                            a === bup ||
                            !!(
                              bup &&
                              bup.nodeType === 1 &&
                              (adown.contains
                                ? adown.contains(bup)
                                : a.compareDocumentPosition &&
                                  a.compareDocumentPosition(bup) & 16)
                            )
                          );
                        }
                      : function (a, b) {
                          if (b) {
                            while ((b = b.parentNode)) {
                              if (b === a) {
                                return true;
                              }
                            }
                          }
                          return false;
                        };

                  /* Sorting
	---------------------------------------------------------------------- */

                  // Document order sorting
                  sortOrder = hasCompare
                    ? function (a, b) {
                        // Flag for duplicate removal
                        if (a === b) {
                          hasDuplicate = true;
                          return 0;
                        }

                        // Sort on method existence if only one input has compareDocumentPosition
                        var compare =
                          !a.compareDocumentPosition -
                          !b.compareDocumentPosition;
                        if (compare) {
                          return compare;
                        }

                        // Calculate position if both inputs belong to the same document
                        // Support: IE 11+, Edge 17 - 18+
                        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                        // two documents; shallow comparisons work.
                        // eslint-disable-next-line eqeqeq
                        compare =
                          (a.ownerDocument || a) == (b.ownerDocument || b)
                            ? a.compareDocumentPosition(b)
                            : // Otherwise we know they are disconnected
                              1;

                        // Disconnected nodes
                        if (
                          compare & 1 ||
                          (!support.sortDetached &&
                            b.compareDocumentPosition(a) === compare)
                        ) {
                          // Choose the first element that is related to our preferred document
                          // Support: IE 11+, Edge 17 - 18+
                          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                          // two documents; shallow comparisons work.
                          // eslint-disable-next-line eqeqeq
                          if (
                            a == document ||
                            (a.ownerDocument == preferredDoc &&
                              contains(preferredDoc, a))
                          ) {
                            return -1;
                          }

                          // Support: IE 11+, Edge 17 - 18+
                          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                          // two documents; shallow comparisons work.
                          // eslint-disable-next-line eqeqeq
                          if (
                            b == document ||
                            (b.ownerDocument == preferredDoc &&
                              contains(preferredDoc, b))
                          ) {
                            return 1;
                          }

                          // Maintain original order
                          return sortInput
                            ? indexOf(sortInput, a) - indexOf(sortInput, b)
                            : 0;
                        }

                        return compare & 4 ? -1 : 1;
                      }
                    : function (a, b) {
                        // Exit early if the nodes are identical
                        if (a === b) {
                          hasDuplicate = true;
                          return 0;
                        }

                        var cur,
                          i = 0,
                          aup = a.parentNode,
                          bup = b.parentNode,
                          ap = [a],
                          bp = [b];

                        // Parentless nodes are either documents or disconnected
                        if (!aup || !bup) {
                          // Support: IE 11+, Edge 17 - 18+
                          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                          // two documents; shallow comparisons work.
                          /* eslint-disable eqeqeq */
                          return a == document
                            ? -1
                            : b == document
                            ? 1
                            : /* eslint-enable eqeqeq */
                            aup
                            ? -1
                            : bup
                            ? 1
                            : sortInput
                            ? indexOf(sortInput, a) - indexOf(sortInput, b)
                            : 0;

                          // If the nodes are siblings, we can do a quick check
                        } else if (aup === bup) {
                          return siblingCheck(a, b);
                        }

                        // Otherwise we need full lists of their ancestors for comparison
                        cur = a;
                        while ((cur = cur.parentNode)) {
                          ap.unshift(cur);
                        }
                        cur = b;
                        while ((cur = cur.parentNode)) {
                          bp.unshift(cur);
                        }

                        // Walk down the tree looking for a discrepancy
                        while (ap[i] === bp[i]) {
                          i++;
                        }

                        return i
                          ? // Do a sibling check if the nodes have a common ancestor
                            siblingCheck(ap[i], bp[i])
                          : // Otherwise nodes in our document sort first
                          // Support: IE 11+, Edge 17 - 18+
                          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                          // two documents; shallow comparisons work.
                          /* eslint-disable eqeqeq */
                          ap[i] == preferredDoc
                          ? -1
                          : bp[i] == preferredDoc
                          ? 1
                          : /* eslint-enable eqeqeq */
                            0;
                      };

                  return document;
                };

                Sizzle.matches = function (expr, elements) {
                  return Sizzle(expr, null, null, elements);
                };

                Sizzle.matchesSelector = function (elem, expr) {
                  setDocument(elem);

                  if (
                    support.matchesSelector &&
                    documentIsHTML &&
                    !nonnativeSelectorCache[expr + " "] &&
                    (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
                    (!rbuggyQSA || !rbuggyQSA.test(expr))
                  ) {
                    try {
                      var ret = matches.call(elem, expr);

                      // IE 9's matchesSelector returns false on disconnected nodes
                      if (
                        ret ||
                        support.disconnectedMatch ||
                        // As well, disconnected nodes are said to be in a document
                        // fragment in IE 9
                        (elem.document && elem.document.nodeType !== 11)
                      ) {
                        return ret;
                      }
                    } catch (e) {
                      nonnativeSelectorCache(expr, true);
                    }
                  }

                  return Sizzle(expr, document, null, [elem]).length > 0;
                };

                Sizzle.contains = function (context, elem) {
                  // Set document vars if needed
                  // Support: IE 11+, Edge 17 - 18+
                  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                  // two documents; shallow comparisons work.
                  // eslint-disable-next-line eqeqeq
                  if ((context.ownerDocument || context) != document) {
                    setDocument(context);
                  }
                  return contains(context, elem);
                };

                Sizzle.attr = function (elem, name) {
                  // Set document vars if needed
                  // Support: IE 11+, Edge 17 - 18+
                  // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                  // two documents; shallow comparisons work.
                  // eslint-disable-next-line eqeqeq
                  if ((elem.ownerDocument || elem) != document) {
                    setDocument(elem);
                  }

                  var fn = Expr.attrHandle[name.toLowerCase()],
                    // Don't get fooled by Object.prototype properties (jQuery #13807)
                    val =
                      fn && hasOwn.call(Expr.attrHandle, name.toLowerCase())
                        ? fn(elem, name, !documentIsHTML)
                        : undefined;

                  return val !== undefined
                    ? val
                    : support.attributes || !documentIsHTML
                    ? elem.getAttribute(name)
                    : (val = elem.getAttributeNode(name)) && val.specified
                    ? val.value
                    : null;
                };

                Sizzle.escape = function (sel) {
                  return (sel + "").replace(rcssescape, fcssescape);
                };

                Sizzle.error = function (msg) {
                  throw new Error(
                    "Syntax error, unrecognized expression: " + msg
                  );
                };

                /**
                 * Document sorting and removing duplicates
                 * @param {ArrayLike} results
                 */
                Sizzle.uniqueSort = function (results) {
                  var elem,
                    duplicates = [],
                    j = 0,
                    i = 0;

                  // Unless we *know* we can detect duplicates, assume their presence
                  hasDuplicate = !support.detectDuplicates;
                  sortInput = !support.sortStable && results.slice(0);
                  results.sort(sortOrder);

                  if (hasDuplicate) {
                    while ((elem = results[i++])) {
                      if (elem === results[i]) {
                        j = duplicates.push(i);
                      }
                    }
                    while (j--) {
                      results.splice(duplicates[j], 1);
                    }
                  }

                  // Clear input after sorting to release objects
                  // See https://github.com/jquery/sizzle/pull/225
                  sortInput = null;

                  return results;
                };

                /**
                 * Utility function for retrieving the text value of an array of DOM nodes
                 * @param {Array|Element} elem
                 */
                getText = Sizzle.getText = function (elem) {
                  var node,
                    ret = "",
                    i = 0,
                    nodeType = elem.nodeType;

                  if (!nodeType) {
                    // If no nodeType, this is expected to be an array
                    while ((node = elem[i++])) {
                      // Do not traverse comment nodes
                      ret += getText(node);
                    }
                  } else if (
                    nodeType === 1 ||
                    nodeType === 9 ||
                    nodeType === 11
                  ) {
                    // Use textContent for elements
                    // innerText usage removed for consistency of new lines (jQuery #11153)
                    if (typeof elem.textContent === "string") {
                      return elem.textContent;
                    } else {
                      // Traverse its children
                      for (
                        elem = elem.firstChild;
                        elem;
                        elem = elem.nextSibling
                      ) {
                        ret += getText(elem);
                      }
                    }
                  } else if (nodeType === 3 || nodeType === 4) {
                    return elem.nodeValue;
                  }

                  // Do not include comment or processing instruction nodes

                  return ret;
                };

                Expr = Sizzle.selectors = {
                  // Can be adjusted by the user
                  cacheLength: 50,

                  createPseudo: markFunction,

                  match: matchExpr,

                  attrHandle: {},

                  find: {},

                  relative: {
                    ">": { dir: "parentNode", first: true },
                    " ": { dir: "parentNode" },
                    "+": { dir: "previousSibling", first: true },
                    "~": { dir: "previousSibling" },
                  },

                  preFilter: {
                    ATTR: function (match) {
                      match[1] = match[1].replace(runescape, funescape);

                      // Move the given value to match[3] whether quoted or unquoted
                      match[3] = (
                        match[3] ||
                        match[4] ||
                        match[5] ||
                        ""
                      ).replace(runescape, funescape);

                      if (match[2] === "~=") {
                        match[3] = " " + match[3] + " ";
                      }

                      return match.slice(0, 4);
                    },

                    CHILD: function (match) {
                      /* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
                      match[1] = match[1].toLowerCase();

                      if (match[1].slice(0, 3) === "nth") {
                        // nth-* requires argument
                        if (!match[3]) {
                          Sizzle.error(match[0]);
                        }

                        // numeric x and y parameters for Expr.filter.CHILD
                        // remember that false/true cast respectively to 0/1
                        match[4] = +(match[4]
                          ? match[5] + (match[6] || 1)
                          : 2 * (match[3] === "even" || match[3] === "odd"));
                        match[5] = +(match[7] + match[8] || match[3] === "odd");

                        // other types prohibit arguments
                      } else if (match[3]) {
                        Sizzle.error(match[0]);
                      }

                      return match;
                    },

                    PSEUDO: function (match) {
                      var excess,
                        unquoted = !match[6] && match[2];

                      if (matchExpr["CHILD"].test(match[0])) {
                        return null;
                      }

                      // Accept quoted arguments as-is
                      if (match[3]) {
                        match[2] = match[4] || match[5] || "";

                        // Strip excess characters from unquoted arguments
                      } else if (
                        unquoted &&
                        rpseudo.test(unquoted) &&
                        // Get excess from tokenize (recursively)
                        (excess = tokenize(unquoted, true)) &&
                        // advance to the next closing parenthesis
                        (excess =
                          unquoted.indexOf(")", unquoted.length - excess) -
                          unquoted.length)
                      ) {
                        // excess is a negative index
                        match[0] = match[0].slice(0, excess);
                        match[2] = unquoted.slice(0, excess);
                      }

                      // Return only captures needed by the pseudo filter method (type and argument)
                      return match.slice(0, 3);
                    },
                  },

                  filter: {
                    TAG: function (nodeNameSelector) {
                      var nodeName = nodeNameSelector
                        .replace(runescape, funescape)
                        .toLowerCase();
                      return nodeNameSelector === "*"
                        ? function () {
                            return true;
                          }
                        : function (elem) {
                            return (
                              elem.nodeName &&
                              elem.nodeName.toLowerCase() === nodeName
                            );
                          };
                    },

                    CLASS: function (className) {
                      var pattern = classCache[className + " "];

                      return (
                        pattern ||
                        ((pattern = new RegExp(
                          "(^|" +
                            whitespace +
                            ")" +
                            className +
                            "(" +
                            whitespace +
                            "|$)"
                        )) &&
                          classCache(className, function (elem) {
                            return pattern.test(
                              (typeof elem.className === "string" &&
                                elem.className) ||
                                (typeof elem.getAttribute !== "undefined" &&
                                  elem.getAttribute("class")) ||
                                ""
                            );
                          }))
                      );
                    },

                    ATTR: function (name, operator, check) {
                      return function (elem) {
                        var result = Sizzle.attr(elem, name);

                        if (result == null) {
                          return operator === "!=";
                        }
                        if (!operator) {
                          return true;
                        }

                        result += "";

                        /* eslint-disable max-len */

                        return operator === "="
                          ? result === check
                          : operator === "!="
                          ? result !== check
                          : operator === "^="
                          ? check && result.indexOf(check) === 0
                          : operator === "*="
                          ? check && result.indexOf(check) > -1
                          : operator === "$="
                          ? check && result.slice(-check.length) === check
                          : operator === "~="
                          ? (
                              " " +
                              result.replace(rwhitespace, " ") +
                              " "
                            ).indexOf(check) > -1
                          : operator === "|="
                          ? result === check ||
                            result.slice(0, check.length + 1) === check + "-"
                          : false;
                        /* eslint-enable max-len */
                      };
                    },

                    CHILD: function (type, what, _argument, first, last) {
                      var simple = type.slice(0, 3) !== "nth",
                        forward = type.slice(-4) !== "last",
                        ofType = what === "of-type";

                      return first === 1 && last === 0
                        ? // Shortcut for :nth-*(n)
                          function (elem) {
                            return !!elem.parentNode;
                          }
                        : function (elem, _context, xml) {
                            var cache,
                              uniqueCache,
                              outerCache,
                              node,
                              nodeIndex,
                              start,
                              dir =
                                simple !== forward
                                  ? "nextSibling"
                                  : "previousSibling",
                              parent = elem.parentNode,
                              name = ofType && elem.nodeName.toLowerCase(),
                              useCache = !xml && !ofType,
                              diff = false;

                            if (parent) {
                              // :(first|last|only)-(child|of-type)
                              if (simple) {
                                while (dir) {
                                  node = elem;
                                  while ((node = node[dir])) {
                                    if (
                                      ofType
                                        ? node.nodeName.toLowerCase() === name
                                        : node.nodeType === 1
                                    ) {
                                      return false;
                                    }
                                  }

                                  // Reverse direction for :only-* (if we haven't yet done so)
                                  start = dir =
                                    type === "only" && !start && "nextSibling";
                                }
                                return true;
                              }

                              start = [
                                forward ? parent.firstChild : parent.lastChild,
                              ];

                              // non-xml :nth-child(...) stores cache data on `parent`
                              if (forward && useCache) {
                                // Seek `elem` from a previously-cached index

                                // ...in a gzip-friendly way
                                node = parent;
                                outerCache =
                                  node[expando] || (node[expando] = {});

                                // Support: IE <9 only
                                // Defend against cloned attroperties (jQuery gh-1709)
                                uniqueCache =
                                  outerCache[node.uniqueID] ||
                                  (outerCache[node.uniqueID] = {});

                                cache = uniqueCache[type] || [];
                                nodeIndex = cache[0] === dirruns && cache[1];
                                diff = nodeIndex && cache[2];
                                node =
                                  nodeIndex && parent.childNodes[nodeIndex];

                                while (
                                  (node =
                                    (++nodeIndex && node && node[dir]) ||
                                    // Fallback to seeking `elem` from the start
                                    (diff = nodeIndex = 0) ||
                                    start.pop())
                                ) {
                                  // When found, cache indexes on `parent` and break
                                  if (
                                    node.nodeType === 1 &&
                                    ++diff &&
                                    node === elem
                                  ) {
                                    uniqueCache[type] = [
                                      dirruns,
                                      nodeIndex,
                                      diff,
                                    ];
                                    break;
                                  }
                                }
                              } else {
                                // Use previously-cached element index if available
                                if (useCache) {
                                  // ...in a gzip-friendly way
                                  node = elem;
                                  outerCache =
                                    node[expando] || (node[expando] = {});

                                  // Support: IE <9 only
                                  // Defend against cloned attroperties (jQuery gh-1709)
                                  uniqueCache =
                                    outerCache[node.uniqueID] ||
                                    (outerCache[node.uniqueID] = {});

                                  cache = uniqueCache[type] || [];
                                  nodeIndex = cache[0] === dirruns && cache[1];
                                  diff = nodeIndex;
                                }

                                // xml :nth-child(...)
                                // or :nth-last-child(...) or :nth(-last)?-of-type(...)
                                if (diff === false) {
                                  // Use the same loop as above to seek `elem` from the start
                                  while (
                                    (node =
                                      (++nodeIndex && node && node[dir]) ||
                                      (diff = nodeIndex = 0) ||
                                      start.pop())
                                  ) {
                                    if (
                                      (ofType
                                        ? node.nodeName.toLowerCase() === name
                                        : node.nodeType === 1) &&
                                      ++diff
                                    ) {
                                      // Cache the index of each encountered element
                                      if (useCache) {
                                        outerCache =
                                          node[expando] || (node[expando] = {});

                                        // Support: IE <9 only
                                        // Defend against cloned attroperties (jQuery gh-1709)
                                        uniqueCache =
                                          outerCache[node.uniqueID] ||
                                          (outerCache[node.uniqueID] = {});

                                        uniqueCache[type] = [dirruns, diff];
                                      }

                                      if (node === elem) {
                                        break;
                                      }
                                    }
                                  }
                                }
                              }

                              // Incorporate the offset, then check against cycle size
                              diff -= last;
                              return (
                                diff === first ||
                                (diff % first === 0 && diff / first >= 0)
                              );
                            }
                          };
                    },

                    PSEUDO: function (pseudo, argument) {
                      // pseudo-class names are case-insensitive
                      // http://www.w3.org/TR/selectors/#pseudo-classes
                      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                      // Remember that setFilters inherits from pseudos
                      var args,
                        fn =
                          Expr.pseudos[pseudo] ||
                          Expr.setFilters[pseudo.toLowerCase()] ||
                          Sizzle.error("unsupported pseudo: " + pseudo);

                      // The user may use createPseudo to indicate that
                      // arguments are needed to create the filter function
                      // just as Sizzle does
                      if (fn[expando]) {
                        return fn(argument);
                      }

                      // But maintain support for old signatures
                      if (fn.length > 1) {
                        args = [pseudo, pseudo, "", argument];
                        return Expr.setFilters.hasOwnProperty(
                          pseudo.toLowerCase()
                        )
                          ? markFunction(function (seed, matches) {
                              var idx,
                                matched = fn(seed, argument),
                                i = matched.length;
                              while (i--) {
                                idx = indexOf(seed, matched[i]);
                                seed[idx] = !(matches[idx] = matched[i]);
                              }
                            })
                          : function (elem) {
                              return fn(elem, 0, args);
                            };
                      }

                      return fn;
                    },
                  },

                  pseudos: {
                    // Potentially complex pseudos
                    not: markFunction(function (selector) {
                      // Trim the selector passed to compile
                      // to avoid treating leading and trailing
                      // spaces as combinators
                      var input = [],
                        results = [],
                        matcher = compile(selector.replace(rtrim, "$1"));

                      return matcher[expando]
                        ? markFunction(function (seed, matches, _context, xml) {
                            var elem,
                              unmatched = matcher(seed, null, xml, []),
                              i = seed.length;

                            // Match elements unmatched by `matcher`
                            while (i--) {
                              if ((elem = unmatched[i])) {
                                seed[i] = !(matches[i] = elem);
                              }
                            }
                          })
                        : function (elem, _context, xml) {
                            input[0] = elem;
                            matcher(input, null, xml, results);

                            // Don't keep the element (issue #299)
                            input[0] = null;
                            return !results.pop();
                          };
                    }),

                    has: markFunction(function (selector) {
                      return function (elem) {
                        return Sizzle(selector, elem).length > 0;
                      };
                    }),

                    contains: markFunction(function (text) {
                      text = text.replace(runescape, funescape);
                      return function (elem) {
                        return (
                          (elem.textContent || getText(elem)).indexOf(text) > -1
                        );
                      };
                    }),

                    // "Whether an element is represented by a :lang() selector
                    // is based solely on the element's language value
                    // being equal to the identifier C,
                    // or beginning with the identifier C immediately followed by "-".
                    // The matching of C against the element's language value is performed case-insensitively.
                    // The identifier C does not have to be a valid language name."
                    // http://www.w3.org/TR/selectors/#lang-pseudo
                    lang: markFunction(function (lang) {
                      // lang value must be a valid identifier
                      if (!ridentifier.test(lang || "")) {
                        Sizzle.error("unsupported lang: " + lang);
                      }
                      lang = lang.replace(runescape, funescape).toLowerCase();
                      return function (elem) {
                        var elemLang;
                        do {
                          if (
                            (elemLang = documentIsHTML
                              ? elem.lang
                              : elem.getAttribute("xml:lang") ||
                                elem.getAttribute("lang"))
                          ) {
                            elemLang = elemLang.toLowerCase();
                            return (
                              elemLang === lang ||
                              elemLang.indexOf(lang + "-") === 0
                            );
                          }
                        } while ((elem = elem.parentNode) && elem.nodeType === 1);
                        return false;
                      };
                    }),

                    // Miscellaneous
                    target: function (elem) {
                      var hash = window.location && window.location.hash;
                      return hash && hash.slice(1) === elem.id;
                    },

                    root: function (elem) {
                      return elem === docElem;
                    },

                    focus: function (elem) {
                      return (
                        elem === document.activeElement &&
                        (!document.hasFocus || document.hasFocus()) &&
                        !!(elem.type || elem.href || ~elem.tabIndex)
                      );
                    },

                    // Boolean properties
                    enabled: createDisabledPseudo(false),
                    disabled: createDisabledPseudo(true),

                    checked: function (elem) {
                      // In CSS3, :checked should return both checked and selected elements
                      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                      var nodeName = elem.nodeName.toLowerCase();
                      return (
                        (nodeName === "input" && !!elem.checked) ||
                        (nodeName === "option" && !!elem.selected)
                      );
                    },

                    selected: function (elem) {
                      // Accessing this property makes selected-by-default
                      // options in Safari work properly
                      if (elem.parentNode) {
                        // eslint-disable-next-line no-unused-expressions
                        elem.parentNode.selectedIndex;
                      }

                      return elem.selected === true;
                    },

                    // Contents
                    empty: function (elem) {
                      // http://www.w3.org/TR/selectors/#empty-pseudo
                      // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
                      //   but not by others (comment: 8; processing instruction: 7; etc.)
                      // nodeType < 6 works because attributes (2) do not appear as children
                      for (
                        elem = elem.firstChild;
                        elem;
                        elem = elem.nextSibling
                      ) {
                        if (elem.nodeType < 6) {
                          return false;
                        }
                      }
                      return true;
                    },

                    parent: function (elem) {
                      return !Expr.pseudos["empty"](elem);
                    },

                    // Element/input types
                    header: function (elem) {
                      return rheader.test(elem.nodeName);
                    },

                    input: function (elem) {
                      return rinputs.test(elem.nodeName);
                    },

                    button: function (elem) {
                      var name = elem.nodeName.toLowerCase();
                      return (
                        (name === "input" && elem.type === "button") ||
                        name === "button"
                      );
                    },

                    text: function (elem) {
                      var attr;
                      return (
                        elem.nodeName.toLowerCase() === "input" &&
                        elem.type === "text" &&
                        // Support: IE<8
                        // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                        ((attr = elem.getAttribute("type")) == null ||
                          attr.toLowerCase() === "text")
                      );
                    },

                    // Position-in-collection
                    first: createPositionalPseudo(function () {
                      return [0];
                    }),

                    last: createPositionalPseudo(function (
                      _matchIndexes,
                      length
                    ) {
                      return [length - 1];
                    }),

                    eq: createPositionalPseudo(function (
                      _matchIndexes,
                      length,
                      argument
                    ) {
                      return [argument < 0 ? argument + length : argument];
                    }),

                    even: createPositionalPseudo(function (
                      matchIndexes,
                      length
                    ) {
                      var i = 0;
                      for (; i < length; i += 2) {
                        matchIndexes.push(i);
                      }
                      return matchIndexes;
                    }),

                    odd: createPositionalPseudo(function (
                      matchIndexes,
                      length
                    ) {
                      var i = 1;
                      for (; i < length; i += 2) {
                        matchIndexes.push(i);
                      }
                      return matchIndexes;
                    }),

                    lt: createPositionalPseudo(function (
                      matchIndexes,
                      length,
                      argument
                    ) {
                      var i =
                        argument < 0
                          ? argument + length
                          : argument > length
                          ? length
                          : argument;
                      for (; --i >= 0; ) {
                        matchIndexes.push(i);
                      }
                      return matchIndexes;
                    }),

                    gt: createPositionalPseudo(function (
                      matchIndexes,
                      length,
                      argument
                    ) {
                      var i = argument < 0 ? argument + length : argument;
                      for (; ++i < length; ) {
                        matchIndexes.push(i);
                      }
                      return matchIndexes;
                    }),
                  },
                };

                Expr.pseudos["nth"] = Expr.pseudos["eq"];

                // Add button/input type pseudos
                for (i in {
                  radio: true,
                  checkbox: true,
                  file: true,
                  password: true,
                  image: true,
                }) {
                  Expr.pseudos[i] = createInputPseudo(i);
                }
                for (i in { submit: true, reset: true }) {
                  Expr.pseudos[i] = createButtonPseudo(i);
                }

                // Easy API for creating new setFilters
                function setFilters() {}
                setFilters.prototype = Expr.filters = Expr.pseudos;
                Expr.setFilters = new setFilters();

                tokenize = Sizzle.tokenize = function (selector, parseOnly) {
                  var matched,
                    match,
                    tokens,
                    type,
                    soFar,
                    groups,
                    preFilters,
                    cached = tokenCache[selector + " "];

                  if (cached) {
                    return parseOnly ? 0 : cached.slice(0);
                  }

                  soFar = selector;
                  groups = [];
                  preFilters = Expr.preFilter;

                  while (soFar) {
                    // Comma and first run
                    if (!matched || (match = rcomma.exec(soFar))) {
                      if (match) {
                        // Don't consume trailing commas as valid
                        soFar = soFar.slice(match[0].length) || soFar;
                      }
                      groups.push((tokens = []));
                    }

                    matched = false;

                    // Combinators
                    if ((match = rcombinators.exec(soFar))) {
                      matched = match.shift();
                      tokens.push({
                        value: matched,

                        // Cast descendant combinators to space
                        type: match[0].replace(rtrim, " "),
                      });
                      soFar = soFar.slice(matched.length);
                    }

                    // Filters
                    for (type in Expr.filter) {
                      if (
                        (match = matchExpr[type].exec(soFar)) &&
                        (!preFilters[type] || (match = preFilters[type](match)))
                      ) {
                        matched = match.shift();
                        tokens.push({
                          value: matched,
                          type: type,
                          matches: match,
                        });
                        soFar = soFar.slice(matched.length);
                      }
                    }

                    if (!matched) {
                      break;
                    }
                  }

                  // Return the length of the invalid excess
                  // if we're just parsing
                  // Otherwise, throw an error or return tokens
                  return parseOnly
                    ? soFar.length
                    : soFar
                    ? Sizzle.error(selector)
                    : // Cache the tokens
                      tokenCache(selector, groups).slice(0);
                };

                function toSelector(tokens) {
                  var i = 0,
                    len = tokens.length,
                    selector = "";
                  for (; i < len; i++) {
                    selector += tokens[i].value;
                  }
                  return selector;
                }

                function addCombinator(matcher, combinator, base) {
                  var dir = combinator.dir,
                    skip = combinator.next,
                    key = skip || dir,
                    checkNonElements = base && key === "parentNode",
                    doneName = done++;

                  return combinator.first
                    ? // Check against closest ancestor/preceding element
                      function (elem, context, xml) {
                        while ((elem = elem[dir])) {
                          if (elem.nodeType === 1 || checkNonElements) {
                            return matcher(elem, context, xml);
                          }
                        }
                        return false;
                      }
                    : // Check against all ancestor/preceding elements
                      function (elem, context, xml) {
                        var oldCache,
                          uniqueCache,
                          outerCache,
                          newCache = [dirruns, doneName];

                        // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
                        if (xml) {
                          while ((elem = elem[dir])) {
                            if (elem.nodeType === 1 || checkNonElements) {
                              if (matcher(elem, context, xml)) {
                                return true;
                              }
                            }
                          }
                        } else {
                          while ((elem = elem[dir])) {
                            if (elem.nodeType === 1 || checkNonElements) {
                              outerCache =
                                elem[expando] || (elem[expando] = {});

                              // Support: IE <9 only
                              // Defend against cloned attroperties (jQuery gh-1709)
                              uniqueCache =
                                outerCache[elem.uniqueID] ||
                                (outerCache[elem.uniqueID] = {});

                              if (
                                skip &&
                                skip === elem.nodeName.toLowerCase()
                              ) {
                                elem = elem[dir] || elem;
                              } else if (
                                (oldCache = uniqueCache[key]) &&
                                oldCache[0] === dirruns &&
                                oldCache[1] === doneName
                              ) {
                                // Assign to newCache so results back-propagate to previous elements
                                return (newCache[2] = oldCache[2]);
                              } else {
                                // Reuse newcache so results back-propagate to previous elements
                                uniqueCache[key] = newCache;

                                // A match means we're done; a fail means we have to keep checking
                                if (
                                  (newCache[2] = matcher(elem, context, xml))
                                ) {
                                  return true;
                                }
                              }
                            }
                          }
                        }
                        return false;
                      };
                }

                function elementMatcher(matchers) {
                  return matchers.length > 1
                    ? function (elem, context, xml) {
                        var i = matchers.length;
                        while (i--) {
                          if (!matchers[i](elem, context, xml)) {
                            return false;
                          }
                        }
                        return true;
                      }
                    : matchers[0];
                }

                function multipleContexts(selector, contexts, results) {
                  var i = 0,
                    len = contexts.length;
                  for (; i < len; i++) {
                    Sizzle(selector, contexts[i], results);
                  }
                  return results;
                }

                function condense(unmatched, map, filter, context, xml) {
                  var elem,
                    newUnmatched = [],
                    i = 0,
                    len = unmatched.length,
                    mapped = map != null;

                  for (; i < len; i++) {
                    if ((elem = unmatched[i])) {
                      if (!filter || filter(elem, context, xml)) {
                        newUnmatched.push(elem);
                        if (mapped) {
                          map.push(i);
                        }
                      }
                    }
                  }

                  return newUnmatched;
                }

                function setMatcher(
                  preFilter,
                  selector,
                  matcher,
                  postFilter,
                  postFinder,
                  postSelector
                ) {
                  if (postFilter && !postFilter[expando]) {
                    postFilter = setMatcher(postFilter);
                  }
                  if (postFinder && !postFinder[expando]) {
                    postFinder = setMatcher(postFinder, postSelector);
                  }
                  return markFunction(function (seed, results, context, xml) {
                    var temp,
                      i,
                      elem,
                      preMap = [],
                      postMap = [],
                      preexisting = results.length,
                      // Get initial elements from seed or context
                      elems =
                        seed ||
                        multipleContexts(
                          selector || "*",
                          context.nodeType ? [context] : context,
                          []
                        ),
                      // Prefilter to get matcher input, preserving a map for seed-results synchronization
                      matcherIn =
                        preFilter && (seed || !selector)
                          ? condense(elems, preMap, preFilter, context, xml)
                          : elems,
                      matcherOut = matcher
                        ? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                          postFinder ||
                          (seed ? preFilter : preexisting || postFilter)
                          ? // ...intermediate processing is necessary
                            []
                          : // ...otherwise use results directly
                            results
                        : matcherIn;

                    // Find primary matches
                    if (matcher) {
                      matcher(matcherIn, matcherOut, context, xml);
                    }

                    // Apply postFilter
                    if (postFilter) {
                      temp = condense(matcherOut, postMap);
                      postFilter(temp, [], context, xml);

                      // Un-match failing elements by moving them back to matcherIn
                      i = temp.length;
                      while (i--) {
                        if ((elem = temp[i])) {
                          matcherOut[postMap[i]] = !(matcherIn[postMap[i]] =
                            elem);
                        }
                      }
                    }

                    if (seed) {
                      if (postFinder || preFilter) {
                        if (postFinder) {
                          // Get the final matcherOut by condensing this intermediate into postFinder contexts
                          temp = [];
                          i = matcherOut.length;
                          while (i--) {
                            if ((elem = matcherOut[i])) {
                              // Restore matcherIn since elem is not yet a final match
                              temp.push((matcherIn[i] = elem));
                            }
                          }
                          postFinder(null, (matcherOut = []), temp, xml);
                        }

                        // Move matched elements from seed to results to keep them synchronized
                        i = matcherOut.length;
                        while (i--) {
                          if (
                            (elem = matcherOut[i]) &&
                            (temp = postFinder
                              ? indexOf(seed, elem)
                              : preMap[i]) > -1
                          ) {
                            seed[temp] = !(results[temp] = elem);
                          }
                        }
                      }

                      // Add elements to results, through postFinder if defined
                    } else {
                      matcherOut = condense(
                        matcherOut === results
                          ? matcherOut.splice(preexisting, matcherOut.length)
                          : matcherOut
                      );
                      if (postFinder) {
                        postFinder(null, results, matcherOut, xml);
                      } else {
                        push.apply(results, matcherOut);
                      }
                    }
                  });
                }

                function matcherFromTokens(tokens) {
                  var checkContext,
                    matcher,
                    j,
                    len = tokens.length,
                    leadingRelative = Expr.relative[tokens[0].type],
                    implicitRelative = leadingRelative || Expr.relative[" "],
                    i = leadingRelative ? 1 : 0,
                    // The foundational matcher ensures that elements are reachable from top-level context(s)
                    matchContext = addCombinator(
                      function (elem) {
                        return elem === checkContext;
                      },
                      implicitRelative,
                      true
                    ),
                    matchAnyContext = addCombinator(
                      function (elem) {
                        return indexOf(checkContext, elem) > -1;
                      },
                      implicitRelative,
                      true
                    ),
                    matchers = [
                      function (elem, context, xml) {
                        var ret =
                          (!leadingRelative &&
                            (xml || context !== outermostContext)) ||
                          ((checkContext = context).nodeType
                            ? matchContext(elem, context, xml)
                            : matchAnyContext(elem, context, xml));

                        // Avoid hanging onto element (issue #299)
                        checkContext = null;
                        return ret;
                      },
                    ];

                  for (; i < len; i++) {
                    if ((matcher = Expr.relative[tokens[i].type])) {
                      matchers = [
                        addCombinator(elementMatcher(matchers), matcher),
                      ];
                    } else {
                      matcher = Expr.filter[tokens[i].type].apply(
                        null,
                        tokens[i].matches
                      );

                      // Return special upon seeing a positional matcher
                      if (matcher[expando]) {
                        // Find the next relative operator (if any) for proper handling
                        j = ++i;
                        for (; j < len; j++) {
                          if (Expr.relative[tokens[j].type]) {
                            break;
                          }
                        }
                        return setMatcher(
                          i > 1 && elementMatcher(matchers),
                          i > 1 &&
                            toSelector(
                              // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                              tokens
                                .slice(0, i - 1)
                                .concat({
                                  value: tokens[i - 2].type === " " ? "*" : "",
                                })
                            ).replace(rtrim, "$1"),
                          matcher,
                          i < j && matcherFromTokens(tokens.slice(i, j)),
                          j < len &&
                            matcherFromTokens((tokens = tokens.slice(j))),
                          j < len && toSelector(tokens)
                        );
                      }
                      matchers.push(matcher);
                    }
                  }

                  return elementMatcher(matchers);
                }

                function matcherFromGroupMatchers(
                  elementMatchers,
                  setMatchers
                ) {
                  var bySet = setMatchers.length > 0,
                    byElement = elementMatchers.length > 0,
                    superMatcher = function (
                      seed,
                      context,
                      xml,
                      results,
                      outermost
                    ) {
                      var elem,
                        j,
                        matcher,
                        matchedCount = 0,
                        i = "0",
                        unmatched = seed && [],
                        setMatched = [],
                        contextBackup = outermostContext,
                        // We must always have either seed elements or outermost context
                        elems =
                          seed ||
                          (byElement && Expr.find["TAG"]("*", outermost)),
                        // Use integer dirruns iff this is the outermost matcher
                        dirrunsUnique = (dirruns +=
                          contextBackup == null ? 1 : Math.random() || 0.1),
                        len = elems.length;

                      if (outermost) {
                        // Support: IE 11+, Edge 17 - 18+
                        // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                        // two documents; shallow comparisons work.
                        // eslint-disable-next-line eqeqeq
                        outermostContext =
                          context == document || context || outermost;
                      }

                      // Add elements passing elementMatchers directly to results
                      // Support: IE<9, Safari
                      // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
                      for (; i !== len && (elem = elems[i]) != null; i++) {
                        if (byElement && elem) {
                          j = 0;

                          // Support: IE 11+, Edge 17 - 18+
                          // IE/Edge sometimes throw a "Permission denied" error when strict-comparing
                          // two documents; shallow comparisons work.
                          // eslint-disable-next-line eqeqeq
                          if (!context && elem.ownerDocument != document) {
                            setDocument(elem);
                            xml = !documentIsHTML;
                          }
                          while ((matcher = elementMatchers[j++])) {
                            if (matcher(elem, context || document, xml)) {
                              results.push(elem);
                              break;
                            }
                          }
                          if (outermost) {
                            dirruns = dirrunsUnique;
                          }
                        }

                        // Track unmatched elements for set filters
                        if (bySet) {
                          // They will have gone through all possible matchers
                          if ((elem = !matcher && elem)) {
                            matchedCount--;
                          }

                          // Lengthen the array for every element, matched or not
                          if (seed) {
                            unmatched.push(elem);
                          }
                        }
                      }

                      // `i` is now the count of elements visited above, and adding it to `matchedCount`
                      // makes the latter nonnegative.
                      matchedCount += i;

                      // Apply set filters to unmatched elements
                      // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
                      // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
                      // no element matchers and no seed.
                      // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
                      // case, which will result in a "00" `matchedCount` that differs from `i` but is also
                      // numerically zero.
                      if (bySet && i !== matchedCount) {
                        j = 0;
                        while ((matcher = setMatchers[j++])) {
                          matcher(unmatched, setMatched, context, xml);
                        }

                        if (seed) {
                          // Reintegrate element matches to eliminate the need for sorting
                          if (matchedCount > 0) {
                            while (i--) {
                              if (!(unmatched[i] || setMatched[i])) {
                                setMatched[i] = pop.call(results);
                              }
                            }
                          }

                          // Discard index placeholder values to get only actual matches
                          setMatched = condense(setMatched);
                        }

                        // Add matches to results
                        push.apply(results, setMatched);

                        // Seedless set matches succeeding multiple successful matchers stipulate sorting
                        if (
                          outermost &&
                          !seed &&
                          setMatched.length > 0 &&
                          matchedCount + setMatchers.length > 1
                        ) {
                          Sizzle.uniqueSort(results);
                        }
                      }

                      // Override manipulation of globals by nested matchers
                      if (outermost) {
                        dirruns = dirrunsUnique;
                        outermostContext = contextBackup;
                      }

                      return unmatched;
                    };

                  return bySet ? markFunction(superMatcher) : superMatcher;
                }

                compile = Sizzle.compile = function (
                  selector,
                  match /* Internal Use Only */
                ) {
                  var i,
                    setMatchers = [],
                    elementMatchers = [],
                    cached = compilerCache[selector + " "];

                  if (!cached) {
                    // Generate a function of recursive functions that can be used to check each element
                    if (!match) {
                      match = tokenize(selector);
                    }
                    i = match.length;
                    while (i--) {
                      cached = matcherFromTokens(match[i]);
                      if (cached[expando]) {
                        setMatchers.push(cached);
                      } else {
                        elementMatchers.push(cached);
                      }
                    }

                    // Cache the compiled function
                    cached = compilerCache(
                      selector,
                      matcherFromGroupMatchers(elementMatchers, setMatchers)
                    );

                    // Save selector and tokenization
                    cached.selector = selector;
                  }
                  return cached;
                };

                /**
                 * A low-level selection function that works with Sizzle's compiled
                 *  selector functions
                 * @param {String|Function} selector A selector or a pre-compiled
                 *  selector function built with Sizzle.compile
                 * @param {Element} context
                 * @param {Array} [results]
                 * @param {Array} [seed] A set of elements to match against
                 */
                select = Sizzle.select = function (
                  selector,
                  context,
                  results,
                  seed
                ) {
                  var i,
                    tokens,
                    token,
                    type,
                    find,
                    compiled = typeof selector === "function" && selector,
                    match =
                      !seed &&
                      tokenize((selector = compiled.selector || selector));

                  results = results || [];

                  // Try to minimize operations if there is only one selector in the list and no seed
                  // (the latter of which guarantees us context)
                  if (match.length === 1) {
                    // Reduce context if the leading compound selector is an ID
                    tokens = match[0] = match[0].slice(0);
                    if (
                      tokens.length > 2 &&
                      (token = tokens[0]).type === "ID" &&
                      context.nodeType === 9 &&
                      documentIsHTML &&
                      Expr.relative[tokens[1].type]
                    ) {
                      context = (Expr.find["ID"](
                        token.matches[0].replace(runescape, funescape),
                        context
                      ) || [])[0];
                      if (!context) {
                        return results;

                        // Precompiled matchers will still verify ancestry, so step up a level
                      } else if (compiled) {
                        context = context.parentNode;
                      }

                      selector = selector.slice(tokens.shift().value.length);
                    }

                    // Fetch a seed set for right-to-left matching
                    i = matchExpr["needsContext"].test(selector)
                      ? 0
                      : tokens.length;
                    while (i--) {
                      token = tokens[i];

                      // Abort if we hit a combinator
                      if (Expr.relative[(type = token.type)]) {
                        break;
                      }
                      if ((find = Expr.find[type])) {
                        // Search, expanding context for leading sibling combinators
                        if (
                          (seed = find(
                            token.matches[0].replace(runescape, funescape),
                            (rsibling.test(tokens[0].type) &&
                              testContext(context.parentNode)) ||
                              context
                          ))
                        ) {
                          // If seed is empty or no tokens remain, we can return early
                          tokens.splice(i, 1);
                          selector = seed.length && toSelector(tokens);
                          if (!selector) {
                            push.apply(results, seed);
                            return results;
                          }

                          break;
                        }
                      }
                    }
                  }

                  // Compile and execute a filtering function if one is not provided
                  // Provide `match` to avoid retokenization if we modified the selector above
                  (compiled || compile(selector, match))(
                    seed,
                    context,
                    !documentIsHTML,
                    results,
                    !context ||
                      (rsibling.test(selector) &&
                        testContext(context.parentNode)) ||
                      context
                  );
                  return results;
                };

                // One-time assignments

                // Sort stability
                support.sortStable =
                  expando.split("").sort(sortOrder).join("") === expando;

                // Support: Chrome 14-35+
                // Always assume duplicates if they aren't passed to the comparison function
                support.detectDuplicates = !!hasDuplicate;

                // Initialize against the default document
                setDocument();

                // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
                // Detached nodes confoundingly follow *each other*
                support.sortDetached = assert(function (el) {
                  // Should return 1, but returns 4 (following)
                  return (
                    el.compareDocumentPosition(
                      document.createElement("fieldset")
                    ) & 1
                  );
                });

                // Support: IE<8
                // Prevent attribute/property "interpolation"
                // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
                if (
                  !assert(function (el) {
                    el.innerHTML = "<a href='#'></a>";
                    return el.firstChild.getAttribute("href") === "#";
                  })
                ) {
                  addHandle(
                    "type|href|height|width",
                    function (elem, name, isXML) {
                      if (!isXML) {
                        return elem.getAttribute(
                          name,
                          name.toLowerCase() === "type" ? 1 : 2
                        );
                      }
                    }
                  );
                }

                // Support: IE<9
                // Use defaultValue in place of getAttribute("value")
                if (
                  !support.attributes ||
                  !assert(function (el) {
                    el.innerHTML = "<input/>";
                    el.firstChild.setAttribute("value", "");
                    return el.firstChild.getAttribute("value") === "";
                  })
                ) {
                  addHandle("value", function (elem, _name, isXML) {
                    if (!isXML && elem.nodeName.toLowerCase() === "input") {
                      return elem.defaultValue;
                    }
                  });
                }

                // Support: IE<9
                // Use getAttributeNode to fetch booleans when getAttribute lies
                if (
                  !assert(function (el) {
                    return el.getAttribute("disabled") == null;
                  })
                ) {
                  addHandle(booleans, function (elem, name, isXML) {
                    var val;
                    if (!isXML) {
                      return elem[name] === true
                        ? name.toLowerCase()
                        : (val = elem.getAttributeNode(name)) && val.specified
                        ? val.value
                        : null;
                    }
                  });
                }

                return Sizzle;
              })(window);

            jQuery.find = Sizzle;
            jQuery.expr = Sizzle.selectors;

            // Deprecated
            jQuery.expr[":"] = jQuery.expr.pseudos;
            jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
            jQuery.text = Sizzle.getText;
            jQuery.isXMLDoc = Sizzle.isXML;
            jQuery.contains = Sizzle.contains;
            jQuery.escapeSelector = Sizzle.escape;

            var dir = function (elem, dir, until) {
              var matched = [],
                truncate = until !== undefined;

              while ((elem = elem[dir]) && elem.nodeType !== 9) {
                if (elem.nodeType === 1) {
                  if (truncate && jQuery(elem).is(until)) {
                    break;
                  }
                  matched.push(elem);
                }
              }
              return matched;
            };

            var siblings = function (n, elem) {
              var matched = [];

              for (; n; n = n.nextSibling) {
                if (n.nodeType === 1 && n !== elem) {
                  matched.push(n);
                }
              }

              return matched;
            };

            var rneedsContext = jQuery.expr.match.needsContext;

            function nodeName(elem, name) {
              return (
                elem.nodeName &&
                elem.nodeName.toLowerCase() === name.toLowerCase()
              );
            }
            var rsingleTag =
              /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;

            // Implement the identical functionality for filter and not
            function winnow(elements, qualifier, not) {
              if (isFunction(qualifier)) {
                return jQuery.grep(elements, function (elem, i) {
                  return !!qualifier.call(elem, i, elem) !== not;
                });
              }

              // Single element
              if (qualifier.nodeType) {
                return jQuery.grep(elements, function (elem) {
                  return (elem === qualifier) !== not;
                });
              }

              // Arraylike of elements (jQuery, arguments, Array)
              if (typeof qualifier !== "string") {
                return jQuery.grep(elements, function (elem) {
                  return indexOf.call(qualifier, elem) > -1 !== not;
                });
              }

              // Filtered directly for both simple and complex selectors
              return jQuery.filter(qualifier, elements, not);
            }

            jQuery.filter = function (expr, elems, not) {
              var elem = elems[0];

              if (not) {
                expr = ":not(" + expr + ")";
              }

              if (elems.length === 1 && elem.nodeType === 1) {
                return jQuery.find.matchesSelector(elem, expr) ? [elem] : [];
              }

              return jQuery.find.matches(
                expr,
                jQuery.grep(elems, function (elem) {
                  return elem.nodeType === 1;
                })
              );
            };

            jQuery.fn.extend({
              find: function (selector) {
                var i,
                  ret,
                  len = this.length,
                  self = this;

                if (typeof selector !== "string") {
                  return this.pushStack(
                    jQuery(selector).filter(function () {
                      for (i = 0; i < len; i++) {
                        if (jQuery.contains(self[i], this)) {
                          return true;
                        }
                      }
                    })
                  );
                }

                ret = this.pushStack([]);

                for (i = 0; i < len; i++) {
                  jQuery.find(selector, self[i], ret);
                }

                return len > 1 ? jQuery.uniqueSort(ret) : ret;
              },
              filter: function (selector) {
                return this.pushStack(winnow(this, selector || [], false));
              },
              not: function (selector) {
                return this.pushStack(winnow(this, selector || [], true));
              },
              is: function (selector) {
                return !!winnow(
                  this,

                  // If this is a positional/relative selector, check membership in the returned set
                  // so $("p:first").is("p:last") won't return true for a doc with two "p".
                  typeof selector === "string" && rneedsContext.test(selector)
                    ? jQuery(selector)
                    : selector || [],
                  false
                ).length;
              },
            });

            // Initialize a jQuery object

            // A central reference to the root jQuery(document)
            var rootjQuery,
              // A simple way to check for HTML strings
              // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
              // Strict HTML recognition (#11290: must start with <)
              // Shortcut simple #id case for speed
              rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
              init = (jQuery.fn.init = function (selector, context, root) {
                var match, elem;

                // HANDLE: $(""), $(null), $(undefined), $(false)
                if (!selector) {
                  return this;
                }

                // Method init() accepts an alternate rootjQuery
                // so migrate can support jQuery.sub (gh-2101)
                root = root || rootjQuery;

                // Handle HTML strings
                if (typeof selector === "string") {
                  if (
                    selector[0] === "<" &&
                    selector[selector.length - 1] === ">" &&
                    selector.length >= 3
                  ) {
                    // Assume that strings that start and end with <> are HTML and skip the regex check
                    match = [null, selector, null];
                  } else {
                    match = rquickExpr.exec(selector);
                  }

                  // Match html or make sure no context is specified for #id
                  if (match && (match[1] || !context)) {
                    // HANDLE: $(html) -> $(array)
                    if (match[1]) {
                      context =
                        context instanceof jQuery ? context[0] : context;

                      // Option to run scripts is true for back-compat
                      // Intentionally let the error be thrown if parseHTML is not present
                      jQuery.merge(
                        this,
                        jQuery.parseHTML(
                          match[1],
                          context && context.nodeType
                            ? context.ownerDocument || context
                            : document,
                          true
                        )
                      );

                      // HANDLE: $(html, props)
                      if (
                        rsingleTag.test(match[1]) &&
                        jQuery.isPlainObject(context)
                      ) {
                        for (match in context) {
                          // Properties of context are called as methods if possible
                          if (isFunction(this[match])) {
                            this[match](context[match]);

                            // ...and otherwise set as attributes
                          } else {
                            this.attr(match, context[match]);
                          }
                        }
                      }

                      return this;

                      // HANDLE: $(#id)
                    } else {
                      elem = document.getElementById(match[2]);

                      if (elem) {
                        // Inject the element directly into the jQuery object
                        this[0] = elem;
                        this.length = 1;
                      }
                      return this;
                    }

                    // HANDLE: $(expr, $(...))
                  } else if (!context || context.jquery) {
                    return (context || root).find(selector);

                    // HANDLE: $(expr, context)
                    // (which is just equivalent to: $(context).find(expr)
                  } else {
                    return this.constructor(context).find(selector);
                  }

                  // HANDLE: $(DOMElement)
                } else if (selector.nodeType) {
                  this[0] = selector;
                  this.length = 1;
                  return this;

                  // HANDLE: $(function)
                  // Shortcut for document ready
                } else if (isFunction(selector)) {
                  return root.ready !== undefined
                    ? root.ready(selector)
                    : // Execute immediately if ready is not present
                      selector(jQuery);
                }

                return jQuery.makeArray(selector, this);
              });

            // Give the init function the jQuery prototype for later instantiation
            init.prototype = jQuery.fn;

            // Initialize central reference
            rootjQuery = jQuery(document);

            var rparentsprev = /^(?:parents|prev(?:Until|All))/,
              // Methods guaranteed to produce a unique set when starting from a unique set
              guaranteedUnique = {
                children: true,
                contents: true,
                next: true,
                prev: true,
              };

            jQuery.fn.extend({
              has: function (target) {
                var targets = jQuery(target, this),
                  l = targets.length;

                return this.filter(function () {
                  var i = 0;
                  for (; i < l; i++) {
                    if (jQuery.contains(this, targets[i])) {
                      return true;
                    }
                  }
                });
              },

              closest: function (selectors, context) {
                var cur,
                  i = 0,
                  l = this.length,
                  matched = [],
                  targets = typeof selectors !== "string" && jQuery(selectors);

                // Positional selectors never match, since there's no _selection_ context
                if (!rneedsContext.test(selectors)) {
                  for (; i < l; i++) {
                    for (
                      cur = this[i];
                      cur && cur !== context;
                      cur = cur.parentNode
                    ) {
                      // Always skip document fragments
                      if (
                        cur.nodeType < 11 &&
                        (targets
                          ? targets.index(cur) > -1
                          : // Don't pass non-elements to Sizzle
                            cur.nodeType === 1 &&
                            jQuery.find.matchesSelector(cur, selectors))
                      ) {
                        matched.push(cur);
                        break;
                      }
                    }
                  }
                }

                return this.pushStack(
                  matched.length > 1 ? jQuery.uniqueSort(matched) : matched
                );
              },

              // Determine the position of an element within the set
              index: function (elem) {
                // No argument, return index in parent
                if (!elem) {
                  return this[0] && this[0].parentNode
                    ? this.first().prevAll().length
                    : -1;
                }

                // Index in selector
                if (typeof elem === "string") {
                  return indexOf.call(jQuery(elem), this[0]);
                }

                // Locate the position of the desired element
                return indexOf.call(
                  this,

                  // If it receives a jQuery object, the first element is used
                  elem.jquery ? elem[0] : elem
                );
              },

              add: function (selector, context) {
                return this.pushStack(
                  jQuery.uniqueSort(
                    jQuery.merge(this.get(), jQuery(selector, context))
                  )
                );
              },

              addBack: function (selector) {
                return this.add(
                  selector == null
                    ? this.prevObject
                    : this.prevObject.filter(selector)
                );
              },
            });

            function sibling(cur, dir) {
              while ((cur = cur[dir]) && cur.nodeType !== 1) {}
              return cur;
            }

            jQuery.each(
              {
                parent: function (elem) {
                  var parent = elem.parentNode;
                  return parent && parent.nodeType !== 11 ? parent : null;
                },
                parents: function (elem) {
                  return dir(elem, "parentNode");
                },
                parentsUntil: function (elem, _i, until) {
                  return dir(elem, "parentNode", until);
                },
                next: function (elem) {
                  return sibling(elem, "nextSibling");
                },
                prev: function (elem) {
                  return sibling(elem, "previousSibling");
                },
                nextAll: function (elem) {
                  return dir(elem, "nextSibling");
                },
                prevAll: function (elem) {
                  return dir(elem, "previousSibling");
                },
                nextUntil: function (elem, _i, until) {
                  return dir(elem, "nextSibling", until);
                },
                prevUntil: function (elem, _i, until) {
                  return dir(elem, "previousSibling", until);
                },
                siblings: function (elem) {
                  return siblings((elem.parentNode || {}).firstChild, elem);
                },
                children: function (elem) {
                  return siblings(elem.firstChild);
                },
                contents: function (elem) {
                  if (
                    elem.contentDocument != null &&
                    // Support: IE 11+
                    // <object> elements with no `data` attribute has an object
                    // `contentDocument` with a `null` prototype.
                    getProto(elem.contentDocument)
                  ) {
                    return elem.contentDocument;
                  }

                  // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
                  // Treat the template element as a regular one in browsers that
                  // don't support it.
                  if (nodeName(elem, "template")) {
                    elem = elem.content || elem;
                  }

                  return jQuery.merge([], elem.childNodes);
                },
              },
              function (name, fn) {
                jQuery.fn[name] = function (until, selector) {
                  var matched = jQuery.map(this, fn, until);

                  if (name.slice(-5) !== "Until") {
                    selector = until;
                  }

                  if (selector && typeof selector === "string") {
                    matched = jQuery.filter(selector, matched);
                  }

                  if (this.length > 1) {
                    // Remove duplicates
                    if (!guaranteedUnique[name]) {
                      jQuery.uniqueSort(matched);
                    }

                    // Reverse order for parents* and prev-derivatives
                    if (rparentsprev.test(name)) {
                      matched.reverse();
                    }
                  }

                  return this.pushStack(matched);
                };
              }
            );
            var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;

            // Convert String-formatted options into Object-formatted ones
            function createOptions(options) {
              var object = {};
              jQuery.each(
                options.match(rnothtmlwhite) || [],
                function (_, flag) {
                  object[flag] = true;
                }
              );
              return object;
            }

            /*
             * Create a callback list using the following parameters:
             *
             *	options: an optional list of space-separated options that will change how
             *			the callback list behaves or a more traditional option object
             *
             * By default a callback list will act like an event callback list and can be
             * "fired" multiple times.
             *
             * Possible options:
             *
             *	once:			will ensure the callback list can only be fired once (like a Deferred)
             *
             *	memory:			will keep track of previous values and will call any callback added
             *					after the list has been fired right away with the latest "memorized"
             *					values (like a Deferred)
             *
             *	unique:			will ensure a callback can only be added once (no duplicate in the list)
             *
             *	stopOnFalse:	interrupt callings when a callback returns false
             *
             */
            jQuery.Callbacks = function (options) {
              // Convert options from String-formatted to Object-formatted if needed
              // (we check in cache first)
              options =
                typeof options === "string"
                  ? createOptions(options)
                  : jQuery.extend({}, options);

              var // Flag to know if list is currently firing
                firing,
                // Last fire value for non-forgettable lists
                memory,
                // Flag to know if list was already fired
                fired,
                // Flag to prevent firing
                locked,
                // Actual callback list
                list = [],
                // Queue of execution data for repeatable lists
                queue = [],
                // Index of currently firing callback (modified by add/remove as needed)
                firingIndex = -1,
                // Fire callbacks
                fire = function () {
                  // Enforce single-firing
                  locked = locked || options.once;

                  // Execute callbacks for all pending executions,
                  // respecting firingIndex overrides and runtime changes
                  fired = firing = true;
                  for (; queue.length; firingIndex = -1) {
                    memory = queue.shift();
                    while (++firingIndex < list.length) {
                      // Run callback and check for early termination
                      if (
                        list[firingIndex].apply(memory[0], memory[1]) ===
                          false &&
                        options.stopOnFalse
                      ) {
                        // Jump to end and forget the data so .add doesn't re-fire
                        firingIndex = list.length;
                        memory = false;
                      }
                    }
                  }

                  // Forget the data if we're done with it
                  if (!options.memory) {
                    memory = false;
                  }

                  firing = false;

                  // Clean up if we're done firing for good
                  if (locked) {
                    // Keep an empty list if we have data for future add calls
                    if (memory) {
                      list = [];

                      // Otherwise, this object is spent
                    } else {
                      list = "";
                    }
                  }
                },
                // Actual Callbacks object
                self = {
                  // Add a callback or a collection of callbacks to the list
                  add: function () {
                    if (list) {
                      // If we have memory from a past run, we should fire after adding
                      if (memory && !firing) {
                        firingIndex = list.length - 1;
                        queue.push(memory);
                      }

                      (function add(args) {
                        jQuery.each(args, function (_, arg) {
                          if (isFunction(arg)) {
                            if (!options.unique || !self.has(arg)) {
                              list.push(arg);
                            }
                          } else if (
                            arg &&
                            arg.length &&
                            toType(arg) !== "string"
                          ) {
                            // Inspect recursively
                            add(arg);
                          }
                        });
                      })(arguments);

                      if (memory && !firing) {
                        fire();
                      }
                    }
                    return this;
                  },

                  // Remove a callback from the list
                  remove: function () {
                    jQuery.each(arguments, function (_, arg) {
                      var index;
                      while ((index = jQuery.inArray(arg, list, index)) > -1) {
                        list.splice(index, 1);

                        // Handle firing indexes
                        if (index <= firingIndex) {
                          firingIndex--;
                        }
                      }
                    });
                    return this;
                  },

                  // Check if a given callback is in the list.
                  // If no argument is given, return whether or not list has callbacks attached.
                  has: function (fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0;
                  },

                  // Remove all callbacks from the list
                  empty: function () {
                    if (list) {
                      list = [];
                    }
                    return this;
                  },

                  // Disable .fire and .add
                  // Abort any current/pending executions
                  // Clear all callbacks and values
                  disable: function () {
                    locked = queue = [];
                    list = memory = "";
                    return this;
                  },
                  disabled: function () {
                    return !list;
                  },

                  // Disable .fire
                  // Also disable .add unless we have memory (since it would have no effect)
                  // Abort any pending executions
                  lock: function () {
                    locked = queue = [];
                    if (!memory && !firing) {
                      list = memory = "";
                    }
                    return this;
                  },
                  locked: function () {
                    return !!locked;
                  },

                  // Call all callbacks with the given context and arguments
                  fireWith: function (context, args) {
                    if (!locked) {
                      args = args || [];
                      args = [context, args.slice ? args.slice() : args];
                      queue.push(args);
                      if (!firing) {
                        fire();
                      }
                    }
                    return this;
                  },

                  // Call all the callbacks with the given arguments
                  fire: function () {
                    self.fireWith(this, arguments);
                    return this;
                  },

                  // To know if the callbacks have already been called at least once
                  fired: function () {
                    return !!fired;
                  },
                };

              return self;
            };

            function Identity(v) {
              return v;
            }
            function Thrower(ex) {
              throw ex;
            }

            function adoptValue(value, resolve, reject, noValue) {
              var method;

              try {
                // Check for promise aspect first to privilege synchronous behavior
                if (value && isFunction((method = value.promise))) {
                  method.call(value).done(resolve).fail(reject);

                  // Other thenables
                } else if (value && isFunction((method = value.then))) {
                  method.call(value, resolve, reject);

                  // Other non-thenables
                } else {
                  // Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
                  // * false: [ value ].slice( 0 ) => resolve( value )
                  // * true: [ value ].slice( 1 ) => resolve()
                  resolve.apply(undefined, [value].slice(noValue));
                }

                // For Promises/A+, convert exceptions into rejections
                // Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
                // Deferred#then to conditionally suppress rejection.
              } catch (value) {
                // Support: Android 4.0 only
                // Strict mode functions invoked without .call/.apply get global-object context
                reject.apply(undefined, [value]);
              }
            }

            jQuery.extend({
              Deferred: function (func) {
                var tuples = [
                    // action, add listener, callbacks,
                    // ... .then handlers, argument index, [final state]
                    [
                      "notify",
                      "progress",
                      jQuery.Callbacks("memory"),
                      jQuery.Callbacks("memory"),
                      2,
                    ],
                    [
                      "resolve",
                      "done",
                      jQuery.Callbacks("once memory"),
                      jQuery.Callbacks("once memory"),
                      0,
                      "resolved",
                    ],
                    [
                      "reject",
                      "fail",
                      jQuery.Callbacks("once memory"),
                      jQuery.Callbacks("once memory"),
                      1,
                      "rejected",
                    ],
                  ],
                  state = "pending",
                  promise = {
                    state: function () {
                      return state;
                    },
                    always: function () {
                      deferred.done(arguments).fail(arguments);
                      return this;
                    },
                    catch: function (fn) {
                      return promise.then(null, fn);
                    },

                    // Keep pipe for back-compat
                    pipe: function (/* fnDone, fnFail, fnProgress */) {
                      var fns = arguments;

                      return jQuery
                        .Deferred(function (newDefer) {
                          jQuery.each(tuples, function (_i, tuple) {
                            // Map tuples (progress, done, fail) to arguments (done, fail, progress)
                            var fn = isFunction(fns[tuple[4]]) && fns[tuple[4]];

                            // deferred.progress(function() { bind to newDefer or newDefer.notify })
                            // deferred.done(function() { bind to newDefer or newDefer.resolve })
                            // deferred.fail(function() { bind to newDefer or newDefer.reject })
                            deferred[tuple[1]](function () {
                              var returned = fn && fn.apply(this, arguments);
                              if (returned && isFunction(returned.promise)) {
                                returned
                                  .promise()
                                  .progress(newDefer.notify)
                                  .done(newDefer.resolve)
                                  .fail(newDefer.reject);
                              } else {
                                newDefer[tuple[0] + "With"](
                                  this,
                                  fn ? [returned] : arguments
                                );
                              }
                            });
                          });
                          fns = null;
                        })
                        .promise();
                    },
                    then: function (onFulfilled, onRejected, onProgress) {
                      var maxDepth = 0;
                      function resolve(depth, deferred, handler, special) {
                        return function () {
                          var that = this,
                            args = arguments,
                            mightThrow = function () {
                              var returned, then;

                              // Support: Promises/A+ section 2.3.3.3.3
                              // https://promisesaplus.com/#point-59
                              // Ignore double-resolution attempts
                              if (depth < maxDepth) {
                                return;
                              }

                              returned = handler.apply(that, args);

                              // Support: Promises/A+ section 2.3.1
                              // https://promisesaplus.com/#point-48
                              if (returned === deferred.promise()) {
                                throw new TypeError("Thenable self-resolution");
                              }

                              // Support: Promises/A+ sections 2.3.3.1, 3.5
                              // https://promisesaplus.com/#point-54
                              // https://promisesaplus.com/#point-75
                              // Retrieve `then` only once
                              then =
                                returned &&
                                // Support: Promises/A+ section 2.3.4
                                // https://promisesaplus.com/#point-64
                                // Only check objects and functions for thenability
                                (typeof returned === "object" ||
                                  typeof returned === "function") &&
                                returned.then;

                              // Handle a returned thenable
                              if (isFunction(then)) {
                                // Special processors (notify) just wait for resolution
                                if (special) {
                                  then.call(
                                    returned,
                                    resolve(
                                      maxDepth,
                                      deferred,
                                      Identity,
                                      special
                                    ),
                                    resolve(
                                      maxDepth,
                                      deferred,
                                      Thrower,
                                      special
                                    )
                                  );

                                  // Normal processors (resolve) also hook into progress
                                } else {
                                  // ...and disregard older resolution values
                                  maxDepth++;

                                  then.call(
                                    returned,
                                    resolve(
                                      maxDepth,
                                      deferred,
                                      Identity,
                                      special
                                    ),
                                    resolve(
                                      maxDepth,
                                      deferred,
                                      Thrower,
                                      special
                                    ),
                                    resolve(
                                      maxDepth,
                                      deferred,
                                      Identity,
                                      deferred.notifyWith
                                    )
                                  );
                                }

                                // Handle all other returned values
                              } else {
                                // Only substitute handlers pass on context
                                // and multiple values (non-spec behavior)
                                if (handler !== Identity) {
                                  that = undefined;
                                  args = [returned];
                                }

                                // Process the value(s)
                                // Default process is resolve
                                (special || deferred.resolveWith)(that, args);
                              }
                            },
                            // Only normal processors (resolve) catch and reject exceptions
                            process = special
                              ? mightThrow
                              : function () {
                                  try {
                                    mightThrow();
                                  } catch (e) {
                                    if (jQuery.Deferred.exceptionHook) {
                                      jQuery.Deferred.exceptionHook(
                                        e,
                                        process.stackTrace
                                      );
                                    }

                                    // Support: Promises/A+ section 2.3.3.3.4.1
                                    // https://promisesaplus.com/#point-61
                                    // Ignore post-resolution exceptions
                                    if (depth + 1 >= maxDepth) {
                                      // Only substitute handlers pass on context
                                      // and multiple values (non-spec behavior)
                                      if (handler !== Thrower) {
                                        that = undefined;
                                        args = [e];
                                      }

                                      deferred.rejectWith(that, args);
                                    }
                                  }
                                };

                          // Support: Promises/A+ section 2.3.3.3.1
                          // https://promisesaplus.com/#point-57
                          // Re-resolve promises immediately to dodge false rejection from
                          // subsequent errors
                          if (depth) {
                            process();
                          } else {
                            // Call an optional hook to record the stack, in case of exception
                            // since it's otherwise lost when execution goes async
                            if (jQuery.Deferred.getStackHook) {
                              process.stackTrace =
                                jQuery.Deferred.getStackHook();
                            }
                            window.setTimeout(process);
                          }
                        };
                      }

                      return jQuery
                        .Deferred(function (newDefer) {
                          // progress_handlers.add( ... )
                          tuples[0][3].add(
                            resolve(
                              0,
                              newDefer,
                              isFunction(onProgress) ? onProgress : Identity,
                              newDefer.notifyWith
                            )
                          );

                          // fulfilled_handlers.add( ... )
                          tuples[1][3].add(
                            resolve(
                              0,
                              newDefer,
                              isFunction(onFulfilled) ? onFulfilled : Identity
                            )
                          );

                          // rejected_handlers.add( ... )
                          tuples[2][3].add(
                            resolve(
                              0,
                              newDefer,
                              isFunction(onRejected) ? onRejected : Thrower
                            )
                          );
                        })
                        .promise();
                    },

                    // Get a promise for this deferred
                    // If obj is provided, the promise aspect is added to the object
                    promise: function (obj) {
                      return obj != null
                        ? jQuery.extend(obj, promise)
                        : promise;
                    },
                  },
                  deferred = {};

                // Add list-specific methods
                jQuery.each(tuples, function (i, tuple) {
                  var list = tuple[2],
                    stateString = tuple[5];

                  // promise.progress = list.add
                  // promise.done = list.add
                  // promise.fail = list.add
                  promise[tuple[1]] = list.add;

                  // Handle state
                  if (stateString) {
                    list.add(
                      function () {
                        // state = "resolved" (i.e., fulfilled)
                        // state = "rejected"
                        state = stateString;
                      },

                      // rejected_callbacks.disable
                      // fulfilled_callbacks.disable
                      tuples[3 - i][2].disable,

                      // rejected_handlers.disable
                      // fulfilled_handlers.disable
                      tuples[3 - i][3].disable,

                      // progress_callbacks.lock
                      tuples[0][2].lock,

                      // progress_handlers.lock
                      tuples[0][3].lock
                    );
                  }

                  // progress_handlers.fire
                  // fulfilled_handlers.fire
                  // rejected_handlers.fire
                  list.add(tuple[3].fire);

                  // deferred.notify = function() { deferred.notifyWith(...) }
                  // deferred.resolve = function() { deferred.resolveWith(...) }
                  // deferred.reject = function() { deferred.rejectWith(...) }
                  deferred[tuple[0]] = function () {
                    deferred[tuple[0] + "With"](
                      this === deferred ? undefined : this,
                      arguments
                    );
                    return this;
                  };

                  // deferred.notifyWith = list.fireWith
                  // deferred.resolveWith = list.fireWith
                  // deferred.rejectWith = list.fireWith
                  deferred[tuple[0] + "With"] = list.fireWith;
                });

                // Make the deferred a promise
                promise.promise(deferred);

                // Call given func if any
                if (func) {
                  func.call(deferred, deferred);
                }

                // All done!
                return deferred;
              },

              // Deferred helper
              when: function (singleValue) {
                var // count of uncompleted subordinates
                  remaining = arguments.length,
                  // count of unprocessed arguments
                  i = remaining,
                  // subordinate fulfillment data
                  resolveContexts = Array(i),
                  resolveValues = slice.call(arguments),
                  // the master Deferred
                  master = jQuery.Deferred(),
                  // subordinate callback factory
                  updateFunc = function (i) {
                    return function (value) {
                      resolveContexts[i] = this;
                      resolveValues[i] =
                        arguments.length > 1 ? slice.call(arguments) : value;
                      if (!--remaining) {
                        master.resolveWith(resolveContexts, resolveValues);
                      }
                    };
                  };

                // Single- and empty arguments are adopted like Promise.resolve
                if (remaining <= 1) {
                  adoptValue(
                    singleValue,
                    master.done(updateFunc(i)).resolve,
                    master.reject,
                    !remaining
                  );

                  // Use .then() to unwrap secondary thenables (cf. gh-3000)
                  if (
                    master.state() === "pending" ||
                    isFunction(resolveValues[i] && resolveValues[i].then)
                  ) {
                    return master.then();
                  }
                }

                // Multiple arguments are aggregated like Promise.all array elements
                while (i--) {
                  adoptValue(resolveValues[i], updateFunc(i), master.reject);
                }

                return master.promise();
              },
            });

            // These usually indicate a programmer mistake during development,
            // warn about them ASAP rather than swallowing them by default.
            var rerrorNames =
              /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

            jQuery.Deferred.exceptionHook = function (error, stack) {
              // Support: IE 8 - 9 only
              // Console exists when dev tools are open, which can happen at any time
              if (
                window.console &&
                window.console.warn &&
                error &&
                rerrorNames.test(error.name)
              ) {
                window.console.warn(
                  "jQuery.Deferred exception: " + error.message,
                  error.stack,
                  stack
                );
              }
            };

            jQuery.readyException = function (error) {
              window.setTimeout(function () {
                throw error;
              });
            };

            // The deferred used on DOM ready
            var readyList = jQuery.Deferred();

            jQuery.fn.ready = function (fn) {
              readyList
                .then(fn)

                // Wrap jQuery.readyException in a function so that the lookup
                // happens at the time of error handling instead of callback
                // registration.
                .catch(function (error) {
                  jQuery.readyException(error);
                });

              return this;
            };

            jQuery.extend({
              // Is the DOM ready to be used? Set to true once it occurs.
              isReady: false,

              // A counter to track how many items to wait for before
              // the ready event fires. See #6781
              readyWait: 1,

              // Handle when the DOM is ready
              ready: function (wait) {
                // Abort if there are pending holds or we're already ready
                if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                  return;
                }

                // Remember that the DOM is ready
                jQuery.isReady = true;

                // If a normal DOM Ready event fired, decrement, and wait if need be
                if (wait !== true && --jQuery.readyWait > 0) {
                  return;
                }

                // If there are functions bound, to execute
                readyList.resolveWith(document, [jQuery]);
              },
            });

            jQuery.ready.then = readyList.then;

            // The ready event handler and self cleanup method
            function completed() {
              document.removeEventListener("DOMContentLoaded", completed);
              window.removeEventListener("load", completed);
              jQuery.ready();
            }

            // Catch cases where $(document).ready() is called
            // after the browser event has already occurred.
            // Support: IE <=9 - 10 only
            // Older IE sometimes signals "interactive" too soon
            if (
              document.readyState === "complete" ||
              (document.readyState !== "loading" &&
                !document.documentElement.doScroll)
            ) {
              // Handle it asynchronously to allow scripts the opportunity to delay ready
              window.setTimeout(jQuery.ready);
            } else {
              // Use the handy event callback
              document.addEventListener("DOMContentLoaded", completed);

              // A fallback to window.onload, that will always work
              window.addEventListener("load", completed);
            }

            // Multifunctional method to get and set values of a collection
            // The value/s can optionally be executed if it's a function
            var access = function (
              elems,
              fn,
              key,
              value,
              chainable,
              emptyGet,
              raw
            ) {
              var i = 0,
                len = elems.length,
                bulk = key == null;

              // Sets many values
              if (toType(key) === "object") {
                chainable = true;
                for (i in key) {
                  access(elems, fn, i, key[i], true, emptyGet, raw);
                }

                // Sets one value
              } else if (value !== undefined) {
                chainable = true;

                if (!isFunction(value)) {
                  raw = true;
                }

                if (bulk) {
                  // Bulk operations run against the entire set
                  if (raw) {
                    fn.call(elems, value);
                    fn = null;

                    // ...except when executing function values
                  } else {
                    bulk = fn;
                    fn = function (elem, _key, value) {
                      return bulk.call(jQuery(elem), value);
                    };
                  }
                }

                if (fn) {
                  for (; i < len; i++) {
                    fn(
                      elems[i],
                      key,
                      raw ? value : value.call(elems[i], i, fn(elems[i], key))
                    );
                  }
                }
              }

              if (chainable) {
                return elems;
              }

              // Gets
              if (bulk) {
                return fn.call(elems);
              }

              return len ? fn(elems[0], key) : emptyGet;
            };

            // Matches dashed string for camelizing
            var rmsPrefix = /^-ms-/,
              rdashAlpha = /-([a-z])/g;

            // Used by camelCase as callback to replace()
            function fcamelCase(_all, letter) {
              return letter.toUpperCase();
            }

            // Convert dashed to camelCase; used by the css and data modules
            // Support: IE <=9 - 11, Edge 12 - 15
            // Microsoft forgot to hump their vendor prefix (#9572)
            function camelCase(string) {
              return string
                .replace(rmsPrefix, "ms-")
                .replace(rdashAlpha, fcamelCase);
            }
            var acceptData = function (owner) {
              // Accepts only:
              //  - Node
              //    - Node.ELEMENT_NODE
              //    - Node.DOCUMENT_NODE
              //  - Object
              //    - Any
              return (
                owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType
              );
            };

            function Data() {
              this.expando = jQuery.expando + Data.uid++;
            }

            Data.uid = 1;

            Data.prototype = {
              cache: function (owner) {
                // Check if the owner object already has a cache
                var value = owner[this.expando];

                // If not, create one
                if (!value) {
                  value = {};

                  // We can accept data for non-element nodes in modern browsers,
                  // but we should not, see #8335.
                  // Always return an empty object.
                  if (acceptData(owner)) {
                    // If it is a node unlikely to be stringify-ed or looped over
                    // use plain assignment
                    if (owner.nodeType) {
                      owner[this.expando] = value;

                      // Otherwise secure it in a non-enumerable property
                      // configurable must be true to allow the property to be
                      // deleted when data is removed
                    } else {
                      Object.defineProperty(owner, this.expando, {
                        value: value,
                        configurable: true,
                      });
                    }
                  }
                }

                return value;
              },
              set: function (owner, data, value) {
                var prop,
                  cache = this.cache(owner);

                // Handle: [ owner, key, value ] args
                // Always use camelCase key (gh-2257)
                if (typeof data === "string") {
                  cache[camelCase(data)] = value;

                  // Handle: [ owner, { properties } ] args
                } else {
                  // Copy the properties one-by-one to the cache object
                  for (prop in data) {
                    cache[camelCase(prop)] = data[prop];
                  }
                }
                return cache;
              },
              get: function (owner, key) {
                return key === undefined
                  ? this.cache(owner)
                  : // Always use camelCase key (gh-2257)
                    owner[this.expando] && owner[this.expando][camelCase(key)];
              },
              access: function (owner, key, value) {
                // In cases where either:
                //
                //   1. No key was specified
                //   2. A string key was specified, but no value provided
                //
                // Take the "read" path and allow the get method to determine
                // which value to return, respectively either:
                //
                //   1. The entire cache object
                //   2. The data stored at the key
                //
                if (
                  key === undefined ||
                  (key && typeof key === "string" && value === undefined)
                ) {
                  return this.get(owner, key);
                }

                // When the key is not a string, or both a key and value
                // are specified, set or extend (existing objects) with either:
                //
                //   1. An object of properties
                //   2. A key and value
                //
                this.set(owner, key, value);

                // Since the "set" path can have two possible entry points
                // return the expected data based on which path was taken[*]
                return value !== undefined ? value : key;
              },
              remove: function (owner, key) {
                var i,
                  cache = owner[this.expando];

                if (cache === undefined) {
                  return;
                }

                if (key !== undefined) {
                  // Support array or space separated string of keys
                  if (Array.isArray(key)) {
                    // If key is an array of keys...
                    // We always set camelCase keys, so remove that.
                    key = key.map(camelCase);
                  } else {
                    key = camelCase(key);

                    // If a key with the spaces exists, use it.
                    // Otherwise, create an array by matching non-whitespace
                    key = key in cache ? [key] : key.match(rnothtmlwhite) || [];
                  }

                  i = key.length;

                  while (i--) {
                    delete cache[key[i]];
                  }
                }

                // Remove the expando if there's no more data
                if (key === undefined || jQuery.isEmptyObject(cache)) {
                  // Support: Chrome <=35 - 45
                  // Webkit & Blink performance suffers when deleting properties
                  // from DOM nodes, so set to undefined instead
                  // https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
                  if (owner.nodeType) {
                    owner[this.expando] = undefined;
                  } else {
                    delete owner[this.expando];
                  }
                }
              },
              hasData: function (owner) {
                var cache = owner[this.expando];
                return cache !== undefined && !jQuery.isEmptyObject(cache);
              },
            };
            var dataPriv = new Data();

            var dataUser = new Data();

            //	Implementation Summary
            //
            //	1. Enforce API surface and semantic compatibility with 1.9.x branch
            //	2. Improve the module's maintainability by reducing the storage
            //		paths to a single mechanism.
            //	3. Use the same single mechanism to support "private" and "user" data.
            //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
            //	5. Avoid exposing implementation details on user objects (eg. expando properties)
            //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

            var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
              rmultiDash = /[A-Z]/g;

            function getData(data) {
              if (data === "true") {
                return true;
              }

              if (data === "false") {
                return false;
              }

              if (data === "null") {
                return null;
              }

              // Only convert to a number if it doesn't change the string
              if (data === +data + "") {
                return +data;
              }

              if (rbrace.test(data)) {
                return JSON.parse(data);
              }

              return data;
            }

            function dataAttr(elem, key, data) {
              var name;

              // If nothing was found internally, try to fetch any
              // data from the HTML5 data-* attribute
              if (data === undefined && elem.nodeType === 1) {
                name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
                data = elem.getAttribute(name);

                if (typeof data === "string") {
                  try {
                    data = getData(data);
                  } catch (e) {}

                  // Make sure we set the data so it isn't changed later
                  dataUser.set(elem, key, data);
                } else {
                  data = undefined;
                }
              }
              return data;
            }

            jQuery.extend({
              hasData: function (elem) {
                return dataUser.hasData(elem) || dataPriv.hasData(elem);
              },

              data: function (elem, name, data) {
                return dataUser.access(elem, name, data);
              },

              removeData: function (elem, name) {
                dataUser.remove(elem, name);
              },

              // TODO: Now that all calls to _data and _removeData have been replaced
              // with direct calls to dataPriv methods, these can be deprecated.
              _data: function (elem, name, data) {
                return dataPriv.access(elem, name, data);
              },

              _removeData: function (elem, name) {
                dataPriv.remove(elem, name);
              },
            });

            jQuery.fn.extend({
              data: function (key, value) {
                var i,
                  name,
                  data,
                  elem = this[0],
                  attrs = elem && elem.attributes;

                // Gets all values
                if (key === undefined) {
                  if (this.length) {
                    data = dataUser.get(elem);

                    if (
                      elem.nodeType === 1 &&
                      !dataPriv.get(elem, "hasDataAttrs")
                    ) {
                      i = attrs.length;
                      while (i--) {
                        // Support: IE 11 only
                        // The attrs elements can be null (#14894)
                        if (attrs[i]) {
                          name = attrs[i].name;
                          if (name.indexOf("data-") === 0) {
                            name = camelCase(name.slice(5));
                            dataAttr(elem, name, data[name]);
                          }
                        }
                      }
                      dataPriv.set(elem, "hasDataAttrs", true);
                    }
                  }

                  return data;
                }

                // Sets multiple values
                if (typeof key === "object") {
                  return this.each(function () {
                    dataUser.set(this, key);
                  });
                }

                return access(
                  this,
                  function (value) {
                    var data;

                    // The calling jQuery object (element matches) is not empty
                    // (and therefore has an element appears at this[ 0 ]) and the
                    // `value` parameter was not undefined. An empty jQuery object
                    // will result in `undefined` for elem = this[ 0 ] which will
                    // throw an exception if an attempt to read a data cache is made.
                    if (elem && value === undefined) {
                      // Attempt to get data from the cache
                      // The key will always be camelCased in Data
                      data = dataUser.get(elem, key);
                      if (data !== undefined) {
                        return data;
                      }

                      // Attempt to "discover" the data in
                      // HTML5 custom data-* attrs
                      data = dataAttr(elem, key);
                      if (data !== undefined) {
                        return data;
                      }

                      // We tried really hard, but the data doesn't exist.
                      return;
                    }

                    // Set the data...
                    this.each(function () {
                      // We always store the camelCased key
                      dataUser.set(this, key, value);
                    });
                  },
                  null,
                  value,
                  arguments.length > 1,
                  null,
                  true
                );
              },

              removeData: function (key) {
                return this.each(function () {
                  dataUser.remove(this, key);
                });
              },
            });

            jQuery.extend({
              queue: function (elem, type, data) {
                var queue;

                if (elem) {
                  type = (type || "fx") + "queue";
                  queue = dataPriv.get(elem, type);

                  // Speed up dequeue by getting out quickly if this is just a lookup
                  if (data) {
                    if (!queue || Array.isArray(data)) {
                      queue = dataPriv.access(
                        elem,
                        type,
                        jQuery.makeArray(data)
                      );
                    } else {
                      queue.push(data);
                    }
                  }
                  return queue || [];
                }
              },

              dequeue: function (elem, type) {
                type = type || "fx";

                var queue = jQuery.queue(elem, type),
                  startLength = queue.length,
                  fn = queue.shift(),
                  hooks = jQuery._queueHooks(elem, type),
                  next = function () {
                    jQuery.dequeue(elem, type);
                  };

                // If the fx queue is dequeued, always remove the progress sentinel
                if (fn === "inprogress") {
                  fn = queue.shift();
                  startLength--;
                }

                if (fn) {
                  // Add a progress sentinel to prevent the fx queue from being
                  // automatically dequeued
                  if (type === "fx") {
                    queue.unshift("inprogress");
                  }

                  // Clear up the last queue stop function
                  delete hooks.stop;
                  fn.call(elem, next, hooks);
                }

                if (!startLength && hooks) {
                  hooks.empty.fire();
                }
              },

              // Not public - generate a queueHooks object, or return the current one
              _queueHooks: function (elem, type) {
                var key = type + "queueHooks";
                return (
                  dataPriv.get(elem, key) ||
                  dataPriv.access(elem, key, {
                    empty: jQuery.Callbacks("once memory").add(function () {
                      dataPriv.remove(elem, [type + "queue", key]);
                    }),
                  })
                );
              },
            });

            jQuery.fn.extend({
              queue: function (type, data) {
                var setter = 2;

                if (typeof type !== "string") {
                  data = type;
                  type = "fx";
                  setter--;
                }

                if (arguments.length < setter) {
                  return jQuery.queue(this[0], type);
                }

                return data === undefined
                  ? this
                  : this.each(function () {
                      var queue = jQuery.queue(this, type, data);

                      // Ensure a hooks for this queue
                      jQuery._queueHooks(this, type);

                      if (type === "fx" && queue[0] !== "inprogress") {
                        jQuery.dequeue(this, type);
                      }
                    });
              },
              dequeue: function (type) {
                return this.each(function () {
                  jQuery.dequeue(this, type);
                });
              },
              clearQueue: function (type) {
                return this.queue(type || "fx", []);
              },

              // Get a promise resolved when queues of a certain type
              // are emptied (fx is the type by default)
              promise: function (type, obj) {
                var tmp,
                  count = 1,
                  defer = jQuery.Deferred(),
                  elements = this,
                  i = this.length,
                  resolve = function () {
                    if (!--count) {
                      defer.resolveWith(elements, [elements]);
                    }
                  };

                if (typeof type !== "string") {
                  obj = type;
                  type = undefined;
                }
                type = type || "fx";

                while (i--) {
                  tmp = dataPriv.get(elements[i], type + "queueHooks");
                  if (tmp && tmp.empty) {
                    count++;
                    tmp.empty.add(resolve);
                  }
                }
                resolve();
                return defer.promise(obj);
              },
            });
            var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

            var rcssNum = new RegExp(
              "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$",
              "i"
            );

            var cssExpand = ["Top", "Right", "Bottom", "Left"];

            var documentElement = document.documentElement;

            var isAttached = function (elem) {
                return jQuery.contains(elem.ownerDocument, elem);
              },
              composed = { composed: true };

            // Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
            // Check attachment across shadow DOM boundaries when possible (gh-3504)
            // Support: iOS 10.0-10.2 only
            // Early iOS 10 versions support `attachShadow` but not `getRootNode`,
            // leading to errors. We need to check for `getRootNode`.
            if (documentElement.getRootNode) {
              isAttached = function (elem) {
                return (
                  jQuery.contains(elem.ownerDocument, elem) ||
                  elem.getRootNode(composed) === elem.ownerDocument
                );
              };
            }
            var isHiddenWithinTree = function (elem, el) {
              // isHiddenWithinTree might be called from jQuery#filter function;
              // in that case, element will be second argument
              elem = el || elem;

              // Inline style trumps all
              return (
                elem.style.display === "none" ||
                (elem.style.display === "" &&
                  // Otherwise, check computed style
                  // Support: Firefox <=43 - 45
                  // Disconnected elements can have computed display: none, so first confirm that elem is
                  // in the document.
                  isAttached(elem) &&
                  jQuery.css(elem, "display") === "none")
              );
            };

            function adjustCSS(elem, prop, valueParts, tween) {
              var adjusted,
                scale,
                maxIterations = 20,
                currentValue = tween
                  ? function () {
                      return tween.cur();
                    }
                  : function () {
                      return jQuery.css(elem, prop, "");
                    },
                initial = currentValue(),
                unit =
                  (valueParts && valueParts[3]) ||
                  (jQuery.cssNumber[prop] ? "" : "px"),
                // Starting value computation is required for potential unit mismatches
                initialInUnit =
                  elem.nodeType &&
                  (jQuery.cssNumber[prop] || (unit !== "px" && +initial)) &&
                  rcssNum.exec(jQuery.css(elem, prop));

              if (initialInUnit && initialInUnit[3] !== unit) {
                // Support: Firefox <=54
                // Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
                initial = initial / 2;

                // Trust units reported by jQuery.css
                unit = unit || initialInUnit[3];

                // Iteratively approximate from a nonzero starting point
                initialInUnit = +initial || 1;

                while (maxIterations--) {
                  // Evaluate and update our best guess (doubling guesses that zero out).
                  // Finish if the scale equals or crosses 1 (making the old*new product non-positive).
                  jQuery.style(elem, prop, initialInUnit + unit);
                  if (
                    (1 - scale) *
                      (1 - (scale = currentValue() / initial || 0.5)) <=
                    0
                  ) {
                    maxIterations = 0;
                  }
                  initialInUnit = initialInUnit / scale;
                }

                initialInUnit = initialInUnit * 2;
                jQuery.style(elem, prop, initialInUnit + unit);

                // Make sure we update the tween properties later on
                valueParts = valueParts || [];
              }

              if (valueParts) {
                initialInUnit = +initialInUnit || +initial || 0;

                // Apply relative offset (+=/-=) if specified
                adjusted = valueParts[1]
                  ? initialInUnit + (valueParts[1] + 1) * valueParts[2]
                  : +valueParts[2];
                if (tween) {
                  tween.unit = unit;
                  tween.start = initialInUnit;
                  tween.end = adjusted;
                }
              }
              return adjusted;
            }

            var defaultDisplayMap = {};

            function getDefaultDisplay(elem) {
              var temp,
                doc = elem.ownerDocument,
                nodeName = elem.nodeName,
                display = defaultDisplayMap[nodeName];

              if (display) {
                return display;
              }

              temp = doc.body.appendChild(doc.createElement(nodeName));
              display = jQuery.css(temp, "display");

              temp.parentNode.removeChild(temp);

              if (display === "none") {
                display = "block";
              }
              defaultDisplayMap[nodeName] = display;

              return display;
            }

            function showHide(elements, show) {
              var display,
                elem,
                values = [],
                index = 0,
                length = elements.length;

              // Determine new display value for elements that need to change
              for (; index < length; index++) {
                elem = elements[index];
                if (!elem.style) {
                  continue;
                }

                display = elem.style.display;
                if (show) {
                  // Since we force visibility upon cascade-hidden elements, an immediate (and slow)
                  // check is required in this first loop unless we have a nonempty display value (either
                  // inline or about-to-be-restored)
                  if (display === "none") {
                    values[index] = dataPriv.get(elem, "display") || null;
                    if (!values[index]) {
                      elem.style.display = "";
                    }
                  }
                  if (elem.style.display === "" && isHiddenWithinTree(elem)) {
                    values[index] = getDefaultDisplay(elem);
                  }
                } else {
                  if (display !== "none") {
                    values[index] = "none";

                    // Remember what we're overwriting
                    dataPriv.set(elem, "display", display);
                  }
                }
              }

              // Set the display of the elements in a second loop to avoid constant reflow
              for (index = 0; index < length; index++) {
                if (values[index] != null) {
                  elements[index].style.display = values[index];
                }
              }

              return elements;
            }

            jQuery.fn.extend({
              show: function () {
                return showHide(this, true);
              },
              hide: function () {
                return showHide(this);
              },
              toggle: function (state) {
                if (typeof state === "boolean") {
                  return state ? this.show() : this.hide();
                }

                return this.each(function () {
                  if (isHiddenWithinTree(this)) {
                    jQuery(this).show();
                  } else {
                    jQuery(this).hide();
                  }
                });
              },
            });
            var rcheckableType = /^(?:checkbox|radio)$/i;

            var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;

            var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;

            (function () {
              var fragment = document.createDocumentFragment(),
                div = fragment.appendChild(document.createElement("div")),
                input = document.createElement("input");

              // Support: Android 4.0 - 4.3 only
              // Check state lost if the name is set (#11217)
              // Support: Windows Web Apps (WWA)
              // `name` and `type` must use .setAttribute for WWA (#14901)
              input.setAttribute("type", "radio");
              input.setAttribute("checked", "checked");
              input.setAttribute("name", "t");

              div.appendChild(input);

              // Support: Android <=4.1 only
              // Older WebKit doesn't clone checked state correctly in fragments
              support.checkClone = div
                .cloneNode(true)
                .cloneNode(true).lastChild.checked;

              // Support: IE <=11 only
              // Make sure textarea (and checkbox) defaultValue is properly cloned
              div.innerHTML = "<textarea>x</textarea>";
              support.noCloneChecked =
                !!div.cloneNode(true).lastChild.defaultValue;

              // Support: IE <=9 only
              // IE <=9 replaces <option> tags with their contents when inserted outside of
              // the select element.
              div.innerHTML = "<option></option>";
              support.option = !!div.lastChild;
            })();

            // We have to close these tags to support XHTML (#13200)
            var wrapMap = {
              // XHTML parsers do not magically insert elements in the
              // same way that tag soup parsers do. So we cannot shorten
              // this by omitting <tbody> or other required elements.
              thead: [1, "<table>", "</table>"],
              col: [2, "<table><colgroup>", "</colgroup></table>"],
              tr: [2, "<table><tbody>", "</tbody></table>"],
              td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

              _default: [0, "", ""],
            };

            wrapMap.tbody =
              wrapMap.tfoot =
              wrapMap.colgroup =
              wrapMap.caption =
                wrapMap.thead;
            wrapMap.th = wrapMap.td;

            // Support: IE <=9 only
            if (!support.option) {
              wrapMap.optgroup = wrapMap.option = [
                1,
                "<select multiple='multiple'>",
                "</select>",
              ];
            }

            function getAll(context, tag) {
              // Support: IE <=9 - 11 only
              // Use typeof to avoid zero-argument method invocation on host objects (#15151)
              var ret;

              if (typeof context.getElementsByTagName !== "undefined") {
                ret = context.getElementsByTagName(tag || "*");
              } else if (typeof context.querySelectorAll !== "undefined") {
                ret = context.querySelectorAll(tag || "*");
              } else {
                ret = [];
              }

              if (tag === undefined || (tag && nodeName(context, tag))) {
                return jQuery.merge([context], ret);
              }

              return ret;
            }

            // Mark scripts as having already been evaluated
            function setGlobalEval(elems, refElements) {
              var i = 0,
                l = elems.length;

              for (; i < l; i++) {
                dataPriv.set(
                  elems[i],
                  "globalEval",
                  !refElements || dataPriv.get(refElements[i], "globalEval")
                );
              }
            }

            var rhtml = /<|&#?\w+;/;

            function buildFragment(
              elems,
              context,
              scripts,
              selection,
              ignored
            ) {
              var elem,
                tmp,
                tag,
                wrap,
                attached,
                j,
                fragment = context.createDocumentFragment(),
                nodes = [],
                i = 0,
                l = elems.length;

              for (; i < l; i++) {
                elem = elems[i];

                if (elem || elem === 0) {
                  // Add nodes directly
                  if (toType(elem) === "object") {
                    // Support: Android <=4.0 only, PhantomJS 1 only
                    // push.apply(_, arraylike) throws on ancient WebKit
                    jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

                    // Convert non-html into a text node
                  } else if (!rhtml.test(elem)) {
                    nodes.push(context.createTextNode(elem));

                    // Convert html into DOM nodes
                  } else {
                    tmp =
                      tmp || fragment.appendChild(context.createElement("div"));

                    // Deserialize a standard representation
                    tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                    wrap = wrapMap[tag] || wrapMap._default;
                    tmp.innerHTML =
                      wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2];

                    // Descend through wrappers to the right content
                    j = wrap[0];
                    while (j--) {
                      tmp = tmp.lastChild;
                    }

                    // Support: Android <=4.0 only, PhantomJS 1 only
                    // push.apply(_, arraylike) throws on ancient WebKit
                    jQuery.merge(nodes, tmp.childNodes);

                    // Remember the top-level container
                    tmp = fragment.firstChild;

                    // Ensure the created nodes are orphaned (#12392)
                    tmp.textContent = "";
                  }
                }
              }

              // Remove wrapper from fragment
              fragment.textContent = "";

              i = 0;
              while ((elem = nodes[i++])) {
                // Skip elements already in the context collection (trac-4087)
                if (selection && jQuery.inArray(elem, selection) > -1) {
                  if (ignored) {
                    ignored.push(elem);
                  }
                  continue;
                }

                attached = isAttached(elem);

                // Append to fragment
                tmp = getAll(fragment.appendChild(elem), "script");

                // Preserve script evaluation history
                if (attached) {
                  setGlobalEval(tmp);
                }

                // Capture executables
                if (scripts) {
                  j = 0;
                  while ((elem = tmp[j++])) {
                    if (rscriptType.test(elem.type || "")) {
                      scripts.push(elem);
                    }
                  }
                }
              }

              return fragment;
            }

            var rkeyEvent = /^key/,
              rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
              rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

            function returnTrue() {
              return true;
            }

            function returnFalse() {
              return false;
            }

            // Support: IE <=9 - 11+
            // focus() and blur() are asynchronous, except when they are no-op.
            // So expect focus to be synchronous when the element is already active,
            // and blur to be synchronous when the element is not already active.
            // (focus and blur are always synchronous in other supported browsers,
            // this just defines when we can count on it).
            function expectSync(elem, type) {
              return (elem === safeActiveElement()) === (type === "focus");
            }

            // Support: IE <=9 only
            // Accessing document.activeElement can throw unexpectedly
            // https://bugs.jquery.com/ticket/13393
            function safeActiveElement() {
              try {
                return document.activeElement;
              } catch (err) {}
            }

            function on(elem, types, selector, data, fn, one) {
              var origFn, type;

              // Types can be a map of types/handlers
              if (typeof types === "object") {
                // ( types-Object, selector, data )
                if (typeof selector !== "string") {
                  // ( types-Object, data )
                  data = data || selector;
                  selector = undefined;
                }
                for (type in types) {
                  on(elem, type, selector, data, types[type], one);
                }
                return elem;
              }

              if (data == null && fn == null) {
                // ( types, fn )
                fn = selector;
                data = selector = undefined;
              } else if (fn == null) {
                if (typeof selector === "string") {
                  // ( types, selector, fn )
                  fn = data;
                  data = undefined;
                } else {
                  // ( types, data, fn )
                  fn = data;
                  data = selector;
                  selector = undefined;
                }
              }
              if (fn === false) {
                fn = returnFalse;
              } else if (!fn) {
                return elem;
              }

              if (one === 1) {
                origFn = fn;
                fn = function (event) {
                  // Can use an empty set, since event contains the info
                  jQuery().off(event);
                  return origFn.apply(this, arguments);
                };

                // Use same guid so caller can remove using origFn
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
              }
              return elem.each(function () {
                jQuery.event.add(this, types, fn, data, selector);
              });
            }

            /*
             * Helper functions for managing events -- not part of the public interface.
             * Props to Dean Edwards' addEvent library for many of the ideas.
             */
            jQuery.event = {
              global: {},

              add: function (elem, types, handler, data, selector) {
                var handleObjIn,
                  eventHandle,
                  tmp,
                  events,
                  t,
                  handleObj,
                  special,
                  handlers,
                  type,
                  namespaces,
                  origType,
                  elemData = dataPriv.get(elem);

                // Only attach events to objects that accept data
                if (!acceptData(elem)) {
                  return;
                }

                // Caller can pass in an object of custom data in lieu of the handler
                if (handler.handler) {
                  handleObjIn = handler;
                  handler = handleObjIn.handler;
                  selector = handleObjIn.selector;
                }

                // Ensure that invalid selectors throw exceptions at attach time
                // Evaluate against documentElement in case elem is a non-element node (e.g., document)
                if (selector) {
                  jQuery.find.matchesSelector(documentElement, selector);
                }

                // Make sure that the handler has a unique ID, used to find/remove it later
                if (!handler.guid) {
                  handler.guid = jQuery.guid++;
                }

                // Init the element's event structure and main handler, if this is the first
                if (!(events = elemData.events)) {
                  events = elemData.events = Object.create(null);
                }
                if (!(eventHandle = elemData.handle)) {
                  eventHandle = elemData.handle = function (e) {
                    // Discard the second event of a jQuery.event.trigger() and
                    // when an event is called after a page has unloaded
                    return typeof jQuery !== "undefined" &&
                      jQuery.event.triggered !== e.type
                      ? jQuery.event.dispatch.apply(elem, arguments)
                      : undefined;
                  };
                }

                // Handle multiple events separated by a space
                types = (types || "").match(rnothtmlwhite) || [""];
                t = types.length;
                while (t--) {
                  tmp = rtypenamespace.exec(types[t]) || [];
                  type = origType = tmp[1];
                  namespaces = (tmp[2] || "").split(".").sort();

                  // There *must* be a type, no attaching namespace-only handlers
                  if (!type) {
                    continue;
                  }

                  // If event changes its type, use the special event handlers for the changed type
                  special = jQuery.event.special[type] || {};

                  // If selector defined, determine special event api type, otherwise given type
                  type =
                    (selector ? special.delegateType : special.bindType) ||
                    type;

                  // Update special based on newly reset type
                  special = jQuery.event.special[type] || {};

                  // handleObj is passed to all event handlers
                  handleObj = jQuery.extend(
                    {
                      type: type,
                      origType: origType,
                      data: data,
                      handler: handler,
                      guid: handler.guid,
                      selector: selector,
                      needsContext:
                        selector &&
                        jQuery.expr.match.needsContext.test(selector),
                      namespace: namespaces.join("."),
                    },
                    handleObjIn
                  );

                  // Init the event handler queue if we're the first
                  if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;

                    // Only use addEventListener if the special events handler returns false
                    if (
                      !special.setup ||
                      special.setup.call(
                        elem,
                        data,
                        namespaces,
                        eventHandle
                      ) === false
                    ) {
                      if (elem.addEventListener) {
                        elem.addEventListener(type, eventHandle);
                      }
                    }
                  }

                  if (special.add) {
                    special.add.call(elem, handleObj);

                    if (!handleObj.handler.guid) {
                      handleObj.handler.guid = handler.guid;
                    }
                  }

                  // Add to the element's handler list, delegates in front
                  if (selector) {
                    handlers.splice(handlers.delegateCount++, 0, handleObj);
                  } else {
                    handlers.push(handleObj);
                  }

                  // Keep track of which events have ever been used, for event optimization
                  jQuery.event.global[type] = true;
                }
              },

              // Detach an event or set of events from an element
              remove: function (elem, types, handler, selector, mappedTypes) {
                var j,
                  origCount,
                  tmp,
                  events,
                  t,
                  handleObj,
                  special,
                  handlers,
                  type,
                  namespaces,
                  origType,
                  elemData = dataPriv.hasData(elem) && dataPriv.get(elem);

                if (!elemData || !(events = elemData.events)) {
                  return;
                }

                // Once for each type.namespace in types; type may be omitted
                types = (types || "").match(rnothtmlwhite) || [""];
                t = types.length;
                while (t--) {
                  tmp = rtypenamespace.exec(types[t]) || [];
                  type = origType = tmp[1];
                  namespaces = (tmp[2] || "").split(".").sort();

                  // Unbind all events (on this namespace, if provided) for the element
                  if (!type) {
                    for (type in events) {
                      jQuery.event.remove(
                        elem,
                        type + types[t],
                        handler,
                        selector,
                        true
                      );
                    }
                    continue;
                  }

                  special = jQuery.event.special[type] || {};
                  type =
                    (selector ? special.delegateType : special.bindType) ||
                    type;
                  handlers = events[type] || [];
                  tmp =
                    tmp[2] &&
                    new RegExp(
                      "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"
                    );

                  // Remove matching events
                  origCount = j = handlers.length;
                  while (j--) {
                    handleObj = handlers[j];

                    if (
                      (mappedTypes || origType === handleObj.origType) &&
                      (!handler || handler.guid === handleObj.guid) &&
                      (!tmp || tmp.test(handleObj.namespace)) &&
                      (!selector ||
                        selector === handleObj.selector ||
                        (selector === "**" && handleObj.selector))
                    ) {
                      handlers.splice(j, 1);

                      if (handleObj.selector) {
                        handlers.delegateCount--;
                      }
                      if (special.remove) {
                        special.remove.call(elem, handleObj);
                      }
                    }
                  }

                  // Remove generic event handler if we removed something and no more handlers exist
                  // (avoids potential for endless recursion during removal of special event handlers)
                  if (origCount && !handlers.length) {
                    if (
                      !special.teardown ||
                      special.teardown.call(
                        elem,
                        namespaces,
                        elemData.handle
                      ) === false
                    ) {
                      jQuery.removeEvent(elem, type, elemData.handle);
                    }

                    delete events[type];
                  }
                }

                // Remove data and the expando if it's no longer used
                if (jQuery.isEmptyObject(events)) {
                  dataPriv.remove(elem, "handle events");
                }
              },

              dispatch: function (nativeEvent) {
                var i,
                  j,
                  ret,
                  matched,
                  handleObj,
                  handlerQueue,
                  args = new Array(arguments.length),
                  // Make a writable jQuery.Event from the native event object
                  event = jQuery.event.fix(nativeEvent),
                  handlers =
                    (dataPriv.get(this, "events") || Object.create(null))[
                      event.type
                    ] || [],
                  special = jQuery.event.special[event.type] || {};

                // Use the fix-ed jQuery.Event rather than the (read-only) native event
                args[0] = event;

                for (i = 1; i < arguments.length; i++) {
                  args[i] = arguments[i];
                }

                event.delegateTarget = this;

                // Call the preDispatch hook for the mapped type, and let it bail if desired
                if (
                  special.preDispatch &&
                  special.preDispatch.call(this, event) === false
                ) {
                  return;
                }

                // Determine handlers
                handlerQueue = jQuery.event.handlers.call(
                  this,
                  event,
                  handlers
                );

                // Run delegates first; they may want to stop propagation beneath us
                i = 0;
                while (
                  (matched = handlerQueue[i++]) &&
                  !event.isPropagationStopped()
                ) {
                  event.currentTarget = matched.elem;

                  j = 0;
                  while (
                    (handleObj = matched.handlers[j++]) &&
                    !event.isImmediatePropagationStopped()
                  ) {
                    // If the event is namespaced, then each handler is only invoked if it is
                    // specially universal or its namespaces are a superset of the event's.
                    if (
                      !event.rnamespace ||
                      handleObj.namespace === false ||
                      event.rnamespace.test(handleObj.namespace)
                    ) {
                      event.handleObj = handleObj;
                      event.data = handleObj.data;

                      ret = (
                        (jQuery.event.special[handleObj.origType] || {})
                          .handle || handleObj.handler
                      ).apply(matched.elem, args);

                      if (ret !== undefined) {
                        if ((event.result = ret) === false) {
                          event.preventDefault();
                          event.stopPropagation();
                        }
                      }
                    }
                  }
                }

                // Call the postDispatch hook for the mapped type
                if (special.postDispatch) {
                  special.postDispatch.call(this, event);
                }

                return event.result;
              },

              handlers: function (event, handlers) {
                var i,
                  handleObj,
                  sel,
                  matchedHandlers,
                  matchedSelectors,
                  handlerQueue = [],
                  delegateCount = handlers.delegateCount,
                  cur = event.target;

                // Find delegate handlers
                if (
                  delegateCount &&
                  // Support: IE <=9
                  // Black-hole SVG <use> instance trees (trac-13180)
                  cur.nodeType &&
                  // Support: Firefox <=42
                  // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
                  // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
                  // Support: IE 11 only
                  // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
                  !(event.type === "click" && event.button >= 1)
                ) {
                  for (; cur !== this; cur = cur.parentNode || this) {
                    // Don't check non-elements (#13208)
                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (
                      cur.nodeType === 1 &&
                      !(event.type === "click" && cur.disabled === true)
                    ) {
                      matchedHandlers = [];
                      matchedSelectors = {};
                      for (i = 0; i < delegateCount; i++) {
                        handleObj = handlers[i];

                        // Don't conflict with Object.prototype properties (#13203)
                        sel = handleObj.selector + " ";

                        if (matchedSelectors[sel] === undefined) {
                          matchedSelectors[sel] = handleObj.needsContext
                            ? jQuery(sel, this).index(cur) > -1
                            : jQuery.find(sel, this, null, [cur]).length;
                        }
                        if (matchedSelectors[sel]) {
                          matchedHandlers.push(handleObj);
                        }
                      }
                      if (matchedHandlers.length) {
                        handlerQueue.push({
                          elem: cur,
                          handlers: matchedHandlers,
                        });
                      }
                    }
                  }
                }

                // Add the remaining (directly-bound) handlers
                cur = this;
                if (delegateCount < handlers.length) {
                  handlerQueue.push({
                    elem: cur,
                    handlers: handlers.slice(delegateCount),
                  });
                }

                return handlerQueue;
              },

              addProp: function (name, hook) {
                Object.defineProperty(jQuery.Event.prototype, name, {
                  enumerable: true,
                  configurable: true,

                  get: isFunction(hook)
                    ? function () {
                        if (this.originalEvent) {
                          return hook(this.originalEvent);
                        }
                      }
                    : function () {
                        if (this.originalEvent) {
                          return this.originalEvent[name];
                        }
                      },

                  set: function (value) {
                    Object.defineProperty(this, name, {
                      enumerable: true,
                      configurable: true,
                      writable: true,
                      value: value,
                    });
                  },
                });
              },

              fix: function (originalEvent) {
                return originalEvent[jQuery.expando]
                  ? originalEvent
                  : new jQuery.Event(originalEvent);
              },

              special: {
                load: {
                  // Prevent triggered image.load events from bubbling to window.load
                  noBubble: true,
                },
                click: {
                  // Utilize native event to ensure correct state for checkable inputs
                  setup: function (data) {
                    // For mutual compressibility with _default, replace `this` access with a local var.
                    // `|| data` is dead code meant only to preserve the variable through minification.
                    var el = this || data;

                    // Claim the first handler
                    if (
                      rcheckableType.test(el.type) &&
                      el.click &&
                      nodeName(el, "input")
                    ) {
                      // dataPriv.set( el, "click", ... )
                      leverageNative(el, "click", returnTrue);
                    }

                    // Return false to allow normal processing in the caller
                    return false;
                  },
                  trigger: function (data) {
                    // For mutual compressibility with _default, replace `this` access with a local var.
                    // `|| data` is dead code meant only to preserve the variable through minification.
                    var el = this || data;

                    // Force setup before triggering a click
                    if (
                      rcheckableType.test(el.type) &&
                      el.click &&
                      nodeName(el, "input")
                    ) {
                      leverageNative(el, "click");
                    }

                    // Return non-false to allow normal event-path propagation
                    return true;
                  },

                  // For cross-browser consistency, suppress native .click() on links
                  // Also prevent it if we're currently inside a leveraged native-event stack
                  _default: function (event) {
                    var target = event.target;
                    return (
                      (rcheckableType.test(target.type) &&
                        target.click &&
                        nodeName(target, "input") &&
                        dataPriv.get(target, "click")) ||
                      nodeName(target, "a")
                    );
                  },
                },

                beforeunload: {
                  postDispatch: function (event) {
                    // Support: Firefox 20+
                    // Firefox doesn't alert if the returnValue field is not set.
                    if (event.result !== undefined && event.originalEvent) {
                      event.originalEvent.returnValue = event.result;
                    }
                  },
                },
              },
            };

            // Ensure the presence of an event listener that handles manually-triggered
            // synthetic events by interrupting progress until reinvoked in response to
            // *native* events that it fires directly, ensuring that state changes have
            // already occurred before other listeners are invoked.
            function leverageNative(el, type, expectSync) {
              // Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
              if (!expectSync) {
                if (dataPriv.get(el, type) === undefined) {
                  jQuery.event.add(el, type, returnTrue);
                }
                return;
              }

              // Register the controller as a special universal handler for all event namespaces
              dataPriv.set(el, type, false);
              jQuery.event.add(el, type, {
                namespace: false,
                handler: function (event) {
                  var notAsync,
                    result,
                    saved = dataPriv.get(this, type);

                  if (event.isTrigger & 1 && this[type]) {
                    // Interrupt processing of the outer synthetic .trigger()ed event
                    // Saved data should be false in such cases, but might be a leftover capture object
                    // from an async native handler (gh-4350)
                    if (!saved.length) {
                      // Store arguments for use when handling the inner native event
                      // There will always be at least one argument (an event object), so this array
                      // will not be confused with a leftover capture object.
                      saved = slice.call(arguments);
                      dataPriv.set(this, type, saved);

                      // Trigger the native event and capture its result
                      // Support: IE <=9 - 11+
                      // focus() and blur() are asynchronous
                      notAsync = expectSync(this, type);
                      this[type]();
                      result = dataPriv.get(this, type);
                      if (saved !== result || notAsync) {
                        dataPriv.set(this, type, false);
                      } else {
                        result = {};
                      }
                      if (saved !== result) {
                        // Cancel the outer synthetic event
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        return result.value;
                      }

                      // If this is an inner synthetic event for an event with a bubbling surrogate
                      // (focus or blur), assume that the surrogate already propagated from triggering the
                      // native event and prevent that from happening again here.
                      // This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
                      // bubbling surrogate propagates *after* the non-bubbling base), but that seems
                      // less bad than duplication.
                    } else if (
                      (jQuery.event.special[type] || {}).delegateType
                    ) {
                      event.stopPropagation();
                    }

                    // If this is a native event triggered above, everything is now in order
                    // Fire an inner synthetic event with the original arguments
                  } else if (saved.length) {
                    // ...and capture the result
                    dataPriv.set(this, type, {
                      value: jQuery.event.trigger(
                        // Support: IE <=9 - 11+
                        // Extend with the prototype to reset the above stopImmediatePropagation()
                        jQuery.extend(saved[0], jQuery.Event.prototype),
                        saved.slice(1),
                        this
                      ),
                    });

                    // Abort handling of the native event
                    event.stopImmediatePropagation();
                  }
                },
              });
            }

            jQuery.removeEvent = function (elem, type, handle) {
              // This "if" is needed for plain objects
              if (elem.removeEventListener) {
                elem.removeEventListener(type, handle);
              }
            };

            jQuery.Event = function (src, props) {
              // Allow instantiation without the 'new' keyword
              if (!(this instanceof jQuery.Event)) {
                return new jQuery.Event(src, props);
              }

              // Event object
              if (src && src.type) {
                this.originalEvent = src;
                this.type = src.type;

                // Events bubbling up the document may have been marked as prevented
                // by a handler lower down the tree; reflect the correct value.
                this.isDefaultPrevented =
                  src.defaultPrevented ||
                  (src.defaultPrevented === undefined &&
                    // Support: Android <=2.3 only
                    src.returnValue === false)
                    ? returnTrue
                    : returnFalse;

                // Create target properties
                // Support: Safari <=6 - 7 only
                // Target should not be a text node (#504, #13143)
                this.target =
                  src.target && src.target.nodeType === 3
                    ? src.target.parentNode
                    : src.target;

                this.currentTarget = src.currentTarget;
                this.relatedTarget = src.relatedTarget;

                // Event type
              } else {
                this.type = src;
              }

              // Put explicitly provided properties onto the event object
              if (props) {
                jQuery.extend(this, props);
              }

              // Create a timestamp if incoming event doesn't have one
              this.timeStamp = (src && src.timeStamp) || Date.now();

              // Mark it as fixed
              this[jQuery.expando] = true;
            };

            // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
            // https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
            jQuery.Event.prototype = {
              constructor: jQuery.Event,
              isDefaultPrevented: returnFalse,
              isPropagationStopped: returnFalse,
              isImmediatePropagationStopped: returnFalse,
              isSimulated: false,

              preventDefault: function () {
                var e = this.originalEvent;

                this.isDefaultPrevented = returnTrue;

                if (e && !this.isSimulated) {
                  e.preventDefault();
                }
              },
              stopPropagation: function () {
                var e = this.originalEvent;

                this.isPropagationStopped = returnTrue;

                if (e && !this.isSimulated) {
                  e.stopPropagation();
                }
              },
              stopImmediatePropagation: function () {
                var e = this.originalEvent;

                this.isImmediatePropagationStopped = returnTrue;

                if (e && !this.isSimulated) {
                  e.stopImmediatePropagation();
                }

                this.stopPropagation();
              },
            };

            // Includes all common event props including KeyEvent and MouseEvent specific props
            jQuery.each(
              {
                altKey: true,
                bubbles: true,
                cancelable: true,
                changedTouches: true,
                ctrlKey: true,
                detail: true,
                eventPhase: true,
                metaKey: true,
                pageX: true,
                pageY: true,
                shiftKey: true,
                view: true,
                char: true,
                code: true,
                charCode: true,
                key: true,
                keyCode: true,
                button: true,
                buttons: true,
                clientX: true,
                clientY: true,
                offsetX: true,
                offsetY: true,
                pointerId: true,
                pointerType: true,
                screenX: true,
                screenY: true,
                targetTouches: true,
                toElement: true,
                touches: true,

                which: function (event) {
                  var button = event.button;

                  // Add which for key events
                  if (event.which == null && rkeyEvent.test(event.type)) {
                    return event.charCode != null
                      ? event.charCode
                      : event.keyCode;
                  }

                  // Add which for click: 1 === left; 2 === middle; 3 === right
                  if (
                    !event.which &&
                    button !== undefined &&
                    rmouseEvent.test(event.type)
                  ) {
                    if (button & 1) {
                      return 1;
                    }

                    if (button & 2) {
                      return 3;
                    }

                    if (button & 4) {
                      return 2;
                    }

                    return 0;
                  }

                  return event.which;
                },
              },
              jQuery.event.addProp
            );

            jQuery.each(
              { focus: "focusin", blur: "focusout" },
              function (type, delegateType) {
                jQuery.event.special[type] = {
                  // Utilize native event if possible so blur/focus sequence is correct
                  setup: function () {
                    // Claim the first handler
                    // dataPriv.set( this, "focus", ... )
                    // dataPriv.set( this, "blur", ... )
                    leverageNative(this, type, expectSync);

                    // Return false to allow normal processing in the caller
                    return false;
                  },
                  trigger: function () {
                    // Force setup before trigger
                    leverageNative(this, type);

                    // Return non-false to allow normal event-path propagation
                    return true;
                  },

                  delegateType: delegateType,
                };
              }
            );

            // Create mouseenter/leave events using mouseover/out and event-time checks
            // so that event delegation works in jQuery.
            // Do the same for pointerenter/pointerleave and pointerover/pointerout
            //
            // Support: Safari 7 only
            // Safari sends mouseenter too often; see:
            // https://bugs.chromium.org/p/chromium/issues/detail?id=470258
            // for the description of the bug (it existed in older Chrome versions as well).
            jQuery.each(
              {
                mouseenter: "mouseover",
                mouseleave: "mouseout",
                pointerenter: "pointerover",
                pointerleave: "pointerout",
              },
              function (orig, fix) {
                jQuery.event.special[orig] = {
                  delegateType: fix,
                  bindType: fix,

                  handle: function (event) {
                    var ret,
                      target = this,
                      related = event.relatedTarget,
                      handleObj = event.handleObj;

                    // For mouseenter/leave call the handler if related is outside the target.
                    // NB: No relatedTarget if the mouse left/entered the browser window
                    if (
                      !related ||
                      (related !== target && !jQuery.contains(target, related))
                    ) {
                      event.type = handleObj.origType;
                      ret = handleObj.handler.apply(this, arguments);
                      event.type = fix;
                    }
                    return ret;
                  },
                };
              }
            );

            jQuery.fn.extend({
              on: function (types, selector, data, fn) {
                return on(this, types, selector, data, fn);
              },
              one: function (types, selector, data, fn) {
                return on(this, types, selector, data, fn, 1);
              },
              off: function (types, selector, fn) {
                var handleObj, type;
                if (types && types.preventDefault && types.handleObj) {
                  // ( event )  dispatched jQuery.Event
                  handleObj = types.handleObj;
                  jQuery(types.delegateTarget).off(
                    handleObj.namespace
                      ? handleObj.origType + "." + handleObj.namespace
                      : handleObj.origType,
                    handleObj.selector,
                    handleObj.handler
                  );
                  return this;
                }
                if (typeof types === "object") {
                  // ( types-object [, selector] )
                  for (type in types) {
                    this.off(type, selector, types[type]);
                  }
                  return this;
                }
                if (selector === false || typeof selector === "function") {
                  // ( types [, fn] )
                  fn = selector;
                  selector = undefined;
                }
                if (fn === false) {
                  fn = returnFalse;
                }
                return this.each(function () {
                  jQuery.event.remove(this, types, fn, selector);
                });
              },
            });

            var // Support: IE <=10 - 11, Edge 12 - 13 only
              // In IE/Edge using regex groups here causes severe slowdowns.
              // See https://connect.microsoft.com/IE/feedback/details/1736512/
              rnoInnerhtml = /<script|<style|<link/i,
              // checked="checked" or checked
              rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
              rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

            // Prefer a tbody over its parent table for containing new rows
            function manipulationTarget(elem, content) {
              if (
                nodeName(elem, "table") &&
                nodeName(
                  content.nodeType !== 11 ? content : content.firstChild,
                  "tr"
                )
              ) {
                return jQuery(elem).children("tbody")[0] || elem;
              }

              return elem;
            }

            // Replace/restore the type attribute of script elements for safe DOM manipulation
            function disableScript(elem) {
              elem.type =
                (elem.getAttribute("type") !== null) + "/" + elem.type;
              return elem;
            }
            function restoreScript(elem) {
              if ((elem.type || "").slice(0, 5) === "true/") {
                elem.type = elem.type.slice(5);
              } else {
                elem.removeAttribute("type");
              }

              return elem;
            }

            function cloneCopyEvent(src, dest) {
              var i, l, type, pdataOld, udataOld, udataCur, events;

              if (dest.nodeType !== 1) {
                return;
              }

              // 1. Copy private data: events, handlers, etc.
              if (dataPriv.hasData(src)) {
                pdataOld = dataPriv.get(src);
                events = pdataOld.events;

                if (events) {
                  dataPriv.remove(dest, "handle events");

                  for (type in events) {
                    for (i = 0, l = events[type].length; i < l; i++) {
                      jQuery.event.add(dest, type, events[type][i]);
                    }
                  }
                }
              }

              // 2. Copy user data
              if (dataUser.hasData(src)) {
                udataOld = dataUser.access(src);
                udataCur = jQuery.extend({}, udataOld);

                dataUser.set(dest, udataCur);
              }
            }

            // Fix IE bugs, see support tests
            function fixInput(src, dest) {
              var nodeName = dest.nodeName.toLowerCase();

              // Fails to persist the checked state of a cloned checkbox or radio button.
              if (nodeName === "input" && rcheckableType.test(src.type)) {
                dest.checked = src.checked;

                // Fails to return the selected option to the default selected state when cloning options
              } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
              }
            }

            function domManip(collection, args, callback, ignored) {
              // Flatten any nested arrays
              args = flat(args);

              var fragment,
                first,
                scripts,
                hasScripts,
                node,
                doc,
                i = 0,
                l = collection.length,
                iNoClone = l - 1,
                value = args[0],
                valueIsFunction = isFunction(value);

              // We can't cloneNode fragments that contain checked, in WebKit
              if (
                valueIsFunction ||
                (l > 1 &&
                  typeof value === "string" &&
                  !support.checkClone &&
                  rchecked.test(value))
              ) {
                return collection.each(function (index) {
                  var self = collection.eq(index);
                  if (valueIsFunction) {
                    args[0] = value.call(this, index, self.html());
                  }
                  domManip(self, args, callback, ignored);
                });
              }

              if (l) {
                fragment = buildFragment(
                  args,
                  collection[0].ownerDocument,
                  false,
                  collection,
                  ignored
                );
                first = fragment.firstChild;

                if (fragment.childNodes.length === 1) {
                  fragment = first;
                }

                // Require either new content or an interest in ignored elements to invoke the callback
                if (first || ignored) {
                  scripts = jQuery.map(
                    getAll(fragment, "script"),
                    disableScript
                  );
                  hasScripts = scripts.length;

                  // Use the original fragment for the last item
                  // instead of the first because it can end up
                  // being emptied incorrectly in certain situations (#8070).
                  for (; i < l; i++) {
                    node = fragment;

                    if (i !== iNoClone) {
                      node = jQuery.clone(node, true, true);

                      // Keep references to cloned scripts for later restoration
                      if (hasScripts) {
                        // Support: Android <=4.0 only, PhantomJS 1 only
                        // push.apply(_, arraylike) throws on ancient WebKit
                        jQuery.merge(scripts, getAll(node, "script"));
                      }
                    }

                    callback.call(collection[i], node, i);
                  }

                  if (hasScripts) {
                    doc = scripts[scripts.length - 1].ownerDocument;

                    // Reenable scripts
                    jQuery.map(scripts, restoreScript);

                    // Evaluate executable scripts on first document insertion
                    for (i = 0; i < hasScripts; i++) {
                      node = scripts[i];
                      if (
                        rscriptType.test(node.type || "") &&
                        !dataPriv.access(node, "globalEval") &&
                        jQuery.contains(doc, node)
                      ) {
                        if (
                          node.src &&
                          (node.type || "").toLowerCase() !== "module"
                        ) {
                          // Optional AJAX dependency, but won't run scripts if not present
                          if (jQuery._evalUrl && !node.noModule) {
                            jQuery._evalUrl(
                              node.src,
                              {
                                nonce: node.nonce || node.getAttribute("nonce"),
                              },
                              doc
                            );
                          }
                        } else {
                          DOMEval(
                            node.textContent.replace(rcleanScript, ""),
                            node,
                            doc
                          );
                        }
                      }
                    }
                  }
                }
              }

              return collection;
            }

            function remove(elem, selector, keepData) {
              var node,
                nodes = selector ? jQuery.filter(selector, elem) : elem,
                i = 0;

              for (; (node = nodes[i]) != null; i++) {
                if (!keepData && node.nodeType === 1) {
                  jQuery.cleanData(getAll(node));
                }

                if (node.parentNode) {
                  if (keepData && isAttached(node)) {
                    setGlobalEval(getAll(node, "script"));
                  }
                  node.parentNode.removeChild(node);
                }
              }

              return elem;
            }

            jQuery.extend({
              htmlPrefilter: function (html) {
                return html;
              },

              clone: function (elem, dataAndEvents, deepDataAndEvents) {
                var i,
                  l,
                  srcElements,
                  destElements,
                  clone = elem.cloneNode(true),
                  inPage = isAttached(elem);

                // Fix IE cloning issues
                if (
                  !support.noCloneChecked &&
                  (elem.nodeType === 1 || elem.nodeType === 11) &&
                  !jQuery.isXMLDoc(elem)
                ) {
                  // We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
                  destElements = getAll(clone);
                  srcElements = getAll(elem);

                  for (i = 0, l = srcElements.length; i < l; i++) {
                    fixInput(srcElements[i], destElements[i]);
                  }
                }

                // Copy the events from the original to the clone
                if (dataAndEvents) {
                  if (deepDataAndEvents) {
                    srcElements = srcElements || getAll(elem);
                    destElements = destElements || getAll(clone);

                    for (i = 0, l = srcElements.length; i < l; i++) {
                      cloneCopyEvent(srcElements[i], destElements[i]);
                    }
                  } else {
                    cloneCopyEvent(elem, clone);
                  }
                }

                // Preserve script evaluation history
                destElements = getAll(clone, "script");
                if (destElements.length > 0) {
                  setGlobalEval(
                    destElements,
                    !inPage && getAll(elem, "script")
                  );
                }

                // Return the cloned set
                return clone;
              },

              cleanData: function (elems) {
                var data,
                  elem,
                  type,
                  special = jQuery.event.special,
                  i = 0;

                for (; (elem = elems[i]) !== undefined; i++) {
                  if (acceptData(elem)) {
                    if ((data = elem[dataPriv.expando])) {
                      if (data.events) {
                        for (type in data.events) {
                          if (special[type]) {
                            jQuery.event.remove(elem, type);

                            // This is a shortcut to avoid jQuery.event.remove's overhead
                          } else {
                            jQuery.removeEvent(elem, type, data.handle);
                          }
                        }
                      }

                      // Support: Chrome <=35 - 45+
                      // Assign undefined instead of using delete, see Data#remove
                      elem[dataPriv.expando] = undefined;
                    }
                    if (elem[dataUser.expando]) {
                      // Support: Chrome <=35 - 45+
                      // Assign undefined instead of using delete, see Data#remove
                      elem[dataUser.expando] = undefined;
                    }
                  }
                }
              },
            });

            jQuery.fn.extend({
              detach: function (selector) {
                return remove(this, selector, true);
              },

              remove: function (selector) {
                return remove(this, selector);
              },

              text: function (value) {
                return access(
                  this,
                  function (value) {
                    return value === undefined
                      ? jQuery.text(this)
                      : this.empty().each(function () {
                          if (
                            this.nodeType === 1 ||
                            this.nodeType === 11 ||
                            this.nodeType === 9
                          ) {
                            this.textContent = value;
                          }
                        });
                  },
                  null,
                  value,
                  arguments.length
                );
              },

              append: function () {
                return domManip(this, arguments, function (elem) {
                  if (
                    this.nodeType === 1 ||
                    this.nodeType === 11 ||
                    this.nodeType === 9
                  ) {
                    var target = manipulationTarget(this, elem);
                    target.appendChild(elem);
                  }
                });
              },

              prepend: function () {
                return domManip(this, arguments, function (elem) {
                  if (
                    this.nodeType === 1 ||
                    this.nodeType === 11 ||
                    this.nodeType === 9
                  ) {
                    var target = manipulationTarget(this, elem);
                    target.insertBefore(elem, target.firstChild);
                  }
                });
              },

              before: function () {
                return domManip(this, arguments, function (elem) {
                  if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this);
                  }
                });
              },

              after: function () {
                return domManip(this, arguments, function (elem) {
                  if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                  }
                });
              },

              empty: function () {
                var elem,
                  i = 0;

                for (; (elem = this[i]) != null; i++) {
                  if (elem.nodeType === 1) {
                    // Prevent memory leaks
                    jQuery.cleanData(getAll(elem, false));

                    // Remove any remaining nodes
                    elem.textContent = "";
                  }
                }

                return this;
              },

              clone: function (dataAndEvents, deepDataAndEvents) {
                dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
                deepDataAndEvents =
                  deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

                return this.map(function () {
                  return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                });
              },

              html: function (value) {
                return access(
                  this,
                  function (value) {
                    var elem = this[0] || {},
                      i = 0,
                      l = this.length;

                    if (value === undefined && elem.nodeType === 1) {
                      return elem.innerHTML;
                    }

                    // See if we can take a shortcut and just use innerHTML
                    if (
                      typeof value === "string" &&
                      !rnoInnerhtml.test(value) &&
                      !wrapMap[
                        (rtagName.exec(value) || ["", ""])[1].toLowerCase()
                      ]
                    ) {
                      value = jQuery.htmlPrefilter(value);

                      try {
                        for (; i < l; i++) {
                          elem = this[i] || {};

                          // Remove element nodes and prevent memory leaks
                          if (elem.nodeType === 1) {
                            jQuery.cleanData(getAll(elem, false));
                            elem.innerHTML = value;
                          }
                        }

                        elem = 0;

                        // If using innerHTML throws an exception, use the fallback method
                      } catch (e) {}
                    }

                    if (elem) {
                      this.empty().append(value);
                    }
                  },
                  null,
                  value,
                  arguments.length
                );
              },

              replaceWith: function () {
                var ignored = [];

                // Make the changes, replacing each non-ignored context element with the new content
                return domManip(
                  this,
                  arguments,
                  function (elem) {
                    var parent = this.parentNode;

                    if (jQuery.inArray(this, ignored) < 0) {
                      jQuery.cleanData(getAll(this));
                      if (parent) {
                        parent.replaceChild(elem, this);
                      }
                    }

                    // Force callback invocation
                  },
                  ignored
                );
              },
            });

            jQuery.each(
              {
                appendTo: "append",
                prependTo: "prepend",
                insertBefore: "before",
                insertAfter: "after",
                replaceAll: "replaceWith",
              },
              function (name, original) {
                jQuery.fn[name] = function (selector) {
                  var elems,
                    ret = [],
                    insert = jQuery(selector),
                    last = insert.length - 1,
                    i = 0;

                  for (; i <= last; i++) {
                    elems = i === last ? this : this.clone(true);
                    jQuery(insert[i])[original](elems);

                    // Support: Android <=4.0 only, PhantomJS 1 only
                    // .get() because push.apply(_, arraylike) throws on ancient WebKit
                    push.apply(ret, elems.get());
                  }

                  return this.pushStack(ret);
                };
              }
            );
            var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

            var getStyles = function (elem) {
              // Support: IE <=11 only, Firefox <=30 (#15098, #14150)
              // IE throws on elements created in popups
              // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
              var view = elem.ownerDocument.defaultView;

              if (!view || !view.opener) {
                view = window;
              }

              return view.getComputedStyle(elem);
            };

            var swap = function (elem, options, callback) {
              var ret,
                name,
                old = {};

              // Remember the old values, and insert the new ones
              for (name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
              }

              ret = callback.call(elem);

              // Revert the old values
              for (name in options) {
                elem.style[name] = old[name];
              }

              return ret;
            };

            var rboxStyle = new RegExp(cssExpand.join("|"), "i");

            (function () {
              // Executing both pixelPosition & boxSizingReliable tests require only one layout
              // so they're executed at the same time to save the second computation.
              function computeStyleTests() {
                // This is a singleton, we need to execute it only once
                if (!div) {
                  return;
                }

                container.style.cssText =
                  "position:absolute;left:-11111px;width:60px;" +
                  "margin-top:1px;padding:0;border:0";
                div.style.cssText =
                  "position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
                  "margin:auto;border:1px;padding:1px;" +
                  "width:60%;top:1%";
                documentElement.appendChild(container).appendChild(div);

                var divStyle = window.getComputedStyle(div);
                pixelPositionVal = divStyle.top !== "1%";

                // Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
                reliableMarginLeftVal =
                  roundPixelMeasures(divStyle.marginLeft) === 12;

                // Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
                // Some styles come back with percentage values, even though they shouldn't
                div.style.right = "60%";
                pixelBoxStylesVal = roundPixelMeasures(divStyle.right) === 36;

                // Support: IE 9 - 11 only
                // Detect misreporting of content dimensions for box-sizing:border-box elements
                boxSizingReliableVal =
                  roundPixelMeasures(divStyle.width) === 36;

                // Support: IE 9 only
                // Detect overflow:scroll screwiness (gh-3699)
                // Support: Chrome <=64
                // Don't get tricked when zoom affects offsetWidth (gh-4029)
                div.style.position = "absolute";
                scrollboxSizeVal =
                  roundPixelMeasures(div.offsetWidth / 3) === 12;

                documentElement.removeChild(container);

                // Nullify the div so it wouldn't be stored in the memory and
                // it will also be a sign that checks already performed
                div = null;
              }

              function roundPixelMeasures(measure) {
                return Math.round(parseFloat(measure));
              }

              var pixelPositionVal,
                boxSizingReliableVal,
                scrollboxSizeVal,
                pixelBoxStylesVal,
                reliableTrDimensionsVal,
                reliableMarginLeftVal,
                container = document.createElement("div"),
                div = document.createElement("div");

              // Finish early in limited (non-browser) environments
              if (!div.style) {
                return;
              }

              // Support: IE <=9 - 11 only
              // Style of cloned element affects source element cloned (#8908)
              div.style.backgroundClip = "content-box";
              div.cloneNode(true).style.backgroundClip = "";
              support.clearCloneStyle =
                div.style.backgroundClip === "content-box";

              jQuery.extend(support, {
                boxSizingReliable: function () {
                  computeStyleTests();
                  return boxSizingReliableVal;
                },
                pixelBoxStyles: function () {
                  computeStyleTests();
                  return pixelBoxStylesVal;
                },
                pixelPosition: function () {
                  computeStyleTests();
                  return pixelPositionVal;
                },
                reliableMarginLeft: function () {
                  computeStyleTests();
                  return reliableMarginLeftVal;
                },
                scrollboxSize: function () {
                  computeStyleTests();
                  return scrollboxSizeVal;
                },

                // Support: IE 9 - 11+, Edge 15 - 18+
                // IE/Edge misreport `getComputedStyle` of table rows with width/height
                // set in CSS while `offset*` properties report correct values.
                // Behavior in IE 9 is more subtle than in newer versions & it passes
                // some versions of this test; make sure not to make it pass there!
                reliableTrDimensions: function () {
                  var table, tr, trChild, trStyle;
                  if (reliableTrDimensionsVal == null) {
                    table = document.createElement("table");
                    tr = document.createElement("tr");
                    trChild = document.createElement("div");

                    table.style.cssText = "position:absolute;left:-11111px";
                    tr.style.height = "1px";
                    trChild.style.height = "9px";

                    documentElement
                      .appendChild(table)
                      .appendChild(tr)
                      .appendChild(trChild);

                    trStyle = window.getComputedStyle(tr);
                    reliableTrDimensionsVal = parseInt(trStyle.height) > 3;

                    documentElement.removeChild(table);
                  }
                  return reliableTrDimensionsVal;
                },
              });
            })();

            function curCSS(elem, name, computed) {
              var width,
                minWidth,
                maxWidth,
                ret,
                // Support: Firefox 51+
                // Retrieving style before computed somehow
                // fixes an issue with getting wrong values
                // on detached elements
                style = elem.style;

              computed = computed || getStyles(elem);

              // getPropertyValue is needed for:
              //   .css('filter') (IE 9 only, #12537)
              //   .css('--customProperty) (#3144)
              if (computed) {
                ret = computed.getPropertyValue(name) || computed[name];

                if (ret === "" && !isAttached(elem)) {
                  ret = jQuery.style(elem, name);
                }

                // A tribute to the "awesome hack by Dean Edwards"
                // Android Browser returns percentage for some values,
                // but width seems to be reliably pixels.
                // This is against the CSSOM draft spec:
                // https://drafts.csswg.org/cssom/#resolved-values
                if (
                  !support.pixelBoxStyles() &&
                  rnumnonpx.test(ret) &&
                  rboxStyle.test(name)
                ) {
                  // Remember the original values
                  width = style.width;
                  minWidth = style.minWidth;
                  maxWidth = style.maxWidth;

                  // Put in the new values to get a computed value out
                  style.minWidth = style.maxWidth = style.width = ret;
                  ret = computed.width;

                  // Revert the changed values
                  style.width = width;
                  style.minWidth = minWidth;
                  style.maxWidth = maxWidth;
                }
              }

              return ret !== undefined
                ? // Support: IE <=9 - 11 only
                  // IE returns zIndex value as an integer.
                  ret + ""
                : ret;
            }

            function addGetHookIf(conditionFn, hookFn) {
              // Define the hook, we'll check on the first run if it's really needed.
              return {
                get: function () {
                  if (conditionFn()) {
                    // Hook not needed (or it's not possible to use it due
                    // to missing dependency), remove it.
                    delete this.get;
                    return;
                  }

                  // Hook needed; redefine it so that the support test is not executed again.
                  return (this.get = hookFn).apply(this, arguments);
                },
              };
            }

            var cssPrefixes = ["Webkit", "Moz", "ms"],
              emptyStyle = document.createElement("div").style,
              vendorProps = {};

            // Return a vendor-prefixed property or undefined
            function vendorPropName(name) {
              // Check for vendor prefixed names
              var capName = name[0].toUpperCase() + name.slice(1),
                i = cssPrefixes.length;

              while (i--) {
                name = cssPrefixes[i] + capName;
                if (name in emptyStyle) {
                  return name;
                }
              }
            }

            // Return a potentially-mapped jQuery.cssProps or vendor prefixed property
            function finalPropName(name) {
              var final = jQuery.cssProps[name] || vendorProps[name];

              if (final) {
                return final;
              }
              if (name in emptyStyle) {
                return name;
              }
              return (vendorProps[name] = vendorPropName(name) || name);
            }

            var // Swappable if display is none or starts with table
              // except "table", "table-cell", or "table-caption"
              // See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
              rdisplayswap = /^(none|table(?!-c[ea]).+)/,
              rcustomProp = /^--/,
              cssShow = {
                position: "absolute",
                visibility: "hidden",
                display: "block",
              },
              cssNormalTransform = {
                letterSpacing: "0",
                fontWeight: "400",
              };

            function setPositiveNumber(_elem, value, subtract) {
              // Any relative (+/-) values have already been
              // normalized at this point
              var matches = rcssNum.exec(value);
              return matches
                ? // Guard against undefined "subtract", e.g., when used as in cssHooks
                  Math.max(0, matches[2] - (subtract || 0)) +
                    (matches[3] || "px")
                : value;
            }

            function boxModelAdjustment(
              elem,
              dimension,
              box,
              isBorderBox,
              styles,
              computedVal
            ) {
              var i = dimension === "width" ? 1 : 0,
                extra = 0,
                delta = 0;

              // Adjustment may not be necessary
              if (box === (isBorderBox ? "border" : "content")) {
                return 0;
              }

              for (; i < 4; i += 2) {
                // Both box models exclude margin
                if (box === "margin") {
                  delta += jQuery.css(elem, box + cssExpand[i], true, styles);
                }

                // If we get here with a content-box, we're seeking "padding" or "border" or "margin"
                if (!isBorderBox) {
                  // Add padding
                  delta += jQuery.css(
                    elem,
                    "padding" + cssExpand[i],
                    true,
                    styles
                  );

                  // For "border" or "margin", add border
                  if (box !== "padding") {
                    delta += jQuery.css(
                      elem,
                      "border" + cssExpand[i] + "Width",
                      true,
                      styles
                    );

                    // But still keep track of it otherwise
                  } else {
                    extra += jQuery.css(
                      elem,
                      "border" + cssExpand[i] + "Width",
                      true,
                      styles
                    );
                  }

                  // If we get here with a border-box (content + padding + border), we're seeking "content" or
                  // "padding" or "margin"
                } else {
                  // For "content", subtract padding
                  if (box === "content") {
                    delta -= jQuery.css(
                      elem,
                      "padding" + cssExpand[i],
                      true,
                      styles
                    );
                  }

                  // For "content" or "padding", subtract border
                  if (box !== "margin") {
                    delta -= jQuery.css(
                      elem,
                      "border" + cssExpand[i] + "Width",
                      true,
                      styles
                    );
                  }
                }
              }

              // Account for positive content-box scroll gutter when requested by providing computedVal
              if (!isBorderBox && computedVal >= 0) {
                // offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
                // Assuming integer scroll gutter, subtract the rest and round down
                delta +=
                  Math.max(
                    0,
                    Math.ceil(
                      elem[
                        "offset" +
                          dimension[0].toUpperCase() +
                          dimension.slice(1)
                      ] -
                        computedVal -
                        delta -
                        extra -
                        0.5

                      // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
                      // Use an explicit zero to avoid NaN (gh-3964)
                    )
                  ) || 0;
              }

              return delta;
            }

            function getWidthOrHeight(elem, dimension, extra) {
              // Start with computed style
              var styles = getStyles(elem),
                // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
                // Fake content-box until we know it's needed to know the true value.
                boxSizingNeeded = !support.boxSizingReliable() || extra,
                isBorderBox =
                  boxSizingNeeded &&
                  jQuery.css(elem, "boxSizing", false, styles) === "border-box",
                valueIsBorderBox = isBorderBox,
                val = curCSS(elem, dimension, styles),
                offsetProp =
                  "offset" + dimension[0].toUpperCase() + dimension.slice(1);

              // Support: Firefox <=54
              // Return a confounding non-pixel value or feign ignorance, as appropriate.
              if (rnumnonpx.test(val)) {
                if (!extra) {
                  return val;
                }
                val = "auto";
              }

              // Support: IE 9 - 11 only
              // Use offsetWidth/offsetHeight for when box sizing is unreliable.
              // In those cases, the computed value can be trusted to be border-box.
              if (
                ((!support.boxSizingReliable() && isBorderBox) ||
                  // Support: IE 10 - 11+, Edge 15 - 18+
                  // IE/Edge misreport `getComputedStyle` of table rows with width/height
                  // set in CSS while `offset*` properties report correct values.
                  // Interestingly, in some cases IE 9 doesn't suffer from this issue.
                  (!support.reliableTrDimensions() && nodeName(elem, "tr")) ||
                  // Fall back to offsetWidth/offsetHeight when value is "auto"
                  // This happens for inline elements with no explicit setting (gh-3571)
                  val === "auto" ||
                  // Support: Android <=4.1 - 4.3 only
                  // Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
                  (!parseFloat(val) &&
                    jQuery.css(elem, "display", false, styles) === "inline")) &&
                // Make sure the element is visible & connected
                elem.getClientRects().length
              ) {
                isBorderBox =
                  jQuery.css(elem, "boxSizing", false, styles) === "border-box";

                // Where available, offsetWidth/offsetHeight approximate border box dimensions.
                // Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
                // retrieved value as a content box dimension.
                valueIsBorderBox = offsetProp in elem;
                if (valueIsBorderBox) {
                  val = elem[offsetProp];
                }
              }

              // Normalize "" and auto
              val = parseFloat(val) || 0;

              // Adjust for the element's box model
              return (
                val +
                boxModelAdjustment(
                  elem,
                  dimension,
                  extra || (isBorderBox ? "border" : "content"),
                  valueIsBorderBox,
                  styles,

                  // Provide the current computed size to request scroll gutter calculation (gh-3589)
                  val
                ) +
                "px"
              );
            }

            jQuery.extend({
              // Add in style property hooks for overriding the default
              // behavior of getting and setting a style property
              cssHooks: {
                opacity: {
                  get: function (elem, computed) {
                    if (computed) {
                      // We should always get a number back from opacity
                      var ret = curCSS(elem, "opacity");
                      return ret === "" ? "1" : ret;
                    }
                  },
                },
              },

              // Don't automatically add "px" to these possibly-unitless properties
              cssNumber: {
                animationIterationCount: true,
                columnCount: true,
                fillOpacity: true,
                flexGrow: true,
                flexShrink: true,
                fontWeight: true,
                gridArea: true,
                gridColumn: true,
                gridColumnEnd: true,
                gridColumnStart: true,
                gridRow: true,
                gridRowEnd: true,
                gridRowStart: true,
                lineHeight: true,
                opacity: true,
                order: true,
                orphans: true,
                widows: true,
                zIndex: true,
                zoom: true,
              },

              // Add in properties whose names you wish to fix before
              // setting or getting the value
              cssProps: {},

              // Get and set the style property on a DOM Node
              style: function (elem, name, value, extra) {
                // Don't set styles on text and comment nodes
                if (
                  !elem ||
                  elem.nodeType === 3 ||
                  elem.nodeType === 8 ||
                  !elem.style
                ) {
                  return;
                }

                // Make sure that we're working with the right name
                var ret,
                  type,
                  hooks,
                  origName = camelCase(name),
                  isCustomProp = rcustomProp.test(name),
                  style = elem.style;

                // Make sure that we're working with the right name. We don't
                // want to query the value if it is a CSS custom property
                // since they are user-defined.
                if (!isCustomProp) {
                  name = finalPropName(origName);
                }

                // Gets hook for the prefixed version, then unprefixed version
                hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

                // Check if we're setting a value
                if (value !== undefined) {
                  type = typeof value;

                  // Convert "+=" or "-=" to relative numbers (#7345)
                  if (
                    type === "string" &&
                    (ret = rcssNum.exec(value)) &&
                    ret[1]
                  ) {
                    value = adjustCSS(elem, name, ret);

                    // Fixes bug #9237
                    type = "number";
                  }

                  // Make sure that null and NaN values aren't set (#7116)
                  if (value == null || value !== value) {
                    return;
                  }

                  // If a number was passed in, add the unit (except for certain CSS properties)
                  // The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
                  // "px" to a few hardcoded values.
                  if (type === "number" && !isCustomProp) {
                    value +=
                      (ret && ret[3]) ||
                      (jQuery.cssNumber[origName] ? "" : "px");
                  }

                  // background-* props affect original clone's values
                  if (
                    !support.clearCloneStyle &&
                    value === "" &&
                    name.indexOf("background") === 0
                  ) {
                    style[name] = "inherit";
                  }

                  // If a hook was provided, use that value, otherwise just set the specified value
                  if (
                    !hooks ||
                    !("set" in hooks) ||
                    (value = hooks.set(elem, value, extra)) !== undefined
                  ) {
                    if (isCustomProp) {
                      style.setProperty(name, value);
                    } else {
                      style[name] = value;
                    }
                  }
                } else {
                  // If a hook was provided get the non-computed value from there
                  if (
                    hooks &&
                    "get" in hooks &&
                    (ret = hooks.get(elem, false, extra)) !== undefined
                  ) {
                    return ret;
                  }

                  // Otherwise just get the value from the style object
                  return style[name];
                }
              },

              css: function (elem, name, extra, styles) {
                var val,
                  num,
                  hooks,
                  origName = camelCase(name),
                  isCustomProp = rcustomProp.test(name);

                // Make sure that we're working with the right name. We don't
                // want to modify the value if it is a CSS custom property
                // since they are user-defined.
                if (!isCustomProp) {
                  name = finalPropName(origName);
                }

                // Try prefixed name followed by the unprefixed name
                hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

                // If a hook was provided get the computed value from there
                if (hooks && "get" in hooks) {
                  val = hooks.get(elem, true, extra);
                }

                // Otherwise, if a way to get the computed value exists, use that
                if (val === undefined) {
                  val = curCSS(elem, name, styles);
                }

                // Convert "normal" to computed value
                if (val === "normal" && name in cssNormalTransform) {
                  val = cssNormalTransform[name];
                }

                // Make numeric if forced or a qualifier was provided and val looks numeric
                if (extra === "" || extra) {
                  num = parseFloat(val);
                  return extra === true || isFinite(num) ? num || 0 : val;
                }

                return val;
              },
            });

            jQuery.each(["height", "width"], function (_i, dimension) {
              jQuery.cssHooks[dimension] = {
                get: function (elem, computed, extra) {
                  if (computed) {
                    // Certain elements can have dimension info if we invisibly show them
                    // but it must have a current display style that would benefit
                    return rdisplayswap.test(jQuery.css(elem, "display")) &&
                      // Support: Safari 8+
                      // Table columns in Safari have non-zero offsetWidth & zero
                      // getBoundingClientRect().width unless display is changed.
                      // Support: IE <=11 only
                      // Running getBoundingClientRect on a disconnected node
                      // in IE throws an error.
                      (!elem.getClientRects().length ||
                        !elem.getBoundingClientRect().width)
                      ? swap(elem, cssShow, function () {
                          return getWidthOrHeight(elem, dimension, extra);
                        })
                      : getWidthOrHeight(elem, dimension, extra);
                  }
                },

                set: function (elem, value, extra) {
                  var matches,
                    styles = getStyles(elem),
                    // Only read styles.position if the test has a chance to fail
                    // to avoid forcing a reflow.
                    scrollboxSizeBuggy =
                      !support.scrollboxSize() &&
                      styles.position === "absolute",
                    // To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
                    boxSizingNeeded = scrollboxSizeBuggy || extra,
                    isBorderBox =
                      boxSizingNeeded &&
                      jQuery.css(elem, "boxSizing", false, styles) ===
                        "border-box",
                    subtract = extra
                      ? boxModelAdjustment(
                          elem,
                          dimension,
                          extra,
                          isBorderBox,
                          styles
                        )
                      : 0;

                  // Account for unreliable border-box dimensions by comparing offset* to computed and
                  // faking a content-box to get border and padding (gh-3699)
                  if (isBorderBox && scrollboxSizeBuggy) {
                    subtract -= Math.ceil(
                      elem[
                        "offset" +
                          dimension[0].toUpperCase() +
                          dimension.slice(1)
                      ] -
                        parseFloat(styles[dimension]) -
                        boxModelAdjustment(
                          elem,
                          dimension,
                          "border",
                          false,
                          styles
                        ) -
                        0.5
                    );
                  }

                  // Convert to pixels if value adjustment is needed
                  if (
                    subtract &&
                    (matches = rcssNum.exec(value)) &&
                    (matches[3] || "px") !== "px"
                  ) {
                    elem.style[dimension] = value;
                    value = jQuery.css(elem, dimension);
                  }

                  return setPositiveNumber(elem, value, subtract);
                },
              };
            });

            jQuery.cssHooks.marginLeft = addGetHookIf(
              support.reliableMarginLeft,
              function (elem, computed) {
                if (computed) {
                  return (
                    (parseFloat(curCSS(elem, "marginLeft")) ||
                      elem.getBoundingClientRect().left -
                        swap(elem, { marginLeft: 0 }, function () {
                          return elem.getBoundingClientRect().left;
                        })) + "px"
                  );
                }
              }
            );

            // These hooks are used by animate to expand properties
            jQuery.each(
              {
                margin: "",
                padding: "",
                border: "Width",
              },
              function (prefix, suffix) {
                jQuery.cssHooks[prefix + suffix] = {
                  expand: function (value) {
                    var i = 0,
                      expanded = {},
                      // Assumes a single number if not a string
                      parts =
                        typeof value === "string" ? value.split(" ") : [value];

                    for (; i < 4; i++) {
                      expanded[prefix + cssExpand[i] + suffix] =
                        parts[i] || parts[i - 2] || parts[0];
                    }

                    return expanded;
                  },
                };

                if (prefix !== "margin") {
                  jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
                }
              }
            );

            jQuery.fn.extend({
              css: function (name, value) {
                return access(
                  this,
                  function (elem, name, value) {
                    var styles,
                      len,
                      map = {},
                      i = 0;

                    if (Array.isArray(name)) {
                      styles = getStyles(elem);
                      len = name.length;

                      for (; i < len; i++) {
                        map[name[i]] = jQuery.css(elem, name[i], false, styles);
                      }

                      return map;
                    }

                    return value !== undefined
                      ? jQuery.style(elem, name, value)
                      : jQuery.css(elem, name);
                  },
                  name,
                  value,
                  arguments.length > 1
                );
              },
            });

            function Tween(elem, options, prop, end, easing) {
              return new Tween.prototype.init(elem, options, prop, end, easing);
            }
            jQuery.Tween = Tween;

            Tween.prototype = {
              constructor: Tween,
              init: function (elem, options, prop, end, easing, unit) {
                this.elem = elem;
                this.prop = prop;
                this.easing = easing || jQuery.easing._default;
                this.options = options;
                this.start = this.now = this.cur();
                this.end = end;
                this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
              },
              cur: function () {
                var hooks = Tween.propHooks[this.prop];

                return hooks && hooks.get
                  ? hooks.get(this)
                  : Tween.propHooks._default.get(this);
              },
              run: function (percent) {
                var eased,
                  hooks = Tween.propHooks[this.prop];

                if (this.options.duration) {
                  this.pos = eased = jQuery.easing[this.easing](
                    percent,
                    this.options.duration * percent,
                    0,
                    1,
                    this.options.duration
                  );
                } else {
                  this.pos = eased = percent;
                }
                this.now = (this.end - this.start) * eased + this.start;

                if (this.options.step) {
                  this.options.step.call(this.elem, this.now, this);
                }

                if (hooks && hooks.set) {
                  hooks.set(this);
                } else {
                  Tween.propHooks._default.set(this);
                }
                return this;
              },
            };

            Tween.prototype.init.prototype = Tween.prototype;

            Tween.propHooks = {
              _default: {
                get: function (tween) {
                  var result;

                  // Use a property on the element directly when it is not a DOM element,
                  // or when there is no matching style property that exists.
                  if (
                    tween.elem.nodeType !== 1 ||
                    (tween.elem[tween.prop] != null &&
                      tween.elem.style[tween.prop] == null)
                  ) {
                    return tween.elem[tween.prop];
                  }

                  // Passing an empty string as a 3rd parameter to .css will automatically
                  // attempt a parseFloat and fallback to a string if the parse fails.
                  // Simple values such as "10px" are parsed to Float;
                  // complex values such as "rotate(1rad)" are returned as-is.
                  result = jQuery.css(tween.elem, tween.prop, "");

                  // Empty strings, null, undefined and "auto" are converted to 0.
                  return !result || result === "auto" ? 0 : result;
                },
                set: function (tween) {
                  // Use step hook for back compat.
                  // Use cssHook if its there.
                  // Use .style if available and use plain properties where available.
                  if (jQuery.fx.step[tween.prop]) {
                    jQuery.fx.step[tween.prop](tween);
                  } else if (
                    tween.elem.nodeType === 1 &&
                    (jQuery.cssHooks[tween.prop] ||
                      tween.elem.style[finalPropName(tween.prop)] != null)
                  ) {
                    jQuery.style(
                      tween.elem,
                      tween.prop,
                      tween.now + tween.unit
                    );
                  } else {
                    tween.elem[tween.prop] = tween.now;
                  }
                },
              },
            };

            // Support: IE <=9 only
            // Panic based approach to setting things on disconnected nodes
            Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
              set: function (tween) {
                if (tween.elem.nodeType && tween.elem.parentNode) {
                  tween.elem[tween.prop] = tween.now;
                }
              },
            };

            jQuery.easing = {
              linear: function (p) {
                return p;
              },
              swing: function (p) {
                return 0.5 - Math.cos(p * Math.PI) / 2;
              },
              _default: "swing",
            };

            jQuery.fx = Tween.prototype.init;

            // Back compat <1.8 extension point
            jQuery.fx.step = {};

            var fxNow,
              inProgress,
              rfxtypes = /^(?:toggle|show|hide)$/,
              rrun = /queueHooks$/;

            function schedule() {
              if (inProgress) {
                if (document.hidden === false && window.requestAnimationFrame) {
                  window.requestAnimationFrame(schedule);
                } else {
                  window.setTimeout(schedule, jQuery.fx.interval);
                }

                jQuery.fx.tick();
              }
            }

            // Animations created synchronously will run synchronously
            function createFxNow() {
              window.setTimeout(function () {
                fxNow = undefined;
              });
              return (fxNow = Date.now());
            }

            // Generate parameters to create a standard animation
            function genFx(type, includeWidth) {
              var which,
                i = 0,
                attrs = { height: type };

              // If we include width, step value is 1 to do all cssExpand values,
              // otherwise step value is 2 to skip over Left and Right
              includeWidth = includeWidth ? 1 : 0;
              for (; i < 4; i += 2 - includeWidth) {
                which = cssExpand[i];
                attrs["margin" + which] = attrs["padding" + which] = type;
              }

              if (includeWidth) {
                attrs.opacity = attrs.width = type;
              }

              return attrs;
            }

            function createTween(value, prop, animation) {
              var tween,
                collection = (Animation.tweeners[prop] || []).concat(
                  Animation.tweeners["*"]
                ),
                index = 0,
                length = collection.length;
              for (; index < length; index++) {
                if ((tween = collection[index].call(animation, prop, value))) {
                  // We're done with this property
                  return tween;
                }
              }
            }

            function defaultPrefilter(elem, props, opts) {
              var prop,
                value,
                toggle,
                hooks,
                oldfire,
                propTween,
                restoreDisplay,
                display,
                isBox = "width" in props || "height" in props,
                anim = this,
                orig = {},
                style = elem.style,
                hidden = elem.nodeType && isHiddenWithinTree(elem),
                dataShow = dataPriv.get(elem, "fxshow");

              // Queue-skipping animations hijack the fx hooks
              if (!opts.queue) {
                hooks = jQuery._queueHooks(elem, "fx");
                if (hooks.unqueued == null) {
                  hooks.unqueued = 0;
                  oldfire = hooks.empty.fire;
                  hooks.empty.fire = function () {
                    if (!hooks.unqueued) {
                      oldfire();
                    }
                  };
                }
                hooks.unqueued++;

                anim.always(function () {
                  // Ensure the complete handler is called before this completes
                  anim.always(function () {
                    hooks.unqueued--;
                    if (!jQuery.queue(elem, "fx").length) {
                      hooks.empty.fire();
                    }
                  });
                });
              }

              // Detect show/hide animations
              for (prop in props) {
                value = props[prop];
                if (rfxtypes.test(value)) {
                  delete props[prop];
                  toggle = toggle || value === "toggle";
                  if (value === (hidden ? "hide" : "show")) {
                    // Pretend to be hidden if this is a "show" and
                    // there is still data from a stopped show/hide
                    if (
                      value === "show" &&
                      dataShow &&
                      dataShow[prop] !== undefined
                    ) {
                      hidden = true;

                      // Ignore all other no-op show/hide data
                    } else {
                      continue;
                    }
                  }
                  orig[prop] =
                    (dataShow && dataShow[prop]) || jQuery.style(elem, prop);
                }
              }

              // Bail out if this is a no-op like .hide().hide()
              propTween = !jQuery.isEmptyObject(props);
              if (!propTween && jQuery.isEmptyObject(orig)) {
                return;
              }

              // Restrict "overflow" and "display" styles during box animations
              if (isBox && elem.nodeType === 1) {
                // Support: IE <=9 - 11, Edge 12 - 15
                // Record all 3 overflow attributes because IE does not infer the shorthand
                // from identically-valued overflowX and overflowY and Edge just mirrors
                // the overflowX value there.
                opts.overflow = [
                  style.overflow,
                  style.overflowX,
                  style.overflowY,
                ];

                // Identify a display type, preferring old show/hide data over the CSS cascade
                restoreDisplay = dataShow && dataShow.display;
                if (restoreDisplay == null) {
                  restoreDisplay = dataPriv.get(elem, "display");
                }
                display = jQuery.css(elem, "display");
                if (display === "none") {
                  if (restoreDisplay) {
                    display = restoreDisplay;
                  } else {
                    // Get nonempty value(s) by temporarily forcing visibility
                    showHide([elem], true);
                    restoreDisplay = elem.style.display || restoreDisplay;
                    display = jQuery.css(elem, "display");
                    showHide([elem]);
                  }
                }

                // Animate inline elements as inline-block
                if (
                  display === "inline" ||
                  (display === "inline-block" && restoreDisplay != null)
                ) {
                  if (jQuery.css(elem, "float") === "none") {
                    // Restore the original display value at the end of pure show/hide animations
                    if (!propTween) {
                      anim.done(function () {
                        style.display = restoreDisplay;
                      });
                      if (restoreDisplay == null) {
                        display = style.display;
                        restoreDisplay = display === "none" ? "" : display;
                      }
                    }
                    style.display = "inline-block";
                  }
                }
              }

              if (opts.overflow) {
                style.overflow = "hidden";
                anim.always(function () {
                  style.overflow = opts.overflow[0];
                  style.overflowX = opts.overflow[1];
                  style.overflowY = opts.overflow[2];
                });
              }

              // Implement show/hide animations
              propTween = false;
              for (prop in orig) {
                // General show/hide setup for this element animation
                if (!propTween) {
                  if (dataShow) {
                    if ("hidden" in dataShow) {
                      hidden = dataShow.hidden;
                    }
                  } else {
                    dataShow = dataPriv.access(elem, "fxshow", {
                      display: restoreDisplay,
                    });
                  }

                  // Store hidden/visible for toggle so `.stop().toggle()` "reverses"
                  if (toggle) {
                    dataShow.hidden = !hidden;
                  }

                  // Show elements before animating them
                  if (hidden) {
                    showHide([elem], true);
                  }

                  /* eslint-disable no-loop-func */

                  anim.done(function () {
                    /* eslint-enable no-loop-func */

                    // The final step of a "hide" animation is actually hiding the element
                    if (!hidden) {
                      showHide([elem]);
                    }
                    dataPriv.remove(elem, "fxshow");
                    for (prop in orig) {
                      jQuery.style(elem, prop, orig[prop]);
                    }
                  });
                }

                // Per-property setup
                propTween = createTween(
                  hidden ? dataShow[prop] : 0,
                  prop,
                  anim
                );
                if (!(prop in dataShow)) {
                  dataShow[prop] = propTween.start;
                  if (hidden) {
                    propTween.end = propTween.start;
                    propTween.start = 0;
                  }
                }
              }
            }

            function propFilter(props, specialEasing) {
              var index, name, easing, value, hooks;

              // camelCase, specialEasing and expand cssHook pass
              for (index in props) {
                name = camelCase(index);
                easing = specialEasing[name];
                value = props[index];
                if (Array.isArray(value)) {
                  easing = value[1];
                  value = props[index] = value[0];
                }

                if (index !== name) {
                  props[name] = value;
                  delete props[index];
                }

                hooks = jQuery.cssHooks[name];
                if (hooks && "expand" in hooks) {
                  value = hooks.expand(value);
                  delete props[name];

                  // Not quite $.extend, this won't overwrite existing keys.
                  // Reusing 'index' because we have the correct "name"
                  for (index in value) {
                    if (!(index in props)) {
                      props[index] = value[index];
                      specialEasing[index] = easing;
                    }
                  }
                } else {
                  specialEasing[name] = easing;
                }
              }
            }

            function Animation(elem, properties, options) {
              var result,
                stopped,
                index = 0,
                length = Animation.prefilters.length,
                deferred = jQuery.Deferred().always(function () {
                  // Don't match elem in the :animated selector
                  delete tick.elem;
                }),
                tick = function () {
                  if (stopped) {
                    return false;
                  }
                  var currentTime = fxNow || createFxNow(),
                    remaining = Math.max(
                      0,
                      animation.startTime + animation.duration - currentTime
                    ),
                    // Support: Android 2.3 only
                    // Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
                    temp = remaining / animation.duration || 0,
                    percent = 1 - temp,
                    index = 0,
                    length = animation.tweens.length;

                  for (; index < length; index++) {
                    animation.tweens[index].run(percent);
                  }

                  deferred.notifyWith(elem, [animation, percent, remaining]);

                  // If there's more to do, yield
                  if (percent < 1 && length) {
                    return remaining;
                  }

                  // If this was an empty animation, synthesize a final progress notification
                  if (!length) {
                    deferred.notifyWith(elem, [animation, 1, 0]);
                  }

                  // Resolve the animation and report its conclusion
                  deferred.resolveWith(elem, [animation]);
                  return false;
                },
                animation = deferred.promise({
                  elem: elem,
                  props: jQuery.extend({}, properties),
                  opts: jQuery.extend(
                    true,
                    {
                      specialEasing: {},
                      easing: jQuery.easing._default,
                    },
                    options
                  ),
                  originalProperties: properties,
                  originalOptions: options,
                  startTime: fxNow || createFxNow(),
                  duration: options.duration,
                  tweens: [],
                  createTween: function (prop, end) {
                    var tween = jQuery.Tween(
                      elem,
                      animation.opts,
                      prop,
                      end,
                      animation.opts.specialEasing[prop] ||
                        animation.opts.easing
                    );
                    animation.tweens.push(tween);
                    return tween;
                  },
                  stop: function (gotoEnd) {
                    var index = 0,
                      // If we are going to the end, we want to run all the tweens
                      // otherwise we skip this part
                      length = gotoEnd ? animation.tweens.length : 0;
                    if (stopped) {
                      return this;
                    }
                    stopped = true;
                    for (; index < length; index++) {
                      animation.tweens[index].run(1);
                    }

                    // Resolve when we played the last frame; otherwise, reject
                    if (gotoEnd) {
                      deferred.notifyWith(elem, [animation, 1, 0]);
                      deferred.resolveWith(elem, [animation, gotoEnd]);
                    } else {
                      deferred.rejectWith(elem, [animation, gotoEnd]);
                    }
                    return this;
                  },
                }),
                props = animation.props;

              propFilter(props, animation.opts.specialEasing);

              for (; index < length; index++) {
                result = Animation.prefilters[index].call(
                  animation,
                  elem,
                  props,
                  animation.opts
                );
                if (result) {
                  if (isFunction(result.stop)) {
                    jQuery._queueHooks(
                      animation.elem,
                      animation.opts.queue
                    ).stop = result.stop.bind(result);
                  }
                  return result;
                }
              }

              jQuery.map(props, createTween, animation);

              if (isFunction(animation.opts.start)) {
                animation.opts.start.call(elem, animation);
              }

              // Attach callbacks from options
              animation
                .progress(animation.opts.progress)
                .done(animation.opts.done, animation.opts.complete)
                .fail(animation.opts.fail)
                .always(animation.opts.always);

              jQuery.fx.timer(
                jQuery.extend(tick, {
                  elem: elem,
                  anim: animation,
                  queue: animation.opts.queue,
                })
              );

              return animation;
            }

            jQuery.Animation = jQuery.extend(Animation, {
              tweeners: {
                "*": [
                  function (prop, value) {
                    var tween = this.createTween(prop, value);
                    adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
                    return tween;
                  },
                ],
              },

              tweener: function (props, callback) {
                if (isFunction(props)) {
                  callback = props;
                  props = ["*"];
                } else {
                  props = props.match(rnothtmlwhite);
                }

                var prop,
                  index = 0,
                  length = props.length;

                for (; index < length; index++) {
                  prop = props[index];
                  Animation.tweeners[prop] = Animation.tweeners[prop] || [];
                  Animation.tweeners[prop].unshift(callback);
                }
              },

              prefilters: [defaultPrefilter],

              prefilter: function (callback, prepend) {
                if (prepend) {
                  Animation.prefilters.unshift(callback);
                } else {
                  Animation.prefilters.push(callback);
                }
              },
            });

            jQuery.speed = function (speed, easing, fn) {
              var opt =
                speed && typeof speed === "object"
                  ? jQuery.extend({}, speed)
                  : {
                      complete:
                        fn || (!fn && easing) || (isFunction(speed) && speed),
                      duration: speed,
                      easing:
                        (fn && easing) ||
                        (easing && !isFunction(easing) && easing),
                    };

              // Go to the end state if fx are off
              if (jQuery.fx.off) {
                opt.duration = 0;
              } else {
                if (typeof opt.duration !== "number") {
                  if (opt.duration in jQuery.fx.speeds) {
                    opt.duration = jQuery.fx.speeds[opt.duration];
                  } else {
                    opt.duration = jQuery.fx.speeds._default;
                  }
                }
              }

              // Normalize opt.queue - true/undefined/null -> "fx"
              if (opt.queue == null || opt.queue === true) {
                opt.queue = "fx";
              }

              // Queueing
              opt.old = opt.complete;

              opt.complete = function () {
                if (isFunction(opt.old)) {
                  opt.old.call(this);
                }

                if (opt.queue) {
                  jQuery.dequeue(this, opt.queue);
                }
              };

              return opt;
            };

            jQuery.fn.extend({
              fadeTo: function (speed, to, easing, callback) {
                // Show any hidden elements after setting opacity to 0
                return (
                  this.filter(isHiddenWithinTree)
                    .css("opacity", 0)
                    .show()

                    // Animate to the value specified
                    .end()
                    .animate({ opacity: to }, speed, easing, callback)
                );
              },
              animate: function (prop, speed, easing, callback) {
                var empty = jQuery.isEmptyObject(prop),
                  optall = jQuery.speed(speed, easing, callback),
                  doAnimation = function () {
                    // Operate on a copy of prop so per-property easing won't be lost
                    var anim = Animation(this, jQuery.extend({}, prop), optall);

                    // Empty animations, or finishing resolves immediately
                    if (empty || dataPriv.get(this, "finish")) {
                      anim.stop(true);
                    }
                  };
                doAnimation.finish = doAnimation;

                return empty || optall.queue === false
                  ? this.each(doAnimation)
                  : this.queue(optall.queue, doAnimation);
              },
              stop: function (type, clearQueue, gotoEnd) {
                var stopQueue = function (hooks) {
                  var stop = hooks.stop;
                  delete hooks.stop;
                  stop(gotoEnd);
                };

                if (typeof type !== "string") {
                  gotoEnd = clearQueue;
                  clearQueue = type;
                  type = undefined;
                }
                if (clearQueue) {
                  this.queue(type || "fx", []);
                }

                return this.each(function () {
                  var dequeue = true,
                    index = type != null && type + "queueHooks",
                    timers = jQuery.timers,
                    data = dataPriv.get(this);

                  if (index) {
                    if (data[index] && data[index].stop) {
                      stopQueue(data[index]);
                    }
                  } else {
                    for (index in data) {
                      if (data[index] && data[index].stop && rrun.test(index)) {
                        stopQueue(data[index]);
                      }
                    }
                  }

                  for (index = timers.length; index--; ) {
                    if (
                      timers[index].elem === this &&
                      (type == null || timers[index].queue === type)
                    ) {
                      timers[index].anim.stop(gotoEnd);
                      dequeue = false;
                      timers.splice(index, 1);
                    }
                  }

                  // Start the next in the queue if the last step wasn't forced.
                  // Timers currently will call their complete callbacks, which
                  // will dequeue but only if they were gotoEnd.
                  if (dequeue || !gotoEnd) {
                    jQuery.dequeue(this, type);
                  }
                });
              },
              finish: function (type) {
                if (type !== false) {
                  type = type || "fx";
                }
                return this.each(function () {
                  var index,
                    data = dataPriv.get(this),
                    queue = data[type + "queue"],
                    hooks = data[type + "queueHooks"],
                    timers = jQuery.timers,
                    length = queue ? queue.length : 0;

                  // Enable finishing flag on private data
                  data.finish = true;

                  // Empty the queue first
                  jQuery.queue(this, type, []);

                  if (hooks && hooks.stop) {
                    hooks.stop.call(this, true);
                  }

                  // Look for any active animations, and finish them
                  for (index = timers.length; index--; ) {
                    if (
                      timers[index].elem === this &&
                      timers[index].queue === type
                    ) {
                      timers[index].anim.stop(true);
                      timers.splice(index, 1);
                    }
                  }

                  // Look for any animations in the old queue and finish them
                  for (index = 0; index < length; index++) {
                    if (queue[index] && queue[index].finish) {
                      queue[index].finish.call(this);
                    }
                  }

                  // Turn off finishing flag
                  delete data.finish;
                });
              },
            });

            jQuery.each(["toggle", "show", "hide"], function (_i, name) {
              var cssFn = jQuery.fn[name];
              jQuery.fn[name] = function (speed, easing, callback) {
                return speed == null || typeof speed === "boolean"
                  ? cssFn.apply(this, arguments)
                  : this.animate(genFx(name, true), speed, easing, callback);
              };
            });

            // Generate shortcuts for custom animations
            jQuery.each(
              {
                slideDown: genFx("show"),
                slideUp: genFx("hide"),
                slideToggle: genFx("toggle"),
                fadeIn: { opacity: "show" },
                fadeOut: { opacity: "hide" },
                fadeToggle: { opacity: "toggle" },
              },
              function (name, props) {
                jQuery.fn[name] = function (speed, easing, callback) {
                  return this.animate(props, speed, easing, callback);
                };
              }
            );

            jQuery.timers = [];
            jQuery.fx.tick = function () {
              var timer,
                i = 0,
                timers = jQuery.timers;

              fxNow = Date.now();

              for (; i < timers.length; i++) {
                timer = timers[i];

                // Run the timer and safely remove it when done (allowing for external removal)
                if (!timer() && timers[i] === timer) {
                  timers.splice(i--, 1);
                }
              }

              if (!timers.length) {
                jQuery.fx.stop();
              }
              fxNow = undefined;
            };

            jQuery.fx.timer = function (timer) {
              jQuery.timers.push(timer);
              jQuery.fx.start();
            };

            jQuery.fx.interval = 13;
            jQuery.fx.start = function () {
              if (inProgress) {
                return;
              }

              inProgress = true;
              schedule();
            };

            jQuery.fx.stop = function () {
              inProgress = null;
            };

            jQuery.fx.speeds = {
              slow: 600,
              fast: 200,

              // Default speed
              _default: 400,
            };

            // Based off of the plugin by Clint Helfers, with permission.
            // https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
            jQuery.fn.delay = function (time, type) {
              time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
              type = type || "fx";

              return this.queue(type, function (next, hooks) {
                var timeout = window.setTimeout(next, time);
                hooks.stop = function () {
                  window.clearTimeout(timeout);
                };
              });
            };

            (function () {
              var input = document.createElement("input"),
                select = document.createElement("select"),
                opt = select.appendChild(document.createElement("option"));

              input.type = "checkbox";

              // Support: Android <=4.3 only
              // Default value for a checkbox should be "on"
              support.checkOn = input.value !== "";

              // Support: IE <=11 only
              // Must access selectedIndex to make default options select
              support.optSelected = opt.selected;

              // Support: IE <=11 only
              // An input loses its value after becoming a radio
              input = document.createElement("input");
              input.value = "t";
              input.type = "radio";
              support.radioValue = input.value === "t";
            })();

            var boolHook,
              attrHandle = jQuery.expr.attrHandle;

            jQuery.fn.extend({
              attr: function (name, value) {
                return access(
                  this,
                  jQuery.attr,
                  name,
                  value,
                  arguments.length > 1
                );
              },

              removeAttr: function (name) {
                return this.each(function () {
                  jQuery.removeAttr(this, name);
                });
              },
            });

            jQuery.extend({
              attr: function (elem, name, value) {
                var ret,
                  hooks,
                  nType = elem.nodeType;

                // Don't get/set attributes on text, comment and attribute nodes
                if (nType === 3 || nType === 8 || nType === 2) {
                  return;
                }

                // Fallback to prop when attributes are not supported
                if (typeof elem.getAttribute === "undefined") {
                  return jQuery.prop(elem, name, value);
                }

                // Attribute hooks are determined by the lowercase version
                // Grab necessary hook if one is defined
                if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                  hooks =
                    jQuery.attrHooks[name.toLowerCase()] ||
                    (jQuery.expr.match.bool.test(name) ? boolHook : undefined);
                }

                if (value !== undefined) {
                  if (value === null) {
                    jQuery.removeAttr(elem, name);
                    return;
                  }

                  if (
                    hooks &&
                    "set" in hooks &&
                    (ret = hooks.set(elem, value, name)) !== undefined
                  ) {
                    return ret;
                  }

                  elem.setAttribute(name, value + "");
                  return value;
                }

                if (
                  hooks &&
                  "get" in hooks &&
                  (ret = hooks.get(elem, name)) !== null
                ) {
                  return ret;
                }

                ret = jQuery.find.attr(elem, name);

                // Non-existent attributes return null, we normalize to undefined
                return ret == null ? undefined : ret;
              },

              attrHooks: {
                type: {
                  set: function (elem, value) {
                    if (
                      !support.radioValue &&
                      value === "radio" &&
                      nodeName(elem, "input")
                    ) {
                      var val = elem.value;
                      elem.setAttribute("type", value);
                      if (val) {
                        elem.value = val;
                      }
                      return value;
                    }
                  },
                },
              },

              removeAttr: function (elem, value) {
                var name,
                  i = 0,
                  // Attribute names can contain non-HTML whitespace characters
                  // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
                  attrNames = value && value.match(rnothtmlwhite);

                if (attrNames && elem.nodeType === 1) {
                  while ((name = attrNames[i++])) {
                    elem.removeAttribute(name);
                  }
                }
              },
            });

            // Hooks for boolean attributes
            boolHook = {
              set: function (elem, value, name) {
                if (value === false) {
                  // Remove boolean attributes when set to false
                  jQuery.removeAttr(elem, name);
                } else {
                  elem.setAttribute(name, name);
                }
                return name;
              },
            };

            jQuery.each(
              jQuery.expr.match.bool.source.match(/\w+/g),
              function (_i, name) {
                var getter = attrHandle[name] || jQuery.find.attr;

                attrHandle[name] = function (elem, name, isXML) {
                  var ret,
                    handle,
                    lowercaseName = name.toLowerCase();

                  if (!isXML) {
                    // Avoid an infinite loop by temporarily removing this function from the getter
                    handle = attrHandle[lowercaseName];
                    attrHandle[lowercaseName] = ret;
                    ret =
                      getter(elem, name, isXML) != null ? lowercaseName : null;
                    attrHandle[lowercaseName] = handle;
                  }
                  return ret;
                };
              }
            );

            var rfocusable = /^(?:input|select|textarea|button)$/i,
              rclickable = /^(?:a|area)$/i;

            jQuery.fn.extend({
              prop: function (name, value) {
                return access(
                  this,
                  jQuery.prop,
                  name,
                  value,
                  arguments.length > 1
                );
              },

              removeProp: function (name) {
                return this.each(function () {
                  delete this[jQuery.propFix[name] || name];
                });
              },
            });

            jQuery.extend({
              prop: function (elem, name, value) {
                var ret,
                  hooks,
                  nType = elem.nodeType;

                // Don't get/set properties on text, comment and attribute nodes
                if (nType === 3 || nType === 8 || nType === 2) {
                  return;
                }

                if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                  // Fix name and attach hooks
                  name = jQuery.propFix[name] || name;
                  hooks = jQuery.propHooks[name];
                }

                if (value !== undefined) {
                  if (
                    hooks &&
                    "set" in hooks &&
                    (ret = hooks.set(elem, value, name)) !== undefined
                  ) {
                    return ret;
                  }

                  return (elem[name] = value);
                }

                if (
                  hooks &&
                  "get" in hooks &&
                  (ret = hooks.get(elem, name)) !== null
                ) {
                  return ret;
                }

                return elem[name];
              },

              propHooks: {
                tabIndex: {
                  get: function (elem) {
                    // Support: IE <=9 - 11 only
                    // elem.tabIndex doesn't always return the
                    // correct value when it hasn't been explicitly set
                    // https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                    // Use proper attribute retrieval(#12072)
                    var tabindex = jQuery.find.attr(elem, "tabindex");

                    if (tabindex) {
                      return parseInt(tabindex, 10);
                    }

                    if (
                      rfocusable.test(elem.nodeName) ||
                      (rclickable.test(elem.nodeName) && elem.href)
                    ) {
                      return 0;
                    }

                    return -1;
                  },
                },
              },

              propFix: {
                for: "htmlFor",
                class: "className",
              },
            });

            // Support: IE <=11 only
            // Accessing the selectedIndex property
            // forces the browser to respect setting selected
            // on the option
            // The getter ensures a default option is selected
            // when in an optgroup
            // eslint rule "no-unused-expressions" is disabled for this code
            // since it considers such accessions noop
            if (!support.optSelected) {
              jQuery.propHooks.selected = {
                get: function (elem) {
                  /* eslint no-unused-expressions: "off" */

                  var parent = elem.parentNode;
                  if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                  }
                  return null;
                },
                set: function (elem) {
                  /* eslint no-unused-expressions: "off" */

                  var parent = elem.parentNode;
                  if (parent) {
                    parent.selectedIndex;

                    if (parent.parentNode) {
                      parent.parentNode.selectedIndex;
                    }
                  }
                },
              };
            }

            jQuery.each(
              [
                "tabIndex",
                "readOnly",
                "maxLength",
                "cellSpacing",
                "cellPadding",
                "rowSpan",
                "colSpan",
                "useMap",
                "frameBorder",
                "contentEditable",
              ],
              function () {
                jQuery.propFix[this.toLowerCase()] = this;
              }
            );

            // Strip and collapse whitespace according to HTML spec
            // https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
            function stripAndCollapse(value) {
              var tokens = value.match(rnothtmlwhite) || [];
              return tokens.join(" ");
            }

            function getClass(elem) {
              return (elem.getAttribute && elem.getAttribute("class")) || "";
            }

            function classesToArray(value) {
              if (Array.isArray(value)) {
                return value;
              }
              if (typeof value === "string") {
                return value.match(rnothtmlwhite) || [];
              }
              return [];
            }

            jQuery.fn.extend({
              addClass: function (value) {
                var classes,
                  elem,
                  cur,
                  curValue,
                  clazz,
                  j,
                  finalValue,
                  i = 0;

                if (isFunction(value)) {
                  return this.each(function (j) {
                    jQuery(this).addClass(value.call(this, j, getClass(this)));
                  });
                }

                classes = classesToArray(value);

                if (classes.length) {
                  while ((elem = this[i++])) {
                    curValue = getClass(elem);
                    cur =
                      elem.nodeType === 1 &&
                      " " + stripAndCollapse(curValue) + " ";

                    if (cur) {
                      j = 0;
                      while ((clazz = classes[j++])) {
                        if (cur.indexOf(" " + clazz + " ") < 0) {
                          cur += clazz + " ";
                        }
                      }

                      // Only assign if different to avoid unneeded rendering.
                      finalValue = stripAndCollapse(cur);
                      if (curValue !== finalValue) {
                        elem.setAttribute("class", finalValue);
                      }
                    }
                  }
                }

                return this;
              },

              removeClass: function (value) {
                var classes,
                  elem,
                  cur,
                  curValue,
                  clazz,
                  j,
                  finalValue,
                  i = 0;

                if (isFunction(value)) {
                  return this.each(function (j) {
                    jQuery(this).removeClass(
                      value.call(this, j, getClass(this))
                    );
                  });
                }

                if (!arguments.length) {
                  return this.attr("class", "");
                }

                classes = classesToArray(value);

                if (classes.length) {
                  while ((elem = this[i++])) {
                    curValue = getClass(elem);

                    // This expression is here for better compressibility (see addClass)
                    cur =
                      elem.nodeType === 1 &&
                      " " + stripAndCollapse(curValue) + " ";

                    if (cur) {
                      j = 0;
                      while ((clazz = classes[j++])) {
                        // Remove *all* instances
                        while (cur.indexOf(" " + clazz + " ") > -1) {
                          cur = cur.replace(" " + clazz + " ", " ");
                        }
                      }

                      // Only assign if different to avoid unneeded rendering.
                      finalValue = stripAndCollapse(cur);
                      if (curValue !== finalValue) {
                        elem.setAttribute("class", finalValue);
                      }
                    }
                  }
                }

                return this;
              },

              toggleClass: function (value, stateVal) {
                var type = typeof value,
                  isValidValue = type === "string" || Array.isArray(value);

                if (typeof stateVal === "boolean" && isValidValue) {
                  return stateVal
                    ? this.addClass(value)
                    : this.removeClass(value);
                }

                if (isFunction(value)) {
                  return this.each(function (i) {
                    jQuery(this).toggleClass(
                      value.call(this, i, getClass(this), stateVal),
                      stateVal
                    );
                  });
                }

                return this.each(function () {
                  var className, i, self, classNames;

                  if (isValidValue) {
                    // Toggle individual class names
                    i = 0;
                    self = jQuery(this);
                    classNames = classesToArray(value);

                    while ((className = classNames[i++])) {
                      // Check each className given, space separated list
                      if (self.hasClass(className)) {
                        self.removeClass(className);
                      } else {
                        self.addClass(className);
                      }
                    }

                    // Toggle whole class name
                  } else if (value === undefined || type === "boolean") {
                    className = getClass(this);
                    if (className) {
                      // Store className if set
                      dataPriv.set(this, "__className__", className);
                    }

                    // If the element has a class name or if we're passed `false`,
                    // then remove the whole classname (if there was one, the above saved it).
                    // Otherwise bring back whatever was previously saved (if anything),
                    // falling back to the empty string if nothing was stored.
                    if (this.setAttribute) {
                      this.setAttribute(
                        "class",
                        className || value === false
                          ? ""
                          : dataPriv.get(this, "__className__") || ""
                      );
                    }
                  }
                });
              },

              hasClass: function (selector) {
                var className,
                  elem,
                  i = 0;

                className = " " + selector + " ";
                while ((elem = this[i++])) {
                  if (
                    elem.nodeType === 1 &&
                    (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(
                      className
                    ) > -1
                  ) {
                    return true;
                  }
                }

                return false;
              },
            });

            var rreturn = /\r/g;

            jQuery.fn.extend({
              val: function (value) {
                var hooks,
                  ret,
                  valueIsFunction,
                  elem = this[0];

                if (!arguments.length) {
                  if (elem) {
                    hooks =
                      jQuery.valHooks[elem.type] ||
                      jQuery.valHooks[elem.nodeName.toLowerCase()];

                    if (
                      hooks &&
                      "get" in hooks &&
                      (ret = hooks.get(elem, "value")) !== undefined
                    ) {
                      return ret;
                    }

                    ret = elem.value;

                    // Handle most common string cases
                    if (typeof ret === "string") {
                      return ret.replace(rreturn, "");
                    }

                    // Handle cases where value is null/undef or number
                    return ret == null ? "" : ret;
                  }

                  return;
                }

                valueIsFunction = isFunction(value);

                return this.each(function (i) {
                  var val;

                  if (this.nodeType !== 1) {
                    return;
                  }

                  if (valueIsFunction) {
                    val = value.call(this, i, jQuery(this).val());
                  } else {
                    val = value;
                  }

                  // Treat null/undefined as ""; convert numbers to string
                  if (val == null) {
                    val = "";
                  } else if (typeof val === "number") {
                    val += "";
                  } else if (Array.isArray(val)) {
                    val = jQuery.map(val, function (value) {
                      return value == null ? "" : value + "";
                    });
                  }

                  hooks =
                    jQuery.valHooks[this.type] ||
                    jQuery.valHooks[this.nodeName.toLowerCase()];

                  // If set returns undefined, fall back to normal setting
                  if (
                    !hooks ||
                    !("set" in hooks) ||
                    hooks.set(this, val, "value") === undefined
                  ) {
                    this.value = val;
                  }
                });
              },
            });

            jQuery.extend({
              valHooks: {
                option: {
                  get: function (elem) {
                    var val = jQuery.find.attr(elem, "value");
                    return val != null
                      ? val
                      : // Support: IE <=10 - 11 only
                        // option.text throws exceptions (#14686, #14858)
                        // Strip and collapse whitespace
                        // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
                        stripAndCollapse(jQuery.text(elem));
                  },
                },
                select: {
                  get: function (elem) {
                    var value,
                      option,
                      i,
                      options = elem.options,
                      index = elem.selectedIndex,
                      one = elem.type === "select-one",
                      values = one ? null : [],
                      max = one ? index + 1 : options.length;

                    if (index < 0) {
                      i = max;
                    } else {
                      i = one ? index : 0;
                    }

                    // Loop through all the selected options
                    for (; i < max; i++) {
                      option = options[i];

                      // Support: IE <=9 only
                      // IE8-9 doesn't update selected after form reset (#2551)
                      if (
                        (option.selected || i === index) &&
                        // Don't return options that are disabled or in a disabled optgroup
                        !option.disabled &&
                        (!option.parentNode.disabled ||
                          !nodeName(option.parentNode, "optgroup"))
                      ) {
                        // Get the specific value for the option
                        value = jQuery(option).val();

                        // We don't need an array for one selects
                        if (one) {
                          return value;
                        }

                        // Multi-Selects return an array
                        values.push(value);
                      }
                    }

                    return values;
                  },

                  set: function (elem, value) {
                    var optionSet,
                      option,
                      options = elem.options,
                      values = jQuery.makeArray(value),
                      i = options.length;

                    while (i--) {
                      option = options[i];

                      /* eslint-disable no-cond-assign */

                      if (
                        (option.selected =
                          jQuery.inArray(
                            jQuery.valHooks.option.get(option),
                            values
                          ) > -1)
                      ) {
                        optionSet = true;
                      }

                      /* eslint-enable no-cond-assign */
                    }

                    // Force browsers to behave consistently when non-matching value is set
                    if (!optionSet) {
                      elem.selectedIndex = -1;
                    }
                    return values;
                  },
                },
              },
            });

            // Radios and checkboxes getter/setter
            jQuery.each(["radio", "checkbox"], function () {
              jQuery.valHooks[this] = {
                set: function (elem, value) {
                  if (Array.isArray(value)) {
                    return (elem.checked =
                      jQuery.inArray(jQuery(elem).val(), value) > -1);
                  }
                },
              };
              if (!support.checkOn) {
                jQuery.valHooks[this].get = function (elem) {
                  return elem.getAttribute("value") === null
                    ? "on"
                    : elem.value;
                };
              }
            });

            // Return jQuery for attributes-only inclusion

            support.focusin = "onfocusin" in window;

            var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
              stopPropagationCallback = function (e) {
                e.stopPropagation();
              };

            jQuery.extend(jQuery.event, {
              trigger: function (event, data, elem, onlyHandlers) {
                var i,
                  cur,
                  tmp,
                  bubbleType,
                  ontype,
                  handle,
                  special,
                  lastElement,
                  eventPath = [elem || document],
                  type = hasOwn.call(event, "type") ? event.type : event,
                  namespaces = hasOwn.call(event, "namespace")
                    ? event.namespace.split(".")
                    : [];

                cur = lastElement = tmp = elem = elem || document;

                // Don't do events on text and comment nodes
                if (elem.nodeType === 3 || elem.nodeType === 8) {
                  return;
                }

                // focus/blur morphs to focusin/out; ensure we're not firing them right now
                if (rfocusMorph.test(type + jQuery.event.triggered)) {
                  return;
                }

                if (type.indexOf(".") > -1) {
                  // Namespaced trigger; create a regexp to match event type in handle()
                  namespaces = type.split(".");
                  type = namespaces.shift();
                  namespaces.sort();
                }
                ontype = type.indexOf(":") < 0 && "on" + type;

                // Caller can pass in a jQuery.Event object, Object, or just an event type string
                event = event[jQuery.expando]
                  ? event
                  : new jQuery.Event(type, typeof event === "object" && event);

                // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
                event.isTrigger = onlyHandlers ? 2 : 3;
                event.namespace = namespaces.join(".");
                event.rnamespace = event.namespace
                  ? new RegExp(
                      "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"
                    )
                  : null;

                // Clean up the event in case it is being reused
                event.result = undefined;
                if (!event.target) {
                  event.target = elem;
                }

                // Clone any incoming data and prepend the event, creating the handler arg list
                data = data == null ? [event] : jQuery.makeArray(data, [event]);

                // Allow special events to draw outside the lines
                special = jQuery.event.special[type] || {};
                if (
                  !onlyHandlers &&
                  special.trigger &&
                  special.trigger.apply(elem, data) === false
                ) {
                  return;
                }

                // Determine event propagation path in advance, per W3C events spec (#9951)
                // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
                if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
                  bubbleType = special.delegateType || type;
                  if (!rfocusMorph.test(bubbleType + type)) {
                    cur = cur.parentNode;
                  }
                  for (; cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                  }

                  // Only add window if we got to document (e.g., not plain obj or detached DOM)
                  if (tmp === (elem.ownerDocument || document)) {
                    eventPath.push(
                      tmp.defaultView || tmp.parentWindow || window
                    );
                  }
                }

                // Fire handlers on the event path
                i = 0;
                while (
                  (cur = eventPath[i++]) &&
                  !event.isPropagationStopped()
                ) {
                  lastElement = cur;
                  event.type = i > 1 ? bubbleType : special.bindType || type;

                  // jQuery handler
                  handle =
                    (dataPriv.get(cur, "events") || Object.create(null))[
                      event.type
                    ] && dataPriv.get(cur, "handle");
                  if (handle) {
                    handle.apply(cur, data);
                  }

                  // Native handler
                  handle = ontype && cur[ontype];
                  if (handle && handle.apply && acceptData(cur)) {
                    event.result = handle.apply(cur, data);
                    if (event.result === false) {
                      event.preventDefault();
                    }
                  }
                }
                event.type = type;

                // If nobody prevented the default action, do it now
                if (!onlyHandlers && !event.isDefaultPrevented()) {
                  if (
                    (!special._default ||
                      special._default.apply(eventPath.pop(), data) ===
                        false) &&
                    acceptData(elem)
                  ) {
                    // Call a native DOM method on the target with the same name as the event.
                    // Don't do default actions on window, that's where global variables be (#6170)
                    if (ontype && isFunction(elem[type]) && !isWindow(elem)) {
                      // Don't re-trigger an onFOO event when we call its FOO() method
                      tmp = elem[ontype];

                      if (tmp) {
                        elem[ontype] = null;
                      }

                      // Prevent re-triggering of the same event, since we already bubbled it above
                      jQuery.event.triggered = type;

                      if (event.isPropagationStopped()) {
                        lastElement.addEventListener(
                          type,
                          stopPropagationCallback
                        );
                      }

                      elem[type]();

                      if (event.isPropagationStopped()) {
                        lastElement.removeEventListener(
                          type,
                          stopPropagationCallback
                        );
                      }

                      jQuery.event.triggered = undefined;

                      if (tmp) {
                        elem[ontype] = tmp;
                      }
                    }
                  }
                }

                return event.result;
              },

              // Piggyback on a donor event to simulate a different one
              // Used only for `focus(in | out)` events
              simulate: function (type, elem, event) {
                var e = jQuery.extend(new jQuery.Event(), event, {
                  type: type,
                  isSimulated: true,
                });

                jQuery.event.trigger(e, null, elem);
              },
            });

            jQuery.fn.extend({
              trigger: function (type, data) {
                return this.each(function () {
                  jQuery.event.trigger(type, data, this);
                });
              },
              triggerHandler: function (type, data) {
                var elem = this[0];
                if (elem) {
                  return jQuery.event.trigger(type, data, elem, true);
                }
              },
            });

            // Support: Firefox <=44
            // Firefox doesn't have focus(in | out) events
            // Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
            //
            // Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
            // focus(in | out) events fire after focus & blur events,
            // which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
            // Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
            if (!support.focusin) {
              jQuery.each(
                { focus: "focusin", blur: "focusout" },
                function (orig, fix) {
                  // Attach a single capturing handler on the document while someone wants focusin/focusout
                  var handler = function (event) {
                    jQuery.event.simulate(
                      fix,
                      event.target,
                      jQuery.event.fix(event)
                    );
                  };

                  jQuery.event.special[fix] = {
                    setup: function () {
                      // Handle: regular nodes (via `this.ownerDocument`), window
                      // (via `this.document`) & document (via `this`).
                      var doc = this.ownerDocument || this.document || this,
                        attaches = dataPriv.access(doc, fix);

                      if (!attaches) {
                        doc.addEventListener(orig, handler, true);
                      }
                      dataPriv.access(doc, fix, (attaches || 0) + 1);
                    },
                    teardown: function () {
                      var doc = this.ownerDocument || this.document || this,
                        attaches = dataPriv.access(doc, fix) - 1;

                      if (!attaches) {
                        doc.removeEventListener(orig, handler, true);
                        dataPriv.remove(doc, fix);
                      } else {
                        dataPriv.access(doc, fix, attaches);
                      }
                    },
                  };
                }
              );
            }
            var location = window.location;

            var nonce = { guid: Date.now() };

            var rquery = /\?/;

            // Cross-browser xml parsing
            jQuery.parseXML = function (data) {
              var xml;
              if (!data || typeof data !== "string") {
                return null;
              }

              // Support: IE 9 - 11 only
              // IE throws on parseFromString with invalid input.
              try {
                xml = new window.DOMParser().parseFromString(data, "text/xml");
              } catch (e) {
                xml = undefined;
              }

              if (!xml || xml.getElementsByTagName("parsererror").length) {
                jQuery.error("Invalid XML: " + data);
              }
              return xml;
            };

            var rbracket = /\[\]$/,
              rCRLF = /\r?\n/g,
              rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
              rsubmittable = /^(?:input|select|textarea|keygen)/i;

            function buildParams(prefix, obj, traditional, add) {
              var name;

              if (Array.isArray(obj)) {
                // Serialize array item.
                jQuery.each(obj, function (i, v) {
                  if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                  } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                      prefix +
                        "[" +
                        (typeof v === "object" && v != null ? i : "") +
                        "]",
                      v,
                      traditional,
                      add
                    );
                  }
                });
              } else if (!traditional && toType(obj) === "object") {
                // Serialize object item.
                for (name in obj) {
                  buildParams(
                    prefix + "[" + name + "]",
                    obj[name],
                    traditional,
                    add
                  );
                }
              } else {
                // Serialize scalar item.
                add(prefix, obj);
              }
            }

            // Serialize an array of form elements or a set of
            // key/values into a query string
            jQuery.param = function (a, traditional) {
              var prefix,
                s = [],
                add = function (key, valueOrFunction) {
                  // If value is a function, invoke it and use its return value
                  var value = isFunction(valueOrFunction)
                    ? valueOrFunction()
                    : valueOrFunction;

                  s[s.length] =
                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(value == null ? "" : value);
                };

              if (a == null) {
                return "";
              }

              // If an array was passed in, assume that it is an array of form elements.
              if (Array.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
                // Serialize the form elements
                jQuery.each(a, function () {
                  add(this.name, this.value);
                });
              } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for (prefix in a) {
                  buildParams(prefix, a[prefix], traditional, add);
                }
              }

              // Return the resulting serialization
              return s.join("&");
            };

            jQuery.fn.extend({
              serialize: function () {
                return jQuery.param(this.serializeArray());
              },
              serializeArray: function () {
                return this.map(function () {
                  // Can add propHook for "elements" to filter or add form elements
                  var elements = jQuery.prop(this, "elements");
                  return elements ? jQuery.makeArray(elements) : this;
                })
                  .filter(function () {
                    var type = this.type;

                    // Use .is( ":disabled" ) so that fieldset[disabled] works
                    return (
                      this.name &&
                      !jQuery(this).is(":disabled") &&
                      rsubmittable.test(this.nodeName) &&
                      !rsubmitterTypes.test(type) &&
                      (this.checked || !rcheckableType.test(type))
                    );
                  })
                  .map(function (_i, elem) {
                    var val = jQuery(this).val();

                    if (val == null) {
                      return null;
                    }

                    if (Array.isArray(val)) {
                      return jQuery.map(val, function (val) {
                        return {
                          name: elem.name,
                          value: val.replace(rCRLF, "\r\n"),
                        };
                      });
                    }

                    return {
                      name: elem.name,
                      value: val.replace(rCRLF, "\r\n"),
                    };
                  })
                  .get();
              },
            });

            var r20 = /%20/g,
              rhash = /#.*$/,
              rantiCache = /([?&])_=[^&]*/,
              rheaders = /^(.*?):[ \t]*([^\r\n]*)$/gm,
              // #7653, #8125, #8152: local protocol detection
              rlocalProtocol =
                /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
              rnoContent = /^(?:GET|HEAD)$/,
              rprotocol = /^\/\//,
              /* Prefilters
               * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
               * 2) These are called:
               *    - BEFORE asking for a transport
               *    - AFTER param serialization (s.data is a string if s.processData is true)
               * 3) key is the dataType
               * 4) the catchall symbol "*" can be used
               * 5) execution will start with transport dataType and THEN continue down to "*" if needed
               */
              prefilters = {},
              /* Transports bindings
               * 1) key is the dataType
               * 2) the catchall symbol "*" can be used
               * 3) selection will start with transport dataType and THEN go to "*" if needed
               */
              transports = {},
              // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
              allTypes = "*/".concat("*"),
              // Anchor tag for parsing the document origin
              originAnchor = document.createElement("a");
            originAnchor.href = location.href;

            // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
            function addToPrefiltersOrTransports(structure) {
              // dataTypeExpression is optional and defaults to "*"
              return function (dataTypeExpression, func) {
                if (typeof dataTypeExpression !== "string") {
                  func = dataTypeExpression;
                  dataTypeExpression = "*";
                }

                var dataType,
                  i = 0,
                  dataTypes =
                    dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

                if (isFunction(func)) {
                  // For each dataType in the dataTypeExpression
                  while ((dataType = dataTypes[i++])) {
                    // Prepend if requested
                    if (dataType[0] === "+") {
                      dataType = dataType.slice(1) || "*";
                      (structure[dataType] = structure[dataType] || []).unshift(
                        func
                      );

                      // Otherwise append
                    } else {
                      (structure[dataType] = structure[dataType] || []).push(
                        func
                      );
                    }
                  }
                }
              };
            }

            // Base inspection function for prefilters and transports
            function inspectPrefiltersOrTransports(
              structure,
              options,
              originalOptions,
              jqXHR
            ) {
              var inspected = {},
                seekingTransport = structure === transports;

              function inspect(dataType) {
                var selected;
                inspected[dataType] = true;
                jQuery.each(
                  structure[dataType] || [],
                  function (_, prefilterOrFactory) {
                    var dataTypeOrTransport = prefilterOrFactory(
                      options,
                      originalOptions,
                      jqXHR
                    );
                    if (
                      typeof dataTypeOrTransport === "string" &&
                      !seekingTransport &&
                      !inspected[dataTypeOrTransport]
                    ) {
                      options.dataTypes.unshift(dataTypeOrTransport);
                      inspect(dataTypeOrTransport);
                      return false;
                    } else if (seekingTransport) {
                      return !(selected = dataTypeOrTransport);
                    }
                  }
                );
                return selected;
              }

              return (
                inspect(options.dataTypes[0]) ||
                (!inspected["*"] && inspect("*"))
              );
            }

            // A special extend for ajax options
            // that takes "flat" options (not to be deep extended)
            // Fixes #9887
            function ajaxExtend(target, src) {
              var key,
                deep,
                flatOptions = jQuery.ajaxSettings.flatOptions || {};

              for (key in src) {
                if (src[key] !== undefined) {
                  (flatOptions[key] ? target : deep || (deep = {}))[key] =
                    src[key];
                }
              }
              if (deep) {
                jQuery.extend(true, target, deep);
              }

              return target;
            }

            /* Handles responses to an ajax request:
             * - finds the right dataType (mediates between content-type and expected dataType)
             * - returns the corresponding response
             */
            function ajaxHandleResponses(s, jqXHR, responses) {
              var ct,
                type,
                finalDataType,
                firstDataType,
                contents = s.contents,
                dataTypes = s.dataTypes;

              // Remove auto dataType and get content-type in the process
              while (dataTypes[0] === "*") {
                dataTypes.shift();
                if (ct === undefined) {
                  ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
                }
              }

              // Check if we're dealing with a known content-type
              if (ct) {
                for (type in contents) {
                  if (contents[type] && contents[type].test(ct)) {
                    dataTypes.unshift(type);
                    break;
                  }
                }
              }

              // Check to see if we have a response for the expected dataType
              if (dataTypes[0] in responses) {
                finalDataType = dataTypes[0];
              } else {
                // Try convertible dataTypes
                for (type in responses) {
                  if (
                    !dataTypes[0] ||
                    s.converters[type + " " + dataTypes[0]]
                  ) {
                    finalDataType = type;
                    break;
                  }
                  if (!firstDataType) {
                    firstDataType = type;
                  }
                }

                // Or just use first one
                finalDataType = finalDataType || firstDataType;
              }

              // If we found a dataType
              // We add the dataType to the list if needed
              // and return the corresponding response
              if (finalDataType) {
                if (finalDataType !== dataTypes[0]) {
                  dataTypes.unshift(finalDataType);
                }
                return responses[finalDataType];
              }
            }

            /* Chain conversions given the request and the original response
             * Also sets the responseXXX fields on the jqXHR instance
             */
            function ajaxConvert(s, response, jqXHR, isSuccess) {
              var conv2,
                current,
                conv,
                tmp,
                prev,
                converters = {},
                // Work with a copy of dataTypes in case we need to modify it for conversion
                dataTypes = s.dataTypes.slice();

              // Create converters map with lowercased keys
              if (dataTypes[1]) {
                for (conv in s.converters) {
                  converters[conv.toLowerCase()] = s.converters[conv];
                }
              }

              current = dataTypes.shift();

              // Convert to each sequential dataType
              while (current) {
                if (s.responseFields[current]) {
                  jqXHR[s.responseFields[current]] = response;
                }

                // Apply the dataFilter if provided
                if (!prev && isSuccess && s.dataFilter) {
                  response = s.dataFilter(response, s.dataType);
                }

                prev = current;
                current = dataTypes.shift();

                if (current) {
                  // There's only work to do if current dataType is non-auto
                  if (current === "*") {
                    current = prev;

                    // Convert response if prev dataType is non-auto and differs from current
                  } else if (prev !== "*" && prev !== current) {
                    // Seek a direct converter
                    conv =
                      converters[prev + " " + current] ||
                      converters["* " + current];

                    // If none found, seek a pair
                    if (!conv) {
                      for (conv2 in converters) {
                        // If conv2 outputs current
                        tmp = conv2.split(" ");
                        if (tmp[1] === current) {
                          // If prev can be converted to accepted input
                          conv =
                            converters[prev + " " + tmp[0]] ||
                            converters["* " + tmp[0]];
                          if (conv) {
                            // Condense equivalence converters
                            if (conv === true) {
                              conv = converters[conv2];

                              // Otherwise, insert the intermediate dataType
                            } else if (converters[conv2] !== true) {
                              current = tmp[0];
                              dataTypes.unshift(tmp[1]);
                            }
                            break;
                          }
                        }
                      }
                    }

                    // Apply converter (if not an equivalence)
                    if (conv !== true) {
                      // Unless errors are allowed to bubble, catch and return them
                      if (conv && s.throws) {
                        response = conv(response);
                      } else {
                        try {
                          response = conv(response);
                        } catch (e) {
                          return {
                            state: "parsererror",
                            error: conv
                              ? e
                              : "No conversion from " + prev + " to " + current,
                          };
                        }
                      }
                    }
                  }
                }
              }

              return { state: "success", data: response };
            }

            jQuery.extend({
              // Counter for holding the number of active queries
              active: 0,

              // Last-Modified header cache for next request
              lastModified: {},
              etag: {},

              ajaxSettings: {
                url: location.href,
                type: "GET",
                isLocal: rlocalProtocol.test(location.protocol),
                global: true,
                processData: true,
                async: true,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",

                /*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

                accepts: {
                  "*": allTypes,
                  text: "text/plain",
                  html: "text/html",
                  xml: "application/xml, text/xml",
                  json: "application/json, text/javascript",
                },

                contents: {
                  xml: /\bxml\b/,
                  html: /\bhtml/,
                  json: /\bjson\b/,
                },

                responseFields: {
                  xml: "responseXML",
                  text: "responseText",
                  json: "responseJSON",
                },

                // Data converters
                // Keys separate source (or catchall "*") and destination types with a single space
                converters: {
                  // Convert anything to text
                  "* text": String,

                  // Text to html (true = no transformation)
                  "text html": true,

                  // Evaluate text as a json expression
                  "text json": JSON.parse,

                  // Parse text as xml
                  "text xml": jQuery.parseXML,
                },

                // For options that shouldn't be deep extended:
                // you can add your own custom options here if
                // and when you create one that shouldn't be
                // deep extended (see ajaxExtend)
                flatOptions: {
                  url: true,
                  context: true,
                },
              },

              // Creates a full fledged settings object into target
              // with both ajaxSettings and settings fields.
              // If target is omitted, writes into ajaxSettings.
              ajaxSetup: function (target, settings) {
                return settings
                  ? // Building a settings object
                    ajaxExtend(
                      ajaxExtend(target, jQuery.ajaxSettings),
                      settings
                    )
                  : // Extending ajaxSettings
                    ajaxExtend(jQuery.ajaxSettings, target);
              },

              ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
              ajaxTransport: addToPrefiltersOrTransports(transports),

              // Main method
              ajax: function (url, options) {
                // If url is an object, simulate pre-1.5 signature
                if (typeof url === "object") {
                  options = url;
                  url = undefined;
                }

                // Force options to be an object
                options = options || {};

                var transport,
                  // URL without anti-cache param
                  cacheURL,
                  // Response headers
                  responseHeadersString,
                  responseHeaders,
                  // timeout handle
                  timeoutTimer,
                  // Url cleanup var
                  urlAnchor,
                  // Request state (becomes false upon send and true upon completion)
                  completed,
                  // To know if global events are to be dispatched
                  fireGlobals,
                  // Loop variable
                  i,
                  // uncached part of the url
                  uncached,
                  // Create the final options object
                  s = jQuery.ajaxSetup({}, options),
                  // Callbacks context
                  callbackContext = s.context || s,
                  // Context for global events is callbackContext if it is a DOM node or jQuery collection
                  globalEventContext =
                    s.context &&
                    (callbackContext.nodeType || callbackContext.jquery)
                      ? jQuery(callbackContext)
                      : jQuery.event,
                  // Deferreds
                  deferred = jQuery.Deferred(),
                  completeDeferred = jQuery.Callbacks("once memory"),
                  // Status-dependent callbacks
                  statusCode = s.statusCode || {},
                  // Headers (they are sent all at once)
                  requestHeaders = {},
                  requestHeadersNames = {},
                  // Default abort message
                  strAbort = "canceled",
                  // Fake xhr
                  jqXHR = {
                    readyState: 0,

                    // Builds headers hashtable if needed
                    getResponseHeader: function (key) {
                      var match;
                      if (completed) {
                        if (!responseHeaders) {
                          responseHeaders = {};
                          while (
                            (match = rheaders.exec(responseHeadersString))
                          ) {
                            responseHeaders[match[1].toLowerCase() + " "] = (
                              responseHeaders[match[1].toLowerCase() + " "] ||
                              []
                            ).concat(match[2]);
                          }
                        }
                        match = responseHeaders[key.toLowerCase() + " "];
                      }
                      return match == null ? null : match.join(", ");
                    },

                    // Raw string
                    getAllResponseHeaders: function () {
                      return completed ? responseHeadersString : null;
                    },

                    // Caches the header
                    setRequestHeader: function (name, value) {
                      if (completed == null) {
                        name = requestHeadersNames[name.toLowerCase()] =
                          requestHeadersNames[name.toLowerCase()] || name;
                        requestHeaders[name] = value;
                      }
                      return this;
                    },

                    // Overrides response content-type header
                    overrideMimeType: function (type) {
                      if (completed == null) {
                        s.mimeType = type;
                      }
                      return this;
                    },

                    // Status-dependent callbacks
                    statusCode: function (map) {
                      var code;
                      if (map) {
                        if (completed) {
                          // Execute the appropriate callbacks
                          jqXHR.always(map[jqXHR.status]);
                        } else {
                          // Lazy-add the new callbacks in a way that preserves old ones
                          for (code in map) {
                            statusCode[code] = [statusCode[code], map[code]];
                          }
                        }
                      }
                      return this;
                    },

                    // Cancel the request
                    abort: function (statusText) {
                      var finalText = statusText || strAbort;
                      if (transport) {
                        transport.abort(finalText);
                      }
                      done(0, finalText);
                      return this;
                    },
                  };

                // Attach deferreds
                deferred.promise(jqXHR);

                // Add protocol if not provided (prefilters might expect it)
                // Handle falsy url in the settings object (#10093: consistency with old signature)
                // We also use the url parameter if available
                s.url = ((url || s.url || location.href) + "").replace(
                  rprotocol,
                  location.protocol + "//"
                );

                // Alias method option to type as per ticket #12004
                s.type = options.method || options.type || s.method || s.type;

                // Extract dataTypes list
                s.dataTypes = (s.dataType || "*")
                  .toLowerCase()
                  .match(rnothtmlwhite) || [""];

                // A cross-domain request is in order when the origin doesn't match the current origin.
                if (s.crossDomain == null) {
                  urlAnchor = document.createElement("a");

                  // Support: IE <=8 - 11, Edge 12 - 15
                  // IE throws exception on accessing the href property if url is malformed,
                  // e.g. http://example.com:80x/
                  try {
                    urlAnchor.href = s.url;

                    // Support: IE <=8 - 11 only
                    // Anchor's host property isn't correctly set when s.url is relative
                    urlAnchor.href = urlAnchor.href;
                    s.crossDomain =
                      originAnchor.protocol + "//" + originAnchor.host !==
                      urlAnchor.protocol + "//" + urlAnchor.host;
                  } catch (e) {
                    // If there is an error parsing the URL, assume it is crossDomain,
                    // it can be rejected by the transport if it is invalid
                    s.crossDomain = true;
                  }
                }

                // Convert data if not already a string
                if (s.data && s.processData && typeof s.data !== "string") {
                  s.data = jQuery.param(s.data, s.traditional);
                }

                // Apply prefilters
                inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

                // If request was aborted inside a prefilter, stop there
                if (completed) {
                  return jqXHR;
                }

                // We can fire global events as of now if asked to
                // Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
                fireGlobals = jQuery.event && s.global;

                // Watch for a new set of requests
                if (fireGlobals && jQuery.active++ === 0) {
                  jQuery.event.trigger("ajaxStart");
                }

                // Uppercase the type
                s.type = s.type.toUpperCase();

                // Determine if request has content
                s.hasContent = !rnoContent.test(s.type);

                // Save the URL in case we're toying with the If-Modified-Since
                // and/or If-None-Match header later on
                // Remove hash to simplify url manipulation
                cacheURL = s.url.replace(rhash, "");

                // More options handling for requests with no content
                if (!s.hasContent) {
                  // Remember the hash so we can put it back
                  uncached = s.url.slice(cacheURL.length);

                  // If data is available and should be processed, append data to url
                  if (s.data && (s.processData || typeof s.data === "string")) {
                    cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

                    // #9682: remove data so that it's not used in an eventual retry
                    delete s.data;
                  }

                  // Add or update anti-cache param if needed
                  if (s.cache === false) {
                    cacheURL = cacheURL.replace(rantiCache, "$1");
                    uncached =
                      (rquery.test(cacheURL) ? "&" : "?") +
                      "_=" +
                      nonce.guid++ +
                      uncached;
                  }

                  // Put hash and anti-cache on the URL that will be requested (gh-1732)
                  s.url = cacheURL + uncached;

                  // Change '%20' to '+' if this is encoded form body content (gh-2658)
                } else if (
                  s.data &&
                  s.processData &&
                  (s.contentType || "").indexOf(
                    "application/x-www-form-urlencoded"
                  ) === 0
                ) {
                  s.data = s.data.replace(r20, "+");
                }

                // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                if (s.ifModified) {
                  if (jQuery.lastModified[cacheURL]) {
                    jqXHR.setRequestHeader(
                      "If-Modified-Since",
                      jQuery.lastModified[cacheURL]
                    );
                  }
                  if (jQuery.etag[cacheURL]) {
                    jqXHR.setRequestHeader(
                      "If-None-Match",
                      jQuery.etag[cacheURL]
                    );
                  }
                }

                // Set the correct header, if data is being sent
                if (
                  (s.data && s.hasContent && s.contentType !== false) ||
                  options.contentType
                ) {
                  jqXHR.setRequestHeader("Content-Type", s.contentType);
                }

                // Set the Accepts header for the server, depending on the dataType
                jqXHR.setRequestHeader(
                  "Accept",
                  s.dataTypes[0] && s.accepts[s.dataTypes[0]]
                    ? s.accepts[s.dataTypes[0]] +
                        (s.dataTypes[0] !== "*"
                          ? ", " + allTypes + "; q=0.01"
                          : "")
                    : s.accepts["*"]
                );

                // Check for headers option
                for (i in s.headers) {
                  jqXHR.setRequestHeader(i, s.headers[i]);
                }

                // Allow custom headers/mimetypes and early abort
                if (
                  s.beforeSend &&
                  (s.beforeSend.call(callbackContext, jqXHR, s) === false ||
                    completed)
                ) {
                  // Abort if not done already and return
                  return jqXHR.abort();
                }

                // Aborting is no longer a cancellation
                strAbort = "abort";

                // Install callbacks on deferreds
                completeDeferred.add(s.complete);
                jqXHR.done(s.success);
                jqXHR.fail(s.error);

                // Get transport
                transport = inspectPrefiltersOrTransports(
                  transports,
                  s,
                  options,
                  jqXHR
                );

                // If no transport, we auto-abort
                if (!transport) {
                  done(-1, "No Transport");
                } else {
                  jqXHR.readyState = 1;

                  // Send global event
                  if (fireGlobals) {
                    globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                  }

                  // If request was aborted inside ajaxSend, stop there
                  if (completed) {
                    return jqXHR;
                  }

                  // Timeout
                  if (s.async && s.timeout > 0) {
                    timeoutTimer = window.setTimeout(function () {
                      jqXHR.abort("timeout");
                    }, s.timeout);
                  }

                  try {
                    completed = false;
                    transport.send(requestHeaders, done);
                  } catch (e) {
                    // Rethrow post-completion exceptions
                    if (completed) {
                      throw e;
                    }

                    // Propagate others as results
                    done(-1, e);
                  }
                }

                // Callback for when everything is done
                function done(status, nativeStatusText, responses, headers) {
                  var isSuccess,
                    success,
                    error,
                    response,
                    modified,
                    statusText = nativeStatusText;

                  // Ignore repeat invocations
                  if (completed) {
                    return;
                  }

                  completed = true;

                  // Clear timeout if it exists
                  if (timeoutTimer) {
                    window.clearTimeout(timeoutTimer);
                  }

                  // Dereference transport for early garbage collection
                  // (no matter how long the jqXHR object will be used)
                  transport = undefined;

                  // Cache response headers
                  responseHeadersString = headers || "";

                  // Set readyState
                  jqXHR.readyState = status > 0 ? 4 : 0;

                  // Determine if successful
                  isSuccess = (status >= 200 && status < 300) || status === 304;

                  // Get response data
                  if (responses) {
                    response = ajaxHandleResponses(s, jqXHR, responses);
                  }

                  // Use a noop converter for missing script
                  if (
                    !isSuccess &&
                    jQuery.inArray("script", s.dataTypes) > -1
                  ) {
                    s.converters["text script"] = function () {};
                  }

                  // Convert no matter what (that way responseXXX fields are always set)
                  response = ajaxConvert(s, response, jqXHR, isSuccess);

                  // If successful, handle type chaining
                  if (isSuccess) {
                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if (s.ifModified) {
                      modified = jqXHR.getResponseHeader("Last-Modified");
                      if (modified) {
                        jQuery.lastModified[cacheURL] = modified;
                      }
                      modified = jqXHR.getResponseHeader("etag");
                      if (modified) {
                        jQuery.etag[cacheURL] = modified;
                      }
                    }

                    // if no content
                    if (status === 204 || s.type === "HEAD") {
                      statusText = "nocontent";

                      // if not modified
                    } else if (status === 304) {
                      statusText = "notmodified";

                      // If we have data, let's convert it
                    } else {
                      statusText = response.state;
                      success = response.data;
                      error = response.error;
                      isSuccess = !error;
                    }
                  } else {
                    // Extract error from statusText and normalize for non-aborts
                    error = statusText;
                    if (status || !statusText) {
                      statusText = "error";
                      if (status < 0) {
                        status = 0;
                      }
                    }
                  }

                  // Set data for the fake xhr object
                  jqXHR.status = status;
                  jqXHR.statusText = (nativeStatusText || statusText) + "";

                  // Success/Error
                  if (isSuccess) {
                    deferred.resolveWith(callbackContext, [
                      success,
                      statusText,
                      jqXHR,
                    ]);
                  } else {
                    deferred.rejectWith(callbackContext, [
                      jqXHR,
                      statusText,
                      error,
                    ]);
                  }

                  // Status-dependent callbacks
                  jqXHR.statusCode(statusCode);
                  statusCode = undefined;

                  if (fireGlobals) {
                    globalEventContext.trigger(
                      isSuccess ? "ajaxSuccess" : "ajaxError",
                      [jqXHR, s, isSuccess ? success : error]
                    );
                  }

                  // Complete
                  completeDeferred.fireWith(callbackContext, [
                    jqXHR,
                    statusText,
                  ]);

                  if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

                    // Handle the global AJAX counter
                    if (!--jQuery.active) {
                      jQuery.event.trigger("ajaxStop");
                    }
                  }
                }

                return jqXHR;
              },

              getJSON: function (url, data, callback) {
                return jQuery.get(url, data, callback, "json");
              },

              getScript: function (url, callback) {
                return jQuery.get(url, undefined, callback, "script");
              },
            });

            jQuery.each(["get", "post"], function (_i, method) {
              jQuery[method] = function (url, data, callback, type) {
                // Shift arguments if data argument was omitted
                if (isFunction(data)) {
                  type = type || callback;
                  callback = data;
                  data = undefined;
                }

                // The url can be an options object (which then must have .url)
                return jQuery.ajax(
                  jQuery.extend(
                    {
                      url: url,
                      type: method,
                      dataType: type,
                      data: data,
                      success: callback,
                    },
                    jQuery.isPlainObject(url) && url
                  )
                );
              };
            });

            jQuery.ajaxPrefilter(function (s) {
              var i;
              for (i in s.headers) {
                if (i.toLowerCase() === "content-type") {
                  s.contentType = s.headers[i] || "";
                }
              }
            });

            jQuery._evalUrl = function (url, options, doc) {
              return jQuery.ajax({
                url: url,

                // Make this explicit, since user can override this through ajaxSetup (#11264)
                type: "GET",
                dataType: "script",
                cache: true,
                async: false,
                global: false,

                // Only evaluate the response if it is successful (gh-4126)
                // dataFilter is not invoked for failure responses, so using it instead
                // of the default converter is kludgy but it works.
                converters: {
                  "text script": function () {},
                },
                dataFilter: function (response) {
                  jQuery.globalEval(response, options, doc);
                },
              });
            };

            jQuery.fn.extend({
              wrapAll: function (html) {
                var wrap;

                if (this[0]) {
                  if (isFunction(html)) {
                    html = html.call(this[0]);
                  }

                  // The elements to wrap the target around
                  wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

                  if (this[0].parentNode) {
                    wrap.insertBefore(this[0]);
                  }

                  wrap
                    .map(function () {
                      var elem = this;

                      while (elem.firstElementChild) {
                        elem = elem.firstElementChild;
                      }

                      return elem;
                    })
                    .append(this);
                }

                return this;
              },

              wrapInner: function (html) {
                if (isFunction(html)) {
                  return this.each(function (i) {
                    jQuery(this).wrapInner(html.call(this, i));
                  });
                }

                return this.each(function () {
                  var self = jQuery(this),
                    contents = self.contents();

                  if (contents.length) {
                    contents.wrapAll(html);
                  } else {
                    self.append(html);
                  }
                });
              },

              wrap: function (html) {
                var htmlIsFunction = isFunction(html);

                return this.each(function (i) {
                  jQuery(this).wrapAll(
                    htmlIsFunction ? html.call(this, i) : html
                  );
                });
              },

              unwrap: function (selector) {
                this.parent(selector)
                  .not("body")
                  .each(function () {
                    jQuery(this).replaceWith(this.childNodes);
                  });
                return this;
              },
            });

            jQuery.expr.pseudos.hidden = function (elem) {
              return !jQuery.expr.pseudos.visible(elem);
            };
            jQuery.expr.pseudos.visible = function (elem) {
              return !!(
                elem.offsetWidth ||
                elem.offsetHeight ||
                elem.getClientRects().length
              );
            };

            jQuery.ajaxSettings.xhr = function () {
              try {
                return new window.XMLHttpRequest();
              } catch (e) {}
            };

            var xhrSuccessStatus = {
                // File protocol always yields status code 0, assume 200
                0: 200,

                // Support: IE <=9 only
                // #1450: sometimes IE returns 1223 when it should be 204
                1223: 204,
              },
              xhrSupported = jQuery.ajaxSettings.xhr();

            support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
            support.ajax = xhrSupported = !!xhrSupported;

            jQuery.ajaxTransport(function (options) {
              var callback, errorCallback;

              // Cross domain only allowed if supported through XMLHttpRequest
              if (support.cors || (xhrSupported && !options.crossDomain)) {
                return {
                  send: function (headers, complete) {
                    var i,
                      xhr = options.xhr();

                    xhr.open(
                      options.type,
                      options.url,
                      options.async,
                      options.username,
                      options.password
                    );

                    // Apply custom fields if provided
                    if (options.xhrFields) {
                      for (i in options.xhrFields) {
                        xhr[i] = options.xhrFields[i];
                      }
                    }

                    // Override mime type if needed
                    if (options.mimeType && xhr.overrideMimeType) {
                      xhr.overrideMimeType(options.mimeType);
                    }

                    // X-Requested-With header
                    // For cross-domain requests, seeing as conditions for a preflight are
                    // akin to a jigsaw puzzle, we simply never set it to be sure.
                    // (it can always be set on a per-request basis or even using ajaxSetup)
                    // For same-domain requests, won't change header if already provided.
                    if (!options.crossDomain && !headers["X-Requested-With"]) {
                      headers["X-Requested-With"] = "XMLHttpRequest";
                    }

                    // Set headers
                    for (i in headers) {
                      xhr.setRequestHeader(i, headers[i]);
                    }

                    // Callback
                    callback = function (type) {
                      return function () {
                        if (callback) {
                          callback =
                            errorCallback =
                            xhr.onload =
                            xhr.onerror =
                            xhr.onabort =
                            xhr.ontimeout =
                            xhr.onreadystatechange =
                              null;

                          if (type === "abort") {
                            xhr.abort();
                          } else if (type === "error") {
                            // Support: IE <=9 only
                            // On a manual native abort, IE9 throws
                            // errors on any property access that is not readyState
                            if (typeof xhr.status !== "number") {
                              complete(0, "error");
                            } else {
                              complete(
                                // File: protocol always yields status 0; see #8605, #14207
                                xhr.status,
                                xhr.statusText
                              );
                            }
                          } else {
                            complete(
                              xhrSuccessStatus[xhr.status] || xhr.status,
                              xhr.statusText,

                              // Support: IE <=9 only
                              // IE9 has no XHR2 but throws on binary (trac-11426)
                              // For XHR2 non-text, let the caller handle it (gh-2498)
                              (xhr.responseType || "text") !== "text" ||
                                typeof xhr.responseText !== "string"
                                ? { binary: xhr.response }
                                : { text: xhr.responseText },
                              xhr.getAllResponseHeaders()
                            );
                          }
                        }
                      };
                    };

                    // Listen to events
                    xhr.onload = callback();
                    errorCallback =
                      xhr.onerror =
                      xhr.ontimeout =
                        callback("error");

                    // Support: IE 9 only
                    // Use onreadystatechange to replace onabort
                    // to handle uncaught aborts
                    if (xhr.onabort !== undefined) {
                      xhr.onabort = errorCallback;
                    } else {
                      xhr.onreadystatechange = function () {
                        // Check readyState before timeout as it changes
                        if (xhr.readyState === 4) {
                          // Allow onerror to be called first,
                          // but that will not handle a native abort
                          // Also, save errorCallback to a variable
                          // as xhr.onerror cannot be accessed
                          window.setTimeout(function () {
                            if (callback) {
                              errorCallback();
                            }
                          });
                        }
                      };
                    }

                    // Create the abort callback
                    callback = callback("abort");

                    try {
                      // Do send the request (this may raise an exception)
                      xhr.send((options.hasContent && options.data) || null);
                    } catch (e) {
                      // #14683: Only rethrow if this hasn't been notified as an error yet
                      if (callback) {
                        throw e;
                      }
                    }
                  },

                  abort: function () {
                    if (callback) {
                      callback();
                    }
                  },
                };
              }
            });

            // Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
            jQuery.ajaxPrefilter(function (s) {
              if (s.crossDomain) {
                s.contents.script = false;
              }
            });

            // Install script dataType
            jQuery.ajaxSetup({
              accepts: {
                script:
                  "text/javascript, application/javascript, " +
                  "application/ecmascript, application/x-ecmascript",
              },
              contents: {
                script: /\b(?:java|ecma)script\b/,
              },
              converters: {
                "text script": function (text) {
                  jQuery.globalEval(text);
                  return text;
                },
              },
            });

            // Handle cache's special case and crossDomain
            jQuery.ajaxPrefilter("script", function (s) {
              if (s.cache === undefined) {
                s.cache = false;
              }
              if (s.crossDomain) {
                s.type = "GET";
              }
            });

            // Bind script tag hack transport
            jQuery.ajaxTransport("script", function (s) {
              // This transport only deals with cross domain or forced-by-attrs requests
              if (s.crossDomain || s.scriptAttrs) {
                var script, callback;
                return {
                  send: function (_, complete) {
                    script = jQuery("<script>")
                      .attr(s.scriptAttrs || {})
                      .prop({ charset: s.scriptCharset, src: s.url })
                      .on(
                        "load error",
                        (callback = function (evt) {
                          script.remove();
                          callback = null;
                          if (evt) {
                            complete(
                              evt.type === "error" ? 404 : 200,
                              evt.type
                            );
                          }
                        })
                      );

                    // Use native DOM manipulation to avoid our domManip AJAX trickery
                    document.head.appendChild(script[0]);
                  },
                  abort: function () {
                    if (callback) {
                      callback();
                    }
                  },
                };
              }
            });

            var oldCallbacks = [],
              rjsonp = /(=)\?(?=&|$)|\?\?/;

            // Default jsonp settings
            jQuery.ajaxSetup({
              jsonp: "callback",
              jsonpCallback: function () {
                var callback =
                  oldCallbacks.pop() || jQuery.expando + "_" + nonce.guid++;
                this[callback] = true;
                return callback;
              },
            });

            // Detect, normalize options and install callbacks for jsonp requests
            jQuery.ajaxPrefilter(
              "json jsonp",
              function (s, originalSettings, jqXHR) {
                var callbackName,
                  overwritten,
                  responseContainer,
                  jsonProp =
                    s.jsonp !== false &&
                    (rjsonp.test(s.url)
                      ? "url"
                      : typeof s.data === "string" &&
                        (s.contentType || "").indexOf(
                          "application/x-www-form-urlencoded"
                        ) === 0 &&
                        rjsonp.test(s.data) &&
                        "data");

                // Handle iff the expected data type is "jsonp" or we have a parameter to set
                if (jsonProp || s.dataTypes[0] === "jsonp") {
                  // Get callback name, remembering preexisting value associated with it
                  callbackName = s.jsonpCallback = isFunction(s.jsonpCallback)
                    ? s.jsonpCallback()
                    : s.jsonpCallback;

                  // Insert callback into url or form data
                  if (jsonProp) {
                    s[jsonProp] = s[jsonProp].replace(
                      rjsonp,
                      "$1" + callbackName
                    );
                  } else if (s.jsonp !== false) {
                    s.url +=
                      (rquery.test(s.url) ? "&" : "?") +
                      s.jsonp +
                      "=" +
                      callbackName;
                  }

                  // Use data converter to retrieve json after script execution
                  s.converters["script json"] = function () {
                    if (!responseContainer) {
                      jQuery.error(callbackName + " was not called");
                    }
                    return responseContainer[0];
                  };

                  // Force json dataType
                  s.dataTypes[0] = "json";

                  // Install callback
                  overwritten = window[callbackName];
                  window[callbackName] = function () {
                    responseContainer = arguments;
                  };

                  // Clean-up function (fires after converters)
                  jqXHR.always(function () {
                    // If previous value didn't exist - remove it
                    if (overwritten === undefined) {
                      jQuery(window).removeProp(callbackName);

                      // Otherwise restore preexisting value
                    } else {
                      window[callbackName] = overwritten;
                    }

                    // Save back as free
                    if (s[callbackName]) {
                      // Make sure that re-using the options doesn't screw things around
                      s.jsonpCallback = originalSettings.jsonpCallback;

                      // Save the callback name for future use
                      oldCallbacks.push(callbackName);
                    }

                    // Call if it was a function and we have a response
                    if (responseContainer && isFunction(overwritten)) {
                      overwritten(responseContainer[0]);
                    }

                    responseContainer = overwritten = undefined;
                  });

                  // Delegate to script
                  return "script";
                }
              }
            );

            // Support: Safari 8 only
            // In Safari 8 documents created via document.implementation.createHTMLDocument
            // collapse sibling forms: the second one becomes a child of the first one.
            // Because of that, this security measure has to be disabled in Safari 8.
            // https://bugs.webkit.org/show_bug.cgi?id=137337
            support.createHTMLDocument = (function () {
              var body = document.implementation.createHTMLDocument("").body;
              body.innerHTML = "<form></form><form></form>";
              return body.childNodes.length === 2;
            })();

            // Argument "data" should be string of html
            // context (optional): If specified, the fragment will be created in this context,
            // defaults to document
            // keepScripts (optional): If true, will include scripts passed in the html string
            jQuery.parseHTML = function (data, context, keepScripts) {
              if (typeof data !== "string") {
                return [];
              }
              if (typeof context === "boolean") {
                keepScripts = context;
                context = false;
              }

              var base, parsed, scripts;

              if (!context) {
                // Stop scripts or inline event handlers from being executed immediately
                // by using document.implementation
                if (support.createHTMLDocument) {
                  context = document.implementation.createHTMLDocument("");

                  // Set the base href for the created document
                  // so any parsed elements with URLs
                  // are based on the document's URL (gh-2965)
                  base = context.createElement("base");
                  base.href = document.location.href;
                  context.head.appendChild(base);
                } else {
                  context = document;
                }
              }

              parsed = rsingleTag.exec(data);
              scripts = !keepScripts && [];

              // Single tag
              if (parsed) {
                return [context.createElement(parsed[1])];
              }

              parsed = buildFragment([data], context, scripts);

              if (scripts && scripts.length) {
                jQuery(scripts).remove();
              }

              return jQuery.merge([], parsed.childNodes);
            };

            /**
             * Load a url into a page
             */
            jQuery.fn.load = function (url, params, callback) {
              var selector,
                type,
                response,
                self = this,
                off = url.indexOf(" ");

              if (off > -1) {
                selector = stripAndCollapse(url.slice(off));
                url = url.slice(0, off);
              }

              // If it's a function
              if (isFunction(params)) {
                // We assume that it's the callback
                callback = params;
                params = undefined;

                // Otherwise, build a param string
              } else if (params && typeof params === "object") {
                type = "POST";
              }

              // If we have elements to modify, make the request
              if (self.length > 0) {
                jQuery
                  .ajax({
                    url: url,

                    // If "type" variable is undefined, then "GET" method will be used.
                    // Make value of this field explicit since
                    // user can override it through ajaxSetup method
                    type: type || "GET",
                    dataType: "html",
                    data: params,
                  })
                  .done(function (responseText) {
                    // Save response for use in complete callback
                    response = arguments;

                    self.html(
                      selector
                        ? // If a selector was specified, locate the right elements in a dummy div
                          // Exclude scripts to avoid IE 'Permission Denied' errors
                          jQuery("<div>")
                            .append(jQuery.parseHTML(responseText))
                            .find(selector)
                        : // Otherwise use the full result
                          responseText
                    );

                    // If the request succeeds, this function gets "data", "status", "jqXHR"
                    // but they are ignored because response was set above.
                    // If it fails, this function gets "jqXHR", "status", "error"
                  })
                  .always(
                    callback &&
                      function (jqXHR, status) {
                        self.each(function () {
                          callback.apply(
                            this,
                            response || [jqXHR.responseText, status, jqXHR]
                          );
                        });
                      }
                  );
              }

              return this;
            };

            jQuery.expr.pseudos.animated = function (elem) {
              return jQuery.grep(jQuery.timers, function (fn) {
                return elem === fn.elem;
              }).length;
            };

            jQuery.offset = {
              setOffset: function (elem, options, i) {
                var curPosition,
                  curLeft,
                  curCSSTop,
                  curTop,
                  curOffset,
                  curCSSLeft,
                  calculatePosition,
                  position = jQuery.css(elem, "position"),
                  curElem = jQuery(elem),
                  props = {};

                // Set position first, in-case top/left are set even on static elem
                if (position === "static") {
                  elem.style.position = "relative";
                }

                curOffset = curElem.offset();
                curCSSTop = jQuery.css(elem, "top");
                curCSSLeft = jQuery.css(elem, "left");
                calculatePosition =
                  (position === "absolute" || position === "fixed") &&
                  (curCSSTop + curCSSLeft).indexOf("auto") > -1;

                // Need to be able to calculate position if either
                // top or left is auto and position is either absolute or fixed
                if (calculatePosition) {
                  curPosition = curElem.position();
                  curTop = curPosition.top;
                  curLeft = curPosition.left;
                } else {
                  curTop = parseFloat(curCSSTop) || 0;
                  curLeft = parseFloat(curCSSLeft) || 0;
                }

                if (isFunction(options)) {
                  // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
                  options = options.call(elem, i, jQuery.extend({}, curOffset));
                }

                if (options.top != null) {
                  props.top = options.top - curOffset.top + curTop;
                }
                if (options.left != null) {
                  props.left = options.left - curOffset.left + curLeft;
                }

                if ("using" in options) {
                  options.using.call(elem, props);
                } else {
                  if (typeof props.top === "number") {
                    props.top += "px";
                  }
                  if (typeof props.left === "number") {
                    props.left += "px";
                  }
                  curElem.css(props);
                }
              },
            };

            jQuery.fn.extend({
              // offset() relates an element's border box to the document origin
              offset: function (options) {
                // Preserve chaining for setter
                if (arguments.length) {
                  return options === undefined
                    ? this
                    : this.each(function (i) {
                        jQuery.offset.setOffset(this, options, i);
                      });
                }

                var rect,
                  win,
                  elem = this[0];

                if (!elem) {
                  return;
                }

                // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
                // Support: IE <=11 only
                // Running getBoundingClientRect on a
                // disconnected node in IE throws an error
                if (!elem.getClientRects().length) {
                  return { top: 0, left: 0 };
                }

                // Get document-relative position by adding viewport scroll to viewport-relative gBCR
                rect = elem.getBoundingClientRect();
                win = elem.ownerDocument.defaultView;
                return {
                  top: rect.top + win.pageYOffset,
                  left: rect.left + win.pageXOffset,
                };
              },

              // position() relates an element's margin box to its offset parent's padding box
              // This corresponds to the behavior of CSS absolute positioning
              position: function () {
                if (!this[0]) {
                  return;
                }

                var offsetParent,
                  offset,
                  doc,
                  elem = this[0],
                  parentOffset = { top: 0, left: 0 };

                // position:fixed elements are offset from the viewport, which itself always has zero offset
                if (jQuery.css(elem, "position") === "fixed") {
                  // Assume position:fixed implies availability of getBoundingClientRect
                  offset = elem.getBoundingClientRect();
                } else {
                  offset = this.offset();

                  // Account for the *real* offset parent, which can be the document or its root element
                  // when a statically positioned element is identified
                  doc = elem.ownerDocument;
                  offsetParent = elem.offsetParent || doc.documentElement;
                  while (
                    offsetParent &&
                    (offsetParent === doc.body ||
                      offsetParent === doc.documentElement) &&
                    jQuery.css(offsetParent, "position") === "static"
                  ) {
                    offsetParent = offsetParent.parentNode;
                  }
                  if (
                    offsetParent &&
                    offsetParent !== elem &&
                    offsetParent.nodeType === 1
                  ) {
                    // Incorporate borders into its offset, since they are outside its content origin
                    parentOffset = jQuery(offsetParent).offset();
                    parentOffset.top += jQuery.css(
                      offsetParent,
                      "borderTopWidth",
                      true
                    );
                    parentOffset.left += jQuery.css(
                      offsetParent,
                      "borderLeftWidth",
                      true
                    );
                  }
                }

                // Subtract parent offsets and element margins
                return {
                  top:
                    offset.top -
                    parentOffset.top -
                    jQuery.css(elem, "marginTop", true),
                  left:
                    offset.left -
                    parentOffset.left -
                    jQuery.css(elem, "marginLeft", true),
                };
              },

              // This method will return documentElement in the following cases:
              // 1) For the element inside the iframe without offsetParent, this method will return
              //    documentElement of the parent window
              // 2) For the hidden or detached element
              // 3) For body or html element, i.e. in case of the html node - it will return itself
              //
              // but those exceptions were never presented as a real life use-cases
              // and might be considered as more preferable results.
              //
              // This logic, however, is not guaranteed and can change at any point in the future
              offsetParent: function () {
                return this.map(function () {
                  var offsetParent = this.offsetParent;

                  while (
                    offsetParent &&
                    jQuery.css(offsetParent, "position") === "static"
                  ) {
                    offsetParent = offsetParent.offsetParent;
                  }

                  return offsetParent || documentElement;
                });
              },
            });

            // Create scrollLeft and scrollTop methods
            jQuery.each(
              { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" },
              function (method, prop) {
                var top = "pageYOffset" === prop;

                jQuery.fn[method] = function (val) {
                  return access(
                    this,
                    function (elem, method, val) {
                      // Coalesce documents and windows
                      var win;
                      if (isWindow(elem)) {
                        win = elem;
                      } else if (elem.nodeType === 9) {
                        win = elem.defaultView;
                      }

                      if (val === undefined) {
                        return win ? win[prop] : elem[method];
                      }

                      if (win) {
                        win.scrollTo(
                          !top ? val : win.pageXOffset,
                          top ? val : win.pageYOffset
                        );
                      } else {
                        elem[method] = val;
                      }
                    },
                    method,
                    val,
                    arguments.length
                  );
                };
              }
            );

            // Support: Safari <=7 - 9.1, Chrome <=37 - 49
            // Add the top/left cssHooks using jQuery.fn.position
            // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
            // Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
            // getComputedStyle returns percent when specified for top/left/bottom/right;
            // rather than make the css module depend on the offset module, just check for it here
            jQuery.each(["top", "left"], function (_i, prop) {
              jQuery.cssHooks[prop] = addGetHookIf(
                support.pixelPosition,
                function (elem, computed) {
                  if (computed) {
                    computed = curCSS(elem, prop);

                    // If curCSS returns percentage, fallback to offset
                    return rnumnonpx.test(computed)
                      ? jQuery(elem).position()[prop] + "px"
                      : computed;
                  }
                }
              );
            });

            // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
            jQuery.each(
              { Height: "height", Width: "width" },
              function (name, type) {
                jQuery.each(
                  {
                    padding: "inner" + name,
                    content: type,
                    "": "outer" + name,
                  },
                  function (defaultExtra, funcName) {
                    // Margin is only for outerHeight, outerWidth
                    jQuery.fn[funcName] = function (margin, value) {
                      var chainable =
                          arguments.length &&
                          (defaultExtra || typeof margin !== "boolean"),
                        extra =
                          defaultExtra ||
                          (margin === true || value === true
                            ? "margin"
                            : "border");

                      return access(
                        this,
                        function (elem, type, value) {
                          var doc;

                          if (isWindow(elem)) {
                            // $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
                            return funcName.indexOf("outer") === 0
                              ? elem["inner" + name]
                              : elem.document.documentElement["client" + name];
                          }

                          // Get document width or height
                          if (elem.nodeType === 9) {
                            doc = elem.documentElement;

                            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                            // whichever is greatest
                            return Math.max(
                              elem.body["scroll" + name],
                              doc["scroll" + name],
                              elem.body["offset" + name],
                              doc["offset" + name],
                              doc["client" + name]
                            );
                          }

                          return value === undefined
                            ? // Get width or height on the element, requesting but not forcing parseFloat
                              jQuery.css(elem, type, extra)
                            : // Set width or height on the element
                              jQuery.style(elem, type, value, extra);
                        },
                        type,
                        chainable ? margin : undefined,
                        chainable
                      );
                    };
                  }
                );
              }
            );

            jQuery.each(
              [
                "ajaxStart",
                "ajaxStop",
                "ajaxComplete",
                "ajaxError",
                "ajaxSuccess",
                "ajaxSend",
              ],
              function (_i, type) {
                jQuery.fn[type] = function (fn) {
                  return this.on(type, fn);
                };
              }
            );

            jQuery.fn.extend({
              bind: function (types, data, fn) {
                return this.on(types, null, data, fn);
              },
              unbind: function (types, fn) {
                return this.off(types, null, fn);
              },

              delegate: function (selector, types, data, fn) {
                return this.on(types, selector, data, fn);
              },
              undelegate: function (selector, types, fn) {
                // ( namespace ) or ( selector, types [, fn] )
                return arguments.length === 1
                  ? this.off(selector, "**")
                  : this.off(types, selector || "**", fn);
              },

              hover: function (fnOver, fnOut) {
                return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
              },
            });

            jQuery.each(
              (
                "blur focus focusin focusout resize scroll click dblclick " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                "change select submit keydown keypress keyup contextmenu"
              ).split(" "),
              function (_i, name) {
                // Handle event binding
                jQuery.fn[name] = function (data, fn) {
                  return arguments.length > 0
                    ? this.on(name, null, data, fn)
                    : this.trigger(name);
                };
              }
            );

            // Support: Android <=4.0 only
            // Make sure we trim BOM and NBSP
            var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

            // Bind a function to a context, optionally partially applying any
            // arguments.
            // jQuery.proxy is deprecated to promote standards (specifically Function#bind)
            // However, it is not slated for removal any time soon
            jQuery.proxy = function (fn, context) {
              var tmp, args, proxy;

              if (typeof context === "string") {
                tmp = fn[context];
                context = fn;
                fn = tmp;
              }

              // Quick check to determine if target is callable, in the spec
              // this throws a TypeError, but we will just return undefined.
              if (!isFunction(fn)) {
                return undefined;
              }

              // Simulated bind
              args = slice.call(arguments, 2);
              proxy = function () {
                return fn.apply(
                  context || this,
                  args.concat(slice.call(arguments))
                );
              };

              // Set the guid of unique handler to the same of original handler, so it can be removed
              proxy.guid = fn.guid = fn.guid || jQuery.guid++;

              return proxy;
            };

            jQuery.holdReady = function (hold) {
              if (hold) {
                jQuery.readyWait++;
              } else {
                jQuery.ready(true);
              }
            };
            jQuery.isArray = Array.isArray;
            jQuery.parseJSON = JSON.parse;
            jQuery.nodeName = nodeName;
            jQuery.isFunction = isFunction;
            jQuery.isWindow = isWindow;
            jQuery.camelCase = camelCase;
            jQuery.type = toType;

            jQuery.now = Date.now;

            jQuery.isNumeric = function (obj) {
              // As of jQuery 3.0, isNumeric is limited to
              // strings and numbers (primitives or objects)
              // that can be coerced to finite numbers (gh-2662)
              var type = jQuery.type(obj);
              return (
                (type === "number" || type === "string") &&
                // parseFloat NaNs numeric-cast false positives ("")
                // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
                // subtraction forces infinities to NaN
                !isNaN(obj - parseFloat(obj))
              );
            };

            jQuery.trim = function (text) {
              return text == null ? "" : (text + "").replace(rtrim, "");
            };

            // Register as a named AMD module, since jQuery can be concatenated with other
            // files that may use define, but not via a proper concatenation script that
            // understands anonymous AMD modules. A named AMD is safest and most robust
            // way to register. Lowercase jquery is used because AMD module names are
            // derived from file names, and jQuery is normally delivered in a lowercase
            // file name. Do this after creating the global so that if an AMD module wants
            // to call noConflict to hide this version of jQuery, it will work.

            // Note that for maximum portability, libraries that are not jQuery should
            // declare themselves as anonymous modules, and avoid setting a global if an
            // AMD loader is present. jQuery is a special case. For more information, see
            // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

            if (true) {
              !((__WEBPACK_AMD_DEFINE_ARRAY__ = []),
              (__WEBPACK_AMD_DEFINE_RESULT__ = function () {
                return jQuery;
              }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)),
              __WEBPACK_AMD_DEFINE_RESULT__ !== undefined &&
                (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            }

            var // Map over jQuery in case of overwrite
              _jQuery = window.jQuery,
              // Map over the $ in case of overwrite
              _$ = window.$;

            jQuery.noConflict = function (deep) {
              if (window.$ === jQuery) {
                window.$ = _$;
              }

              if (deep && window.jQuery === jQuery) {
                window.jQuery = _jQuery;
              }

              return jQuery;
            };

            // Expose jQuery and $ identifiers, even in AMD
            // (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
            // and CommonJS for browser emulators (#13566)
            if (typeof noGlobal === "undefined") {
              window.jQuery = window.$ = jQuery;
            }

            return jQuery;
          }
        );

        /***/
      },

    /***/ "./resources/css/app.css":
      /*!*******************************!*\
  !*** ./resources/css/app.css ***!
  \*******************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        // extracted by mini-css-extract-plugin

        /***/
      },

    /***/ "./node_modules/popper.js/dist/esm/popper.js":
      /*!***************************************************!*\
  !*** ./node_modules/popper.js/dist/esm/popper.js ***!
  \***************************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
          /* harmony export */
        });
        /**!
         * @fileOverview Kickass library to create and place poppers near their reference elements.
         * @version 1.16.1
         * @license
         * Copyright (c) 2016 Federico Zivolo and contributors
         *
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to deal
         * in the Software without restriction, including without limitation the rights
         * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         * copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in all
         * copies or substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
         * SOFTWARE.
         */
        var isBrowser =
          typeof window !== "undefined" &&
          typeof document !== "undefined" &&
          typeof navigator !== "undefined";

        var timeoutDuration = (function () {
          var longerTimeoutBrowsers = ["Edge", "Trident", "Firefox"];
          for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
            if (
              isBrowser &&
              navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0
            ) {
              return 1;
            }
          }
          return 0;
        })();

        function microtaskDebounce(fn) {
          var called = false;
          return function () {
            if (called) {
              return;
            }
            called = true;
            window.Promise.resolve().then(function () {
              called = false;
              fn();
            });
          };
        }

        function taskDebounce(fn) {
          var scheduled = false;
          return function () {
            if (!scheduled) {
              scheduled = true;
              setTimeout(function () {
                scheduled = false;
                fn();
              }, timeoutDuration);
            }
          };
        }

        var supportsMicroTasks = isBrowser && window.Promise;

        /**
         * Create a debounced version of a method, that's asynchronously deferred
         * but called in the minimum time possible.
         *
         * @method
         * @memberof Popper.Utils
         * @argument {Function} fn
         * @returns {Function}
         */
        var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

        /**
         * Check if the given variable is a function
         * @method
         * @memberof Popper.Utils
         * @argument {Any} functionToCheck - variable to check
         * @returns {Boolean} answer to: is a function?
         */
        function isFunction(functionToCheck) {
          var getType = {};
          return (
            functionToCheck &&
            getType.toString.call(functionToCheck) === "[object Function]"
          );
        }

        /**
         * Get CSS computed property of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Eement} element
         * @argument {String} property
         */
        function getStyleComputedProperty(element, property) {
          if (element.nodeType !== 1) {
            return [];
          }
          // NOTE: 1 DOM access here
          var window = element.ownerDocument.defaultView;
          var css = window.getComputedStyle(element, null);
          return property ? css[property] : css;
        }

        /**
         * Returns the parentNode or the host of the element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} parent
         */
        function getParentNode(element) {
          if (element.nodeName === "HTML") {
            return element;
          }
          return element.parentNode || element.host;
        }

        /**
         * Returns the scrolling parent of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} scroll parent
         */
        function getScrollParent(element) {
          // Return body, `getScroll` will take care to get the correct `scrollTop` from it
          if (!element) {
            return document.body;
          }

          switch (element.nodeName) {
            case "HTML":
            case "BODY":
              return element.ownerDocument.body;
            case "#document":
              return element.body;
          }

          // Firefox want us to check `-x` and `-y` variations as well

          var _getStyleComputedProp = getStyleComputedProperty(element),
            overflow = _getStyleComputedProp.overflow,
            overflowX = _getStyleComputedProp.overflowX,
            overflowY = _getStyleComputedProp.overflowY;

          if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
            return element;
          }

          return getScrollParent(getParentNode(element));
        }

        /**
         * Returns the reference node of the reference object, or the reference object itself.
         * @method
         * @memberof Popper.Utils
         * @param {Element|Object} reference - the reference element (the popper will be relative to this)
         * @returns {Element} parent
         */
        function getReferenceNode(reference) {
          return reference && reference.referenceNode
            ? reference.referenceNode
            : reference;
        }

        var isIE11 =
          isBrowser && !!(window.MSInputMethodContext && document.documentMode);
        var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

        /**
         * Determines if the browser is Internet Explorer
         * @method
         * @memberof Popper.Utils
         * @param {Number} version to check
         * @returns {Boolean} isIE
         */
        function isIE(version) {
          if (version === 11) {
            return isIE11;
          }
          if (version === 10) {
            return isIE10;
          }
          return isIE11 || isIE10;
        }

        /**
         * Returns the offset parent of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} offset parent
         */
        function getOffsetParent(element) {
          if (!element) {
            return document.documentElement;
          }

          var noOffsetParent = isIE(10) ? document.body : null;

          // NOTE: 1 DOM access here
          var offsetParent = element.offsetParent || null;
          // Skip hidden elements which don't have an offsetParent
          while (
            offsetParent === noOffsetParent &&
            element.nextElementSibling
          ) {
            offsetParent = (element = element.nextElementSibling).offsetParent;
          }

          var nodeName = offsetParent && offsetParent.nodeName;

          if (!nodeName || nodeName === "BODY" || nodeName === "HTML") {
            return element
              ? element.ownerDocument.documentElement
              : document.documentElement;
          }

          // .offsetParent will return the closest TH, TD or TABLE in case
          // no offsetParent is present, I hate this job...
          if (
            ["TH", "TD", "TABLE"].indexOf(offsetParent.nodeName) !== -1 &&
            getStyleComputedProperty(offsetParent, "position") === "static"
          ) {
            return getOffsetParent(offsetParent);
          }

          return offsetParent;
        }

        function isOffsetContainer(element) {
          var nodeName = element.nodeName;

          if (nodeName === "BODY") {
            return false;
          }
          return (
            nodeName === "HTML" ||
            getOffsetParent(element.firstElementChild) === element
          );
        }

        /**
         * Finds the root node (document, shadowDOM root) of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} node
         * @returns {Element} root node
         */
        function getRoot(node) {
          if (node.parentNode !== null) {
            return getRoot(node.parentNode);
          }

          return node;
        }

        /**
         * Finds the offset parent common to the two provided nodes
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element1
         * @argument {Element} element2
         * @returns {Element} common offset parent
         */
        function findCommonOffsetParent(element1, element2) {
          // This check is needed to avoid errors in case one of the elements isn't defined for any reason
          if (
            !element1 ||
            !element1.nodeType ||
            !element2 ||
            !element2.nodeType
          ) {
            return document.documentElement;
          }

          // Here we make sure to give as "start" the element that comes first in the DOM
          var order =
            element1.compareDocumentPosition(element2) &
            Node.DOCUMENT_POSITION_FOLLOWING;
          var start = order ? element1 : element2;
          var end = order ? element2 : element1;

          // Get common ancestor container
          var range = document.createRange();
          range.setStart(start, 0);
          range.setEnd(end, 0);
          var commonAncestorContainer = range.commonAncestorContainer;

          // Both nodes are inside #document

          if (
            (element1 !== commonAncestorContainer &&
              element2 !== commonAncestorContainer) ||
            start.contains(end)
          ) {
            if (isOffsetContainer(commonAncestorContainer)) {
              return commonAncestorContainer;
            }

            return getOffsetParent(commonAncestorContainer);
          }

          // one of the nodes is inside shadowDOM, find which one
          var element1root = getRoot(element1);
          if (element1root.host) {
            return findCommonOffsetParent(element1root.host, element2);
          } else {
            return findCommonOffsetParent(element1, getRoot(element2).host);
          }
        }

        /**
         * Gets the scroll value of the given element in the given side (top and left)
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @argument {String} side `top` or `left`
         * @returns {number} amount of scrolled pixels
         */
        function getScroll(element) {
          var side =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : "top";

          var upperSide = side === "top" ? "scrollTop" : "scrollLeft";
          var nodeName = element.nodeName;

          if (nodeName === "BODY" || nodeName === "HTML") {
            var html = element.ownerDocument.documentElement;
            var scrollingElement =
              element.ownerDocument.scrollingElement || html;
            return scrollingElement[upperSide];
          }

          return element[upperSide];
        }

        /*
         * Sum or subtract the element scroll values (left and top) from a given rect object
         * @method
         * @memberof Popper.Utils
         * @param {Object} rect - Rect object you want to change
         * @param {HTMLElement} element - The element from the function reads the scroll values
         * @param {Boolean} subtract - set to true if you want to subtract the scroll values
         * @return {Object} rect - The modifier rect object
         */
        function includeScroll(rect, element) {
          var subtract =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : false;

          var scrollTop = getScroll(element, "top");
          var scrollLeft = getScroll(element, "left");
          var modifier = subtract ? -1 : 1;
          rect.top += scrollTop * modifier;
          rect.bottom += scrollTop * modifier;
          rect.left += scrollLeft * modifier;
          rect.right += scrollLeft * modifier;
          return rect;
        }

        /*
         * Helper to detect borders of a given element
         * @method
         * @memberof Popper.Utils
         * @param {CSSStyleDeclaration} styles
         * Result of `getStyleComputedProperty` on the given element
         * @param {String} axis - `x` or `y`
         * @return {number} borders - The borders size of the given axis
         */

        function getBordersSize(styles, axis) {
          var sideA = axis === "x" ? "Left" : "Top";
          var sideB = sideA === "Left" ? "Right" : "Bottom";

          return (
            parseFloat(styles["border" + sideA + "Width"]) +
            parseFloat(styles["border" + sideB + "Width"])
          );
        }

        function getSize(axis, body, html, computedStyle) {
          return Math.max(
            body["offset" + axis],
            body["scroll" + axis],
            html["client" + axis],
            html["offset" + axis],
            html["scroll" + axis],
            isIE(10)
              ? parseInt(html["offset" + axis]) +
                  parseInt(
                    computedStyle[
                      "margin" + (axis === "Height" ? "Top" : "Left")
                    ]
                  ) +
                  parseInt(
                    computedStyle[
                      "margin" + (axis === "Height" ? "Bottom" : "Right")
                    ]
                  )
              : 0
          );
        }

        function getWindowSizes(document) {
          var body = document.body;
          var html = document.documentElement;
          var computedStyle = isIE(10) && getComputedStyle(html);

          return {
            height: getSize("Height", body, html, computedStyle),
            width: getSize("Width", body, html, computedStyle),
          };
        }

        var classCallCheck = function (instance, Constructor) {
          if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
          }
        };

        var createClass = (function () {
          function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
              var descriptor = props[i];
              descriptor.enumerable = descriptor.enumerable || false;
              descriptor.configurable = true;
              if ("value" in descriptor) descriptor.writable = true;
              Object.defineProperty(target, descriptor.key, descriptor);
            }
          }

          return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
          };
        })();

        var defineProperty = function (obj, key, value) {
          if (key in obj) {
            Object.defineProperty(obj, key, {
              value: value,
              enumerable: true,
              configurable: true,
              writable: true,
            });
          } else {
            obj[key] = value;
          }

          return obj;
        };

        var _extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];

              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }

            return target;
          };

        /**
         * Given element offsets, generate an output similar to getBoundingClientRect
         * @method
         * @memberof Popper.Utils
         * @argument {Object} offsets
         * @returns {Object} ClientRect like output
         */
        function getClientRect(offsets) {
          return _extends({}, offsets, {
            right: offsets.left + offsets.width,
            bottom: offsets.top + offsets.height,
          });
        }

        /**
         * Get bounding client rect of given element
         * @method
         * @memberof Popper.Utils
         * @param {HTMLElement} element
         * @return {Object} client rect
         */
        function getBoundingClientRect(element) {
          var rect = {};

          // IE10 10 FIX: Please, don't ask, the element isn't
          // considered in DOM in some circumstances...
          // This isn't reproducible in IE10 compatibility mode of IE11
          try {
            if (isIE(10)) {
              rect = element.getBoundingClientRect();
              var scrollTop = getScroll(element, "top");
              var scrollLeft = getScroll(element, "left");
              rect.top += scrollTop;
              rect.left += scrollLeft;
              rect.bottom += scrollTop;
              rect.right += scrollLeft;
            } else {
              rect = element.getBoundingClientRect();
            }
          } catch (e) {}

          var result = {
            left: rect.left,
            top: rect.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
          };

          // subtract scrollbar size from sizes
          var sizes =
            element.nodeName === "HTML"
              ? getWindowSizes(element.ownerDocument)
              : {};
          var width = sizes.width || element.clientWidth || result.width;
          var height = sizes.height || element.clientHeight || result.height;

          var horizScrollbar = element.offsetWidth - width;
          var vertScrollbar = element.offsetHeight - height;

          // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
          // we make this check conditional for performance reasons
          if (horizScrollbar || vertScrollbar) {
            var styles = getStyleComputedProperty(element);
            horizScrollbar -= getBordersSize(styles, "x");
            vertScrollbar -= getBordersSize(styles, "y");

            result.width -= horizScrollbar;
            result.height -= vertScrollbar;
          }

          return getClientRect(result);
        }

        function getOffsetRectRelativeToArbitraryNode(children, parent) {
          var fixedPosition =
            arguments.length > 2 && arguments[2] !== undefined
              ? arguments[2]
              : false;

          var isIE10 = isIE(10);
          var isHTML = parent.nodeName === "HTML";
          var childrenRect = getBoundingClientRect(children);
          var parentRect = getBoundingClientRect(parent);
          var scrollParent = getScrollParent(children);

          var styles = getStyleComputedProperty(parent);
          var borderTopWidth = parseFloat(styles.borderTopWidth);
          var borderLeftWidth = parseFloat(styles.borderLeftWidth);

          // In cases where the parent is fixed, we must ignore negative scroll in offset calc
          if (fixedPosition && isHTML) {
            parentRect.top = Math.max(parentRect.top, 0);
            parentRect.left = Math.max(parentRect.left, 0);
          }
          var offsets = getClientRect({
            top: childrenRect.top - parentRect.top - borderTopWidth,
            left: childrenRect.left - parentRect.left - borderLeftWidth,
            width: childrenRect.width,
            height: childrenRect.height,
          });
          offsets.marginTop = 0;
          offsets.marginLeft = 0;

          // Subtract margins of documentElement in case it's being used as parent
          // we do this only on HTML because it's the only element that behaves
          // differently when margins are applied to it. The margins are included in
          // the box of the documentElement, in the other cases not.
          if (!isIE10 && isHTML) {
            var marginTop = parseFloat(styles.marginTop);
            var marginLeft = parseFloat(styles.marginLeft);

            offsets.top -= borderTopWidth - marginTop;
            offsets.bottom -= borderTopWidth - marginTop;
            offsets.left -= borderLeftWidth - marginLeft;
            offsets.right -= borderLeftWidth - marginLeft;

            // Attach marginTop and marginLeft because in some circumstances we may need them
            offsets.marginTop = marginTop;
            offsets.marginLeft = marginLeft;
          }

          if (
            isIE10 && !fixedPosition
              ? parent.contains(scrollParent)
              : parent === scrollParent && scrollParent.nodeName !== "BODY"
          ) {
            offsets = includeScroll(offsets, parent);
          }

          return offsets;
        }

        function getViewportOffsetRectRelativeToArtbitraryNode(element) {
          var excludeScroll =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : false;

          var html = element.ownerDocument.documentElement;
          var relativeOffset = getOffsetRectRelativeToArbitraryNode(
            element,
            html
          );
          var width = Math.max(html.clientWidth, window.innerWidth || 0);
          var height = Math.max(html.clientHeight, window.innerHeight || 0);

          var scrollTop = !excludeScroll ? getScroll(html) : 0;
          var scrollLeft = !excludeScroll ? getScroll(html, "left") : 0;

          var offset = {
            top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
            left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
            width: width,
            height: height,
          };

          return getClientRect(offset);
        }

        /**
         * Check if the given element is fixed or is inside a fixed parent
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @argument {Element} customContainer
         * @returns {Boolean} answer to "isFixed?"
         */
        function isFixed(element) {
          var nodeName = element.nodeName;
          if (nodeName === "BODY" || nodeName === "HTML") {
            return false;
          }
          if (getStyleComputedProperty(element, "position") === "fixed") {
            return true;
          }
          var parentNode = getParentNode(element);
          if (!parentNode) {
            return false;
          }
          return isFixed(parentNode);
        }

        /**
         * Finds the first parent of an element that has a transformed property defined
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} first transformed parent or documentElement
         */

        function getFixedPositionOffsetParent(element) {
          // This check is needed to avoid errors in case one of the elements isn't defined for any reason
          if (!element || !element.parentElement || isIE()) {
            return document.documentElement;
          }
          var el = element.parentElement;
          while (el && getStyleComputedProperty(el, "transform") === "none") {
            el = el.parentElement;
          }
          return el || document.documentElement;
        }

        /**
         * Computed the boundaries limits and return them
         * @method
         * @memberof Popper.Utils
         * @param {HTMLElement} popper
         * @param {HTMLElement} reference
         * @param {number} padding
         * @param {HTMLElement} boundariesElement - Element used to define the boundaries
         * @param {Boolean} fixedPosition - Is in fixed position mode
         * @returns {Object} Coordinates of the boundaries
         */
        function getBoundaries(popper, reference, padding, boundariesElement) {
          var fixedPosition =
            arguments.length > 4 && arguments[4] !== undefined
              ? arguments[4]
              : false;

          // NOTE: 1 DOM access here

          var boundaries = { top: 0, left: 0 };
          var offsetParent = fixedPosition
            ? getFixedPositionOffsetParent(popper)
            : findCommonOffsetParent(popper, getReferenceNode(reference));

          // Handle viewport case
          if (boundariesElement === "viewport") {
            boundaries = getViewportOffsetRectRelativeToArtbitraryNode(
              offsetParent,
              fixedPosition
            );
          } else {
            // Handle other cases based on DOM element used as boundaries
            var boundariesNode = void 0;
            if (boundariesElement === "scrollParent") {
              boundariesNode = getScrollParent(getParentNode(reference));
              if (boundariesNode.nodeName === "BODY") {
                boundariesNode = popper.ownerDocument.documentElement;
              }
            } else if (boundariesElement === "window") {
              boundariesNode = popper.ownerDocument.documentElement;
            } else {
              boundariesNode = boundariesElement;
            }

            var offsets = getOffsetRectRelativeToArbitraryNode(
              boundariesNode,
              offsetParent,
              fixedPosition
            );

            // In case of HTML, we need a different computation
            if (boundariesNode.nodeName === "HTML" && !isFixed(offsetParent)) {
              var _getWindowSizes = getWindowSizes(popper.ownerDocument),
                height = _getWindowSizes.height,
                width = _getWindowSizes.width;

              boundaries.top += offsets.top - offsets.marginTop;
              boundaries.bottom = height + offsets.top;
              boundaries.left += offsets.left - offsets.marginLeft;
              boundaries.right = width + offsets.left;
            } else {
              // for all the other DOM elements, this one is good
              boundaries = offsets;
            }
          }

          // Add paddings
          padding = padding || 0;
          var isPaddingNumber = typeof padding === "number";
          boundaries.left += isPaddingNumber ? padding : padding.left || 0;
          boundaries.top += isPaddingNumber ? padding : padding.top || 0;
          boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
          boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

          return boundaries;
        }

        function getArea(_ref) {
          var width = _ref.width,
            height = _ref.height;

          return width * height;
        }

        /**
         * Utility used to transform the `auto` placement to the placement with more
         * available space.
         * @method
         * @memberof Popper.Utils
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function computeAutoPlacement(
          placement,
          refRect,
          popper,
          reference,
          boundariesElement
        ) {
          var padding =
            arguments.length > 5 && arguments[5] !== undefined
              ? arguments[5]
              : 0;

          if (placement.indexOf("auto") === -1) {
            return placement;
          }

          var boundaries = getBoundaries(
            popper,
            reference,
            padding,
            boundariesElement
          );

          var rects = {
            top: {
              width: boundaries.width,
              height: refRect.top - boundaries.top,
            },
            right: {
              width: boundaries.right - refRect.right,
              height: boundaries.height,
            },
            bottom: {
              width: boundaries.width,
              height: boundaries.bottom - refRect.bottom,
            },
            left: {
              width: refRect.left - boundaries.left,
              height: boundaries.height,
            },
          };

          var sortedAreas = Object.keys(rects)
            .map(function (key) {
              return _extends(
                {
                  key: key,
                },
                rects[key],
                {
                  area: getArea(rects[key]),
                }
              );
            })
            .sort(function (a, b) {
              return b.area - a.area;
            });

          var filteredAreas = sortedAreas.filter(function (_ref2) {
            var width = _ref2.width,
              height = _ref2.height;
            return width >= popper.clientWidth && height >= popper.clientHeight;
          });

          var computedPlacement =
            filteredAreas.length > 0
              ? filteredAreas[0].key
              : sortedAreas[0].key;

          var variation = placement.split("-")[1];

          return computedPlacement + (variation ? "-" + variation : "");
        }

        /**
         * Get offsets to the reference element
         * @method
         * @memberof Popper.Utils
         * @param {Object} state
         * @param {Element} popper - the popper element
         * @param {Element} reference - the reference element (the popper will be relative to this)
         * @param {Element} fixedPosition - is in fixed position mode
         * @returns {Object} An object containing the offsets which will be applied to the popper
         */
        function getReferenceOffsets(state, popper, reference) {
          var fixedPosition =
            arguments.length > 3 && arguments[3] !== undefined
              ? arguments[3]
              : null;

          var commonOffsetParent = fixedPosition
            ? getFixedPositionOffsetParent(popper)
            : findCommonOffsetParent(popper, getReferenceNode(reference));
          return getOffsetRectRelativeToArbitraryNode(
            reference,
            commonOffsetParent,
            fixedPosition
          );
        }

        /**
         * Get the outer sizes of the given element (offset size + margins)
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Object} object containing width and height properties
         */
        function getOuterSizes(element) {
          var window = element.ownerDocument.defaultView;
          var styles = window.getComputedStyle(element);
          var x =
            parseFloat(styles.marginTop || 0) +
            parseFloat(styles.marginBottom || 0);
          var y =
            parseFloat(styles.marginLeft || 0) +
            parseFloat(styles.marginRight || 0);
          var result = {
            width: element.offsetWidth + y,
            height: element.offsetHeight + x,
          };
          return result;
        }

        /**
         * Get the opposite placement of the given one
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement
         * @returns {String} flipped placement
         */
        function getOppositePlacement(placement) {
          var hash = {
            left: "right",
            right: "left",
            bottom: "top",
            top: "bottom",
          };
          return placement.replace(
            /left|right|bottom|top/g,
            function (matched) {
              return hash[matched];
            }
          );
        }

        /**
         * Get offsets to the popper
         * @method
         * @memberof Popper.Utils
         * @param {Object} position - CSS position the Popper will get applied
         * @param {HTMLElement} popper - the popper element
         * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
         * @param {String} placement - one of the valid placement options
         * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
         */
        function getPopperOffsets(popper, referenceOffsets, placement) {
          placement = placement.split("-")[0];

          // Get popper node sizes
          var popperRect = getOuterSizes(popper);

          // Add position, width and height to our offsets object
          var popperOffsets = {
            width: popperRect.width,
            height: popperRect.height,
          };

          // depending by the popper placement we have to compute its offsets slightly differently
          var isHoriz = ["right", "left"].indexOf(placement) !== -1;
          var mainSide = isHoriz ? "top" : "left";
          var secondarySide = isHoriz ? "left" : "top";
          var measurement = isHoriz ? "height" : "width";
          var secondaryMeasurement = !isHoriz ? "height" : "width";

          popperOffsets[mainSide] =
            referenceOffsets[mainSide] +
            referenceOffsets[measurement] / 2 -
            popperRect[measurement] / 2;
          if (placement === secondarySide) {
            popperOffsets[secondarySide] =
              referenceOffsets[secondarySide] -
              popperRect[secondaryMeasurement];
          } else {
            popperOffsets[secondarySide] =
              referenceOffsets[getOppositePlacement(secondarySide)];
          }

          return popperOffsets;
        }

        /**
         * Mimics the `find` method of Array
         * @method
         * @memberof Popper.Utils
         * @argument {Array} arr
         * @argument prop
         * @argument value
         * @returns index or -1
         */
        function find(arr, check) {
          // use native find if supported
          if (Array.prototype.find) {
            return arr.find(check);
          }

          // use `filter` to obtain the same behavior of `find`
          return arr.filter(check)[0];
        }

        /**
         * Return the index of the matching object
         * @method
         * @memberof Popper.Utils
         * @argument {Array} arr
         * @argument prop
         * @argument value
         * @returns index or -1
         */
        function findIndex(arr, prop, value) {
          // use native findIndex if supported
          if (Array.prototype.findIndex) {
            return arr.findIndex(function (cur) {
              return cur[prop] === value;
            });
          }

          // use `find` + `indexOf` if `findIndex` isn't supported
          var match = find(arr, function (obj) {
            return obj[prop] === value;
          });
          return arr.indexOf(match);
        }

        /**
         * Loop trough the list of modifiers and run them in order,
         * each of them will then edit the data object.
         * @method
         * @memberof Popper.Utils
         * @param {dataObject} data
         * @param {Array} modifiers
         * @param {String} ends - Optional modifier name used as stopper
         * @returns {dataObject}
         */
        function runModifiers(modifiers, data, ends) {
          var modifiersToRun =
            ends === undefined
              ? modifiers
              : modifiers.slice(0, findIndex(modifiers, "name", ends));

          modifiersToRun.forEach(function (modifier) {
            if (modifier["function"]) {
              // eslint-disable-line dot-notation
              console.warn(
                "`modifier.function` is deprecated, use `modifier.fn`!"
              );
            }
            var fn = modifier["function"] || modifier.fn; // eslint-disable-line dot-notation
            if (modifier.enabled && isFunction(fn)) {
              // Add properties to offsets to make them a complete clientRect object
              // we do this before each modifier to make sure the previous one doesn't
              // mess with these values
              data.offsets.popper = getClientRect(data.offsets.popper);
              data.offsets.reference = getClientRect(data.offsets.reference);

              data = fn(data, modifier);
            }
          });

          return data;
        }

        /**
         * Updates the position of the popper, computing the new offsets and applying
         * the new style.<br />
         * Prefer `scheduleUpdate` over `update` because of performance reasons.
         * @method
         * @memberof Popper
         */
        function update() {
          // if popper is destroyed, don't perform any further update
          if (this.state.isDestroyed) {
            return;
          }

          var data = {
            instance: this,
            styles: {},
            arrowStyles: {},
            attributes: {},
            flipped: false,
            offsets: {},
          };

          // compute reference element offsets
          data.offsets.reference = getReferenceOffsets(
            this.state,
            this.popper,
            this.reference,
            this.options.positionFixed
          );

          // compute auto placement, store placement inside the data object,
          // modifiers will be able to edit `placement` if needed
          // and refer to originalPlacement to know the original value
          data.placement = computeAutoPlacement(
            this.options.placement,
            data.offsets.reference,
            this.popper,
            this.reference,
            this.options.modifiers.flip.boundariesElement,
            this.options.modifiers.flip.padding
          );

          // store the computed placement inside `originalPlacement`
          data.originalPlacement = data.placement;

          data.positionFixed = this.options.positionFixed;

          // compute the popper offsets
          data.offsets.popper = getPopperOffsets(
            this.popper,
            data.offsets.reference,
            data.placement
          );

          data.offsets.popper.position = this.options.positionFixed
            ? "fixed"
            : "absolute";

          // run the modifiers
          data = runModifiers(this.modifiers, data);

          // the first `update` will call `onCreate` callback
          // the other ones will call `onUpdate` callback
          if (!this.state.isCreated) {
            this.state.isCreated = true;
            this.options.onCreate(data);
          } else {
            this.options.onUpdate(data);
          }
        }

        /**
         * Helper used to know if the given modifier is enabled.
         * @method
         * @memberof Popper.Utils
         * @returns {Boolean}
         */
        function isModifierEnabled(modifiers, modifierName) {
          return modifiers.some(function (_ref) {
            var name = _ref.name,
              enabled = _ref.enabled;
            return enabled && name === modifierName;
          });
        }

        /**
         * Get the prefixed supported property name
         * @method
         * @memberof Popper.Utils
         * @argument {String} property (camelCase)
         * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
         */
        function getSupportedPropertyName(property) {
          var prefixes = [false, "ms", "Webkit", "Moz", "O"];
          var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

          for (var i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            var toCheck = prefix ? "" + prefix + upperProp : property;
            if (typeof document.body.style[toCheck] !== "undefined") {
              return toCheck;
            }
          }
          return null;
        }

        /**
         * Destroys the popper.
         * @method
         * @memberof Popper
         */
        function destroy() {
          this.state.isDestroyed = true;

          // touch DOM only if `applyStyle` modifier is enabled
          if (isModifierEnabled(this.modifiers, "applyStyle")) {
            this.popper.removeAttribute("x-placement");
            this.popper.style.position = "";
            this.popper.style.top = "";
            this.popper.style.left = "";
            this.popper.style.right = "";
            this.popper.style.bottom = "";
            this.popper.style.willChange = "";
            this.popper.style[getSupportedPropertyName("transform")] = "";
          }

          this.disableEventListeners();

          // remove the popper if user explicitly asked for the deletion on destroy
          // do not use `remove` because IE11 doesn't support it
          if (this.options.removeOnDestroy) {
            this.popper.parentNode.removeChild(this.popper);
          }
          return this;
        }

        /**
         * Get the window associated with the element
         * @argument {Element} element
         * @returns {Window}
         */
        function getWindow(element) {
          var ownerDocument = element.ownerDocument;
          return ownerDocument ? ownerDocument.defaultView : window;
        }

        function attachToScrollParents(
          scrollParent,
          event,
          callback,
          scrollParents
        ) {
          var isBody = scrollParent.nodeName === "BODY";
          var target = isBody
            ? scrollParent.ownerDocument.defaultView
            : scrollParent;
          target.addEventListener(event, callback, { passive: true });

          if (!isBody) {
            attachToScrollParents(
              getScrollParent(target.parentNode),
              event,
              callback,
              scrollParents
            );
          }
          scrollParents.push(target);
        }

        /**
         * Setup needed event listeners used to update the popper position
         * @method
         * @memberof Popper.Utils
         * @private
         */
        function setupEventListeners(reference, options, state, updateBound) {
          // Resize event listener on window
          state.updateBound = updateBound;
          getWindow(reference).addEventListener("resize", state.updateBound, {
            passive: true,
          });

          // Scroll event listener on scroll parents
          var scrollElement = getScrollParent(reference);
          attachToScrollParents(
            scrollElement,
            "scroll",
            state.updateBound,
            state.scrollParents
          );
          state.scrollElement = scrollElement;
          state.eventsEnabled = true;

          return state;
        }

        /**
         * It will add resize/scroll events and start recalculating
         * position of the popper element when they are triggered.
         * @method
         * @memberof Popper
         */
        function enableEventListeners() {
          if (!this.state.eventsEnabled) {
            this.state = setupEventListeners(
              this.reference,
              this.options,
              this.state,
              this.scheduleUpdate
            );
          }
        }

        /**
         * Remove event listeners used to update the popper position
         * @method
         * @memberof Popper.Utils
         * @private
         */
        function removeEventListeners(reference, state) {
          // Remove resize event listener on window
          getWindow(reference).removeEventListener("resize", state.updateBound);

          // Remove scroll event listener on scroll parents
          state.scrollParents.forEach(function (target) {
            target.removeEventListener("scroll", state.updateBound);
          });

          // Reset state
          state.updateBound = null;
          state.scrollParents = [];
          state.scrollElement = null;
          state.eventsEnabled = false;
          return state;
        }

        /**
         * It will remove resize/scroll events and won't recalculate popper position
         * when they are triggered. It also won't trigger `onUpdate` callback anymore,
         * unless you call `update` method manually.
         * @method
         * @memberof Popper
         */
        function disableEventListeners() {
          if (this.state.eventsEnabled) {
            cancelAnimationFrame(this.scheduleUpdate);
            this.state = removeEventListeners(this.reference, this.state);
          }
        }

        /**
         * Tells if a given input is a number
         * @method
         * @memberof Popper.Utils
         * @param {*} input to check
         * @return {Boolean}
         */
        function isNumeric(n) {
          return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
        }

        /**
         * Set the style to the given popper
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element - Element to apply the style to
         * @argument {Object} styles
         * Object with a list of properties and values which will be applied to the element
         */
        function setStyles(element, styles) {
          Object.keys(styles).forEach(function (prop) {
            var unit = "";
            // add unit if the value is numeric and is one of the following
            if (
              ["width", "height", "top", "right", "bottom", "left"].indexOf(
                prop
              ) !== -1 &&
              isNumeric(styles[prop])
            ) {
              unit = "px";
            }
            element.style[prop] = styles[prop] + unit;
          });
        }

        /**
         * Set the attributes to the given popper
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element - Element to apply the attributes to
         * @argument {Object} styles
         * Object with a list of properties and values which will be applied to the element
         */
        function setAttributes(element, attributes) {
          Object.keys(attributes).forEach(function (prop) {
            var value = attributes[prop];
            if (value !== false) {
              element.setAttribute(prop, attributes[prop]);
            } else {
              element.removeAttribute(prop);
            }
          });
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} data.styles - List of style properties - values to apply to popper element
         * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The same data object
         */
        function applyStyle(data) {
          // any property present in `data.styles` will be applied to the popper,
          // in this way we can make the 3rd party modifiers add custom styles to it
          // Be aware, modifiers could override the properties defined in the previous
          // lines of this modifier!
          setStyles(data.instance.popper, data.styles);

          // any property present in `data.attributes` will be applied to the popper,
          // they will be set as HTML attributes of the element
          setAttributes(data.instance.popper, data.attributes);

          // if arrowElement is defined and arrowStyles has some properties
          if (data.arrowElement && Object.keys(data.arrowStyles).length) {
            setStyles(data.arrowElement, data.arrowStyles);
          }

          return data;
        }

        /**
         * Set the x-placement attribute before everything else because it could be used
         * to add margins to the popper margins needs to be calculated to get the
         * correct popper offsets.
         * @method
         * @memberof Popper.modifiers
         * @param {HTMLElement} reference - The reference element used to position the popper
         * @param {HTMLElement} popper - The HTML element used as popper
         * @param {Object} options - Popper.js options
         */
        function applyStyleOnLoad(
          reference,
          popper,
          options,
          modifierOptions,
          state
        ) {
          // compute reference element offsets
          var referenceOffsets = getReferenceOffsets(
            state,
            popper,
            reference,
            options.positionFixed
          );

          // compute auto placement, store placement inside the data object,
          // modifiers will be able to edit `placement` if needed
          // and refer to originalPlacement to know the original value
          var placement = computeAutoPlacement(
            options.placement,
            referenceOffsets,
            popper,
            reference,
            options.modifiers.flip.boundariesElement,
            options.modifiers.flip.padding
          );

          popper.setAttribute("x-placement", placement);

          // Apply `position` to popper before anything else because
          // without the position applied we can't guarantee correct computations
          setStyles(popper, {
            position: options.positionFixed ? "fixed" : "absolute",
          });

          return options;
        }

        /**
         * @function
         * @memberof Popper.Utils
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Boolean} shouldRound - If the offsets should be rounded at all
         * @returns {Object} The popper's position offsets rounded
         *
         * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
         * good as it can be within reason.
         * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
         *
         * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
         * as well on High DPI screens).
         *
         * Firefox prefers no rounding for positioning and does not have blurriness on
         * high DPI screens.
         *
         * Only horizontal placement and left/right values need to be considered.
         */
        function getRoundedOffsets(data, shouldRound) {
          var _data$offsets = data.offsets,
            popper = _data$offsets.popper,
            reference = _data$offsets.reference;
          var round = Math.round,
            floor = Math.floor;

          var noRound = function noRound(v) {
            return v;
          };

          var referenceWidth = round(reference.width);
          var popperWidth = round(popper.width);

          var isVertical = ["left", "right"].indexOf(data.placement) !== -1;
          var isVariation = data.placement.indexOf("-") !== -1;
          var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
          var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

          var horizontalToInteger = !shouldRound
            ? noRound
            : isVertical || isVariation || sameWidthParity
            ? round
            : floor;
          var verticalToInteger = !shouldRound ? noRound : round;

          return {
            left: horizontalToInteger(
              bothOddWidth && !isVariation && shouldRound
                ? popper.left - 1
                : popper.left
            ),
            top: verticalToInteger(popper.top),
            bottom: verticalToInteger(popper.bottom),
            right: horizontalToInteger(popper.right),
          };
        }

        var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function computeStyle(data, options) {
          var x = options.x,
            y = options.y;
          var popper = data.offsets.popper;

          // Remove this legacy support in Popper.js v2

          var legacyGpuAccelerationOption = find(
            data.instance.modifiers,
            function (modifier) {
              return modifier.name === "applyStyle";
            }
          ).gpuAcceleration;
          if (legacyGpuAccelerationOption !== undefined) {
            console.warn(
              "WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!"
            );
          }
          var gpuAcceleration =
            legacyGpuAccelerationOption !== undefined
              ? legacyGpuAccelerationOption
              : options.gpuAcceleration;

          var offsetParent = getOffsetParent(data.instance.popper);
          var offsetParentRect = getBoundingClientRect(offsetParent);

          // Styles
          var styles = {
            position: popper.position,
          };

          var offsets = getRoundedOffsets(
            data,
            window.devicePixelRatio < 2 || !isFirefox
          );

          var sideA = x === "bottom" ? "top" : "bottom";
          var sideB = y === "right" ? "left" : "right";

          // if gpuAcceleration is set to `true` and transform is supported,
          //  we use `translate3d` to apply the position to the popper we
          // automatically use the supported prefixed version if needed
          var prefixedProperty = getSupportedPropertyName("transform");

          // now, let's make a step back and look at this code closely (wtf?)
          // If the content of the popper grows once it's been positioned, it
          // may happen that the popper gets misplaced because of the new content
          // overflowing its reference element
          // To avoid this problem, we provide two options (x and y), which allow
          // the consumer to define the offset origin.
          // If we position a popper on top of a reference element, we can set
          // `x` to `top` to make the popper grow towards its top instead of
          // its bottom.
          var left = void 0,
            top = void 0;
          if (sideA === "bottom") {
            // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
            // and not the bottom of the html element
            if (offsetParent.nodeName === "HTML") {
              top = -offsetParent.clientHeight + offsets.bottom;
            } else {
              top = -offsetParentRect.height + offsets.bottom;
            }
          } else {
            top = offsets.top;
          }
          if (sideB === "right") {
            if (offsetParent.nodeName === "HTML") {
              left = -offsetParent.clientWidth + offsets.right;
            } else {
              left = -offsetParentRect.width + offsets.right;
            }
          } else {
            left = offsets.left;
          }
          if (gpuAcceleration && prefixedProperty) {
            styles[prefixedProperty] =
              "translate3d(" + left + "px, " + top + "px, 0)";
            styles[sideA] = 0;
            styles[sideB] = 0;
            styles.willChange = "transform";
          } else {
            // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
            var invertTop = sideA === "bottom" ? -1 : 1;
            var invertLeft = sideB === "right" ? -1 : 1;
            styles[sideA] = top * invertTop;
            styles[sideB] = left * invertLeft;
            styles.willChange = sideA + ", " + sideB;
          }

          // Attributes
          var attributes = {
            "x-placement": data.placement,
          };

          // Update `data` attributes, styles and arrowStyles
          data.attributes = _extends({}, attributes, data.attributes);
          data.styles = _extends({}, styles, data.styles);
          data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

          return data;
        }

        /**
         * Helper used to know if the given modifier depends from another one.<br />
         * It checks if the needed modifier is listed and enabled.
         * @method
         * @memberof Popper.Utils
         * @param {Array} modifiers - list of modifiers
         * @param {String} requestingName - name of requesting modifier
         * @param {String} requestedName - name of requested modifier
         * @returns {Boolean}
         */
        function isModifierRequired(modifiers, requestingName, requestedName) {
          var requesting = find(modifiers, function (_ref) {
            var name = _ref.name;
            return name === requestingName;
          });

          var isRequired =
            !!requesting &&
            modifiers.some(function (modifier) {
              return (
                modifier.name === requestedName &&
                modifier.enabled &&
                modifier.order < requesting.order
              );
            });

          if (!isRequired) {
            var _requesting = "`" + requestingName + "`";
            var requested = "`" + requestedName + "`";
            console.warn(
              requested +
                " modifier is required by " +
                _requesting +
                " modifier in order to work, be sure to include it before " +
                _requesting +
                "!"
            );
          }
          return isRequired;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function arrow(data, options) {
          var _data$offsets$arrow;

          // arrow depends on keepTogether in order to work
          if (
            !isModifierRequired(
              data.instance.modifiers,
              "arrow",
              "keepTogether"
            )
          ) {
            return data;
          }

          var arrowElement = options.element;

          // if arrowElement is a string, suppose it's a CSS selector
          if (typeof arrowElement === "string") {
            arrowElement = data.instance.popper.querySelector(arrowElement);

            // if arrowElement is not found, don't run the modifier
            if (!arrowElement) {
              return data;
            }
          } else {
            // if the arrowElement isn't a query selector we must check that the
            // provided DOM node is child of its popper node
            if (!data.instance.popper.contains(arrowElement)) {
              console.warn(
                "WARNING: `arrow.element` must be child of its popper element!"
              );
              return data;
            }
          }

          var placement = data.placement.split("-")[0];
          var _data$offsets = data.offsets,
            popper = _data$offsets.popper,
            reference = _data$offsets.reference;

          var isVertical = ["left", "right"].indexOf(placement) !== -1;

          var len = isVertical ? "height" : "width";
          var sideCapitalized = isVertical ? "Top" : "Left";
          var side = sideCapitalized.toLowerCase();
          var altSide = isVertical ? "left" : "top";
          var opSide = isVertical ? "bottom" : "right";
          var arrowElementSize = getOuterSizes(arrowElement)[len];

          //
          // extends keepTogether behavior making sure the popper and its
          // reference have enough pixels in conjunction
          //

          // top/left side
          if (reference[opSide] - arrowElementSize < popper[side]) {
            data.offsets.popper[side] -=
              popper[side] - (reference[opSide] - arrowElementSize);
          }
          // bottom/right side
          if (reference[side] + arrowElementSize > popper[opSide]) {
            data.offsets.popper[side] +=
              reference[side] + arrowElementSize - popper[opSide];
          }
          data.offsets.popper = getClientRect(data.offsets.popper);

          // compute center of the popper
          var center =
            reference[side] + reference[len] / 2 - arrowElementSize / 2;

          // Compute the sideValue using the updated popper offsets
          // take popper margin in account because we don't have this info available
          var css = getStyleComputedProperty(data.instance.popper);
          var popperMarginSide = parseFloat(css["margin" + sideCapitalized]);
          var popperBorderSide = parseFloat(
            css["border" + sideCapitalized + "Width"]
          );
          var sideValue =
            center -
            data.offsets.popper[side] -
            popperMarginSide -
            popperBorderSide;

          // prevent arrowElement from being placed not contiguously to its popper
          sideValue = Math.max(
            Math.min(popper[len] - arrowElementSize, sideValue),
            0
          );

          data.arrowElement = arrowElement;
          data.offsets.arrow =
            ((_data$offsets$arrow = {}),
            defineProperty(_data$offsets$arrow, side, Math.round(sideValue)),
            defineProperty(_data$offsets$arrow, altSide, ""),
            _data$offsets$arrow);

          return data;
        }

        /**
         * Get the opposite placement variation of the given one
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement variation
         * @returns {String} flipped placement variation
         */
        function getOppositeVariation(variation) {
          if (variation === "end") {
            return "start";
          } else if (variation === "start") {
            return "end";
          }
          return variation;
        }

        /**
         * List of accepted placements to use as values of the `placement` option.<br />
         * Valid placements are:
         * - `auto`
         * - `top`
         * - `right`
         * - `bottom`
         * - `left`
         *
         * Each placement can have a variation from this list:
         * - `-start`
         * - `-end`
         *
         * Variations are interpreted easily if you think of them as the left to right
         * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
         * is right.<br />
         * Vertically (`left` and `right`), `start` is top and `end` is bottom.
         *
         * Some valid examples are:
         * - `top-end` (on top of reference, right aligned)
         * - `right-start` (on right of reference, top aligned)
         * - `bottom` (on bottom, centered)
         * - `auto-end` (on the side with more space available, alignment depends by placement)
         *
         * @static
         * @type {Array}
         * @enum {String}
         * @readonly
         * @method placements
         * @memberof Popper
         */
        var placements = [
          "auto-start",
          "auto",
          "auto-end",
          "top-start",
          "top",
          "top-end",
          "right-start",
          "right",
          "right-end",
          "bottom-end",
          "bottom",
          "bottom-start",
          "left-end",
          "left",
          "left-start",
        ];

        // Get rid of `auto` `auto-start` and `auto-end`
        var validPlacements = placements.slice(3);

        /**
         * Given an initial placement, returns all the subsequent placements
         * clockwise (or counter-clockwise).
         *
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement - A valid placement (it accepts variations)
         * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
         * @returns {Array} placements including their variations
         */
        function clockwise(placement) {
          var counter =
            arguments.length > 1 && arguments[1] !== undefined
              ? arguments[1]
              : false;

          var index = validPlacements.indexOf(placement);
          var arr = validPlacements
            .slice(index + 1)
            .concat(validPlacements.slice(0, index));
          return counter ? arr.reverse() : arr;
        }

        var BEHAVIORS = {
          FLIP: "flip",
          CLOCKWISE: "clockwise",
          COUNTERCLOCKWISE: "counterclockwise",
        };

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function flip(data, options) {
          // if `inner` modifier is enabled, we can't use the `flip` modifier
          if (isModifierEnabled(data.instance.modifiers, "inner")) {
            return data;
          }

          if (data.flipped && data.placement === data.originalPlacement) {
            // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
            return data;
          }

          var boundaries = getBoundaries(
            data.instance.popper,
            data.instance.reference,
            options.padding,
            options.boundariesElement,
            data.positionFixed
          );

          var placement = data.placement.split("-")[0];
          var placementOpposite = getOppositePlacement(placement);
          var variation = data.placement.split("-")[1] || "";

          var flipOrder = [];

          switch (options.behavior) {
            case BEHAVIORS.FLIP:
              flipOrder = [placement, placementOpposite];
              break;
            case BEHAVIORS.CLOCKWISE:
              flipOrder = clockwise(placement);
              break;
            case BEHAVIORS.COUNTERCLOCKWISE:
              flipOrder = clockwise(placement, true);
              break;
            default:
              flipOrder = options.behavior;
          }

          flipOrder.forEach(function (step, index) {
            if (placement !== step || flipOrder.length === index + 1) {
              return data;
            }

            placement = data.placement.split("-")[0];
            placementOpposite = getOppositePlacement(placement);

            var popperOffsets = data.offsets.popper;
            var refOffsets = data.offsets.reference;

            // using floor because the reference offsets may contain decimals we are not going to consider here
            var floor = Math.floor;
            var overlapsRef =
              (placement === "left" &&
                floor(popperOffsets.right) > floor(refOffsets.left)) ||
              (placement === "right" &&
                floor(popperOffsets.left) < floor(refOffsets.right)) ||
              (placement === "top" &&
                floor(popperOffsets.bottom) > floor(refOffsets.top)) ||
              (placement === "bottom" &&
                floor(popperOffsets.top) < floor(refOffsets.bottom));

            var overflowsLeft =
              floor(popperOffsets.left) < floor(boundaries.left);
            var overflowsRight =
              floor(popperOffsets.right) > floor(boundaries.right);
            var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
            var overflowsBottom =
              floor(popperOffsets.bottom) > floor(boundaries.bottom);

            var overflowsBoundaries =
              (placement === "left" && overflowsLeft) ||
              (placement === "right" && overflowsRight) ||
              (placement === "top" && overflowsTop) ||
              (placement === "bottom" && overflowsBottom);

            // flip the variation if required
            var isVertical = ["top", "bottom"].indexOf(placement) !== -1;

            // flips variation if reference element overflows boundaries
            var flippedVariationByRef =
              !!options.flipVariations &&
              ((isVertical && variation === "start" && overflowsLeft) ||
                (isVertical && variation === "end" && overflowsRight) ||
                (!isVertical && variation === "start" && overflowsTop) ||
                (!isVertical && variation === "end" && overflowsBottom));

            // flips variation if popper content overflows boundaries
            var flippedVariationByContent =
              !!options.flipVariationsByContent &&
              ((isVertical && variation === "start" && overflowsRight) ||
                (isVertical && variation === "end" && overflowsLeft) ||
                (!isVertical && variation === "start" && overflowsBottom) ||
                (!isVertical && variation === "end" && overflowsTop));

            var flippedVariation =
              flippedVariationByRef || flippedVariationByContent;

            if (overlapsRef || overflowsBoundaries || flippedVariation) {
              // this boolean to detect any flip loop
              data.flipped = true;

              if (overlapsRef || overflowsBoundaries) {
                placement = flipOrder[index + 1];
              }

              if (flippedVariation) {
                variation = getOppositeVariation(variation);
              }

              data.placement = placement + (variation ? "-" + variation : "");

              // this object contains `position`, we want to preserve it along with
              // any additional property we may add in the future
              data.offsets.popper = _extends(
                {},
                data.offsets.popper,
                getPopperOffsets(
                  data.instance.popper,
                  data.offsets.reference,
                  data.placement
                )
              );

              data = runModifiers(data.instance.modifiers, data, "flip");
            }
          });
          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function keepTogether(data) {
          var _data$offsets = data.offsets,
            popper = _data$offsets.popper,
            reference = _data$offsets.reference;

          var placement = data.placement.split("-")[0];
          var floor = Math.floor;
          var isVertical = ["top", "bottom"].indexOf(placement) !== -1;
          var side = isVertical ? "right" : "bottom";
          var opSide = isVertical ? "left" : "top";
          var measurement = isVertical ? "width" : "height";

          if (popper[side] < floor(reference[opSide])) {
            data.offsets.popper[opSide] =
              floor(reference[opSide]) - popper[measurement];
          }
          if (popper[opSide] > floor(reference[side])) {
            data.offsets.popper[opSide] = floor(reference[side]);
          }

          return data;
        }

        /**
         * Converts a string containing value + unit into a px value number
         * @function
         * @memberof {modifiers~offset}
         * @private
         * @argument {String} str - Value + unit string
         * @argument {String} measurement - `height` or `width`
         * @argument {Object} popperOffsets
         * @argument {Object} referenceOffsets
         * @returns {Number|String}
         * Value in pixels, or original string if no values were extracted
         */
        function toValue(str, measurement, popperOffsets, referenceOffsets) {
          // separate value from unit
          var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
          var value = +split[1];
          var unit = split[2];

          // If it's not a number it's an operator, I guess
          if (!value) {
            return str;
          }

          if (unit.indexOf("%") === 0) {
            var element = void 0;
            switch (unit) {
              case "%p":
                element = popperOffsets;
                break;
              case "%":
              case "%r":
              default:
                element = referenceOffsets;
            }

            var rect = getClientRect(element);
            return (rect[measurement] / 100) * value;
          } else if (unit === "vh" || unit === "vw") {
            // if is a vh or vw, we calculate the size based on the viewport
            var size = void 0;
            if (unit === "vh") {
              size = Math.max(
                document.documentElement.clientHeight,
                window.innerHeight || 0
              );
            } else {
              size = Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
              );
            }
            return (size / 100) * value;
          } else {
            // if is an explicit pixel unit, we get rid of the unit and keep the value
            // if is an implicit unit, it's px, and we return just the value
            return value;
          }
        }

        /**
         * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
         * @function
         * @memberof {modifiers~offset}
         * @private
         * @argument {String} offset
         * @argument {Object} popperOffsets
         * @argument {Object} referenceOffsets
         * @argument {String} basePlacement
         * @returns {Array} a two cells array with x and y offsets in numbers
         */
        function parseOffset(
          offset,
          popperOffsets,
          referenceOffsets,
          basePlacement
        ) {
          var offsets = [0, 0];

          // Use height if placement is left or right and index is 0 otherwise use width
          // in this way the first offset will use an axis and the second one
          // will use the other one
          var useHeight = ["right", "left"].indexOf(basePlacement) !== -1;

          // Split the offset string to obtain a list of values and operands
          // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
          var fragments = offset.split(/(\+|\-)/).map(function (frag) {
            return frag.trim();
          });

          // Detect if the offset string contains a pair of values or a single one
          // they could be separated by comma or space
          var divider = fragments.indexOf(
            find(fragments, function (frag) {
              return frag.search(/,|\s/) !== -1;
            })
          );

          if (fragments[divider] && fragments[divider].indexOf(",") === -1) {
            console.warn(
              "Offsets separated by white space(s) are deprecated, use a comma (,) instead."
            );
          }

          // If divider is found, we divide the list of values and operands to divide
          // them by ofset X and Y.
          var splitRegex = /\s*,\s*|\s+/;
          var ops =
            divider !== -1
              ? [
                  fragments
                    .slice(0, divider)
                    .concat([fragments[divider].split(splitRegex)[0]]),
                  [fragments[divider].split(splitRegex)[1]].concat(
                    fragments.slice(divider + 1)
                  ),
                ]
              : [fragments];

          // Convert the values with units to absolute pixels to allow our computations
          ops = ops.map(function (op, index) {
            // Most of the units rely on the orientation of the popper
            var measurement = (index === 1 ? !useHeight : useHeight)
              ? "height"
              : "width";
            var mergeWithPrevious = false;
            return (
              op
                // This aggregates any `+` or `-` sign that aren't considered operators
                // e.g.: 10 + +5 => [10, +, +5]
                .reduce(function (a, b) {
                  if (a[a.length - 1] === "" && ["+", "-"].indexOf(b) !== -1) {
                    a[a.length - 1] = b;
                    mergeWithPrevious = true;
                    return a;
                  } else if (mergeWithPrevious) {
                    a[a.length - 1] += b;
                    mergeWithPrevious = false;
                    return a;
                  } else {
                    return a.concat(b);
                  }
                }, [])
                // Here we convert the string values into number values (in px)
                .map(function (str) {
                  return toValue(
                    str,
                    measurement,
                    popperOffsets,
                    referenceOffsets
                  );
                })
            );
          });

          // Loop trough the offsets arrays and execute the operations
          ops.forEach(function (op, index) {
            op.forEach(function (frag, index2) {
              if (isNumeric(frag)) {
                offsets[index] += frag * (op[index2 - 1] === "-" ? -1 : 1);
              }
            });
          });
          return offsets;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @argument {Number|String} options.offset=0
         * The offset value as described in the modifier description
         * @returns {Object} The data object, properly modified
         */
        function offset(data, _ref) {
          var offset = _ref.offset;
          var placement = data.placement,
            _data$offsets = data.offsets,
            popper = _data$offsets.popper,
            reference = _data$offsets.reference;

          var basePlacement = placement.split("-")[0];

          var offsets = void 0;
          if (isNumeric(+offset)) {
            offsets = [+offset, 0];
          } else {
            offsets = parseOffset(offset, popper, reference, basePlacement);
          }

          if (basePlacement === "left") {
            popper.top += offsets[0];
            popper.left -= offsets[1];
          } else if (basePlacement === "right") {
            popper.top += offsets[0];
            popper.left += offsets[1];
          } else if (basePlacement === "top") {
            popper.left += offsets[0];
            popper.top -= offsets[1];
          } else if (basePlacement === "bottom") {
            popper.left += offsets[0];
            popper.top += offsets[1];
          }

          data.popper = popper;
          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function preventOverflow(data, options) {
          var boundariesElement =
            options.boundariesElement || getOffsetParent(data.instance.popper);

          // If offsetParent is the reference element, we really want to
          // go one step up and use the next offsetParent as reference to
          // avoid to make this modifier completely useless and look like broken
          if (data.instance.reference === boundariesElement) {
            boundariesElement = getOffsetParent(boundariesElement);
          }

          // NOTE: DOM access here
          // resets the popper's position so that the document size can be calculated excluding
          // the size of the popper element itself
          var transformProp = getSupportedPropertyName("transform");
          var popperStyles = data.instance.popper.style; // assignment to help minification
          var top = popperStyles.top,
            left = popperStyles.left,
            transform = popperStyles[transformProp];

          popperStyles.top = "";
          popperStyles.left = "";
          popperStyles[transformProp] = "";

          var boundaries = getBoundaries(
            data.instance.popper,
            data.instance.reference,
            options.padding,
            boundariesElement,
            data.positionFixed
          );

          // NOTE: DOM access here
          // restores the original style properties after the offsets have been computed
          popperStyles.top = top;
          popperStyles.left = left;
          popperStyles[transformProp] = transform;

          options.boundaries = boundaries;

          var order = options.priority;
          var popper = data.offsets.popper;

          var check = {
            primary: function primary(placement) {
              var value = popper[placement];
              if (
                popper[placement] < boundaries[placement] &&
                !options.escapeWithReference
              ) {
                value = Math.max(popper[placement], boundaries[placement]);
              }
              return defineProperty({}, placement, value);
            },
            secondary: function secondary(placement) {
              var mainSide = placement === "right" ? "left" : "top";
              var value = popper[mainSide];
              if (
                popper[placement] > boundaries[placement] &&
                !options.escapeWithReference
              ) {
                value = Math.min(
                  popper[mainSide],
                  boundaries[placement] -
                    (placement === "right" ? popper.width : popper.height)
                );
              }
              return defineProperty({}, mainSide, value);
            },
          };

          order.forEach(function (placement) {
            var side =
              ["left", "top"].indexOf(placement) !== -1
                ? "primary"
                : "secondary";
            popper = _extends({}, popper, check[side](placement));
          });

          data.offsets.popper = popper;

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function shift(data) {
          var placement = data.placement;
          var basePlacement = placement.split("-")[0];
          var shiftvariation = placement.split("-")[1];

          // if shift shiftvariation is specified, run the modifier
          if (shiftvariation) {
            var _data$offsets = data.offsets,
              reference = _data$offsets.reference,
              popper = _data$offsets.popper;

            var isVertical = ["bottom", "top"].indexOf(basePlacement) !== -1;
            var side = isVertical ? "left" : "top";
            var measurement = isVertical ? "width" : "height";

            var shiftOffsets = {
              start: defineProperty({}, side, reference[side]),
              end: defineProperty(
                {},
                side,
                reference[side] + reference[measurement] - popper[measurement]
              ),
            };

            data.offsets.popper = _extends(
              {},
              popper,
              shiftOffsets[shiftvariation]
            );
          }

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function hide(data) {
          if (
            !isModifierRequired(
              data.instance.modifiers,
              "hide",
              "preventOverflow"
            )
          ) {
            return data;
          }

          var refRect = data.offsets.reference;
          var bound = find(data.instance.modifiers, function (modifier) {
            return modifier.name === "preventOverflow";
          }).boundaries;

          if (
            refRect.bottom < bound.top ||
            refRect.left > bound.right ||
            refRect.top > bound.bottom ||
            refRect.right < bound.left
          ) {
            // Avoid unnecessary DOM access if visibility hasn't changed
            if (data.hide === true) {
              return data;
            }

            data.hide = true;
            data.attributes["x-out-of-boundaries"] = "";
          } else {
            // Avoid unnecessary DOM access if visibility hasn't changed
            if (data.hide === false) {
              return data;
            }

            data.hide = false;
            data.attributes["x-out-of-boundaries"] = false;
          }

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function inner(data) {
          var placement = data.placement;
          var basePlacement = placement.split("-")[0];
          var _data$offsets = data.offsets,
            popper = _data$offsets.popper,
            reference = _data$offsets.reference;

          var isHoriz = ["left", "right"].indexOf(basePlacement) !== -1;

          var subtractLength = ["top", "left"].indexOf(basePlacement) === -1;

          popper[isHoriz ? "left" : "top"] =
            reference[basePlacement] -
            (subtractLength ? popper[isHoriz ? "width" : "height"] : 0);

          data.placement = getOppositePlacement(placement);
          data.offsets.popper = getClientRect(popper);

          return data;
        }

        /**
         * Modifier function, each modifier can have a function of this type assigned
         * to its `fn` property.<br />
         * These functions will be called on each update, this means that you must
         * make sure they are performant enough to avoid performance bottlenecks.
         *
         * @function ModifierFn
         * @argument {dataObject} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {dataObject} The data object, properly modified
         */

        /**
         * Modifiers are plugins used to alter the behavior of your poppers.<br />
         * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
         * needed by the library.
         *
         * Usually you don't want to override the `order`, `fn` and `onLoad` props.
         * All the other properties are configurations that could be tweaked.
         * @namespace modifiers
         */
        var modifiers = {
          /**
           * Modifier used to shift the popper on the start or end of its reference
           * element.<br />
           * It will read the variation of the `placement` property.<br />
           * It can be one either `-end` or `-start`.
           * @memberof modifiers
           * @inner
           */
          shift: {
            /** @prop {number} order=100 - Index used to define the order of execution */
            order: 100,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: shift,
          },

          /**
           * The `offset` modifier can shift your popper on both its axis.
           *
           * It accepts the following units:
           * - `px` or unit-less, interpreted as pixels
           * - `%` or `%r`, percentage relative to the length of the reference element
           * - `%p`, percentage relative to the length of the popper element
           * - `vw`, CSS viewport width unit
           * - `vh`, CSS viewport height unit
           *
           * For length is intended the main axis relative to the placement of the popper.<br />
           * This means that if the placement is `top` or `bottom`, the length will be the
           * `width`. In case of `left` or `right`, it will be the `height`.
           *
           * You can provide a single value (as `Number` or `String`), or a pair of values
           * as `String` divided by a comma or one (or more) white spaces.<br />
           * The latter is a deprecated method because it leads to confusion and will be
           * removed in v2.<br />
           * Additionally, it accepts additions and subtractions between different units.
           * Note that multiplications and divisions aren't supported.
           *
           * Valid examples are:
           * ```
           * 10
           * '10%'
           * '10, 10'
           * '10%, 10'
           * '10 + 10%'
           * '10 - 5vh + 3%'
           * '-10px + 5vh, 5px - 6%'
           * ```
           * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
           * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
           * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
           *
           * @memberof modifiers
           * @inner
           */
          offset: {
            /** @prop {number} order=200 - Index used to define the order of execution */
            order: 200,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: offset,
            /** @prop {Number|String} offset=0
             * The offset value as described in the modifier description
             */
            offset: 0,
          },

          /**
           * Modifier used to prevent the popper from being positioned outside the boundary.
           *
           * A scenario exists where the reference itself is not within the boundaries.<br />
           * We can say it has "escaped the boundaries" — or just "escaped".<br />
           * In this case we need to decide whether the popper should either:
           *
           * - detach from the reference and remain "trapped" in the boundaries, or
           * - if it should ignore the boundary and "escape with its reference"
           *
           * When `escapeWithReference` is set to`true` and reference is completely
           * outside its boundaries, the popper will overflow (or completely leave)
           * the boundaries in order to remain attached to the edge of the reference.
           *
           * @memberof modifiers
           * @inner
           */
          preventOverflow: {
            /** @prop {number} order=300 - Index used to define the order of execution */
            order: 300,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: preventOverflow,
            /**
             * @prop {Array} [priority=['left','right','top','bottom']]
             * Popper will try to prevent overflow following these priorities by default,
             * then, it could overflow on the left and on top of the `boundariesElement`
             */
            priority: ["left", "right", "top", "bottom"],
            /**
             * @prop {number} padding=5
             * Amount of pixel used to define a minimum distance between the boundaries
             * and the popper. This makes sure the popper always has a little padding
             * between the edges of its container
             */
            padding: 5,
            /**
             * @prop {String|HTMLElement} boundariesElement='scrollParent'
             * Boundaries used by the modifier. Can be `scrollParent`, `window`,
             * `viewport` or any DOM element.
             */
            boundariesElement: "scrollParent",
          },

          /**
           * Modifier used to make sure the reference and its popper stay near each other
           * without leaving any gap between the two. Especially useful when the arrow is
           * enabled and you want to ensure that it points to its reference element.
           * It cares only about the first axis. You can still have poppers with margin
           * between the popper and its reference element.
           * @memberof modifiers
           * @inner
           */
          keepTogether: {
            /** @prop {number} order=400 - Index used to define the order of execution */
            order: 400,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: keepTogether,
          },

          /**
           * This modifier is used to move the `arrowElement` of the popper to make
           * sure it is positioned between the reference element and its popper element.
           * It will read the outer size of the `arrowElement` node to detect how many
           * pixels of conjunction are needed.
           *
           * It has no effect if no `arrowElement` is provided.
           * @memberof modifiers
           * @inner
           */
          arrow: {
            /** @prop {number} order=500 - Index used to define the order of execution */
            order: 500,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: arrow,
            /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
            element: "[x-arrow]",
          },

          /**
           * Modifier used to flip the popper's placement when it starts to overlap its
           * reference element.
           *
           * Requires the `preventOverflow` modifier before it in order to work.
           *
           * **NOTE:** this modifier will interrupt the current update cycle and will
           * restart it if it detects the need to flip the placement.
           * @memberof modifiers
           * @inner
           */
          flip: {
            /** @prop {number} order=600 - Index used to define the order of execution */
            order: 600,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: flip,
            /**
             * @prop {String|Array} behavior='flip'
             * The behavior used to change the popper's placement. It can be one of
             * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
             * placements (with optional variations)
             */
            behavior: "flip",
            /**
             * @prop {number} padding=5
             * The popper will flip if it hits the edges of the `boundariesElement`
             */
            padding: 5,
            /**
             * @prop {String|HTMLElement} boundariesElement='viewport'
             * The element which will define the boundaries of the popper position.
             * The popper will never be placed outside of the defined boundaries
             * (except if `keepTogether` is enabled)
             */
            boundariesElement: "viewport",
            /**
             * @prop {Boolean} flipVariations=false
             * The popper will switch placement variation between `-start` and `-end` when
             * the reference element overlaps its boundaries.
             *
             * The original placement should have a set variation.
             */
            flipVariations: false,
            /**
             * @prop {Boolean} flipVariationsByContent=false
             * The popper will switch placement variation between `-start` and `-end` when
             * the popper element overlaps its reference boundaries.
             *
             * The original placement should have a set variation.
             */
            flipVariationsByContent: false,
          },

          /**
           * Modifier used to make the popper flow toward the inner of the reference element.
           * By default, when this modifier is disabled, the popper will be placed outside
           * the reference element.
           * @memberof modifiers
           * @inner
           */
          inner: {
            /** @prop {number} order=700 - Index used to define the order of execution */
            order: 700,
            /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
            enabled: false,
            /** @prop {ModifierFn} */
            fn: inner,
          },

          /**
           * Modifier used to hide the popper when its reference element is outside of the
           * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
           * be used to hide with a CSS selector the popper when its reference is
           * out of boundaries.
           *
           * Requires the `preventOverflow` modifier before it in order to work.
           * @memberof modifiers
           * @inner
           */
          hide: {
            /** @prop {number} order=800 - Index used to define the order of execution */
            order: 800,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: hide,
          },

          /**
           * Computes the style that will be applied to the popper element to gets
           * properly positioned.
           *
           * Note that this modifier will not touch the DOM, it just prepares the styles
           * so that `applyStyle` modifier can apply it. This separation is useful
           * in case you need to replace `applyStyle` with a custom implementation.
           *
           * This modifier has `850` as `order` value to maintain backward compatibility
           * with previous versions of Popper.js. Expect the modifiers ordering method
           * to change in future major versions of the library.
           *
           * @memberof modifiers
           * @inner
           */
          computeStyle: {
            /** @prop {number} order=850 - Index used to define the order of execution */
            order: 850,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: computeStyle,
            /**
             * @prop {Boolean} gpuAcceleration=true
             * If true, it uses the CSS 3D transformation to position the popper.
             * Otherwise, it will use the `top` and `left` properties
             */
            gpuAcceleration: true,
            /**
             * @prop {string} [x='bottom']
             * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
             * Change this if your popper should grow in a direction different from `bottom`
             */
            x: "bottom",
            /**
             * @prop {string} [x='left']
             * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
             * Change this if your popper should grow in a direction different from `right`
             */
            y: "right",
          },

          /**
           * Applies the computed styles to the popper element.
           *
           * All the DOM manipulations are limited to this modifier. This is useful in case
           * you want to integrate Popper.js inside a framework or view library and you
           * want to delegate all the DOM manipulations to it.
           *
           * Note that if you disable this modifier, you must make sure the popper element
           * has its position set to `absolute` before Popper.js can do its work!
           *
           * Just disable this modifier and define your own to achieve the desired effect.
           *
           * @memberof modifiers
           * @inner
           */
          applyStyle: {
            /** @prop {number} order=900 - Index used to define the order of execution */
            order: 900,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: applyStyle,
            /** @prop {Function} */
            onLoad: applyStyleOnLoad,
            /**
             * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
             * @prop {Boolean} gpuAcceleration=true
             * If true, it uses the CSS 3D transformation to position the popper.
             * Otherwise, it will use the `top` and `left` properties
             */
            gpuAcceleration: undefined,
          },
        };

        /**
         * The `dataObject` is an object containing all the information used by Popper.js.
         * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
         * @name dataObject
         * @property {Object} data.instance The Popper.js instance
         * @property {String} data.placement Placement applied to popper
         * @property {String} data.originalPlacement Placement originally defined on init
         * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
         * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
         * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
         * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
         * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
         * @property {Object} data.boundaries Offsets of the popper boundaries
         * @property {Object} data.offsets The measurements of popper, reference and arrow elements
         * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
         * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
         * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
         */

        /**
         * Default options provided to Popper.js constructor.<br />
         * These can be overridden using the `options` argument of Popper.js.<br />
         * To override an option, simply pass an object with the same
         * structure of the `options` object, as the 3rd argument. For example:
         * ```
         * new Popper(ref, pop, {
         *   modifiers: {
         *     preventOverflow: { enabled: false }
         *   }
         * })
         * ```
         * @type {Object}
         * @static
         * @memberof Popper
         */
        var Defaults = {
          /**
           * Popper's placement.
           * @prop {Popper.placements} placement='bottom'
           */
          placement: "bottom",

          /**
           * Set this to true if you want popper to position it self in 'fixed' mode
           * @prop {Boolean} positionFixed=false
           */
          positionFixed: false,

          /**
           * Whether events (resize, scroll) are initially enabled.
           * @prop {Boolean} eventsEnabled=true
           */
          eventsEnabled: true,

          /**
           * Set to true if you want to automatically remove the popper when
           * you call the `destroy` method.
           * @prop {Boolean} removeOnDestroy=false
           */
          removeOnDestroy: false,

          /**
           * Callback called when the popper is created.<br />
           * By default, it is set to no-op.<br />
           * Access Popper.js instance with `data.instance`.
           * @prop {onCreate}
           */
          onCreate: function onCreate() {},

          /**
           * Callback called when the popper is updated. This callback is not called
           * on the initialization/creation of the popper, but only on subsequent
           * updates.<br />
           * By default, it is set to no-op.<br />
           * Access Popper.js instance with `data.instance`.
           * @prop {onUpdate}
           */
          onUpdate: function onUpdate() {},

          /**
           * List of modifiers used to modify the offsets before they are applied to the popper.
           * They provide most of the functionalities of Popper.js.
           * @prop {modifiers}
           */
          modifiers: modifiers,
        };

        /**
         * @callback onCreate
         * @param {dataObject} data
         */

        /**
         * @callback onUpdate
         * @param {dataObject} data
         */

        // Utils
        // Methods
        var Popper = (function () {
          /**
           * Creates a new Popper.js instance.
           * @class Popper
           * @param {Element|referenceObject} reference - The reference element used to position the popper
           * @param {Element} popper - The HTML / XML element used as the popper
           * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
           * @return {Object} instance - The generated Popper.js instance
           */
          function Popper(reference, popper) {
            var _this = this;

            var options =
              arguments.length > 2 && arguments[2] !== undefined
                ? arguments[2]
                : {};
            classCallCheck(this, Popper);

            this.scheduleUpdate = function () {
              return requestAnimationFrame(_this.update);
            };

            // make update() debounced, so that it only runs at most once-per-tick
            this.update = debounce(this.update.bind(this));

            // with {} we create a new object with the options inside it
            this.options = _extends({}, Popper.Defaults, options);

            // init state
            this.state = {
              isDestroyed: false,
              isCreated: false,
              scrollParents: [],
            };

            // get reference and popper elements (allow jQuery wrappers)
            this.reference =
              reference && reference.jquery ? reference[0] : reference;
            this.popper = popper && popper.jquery ? popper[0] : popper;

            // Deep merge modifiers options
            this.options.modifiers = {};
            Object.keys(
              _extends({}, Popper.Defaults.modifiers, options.modifiers)
            ).forEach(function (name) {
              _this.options.modifiers[name] = _extends(
                {},
                Popper.Defaults.modifiers[name] || {},
                options.modifiers ? options.modifiers[name] : {}
              );
            });

            // Refactoring modifiers' list (Object => Array)
            this.modifiers = Object.keys(this.options.modifiers)
              .map(function (name) {
                return _extends(
                  {
                    name: name,
                  },
                  _this.options.modifiers[name]
                );
              })
              // sort the modifiers by order
              .sort(function (a, b) {
                return a.order - b.order;
              });

            // modifiers have the ability to execute arbitrary code when Popper.js get inited
            // such code is executed in the same order of its modifier
            // they could add new properties to their options configuration
            // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
            this.modifiers.forEach(function (modifierOptions) {
              if (
                modifierOptions.enabled &&
                isFunction(modifierOptions.onLoad)
              ) {
                modifierOptions.onLoad(
                  _this.reference,
                  _this.popper,
                  _this.options,
                  modifierOptions,
                  _this.state
                );
              }
            });

            // fire the first update to position the popper in the right place
            this.update();

            var eventsEnabled = this.options.eventsEnabled;
            if (eventsEnabled) {
              // setup event listeners, they will take care of update the position in specific situations
              this.enableEventListeners();
            }

            this.state.eventsEnabled = eventsEnabled;
          }

          // We can't use class properties because they don't get listed in the
          // class prototype and break stuff like Sinon stubs

          createClass(Popper, [
            {
              key: "update",
              value: function update$$1() {
                return update.call(this);
              },
            },
            {
              key: "destroy",
              value: function destroy$$1() {
                return destroy.call(this);
              },
            },
            {
              key: "enableEventListeners",
              value: function enableEventListeners$$1() {
                return enableEventListeners.call(this);
              },
            },
            {
              key: "disableEventListeners",
              value: function disableEventListeners$$1() {
                return disableEventListeners.call(this);
              },

              /**
               * Schedules an update. It will run on the next UI update available.
               * @method scheduleUpdate
               * @memberof Popper
               */

              /**
               * Collection of utilities useful when writing custom modifiers.
               * Starting from version 1.7, this method is available only if you
               * include `popper-utils.js` before `popper.js`.
               *
               * **DEPRECATION**: This way to access PopperUtils is deprecated
               * and will be removed in v2! Use the PopperUtils module directly instead.
               * Due to the high instability of the methods contained in Utils, we can't
               * guarantee them to follow semver. Use them at your own risk!
               * @static
               * @private
               * @type {Object}
               * @deprecated since version 1.8
               * @member Utils
               * @memberof Popper
               */
            },
          ]);
          return Popper;
        })();

        /**
         * The `referenceObject` is an object that provides an interface compatible with Popper.js
         * and lets you use it as replacement of a real DOM node.<br />
         * You can use this method to position a popper relatively to a set of coordinates
         * in case you don't have a DOM node to use as reference.
         *
         * ```
         * new Popper(referenceObject, popperNode);
         * ```
         *
         * NB: This feature isn't supported in Internet Explorer 10.
         * @name referenceObject
         * @property {Function} data.getBoundingClientRect
         * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
         * @property {number} data.clientWidth
         * An ES6 getter that will return the width of the virtual reference element.
         * @property {number} data.clientHeight
         * An ES6 getter that will return the height of the virtual reference element.
         */

        Popper.Utils = (
          typeof window !== "undefined" ? window : __webpack_require__.g
        ).PopperUtils;
        Popper.placements = placements;
        Popper.Defaults = Defaults;

        /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Popper;
        //# sourceMappingURL=popper.js.map

        /***/
      },

    /***/ "./node_modules/popper.js/dist/popper.js":
      /*!***********************************************!*\
  !*** ./node_modules/popper.js/dist/popper.js ***!
  \***********************************************/
      /***/ (
        __unused_webpack_module,
        __webpack_exports__,
        __webpack_require__
      ) => {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony export */ __webpack_require__.d(__webpack_exports__, {
          /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
          /* harmony export */
        });
        /**!
         * @fileOverview Kickass library to create and place poppers near their reference elements.
         * @version 1.16.1
         * @license
         * Copyright (c) 2016 Federico Zivolo and contributors
         *
         * Permission is hereby granted, free of charge, to any person obtaining a copy
         * of this software and associated documentation files (the "Software"), to deal
         * in the Software without restriction, including without limitation the rights
         * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
         * copies of the Software, and to permit persons to whom the Software is
         * furnished to do so, subject to the following conditions:
         *
         * The above copyright notice and this permission notice shall be included in all
         * copies or substantial portions of the Software.
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
         * SOFTWARE.
         */
        var isBrowser =
          typeof window !== "undefined" &&
          typeof document !== "undefined" &&
          typeof navigator !== "undefined";

        const timeoutDuration = (function () {
          const longerTimeoutBrowsers = ["Edge", "Trident", "Firefox"];
          for (let i = 0; i < longerTimeoutBrowsers.length; i += 1) {
            if (
              isBrowser &&
              navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0
            ) {
              return 1;
            }
          }
          return 0;
        })();

        function microtaskDebounce(fn) {
          let called = false;
          return () => {
            if (called) {
              return;
            }
            called = true;
            window.Promise.resolve().then(() => {
              called = false;
              fn();
            });
          };
        }

        function taskDebounce(fn) {
          let scheduled = false;
          return () => {
            if (!scheduled) {
              scheduled = true;
              setTimeout(() => {
                scheduled = false;
                fn();
              }, timeoutDuration);
            }
          };
        }

        const supportsMicroTasks = isBrowser && window.Promise;

        /**
         * Create a debounced version of a method, that's asynchronously deferred
         * but called in the minimum time possible.
         *
         * @method
         * @memberof Popper.Utils
         * @argument {Function} fn
         * @returns {Function}
         */
        var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

        /**
         * Check if the given variable is a function
         * @method
         * @memberof Popper.Utils
         * @argument {Any} functionToCheck - variable to check
         * @returns {Boolean} answer to: is a function?
         */
        function isFunction(functionToCheck) {
          const getType = {};
          return (
            functionToCheck &&
            getType.toString.call(functionToCheck) === "[object Function]"
          );
        }

        /**
         * Get CSS computed property of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Eement} element
         * @argument {String} property
         */
        function getStyleComputedProperty(element, property) {
          if (element.nodeType !== 1) {
            return [];
          }
          // NOTE: 1 DOM access here
          const window = element.ownerDocument.defaultView;
          const css = window.getComputedStyle(element, null);
          return property ? css[property] : css;
        }

        /**
         * Returns the parentNode or the host of the element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} parent
         */
        function getParentNode(element) {
          if (element.nodeName === "HTML") {
            return element;
          }
          return element.parentNode || element.host;
        }

        /**
         * Returns the scrolling parent of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} scroll parent
         */
        function getScrollParent(element) {
          // Return body, `getScroll` will take care to get the correct `scrollTop` from it
          if (!element) {
            return document.body;
          }

          switch (element.nodeName) {
            case "HTML":
            case "BODY":
              return element.ownerDocument.body;
            case "#document":
              return element.body;
          }

          // Firefox want us to check `-x` and `-y` variations as well
          const { overflow, overflowX, overflowY } =
            getStyleComputedProperty(element);
          if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
            return element;
          }

          return getScrollParent(getParentNode(element));
        }

        /**
         * Returns the reference node of the reference object, or the reference object itself.
         * @method
         * @memberof Popper.Utils
         * @param {Element|Object} reference - the reference element (the popper will be relative to this)
         * @returns {Element} parent
         */
        function getReferenceNode(reference) {
          return reference && reference.referenceNode
            ? reference.referenceNode
            : reference;
        }

        const isIE11 =
          isBrowser && !!(window.MSInputMethodContext && document.documentMode);
        const isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

        /**
         * Determines if the browser is Internet Explorer
         * @method
         * @memberof Popper.Utils
         * @param {Number} version to check
         * @returns {Boolean} isIE
         */
        function isIE(version) {
          if (version === 11) {
            return isIE11;
          }
          if (version === 10) {
            return isIE10;
          }
          return isIE11 || isIE10;
        }

        /**
         * Returns the offset parent of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} offset parent
         */
        function getOffsetParent(element) {
          if (!element) {
            return document.documentElement;
          }

          const noOffsetParent = isIE(10) ? document.body : null;

          // NOTE: 1 DOM access here
          let offsetParent = element.offsetParent || null;
          // Skip hidden elements which don't have an offsetParent
          while (
            offsetParent === noOffsetParent &&
            element.nextElementSibling
          ) {
            offsetParent = (element = element.nextElementSibling).offsetParent;
          }

          const nodeName = offsetParent && offsetParent.nodeName;

          if (!nodeName || nodeName === "BODY" || nodeName === "HTML") {
            return element
              ? element.ownerDocument.documentElement
              : document.documentElement;
          }

          // .offsetParent will return the closest TH, TD or TABLE in case
          // no offsetParent is present, I hate this job...
          if (
            ["TH", "TD", "TABLE"].indexOf(offsetParent.nodeName) !== -1 &&
            getStyleComputedProperty(offsetParent, "position") === "static"
          ) {
            return getOffsetParent(offsetParent);
          }

          return offsetParent;
        }

        function isOffsetContainer(element) {
          const { nodeName } = element;
          if (nodeName === "BODY") {
            return false;
          }
          return (
            nodeName === "HTML" ||
            getOffsetParent(element.firstElementChild) === element
          );
        }

        /**
         * Finds the root node (document, shadowDOM root) of the given element
         * @method
         * @memberof Popper.Utils
         * @argument {Element} node
         * @returns {Element} root node
         */
        function getRoot(node) {
          if (node.parentNode !== null) {
            return getRoot(node.parentNode);
          }

          return node;
        }

        /**
         * Finds the offset parent common to the two provided nodes
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element1
         * @argument {Element} element2
         * @returns {Element} common offset parent
         */
        function findCommonOffsetParent(element1, element2) {
          // This check is needed to avoid errors in case one of the elements isn't defined for any reason
          if (
            !element1 ||
            !element1.nodeType ||
            !element2 ||
            !element2.nodeType
          ) {
            return document.documentElement;
          }

          // Here we make sure to give as "start" the element that comes first in the DOM
          const order =
            element1.compareDocumentPosition(element2) &
            Node.DOCUMENT_POSITION_FOLLOWING;
          const start = order ? element1 : element2;
          const end = order ? element2 : element1;

          // Get common ancestor container
          const range = document.createRange();
          range.setStart(start, 0);
          range.setEnd(end, 0);
          const { commonAncestorContainer } = range;

          // Both nodes are inside #document
          if (
            (element1 !== commonAncestorContainer &&
              element2 !== commonAncestorContainer) ||
            start.contains(end)
          ) {
            if (isOffsetContainer(commonAncestorContainer)) {
              return commonAncestorContainer;
            }

            return getOffsetParent(commonAncestorContainer);
          }

          // one of the nodes is inside shadowDOM, find which one
          const element1root = getRoot(element1);
          if (element1root.host) {
            return findCommonOffsetParent(element1root.host, element2);
          } else {
            return findCommonOffsetParent(element1, getRoot(element2).host);
          }
        }

        /**
         * Gets the scroll value of the given element in the given side (top and left)
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @argument {String} side `top` or `left`
         * @returns {number} amount of scrolled pixels
         */
        function getScroll(element, side = "top") {
          const upperSide = side === "top" ? "scrollTop" : "scrollLeft";
          const nodeName = element.nodeName;

          if (nodeName === "BODY" || nodeName === "HTML") {
            const html = element.ownerDocument.documentElement;
            const scrollingElement =
              element.ownerDocument.scrollingElement || html;
            return scrollingElement[upperSide];
          }

          return element[upperSide];
        }

        /*
         * Sum or subtract the element scroll values (left and top) from a given rect object
         * @method
         * @memberof Popper.Utils
         * @param {Object} rect - Rect object you want to change
         * @param {HTMLElement} element - The element from the function reads the scroll values
         * @param {Boolean} subtract - set to true if you want to subtract the scroll values
         * @return {Object} rect - The modifier rect object
         */
        function includeScroll(rect, element, subtract = false) {
          const scrollTop = getScroll(element, "top");
          const scrollLeft = getScroll(element, "left");
          const modifier = subtract ? -1 : 1;
          rect.top += scrollTop * modifier;
          rect.bottom += scrollTop * modifier;
          rect.left += scrollLeft * modifier;
          rect.right += scrollLeft * modifier;
          return rect;
        }

        /*
         * Helper to detect borders of a given element
         * @method
         * @memberof Popper.Utils
         * @param {CSSStyleDeclaration} styles
         * Result of `getStyleComputedProperty` on the given element
         * @param {String} axis - `x` or `y`
         * @return {number} borders - The borders size of the given axis
         */

        function getBordersSize(styles, axis) {
          const sideA = axis === "x" ? "Left" : "Top";
          const sideB = sideA === "Left" ? "Right" : "Bottom";

          return (
            parseFloat(styles[`border${sideA}Width`]) +
            parseFloat(styles[`border${sideB}Width`])
          );
        }

        function getSize(axis, body, html, computedStyle) {
          return Math.max(
            body[`offset${axis}`],
            body[`scroll${axis}`],
            html[`client${axis}`],
            html[`offset${axis}`],
            html[`scroll${axis}`],
            isIE(10)
              ? parseInt(html[`offset${axis}`]) +
                  parseInt(
                    computedStyle[`margin${axis === "Height" ? "Top" : "Left"}`]
                  ) +
                  parseInt(
                    computedStyle[
                      `margin${axis === "Height" ? "Bottom" : "Right"}`
                    ]
                  )
              : 0
          );
        }

        function getWindowSizes(document) {
          const body = document.body;
          const html = document.documentElement;
          const computedStyle = isIE(10) && getComputedStyle(html);

          return {
            height: getSize("Height", body, html, computedStyle),
            width: getSize("Width", body, html, computedStyle),
          };
        }

        var _extends =
          Object.assign ||
          function (target) {
            for (var i = 1; i < arguments.length; i++) {
              var source = arguments[i];

              for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                  target[key] = source[key];
                }
              }
            }

            return target;
          };

        /**
         * Given element offsets, generate an output similar to getBoundingClientRect
         * @method
         * @memberof Popper.Utils
         * @argument {Object} offsets
         * @returns {Object} ClientRect like output
         */
        function getClientRect(offsets) {
          return _extends({}, offsets, {
            right: offsets.left + offsets.width,
            bottom: offsets.top + offsets.height,
          });
        }

        /**
         * Get bounding client rect of given element
         * @method
         * @memberof Popper.Utils
         * @param {HTMLElement} element
         * @return {Object} client rect
         */
        function getBoundingClientRect(element) {
          let rect = {};

          // IE10 10 FIX: Please, don't ask, the element isn't
          // considered in DOM in some circumstances...
          // This isn't reproducible in IE10 compatibility mode of IE11
          try {
            if (isIE(10)) {
              rect = element.getBoundingClientRect();
              const scrollTop = getScroll(element, "top");
              const scrollLeft = getScroll(element, "left");
              rect.top += scrollTop;
              rect.left += scrollLeft;
              rect.bottom += scrollTop;
              rect.right += scrollLeft;
            } else {
              rect = element.getBoundingClientRect();
            }
          } catch (e) {}

          const result = {
            left: rect.left,
            top: rect.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top,
          };

          // subtract scrollbar size from sizes
          const sizes =
            element.nodeName === "HTML"
              ? getWindowSizes(element.ownerDocument)
              : {};
          const width = sizes.width || element.clientWidth || result.width;
          const height = sizes.height || element.clientHeight || result.height;

          let horizScrollbar = element.offsetWidth - width;
          let vertScrollbar = element.offsetHeight - height;

          // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
          // we make this check conditional for performance reasons
          if (horizScrollbar || vertScrollbar) {
            const styles = getStyleComputedProperty(element);
            horizScrollbar -= getBordersSize(styles, "x");
            vertScrollbar -= getBordersSize(styles, "y");

            result.width -= horizScrollbar;
            result.height -= vertScrollbar;
          }

          return getClientRect(result);
        }

        function getOffsetRectRelativeToArbitraryNode(
          children,
          parent,
          fixedPosition = false
        ) {
          const isIE10 = isIE(10);
          const isHTML = parent.nodeName === "HTML";
          const childrenRect = getBoundingClientRect(children);
          const parentRect = getBoundingClientRect(parent);
          const scrollParent = getScrollParent(children);

          const styles = getStyleComputedProperty(parent);
          const borderTopWidth = parseFloat(styles.borderTopWidth);
          const borderLeftWidth = parseFloat(styles.borderLeftWidth);

          // In cases where the parent is fixed, we must ignore negative scroll in offset calc
          if (fixedPosition && isHTML) {
            parentRect.top = Math.max(parentRect.top, 0);
            parentRect.left = Math.max(parentRect.left, 0);
          }
          let offsets = getClientRect({
            top: childrenRect.top - parentRect.top - borderTopWidth,
            left: childrenRect.left - parentRect.left - borderLeftWidth,
            width: childrenRect.width,
            height: childrenRect.height,
          });
          offsets.marginTop = 0;
          offsets.marginLeft = 0;

          // Subtract margins of documentElement in case it's being used as parent
          // we do this only on HTML because it's the only element that behaves
          // differently when margins are applied to it. The margins are included in
          // the box of the documentElement, in the other cases not.
          if (!isIE10 && isHTML) {
            const marginTop = parseFloat(styles.marginTop);
            const marginLeft = parseFloat(styles.marginLeft);

            offsets.top -= borderTopWidth - marginTop;
            offsets.bottom -= borderTopWidth - marginTop;
            offsets.left -= borderLeftWidth - marginLeft;
            offsets.right -= borderLeftWidth - marginLeft;

            // Attach marginTop and marginLeft because in some circumstances we may need them
            offsets.marginTop = marginTop;
            offsets.marginLeft = marginLeft;
          }

          if (
            isIE10 && !fixedPosition
              ? parent.contains(scrollParent)
              : parent === scrollParent && scrollParent.nodeName !== "BODY"
          ) {
            offsets = includeScroll(offsets, parent);
          }

          return offsets;
        }

        function getViewportOffsetRectRelativeToArtbitraryNode(
          element,
          excludeScroll = false
        ) {
          const html = element.ownerDocument.documentElement;
          const relativeOffset = getOffsetRectRelativeToArbitraryNode(
            element,
            html
          );
          const width = Math.max(html.clientWidth, window.innerWidth || 0);
          const height = Math.max(html.clientHeight, window.innerHeight || 0);

          const scrollTop = !excludeScroll ? getScroll(html) : 0;
          const scrollLeft = !excludeScroll ? getScroll(html, "left") : 0;

          const offset = {
            top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
            left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
            width,
            height,
          };

          return getClientRect(offset);
        }

        /**
         * Check if the given element is fixed or is inside a fixed parent
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @argument {Element} customContainer
         * @returns {Boolean} answer to "isFixed?"
         */
        function isFixed(element) {
          const nodeName = element.nodeName;
          if (nodeName === "BODY" || nodeName === "HTML") {
            return false;
          }
          if (getStyleComputedProperty(element, "position") === "fixed") {
            return true;
          }
          const parentNode = getParentNode(element);
          if (!parentNode) {
            return false;
          }
          return isFixed(parentNode);
        }

        /**
         * Finds the first parent of an element that has a transformed property defined
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Element} first transformed parent or documentElement
         */

        function getFixedPositionOffsetParent(element) {
          // This check is needed to avoid errors in case one of the elements isn't defined for any reason
          if (!element || !element.parentElement || isIE()) {
            return document.documentElement;
          }
          let el = element.parentElement;
          while (el && getStyleComputedProperty(el, "transform") === "none") {
            el = el.parentElement;
          }
          return el || document.documentElement;
        }

        /**
         * Computed the boundaries limits and return them
         * @method
         * @memberof Popper.Utils
         * @param {HTMLElement} popper
         * @param {HTMLElement} reference
         * @param {number} padding
         * @param {HTMLElement} boundariesElement - Element used to define the boundaries
         * @param {Boolean} fixedPosition - Is in fixed position mode
         * @returns {Object} Coordinates of the boundaries
         */
        function getBoundaries(
          popper,
          reference,
          padding,
          boundariesElement,
          fixedPosition = false
        ) {
          // NOTE: 1 DOM access here

          let boundaries = { top: 0, left: 0 };
          const offsetParent = fixedPosition
            ? getFixedPositionOffsetParent(popper)
            : findCommonOffsetParent(popper, getReferenceNode(reference));

          // Handle viewport case
          if (boundariesElement === "viewport") {
            boundaries = getViewportOffsetRectRelativeToArtbitraryNode(
              offsetParent,
              fixedPosition
            );
          } else {
            // Handle other cases based on DOM element used as boundaries
            let boundariesNode;
            if (boundariesElement === "scrollParent") {
              boundariesNode = getScrollParent(getParentNode(reference));
              if (boundariesNode.nodeName === "BODY") {
                boundariesNode = popper.ownerDocument.documentElement;
              }
            } else if (boundariesElement === "window") {
              boundariesNode = popper.ownerDocument.documentElement;
            } else {
              boundariesNode = boundariesElement;
            }

            const offsets = getOffsetRectRelativeToArbitraryNode(
              boundariesNode,
              offsetParent,
              fixedPosition
            );

            // In case of HTML, we need a different computation
            if (boundariesNode.nodeName === "HTML" && !isFixed(offsetParent)) {
              const { height, width } = getWindowSizes(popper.ownerDocument);
              boundaries.top += offsets.top - offsets.marginTop;
              boundaries.bottom = height + offsets.top;
              boundaries.left += offsets.left - offsets.marginLeft;
              boundaries.right = width + offsets.left;
            } else {
              // for all the other DOM elements, this one is good
              boundaries = offsets;
            }
          }

          // Add paddings
          padding = padding || 0;
          const isPaddingNumber = typeof padding === "number";
          boundaries.left += isPaddingNumber ? padding : padding.left || 0;
          boundaries.top += isPaddingNumber ? padding : padding.top || 0;
          boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
          boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

          return boundaries;
        }

        function getArea({ width, height }) {
          return width * height;
        }

        /**
         * Utility used to transform the `auto` placement to the placement with more
         * available space.
         * @method
         * @memberof Popper.Utils
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function computeAutoPlacement(
          placement,
          refRect,
          popper,
          reference,
          boundariesElement,
          padding = 0
        ) {
          if (placement.indexOf("auto") === -1) {
            return placement;
          }

          const boundaries = getBoundaries(
            popper,
            reference,
            padding,
            boundariesElement
          );

          const rects = {
            top: {
              width: boundaries.width,
              height: refRect.top - boundaries.top,
            },
            right: {
              width: boundaries.right - refRect.right,
              height: boundaries.height,
            },
            bottom: {
              width: boundaries.width,
              height: boundaries.bottom - refRect.bottom,
            },
            left: {
              width: refRect.left - boundaries.left,
              height: boundaries.height,
            },
          };

          const sortedAreas = Object.keys(rects)
            .map((key) =>
              _extends(
                {
                  key,
                },
                rects[key],
                {
                  area: getArea(rects[key]),
                }
              )
            )
            .sort((a, b) => b.area - a.area);

          const filteredAreas = sortedAreas.filter(
            ({ width, height }) =>
              width >= popper.clientWidth && height >= popper.clientHeight
          );

          const computedPlacement =
            filteredAreas.length > 0
              ? filteredAreas[0].key
              : sortedAreas[0].key;

          const variation = placement.split("-")[1];

          return computedPlacement + (variation ? `-${variation}` : "");
        }

        /**
         * Get offsets to the reference element
         * @method
         * @memberof Popper.Utils
         * @param {Object} state
         * @param {Element} popper - the popper element
         * @param {Element} reference - the reference element (the popper will be relative to this)
         * @param {Element} fixedPosition - is in fixed position mode
         * @returns {Object} An object containing the offsets which will be applied to the popper
         */
        function getReferenceOffsets(
          state,
          popper,
          reference,
          fixedPosition = null
        ) {
          const commonOffsetParent = fixedPosition
            ? getFixedPositionOffsetParent(popper)
            : findCommonOffsetParent(popper, getReferenceNode(reference));
          return getOffsetRectRelativeToArbitraryNode(
            reference,
            commonOffsetParent,
            fixedPosition
          );
        }

        /**
         * Get the outer sizes of the given element (offset size + margins)
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element
         * @returns {Object} object containing width and height properties
         */
        function getOuterSizes(element) {
          const window = element.ownerDocument.defaultView;
          const styles = window.getComputedStyle(element);
          const x =
            parseFloat(styles.marginTop || 0) +
            parseFloat(styles.marginBottom || 0);
          const y =
            parseFloat(styles.marginLeft || 0) +
            parseFloat(styles.marginRight || 0);
          const result = {
            width: element.offsetWidth + y,
            height: element.offsetHeight + x,
          };
          return result;
        }

        /**
         * Get the opposite placement of the given one
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement
         * @returns {String} flipped placement
         */
        function getOppositePlacement(placement) {
          const hash = {
            left: "right",
            right: "left",
            bottom: "top",
            top: "bottom",
          };
          return placement.replace(
            /left|right|bottom|top/g,
            (matched) => hash[matched]
          );
        }

        /**
         * Get offsets to the popper
         * @method
         * @memberof Popper.Utils
         * @param {Object} position - CSS position the Popper will get applied
         * @param {HTMLElement} popper - the popper element
         * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
         * @param {String} placement - one of the valid placement options
         * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
         */
        function getPopperOffsets(popper, referenceOffsets, placement) {
          placement = placement.split("-")[0];

          // Get popper node sizes
          const popperRect = getOuterSizes(popper);

          // Add position, width and height to our offsets object
          const popperOffsets = {
            width: popperRect.width,
            height: popperRect.height,
          };

          // depending by the popper placement we have to compute its offsets slightly differently
          const isHoriz = ["right", "left"].indexOf(placement) !== -1;
          const mainSide = isHoriz ? "top" : "left";
          const secondarySide = isHoriz ? "left" : "top";
          const measurement = isHoriz ? "height" : "width";
          const secondaryMeasurement = !isHoriz ? "height" : "width";

          popperOffsets[mainSide] =
            referenceOffsets[mainSide] +
            referenceOffsets[measurement] / 2 -
            popperRect[measurement] / 2;
          if (placement === secondarySide) {
            popperOffsets[secondarySide] =
              referenceOffsets[secondarySide] -
              popperRect[secondaryMeasurement];
          } else {
            popperOffsets[secondarySide] =
              referenceOffsets[getOppositePlacement(secondarySide)];
          }

          return popperOffsets;
        }

        /**
         * Mimics the `find` method of Array
         * @method
         * @memberof Popper.Utils
         * @argument {Array} arr
         * @argument prop
         * @argument value
         * @returns index or -1
         */
        function find(arr, check) {
          // use native find if supported
          if (Array.prototype.find) {
            return arr.find(check);
          }

          // use `filter` to obtain the same behavior of `find`
          return arr.filter(check)[0];
        }

        /**
         * Return the index of the matching object
         * @method
         * @memberof Popper.Utils
         * @argument {Array} arr
         * @argument prop
         * @argument value
         * @returns index or -1
         */
        function findIndex(arr, prop, value) {
          // use native findIndex if supported
          if (Array.prototype.findIndex) {
            return arr.findIndex((cur) => cur[prop] === value);
          }

          // use `find` + `indexOf` if `findIndex` isn't supported
          const match = find(arr, (obj) => obj[prop] === value);
          return arr.indexOf(match);
        }

        /**
         * Loop trough the list of modifiers and run them in order,
         * each of them will then edit the data object.
         * @method
         * @memberof Popper.Utils
         * @param {dataObject} data
         * @param {Array} modifiers
         * @param {String} ends - Optional modifier name used as stopper
         * @returns {dataObject}
         */
        function runModifiers(modifiers, data, ends) {
          const modifiersToRun =
            ends === undefined
              ? modifiers
              : modifiers.slice(0, findIndex(modifiers, "name", ends));

          modifiersToRun.forEach((modifier) => {
            if (modifier["function"]) {
              // eslint-disable-line dot-notation
              console.warn(
                "`modifier.function` is deprecated, use `modifier.fn`!"
              );
            }
            const fn = modifier["function"] || modifier.fn; // eslint-disable-line dot-notation
            if (modifier.enabled && isFunction(fn)) {
              // Add properties to offsets to make them a complete clientRect object
              // we do this before each modifier to make sure the previous one doesn't
              // mess with these values
              data.offsets.popper = getClientRect(data.offsets.popper);
              data.offsets.reference = getClientRect(data.offsets.reference);

              data = fn(data, modifier);
            }
          });

          return data;
        }

        /**
         * Updates the position of the popper, computing the new offsets and applying
         * the new style.<br />
         * Prefer `scheduleUpdate` over `update` because of performance reasons.
         * @method
         * @memberof Popper
         */
        function update() {
          // if popper is destroyed, don't perform any further update
          if (this.state.isDestroyed) {
            return;
          }

          let data = {
            instance: this,
            styles: {},
            arrowStyles: {},
            attributes: {},
            flipped: false,
            offsets: {},
          };

          // compute reference element offsets
          data.offsets.reference = getReferenceOffsets(
            this.state,
            this.popper,
            this.reference,
            this.options.positionFixed
          );

          // compute auto placement, store placement inside the data object,
          // modifiers will be able to edit `placement` if needed
          // and refer to originalPlacement to know the original value
          data.placement = computeAutoPlacement(
            this.options.placement,
            data.offsets.reference,
            this.popper,
            this.reference,
            this.options.modifiers.flip.boundariesElement,
            this.options.modifiers.flip.padding
          );

          // store the computed placement inside `originalPlacement`
          data.originalPlacement = data.placement;

          data.positionFixed = this.options.positionFixed;

          // compute the popper offsets
          data.offsets.popper = getPopperOffsets(
            this.popper,
            data.offsets.reference,
            data.placement
          );

          data.offsets.popper.position = this.options.positionFixed
            ? "fixed"
            : "absolute";

          // run the modifiers
          data = runModifiers(this.modifiers, data);

          // the first `update` will call `onCreate` callback
          // the other ones will call `onUpdate` callback
          if (!this.state.isCreated) {
            this.state.isCreated = true;
            this.options.onCreate(data);
          } else {
            this.options.onUpdate(data);
          }
        }

        /**
         * Helper used to know if the given modifier is enabled.
         * @method
         * @memberof Popper.Utils
         * @returns {Boolean}
         */
        function isModifierEnabled(modifiers, modifierName) {
          return modifiers.some(
            ({ name, enabled }) => enabled && name === modifierName
          );
        }

        /**
         * Get the prefixed supported property name
         * @method
         * @memberof Popper.Utils
         * @argument {String} property (camelCase)
         * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
         */
        function getSupportedPropertyName(property) {
          const prefixes = [false, "ms", "Webkit", "Moz", "O"];
          const upperProp =
            property.charAt(0).toUpperCase() + property.slice(1);

          for (let i = 0; i < prefixes.length; i++) {
            const prefix = prefixes[i];
            const toCheck = prefix ? `${prefix}${upperProp}` : property;
            if (typeof document.body.style[toCheck] !== "undefined") {
              return toCheck;
            }
          }
          return null;
        }

        /**
         * Destroys the popper.
         * @method
         * @memberof Popper
         */
        function destroy() {
          this.state.isDestroyed = true;

          // touch DOM only if `applyStyle` modifier is enabled
          if (isModifierEnabled(this.modifiers, "applyStyle")) {
            this.popper.removeAttribute("x-placement");
            this.popper.style.position = "";
            this.popper.style.top = "";
            this.popper.style.left = "";
            this.popper.style.right = "";
            this.popper.style.bottom = "";
            this.popper.style.willChange = "";
            this.popper.style[getSupportedPropertyName("transform")] = "";
          }

          this.disableEventListeners();

          // remove the popper if user explicitly asked for the deletion on destroy
          // do not use `remove` because IE11 doesn't support it
          if (this.options.removeOnDestroy) {
            this.popper.parentNode.removeChild(this.popper);
          }
          return this;
        }

        /**
         * Get the window associated with the element
         * @argument {Element} element
         * @returns {Window}
         */
        function getWindow(element) {
          const ownerDocument = element.ownerDocument;
          return ownerDocument ? ownerDocument.defaultView : window;
        }

        function attachToScrollParents(
          scrollParent,
          event,
          callback,
          scrollParents
        ) {
          const isBody = scrollParent.nodeName === "BODY";
          const target = isBody
            ? scrollParent.ownerDocument.defaultView
            : scrollParent;
          target.addEventListener(event, callback, { passive: true });

          if (!isBody) {
            attachToScrollParents(
              getScrollParent(target.parentNode),
              event,
              callback,
              scrollParents
            );
          }
          scrollParents.push(target);
        }

        /**
         * Setup needed event listeners used to update the popper position
         * @method
         * @memberof Popper.Utils
         * @private
         */
        function setupEventListeners(reference, options, state, updateBound) {
          // Resize event listener on window
          state.updateBound = updateBound;
          getWindow(reference).addEventListener("resize", state.updateBound, {
            passive: true,
          });

          // Scroll event listener on scroll parents
          const scrollElement = getScrollParent(reference);
          attachToScrollParents(
            scrollElement,
            "scroll",
            state.updateBound,
            state.scrollParents
          );
          state.scrollElement = scrollElement;
          state.eventsEnabled = true;

          return state;
        }

        /**
         * It will add resize/scroll events and start recalculating
         * position of the popper element when they are triggered.
         * @method
         * @memberof Popper
         */
        function enableEventListeners() {
          if (!this.state.eventsEnabled) {
            this.state = setupEventListeners(
              this.reference,
              this.options,
              this.state,
              this.scheduleUpdate
            );
          }
        }

        /**
         * Remove event listeners used to update the popper position
         * @method
         * @memberof Popper.Utils
         * @private
         */
        function removeEventListeners(reference, state) {
          // Remove resize event listener on window
          getWindow(reference).removeEventListener("resize", state.updateBound);

          // Remove scroll event listener on scroll parents
          state.scrollParents.forEach((target) => {
            target.removeEventListener("scroll", state.updateBound);
          });

          // Reset state
          state.updateBound = null;
          state.scrollParents = [];
          state.scrollElement = null;
          state.eventsEnabled = false;
          return state;
        }

        /**
         * It will remove resize/scroll events and won't recalculate popper position
         * when they are triggered. It also won't trigger `onUpdate` callback anymore,
         * unless you call `update` method manually.
         * @method
         * @memberof Popper
         */
        function disableEventListeners() {
          if (this.state.eventsEnabled) {
            cancelAnimationFrame(this.scheduleUpdate);
            this.state = removeEventListeners(this.reference, this.state);
          }
        }

        /**
         * Tells if a given input is a number
         * @method
         * @memberof Popper.Utils
         * @param {*} input to check
         * @return {Boolean}
         */
        function isNumeric(n) {
          return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
        }

        /**
         * Set the style to the given popper
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element - Element to apply the style to
         * @argument {Object} styles
         * Object with a list of properties and values which will be applied to the element
         */
        function setStyles(element, styles) {
          Object.keys(styles).forEach((prop) => {
            let unit = "";
            // add unit if the value is numeric and is one of the following
            if (
              ["width", "height", "top", "right", "bottom", "left"].indexOf(
                prop
              ) !== -1 &&
              isNumeric(styles[prop])
            ) {
              unit = "px";
            }
            element.style[prop] = styles[prop] + unit;
          });
        }

        /**
         * Set the attributes to the given popper
         * @method
         * @memberof Popper.Utils
         * @argument {Element} element - Element to apply the attributes to
         * @argument {Object} styles
         * Object with a list of properties and values which will be applied to the element
         */
        function setAttributes(element, attributes) {
          Object.keys(attributes).forEach(function (prop) {
            const value = attributes[prop];
            if (value !== false) {
              element.setAttribute(prop, attributes[prop]);
            } else {
              element.removeAttribute(prop);
            }
          });
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} data.styles - List of style properties - values to apply to popper element
         * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The same data object
         */
        function applyStyle(data) {
          // any property present in `data.styles` will be applied to the popper,
          // in this way we can make the 3rd party modifiers add custom styles to it
          // Be aware, modifiers could override the properties defined in the previous
          // lines of this modifier!
          setStyles(data.instance.popper, data.styles);

          // any property present in `data.attributes` will be applied to the popper,
          // they will be set as HTML attributes of the element
          setAttributes(data.instance.popper, data.attributes);

          // if arrowElement is defined and arrowStyles has some properties
          if (data.arrowElement && Object.keys(data.arrowStyles).length) {
            setStyles(data.arrowElement, data.arrowStyles);
          }

          return data;
        }

        /**
         * Set the x-placement attribute before everything else because it could be used
         * to add margins to the popper margins needs to be calculated to get the
         * correct popper offsets.
         * @method
         * @memberof Popper.modifiers
         * @param {HTMLElement} reference - The reference element used to position the popper
         * @param {HTMLElement} popper - The HTML element used as popper
         * @param {Object} options - Popper.js options
         */
        function applyStyleOnLoad(
          reference,
          popper,
          options,
          modifierOptions,
          state
        ) {
          // compute reference element offsets
          const referenceOffsets = getReferenceOffsets(
            state,
            popper,
            reference,
            options.positionFixed
          );

          // compute auto placement, store placement inside the data object,
          // modifiers will be able to edit `placement` if needed
          // and refer to originalPlacement to know the original value
          const placement = computeAutoPlacement(
            options.placement,
            referenceOffsets,
            popper,
            reference,
            options.modifiers.flip.boundariesElement,
            options.modifiers.flip.padding
          );

          popper.setAttribute("x-placement", placement);

          // Apply `position` to popper before anything else because
          // without the position applied we can't guarantee correct computations
          setStyles(popper, {
            position: options.positionFixed ? "fixed" : "absolute",
          });

          return options;
        }

        /**
         * @function
         * @memberof Popper.Utils
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Boolean} shouldRound - If the offsets should be rounded at all
         * @returns {Object} The popper's position offsets rounded
         *
         * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
         * good as it can be within reason.
         * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
         *
         * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
         * as well on High DPI screens).
         *
         * Firefox prefers no rounding for positioning and does not have blurriness on
         * high DPI screens.
         *
         * Only horizontal placement and left/right values need to be considered.
         */
        function getRoundedOffsets(data, shouldRound) {
          const { popper, reference } = data.offsets;
          const { round, floor } = Math;
          const noRound = (v) => v;

          const referenceWidth = round(reference.width);
          const popperWidth = round(popper.width);

          const isVertical = ["left", "right"].indexOf(data.placement) !== -1;
          const isVariation = data.placement.indexOf("-") !== -1;
          const sameWidthParity = referenceWidth % 2 === popperWidth % 2;
          const bothOddWidth =
            referenceWidth % 2 === 1 && popperWidth % 2 === 1;

          const horizontalToInteger = !shouldRound
            ? noRound
            : isVertical || isVariation || sameWidthParity
            ? round
            : floor;
          const verticalToInteger = !shouldRound ? noRound : round;

          return {
            left: horizontalToInteger(
              bothOddWidth && !isVariation && shouldRound
                ? popper.left - 1
                : popper.left
            ),
            top: verticalToInteger(popper.top),
            bottom: verticalToInteger(popper.bottom),
            right: horizontalToInteger(popper.right),
          };
        }

        const isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function computeStyle(data, options) {
          const { x, y } = options;
          const { popper } = data.offsets;

          // Remove this legacy support in Popper.js v2
          const legacyGpuAccelerationOption = find(
            data.instance.modifiers,
            (modifier) => modifier.name === "applyStyle"
          ).gpuAcceleration;
          if (legacyGpuAccelerationOption !== undefined) {
            console.warn(
              "WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!"
            );
          }
          const gpuAcceleration =
            legacyGpuAccelerationOption !== undefined
              ? legacyGpuAccelerationOption
              : options.gpuAcceleration;

          const offsetParent = getOffsetParent(data.instance.popper);
          const offsetParentRect = getBoundingClientRect(offsetParent);

          // Styles
          const styles = {
            position: popper.position,
          };

          const offsets = getRoundedOffsets(
            data,
            window.devicePixelRatio < 2 || !isFirefox
          );

          const sideA = x === "bottom" ? "top" : "bottom";
          const sideB = y === "right" ? "left" : "right";

          // if gpuAcceleration is set to `true` and transform is supported,
          //  we use `translate3d` to apply the position to the popper we
          // automatically use the supported prefixed version if needed
          const prefixedProperty = getSupportedPropertyName("transform");

          // now, let's make a step back and look at this code closely (wtf?)
          // If the content of the popper grows once it's been positioned, it
          // may happen that the popper gets misplaced because of the new content
          // overflowing its reference element
          // To avoid this problem, we provide two options (x and y), which allow
          // the consumer to define the offset origin.
          // If we position a popper on top of a reference element, we can set
          // `x` to `top` to make the popper grow towards its top instead of
          // its bottom.
          let left, top;
          if (sideA === "bottom") {
            // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
            // and not the bottom of the html element
            if (offsetParent.nodeName === "HTML") {
              top = -offsetParent.clientHeight + offsets.bottom;
            } else {
              top = -offsetParentRect.height + offsets.bottom;
            }
          } else {
            top = offsets.top;
          }
          if (sideB === "right") {
            if (offsetParent.nodeName === "HTML") {
              left = -offsetParent.clientWidth + offsets.right;
            } else {
              left = -offsetParentRect.width + offsets.right;
            }
          } else {
            left = offsets.left;
          }
          if (gpuAcceleration && prefixedProperty) {
            styles[prefixedProperty] = `translate3d(${left}px, ${top}px, 0)`;
            styles[sideA] = 0;
            styles[sideB] = 0;
            styles.willChange = "transform";
          } else {
            // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
            const invertTop = sideA === "bottom" ? -1 : 1;
            const invertLeft = sideB === "right" ? -1 : 1;
            styles[sideA] = top * invertTop;
            styles[sideB] = left * invertLeft;
            styles.willChange = `${sideA}, ${sideB}`;
          }

          // Attributes
          const attributes = {
            "x-placement": data.placement,
          };

          // Update `data` attributes, styles and arrowStyles
          data.attributes = _extends({}, attributes, data.attributes);
          data.styles = _extends({}, styles, data.styles);
          data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

          return data;
        }

        /**
         * Helper used to know if the given modifier depends from another one.<br />
         * It checks if the needed modifier is listed and enabled.
         * @method
         * @memberof Popper.Utils
         * @param {Array} modifiers - list of modifiers
         * @param {String} requestingName - name of requesting modifier
         * @param {String} requestedName - name of requested modifier
         * @returns {Boolean}
         */
        function isModifierRequired(modifiers, requestingName, requestedName) {
          const requesting = find(
            modifiers,
            ({ name }) => name === requestingName
          );

          const isRequired =
            !!requesting &&
            modifiers.some((modifier) => {
              return (
                modifier.name === requestedName &&
                modifier.enabled &&
                modifier.order < requesting.order
              );
            });

          if (!isRequired) {
            const requesting = `\`${requestingName}\``;
            const requested = `\`${requestedName}\``;
            console.warn(
              `${requested} modifier is required by ${requesting} modifier in order to work, be sure to include it before ${requesting}!`
            );
          }
          return isRequired;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function arrow(data, options) {
          // arrow depends on keepTogether in order to work
          if (
            !isModifierRequired(
              data.instance.modifiers,
              "arrow",
              "keepTogether"
            )
          ) {
            return data;
          }

          let arrowElement = options.element;

          // if arrowElement is a string, suppose it's a CSS selector
          if (typeof arrowElement === "string") {
            arrowElement = data.instance.popper.querySelector(arrowElement);

            // if arrowElement is not found, don't run the modifier
            if (!arrowElement) {
              return data;
            }
          } else {
            // if the arrowElement isn't a query selector we must check that the
            // provided DOM node is child of its popper node
            if (!data.instance.popper.contains(arrowElement)) {
              console.warn(
                "WARNING: `arrow.element` must be child of its popper element!"
              );
              return data;
            }
          }

          const placement = data.placement.split("-")[0];
          const { popper, reference } = data.offsets;
          const isVertical = ["left", "right"].indexOf(placement) !== -1;

          const len = isVertical ? "height" : "width";
          const sideCapitalized = isVertical ? "Top" : "Left";
          const side = sideCapitalized.toLowerCase();
          const altSide = isVertical ? "left" : "top";
          const opSide = isVertical ? "bottom" : "right";
          const arrowElementSize = getOuterSizes(arrowElement)[len];

          //
          // extends keepTogether behavior making sure the popper and its
          // reference have enough pixels in conjunction
          //

          // top/left side
          if (reference[opSide] - arrowElementSize < popper[side]) {
            data.offsets.popper[side] -=
              popper[side] - (reference[opSide] - arrowElementSize);
          }
          // bottom/right side
          if (reference[side] + arrowElementSize > popper[opSide]) {
            data.offsets.popper[side] +=
              reference[side] + arrowElementSize - popper[opSide];
          }
          data.offsets.popper = getClientRect(data.offsets.popper);

          // compute center of the popper
          const center =
            reference[side] + reference[len] / 2 - arrowElementSize / 2;

          // Compute the sideValue using the updated popper offsets
          // take popper margin in account because we don't have this info available
          const css = getStyleComputedProperty(data.instance.popper);
          const popperMarginSide = parseFloat(css[`margin${sideCapitalized}`]);
          const popperBorderSide = parseFloat(
            css[`border${sideCapitalized}Width`]
          );
          let sideValue =
            center -
            data.offsets.popper[side] -
            popperMarginSide -
            popperBorderSide;

          // prevent arrowElement from being placed not contiguously to its popper
          sideValue = Math.max(
            Math.min(popper[len] - arrowElementSize, sideValue),
            0
          );

          data.arrowElement = arrowElement;
          data.offsets.arrow = {
            [side]: Math.round(sideValue),
            [altSide]: "", // make sure to unset any eventual altSide value from the DOM node
          };

          return data;
        }

        /**
         * Get the opposite placement variation of the given one
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement variation
         * @returns {String} flipped placement variation
         */
        function getOppositeVariation(variation) {
          if (variation === "end") {
            return "start";
          } else if (variation === "start") {
            return "end";
          }
          return variation;
        }

        /**
         * List of accepted placements to use as values of the `placement` option.<br />
         * Valid placements are:
         * - `auto`
         * - `top`
         * - `right`
         * - `bottom`
         * - `left`
         *
         * Each placement can have a variation from this list:
         * - `-start`
         * - `-end`
         *
         * Variations are interpreted easily if you think of them as the left to right
         * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
         * is right.<br />
         * Vertically (`left` and `right`), `start` is top and `end` is bottom.
         *
         * Some valid examples are:
         * - `top-end` (on top of reference, right aligned)
         * - `right-start` (on right of reference, top aligned)
         * - `bottom` (on bottom, centered)
         * - `auto-end` (on the side with more space available, alignment depends by placement)
         *
         * @static
         * @type {Array}
         * @enum {String}
         * @readonly
         * @method placements
         * @memberof Popper
         */
        var placements = [
          "auto-start",
          "auto",
          "auto-end",
          "top-start",
          "top",
          "top-end",
          "right-start",
          "right",
          "right-end",
          "bottom-end",
          "bottom",
          "bottom-start",
          "left-end",
          "left",
          "left-start",
        ];

        // Get rid of `auto` `auto-start` and `auto-end`
        const validPlacements = placements.slice(3);

        /**
         * Given an initial placement, returns all the subsequent placements
         * clockwise (or counter-clockwise).
         *
         * @method
         * @memberof Popper.Utils
         * @argument {String} placement - A valid placement (it accepts variations)
         * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
         * @returns {Array} placements including their variations
         */
        function clockwise(placement, counter = false) {
          const index = validPlacements.indexOf(placement);
          const arr = validPlacements
            .slice(index + 1)
            .concat(validPlacements.slice(0, index));
          return counter ? arr.reverse() : arr;
        }

        const BEHAVIORS = {
          FLIP: "flip",
          CLOCKWISE: "clockwise",
          COUNTERCLOCKWISE: "counterclockwise",
        };

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function flip(data, options) {
          // if `inner` modifier is enabled, we can't use the `flip` modifier
          if (isModifierEnabled(data.instance.modifiers, "inner")) {
            return data;
          }

          if (data.flipped && data.placement === data.originalPlacement) {
            // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
            return data;
          }

          const boundaries = getBoundaries(
            data.instance.popper,
            data.instance.reference,
            options.padding,
            options.boundariesElement,
            data.positionFixed
          );

          let placement = data.placement.split("-")[0];
          let placementOpposite = getOppositePlacement(placement);
          let variation = data.placement.split("-")[1] || "";

          let flipOrder = [];

          switch (options.behavior) {
            case BEHAVIORS.FLIP:
              flipOrder = [placement, placementOpposite];
              break;
            case BEHAVIORS.CLOCKWISE:
              flipOrder = clockwise(placement);
              break;
            case BEHAVIORS.COUNTERCLOCKWISE:
              flipOrder = clockwise(placement, true);
              break;
            default:
              flipOrder = options.behavior;
          }

          flipOrder.forEach((step, index) => {
            if (placement !== step || flipOrder.length === index + 1) {
              return data;
            }

            placement = data.placement.split("-")[0];
            placementOpposite = getOppositePlacement(placement);

            const popperOffsets = data.offsets.popper;
            const refOffsets = data.offsets.reference;

            // using floor because the reference offsets may contain decimals we are not going to consider here
            const floor = Math.floor;
            const overlapsRef =
              (placement === "left" &&
                floor(popperOffsets.right) > floor(refOffsets.left)) ||
              (placement === "right" &&
                floor(popperOffsets.left) < floor(refOffsets.right)) ||
              (placement === "top" &&
                floor(popperOffsets.bottom) > floor(refOffsets.top)) ||
              (placement === "bottom" &&
                floor(popperOffsets.top) < floor(refOffsets.bottom));

            const overflowsLeft =
              floor(popperOffsets.left) < floor(boundaries.left);
            const overflowsRight =
              floor(popperOffsets.right) > floor(boundaries.right);
            const overflowsTop =
              floor(popperOffsets.top) < floor(boundaries.top);
            const overflowsBottom =
              floor(popperOffsets.bottom) > floor(boundaries.bottom);

            const overflowsBoundaries =
              (placement === "left" && overflowsLeft) ||
              (placement === "right" && overflowsRight) ||
              (placement === "top" && overflowsTop) ||
              (placement === "bottom" && overflowsBottom);

            // flip the variation if required
            const isVertical = ["top", "bottom"].indexOf(placement) !== -1;

            // flips variation if reference element overflows boundaries
            const flippedVariationByRef =
              !!options.flipVariations &&
              ((isVertical && variation === "start" && overflowsLeft) ||
                (isVertical && variation === "end" && overflowsRight) ||
                (!isVertical && variation === "start" && overflowsTop) ||
                (!isVertical && variation === "end" && overflowsBottom));

            // flips variation if popper content overflows boundaries
            const flippedVariationByContent =
              !!options.flipVariationsByContent &&
              ((isVertical && variation === "start" && overflowsRight) ||
                (isVertical && variation === "end" && overflowsLeft) ||
                (!isVertical && variation === "start" && overflowsBottom) ||
                (!isVertical && variation === "end" && overflowsTop));

            const flippedVariation =
              flippedVariationByRef || flippedVariationByContent;

            if (overlapsRef || overflowsBoundaries || flippedVariation) {
              // this boolean to detect any flip loop
              data.flipped = true;

              if (overlapsRef || overflowsBoundaries) {
                placement = flipOrder[index + 1];
              }

              if (flippedVariation) {
                variation = getOppositeVariation(variation);
              }

              data.placement = placement + (variation ? "-" + variation : "");

              // this object contains `position`, we want to preserve it along with
              // any additional property we may add in the future
              data.offsets.popper = _extends(
                {},
                data.offsets.popper,
                getPopperOffsets(
                  data.instance.popper,
                  data.offsets.reference,
                  data.placement
                )
              );

              data = runModifiers(data.instance.modifiers, data, "flip");
            }
          });
          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function keepTogether(data) {
          const { popper, reference } = data.offsets;
          const placement = data.placement.split("-")[0];
          const floor = Math.floor;
          const isVertical = ["top", "bottom"].indexOf(placement) !== -1;
          const side = isVertical ? "right" : "bottom";
          const opSide = isVertical ? "left" : "top";
          const measurement = isVertical ? "width" : "height";

          if (popper[side] < floor(reference[opSide])) {
            data.offsets.popper[opSide] =
              floor(reference[opSide]) - popper[measurement];
          }
          if (popper[opSide] > floor(reference[side])) {
            data.offsets.popper[opSide] = floor(reference[side]);
          }

          return data;
        }

        /**
         * Converts a string containing value + unit into a px value number
         * @function
         * @memberof {modifiers~offset}
         * @private
         * @argument {String} str - Value + unit string
         * @argument {String} measurement - `height` or `width`
         * @argument {Object} popperOffsets
         * @argument {Object} referenceOffsets
         * @returns {Number|String}
         * Value in pixels, or original string if no values were extracted
         */
        function toValue(str, measurement, popperOffsets, referenceOffsets) {
          // separate value from unit
          const split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
          const value = +split[1];
          const unit = split[2];

          // If it's not a number it's an operator, I guess
          if (!value) {
            return str;
          }

          if (unit.indexOf("%") === 0) {
            let element;
            switch (unit) {
              case "%p":
                element = popperOffsets;
                break;
              case "%":
              case "%r":
              default:
                element = referenceOffsets;
            }

            const rect = getClientRect(element);
            return (rect[measurement] / 100) * value;
          } else if (unit === "vh" || unit === "vw") {
            // if is a vh or vw, we calculate the size based on the viewport
            let size;
            if (unit === "vh") {
              size = Math.max(
                document.documentElement.clientHeight,
                window.innerHeight || 0
              );
            } else {
              size = Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
              );
            }
            return (size / 100) * value;
          } else {
            // if is an explicit pixel unit, we get rid of the unit and keep the value
            // if is an implicit unit, it's px, and we return just the value
            return value;
          }
        }

        /**
         * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
         * @function
         * @memberof {modifiers~offset}
         * @private
         * @argument {String} offset
         * @argument {Object} popperOffsets
         * @argument {Object} referenceOffsets
         * @argument {String} basePlacement
         * @returns {Array} a two cells array with x and y offsets in numbers
         */
        function parseOffset(
          offset,
          popperOffsets,
          referenceOffsets,
          basePlacement
        ) {
          const offsets = [0, 0];

          // Use height if placement is left or right and index is 0 otherwise use width
          // in this way the first offset will use an axis and the second one
          // will use the other one
          const useHeight = ["right", "left"].indexOf(basePlacement) !== -1;

          // Split the offset string to obtain a list of values and operands
          // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
          const fragments = offset.split(/(\+|\-)/).map((frag) => frag.trim());

          // Detect if the offset string contains a pair of values or a single one
          // they could be separated by comma or space
          const divider = fragments.indexOf(
            find(fragments, (frag) => frag.search(/,|\s/) !== -1)
          );

          if (fragments[divider] && fragments[divider].indexOf(",") === -1) {
            console.warn(
              "Offsets separated by white space(s) are deprecated, use a comma (,) instead."
            );
          }

          // If divider is found, we divide the list of values and operands to divide
          // them by ofset X and Y.
          const splitRegex = /\s*,\s*|\s+/;
          let ops =
            divider !== -1
              ? [
                  fragments
                    .slice(0, divider)
                    .concat([fragments[divider].split(splitRegex)[0]]),
                  [fragments[divider].split(splitRegex)[1]].concat(
                    fragments.slice(divider + 1)
                  ),
                ]
              : [fragments];

          // Convert the values with units to absolute pixels to allow our computations
          ops = ops.map((op, index) => {
            // Most of the units rely on the orientation of the popper
            const measurement = (index === 1 ? !useHeight : useHeight)
              ? "height"
              : "width";
            let mergeWithPrevious = false;
            return (
              op
                // This aggregates any `+` or `-` sign that aren't considered operators
                // e.g.: 10 + +5 => [10, +, +5]
                .reduce((a, b) => {
                  if (a[a.length - 1] === "" && ["+", "-"].indexOf(b) !== -1) {
                    a[a.length - 1] = b;
                    mergeWithPrevious = true;
                    return a;
                  } else if (mergeWithPrevious) {
                    a[a.length - 1] += b;
                    mergeWithPrevious = false;
                    return a;
                  } else {
                    return a.concat(b);
                  }
                }, [])
                // Here we convert the string values into number values (in px)
                .map((str) =>
                  toValue(str, measurement, popperOffsets, referenceOffsets)
                )
            );
          });

          // Loop trough the offsets arrays and execute the operations
          ops.forEach((op, index) => {
            op.forEach((frag, index2) => {
              if (isNumeric(frag)) {
                offsets[index] += frag * (op[index2 - 1] === "-" ? -1 : 1);
              }
            });
          });
          return offsets;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @argument {Number|String} options.offset=0
         * The offset value as described in the modifier description
         * @returns {Object} The data object, properly modified
         */
        function offset(data, { offset }) {
          const {
            placement,
            offsets: { popper, reference },
          } = data;
          const basePlacement = placement.split("-")[0];

          let offsets;
          if (isNumeric(+offset)) {
            offsets = [+offset, 0];
          } else {
            offsets = parseOffset(offset, popper, reference, basePlacement);
          }

          if (basePlacement === "left") {
            popper.top += offsets[0];
            popper.left -= offsets[1];
          } else if (basePlacement === "right") {
            popper.top += offsets[0];
            popper.left += offsets[1];
          } else if (basePlacement === "top") {
            popper.left += offsets[0];
            popper.top -= offsets[1];
          } else if (basePlacement === "bottom") {
            popper.left += offsets[0];
            popper.top += offsets[1];
          }

          data.popper = popper;
          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function preventOverflow(data, options) {
          let boundariesElement =
            options.boundariesElement || getOffsetParent(data.instance.popper);

          // If offsetParent is the reference element, we really want to
          // go one step up and use the next offsetParent as reference to
          // avoid to make this modifier completely useless and look like broken
          if (data.instance.reference === boundariesElement) {
            boundariesElement = getOffsetParent(boundariesElement);
          }

          // NOTE: DOM access here
          // resets the popper's position so that the document size can be calculated excluding
          // the size of the popper element itself
          const transformProp = getSupportedPropertyName("transform");
          const popperStyles = data.instance.popper.style; // assignment to help minification
          const { top, left, [transformProp]: transform } = popperStyles;
          popperStyles.top = "";
          popperStyles.left = "";
          popperStyles[transformProp] = "";

          const boundaries = getBoundaries(
            data.instance.popper,
            data.instance.reference,
            options.padding,
            boundariesElement,
            data.positionFixed
          );

          // NOTE: DOM access here
          // restores the original style properties after the offsets have been computed
          popperStyles.top = top;
          popperStyles.left = left;
          popperStyles[transformProp] = transform;

          options.boundaries = boundaries;

          const order = options.priority;
          let popper = data.offsets.popper;

          const check = {
            primary(placement) {
              let value = popper[placement];
              if (
                popper[placement] < boundaries[placement] &&
                !options.escapeWithReference
              ) {
                value = Math.max(popper[placement], boundaries[placement]);
              }
              return { [placement]: value };
            },
            secondary(placement) {
              const mainSide = placement === "right" ? "left" : "top";
              let value = popper[mainSide];
              if (
                popper[placement] > boundaries[placement] &&
                !options.escapeWithReference
              ) {
                value = Math.min(
                  popper[mainSide],
                  boundaries[placement] -
                    (placement === "right" ? popper.width : popper.height)
                );
              }
              return { [mainSide]: value };
            },
          };

          order.forEach((placement) => {
            const side =
              ["left", "top"].indexOf(placement) !== -1
                ? "primary"
                : "secondary";
            popper = _extends({}, popper, check[side](placement));
          });

          data.offsets.popper = popper;

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function shift(data) {
          const placement = data.placement;
          const basePlacement = placement.split("-")[0];
          const shiftvariation = placement.split("-")[1];

          // if shift shiftvariation is specified, run the modifier
          if (shiftvariation) {
            const { reference, popper } = data.offsets;
            const isVertical = ["bottom", "top"].indexOf(basePlacement) !== -1;
            const side = isVertical ? "left" : "top";
            const measurement = isVertical ? "width" : "height";

            const shiftOffsets = {
              start: { [side]: reference[side] },
              end: {
                [side]:
                  reference[side] +
                  reference[measurement] -
                  popper[measurement],
              },
            };

            data.offsets.popper = _extends(
              {},
              popper,
              shiftOffsets[shiftvariation]
            );
          }

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by update method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function hide(data) {
          if (
            !isModifierRequired(
              data.instance.modifiers,
              "hide",
              "preventOverflow"
            )
          ) {
            return data;
          }

          const refRect = data.offsets.reference;
          const bound = find(
            data.instance.modifiers,
            (modifier) => modifier.name === "preventOverflow"
          ).boundaries;

          if (
            refRect.bottom < bound.top ||
            refRect.left > bound.right ||
            refRect.top > bound.bottom ||
            refRect.right < bound.left
          ) {
            // Avoid unnecessary DOM access if visibility hasn't changed
            if (data.hide === true) {
              return data;
            }

            data.hide = true;
            data.attributes["x-out-of-boundaries"] = "";
          } else {
            // Avoid unnecessary DOM access if visibility hasn't changed
            if (data.hide === false) {
              return data;
            }

            data.hide = false;
            data.attributes["x-out-of-boundaries"] = false;
          }

          return data;
        }

        /**
         * @function
         * @memberof Modifiers
         * @argument {Object} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {Object} The data object, properly modified
         */
        function inner(data) {
          const placement = data.placement;
          const basePlacement = placement.split("-")[0];
          const { popper, reference } = data.offsets;
          const isHoriz = ["left", "right"].indexOf(basePlacement) !== -1;

          const subtractLength = ["top", "left"].indexOf(basePlacement) === -1;

          popper[isHoriz ? "left" : "top"] =
            reference[basePlacement] -
            (subtractLength ? popper[isHoriz ? "width" : "height"] : 0);

          data.placement = getOppositePlacement(placement);
          data.offsets.popper = getClientRect(popper);

          return data;
        }

        /**
         * Modifier function, each modifier can have a function of this type assigned
         * to its `fn` property.<br />
         * These functions will be called on each update, this means that you must
         * make sure they are performant enough to avoid performance bottlenecks.
         *
         * @function ModifierFn
         * @argument {dataObject} data - The data object generated by `update` method
         * @argument {Object} options - Modifiers configuration and options
         * @returns {dataObject} The data object, properly modified
         */

        /**
         * Modifiers are plugins used to alter the behavior of your poppers.<br />
         * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
         * needed by the library.
         *
         * Usually you don't want to override the `order`, `fn` and `onLoad` props.
         * All the other properties are configurations that could be tweaked.
         * @namespace modifiers
         */
        var modifiers = {
          /**
           * Modifier used to shift the popper on the start or end of its reference
           * element.<br />
           * It will read the variation of the `placement` property.<br />
           * It can be one either `-end` or `-start`.
           * @memberof modifiers
           * @inner
           */
          shift: {
            /** @prop {number} order=100 - Index used to define the order of execution */
            order: 100,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: shift,
          },

          /**
           * The `offset` modifier can shift your popper on both its axis.
           *
           * It accepts the following units:
           * - `px` or unit-less, interpreted as pixels
           * - `%` or `%r`, percentage relative to the length of the reference element
           * - `%p`, percentage relative to the length of the popper element
           * - `vw`, CSS viewport width unit
           * - `vh`, CSS viewport height unit
           *
           * For length is intended the main axis relative to the placement of the popper.<br />
           * This means that if the placement is `top` or `bottom`, the length will be the
           * `width`. In case of `left` or `right`, it will be the `height`.
           *
           * You can provide a single value (as `Number` or `String`), or a pair of values
           * as `String` divided by a comma or one (or more) white spaces.<br />
           * The latter is a deprecated method because it leads to confusion and will be
           * removed in v2.<br />
           * Additionally, it accepts additions and subtractions between different units.
           * Note that multiplications and divisions aren't supported.
           *
           * Valid examples are:
           * ```
           * 10
           * '10%'
           * '10, 10'
           * '10%, 10'
           * '10 + 10%'
           * '10 - 5vh + 3%'
           * '-10px + 5vh, 5px - 6%'
           * ```
           * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
           * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
           * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
           *
           * @memberof modifiers
           * @inner
           */
          offset: {
            /** @prop {number} order=200 - Index used to define the order of execution */
            order: 200,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: offset,
            /** @prop {Number|String} offset=0
             * The offset value as described in the modifier description
             */
            offset: 0,
          },

          /**
           * Modifier used to prevent the popper from being positioned outside the boundary.
           *
           * A scenario exists where the reference itself is not within the boundaries.<br />
           * We can say it has "escaped the boundaries" — or just "escaped".<br />
           * In this case we need to decide whether the popper should either:
           *
           * - detach from the reference and remain "trapped" in the boundaries, or
           * - if it should ignore the boundary and "escape with its reference"
           *
           * When `escapeWithReference` is set to`true` and reference is completely
           * outside its boundaries, the popper will overflow (or completely leave)
           * the boundaries in order to remain attached to the edge of the reference.
           *
           * @memberof modifiers
           * @inner
           */
          preventOverflow: {
            /** @prop {number} order=300 - Index used to define the order of execution */
            order: 300,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: preventOverflow,
            /**
             * @prop {Array} [priority=['left','right','top','bottom']]
             * Popper will try to prevent overflow following these priorities by default,
             * then, it could overflow on the left and on top of the `boundariesElement`
             */
            priority: ["left", "right", "top", "bottom"],
            /**
             * @prop {number} padding=5
             * Amount of pixel used to define a minimum distance between the boundaries
             * and the popper. This makes sure the popper always has a little padding
             * between the edges of its container
             */
            padding: 5,
            /**
             * @prop {String|HTMLElement} boundariesElement='scrollParent'
             * Boundaries used by the modifier. Can be `scrollParent`, `window`,
             * `viewport` or any DOM element.
             */
            boundariesElement: "scrollParent",
          },

          /**
           * Modifier used to make sure the reference and its popper stay near each other
           * without leaving any gap between the two. Especially useful when the arrow is
           * enabled and you want to ensure that it points to its reference element.
           * It cares only about the first axis. You can still have poppers with margin
           * between the popper and its reference element.
           * @memberof modifiers
           * @inner
           */
          keepTogether: {
            /** @prop {number} order=400 - Index used to define the order of execution */
            order: 400,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: keepTogether,
          },

          /**
           * This modifier is used to move the `arrowElement` of the popper to make
           * sure it is positioned between the reference element and its popper element.
           * It will read the outer size of the `arrowElement` node to detect how many
           * pixels of conjunction are needed.
           *
           * It has no effect if no `arrowElement` is provided.
           * @memberof modifiers
           * @inner
           */
          arrow: {
            /** @prop {number} order=500 - Index used to define the order of execution */
            order: 500,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: arrow,
            /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
            element: "[x-arrow]",
          },

          /**
           * Modifier used to flip the popper's placement when it starts to overlap its
           * reference element.
           *
           * Requires the `preventOverflow` modifier before it in order to work.
           *
           * **NOTE:** this modifier will interrupt the current update cycle and will
           * restart it if it detects the need to flip the placement.
           * @memberof modifiers
           * @inner
           */
          flip: {
            /** @prop {number} order=600 - Index used to define the order of execution */
            order: 600,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: flip,
            /**
             * @prop {String|Array} behavior='flip'
             * The behavior used to change the popper's placement. It can be one of
             * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
             * placements (with optional variations)
             */
            behavior: "flip",
            /**
             * @prop {number} padding=5
             * The popper will flip if it hits the edges of the `boundariesElement`
             */
            padding: 5,
            /**
             * @prop {String|HTMLElement} boundariesElement='viewport'
             * The element which will define the boundaries of the popper position.
             * The popper will never be placed outside of the defined boundaries
             * (except if `keepTogether` is enabled)
             */
            boundariesElement: "viewport",
            /**
             * @prop {Boolean} flipVariations=false
             * The popper will switch placement variation between `-start` and `-end` when
             * the reference element overlaps its boundaries.
             *
             * The original placement should have a set variation.
             */
            flipVariations: false,
            /**
             * @prop {Boolean} flipVariationsByContent=false
             * The popper will switch placement variation between `-start` and `-end` when
             * the popper element overlaps its reference boundaries.
             *
             * The original placement should have a set variation.
             */
            flipVariationsByContent: false,
          },

          /**
           * Modifier used to make the popper flow toward the inner of the reference element.
           * By default, when this modifier is disabled, the popper will be placed outside
           * the reference element.
           * @memberof modifiers
           * @inner
           */
          inner: {
            /** @prop {number} order=700 - Index used to define the order of execution */
            order: 700,
            /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
            enabled: false,
            /** @prop {ModifierFn} */
            fn: inner,
          },

          /**
           * Modifier used to hide the popper when its reference element is outside of the
           * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
           * be used to hide with a CSS selector the popper when its reference is
           * out of boundaries.
           *
           * Requires the `preventOverflow` modifier before it in order to work.
           * @memberof modifiers
           * @inner
           */
          hide: {
            /** @prop {number} order=800 - Index used to define the order of execution */
            order: 800,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: hide,
          },

          /**
           * Computes the style that will be applied to the popper element to gets
           * properly positioned.
           *
           * Note that this modifier will not touch the DOM, it just prepares the styles
           * so that `applyStyle` modifier can apply it. This separation is useful
           * in case you need to replace `applyStyle` with a custom implementation.
           *
           * This modifier has `850` as `order` value to maintain backward compatibility
           * with previous versions of Popper.js. Expect the modifiers ordering method
           * to change in future major versions of the library.
           *
           * @memberof modifiers
           * @inner
           */
          computeStyle: {
            /** @prop {number} order=850 - Index used to define the order of execution */
            order: 850,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: computeStyle,
            /**
             * @prop {Boolean} gpuAcceleration=true
             * If true, it uses the CSS 3D transformation to position the popper.
             * Otherwise, it will use the `top` and `left` properties
             */
            gpuAcceleration: true,
            /**
             * @prop {string} [x='bottom']
             * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
             * Change this if your popper should grow in a direction different from `bottom`
             */
            x: "bottom",
            /**
             * @prop {string} [x='left']
             * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
             * Change this if your popper should grow in a direction different from `right`
             */
            y: "right",
          },

          /**
           * Applies the computed styles to the popper element.
           *
           * All the DOM manipulations are limited to this modifier. This is useful in case
           * you want to integrate Popper.js inside a framework or view library and you
           * want to delegate all the DOM manipulations to it.
           *
           * Note that if you disable this modifier, you must make sure the popper element
           * has its position set to `absolute` before Popper.js can do its work!
           *
           * Just disable this modifier and define your own to achieve the desired effect.
           *
           * @memberof modifiers
           * @inner
           */
          applyStyle: {
            /** @prop {number} order=900 - Index used to define the order of execution */
            order: 900,
            /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
            enabled: true,
            /** @prop {ModifierFn} */
            fn: applyStyle,
            /** @prop {Function} */
            onLoad: applyStyleOnLoad,
            /**
             * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
             * @prop {Boolean} gpuAcceleration=true
             * If true, it uses the CSS 3D transformation to position the popper.
             * Otherwise, it will use the `top` and `left` properties
             */
            gpuAcceleration: undefined,
          },
        };

        /**
         * The `dataObject` is an object containing all the information used by Popper.js.
         * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
         * @name dataObject
         * @property {Object} data.instance The Popper.js instance
         * @property {String} data.placement Placement applied to popper
         * @property {String} data.originalPlacement Placement originally defined on init
         * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
         * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
         * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
         * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
         * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
         * @property {Object} data.boundaries Offsets of the popper boundaries
         * @property {Object} data.offsets The measurements of popper, reference and arrow elements
         * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
         * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
         * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
         */

        /**
         * Default options provided to Popper.js constructor.<br />
         * These can be overridden using the `options` argument of Popper.js.<br />
         * To override an option, simply pass an object with the same
         * structure of the `options` object, as the 3rd argument. For example:
         * ```
         * new Popper(ref, pop, {
         *   modifiers: {
         *     preventOverflow: { enabled: false }
         *   }
         * })
         * ```
         * @type {Object}
         * @static
         * @memberof Popper
         */
        var Defaults = {
          /**
           * Popper's placement.
           * @prop {Popper.placements} placement='bottom'
           */
          placement: "bottom",

          /**
           * Set this to true if you want popper to position it self in 'fixed' mode
           * @prop {Boolean} positionFixed=false
           */
          positionFixed: false,

          /**
           * Whether events (resize, scroll) are initially enabled.
           * @prop {Boolean} eventsEnabled=true
           */
          eventsEnabled: true,

          /**
           * Set to true if you want to automatically remove the popper when
           * you call the `destroy` method.
           * @prop {Boolean} removeOnDestroy=false
           */
          removeOnDestroy: false,

          /**
           * Callback called when the popper is created.<br />
           * By default, it is set to no-op.<br />
           * Access Popper.js instance with `data.instance`.
           * @prop {onCreate}
           */
          onCreate: () => {},

          /**
           * Callback called when the popper is updated. This callback is not called
           * on the initialization/creation of the popper, but only on subsequent
           * updates.<br />
           * By default, it is set to no-op.<br />
           * Access Popper.js instance with `data.instance`.
           * @prop {onUpdate}
           */
          onUpdate: () => {},

          /**
           * List of modifiers used to modify the offsets before they are applied to the popper.
           * They provide most of the functionalities of Popper.js.
           * @prop {modifiers}
           */
          modifiers,
        };

        /**
         * @callback onCreate
         * @param {dataObject} data
         */

        /**
         * @callback onUpdate
         * @param {dataObject} data
         */

        // Utils
        // Methods
        class Popper {
          /**
           * Creates a new Popper.js instance.
           * @class Popper
           * @param {Element|referenceObject} reference - The reference element used to position the popper
           * @param {Element} popper - The HTML / XML element used as the popper
           * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
           * @return {Object} instance - The generated Popper.js instance
           */
          constructor(reference, popper, options = {}) {
            this.scheduleUpdate = () => requestAnimationFrame(this.update);

            // make update() debounced, so that it only runs at most once-per-tick
            this.update = debounce(this.update.bind(this));

            // with {} we create a new object with the options inside it
            this.options = _extends({}, Popper.Defaults, options);

            // init state
            this.state = {
              isDestroyed: false,
              isCreated: false,
              scrollParents: [],
            };

            // get reference and popper elements (allow jQuery wrappers)
            this.reference =
              reference && reference.jquery ? reference[0] : reference;
            this.popper = popper && popper.jquery ? popper[0] : popper;

            // Deep merge modifiers options
            this.options.modifiers = {};
            Object.keys(
              _extends({}, Popper.Defaults.modifiers, options.modifiers)
            ).forEach((name) => {
              this.options.modifiers[name] = _extends(
                {},
                Popper.Defaults.modifiers[name] || {},
                options.modifiers ? options.modifiers[name] : {}
              );
            });

            // Refactoring modifiers' list (Object => Array)
            this.modifiers = Object.keys(this.options.modifiers)
              .map((name) =>
                _extends(
                  {
                    name,
                  },
                  this.options.modifiers[name]
                )
              )
              // sort the modifiers by order
              .sort((a, b) => a.order - b.order);

            // modifiers have the ability to execute arbitrary code when Popper.js get inited
            // such code is executed in the same order of its modifier
            // they could add new properties to their options configuration
            // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
            this.modifiers.forEach((modifierOptions) => {
              if (
                modifierOptions.enabled &&
                isFunction(modifierOptions.onLoad)
              ) {
                modifierOptions.onLoad(
                  this.reference,
                  this.popper,
                  this.options,
                  modifierOptions,
                  this.state
                );
              }
            });

            // fire the first update to position the popper in the right place
            this.update();

            const eventsEnabled = this.options.eventsEnabled;
            if (eventsEnabled) {
              // setup event listeners, they will take care of update the position in specific situations
              this.enableEventListeners();
            }

            this.state.eventsEnabled = eventsEnabled;
          }

          // We can't use class properties because they don't get listed in the
          // class prototype and break stuff like Sinon stubs
          update() {
            return update.call(this);
          }
          destroy() {
            return destroy.call(this);
          }
          enableEventListeners() {
            return enableEventListeners.call(this);
          }
          disableEventListeners() {
            return disableEventListeners.call(this);
          }

          /**
           * Schedules an update. It will run on the next UI update available.
           * @method scheduleUpdate
           * @memberof Popper
           */

          /**
           * Collection of utilities useful when writing custom modifiers.
           * Starting from version 1.7, this method is available only if you
           * include `popper-utils.js` before `popper.js`.
           *
           * **DEPRECATION**: This way to access PopperUtils is deprecated
           * and will be removed in v2! Use the PopperUtils module directly instead.
           * Due to the high instability of the methods contained in Utils, we can't
           * guarantee them to follow semver. Use them at your own risk!
           * @static
           * @private
           * @type {Object}
           * @deprecated since version 1.8
           * @member Utils
           * @memberof Popper
           */
        }

        /**
         * The `referenceObject` is an object that provides an interface compatible with Popper.js
         * and lets you use it as replacement of a real DOM node.<br />
         * You can use this method to position a popper relatively to a set of coordinates
         * in case you don't have a DOM node to use as reference.
         *
         * ```
         * new Popper(referenceObject, popperNode);
         * ```
         *
         * NB: This feature isn't supported in Internet Explorer 10.
         * @name referenceObject
         * @property {Function} data.getBoundingClientRect
         * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
         * @property {number} data.clientWidth
         * An ES6 getter that will return the width of the virtual reference element.
         * @property {number} data.clientHeight
         * An ES6 getter that will return the height of the virtual reference element.
         */

        Popper.Utils = (
          typeof window !== "undefined" ? window : __webpack_require__.g
        ).PopperUtils;
        Popper.placements = placements;
        Popper.Defaults = Defaults;

        /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = Popper;
        //# sourceMappingURL=popper.js.map

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ if (__webpack_module_cache__[moduleId]) {
      /******/ return __webpack_module_cache__[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/ __webpack_require__.m = __webpack_modules__;
  /******/
  /******/ // the startup function
  /******/ // It's empty as some runtime module handles the default behavior
  /******/ __webpack_require__.x = (x) => {};
  /************************************************************************/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/global */
  /******/ (() => {
    /******/ __webpack_require__.g = (function () {
      /******/ if (typeof globalThis === "object") return globalThis;
      /******/ try {
        /******/ return this || new Function("return this")();
        /******/
      } catch (e) {
        /******/ if (typeof window === "object") return window;
        /******/
      }
      /******/
    })();
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: "Module",
        });
        /******/
      }
      /******/ Object.defineProperty(exports, "__esModule", { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/jsonp chunk loading */
  /******/ (() => {
    /******/ // no baseURI
    /******/
    /******/ // object to store loaded and loading chunks
    /******/ // undefined = chunk not loaded, null = chunk preloaded/prefetched
    /******/ // Promise = chunk loading, 0 = chunk loaded
    /******/ var installedChunks = {
      /******/ "/js/app": 0,
      /******/
    };
    /******/
    /******/ var deferredModules = [
      /******/ ["./node_modules/popper.js/dist/popper.js"],
      /******/ ["./node_modules/jquery/dist/jquery.js"],
      /******/ ["./node_modules/bootstrap/dist/js/bootstrap.min.js"],
      /******/ ["./node_modules/animejs/lib/anime.js"],
      /******/ ["./resources/js/app.js"],
      /******/ ["./resources/css/app.css"],
      /******/
    ];
    /******/ // no chunk on demand loading
    /******/
    /******/ // no prefetching
    /******/
    /******/ // no preloaded
    /******/
    /******/ // no HMR
    /******/
    /******/ // no HMR manifest
    /******/
    /******/ var checkDeferredModules = (x) => {};
    /******/
    /******/ // install a JSONP callback for chunk loading
    /******/ var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      /******/ var [chunkIds, moreModules, runtime, executeModules] = data;
      /******/ // add "moreModules" to the modules object,
      /******/ // then flag all "chunkIds" as loaded and fire callback
      /******/ var moduleId,
        chunkId,
        i = 0,
        resolves = [];
      /******/ for (; i < chunkIds.length; i++) {
        /******/ chunkId = chunkIds[i];
        /******/ if (
          __webpack_require__.o(installedChunks, chunkId) &&
          installedChunks[chunkId]
        ) {
          /******/ resolves.push(installedChunks[chunkId][0]);
          /******/
        }
        /******/ installedChunks[chunkId] = 0;
        /******/
      }
      /******/ for (moduleId in moreModules) {
        /******/ if (__webpack_require__.o(moreModules, moduleId)) {
          /******/ __webpack_require__.m[moduleId] = moreModules[moduleId];
          /******/
        }
        /******/
      }
      /******/ if (runtime) runtime(__webpack_require__);
      /******/ if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
      /******/ while (resolves.length) {
        /******/ resolves.shift()();
        /******/
      }
      /******/
      /******/ // add entry modules from loaded chunk to deferred list
      /******/ if (executeModules)
        deferredModules.push.apply(deferredModules, executeModules);
      /******/
      /******/ // run deferred modules when all chunks ready
      /******/ return checkDeferredModules();
      /******/
    };
    /******/
    /******/ var chunkLoadingGlobal = (self["webpackChunk"] =
      self["webpackChunk"] || []);
    /******/ chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    /******/ chunkLoadingGlobal.push = webpackJsonpCallback.bind(
      null,
      chunkLoadingGlobal.push.bind(chunkLoadingGlobal)
    );
    /******/
    /******/ function checkDeferredModulesImpl() {
      /******/ var result;
      /******/ for (var i = 0; i < deferredModules.length; i++) {
        /******/ var deferredModule = deferredModules[i];
        /******/ var fulfilled = true;
        /******/ for (var j = 1; j < deferredModule.length; j++) {
          /******/ var depId = deferredModule[j];
          /******/ if (installedChunks[depId] !== 0) fulfilled = false;
          /******/
        }
        /******/ if (fulfilled) {
          /******/ deferredModules.splice(i--, 1);
          /******/ result = __webpack_require__(
            (__webpack_require__.s = deferredModule[0])
          );
          /******/
        }
        /******/
      }
      /******/ if (deferredModules.length === 0) {
        /******/ __webpack_require__.x();
        /******/ __webpack_require__.x = (x) => {};
        /******/
      }
      /******/ return result;
      /******/
    }
    /******/ var startup = __webpack_require__.x;
    /******/ __webpack_require__.x = () => {
      /******/ // reset startup function so it can be called again when more startup code is added
      /******/ __webpack_require__.x = startup || ((x) => {});
      /******/ return (checkDeferredModules = checkDeferredModulesImpl)();
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // run startup
  /******/ var __webpack_exports__ = __webpack_require__.x();
  /******/
  /******/
})();
