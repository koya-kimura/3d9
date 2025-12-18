import p5 from "p5";

import { APCMiniMK2Manager } from "../midi/apcmini_mk2/apcMiniMk2Manager";
import { Camera, cameraPatterns } from "../utils/camera/camera";
import { VerticalBoxes } from "../object/VerticalBoxes";
import { GridBoxes } from "../object/GridBoxes";
import { CircularBoxes } from "../object/CircularBoxes";
import { SpiralBoxes } from "../object/SpiralBoxes";
import { GroundCircle } from "../object/GroundCircle";
import { HorizontalLines } from "../object/HorizontalLines";
import { OuterFrameSphere } from "../object/OuterFrameSphere";
import { OuterFrameBoxes } from "../object/OuterFrameBoxes";
import { CircularTorusCylinders } from "../object/CircularTorusCylinders";

export class TexManager {
    private renderTexture: p5.Graphics | null;
    private cam: Camera | null;

    private boxTexture: p5.Graphics | null;
    private cameraIndex: number = 0;

    // オブジェクトインスタンス
    private verticalBoxes: VerticalBoxes;
    private gridBoxes: GridBoxes;
    private circularBoxes: CircularBoxes;
    private spiralBoxes: SpiralBoxes;
    private groundCircle: GroundCircle;
    private horizontalLines: HorizontalLines;
    private outerFrameSphere: OuterFrameSphere;
    private outerFrameBoxes: OuterFrameBoxes;
    private circularTorusCylinders: CircularTorusCylinders;

    constructor() {
        this.renderTexture = null;
        this.boxTexture = null;
        this.cam = null;

        // オブジェクトをインスタンス化
        this.verticalBoxes = new VerticalBoxes();
        this.gridBoxes = new GridBoxes();
        this.circularBoxes = new CircularBoxes();
        this.spiralBoxes = new SpiralBoxes();
        this.groundCircle = new GroundCircle();
        this.horizontalLines = new HorizontalLines();
        this.outerFrameSphere = new OuterFrameSphere();
        this.outerFrameBoxes = new OuterFrameBoxes();
        this.circularTorusCylinders = new CircularTorusCylinders();
    }

    init(p: p5): void {
        this.renderTexture = p.createGraphics(p.width, p.height, p.WEBGL);
        this.boxTexture = p.createGraphics(128, 128);
        this.cam = new Camera(p);

        // boxTextureを一度だけ描画（キャッシュ）
        this.boxTexture.clear();
        this.boxTexture.background(0, 50);
        this.boxTexture.strokeWeight(3);
        this.boxTexture.stroke(0, 255, 0);
        this.boxTexture.noFill();
        this.boxTexture.circle(this.boxTexture.width / 2, this.boxTexture.height / 2, this.boxTexture.width);
    }

    getTexture(): p5.Graphics {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        return texture;
    }

    resize(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        texture.resizeCanvas(p.width, p.height);
        this.cam?.resize(p);
    }

    update(p: p5, beat: number, midiManager: APCMiniMK2Manager): void {
        // MIDI入力からカメラインデックスと遷移モードを取得
        const nowCameraIndex = midiManager.midiInput["cameraSelect"] as number;
        const smoothTransition = midiManager.midiInput["cameraSmoothTransition"] as boolean;

        if (nowCameraIndex !== this.cameraIndex) {
            if (!this.cam) {
                throw new Error("Camera not initialized");
            }

            if (smoothTransition) {
                // スムーズ遷移モード（2拍で遷移）
                this.cam.pushCamera(nowCameraIndex, beat);
            } else {
                // 即座に切り替えモード
                // カメラパラメータを直接取得して設定（drawCameraは呼ばない）
                const pattern = cameraPatterns[nowCameraIndex % cameraPatterns.length];
                const params = typeof pattern === "function" ? pattern(beat) : pattern;
                this.cam.setCameraParameter(params);
                // 遷移状態をクリア（easeCameraで補間されないようにする）
                (this.cam as any).transitionStartParams = null;
            }

            this.cameraIndex = nowCameraIndex;
        }

        // スムーズ遷移モード時のみeaseCameraを適用
        if (smoothTransition) {
            if (!this.cam) {
                throw new Error("Camera not initialized");
            }
            const cameraParams = this.cam.easeCamera(beat);
            this.cam.setCameraParameter(cameraParams);
        }
    }

    draw(p: p5, beat: number, midiManager: APCMiniMK2Manager): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        if (!this.boxTexture) {
            throw new Error("Box Texture not initialized");
        }
        if (!this.cam) {
            throw new Error("Camera not initialized");
        }

        // 白塗りモードの状態を取得
        const whiteMode = midiManager.faderValues[0] == 1.0;

        texture.push();
        texture.clear();

        // 白塗りモードがOFFの時のみライティングを適用
        if (!whiteMode) {
            texture.ambientLight(20);
            texture.directionalLight(0, 255, 0, -1, 0, 0);
            texture.directionalLight(255, 255, 0, 1, 0, 0);
            texture.directionalLight(255, 0, 0, 0, -1, 0);
            texture.directionalLight(255, 0, 255, 0, 1, 0);
        }

        texture.push();
        this.cam.drawCamera(texture);

        // 各オブジェクトを描画
        if (midiManager.midiInput["object00Enabled"]) this.verticalBoxes.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object01Enabled"]) this.gridBoxes.draw(p, texture, beat, this.boxTexture, whiteMode);
        if (midiManager.midiInput["object02Enabled"]) this.circularBoxes.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object03Enabled"]) this.spiralBoxes.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object04Enabled"]) this.groundCircle.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object05Enabled"]) this.horizontalLines.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object06Enabled"]) this.circularTorusCylinders.draw(p, texture, beat, whiteMode);
        if (midiManager.midiInput["object07Enabled"]) this.outerFrameBoxes.draw(p, texture, beat, whiteMode);

        texture.pop(); // カメラ用のpop

        // 周りパート
        if (midiManager.midiInput["object08Enabled"]) this.outerFrameSphere.draw(p, texture, beat, whiteMode);

        texture.pop(); // 最外層のpop
    }
}