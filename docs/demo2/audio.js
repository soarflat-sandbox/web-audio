// AudioNodeを管理するAudioContextの生成
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var Loader = function (url) {
  this.url = url;  // 読み込む音声データのURL
};

// XMLHttpRequestを利用して音声データ(バッファ)を読み込む。
Loader.prototype.loadBuffer = function () {
  var loader,
    request;
  loader = this;
  request = new XMLHttpRequest();
  request.open('GET', this.url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    // 取得したデータをデコードする。
    audioCtx.decodeAudioData(this.response, function (buffer) {
      if (!buffer) {
        console.log('error');
        return;
      }
      loader.playSound(buffer);  // デコードされたデータを再生する。
    }, function (error) {
      console.log('decodeAudioData error');
    });
  };

  request.onerror = function () {
    console.log('Loader: XHR error');
  };

  request.send();
};

// 読み込んだ音声データ(バッファ)を再生する。
Loader.prototype.playSound = function (buffer) {
  var sourceNode = audioCtx.createBufferSource(); // AudioBufferSourceNode(入力)を作成
  sourceNode.buffer = buffer;                     // 取得した音声データ(バッファ)を音源に設定
  sourceNode.connect(audioCtx.destination);       // AudioBufferSourceNodeをAudioDestinationNode(出力)に接続
  sourceNode.start(0);                            // 再生開始
};

var loader = new Loader('sample.mp3');
loader.loadBuffer();