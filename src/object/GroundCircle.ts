import p5 from "p5";

/**
 * 地面に配置される大きな円を描画するクラス
 */
export class GroundCircle {
    private readonly CIRCLE_SIZE = 10000;

    /**
     * 地面の円を描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        texture.push();
        texture.rotateX(Math.PI / 2);
        texture.noStroke();
        texture.fill(255, 100);
        texture.ellipse(0, 0, this.CIRCLE_SIZE, this.CIRCLE_SIZE);
        texture.pop();
    }
}
