precision mediump float;

// ============= Varyings =============
varying vec2 vTexCoord;

// ============= Uniforms =============
uniform float u_beat;
uniform float u_time;
uniform float u_uiProgress;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D u_uiTex;
uniform float u_preUIIndex;
uniform float u_nowUIIndex;

// ============= Constants =============
const vec3 MAIN_COLOR = vec3(0.1, 0.9, 0.5);
const float PI = 3.14159265358979;

// ============= Utility Functions =============

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

mat2 rot(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float atan2(float y, float x) {
    return x == 0. ? sign(y) * PI / 2. : atan(y, x);
}

vec2 xy2pol(vec2 xy) {
    return vec2(atan2(xy.y, xy.x), length(xy));
}

vec2 pol2xy(vec2 pol) {
    return pol.y * vec2(cos(pol.x), sin(pol.x));
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float zigzag(float x) {
    return abs(fract(x * 2.0) - 1.0);
}

float gray(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

vec3 invert(vec3 col) {
    return vec3(1.0) - col;
}

vec3 mix3(vec3 a, vec3 b, float t) {
    return vec3(mix(a.x, b.x, t), mix(a.y, b.y, t), mix(a.z, b.z, t));
}

vec2 repeat(vec2 uv) {
    return fract(floor(abs(uv)) + uv);
}

bool isOutside(vec2 uv) {
    return abs(uv.x - 0.5) > 0.5 || abs(uv.y - 0.5) > 0.5;
}

// ============= Effect Functions =============

vec2 mosaic(vec2 uv, vec2 res, float n) {
    return vec2(
        (floor(uv.x * n) + 0.5) / n,
        (floor(uv.y * n * res.y / res.x) + 0.5) / (n * res.y / res.x)
    );
}

vec3 hsv2rgb(in float h) {
    float s = 1.;
    float v = 1.;
    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6. - K.w);
    return v * mix(vec3(K.x), clamp(p - K.x, 0., 1.), s);
}

// ============= UI Functions =============

/**
 * 領域情報構造体（vec4で表現）
 * x: 中心X座標 (0.0 - 1.0)
 * y: 中心Y座標 (0.0 - 1.0)
 * z: スケール (1.0 = 100%)
 * w: エフェクトID (0=通常, 1=モノクロ, 2=反転, 3=セピア)
 */

/**
 * UIインデックスと領域インデックスから領域情報を取得
 * uiIndex: UIのインデックス (0, 1, 2, ...)
 * regionIndex: 領域のインデックス (0, 1, 2, ...)
 * return: vec4(posX, posY, scale, effectID)
 */
vec4 getRegionInfo(int uiIndex, int regionIndex) {
    // UI 0: テスト用 - 2つの領域（通常とモノクロ）
    if(uiIndex == 0) {
        if(regionIndex == 0) {
            float scl = 0.8;
            return vec4(1.0 - scl * 0.5 - 0.03 * u_resolution.y / u_resolution.x, 1.0 - scl * 0.5 - 0.03, scl, 0.0); // 中央、通常
        }
    }
    // UI 1: 従来の1領域
    else if(uiIndex == 1) {
        if(regionIndex == 0) {
            return vec4(0.5, 0.5, 1.0, 0.0); // 中央、通常
        }
    }
    // UI 2: 4分割レイアウト
    else if(uiIndex == 2) {
        if(regionIndex == 0) {
            return vec4(0.5, 0.5, 1.0, 0.0); // 中央、通常
        }
    }
    // UI 3: シングル（従来互換）
    else if(uiIndex == 3) {
        if(regionIndex == 0) {
            return vec4(0.5, 0.5, 1.0, 0.0); // 中央、通常
        }
    }
    
    // デフォルト: 領域なし
    return vec4(0.0, 0.0, 0.0, -1.0);
}

/**
 * UIインデックスから領域数を取得
 */
int getRegionCount(int uiIndex) {
    if(uiIndex == 0) return 2;      // テスト用
    else if(uiIndex == 1) return 1; // シングル
    else if(uiIndex == 2) return 4; // 4分割
    else if(uiIndex == 3) return 1; // シングル
    return 0;
}

/**
 * エフェクトIDに基づいて色を処理
 * effectID: 0=通常, 1=モノクロ, 2=反転, 3=セピア
 */
vec3 applyEffect(vec3 color, float effectID) {
    if(effectID < 0.5) {
        // 0: 通常
        return color;
    } else if(effectID < 1.5) {
        // 1: モノクロ
        float g = gray(color);
        return vec3(g);
    } else if(effectID < 2.5) {
        // 2: 反転
        return invert(color);
    } else if(effectID < 3.5) {
        // 3: セピア
        float g = gray(color);
        return vec3(g * 1.2, g * 1.0, g * 0.8);
    }
    return color;
}

/**
 * UIインデックスから表示情報を取得（後方互換性のため残す）
 * return: vec3(posX, posY, scale)
 */
vec3 getUIInfo(int index) {
    vec4 region = getRegionInfo(index, 0);
    return region.xyz;
}

/**
 * 領域情報に基づいてUV座標を計算
 */
vec2 calculateRegionUV(vec2 baseUV, vec4 regionInfo) {
    vec2 pos = regionInfo.xy;
    float scl = regionInfo.z;
    
    // スケールと位置の調整
    float rscl = 1. / scl;
    vec2 rpos = vec2(
        map(pos.x, 0.0, 1.0, rscl / 2., -rscl / 2.),
        map(pos.y, 0.0, 1.0, rscl / 2., -rscl / 2.)
    );

    vec2 uv = baseUV;
    uv -= 0.5;
    uv *= rscl;
    uv += rpos;
    uv += 0.5;

    return uv;
}

/**
 * UI遷移を考慮したUV座標を計算
 */
vec2 calculateTransitionUV(vec2 baseUV) {
    vec2 uv = baseUV + vec2(0.0, u_uiProgress);
    float uiIndex = floor(uv.y);
    uv = repeat(uv);

    // 現在と前のUIインデックスから情報を取得
    vec3 uiInfo = uiIndex == 0. 
        ? getUIInfo(int(u_preUIIndex))
        : getUIInfo(int(u_nowUIIndex));
    
    vec2 pos = uiInfo.xy;
    float scl = uiInfo.z;
    
    // スケールと位置の調整
    float rscl = 1. / scl;
    vec2 rpos = vec2(
        map(pos.x, 0.0, 1.0, rscl / 2., -rscl / 2.),
        map(pos.y, 0.0, 1.0, rscl / 2., -rscl / 2.)
    );

    uv -= 0.5;
    uv *= rscl;
    uv += rpos;
    uv += 0.5;

    return uv;
}

/**
 * メインテクスチャのUVに歪みエフェクトを適用
 */
vec2 applyDistortion(vec2 uv) {
    uv -= 0.5;
    uv *= (1. + length(uv) * 0.05) * 0.5;
    uv += 0.5;
    return uv;
}

/**
 * モザイクテクスチャを生成
 */
vec4 generateMosaicTexture(vec2 uv) {
    vec2 mosaicUV = mosaic(uv, u_resolution, 50.0);
    vec4 mosaicTex;
    mosaicTex.r = random(mosaicUV + vec2(1.7, 9.2) + floor(u_beat)) * 0.4 + 0.6;
    mosaicTex.g = random(mosaicUV + vec2(5.2, 1.3) + floor(u_beat)) * 0.5;
    mosaicTex.b = random(mosaicUV + vec2(9.4, 7.2) + floor(u_beat)) * 0.3 + 0.5;
    mosaicTex.a = 1.0;
    return mosaicTex;
}

/**
 * スキャンライン風のジッターエフェクト
 */
vec3 applyScanlineJitter(vec2 uv) {
    if(abs(sin(uv.y + u_time * 0.2)) > 0.999) {
        vec2 jitteredUV = vec2(
            uv.x + random(vec2(uv.x + u_time, uv.y + u_time)) * 0.005,
            uv.y + random(vec2(uv.x + u_time, uv.y + u_time)) * 0.005
        );
        return texture2D(u_tex, jitteredUV).rgb;
    }
    return vec3(0.0); // ジッター適用されない場合（呼び出し側で判定）
}

// ============= Main =============

void main(void) {
    // UI遷移を考慮したベースUV
    vec2 baseUV = vTexCoord + vec2(0.0, u_uiProgress);
    float uiIndexFloat = floor(baseUV.y);
    baseUV = repeat(baseUV);

    // 現在と前のUIインデックス
    int currentUIIndex = uiIndexFloat == 0. ? int(u_preUIIndex) : int(u_nowUIIndex);

    // 最終カラーの初期化
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);
    bool drawn = false;

    // 領域数を取得
    int regionCount = getRegionCount(currentUIIndex);

    // 各領域をループ処理
    for(int i = 0; i < 10; i++) { // 最大10領域（GLSLのループは定数）
        if(i >= regionCount) break;

        // 領域情報を取得
        vec4 regionInfo = getRegionInfo(currentUIIndex, i);
        if(regionInfo.w < -0.5) continue; // 無効な領域

        // 領域のUV座標を計算
        vec2 regionUV = calculateRegionUV(baseUV, regionInfo);

        // 範囲外チェック
        if(isOutside(regionUV)) continue;

        // メインテクスチャの処理
        vec2 mainUV = applyDistortion(regionUV);
        vec4 mainCol = texture2D(u_tex, mainUV);

        // モザイクテクスチャとミックス
        vec4 mosaicTex = generateMosaicTexture(regionUV);
        mainCol.rgb = mix3(mainCol.rgb, mosaicTex.rgb, pow(gray(mainCol.rgb) + 0.2, 4.0));

        // エフェクトを適用
        mainCol.rgb = applyEffect(mainCol.rgb, regionInfo.w);

        // スキャンラインジッター
        // if(abs(sin(regionUV.y + u_time * 0.2)) > 0.999) {
        //     mainCol.rgb = applyScanlineJitter(regionUV);
        //     mainCol.rgb = applyEffect(mainCol.rgb, regionInfo.w);
        // }

        // メインカラーを適用
        if(mainCol.a > 0.0) {
            col.rgb = mainCol.rgb;
            drawn = true;
        }
    }

    // 何も描画されなかった場合は黒
    if(!drawn) {
        col.rgb = vec3(0.0);
    }

    vec4 uiCol = texture2D(u_uiTex, vTexCoord);
    col.rgb += gray(uiCol.rgb) * 0.95 * MAIN_COLOR;

    gl_FragColor = col;
}