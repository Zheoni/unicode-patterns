/**
 * Sets the canvas size adjusted for the DPI of the screen
 * @param {Element} canvas Canvas element
 * @param {number} width Width of the canvas
 * @param {number} height Height of the canvas
 */
function setCanvasSize(canvas, width, height) {
  const ctx = canvas.getContext("2d");
  const ratio = (() => {
    const dpr = window.devicePixelRatio || 1;
    const bsr = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
  })();

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/**
 * Creates a canvas adjusted for the DPI of the screen
 * @param {number} width Width of the canvas
 * @param {number} height Height of the canvas
 */
function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  setCanvasSize(canvas, width, height);
  return canvas;
}

/**
 * Generates a pattern in a canvas
 * @param {string[]} chars Unicode characters to be used.
 * @param {{width, height, initialx, initialy, sepx, sepy, offsetx, offsety, fontSize, fontFamily, backgroundColor, fontColor, random}} options Options to generate the pattern.
 * @param {Element=} canvas Canvas element. If given, do not generate a new canvas.
 */
function generateUnicodeCanvas(chars, options, canvas) {
  const defaults = {
    width: 400,
    height: 400,
    initialx: 0,
    initialy: 0,
    sepx: 20,
    sepy: 20,
    offsetx: 25,
    offsety: 0,
    fontSize: 40,
    fontFamily: "sans-serif",
    backgroundColor: null,
    fontColor: null,
    random: false
  }

  const o = Object.assign({}, defaults, options);

  if (!canvas) {
    canvas = createCanvas(o.width, o.height);
  } else if (options.width && options.height) {
    setCanvasSize(canvas, o.width, o.height);
  } else {
    o.width = canvas.clientWidth;
    o.height = canvas.clientHeight;
  }

  const ctx = canvas.getContext("2d");
  ctx.save();

  if (o.backgroundColor) {
    ctx.fillStyle = o.backgroundColor;
    ctx.fillRect(0, 0, o.width, o.height);
  }
  ctx.font = o.fontSize + "px " + o.fontFamily;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillStyle = o.fontColor;
  ctx.translate(-o.fontSize, -o.fontSize);

  o.sepx = o.sepx + o.fontSize;
  o.sepy = o.sepy + o.fontSize;

  const limitx = o.width + 2 * o.fontSize + o.offsetx,
    limity = o.height + 2 * o.fontSize + o.offsety;

  let idx = 0, line = 0, col = 0;
  for (let y = -o.initialy; y <= limity; y += o.sepy, ++line) {
    col = 0;
    for (let x = -o.initialx; x <= limitx; x += o.sepx, ++idx, ++col) {
      if (o.random) idx = Math.floor(Math.random() * chars.length);

      let acty = y - ((o.offsety * col) % (o.sepy));
      let actx = x - ((o.offsetx * line) % (o.sepx));
      ctx.fillText(chars[idx % chars.length], actx, acty);
    }
  }
  ctx.restore();
  return canvas;
}

/**
 * Generates a base 64 image pattern.
 * @param {string[]} chars Unicode characters to be used
 * @param {{width, height, initialx, initialy, sepx, sepy, offsetx, offsety, fontSize, fontFamily, backgroundColor, fontColor, random}} options Options to generate the pattern
 */
function generateUnicodeImage(chars, options) {
  const canvas = generateUnicodeCanvas(chars, options);
  return canvas.toDataURL();
}

/**
 * Applies an image as a background to an element
 * @param {Element} element DOM element to apply the background to
 * @param {string} image Valid image URL (base64 if generated by this file)
 */
function applyImageToBackground(element, image) {
  const width = element.clientWidth;
  const height = element.clientHeight;
  element.style.backgroundSize = `${width}px ${height}px`;
  element.style.backgroundImage = `url(${image})`;
}

/**
 * Generates a background image and applies it to an element
 * @param {Element} element DOM element to apply the background to
 * @param {string[]]} chars Unicode characters to be used
 * @param {{initialx, initialy, sepx, sepy, offsetx, offsety, fontSize, fontFamily, backgroundColor, fontColor, random}} options Options to generate the pattern
 */
function applyUnicodeBackground(element, chars, options) {
  if (!options) options = {}
  options.width = element.clientWidth;
  options.height = element.clientHeight;
  const image = generateUnicodeImage(chars, options);
  applyImageToBackground(element, image);
}
