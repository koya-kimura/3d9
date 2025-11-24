import p5 from "p5";
import { GVM } from "../utils/gvm";
import { Easing } from "../utils/easing";
import { UniformRandom } from "../utils/uniformRandom";

/**
 * 垂直に並ぶ300個の可変高さボックスを描画するクラス
 */
export class VerticalBoxes {
    private readonly BOX_COUNT = 300;
    private readonly BOX_WIDTH = 20;
    private readonly Y_RANGE_MIN = -5000;
    private readonly Y_RANGE_MAX = 5000;
    private readonly HEIGHT_BASE = 150;
    private readonly HEIGHT_VARIATION = 50;

    /**
     * 垂直に並ぶ箱群を描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        for (let i = 0; i < this.BOX_COUNT; i++) {
            const r = 200 * p.map(Math.pow(Math.abs(Math.sin(beat * 0.5 + i * 0.008)), 2), 0, 1, 2, 1);
            const xr = p.map(GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 0), 0, 1, 0.1, 1.0) * r;
            const zr = p.map(GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 2), 0, 1, 0.1, 1.0) * r;
            const angle = beat * p.map(UniformRandom.rand(i, 1), 0, 1, 0.1, 0.3) + UniformRandom.rand(i) * Math.PI * 2.0;
            const x = p.cos(angle) * xr + (GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 1) * 100 - 50);
            const z = p.sin(angle) * zr + (GVM.leapNoise(beat, 4, 1, Easing.easeInOutSine, i, 3) * 100 - 50);
            const y = p.map(p.fract(beat * p.map(UniformRandom.rand(i, 2), 0, 1, 0.05, 0.1) + i * 0.006 + GVM.leapRamp(beat, 16, 4, Easing.easeInOutSine) * 0.5), 0, 1, this.Y_RANGE_MIN, this.Y_RANGE_MAX);
            const h = UniformRandom.rand(i, 10) * p.map(Math.cos(beat * 0.02), -1, 1, 0.9, 1.1) * this.HEIGHT_VARIATION + this.HEIGHT_BASE;

            texture.push();
            texture.translate(x, y, z);
            texture.strokeWeight(0.5);
            texture.specularMaterial(100);
            texture.rotateY(beat * UniformRandom.rand(i) * 0.01 + i * 0.1);
            texture.stroke(255, 200);
            texture.fill(255, 100);
            texture.box(this.BOX_WIDTH, h, this.BOX_WIDTH);
            texture.pop();
        }
    }
}
