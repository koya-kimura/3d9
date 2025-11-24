import p5 from "p5";
import { GVM } from "./gvm";
import { Easing } from "./easing";

// カメラのパラメータ型
export interface CameraParams {
    x: number;
    y: number;
    z: number;
    rotX: number;
    rotY: number;
    rotZ: number;
}

const rotateCameraPattern = (beat: number = 0): CameraParams => {
    return {
        x: 0,
        y: 0,
        z: -100,
        rotX: beat * 0.05 + GVM.leapRamp(beat, 4, 1, Easing.easeOutCubic) * Math.PI,
        rotY: beat * 0.05 + GVM.leapRamp(beat, 8, 1, Easing.easeOutCubic) * Math.PI,
        rotZ: beat * 0.05 + GVM.leapRamp(beat, 16, 1, Easing.easeOutCubic) * Math.PI,
    };
}

const aboveCameraPattern = (beat: number = 0): CameraParams => {
    return {
        x: 0,
        y: 0,
        z: -1000 * Easing.zigzag(GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * 2.0),
        rotX: GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * Math.PI,
        rotY: GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * Math.PI,
        rotZ: beat * 0.2,
    };
}

// カメラパターン型（静的 or 動的）
export type CameraPattern = CameraParams | ((beat: number) => CameraParams);

// カメラパターン配列（静的値 or 関数）
export const cameraPatterns: CameraPattern[] = [
    (beat: number) => rotateCameraPattern(beat),
    (beat: number) => aboveCameraPattern(beat),
];

export class Camera {
    private initZ: number = 0;
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public rotX: number = 0;
    public rotY: number = 0;
    public rotZ: number = 0;

    constructor(p: p5) {
        this.initZ = (p.height / 2.0) / Math.tan(Math.PI * 30.0 / 180.0);
        this.z -= this.initZ;
    }

    /**
     * カメラパターン番号でカメラをセット
     * @param tex - 描画コンテキスト（p5.Graphics）
     * @param patternIndex - カメラパターンのインデックス
     * @param beat - 動的パターン用のビート値
     */
    setCamera(tex: p5.Graphics, patternIndex: number = 0, beat: number = 0): void {
        const pattern = cameraPatterns[patternIndex % cameraPatterns.length];
        const params = typeof pattern === "function" ? pattern(beat) : pattern;
        this.setCameraParameter(params);
        this.drawCamera(tex);
    }

    /**
     * カメラパラメータを直接セット
     * @param params - カメラパラメータ
     */
    setCameraParameter(params: CameraParams): void {
        this.x = params.x;
        this.y = params.y;
        this.z = params.z + this.initZ;
        this.rotX = params.rotX;
        this.rotY = params.rotY;
        this.rotZ = params.rotZ;
    }

    /**
     * カメラの位置と回転を描画コンテキストに適用する。
     * @param tex - 描画コンテキスト（p5.Graphics）
    **/
    drawCamera(tex: p5.Graphics): void {
        tex.translate(this.x, this.y, this.z);
        tex.rotateX(this.rotX);
        tex.rotateY(this.rotY);
        tex.rotateZ(this.rotZ);
    }
}