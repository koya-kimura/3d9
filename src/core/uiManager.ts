import p5 from "p5";
import { DateText } from "../utils/dateText";

type UIDrawFunction = (p: p5, tex: p5.Graphics, font: p5.Font) => void;

/**
 * UI描画関数その2（インデックス1）。
 * メインのビジュアルオーバーレイとして機能し、以下の要素を描画します：
 * 1. 中央にアーティスト名（TAKASHIMA & KIMURA）
 * 2. 上下に流れる「OVER!FLOW」のテキストアニメーション
 * 3. 右下に現在のBPMと日付・時刻
 * 4. ビートに合わせて動くインジケーター（矩形）
 * これらはすべてオフスクリーンキャンバス（tex）に描画され、
 * 最終的にメインキャンバスに合成されます。
 *
 * @param context 描画に必要なコンテキスト情報。
 */
const UIDraw01: UIDrawFunction = (p: p5, tex: p5.Graphics, font: p5.Font): void => {
    tex.push();
    tex.textFont(font);

    tex.rectMode(p.CENTER);
    tex.stroke(255, 100);
    tex.noFill();
    tex.rect(tex.width / 2, tex.height / 2, tex.width - 40, tex.height - 40);
    tex.rect(tex.width / 2, tex.height / 2, tex.width - 60, tex.height - 60);

    tex.textAlign(p.RIGHT, p.BOTTOM);
    tex.fill(255, 230);
    tex.noStroke();
    tex.textSize(Math.min(tex.width, tex.height) * 0.025);
    tex.text(DateText.getYYYYMMDD_HHMMSS_format(), tex.width - 45, tex.height - 45);
    tex.pop();
}

const UIDRAWERS: readonly UIDrawFunction[] = [
    UIDraw01,
];

// UIManager は単純なテキストオーバーレイの描画を担当する。
export class UIManager {
    private renderTexture: p5.Graphics | undefined;

    /**
     * UIManagerクラスのコンストラクタです。
     * UI描画用のテクスチャ（Graphicsオブジェクト）の初期化状態を管理し、
     * 現在アクティブなUI描画パターンのインデックスを初期化します。
     * デフォルトではインデックス0（何も表示しないパターン）が選択されます。
     * このクラスは、複数のUIデザインを切り替えて表示するための管理機能を提供します。
     */
    constructor() {
        this.renderTexture = undefined;
    }

    /**
     * UIマネージャーの初期化処理を行います。
     * p5.jsのインスタンスを使用して、画面サイズと同じ大きさの
     * オフスクリーンキャンバス（Graphicsオブジェクト）を作成します。
     * このキャンバスは、UI要素（テキスト、インジケーターなど）の描画先として使用され、
     * メインの描画ループで最終的な画面に重ね合わせられます。
     *
     * @param p p5.jsのインスタンス。
     */
    init(p: p5): void {
        this.renderTexture = p.createGraphics(p.width, p.height);
    }

    /**
     * 現在のUI描画用テクスチャを取得します。
     * このテクスチャには、現在選択されているUIパターンによって描画された
     * すべてのUI要素が含まれています。
     * テクスチャが未初期化の場合（init呼び出し前）はエラーをスローし、
     * 不正な状態での使用を防ぎます。
     *
     * @returns UI要素が描画されたp5.Graphicsオブジェクト。
     * @throws Error テクスチャが初期化されていない場合。
     */
    getTexture(): p5.Graphics {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        return texture;
    }

    /**
     * ウィンドウサイズ変更時に呼び出され、UI描画用テクスチャのサイズを更新します。
     * メインキャンバスのサイズ変更に合わせて、UI用のオフスクリーンキャンバスも
     * 同じサイズにリサイズします。
     * これにより、UI要素の配置やサイズが新しい画面サイズに対して
     * 適切に計算・描画されることを保証します。
     *
     * @param p p5.jsのインスタンス。
     */
    resize(p: p5): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }
        texture.resizeCanvas(p.width, p.height);
    }

    /**
     * UIの描画処理を実行します。
     * 現在アクティブなUIパターン（UIDRAWERS配列内の関数）を選択し、
     * 必要なリソース（テクスチャ、フォント、BPM情報など）を渡して実行します。
     * 描画前にはテクスチャのクリアとpush/popによる状態保存を行い、
     * 他の描画処理への影響を防ぎつつ、クリーンな状態でUIを描画します。
     *
     * @param p p5.jsのインスタンス。
     * @param font UI描画に使用するフォント。
     */
    draw(p: p5, font: p5.Font): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }

        texture.push();
        texture.clear();
        const drawer = UIDRAWERS[0];
        drawer(p, texture, font);

        texture.pop();
    }
}