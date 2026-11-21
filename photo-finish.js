(() => {
  "use strict";

  // Curves use evenly spaced sRGB input values. The channel offsets taper to zero
  // at black and white to keep the ends of the tonal range neutral.
  const treatments = {
    daylight: { curve: [0, .115, .249, .388, .524, .653, .776, .885, 1], clarity: .13, detail: .46 },
    soft: { curve: [0, .113, .252, .400, .547, .678, .796, .895, 1], clarity: .17, detail: .64 },
    stage: { curve: [0, .148, .294, .429, .552, .673, .784, .890, 1], clarity: .13, detail: .45 },
    bright: { curve: [0, .120, .253, .390, .520, .644, .758, .872, .996], clarity: .12, detail: .38 },
    texture: { curve: [0, .129, .268, .402, .534, .659, .777, .887, 1], clarity: .11, detail: .25 },
    interior: { curve: [0, .144, .282, .420, .550, .674, .786, .893, 1], clarity: .15, detail: .38 },
    dusk: { curve: [0, .126, .276, .426, .566, .694, .806, .909, 1], warmth: [.023, .002, -.027], clarity: .16, detail: .65 },
    artwork: { clarity: 0, detail: .23 }
  };
  const svgNS = "http://www.w3.org/2000/svg";

  function svgElement(parent, name, attributes) {
    const element = document.createElementNS(svgNS, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    parent.append(element);
    return element;
  }

  function unsharp(filter, input, name, radius, amount) {
    svgElement(filter, "feGaussianBlur", {
      in: input, stdDeviation: radius, edgeMode: "duplicate", result: name + "-blur"
    });
    // Blurs include partial coverage at the frame. Compare straight RGB values
    // there so the sharpening pass does not brighten the image perimeter.
    const comparison = svgElement(filter, "feComponentTransfer", {
      in: name + "-blur", result: name + "-comparison"
    });
    svgElement(comparison, "feFuncA", {type: "linear", slope: 0, intercept: 1});
    svgElement(filter, "feComposite", {
      in: input, in2: name + "-comparison", operator: "arithmetic",
      k2: 1 + amount, k3: -amount, result: name
    });
  }

  const svg = svgElement(document.body, "svg", {
    width: 0, height: 0, class: "photo-filter-defs", "aria-hidden": "true", focusable: "false"
  });
  const defs = svgElement(svg, "defs", {});
  for (const [name, settings] of Object.entries(treatments)) {
    const filter = svgElement(defs, "filter", {
      id: "photo-finish-" + name, x: "0%", y: "0%", width: "100%", height: "100%",
      "color-interpolation-filters": "sRGB"
    });
    let input = "SourceGraphic";
    if (settings.curve) {
      const transfer = svgElement(filter, "feComponentTransfer", {in: input, result: "tone"});
      ["R", "G", "B"].forEach((channel, index) => {
        const offset = settings.warmth?.[index] || 0;
        const table = settings.curve.map((value, step, curve) => {
          const x = step / (curve.length - 1);
          return (value + offset * 4 * x * (1 - x)).toFixed(4);
        });
        svgElement(transfer, "feFunc" + channel, {type: "table", tableValues: table.join(" ")});
      });
      input = "tone";
    }
    if (settings.clarity) {
      unsharp(filter, input, "local-contrast", 3.2, settings.clarity);
      input = "local-contrast";
    }
    unsharp(filter, input, "edge-detail", .78, settings.detail);
    if (settings.curve) {
      // Feather sharpening out of deep shadows and specular highlights. A bright
      // window, a black stage curtain and the center of a face need different amounts.
      svgElement(filter, "feColorMatrix", {
        in: "tone", type: "matrix", result: "luminance",
        values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  .2126 .7152 .0722 0 0"
      });
      const mask = svgElement(filter, "feComponentTransfer", {in: "luminance", result: "detail-mask"});
      svgElement(mask, "feFuncA", {
        type: "table", tableValues: "0 .23 .62 .9 1 1 .84 .43 0"
      });
      svgElement(filter, "feComposite", {
        in: "edge-detail", in2: "detail-mask", operator: "in", result: "protected-detail"
      });
      svgElement(filter, "feComposite", {
        in: "protected-detail", in2: "tone", operator: "over"
      });
    }
  }

  document.documentElement.classList.add("photo-finish-ready");

  // Native file links also support opening or saving the original photograph.
  // An ordinary Full photo click keeps the on-page color and detail treatment.
  let dialog;
  function showPhoto(link, photo) {
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "full-photograph";
      dialog.setAttribute("aria-label", "Full photo");
      dialog.innerHTML = '<div class="full-photograph-bar"><a target="_blank" rel="noreferrer">Open image file</a><form method="dialog"><button autofocus>Close</button></form></div><img alt="" referrerpolicy="no-referrer">';
      document.body.append(dialog);
      dialog.addEventListener("close", () => dialog.querySelector("img").removeAttribute("src"));
      window.addEventListener("hashchange", () => { if (dialog.open) dialog.close(); });
    }
    const image = dialog.querySelector("img");
    image.dataset.photoGrade = photo.dataset.photoGrade;
    image.alt = photo.alt;
    image.src = link.href;
    dialog.querySelector("a").href = link.href;
    dialog.showModal();
  }
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
        event.altKey || event.shiftKey || typeof HTMLDialogElement === "undefined" ||
        typeof HTMLDialogElement.prototype.showModal !== "function") return;
    const link = event.target.closest?.("a.grl-full-photo");
    const photo = link?.closest("figure")?.querySelector("img[data-photo-grade]");
    if (!photo) return;
    event.preventDefault();
    showPhoto(link, photo);
  });
})();
