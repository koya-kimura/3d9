import p5 from "p5";
import { GVM } from "../utils/math/gvm";
import { Easing } from "../utils/math/easing";

/**
 * 円形に並ぶ30個のボックスを描画するクラス
 */
export class CircularBoxes {
    private readonly BOX_COUNT = 30;
    private readonly RADIUS = 800;
    private readonly BOX_SIZE = 60;

    /**
     * 円形に並ぶボックスを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        for (let i = 0; i < this.BOX_COUNT; i++) {
            const angle = (i / this.BOX_COUNT) * Math.PI * 2 + beat * 0.1 + GVM.leapRamp(beat, 32, 8, Easing.easeOutCubic) * Math.PI;

            texture.push();
            texture.translate(Math.cos(angle) * this.RADIUS, Math.sin(angle) * this.RADIUS, 0);
            texture.rotateY(-angle + Math.PI / 2);
            texture.stroke(255, 150);
            texture.fill(255, 100);
            texture.box(this.BOX_SIZE);
            texture.pop();
        }
    }
}
