import p5 from "p5";
import { GVM } from "./gvm";
import { Easing } from "./easing";
import { angleClamp, lerp } from "./mathUtils";

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
        rotX: angleClamp(beat * 0.05 + GVM.leapRamp(beat, 4, 1, Easing.easeOutCubic) * Math.PI),
        rotY: angleClamp(beat * 0.05 + GVM.leapRamp(beat, 8, 1, Easing.easeOutCubic) * Math.PI),
        rotZ: angleClamp(beat * 0.05 + GVM.leapRamp(beat, 16, 1, Easing.easeOutCubic) * Math.PI),
    };
}

const rotateYCameraPattern = (beat: number = 0): CameraParams => {
    return {
        x: 0,
        y: Math.sin(beat * 0.2) * 100,
        z: -1200,
        rotX: 0,
        rotY: angleClamp(-beat * 0.05 - GVM.leapRamp(beat, 32, 8, Easing.easeInOutSine) * Math.PI),
        rotZ: 0,
    };
}

const aboveCameraPattern = (beat: number = 0): CameraParams => {
    return {
        x: 0,
        y: 0,
        z: -1000 * Easing.zigzag(GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * 2.0),
        rotX: angleClamp(GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * Math.PI),
        rotY: angleClamp(GVM.leapRamp(beat, 16, 4, Easing.easeOutCubic) * Math.PI),
        rotZ: angleClamp(beat * 0.2),
    };
}

// カメラパターン型（静的 or 動的）
export type CameraPattern = CameraParams | ((beat: number) => CameraParams);

// カメラパターン配列（静的値 or 関数）
export const cameraPatterns: CameraPattern[] = [
    { x: 0, y: -0, z: 350, rotX: Math.PI * 0.5, rotY: 0, rotZ: 0 },
    { x: 0, y: -790, z: 0, rotX: 0, rotY: 0, rotZ: Math.PI * 0.5 },
    (beat: number) => rotateYCameraPattern(beat),
    { x: 0, y: 0, z: -400, rotX: Math.PI * 0.51, rotY: 0, rotZ: 0 },
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

    // 遷移の開始カメラパラメータ（現在位置のスナップショット）
    private transitionStartParams: CameraParams | null = null;
    // 目標カメラインデックス
    private targetCameraIndex: number | null = null;
    // 遷移開始時のビート
    private transitionStartBeat: number = 0;
    // 1拍でカメラ遷移
    private beatPerTransition: number = 1.0;

    constructor(p: p5) {
        this.targetCameraIndex = 0;
        this.initZ = (p.height / 2.0) / Math.tan(Math.PI * 30.0 / 180.0);
        this.z -= this.initZ;
    }

    /**
     * カメラパターン番号でカメラを即座にセット
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
     * 新しいカメラへの遷移を開始
     * 遷移中に呼ばれた場合は、現在位置から新しいカメラへ遷移を開始
     * @param patternIndex - 目標カメラパターンのインデックス
     * @param beat - 現在のビート値
     */
    pushCamera(patternIndex: number, beat: number): void {
        // 現在のカメラパラメータをスナップショットとして保存（initZを引く）
        this.transitionStartParams = {
            x: this.x,
            y: this.y,
            z: this.z - this.initZ,
            rotX: this.rotX,
            rotY: this.rotY,
            rotZ: this.rotZ,
        };

        this.targetCameraIndex = patternIndex % cameraPatterns.length;
        this.transitionStartBeat = beat;
    }

    /**
     * カメラパターンのインデックスから実際のCameraParamsを取得
     * @param index - カメラパターンのインデックス
     * @param beat - 動的パターン用のビート値
     * @returns CameraParams
     */
    private getCameraParams(index: number, beat: number): CameraParams {
        const pattern = cameraPatterns[index];
        return typeof pattern === "function" ? pattern(beat) : pattern;
    }

    /**
     * カメラの補間を計算
     * @param beat - 現在のビート値
     * @returns 補間されたCameraParams
     */
    easeCamera(beat: number): CameraParams {
        // 目標カメラが設定されていない場合はデフォルト
        if (this.targetCameraIndex === null) {
            return { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0 };
        }

        // 開始パラメータが設定されていない場合は目標をそのまま返す
        if (this.transitionStartParams === null) {
            return this.getCameraParams(this.targetCameraIndex, beat);
        }

        // 経過ビート数を計算
        const elapsedBeat = beat - this.transitionStartBeat;
        const progress = Math.min(elapsedBeat / this.beatPerTransition, 1.0);

        // 目標カメラパラメータを取得
        const to = this.getCameraParams(this.targetCameraIndex, beat);
        const from = this.transitionStartParams;

        // 補間計算
        const result = {
            x: lerp(from.x, to.x, progress),
            y: lerp(from.y, to.y, progress),
            z: lerp(from.z, to.z, progress),
            rotX: lerp(from.rotX, to.rotX, progress),
            rotY: lerp(from.rotY, to.rotY, progress),
            rotZ: lerp(from.rotZ, to.rotZ, progress),
        };

        // 遷移が完了したら開始パラメータをクリア
        if (progress >= 1.0) {
            this.transitionStartParams = null;
        }

        return result;
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

    resize(p: p5): void {
        this.initZ = (p.height / 2.0) / Math.tan(Math.PI * 30.0 / 180.0);
    }
}