import p5 from "p5";
import { Easing } from "../utils/math/easing";

/**
 * 3x3x3グリッド配置のテクスチャ付きボックスを描画するクラス
 */
export class GridBoxes {
    private readonly BASE_SPACING = 200;
    private readonly BOX_SIZE = 50;

    /**
     * 3x3x3グリッドボックスを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     * @param boxTexture - ボックスに適用するテクスチャ（オプション）
     */
    draw(p: p5, texture: p5.Graphics, beat: number, boxTexture?: p5.Graphics): void {
        for (let ix = -1; ix <= 1; ix++) {
            for (let iy = -1; iy <= 1; iy++) {
                for (let iz = -1; iz <= 1; iz++) {
                    const r = this.BASE_SPACING * p.map(Easing.easeInOutBack(Easing.zigzag(beat)), 0, 1, 1.0, 1.01);

                    texture.push();
                    texture.translate(ix * r, iy * r, iz * r);
                    texture.fill(100 + ix * 50, 100 + iy * 50, 100 + iz * 50);
                    texture.stroke(200, 20, 150);
                    texture.strokeWeight(1);
                    texture.rotateX(beat * 0.04 + ix);
                    texture.rotateY(beat * 0.04 + iy);
                    texture.rotateZ(beat * 0.04 + iz);
                    texture.scale(1.0 + Easing.easeInOutExpo(Easing.zigzag(beat)) * 0.5);
                    if (boxTexture) texture.texture(boxTexture);
                    texture.box(this.BOX_SIZE);
                    texture.pop();
                }
            }
        }
    }
}
