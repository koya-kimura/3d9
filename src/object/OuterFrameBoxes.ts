import p5 from "p5";

/**
 * 回転する2つの外枠ボックスを描画するクラス
 */
export class OuterFrameBoxes {
    private readonly BOX_SIZE = 3000;

    /**
     * 回転する外枠ボックスを描画
     * @param p - p5インスタンス
     * @param texture - 描画コンテキスト
     * @param beat - 現在のビート値
     */
    draw(p: p5, texture: p5.Graphics, beat: number): void {
        texture.push();
        texture.stroke(255, 255, 0);
        texture.noFill();
        texture.rotateX(beat * 0.1);
        texture.rotateY(beat * 0.12);
        texture.rotateZ(beat * 0.17);

        // 1つ目のボックス
        texture.box(this.BOX_SIZE);

        // 2つ目のボックス（45度回転）
        texture.rotateY(Math.PI * 0.25);
        texture.rotateX(Math.PI * 0.25);
        texture.rotateZ(Math.PI * 0.25);
        texture.box(this.BOX_SIZE);

        texture.pop();
    }
}
