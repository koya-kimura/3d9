// EffectManager はポストエフェクト用のシェーダーを読み込み適用する責務を持つ。
import p5 from "p5";
export class EffectManager {
    private shader: p5.Shader | null;

    // constructor は空のシェーダー参照を初期化する。
    constructor() {
        this.shader = null;
    }

    /**
     * 頂点シェーダーとフラグメントシェーダーのソースコードからシェーダーを作成します。
     * vite-plugin-glslでインポートしたシェーダーソース文字列を受け取り、
     * p5.jsのcreateShader関数を使用してシェーダーオブジェクトを作成します。
     * これによりシェーダーファイルの変更時にHMR（Hot Module Replacement）が動作し、
     * ブラウザを手動でリロードすることなくシェーダーの変更が反映されます。
     *
     * @param p p5.jsのインスタンス。シェーダーの作成機能を提供します。
     * @param vertSource 頂点シェーダーのソースコード文字列。
     * @param fragSource フラグメントシェーダーのソースコード文字列。
     */
    load(p: p5, vertSource: string, fragSource: string): void {
        this.shader = p.createShader(vertSource, fragSource);
    }

    /**
     * 現在のフレームに対してポストエフェクトシェーダーを適用し、最終的な描画を行います。
     * 複数のテクスチャ（ソース、UI、キャプチャ）と、MIDIコントローラーなどからの入力値（フェーダー、グリッド）を
     * シェーダーのUniform変数として設定します。
     * これにより、モザイク、波形歪み、色反転、ジッターなどのエフェクトを動的に制御します。
     * また、全体の不透明度や背景シーンの回転タイプなどもここで反映されます。
     * 最後に画面全体を覆う矩形を描画することで、シェーダーの効果をキャンバス全体に適用します。
     *
     * @param p p5.jsのインスタンス。
     * @param sourceTexture メインの描画内容が含まれるグラフィックスオブジェクト。
     * @param uiTexture UI要素（テキストなど）が含まれるグラフィックスオブジェクト。
     * @param faderValues MIDIフェーダーからの入力値配列。エフェクトの強度制御に使用。
     * @param gridValues MIDIグリッドボタンからの入力値配列。シーン切り替えなどに使用。
     * @param beat 現在のビート情報。リズムに合わせたエフェクト同期に使用。
     * @param colorPaletteRGBArray カラーパレットのRGB値がフラットに並んだ配列。
     */
    apply(p: p5, sourceTexture: p5.Graphics, uiTexture: p5.Graphics, faderValues: number[], beat: number = 0): void {
        if (!this.shader) {
            return;
        }

        p.shader(this.shader);
        this.shader.setUniform("u_beat", beat);
        this.shader.setUniform("u_tex", sourceTexture);
        this.shader.setUniform("u_uiTex", uiTexture);
        this.shader.setUniform("u_resolution", [p.width, p.height]);
        this.shader.setUniform("u_time", p.millis() / 1000.0);

        // this.shader.setUniform("u_colorPalette", colorPaletteRGBArray);
        // this.shader.setUniform("u_colorPaletteLength", Math.floor(colorPaletteRGBArray.length / 3));

        this.shader.setUniform("u_mosaic", faderValues[0]);
        this.shader.setUniform("u_wave", faderValues[1]);
        this.shader.setUniform("u_invert", faderValues[2]);
        this.shader.setUniform("u_jitter", faderValues[3]);
        this.shader.setUniform("u_right", faderValues[4]);

        this.shader.setUniform("u_captureOpacity", faderValues[5]);
        this.shader.setUniform("u_mainOpacity", faderValues[6]);
        this.shader.setUniform("u_bgOpacity", faderValues[7]);
        this.shader.setUniform("u_uiOpacity", faderValues[8]);

        p.rect(0, 0, p.width, p.height);
    }
}