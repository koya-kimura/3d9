/**
 * MIDI設定ファイル
 * APC Mini MK2のボタン・セルの設定を定義します。
 */
import type { ButtonConfig, FaderButtonMode } from "../../types";
import { LED_PALETTE } from "./ledPalette";

// ========================================
// ボタン設定
// ========================================

/**
 * グリッドボタンの設定
 * 必要に応じてページ・行・列を指定してボタンを登録してください。
 */
export const MIDI_BUTTON_CONFIGS: ButtonConfig[] = [
  {
    key: "object00Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 0 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object01Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 1 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object02Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 2 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object03Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 3 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object04Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 4 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object05Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 5 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object06Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 6 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object07Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 0, col: 7 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "object08Enabled",
    type: "toggle",
    cells: [{ page: 0, row: 1, col: 0 }],
    activeColor: LED_PALETTE.GREEN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "whiteModeEnabled",
    type: "toggle",
    cells: [{ page: 0, row: 1, col: 1 }],
    activeColor: LED_PALETTE.WHITE,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: false,
  },
  {
    key: "cameraSelect",
    type: "radio",
    cells: [
      { page: 0, row: 2, col: 0 },
      { page: 0, row: 2, col: 1 },
      { page: 0, row: 2, col: 2 },
      { page: 0, row: 2, col: 3 },
      { page: 0, row: 2, col: 4 },
      { page: 0, row: 2, col: 5 },
    ],
    activeColor: LED_PALETTE.CYAN,
    inactiveColor: LED_PALETTE.DIM,
    defaultValue: 4, // デフォルトはカメラ4(rotateCameraPattern)
  },
];

// ========================================
// フェーダーボタンモード設定
// ========================================

/**
 * フェーダーボタンのモード
 * - "mute": フェーダーボタンON時、フェーダー値を0にミュート
 * - "random": フェーダーボタンON時、フェーダー値をBPM同期でランダムに0/1切り替え
 */
export const FADER_BUTTON_MODE: FaderButtonMode = "random";

// ========================================
// デフォルト値設定
// MIDI接続なしで使用する場合の初期値
// ========================================

/**
 * フェーダーのデフォルト値（9本分: 0-7 + マスター）
 * 値は0.0～1.0の範囲
 */
export const DEFAULT_FADER_VALUES: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];

/**
 * フェーダーボタンのデフォルトトグル状態（9本分）
 * true = ON（ミュートまたはランダム有効）
 */
export const DEFAULT_FADER_BUTTON_TOGGLE_STATE: boolean[] = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];

/**
 * サイドボタン（ページ選択）のデフォルトインデックス
 * 0-7の範囲（ページ0～7）
 */
export const DEFAULT_PAGE_INDEX: number = 0;
