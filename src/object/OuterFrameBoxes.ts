import p5 from "p5";

/**
 * 回転する2つの外枠ボックスを描画するクラス
 */
export class OuterFrameBoxes {
    private readonly BOX_SIZE = 20000;

    /**
     * 回転する外枠ボックスを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        texture.push();
        texture.stroke(255, 255, 0);
        texture.strokeWeight(0.5);
        texture.line(-this.BOX_SIZE, 0, 0, this.BOX_SIZE, 0, 0);
        texture.line(0, -this.BOX_SIZE, 0, 0, this.BOX_SIZE, 0);
        texture.line(0, 0, -this.BOX_SIZE, 0, 0, this.BOX_SIZE);
        texture.pop();
    }
}
