import p5 from "p5";
import { GVM } from "../utils/gvm";
import { Easing } from "../utils/easing";

/**
 * 100個の横線とキューブを描画するクラス
 */
export class HorizontalLines {
    private readonly LINE_COUNT = 16 * 4;
    private readonly Y_RANGE = 1000;
    private readonly LINE_LENGTH = 1000;
    private readonly CUBE_SIZE = 3;

    /**
     * 横線とキューブを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        texture.push();
        for (let i = 0; i < this.LINE_COUNT; i++) {
            const y = p.map(i, 0, this.LINE_COUNT, -0.5, 0.5) * this.Y_RANGE;
            const ry = p.map(i, 0, this.LINE_COUNT, 0, Math.PI * 2) + beat * 0.1 + GVM.leapRamp(beat, 8, 2, Easing.easeInOutSine) * Math.PI * 0.5 + GVM.leapRamp(beat + i % 16, 16, 16, Easing.easeInOutSine) * Math.PI * 0.5;

            texture.push();
            texture.translate(0, y, 0);
            texture.rotateY(ry);
            texture.fill(255, 50);
            texture.strokeWeight(0.5);
            texture.stroke(255, 255, 0, 100);
            texture.line(-this.LINE_LENGTH / 2, 0, 0, this.LINE_LENGTH / 2, 0, 0);

            texture.push();
            texture.translate(this.LINE_LENGTH / 2, 0, 0);
            texture.rotateY(beat * 0.01 + i * 0.01);
            texture.rotateX(beat * 0.01 + i * 0.01);
            texture.stroke(255, 255, 0, 100);
            texture.box(this.CUBE_SIZE);
            texture.pop();

            texture.push();
            texture.translate(-this.LINE_LENGTH / 2, 0, 0);
            texture.rotateY(beat * 0.01 + i * 0.01);
            texture.rotateZ(beat * 0.01 + i * 0.01);
            texture.stroke(255, 255, 0, 100);
            texture.box(this.CUBE_SIZE);
            texture.pop();

            texture.pop();
        }
        texture.pop();
    }
}
