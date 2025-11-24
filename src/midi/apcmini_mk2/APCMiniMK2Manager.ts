import { MIDIManager } from "../midiManager";
import { UniformRandom } from "../../utils/uniformRandom";

type FaderButtonMode = "mute" | "random";

const MIDI_STATUS = {
    NOTE_ON: 0x90,
    NOTE_OFF: 0x80,
    CONTROL_CHANGE: 0xB0,
};

const MIDI_OUTPUT_STATUS = {
    NOTE_ON: 0x96,
};

const NOTE_RANGES = {
    GRID: { START: 0, END: 63 },
    FADER_BUTTONS: { START: 100, END: 107 },
    SIDE_BUTTONS: { START: 112, END: 119 }, // ページ切り替えボタン
    FADERS: { START: 48, END: 56 },
    FADER_BUTTON_8: 122, // 9番目のフェーダーボタン
};

const GRID_ROWS = 8;
const GRID_COLS = 8;
const RANDOM_ROW_INDEX = GRID_ROWS - 1;

const LED_COLORS = {
    OFF: 0,
    ON: 3, // シーン選択中/トグルON
    RANDOM_ON_COLOR: 45,
};

const SIDE_ACTIVE_COLORS = [
    5,   // page 0 -> 赤 (ユーザ指定)
    60,  // page 1 -> オレンジ
    56,  // page 2 -> うすピンク
    53,  // page 3 -> 濃いピンク
    37,  // page 4 -> 青
    32,  // page 5 -> 水色
    21,  // page 6 -> 青緑
    13,  // page 7 -> 黄緑
];


export interface GridParameterState {
    selectedRow: number; // 現在の選択インデックス (手動選択時)
    maxOptions: number;  // このパラメーターの有効な選択肢の数 (0-8)
    isRandom: boolean;   // ランダムモードが有効か
    randomValue: number; // BPM同期で更新されるランダムな値
}

export class APCMiniMK2Manager extends MIDIManager {

    public faderValues: number[];
    public faderButtonToggleState: boolean[];

    public currentPageIndex: number;
    private faderButtonMode: FaderButtonMode;

    public gridRadioState: GridParameterState[][];

    constructor(faderButtonMode: FaderButtonMode = "mute") {
        super();
        this.faderValues = new Array(9).fill(0);
        this.faderButtonToggleState = new Array(9).fill(false);
        this.currentPageIndex = 0;
        this.faderButtonMode = faderButtonMode;

        this.gridRadioState = Array(GRID_COLS).fill(0).map(() =>
            Array(GRID_COLS).fill(0).map(() => ({
                selectedRow: 0,
                maxOptions: 0,
                isRandom: false,
                randomValue: 0,
            }))
        );

        this.onMidiMessageCallback = this.handleMIDIMessage.bind(this);
    }

    /**
     * @param beat - 現在のビート数（BPM同期用）
     */
    public update(beat: number): void {
        this.updateRandomGridValues(Math.floor(beat));
        this.updateRandomFaderValues(Math.floor(beat));
        this.midiOutputSendControls();

        console.log(this.faderValues[0])
    }

    /**
     * @param pageIndex - 取得対象のページインデックス（省略時は現在のページ）
     * @returns パラメータ値（0〜maxOptions-1）の配列
     */
    public getParamValues(pageIndex: number = this.currentPageIndex): number[] {
        const params = this.gridRadioState[pageIndex];
        return params.map((param) => (param.isRandom ? param.randomValue : param.selectedRow));
    }

    /**
     * @param pageIndex - 設定対象のページインデックス
     * @param optionsArray - 各カラムのmaxOptionsを指定する数値配列（長さ8）
     */
    public setMaxOptionsForPage(pageIndex: number, optionsArray: number[]): void {
        if (pageIndex < 0 || pageIndex >= GRID_COLS || optionsArray.length !== GRID_COLS) {
            console.error("Invalid page index or options array length for setMaxOptionsForPage.");
            return;
        }

        for (let col = 0; col < GRID_COLS; col++) {
            const param = this.gridRadioState[pageIndex][col];
            const requestedMax = optionsArray[col];
            const clampedMax = Math.max(0, Math.min(GRID_ROWS, requestedMax));
            param.maxOptions = clampedMax;

            if (param.maxOptions <= 0) {
                param.isRandom = false;
                param.selectedRow = 0;
                param.randomValue = 0;
                continue;
            }

            // 選択行が範囲外になってしまうことがあるので収める
            const maxSelectableIndex = param.maxOptions - 1;
            if (param.selectedRow > maxSelectableIndex) {
                param.selectedRow = maxSelectableIndex;
            }

            // ランダム選択の値が範囲外になってしまうことがあるので収める
            if (param.randomValue > maxSelectableIndex) {
                param.randomValue = maxSelectableIndex;
            }
        }
    }

    /**
     * @param beat - 現在のビート数（BPM同期用）
     */
    private updateRandomGridValues(beat: number): void {
        for (let pageIndex = 0; pageIndex < this.gridRadioState.length; pageIndex++) {
            const params = this.gridRadioState[pageIndex];

            for (let col = 0; col < GRID_COLS; col++) {
                const param = params[col];

                if (param.maxOptions === 0) {
                    param.isRandom = false;
                    param.selectedRow = 0;
                    param.randomValue = 0;
                    continue;
                }

                if (!param.isRandom) {
                    continue;
                }

                param.randomValue = Math.floor(UniformRandom.rand(Math.floor(beat), col) * param.maxOptions);
            }
        }
    }

    /**
     * @param beat - 現在のビート数（BPM同期用）
     */
    private updateRandomFaderValues(beat: number): void {
        for (let col = 0; col < 8; col++) {
            if (!this.faderButtonToggleState[col]) {
                continue;
            }
            
            if(this.faderButtonMode === "random"){
                this.faderValues[col] = UniformRandom.rand(Math.floor(beat), col) < 0.5 ? 0 : 1;
            } else if(this.faderButtonMode === "mute"){
                this.faderValues[col] = 0;
            }
        }
    }

    /**
     * @param message - 受信したMIDIメッセージイベント
     */
    protected handleMIDIMessage(message: WebMidi.MIDIMessageEvent): void {
        const [statusByte, dataByte1, dataByte2] = message.data;
        const noteNumber = dataByte1;
        const velocity = dataByte2;

        this.handleFaderButton(statusByte, noteNumber, velocity)
        this.handleSideButton(statusByte, noteNumber, velocity)
        this.handleGridPad(statusByte, noteNumber, velocity)

        this.handleFaderControlChange(statusByte, noteNumber, velocity);
    }

    /**
     * @param statusByte - MIDIステータスバイト
     * @param noteNumber - ノート番号
     * @param velocity - ベロシティ
     */
    private handleFaderButton(statusByte: number, noteNumber: number, velocity: number): void {
        const isFaderButton =
            (statusByte === MIDI_STATUS.NOTE_ON || statusByte === MIDI_STATUS.NOTE_OFF) &&
            ((noteNumber >= NOTE_RANGES.FADER_BUTTONS.START && noteNumber <= NOTE_RANGES.FADER_BUTTONS.END) ||
                noteNumber === NOTE_RANGES.FADER_BUTTON_8);

        if (!isFaderButton) {
            return;
        }

        let index: number;
        if (noteNumber === NOTE_RANGES.FADER_BUTTON_8) {
            index = 8;
        } else {
            index = noteNumber - NOTE_RANGES.FADER_BUTTONS.START;
        }

        this.faderButtonToggleState[index] = (velocity > 0) ? !this.faderButtonToggleState[index] : this.faderButtonToggleState[index];
    }

    /**
     * @param statusByte - MIDIステータスバイト
     * @param noteNumber - ノート番号
     * @param velocity - ベロシティ
     */
    private handleSideButton(statusByte: number, noteNumber: number, velocity: number): void {
        const isSideButton = statusByte === MIDI_STATUS.NOTE_ON &&
            noteNumber >= NOTE_RANGES.SIDE_BUTTONS.START &&
            noteNumber <= NOTE_RANGES.SIDE_BUTTONS.END;

        if (!isSideButton) {
            return;
        }

        if (velocity <= 0) {
            return;
        }

        const pageIndex = noteNumber - NOTE_RANGES.SIDE_BUTTONS.START;
        if (pageIndex < 0 || pageIndex >= GRID_COLS) {
            return;
        }
        this.currentPageIndex = pageIndex;
    }

    /**
     * @param statusByte - MIDIステータスバイト
     * @param noteNumber - ノート番号
     * @param velocity - ベロシティ
     */
    private handleGridPad(statusByte: number, noteNumber: number, velocity: number): void {
        const isGridPad = statusByte === MIDI_STATUS.NOTE_ON &&
            noteNumber >= NOTE_RANGES.GRID.START &&
            noteNumber <= NOTE_RANGES.GRID.END;

        if (!isGridPad) {
            return;
        }

        const gridIndex = noteNumber - NOTE_RANGES.GRID.START;
        const col = gridIndex % GRID_COLS;
        const row = GRID_ROWS - 1 - Math.floor(gridIndex / GRID_COLS); // 反転しているので補正

        const param = this.gridRadioState[this.currentPageIndex][col];

        if (velocity > 0) {
            // ボタンON
            if (row === RANDOM_ROW_INDEX) {
                param.isRandom = !param.isRandom;
            } else {
                const safeIndex = Math.min(row, param.maxOptions - 1);
                param.isRandom = false;
                param.selectedRow = safeIndex;
            }
        }
    }

    /**
     * @param statusByte - MIDIステータスバイト
     * @param noteNumber - ノート番号
     * @param value - フェーダー値（0-127）
     */
    private handleFaderControlChange(statusByte: number, noteNumber: number, value: number): void {
        const isFaderControlChange = statusByte === MIDI_STATUS.CONTROL_CHANGE &&
            noteNumber >= NOTE_RANGES.FADERS.START &&
            noteNumber <= NOTE_RANGES.FADERS.END;

        if (!isFaderControlChange) {
            return;
        }

        const index = noteNumber - NOTE_RANGES.FADERS.START;
        const normalizedValue = value / 127;
        this.faderValues[index] = normalizedValue;
    }

    /**
     * 各種LED出力をまとめて送信
     */
    protected midiOutputSendControls(): void {
        this.sendPageButtonLeds();
        this.sendGridPadLeds();
        this.sendFaderButtonLeds();
    }

    /**
     * ページ切り替えボタンのLED出力
     */
    private sendPageButtonLeds(): void {
        for (let i = 0; i < 8; i++) {
            const note = NOTE_RANGES.SIDE_BUTTONS.START + i;
            const velocity = (i === this.currentPageIndex) ? LED_COLORS.ON : LED_COLORS.OFF;
            this.send(MIDI_STATUS.NOTE_ON, note, velocity);
        }
    }

    /**
     * グリッドパッドのLED出力
     */
    private sendGridPadLeds(): void {
        const currentPage = this.gridRadioState[this.currentPageIndex];

        for (let col = 0; col < GRID_COLS; col++) {
            const param = currentPage[col];

            for (let row = 0; row < GRID_ROWS; row++) {
                const gridIndex = (GRID_ROWS - 1 - row) * GRID_COLS + col;
                const note = NOTE_RANGES.GRID.START + gridIndex;
                const velocity = this.getGridPadVelocity(param, row, this.currentPageIndex);
                this.send(MIDI_OUTPUT_STATUS.NOTE_ON, note, velocity);
            }
        }
    }

    /**
     * フェーダーボタンのLED出力
     */
    private sendFaderButtonLeds(): void {
        for (let i = 0; i < 9; i++) {
            const note = (i < 8)
                ? NOTE_RANGES.FADER_BUTTONS.START + i
                : NOTE_RANGES.FADER_BUTTON_8;
            const velocity = this.faderButtonToggleState[i] ? LED_COLORS.ON : LED_COLORS.OFF;
            this.send(MIDI_STATUS.NOTE_ON, note, velocity);
        }
    }

    /**
     * @param param - グリッドパッドのパラメータ状態
     * @param row - 行インデックス
     * @param pageIndex - ページインデックス
     * @returns LEDベロシティ値
     */
    private getGridPadVelocity(param: GridParameterState, row: number, pageIndex: number): number {
        if (param.maxOptions <= 0) {
            return LED_COLORS.OFF;
        }

        if (row === RANDOM_ROW_INDEX) {
            return param.isRandom ? LED_COLORS.RANDOM_ON_COLOR : LED_COLORS.ON;
        }

        if (row >= param.maxOptions) {
            return LED_COLORS.OFF;
        }

        const currentValue = param.isRandom ? param.randomValue : param.selectedRow;
        if (row === currentValue) {
            return SIDE_ACTIVE_COLORS[pageIndex] ?? LED_COLORS.ON;
        }

        return LED_COLORS.ON;
    }

    /**
     * @param status - MIDIステータスバイト
     * @param note - ノート番号
     * @param velocity - ベロシティ
     */
    private send(status: number, note: number, velocity: number): void {
        this.sendMessage([status, note, velocity]);
    }

    /**
     * 初期化処理
     */
    public async init(): Promise<void> {
    }
}