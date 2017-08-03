// AudioNodeを管理するAudioContextの生成
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

var oscillatorNode = audioCtx.createOscillator();  // OscillatorNode(入力、音源)を作成
var gainNode = audioCtx.createGain();              // GainNode(フィルタ)を作成
gainNode.gain.value = 0.1;                         // 音量を小さくする
oscillatorNode.connect(gainNode);                  // oscillatorNodeをgainNodeに接続
gainNode.connect(audioCtx.destination);            // gainNodeをAudioDestinationNode(出力)に接続
oscillatorNode.start(0);                           // 再生開始
