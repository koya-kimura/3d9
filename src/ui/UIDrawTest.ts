import p5 from "p5";
import { BaseUIDraw } from "./BaseUIDraw";
import { Logger, type LogEntry } from "../utils/Logger";
import type { UIManager } from "../core/uiManager";
import { rectFrame } from "../utils/rect";

/**
 * ログブロックの状態を管理するクラス
 */
class LogBlock {
    entry: LogEntry;
    targetY: number;      // 目標Y位置
    currentY: number;     // 現在のY位置
    alpha: number;        // 透明度
    isNew: boolean;       // 新しいログかどうか
    elapsedTime: number;  // 経過時間

    constructor(entry: LogEntry, targetY: number, isNew: boolean = false) {
        this.entry = entry;
        this.targetY = targetY;
        this.currentY = targetY; // 新しい場合でも目標位置から開始（フェードインのみ）
        this.alpha = isNew ? 0 : 255;
        this.isNew = isNew;
        this.elapsedTime = 0;
    }

    /**
     * 位置と透明度を更新
     */
    update(deltaTime: number, targetY: number): void {
        this.targetY = targetY;

        // イージング（easeOutCubic）
        const speed = 8.0; // 速度係数

        // 位置の補間
        const dy = this.targetY - this.currentY;
        this.currentY += dy * speed * deltaTime;

        // 透明度の補間（新しいログの場合）
        if (this.isNew && this.alpha < 255) {
            this.elapsedTime += deltaTime;

            const FADE_DELAY = 0.3; // フェードイン開始までの遅延（秒）
            const FADE_DURATION = 0.4; // フェードインの期間（秒）

            if (this.elapsedTime > FADE_DELAY) {
                // 遅延後にフェードイン開始
                const fadeProgress = Math.min(1.0, (this.elapsedTime - FADE_DELAY) / FADE_DURATION);
                this.alpha = fadeProgress * 255;
            }
            // else: まだ遅延期間中なのでalpha=0のまま
        }

        // アニメーション完了判定
        if (Math.abs(dy) < 0.5 && this.alpha >= 254) {
            this.isNew = false;
        }
    }
}

/**
 * テスト用UI（ログ表示機能付き・アニメーション対応）
 */
export class UIDrawTest extends BaseUIDraw {
    private logBlocks: LogBlock[] = [];
    private lastLogTimestamp: number = 0;
    private lastUpdateTime: number = 0;

    // レイアウト定数（クラスプロパティとして保持）
    private MAIN_SCALE = 0.8;
    private MARGIN = 0.03;
    private CORNER_RADIUS = 0.0005;
    private STROKE_WEIGHT = 5;
    private LOG_PADDING = 0.01575;
    private LOG_MARGIN = 0.02;
    private TIME_TEXT_SIZE = 0.0189;
    private MESSAGE_TEXT_SIZE = 0.01575;
    private MAX_LOGS = 9; // サイドバーに収まる最大数

    update(p: p5, beat: number): void {
        // デルタタイムの計算
        const currentTime = p.millis();
        const deltaTime = this.lastUpdateTime === 0 ? 0 : (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        // ブロックの位置を更新
        this.logBlocks.forEach((block, index) => {
            const targetY = this.calculateTargetY(index, p.height);
            block.update(deltaTime, targetY);
        });
    }

    draw(
        p: p5,
        tex: p5.Graphics,
        font: p5.Font,
        logo: p5.Image,
        fps: number,
        logger: Logger,
        uiManager: UIManager
    ): void {
        tex.push();
        tex.textFont(font);

        // 画面比率に応じた定数計算
        const cornerRadius = Math.min(tex.width, tex.height) * this.CORNER_RADIUS;
        const aspectRatio = tex.height / tex.width;

        // 四角形の定義
        const rectangles = this.defineRectangles(p, tex, aspectRatio);

        // 描画設定
        tex.noFill();
        tex.strokeWeight(this.STROKE_WEIGHT);
        tex.stroke(255);

        // 四角形を描画
        for (const rect of rectangles) {
            tex.rectMode(rect.mode);
            tex.rect(rect.x, rect.y, rect.width, rect.height, cornerRadius);
        }

        // ログを更新して描画
        this.updateLogs(logger, tex.height);
        this.drawLogs(p, tex, rectangles[2], cornerRadius);

        // 上部バーにタイトルを描画
        const topBar = rectangles[1];
        tex.fill(255, 230);
        tex.noStroke();
        tex.textAlign(p.CENTER, p.CENTER);
        tex.textSize(topBar.height * 0.5); // 高さの50%のサイズ
        tex.text("Flow vol.9 foana * kimura", topBar.x, topBar.y);

        const mainArea = rectangles[0];
        const w = mainArea.width - Math.min(mainArea.width, mainArea.height) * 0.05;
        const h = mainArea.height - Math.min(mainArea.width, mainArea.height) * 0.05;
        rectFrame(p, tex, mainArea.x - w * 0.5, mainArea.y - h * 0.5, w, h, 0.1)

        tex.pop();
    }

    /**
     * 四角形のレイアウトを定義
     */
    private defineRectangles(p: p5, tex: p5.Graphics, aspectRatio: number): any[] {
        return [
            // メイン領域（右下）
            {
                mode: p.CENTER,
                x: (1.0 - this.MAIN_SCALE * 0.5 - this.MARGIN * aspectRatio) * tex.width,
                y: (1.0 - this.MAIN_SCALE * 0.5 - this.MARGIN) * tex.height,
                width: tex.width * this.MAIN_SCALE,
                height: tex.height * this.MAIN_SCALE
            },
            // 上部バー
            {
                mode: p.CENTER,
                x: (1.0 - this.MAIN_SCALE * 0.5 - this.MARGIN * aspectRatio) * tex.width,
                y: 0.08 * tex.height,
                width: tex.width * this.MAIN_SCALE,
                height: tex.height * 0.12
            },
            // 左サイドバー
            {
                mode: p.CORNER,
                x: this.MARGIN * tex.height,
                y: 0.02 * tex.height,
                width: tex.width * 0.15,
                height: tex.height * 0.95
            }
        ];
    }

    /**
     * ログブロックを更新
     */
    private updateLogs(logger: Logger, height: number): void {
        const logs = logger.getRecentLogs(this.MAX_LOGS);

        // 新しいログが追加されたかチェック
        if (logs.length > 0 && logs[0].timestamp !== this.lastLogTimestamp) {
            // 新しいログが追加された
            this.lastLogTimestamp = logs[0].timestamp;

            // 既存のログブロックを保持（最大MAX_LOGS個）
            const newBlocks: LogBlock[] = [];

            for (let i = 0; i < Math.min(logs.length, this.MAX_LOGS); i++) {
                const log = logs[i];
                const targetY = this.calculateTargetY(i, height);

                // 既存のブロックを探す
                const existingBlock = this.logBlocks.find(b => b.entry.timestamp === log.timestamp);

                if (existingBlock) {
                    // 既存のブロック
                    newBlocks.push(existingBlock);
                } else if (i === 0) {
                    // 新しいログ（下から登場）
                    newBlocks.push(new LogBlock(log, targetY, true));
                } else {
                    // その他（通常追加）
                    newBlocks.push(new LogBlock(log, targetY, false));
                }
            }

            this.logBlocks = newBlocks;
        }
    }

    /**
     * 目標Y位置を計算
     */
    private calculateTargetY(index: number, height: number): number {
        const sidebarY = 0.02 * height;
        const sidebarHeight = 0.95 * height;

        // 上下に3%ずつ特別マージン
        const topMargin = sidebarHeight * 0.03;
        const bottomMargin = sidebarHeight * 0.03;
        const usableHeight = sidebarHeight * 0.94; // 残り94%

        // 使用可能高さを9等分
        const blockHeight = usableHeight / this.MAX_LOGS;

        // 下から上に向かって配置（index=0が一番下、index=8が一番上）
        const startY = sidebarY + topMargin;
        return startY + blockHeight * (this.MAX_LOGS - 1 - index);
    }


    /**
     * ログを描画
     */
    private drawLogs(
        p: p5,
        tex: p5.Graphics,
        sidebar: any,
        cornerRadius: number
    ): void {
        const logPadding = tex.height * this.LOG_PADDING;
        const timeTextSize = Math.min(tex.width, tex.height) * this.TIME_TEXT_SIZE;
        const messageTextSize = Math.min(tex.width, tex.height) * this.MESSAGE_TEXT_SIZE;

        // サイドバーの高さと特別マージン
        const sidebarHeight = 0.95 * tex.height;
        const usableHeight = sidebarHeight * 0.94; // 残り94%
        const blockHeight = usableHeight / this.MAX_LOGS;

        tex.fill(255, 230);
        tex.noStroke();
        tex.textAlign(p.LEFT, p.TOP);

        this.logBlocks.forEach((block, i) => {
            const drawY = block.currentY;

            // 一番上（最後）と一番下（最初）は特別扱い
            const isTop = i === this.logBlocks.length - 1;
            const isBottom = i === 0;

            let boxHeight: number;
            let boxY: number;

            if (isTop) {
                // 一番上: 下マージン10%のみ
                boxHeight = blockHeight * 0.9;
                boxY = drawY;
            } else if (isBottom) {
                // 一番下: 上マージン10%のみ
                boxHeight = blockHeight * 0.9;
                boxY = drawY + blockHeight * 0.1;
            } else {
                // 中間: 上下マージン10%ずつ
                boxHeight = blockHeight * 0.8;
                boxY = drawY + blockHeight * 0.1;
            }

            // ログブロックの枠
            tex.noFill();
            tex.stroke(255, block.alpha * 0.6);
            tex.strokeWeight(2);
            tex.rect(
                sidebar.x + logPadding,
                boxY,
                sidebar.width - logPadding * 2,
                boxHeight,
                cornerRadius * 0.5
            );

            // 時刻
            tex.fill(255, block.alpha * 0.9);
            tex.noStroke();
            tex.textSize(timeTextSize);
            tex.text(block.entry.time, sidebar.x + logPadding * 2, drawY + logPadding);

            // メッセージ
            tex.textSize(messageTextSize);
            tex.fill(255, block.alpha * 0.78);
            tex.text(
                block.entry.text,
                sidebar.x + logPadding * 2,
                drawY + logPadding * 2 + timeTextSize
            );
        });
    }
}
