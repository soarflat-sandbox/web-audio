/* CONST */
const SMOOTHING = 0.5;
const FFT_SIZE = 2048;

/* canvas setup */
const c = document.getElementById('canvas');
const cw = window.innerWidth;
const ch = window.innerHeight;
c.width = cw;
c.height = ch;
const ctx = c.getContext('2d');

/* audio setup */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * 音声ファイルローダー
 * @param {string} url 読み込む音声データのURL
 * @param {Function} callback 読み込み完了後に実行されるコールバック
 */
class Loader {
  constructor(url, callback) {
    this.url = url;
    this.onLoad = callback;
  }

  loadBuffer() {
    const request = new XMLHttpRequest();
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';

    request.onload = res => {
      audioCtx.decodeAudioData(
        res.currentTarget.response,
        buffer => {
          if (!buffer) {
            console.log('error');
            return;
          }
          this.onLoad(buffer);
        },
        error => {
          console.log('decodeAudioData error');
        }
      );
    };

    request.onerror = () => {
      console.log('Loader: XHR error');
    };

    request.send();
  }
}

/**
 * ビジュアライザー
 * @constructor
 */
class Visualizer {
  constructor(buffer) {
    this.numBars = 128;
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.minDecibels = -140;
    this.analyser.maxDecibels = 0;
    this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
    this.times = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = audioCtx.createBufferSource();
    this.source.connect(this.analyser);
    this.source.buffer = buffer;
    this.source.loop = true;
  }

  play() {
    this.source.start(0);
    this.draw();
  }

  draw() {
    this.analyser.smoothingTimeConstant = SMOOTHING;
    this.analyser.fftSize = FFT_SIZE;
    this.analyser.getByteFrequencyData(this.freqs);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';

    for (let index = 0; index < this.numBars; index += 1) {
      this.drawTop(index);
    }

    for (let index = 0; index < this.analyser.frequencyBinCount; index += 1) {
      this.drawBottom(index);
    }

    window.requestAnimationFrame(this.draw.bind(this));
  }

  drawTop(index) {
    const barWidth = cw / 128 / 2;
    const spacerWidth = barWidth * 2;
    const height = this.freqs[index] - 160;
    const hue = (index / 128) * 360;

    ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

    if (height > 40) {
      ctx.fillRect(index * spacerWidth, ch, barWidth, -height * 5);
    }
    if (height > 35) {
      ctx.fillRect(index * spacerWidth, ch, barWidth, -height * 4);
    }
    if (height > 0) {
      ctx.fillRect(index * spacerWidth, ch, barWidth, -height * 3);
    }
    if (height < 0) {
      ctx.fillRect(index * spacerWidth, ch, barWidth, -rand(1, 5));
    }
  }

  drawBottom(index) {
    const barWidth = cw / this.analyser.frequencyBinCount;
    const height = this.freqs[index];
    const hue = (index / this.analyser.frequencyBinCount) * 360;

    ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    ctx.fillRect(index * barWidth, ch / 2, barWidth, -height);
  }
}

/**
 * ビジュアライザを初期化する。
 */
const initVisualizer = function(buffer) {
  const visualizer = new Visualizer(buffer);
  const button = document.getElementById('button');
  button.innerText = 'クリックして再生';
  button.addEventListener('click', () => {
    button.style.display = 'none';
    visualizer.play();
  });
};

/**
 * initialize
 */
const init = function() {
  const loader = new Loader(['sample.mp3'], initVisualizer);
  loader.loadBuffer();
};

/* utility functions */

/**
 * 引数で定めた範囲の数をランダムに返す。
 * @param {Number} min 最小値
 * @param {Number} max 最大値
 * @return {Number}
 */
const rand = (min, max) => Math.random() * (max - min) + min;

init();
