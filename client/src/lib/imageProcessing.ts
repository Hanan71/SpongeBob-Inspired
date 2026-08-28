export interface ProcessingResult {
  dataUrl: string;
  width: number;
  height: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
  }

  async spongebobCartoonize(imageSource: HTMLImageElement | HTMLVideoElement): Promise<ProcessingResult> {
    const width = imageSource instanceof HTMLImageElement ? imageSource.naturalWidth : imageSource.videoWidth;
    const height = imageSource instanceof HTMLImageElement ? imageSource.naturalHeight : imageSource.videoHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.drawImage(imageSource, 0, 0, width, height);
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const bilateralFiltered = this.bilateralFilter(data, width, height);
    const edges = this.detectEdges(bilateralFiltered, width, height);
    const enhanced = this.enhanceColors(bilateralFiltered, width, height);
    const final = this.combineWithEdges(enhanced, edges, width, height);

    this.ctx.putImageData(new ImageData(final, width, height), 0, 0);

    return {
      dataUrl: this.canvas.toDataURL('image/png'),
      width,
      height,
    };
  }

  private bilateralFilter(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);
    const radius = 5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        let sumR = 0, sumG = 0, sumB = 0, sumWeight = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = Math.min(Math.max(y + dy, 0), height - 1);
            const nx = Math.min(Math.max(x + dx, 0), width - 1);
            const nIdx = (ny * width + nx) * 4;

            const spatialDist = dx * dx + dy * dy;
            const colorDist = 
              Math.pow(data[idx] - data[nIdx], 2) +
              Math.pow(data[idx + 1] - data[nIdx + 1], 2) +
              Math.pow(data[idx + 2] - data[nIdx + 2], 2);

            const weight = Math.exp(-(spatialDist / 50 + colorDist / 10000));

            sumR += data[nIdx] * weight;
            sumG += data[nIdx + 1] * weight;
            sumB += data[nIdx + 2] * weight;
            sumWeight += weight;
          }
        }

        result[idx] = sumR / sumWeight;
        result[idx + 1] = sumG / sumWeight;
        result[idx + 2] = sumB / sumWeight;
        result[idx + 3] = data[idx + 3];
      }
    }

    return result;
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const gray = new Uint8ClampedArray(width * height);
    
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      gray[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    }

    const blurred = this.medianBlur(gray, width, height, 3);
    const edges = this.adaptiveThreshold(blurred, width, height);

    const result = new Uint8ClampedArray(data.length);
    for (let i = 0; i < edges.length; i++) {
      const idx = i * 4;
      result[idx] = result[idx + 1] = result[idx + 2] = edges[i];
      result[idx + 3] = 255;
    }

    return result;
  }

  private medianBlur(gray: Uint8ClampedArray, width: number, height: number, size: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(gray.length);
    const radius = Math.floor(size / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const neighbors: number[] = [];

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = Math.min(Math.max(y + dy, 0), height - 1);
            const nx = Math.min(Math.max(x + dx, 0), width - 1);
            neighbors.push(gray[ny * width + nx]);
          }
        }

        neighbors.sort((a, b) => a - b);
        result[y * width + x] = neighbors[Math.floor(neighbors.length / 2)];
      }
    }

    return result;
  }

  private adaptiveThreshold(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(gray.length);
    const blockSize = 9;
    const C = 2;
    const radius = Math.floor(blockSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = Math.min(Math.max(y + dy, 0), height - 1);
            const nx = Math.min(Math.max(x + dx, 0), width - 1);
            sum += gray[ny * width + nx];
            count++;
          }
        }

        const mean = sum / count;
        const idx = y * width + x;
        result[idx] = gray[idx] > mean - C ? 255 : 0;
      }
    }

    return result;
  }

  private enhanceColors(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const { h, s, v } = this.rgbToHsv(r, g, b);
      const newS = Math.min(s + 0.3, 1);
      const newV = Math.min(v + 0.2, 1);

      const { r: newR, g: newG, b: newB } = this.hsvToRgb(h, newS, newV);

      result[i] = newR;
      result[i + 1] = newG;
      result[i + 2] = newB;
      result[i + 3] = data[i + 3];
    }

    return result;
  }

  private combineWithEdges(color: Uint8ClampedArray, edges: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(color.length);

    for (let i = 0; i < color.length; i += 4) {
      const edgeFactor = edges[i] / 255;
      result[i] = color[i] * edgeFactor;
      result[i + 1] = color[i + 1] * edgeFactor;
      result[i + 2] = color[i + 2] * edgeFactor;
      result[i + 3] = color[i + 3];
    }

    return result;
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h /= 6;
      if (h < 0) h += 1;
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h, s, v };
  }

  private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }
}
