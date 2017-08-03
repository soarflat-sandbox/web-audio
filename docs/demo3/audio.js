'use strict';

/* CONST */
var SMOOTHING = .5;
var FFT_SIZE = 2048;

/* canvas setup */
var c = document.getElementById('canvas');
var cw;
var ch;
c.width = cw = window.innerWidth;
c.height = ch = window.innerHeight;
var ctx = c.getContext('2d');

/* audio setup */
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * 音声ファイルローダー
 * @constructor
 * @property {String} url 読み込む音声データのURL
 * @property {Function} onLoad 読み込み完了後に実行される処理
 */
var Loader = function (url, callback) {
  this.url = url;
  this.onLoad = callback;
};

Loader.prototype.loadBuffer = function () {
  var loader,
    request;
  loader = this;
  request = new XMLHttpRequest();
  request.open('GET', this.url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    audioCtx.decodeAudioData(this.response, function (buffer) {
      if (!buffer) {
        console.log('error');
        return;
      }
      loader.onLoad(buffer);
    }, function (error) {
      console.log('decodeAudioData error');
    });
  };

  request.onerror = function () {
    console.log('Loader: XHR error');
  };

  request.send();
};

/**
 * ビジュアライザー
 * @constructor
 */
var Visualizer = function (buffer) {
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
  this.source.start(0);

  this.draw();
};

Visualizer.prototype.draw = function () {
  this.analyser.smoothingTimeConstant = SMOOTHING;
  this.analyser.fftSize = FFT_SIZE;
  this.analyser.getByteFrequencyData(this.freqs);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = 'source-over';

  var barWidth,
    spacerWidth,
    height, hue;

  for (var i = 0; i < this.numBars; ++i) {
    barWidth = cw / 128 / 2;
    spacerWidth = barWidth * 2;
    height = this.freqs[i] - 160;
    hue = i / 128 * 360;

    ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

    if (height > 40) {
      ctx.fillRect(i * spacerWidth, ch, barWidth, -height * 5);
    }
    if (height > 35) {
      ctx.fillRect(i * spacerWidth, ch, barWidth, -height * 4);
    }
    if (height > 0) {
      ctx.fillRect(i * spacerWidth, ch, barWidth, -height * 3);
    }
    if (height < 0) {
      ctx.fillRect(i * spacerWidth, ch, barWidth, -rand(1, 5));
    }
  }

  for (var i = 0; i < this.analyser.frequencyBinCount; ++i) {
    barWidth = cw / this.analyser.frequencyBinCount;
    height = this.freqs[i];
    hue = i / this.analyser.frequencyBinCount * 360;

    ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    ctx.fillRect(i * barWidth, ch / 2, barWidth, -height);
  }
  window.requestAnimationFrame(this.draw.bind(this));
};

// ビジュアライザを初期化する。
var initVisualizer = function (buffer) {
  var visualizer = new Visualizer(buffer);
};

/**
 * initialize
 */
var init = function () {
  var loader = new Loader(['sample.mp3'], initVisualizer);
  loader.loadBuffer();
};

/* utility functions */

/**
 * 引数で定めた範囲の数をランダムに返す。
 * @param {Number} min 最小値
 * @param {Number} max 最大値
 * @return {Number}
 */
var rand = function (min, max) {
  return Math.random() * (max - min) + min;
};

init();