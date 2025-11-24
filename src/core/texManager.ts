import p5 from "p5";

import { APCMiniMK2Manager } from "../midi/apcmini_mk2/APCMiniMK2Manager";
import { Camera } from "../utils/camera";
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
    private objectShow: boolean[] = Array.from({ length: 9 }, () => false);

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

        for (let i in this.objectShow) {
            this.objectShow[i] = apcMiniMK2Manager.faderValues[i] == 1;
        }
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
        if (this.objectShow[0]) this.verticalBoxes.draw(p, texture, beat);
        if (this.objectShow[1]) this.gridBoxes.draw(p, texture, beat, this.boxTexture);
        if (this.objectShow[2]) this.circularBoxes.draw(p, texture, beat);
        if (this.objectShow[3]) this.spiralBoxes.draw(p, texture, beat);
        if (this.objectShow[4]) this.groundCircle.draw(p, texture, beat);
        if (this.objectShow[5]) this.horizontalLines.draw(p, texture, beat);
        if (this.objectShow[6]) this.circularTorusCylinders.draw(p, texture, beat);
        if (this.objectShow[7]) this.outerFrameBoxes.draw(p, texture, beat);

        texture.pop(); // カメラ用のpop

        // 周りパート
        if (this.objectShow[8]) this.outerFrameSphere.draw(p, texture, beat); // 見直す

        texture.pop(); // 最外層のpop
    }
}