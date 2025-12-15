// main.ts は p5 スケッチのエントリーポイントとして描画ループを構成する。
import p5 from "p5";

import { Logger } from "./utils/log/logger";
import { TexManager } from "./core/texManager";
import { UIManager } from "./core/uiManager";
import { EffectManager } from "./core/effectManager";
import { BPMManager } from "./rhythm/BPMManager";
import { APCMiniMK2Manager } from "./midi/apcmini_mk2/apcMiniMk2Manager";

const logger = new Logger();
const texManager = new TexManager();
const uiManager = new UIManager();
const bpmManager = new BPMManager();
const effectManager = new EffectManager();
const apcMiniMK2Manager = new APCMiniMK2Manager();

let font: p5.Font;
let logo: p5.Image;

const sketch = (p: p5) => {
  p.setup = async () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noCursor(); // カーソルを非表示にする
    p.pixelDensity(1); // 高解像度ディスプレイ対応
    canvas.parent("canvas-container");

    // 各マネージャーの初期化
    texManager.init(p);
    uiManager.init(p);
    apcMiniMK2Manager.init();

    // リソースの読み込み
    font = await p.loadFont("/font/DS-DIGIB.TTF");
    logo = await p.loadImage("/image/Flow.png");
    await effectManager.load(
      p,
      "/shader/post.vert",
      "/shader/post.frag",
    );
  };

  // draw は毎フレームのループでシーン更新とポストエフェクトを適用する。
  p.draw = () => {
    p.clear();

    bpmManager.update();
    apcMiniMK2Manager.update(Math.floor(bpmManager.getBeat()));
    // シーンの更新と描画
    texManager.update(p, bpmManager.getBeat(), apcMiniMK2Manager);
    texManager.draw(p, bpmManager.getBeat());

    uiManager.update(p, bpmManager.getBeat(), logger);
    uiManager.draw(p, font, logo, bpmManager.getBeat(), logger);

    effectManager.apply(p, texManager.getTexture(), uiManager.getTexture(), apcMiniMK2Manager.faderValues, bpmManager.getBeat());
  };

  // windowResized はウィンドウサイズ変更時にキャンバスとテクスチャをリサイズする。
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    texManager.resize(p);
    uiManager.resize(p);
  };

  // keyPressed はキー入力イベントを処理する。
  p.keyPressed = () => {
    if (p.keyCode === 32) {
      p.fullscreen(true);
    }
    if (p.keyCode === 13) {
      bpmManager.tapTempo();
    }
  };
};

// p5.js スケッチを起動する。
new p5(sketch);