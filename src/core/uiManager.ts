import p5 from "p5";
import { Easing } from "../utils/easing";
import { Logger } from "../utils/Logger";
import { BaseUIDraw } from "../ui/BaseUIDraw";
import { UIDrawTest } from "../ui/UIDrawTest";
import { UIDraw01 } from "../ui/UIDraw01";
import { UIDraw02 } from "../ui/UIDraw02";
import { UIDraw03 } from "../ui/UIDraw03";

const UIDRAWERS: readonly BaseUIDraw[] = [
    new UIDrawTest(),
    new UIDraw01(),
    new UIDraw02(),
    new UIDraw03(),
];

// UIManager は単純なテキストオーバーレイの描画を担当する。
export class UIManager {
    private renderTexture: p5.Graphics | undefined;
    private fps: number = 60.0;
    private lastLogTime: number = 0; // 最後にログを記録した時刻

    // Loggerインスタンス（5分保持）
    private static logger: Logger = new Logger(5);

    // UI遷移の管理
    public currentUiIndex: number = 0;
    public targetUiIndex: number = 0;
    private transitionStartBeat: number = 0;
    private isTransitioning: boolean = false;
    private beatPerTransition: number = 2.0; // 2拍でUI遷移
    private currentProgress: number = 0.0; // 現在の進行度を保持

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
     * UIインデックスを変更し、スライド遷移を開始します。
     * @param uiIndex - 遷移先のUIインデックス
     * @param beat - 現在のビート値
     */
    pushUiIndex(uiIndex: number, beat: number): void {
        if (uiIndex === this.targetUiIndex) {
            return; // 同じUIへの遷移は無視
        }
        this.currentUiIndex = this.targetUiIndex;
        this.targetUiIndex = uiIndex % UIDRAWERS.length;
        this.transitionStartBeat = beat;
        this.isTransitioning = true;
    }

    /**
     * 現在のUI遷移の進行度を取得します。
     * @returns 遷移進行度（0.0 - 1.0）、遷移中でなければ0.0
     */
    getUiTransitionProgress(): number {
        return this.isTransitioning ? this.currentProgress : 0.0;
    }

    update(p: p5, beat: number, logger: Logger): void {
        // FPS計測
        if (p.millis() % 300 < 20) this.fps = p.frameRate();

        // 5秒ごとにFPSをログに記録
        const now = p.millis();
        if (now - this.lastLogTime >= 5000) {
            logger.log(`FPS: ${this.fps.toFixed(2)}`);
            this.lastLogTime = now;
        }
    }

    /**
     * UIの描画処理を実行します。
     * 遷移中は2つのUIを左右にスライドさせながら描画します。
     *
     * @param p p5.jsのインスタンス。
     * @param font UI描画に使用するフォント。
     * @param logo ロゴ画像
     * @param beat 現在のビート値
     */
    draw(p: p5, font: p5.Font, logo: p5.Image, beat: number, logger: Logger): void {
        const texture = this.renderTexture;
        if (!texture) {
            throw new Error("Texture not initialized");
        }

        texture.push();
        texture.clear();

        // 遷移の進行度を計算
        let progress = 0;
        if (this.isTransitioning) {
            const elapsedBeat = beat - this.transitionStartBeat;
            const rawProgress = Math.min(elapsedBeat / this.beatPerTransition, 1.0);
            progress = Easing.easeOutSine(rawProgress); // イージングを適用
            this.currentProgress = progress; // 進行度を保存

            if (rawProgress >= 1.0) {
                // 遷移完了
                this.isTransitioning = false;
                this.currentUiIndex = this.targetUiIndex;
                this.currentProgress = 0.0;
            }
        } else {
            this.currentProgress = 0.0;
        }


        if (this.isTransitioning) {
            // 遷移中：2つのUIを描画
            const currentDrawer = UIDRAWERS[this.currentUiIndex];
            const targetDrawer = UIDRAWERS[this.targetUiIndex];

            // 各UIのupdateを呼び出す
            currentDrawer.update(p, beat);
            targetDrawer.update(p, beat);

            // 現在のUI（上にスライドアウト）
            texture.push();
            texture.translate(0, -progress * texture.height);
            currentDrawer.draw(p, texture, font, logo, this.fps, logger, this);
            texture.pop();

            // 次のUI（下からスライドイン）
            texture.push();
            texture.translate(0, (1 - progress) * texture.height);
            targetDrawer.draw(p, texture, font, logo, this.fps, logger, this);
            texture.pop();
        } else {
            // 通常：現在のUIのみ描画
            const drawer = UIDRAWERS[this.currentUiIndex];
            drawer.update(p, beat);
            drawer.draw(p, texture, font, logo, this.fps, logger, this);
        }

        texture.pop();
    }
}