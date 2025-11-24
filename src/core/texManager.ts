import p5 from "p5";

import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager.js";
import { Camera } from "../utils/camera.js";
import { VerticalBoxes } from "../object/VerticalBoxes.js";
import { GridBoxes } from "../object/GridBoxes.js";
import { CircularBoxes } from "../object/CircularBoxes.js";
import { SpiralBoxes } from "../object/SpiralBoxes.js";
import { GroundCircle } from "../object/GroundCircle.js";
import { HorizontalLines } from "../object/HorizontalLines.js";
import { TopBottomEllipses } from "../object/TopBottomEllipses.js";
import { OuterFrameBoxes } from "../object/OuterFrameBoxes.js";

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
    private topBottomEllipses: TopBottomEllipses;
    private outerFrameBoxes: OuterFrameBoxes;

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
        this.topBottomEllipses = new TopBottomEllipses();
        this.outerFrameBoxes = new OuterFrameBoxes();
    }

    init(p: p5): void {
        this.renderTexture = p.createGraphics(p.width, p.height, p.WEBGL);
        this.boxTexture = p.createGraphics(128, 128);
        this.cam = new Camera(p);
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

    update(p: p5, beat: number, apcMiniMK2Manager: APCMiniMK2Manager): void {
        const nowCameraIndex = apcMiniMK2Manager.getParamValues(0)[0] % 7;
        if (nowCameraIndex !== this.cameraIndex) {
            if (!this.cam) {
                throw new Error("Camera not initialized");
            }
            this.cam.pushCamera(nowCameraIndex, beat);
            this.cameraIndex = nowCameraIndex;
        }

        // easeCameraの戻り値を取得してカメラパラメータを適用
        if (!this.cam) {
            throw new Error("Camera not initialized");
        }
        const cameraParams = this.cam.easeCamera(beat);
        this.cam.setCameraParameter(cameraParams);
    }

    draw(p: p5, beat: number): void {
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

        this.boxTexture.clear();
        this.boxTexture.background(0, 50);
        this.boxTexture.strokeWeight(3);
        this.boxTexture.stroke(0, 255, 0);
        this.boxTexture.noFill();
        this.boxTexture.circle(this.boxTexture.width / 2, this.boxTexture.height / 2, this.boxTexture.width);

        texture.push();
        texture.clear();

        texture.ambientLight(20);
        texture.directionalLight(0, 255, 0, -1, 0, 0);
        texture.directionalLight(255, 255, 0, 1, 0, 0);
        texture.directionalLight(255, 0, 0, 0, -1, 0);
        texture.directionalLight(255, 0, 255, 0, 1, 0);

        texture.push();
        this.cam.drawCamera(texture);

        // 各オブジェクトを描画
        this.verticalBoxes.draw(p, texture, beat);
        this.gridBoxes.draw(p, texture, beat, this.boxTexture);
        this.circularBoxes.draw(p, texture, beat);
        this.spiralBoxes.draw(p, texture, beat);
        this.groundCircle.draw(p, texture, beat);
        this.horizontalLines.draw(p, texture, beat);

        texture.pop();

        // 周りパート
        this.topBottomEllipses.draw(p, texture, beat);
        this.outerFrameBoxes.draw(p, texture, beat);

        texture.pop();
    }
}