import p5 from "p5";
import { Logger } from "../utils/Logger";
import type { UIManager } from "../core/uiManager";

/**
 * UI描画の基底クラス
 * 各UIはこのクラスを継承して実装する
 */
export abstract class BaseUIDraw {
    /**
     * UI描画処理
     * @param p - p5インスタンス
     * @param tex - 描画先のGraphics
     * @param font - 使用するフォント
     * @param logo - ロゴ画像
     * @param fps - 現在のFPS
     * @param logger - ロガーインスタンス
     * @param uiManager - UIManagerインスタンス
     */
    abstract draw(
        p: p5,
        tex: p5.Graphics,
        font: p5.Font,
        logo: p5.Image,
        fps: number,
        logger: Logger,
        uiManager: UIManager
    ): void;

    /**
     * 更新処理（オプション）
     * アニメーションなどの状態更新が必要な場合にオーバーライド
     * @param p - p5インスタンス
     * @param beat - 現在のビート
     */
    update(p: p5, beat: number): void {
        // デフォルトでは何もしない
    }
}
