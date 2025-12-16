# MIDI 設定ガイド

このドキュメントでは、APC Mini MK2 MIDI コントローラーの設定ファイル `config.ts` の構成と使用方法について説明します。

## 概要

`config.ts` は、APC Mini MK2 のボタンやフェーダーの動作を定義する設定ファイルです。ボタンの種類、位置、動作タイプ、LED の色などを設定できます。

## ボタン設定

### MIDI_BUTTON_CONFIGS

グリッドボタン（8x8）の設定を定義します。各ボタンは以下のプロパティを持ちます：

- `key`: ボタンの識別子（ユニークな文字列）
- `type`: ボタンの動作タイプ
- `cells`: ボタンの位置（ページ、行、列）
- `activeColor`: アクティブ時の LED 色
- `inactiveColor`: 非アクティブ時の LED 色
- その他のタイプ固有のプロパティ

### ボタンタイプ

#### radio
複数の選択肢から一つを選択するタイプ。シーン選択などに使用。

```typescript
{
  key: "sceneSelect",
  type: "radio",
  cells: [
    { page: 0, row: 0, col: 0 },
    { page: 0, row: 1, col: 0 },
    // ...
  ],
  activeColor: LED_PALETTE.RED,
  inactiveColor: LED_PALETTE.DIM,
  defaultValue: 0,
}
```

#### toggle
ON/OFF を切り替えるタイプ。エフェクトの有効/無効などに使用。

```typescript
{
  key: "effectEnabled",
  type: "toggle",
  cells: [{ page: 0, row: 0, col: 1 }],
  activeColor: LED_PALETTE.GREEN,
  inactiveColor: LED_PALETTE.DIM,
  defaultValue: false,
}
```

#### oneshot
押すと一度だけトリガーされるタイプ。一時的なアクションに使用。

```typescript
{
  key: "trigger",
  type: "oneshot",
  cells: [{ page: 0, row: 0, col: 2 }],
  activeColor: LED_PALETTE.ORANGE,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### momentary
押している間だけアクティブになるタイプ。フラッシュ効果などに使用。

```typescript
{
  key: "flash",
  type: "momentary",
  cells: [{ page: 0, row: 0, col: 3 }],
  activeColor: LED_PALETTE.CYAN,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### random
指定した radio ボタンを BPM 同期でランダムに切り替えるトグルタイプ。

```typescript
{
  key: "sceneRandom",
  type: "random",
  cells: [{ page: 0, row: 0, col: 7 }],
  randomTarget: "sceneSelect",
  excludeCurrent: true,
  speed: 1,
  activeColor: LED_PALETTE.PURPLE,
  inactiveColor: LED_PALETTE.DIM,
}
```

#### sequence
ビート同期で左から右へ移動するシーケンサー。ステップの ON/OFF を設定可能。

```typescript
{
  key: "kickSequence",
  type: "sequence",
  cells: [
    { page: 0, row: 1, col: 0 },
    { page: 0, row: 1, col: 1 },
    // ...
  ],
  initialPattern: [false, false, false, false, false, false, false, false],
  speed: 1,
  activeColor: LED_PALETTE.ORANGE,
  onColor: LED_PALETTE.GREEN,
  offColor: LED_PALETTE.DIM,
}
```

## フェーダーボタンモード設定

### FADER_BUTTON_MODE

フェーダーボタンの動作モードを定義します。

- `"mute"`: ボタン ON 時、フェーダー値を 0 にミュート
- `"random"`: ボタン ON 時、フェーダー値を BPM 同期でランダムに 0/1 切り替え

```typescript
export const FADER_BUTTON_MODE: FaderButtonMode = "random";
```

## デフォルト値設定

MIDI 接続なしで使用する場合の初期値を設定します。

### DEFAULT_FADER_VALUES
フェーダーの初期値（0.0～1.0）。

### DEFAULT_FADER_BUTTON_TOGGLE_STATE
フェーダーボタンの初期トグル状態。

### DEFAULT_PAGE_INDEX
サイドボタン（ページ選択）の初期インデックス。

## 使用例

実際の設定例は `config.ts` を参照してください。必要に応じてボタンを追加・削除し、プロジェクトに合わせてカスタマイズしてください。

## ボタンの値の取得と使用方法

`config.ts` で設定したボタンの値は、`midiManager.midiInput` オブジェクトから取得できます。

### 基本的な使い方

ビジュアルやエフェクト処理の中で、`midiManager` を通じてボタンの値にアクセスします：

```typescript
// VisualRenderContext から midiManager を取得
const { midiManager } = ctx;

// midiInput からボタンの値を取得
const buttonValue = midiManager.midiInput["buttonKey"];
```

### タイプ別の取得方法

#### radio タイプ

radio タイプのボタンは**数値**（選択されているインデックス）を返します。

```typescript
const sceneIndex = midiManager.midiInput["sceneSelect"]; // 0, 1, 2, ...
```

**使用例**：
```typescript
// config.ts で設定
{
  key: "circleSize",
  type: "radio",
  cells: [
    { page: 0, row: 0, col: 0 },
    { page: 0, row: 0, col: 1 },
  ],
  defaultValue: 0,
}

// multLine.ts などで使用
const sizeIndex = midiManager.midiInput["circleSize"] as number;
const scl = sizeIndex === 0 ? 1.0 : 2.0; // インデックスに応じて値を変更
```

#### toggle タイプ

toggle タイプのボタンは**真偽値**（ON/OFF）を返します。

```typescript
const isEffectEnabled = midiManager.midiInput["effectEnabled"]; // true or false
```

**使用例**：
```typescript
// config.ts で設定
{
  key: "invertColor",
  type: "toggle",
  cells: [{ page: 0, row: 0, col: 1 }],
  defaultValue: false,
}

// シェーダーやビジュアルで使用
if (midiManager.midiInput["invertColor"]) {
  // エフェクトを適用
  col.rgb = invert(col.rgb);
}
```

#### momentary タイプ

momentary タイプは押している間だけ `true` を返します。

```typescript
const isFlashPressed = midiManager.midiInput["flash"]; // 押している間 true
```

#### oneshot タイプ

oneshot タイプは押された瞬間だけ `true` になり、次のフレームで自動的に `false` に戻ります。

```typescript
const isTrigger = midiManager.midiInput["trigger"]; // トリガーされた瞬間だけ true
```

### フェーダーの値の取得

フェーダーの値は `faderValues` 配列から取得します（0.0～1.0 の範囲）：

```typescript
const fader0 = midiManager.faderValues[0]; // 1番目のフェーダー
const fader8 = midiManager.faderValues[8]; // マスターフェーダー
```

**使用例**：
```typescript
// フェーダーで透明度を制御
const alpha = midiManager.faderValues[0] * 255;
tex.fill(255, alpha);
```

### シェーダーでの使用

シェーダーでフェーダーやボタンの値を使用する場合は、uniform として渡す必要があります。

#### effectManager.ts で uniform を設定

```typescript
this.shader.setUniform("u_faderValues", midiManager.faderValues);
```

#### post.frag で使用

```glsl
uniform float u_faderValues[9];

// midi.frag から値を取得
float faderValue = getFaderValue(0); // 1番目のフェーダー

// エフェクトに適用
col.rgb *= faderValue;
```

### 実践例

#### 例 1: ビジュアルの切り替え

```typescript
// config.ts
{
  key: "visualSelect",
  type: "radio",
  cells: [
    { page: 0, row: 0, col: 0 },
    { page: 0, row: 0, col: 1 },
    { page: 0, row: 0, col: 2 },
  ],
  defaultValue: 0,
}

// visualComposer.ts
const visualIndex = midiManager.midiInput["visualSelect"] as number;
switch (visualIndex) {
  case 0:
    this.multLine.draw(ctx);
    break;
  case 1:
    this.otherVisual.draw(ctx);
    break;
  case 2:
    this.anotherVisual.draw(ctx);
    break;
}
```

#### 例 2: エフェクトのON/OFF

```typescript
// config.ts
{
  key: "kaleidoscope",
  type: "toggle",
  cells: [{ page: 0, row: 1, col: 0 }],
  defaultValue: false,
}

// post.frag（GLSLとしてではなくTypeScriptで制御する場合）
if (midiManager.midiInput["kaleidoscope"]) {
  uv = kaleidoscope(uv, 8.0, u_resolution);
}
```

#### 例 3: パラメータの調整

```typescript
// フェーダーで線の本数を制御
const lineCount = Math.floor(midiManager.faderValues[0] * 20); // 0-20本
const n = map(UniformRandom.rand(Math.floor(beat)), 0, 1, 1, lineCount);
```
```