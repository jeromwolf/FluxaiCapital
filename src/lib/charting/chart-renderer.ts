import { MarketCandle } from '@/lib/market/types';

// Chart rendering optimizations
export class ChartRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: OffscreenCanvas | null = null;
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
  private devicePixelRatio: number;
  private animationFrame: number | null = null;
  private renderQueue: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false,
    });

    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    this.ctx = ctx;
    this.devicePixelRatio = window.devicePixelRatio || 1;

    // Initialize offscreen canvas if supported
    if ('OffscreenCanvas' in window) {
      this.offscreenCanvas = new OffscreenCanvas(
        canvas.width * this.devicePixelRatio,
        canvas.height * this.devicePixelRatio,
      );
      this.offscreenCtx = this.offscreenCanvas.getContext(
        '2d',
      ) as OffscreenCanvasRenderingContext2D;
    }

    this.setupCanvas();
  }

  private setupCanvas() {
    const { width, height } = this.canvas.getBoundingClientRect();

    // Set display size
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    // Set actual size in memory (scaled for retina displays)
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;

    // Scale context to match device pixel ratio
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

    if (this.offscreenCanvas && this.offscreenCtx) {
      this.offscreenCanvas.width = width * this.devicePixelRatio;
      this.offscreenCanvas.height = height * this.devicePixelRatio;
      this.offscreenCtx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }
  }

  // Batch render operations
  public queueRender(renderFn: () => void) {
    this.renderQueue.push(renderFn);
    this.scheduleRender();
  }

  private scheduleRender() {
    if (this.animationFrame) return;

    this.animationFrame = requestAnimationFrame(() => {
      this.executeRenderQueue();
      this.animationFrame = null;
    });
  }

  private executeRenderQueue() {
    const ctx = this.offscreenCtx || this.ctx;

    // Clear once
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Execute all queued renders
    while (this.renderQueue.length > 0) {
      const renderFn = this.renderQueue.shift();
      renderFn?.();
    }

    // If using offscreen canvas, transfer to main canvas
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }

  // Optimized candle rendering with culling
  public renderCandles(
    candles: MarketCandle[],
    viewportLeft: number,
    viewportRight: number,
    priceScale: (price: number) => number,
    timeScale: (time: number) => number,
    candleWidth: number,
  ) {
    const ctx = this.offscreenCtx || this.ctx;

    // Cull candles outside viewport
    const visibleCandles = candles.filter((candle) => {
      const x = timeScale(candle.timestamp);
      return x >= viewportLeft - candleWidth && x <= viewportRight + candleWidth;
    });

    // Batch render by color
    const upCandles: MarketCandle[] = [];
    const downCandles: MarketCandle[] = [];

    visibleCandles.forEach((candle) => {
      if (candle.close >= candle.open) {
        upCandles.push(candle);
      } else {
        downCandles.push(candle);
      }
    });

    // Render up candles
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#22c55e';
    this.renderCandleBatch(ctx, upCandles, priceScale, timeScale, candleWidth, true);

    // Render down candles
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ef4444';
    this.renderCandleBatch(ctx, downCandles, priceScale, timeScale, candleWidth, false);
  }

  private renderCandleBatch(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    candles: MarketCandle[],
    priceScale: (price: number) => number,
    timeScale: (time: number) => number,
    candleWidth: number,
    isUp: boolean,
  ) {
    ctx.lineWidth = 1;

    // Draw all wicks first
    ctx.beginPath();
    candles.forEach((candle) => {
      const x = timeScale(candle.timestamp);
      const highY = priceScale(candle.high);
      const lowY = priceScale(candle.low);

      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
    });
    ctx.stroke();

    // Draw all bodies
    candles.forEach((candle) => {
      const x = timeScale(candle.timestamp);
      const openY = priceScale(candle.open);
      const closeY = priceScale(candle.close);

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(openY - closeY) || 1;

      if (isUp) {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }
    });
  }

  // Optimized line rendering with path simplification
  public renderLine(
    points: { x: number; y: number }[],
    color: string,
    lineWidth: number = 2,
    simplify: boolean = true,
  ) {
    const ctx = this.offscreenCtx || this.ctx;

    if (points.length < 2) return;

    const simplified = simplify ? this.simplifyPath(points, 0.5) : points;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    ctx.moveTo(simplified[0].x, simplified[0].y);
    for (let i = 1; i < simplified.length; i++) {
      ctx.lineTo(simplified[i].x, simplified[i].y);
    }

    ctx.stroke();
  }

  // Douglas-Peucker algorithm for path simplification
  private simplifyPath(
    points: { x: number; y: number }[],
    tolerance: number,
  ): { x: number; y: number }[] {
    if (points.length <= 2) return points;

    // Find the point with maximum distance
    let maxDistance = 0;
    let maxIndex = 0;

    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const left = this.simplifyPath(points.slice(0, maxIndex + 1), tolerance);
      const right = this.simplifyPath(points.slice(maxIndex), tolerance);

      return [...left.slice(0, -1), ...right];
    } else {
      return [start, end];
    }
  }

  private perpendicularDistance(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    if (dx === 0 && dy === 0) {
      return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
    }

    const normalLength = Math.sqrt(dx * dx + dy * dy);
    const distance =
      Math.abs((point.x - lineStart.x) * dy - (point.y - lineStart.y) * dx) / normalLength;

    return distance;
  }

  // Text rendering with caching
  private textCache = new Map<string, ImageData>();

  public renderText(
    text: string,
    x: number,
    y: number,
    font: string,
    color: string,
    align: CanvasTextAlign = 'left',
    baseline: CanvasTextBaseline = 'middle',
  ) {
    const ctx = this.offscreenCtx || this.ctx;
    const cacheKey = `${text}-${font}-${color}`;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    // Check cache
    if (this.textCache.has(cacheKey)) {
      const imageData = this.textCache.get(cacheKey)!;
      ctx.putImageData(imageData, x, y);
    } else {
      ctx.fillText(text, x, y);

      // Cache rendered text if it's commonly used
      const metrics = ctx.measureText(text);
      const width = Math.ceil(metrics.width);
      const height = Math.ceil(parseInt(font) * 1.5);

      if (width > 0 && height > 0 && this.textCache.size < 100) {
        try {
          const imageData = ctx.getImageData(x - width / 2, y - height / 2, width, height);
          this.textCache.set(cacheKey, imageData);
        } catch (e) {
          // Ignore cache errors
        }
      }
    }
  }

  // Cleanup
  public destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.renderQueue = [];
    this.textCache.clear();
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
  }
}
