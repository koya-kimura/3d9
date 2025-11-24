import p5 from "p5";
import { GVM } from "../utils/gvm";
import { Easing } from "../utils/easing";

/**
 * 螺旋状に配置された300個の小ボックスを描画するクラス
 */
export class SpiralBoxes {
    private readonly BOX_COUNT = 300;
    private readonly ORBIT_RADIUS = 800;
    private readonly BOX_SIZE = 20;
    private readonly NOISE_RANGE = 200;

    /**
     * 螺旋状の小ボックス群を描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        for (let i = 0; i < this.BOX_COUNT; i++) {
            const x = Math.cos(beat + i * 0.1) * this.ORBIT_RADIUS + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 0) * this.NOISE_RANGE - 100;
            const y = Math.cos(beat * 0.01 + i * 0.3) * this.ORBIT_RADIUS + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 1) * 500 - 250;
            const z = Math.sin(beat + i * 0.1) * this.ORBIT_RADIUS + GVM.leapNoise(beat, 8, 2, Easing.easeOutSine, i, 2) * this.NOISE_RANGE - 100;

            texture.push();
            texture.translate(x, y, z);
            texture.strokeWeight(0.5);
            texture.rotateX(beat * 0.2);
            texture.rotateY(beat * 0.3);
            texture.rotateZ(beat * 0.4);
            texture.stroke(255, 200);
            texture.fill(255, 10);
            texture.box(this.BOX_SIZE);
            texture.pop();
        }
    }
}
