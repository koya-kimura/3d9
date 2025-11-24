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
 * UIインデックスから表示情報を取得
 * return: vec3(posX, posY, scale)
 */
vec3 getUIInfo(int index) {
    if(index == 0) {
        return vec3(0.5, 0.5, 1.0);
    } else if(index == 1) {
        return vec3(0.1, 0.7, 0.5);
    } else if(index == 2) {
        return vec3(0.5, 0.5, 0.1);
    } else {
        return vec3(0.0, 0.0, 0.0);
    }
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
    // UV座標の計算
    vec2 transitionUV = calculateTransitionUV(vTexCoord);
    bool outside = isOutside(transitionUV);

    // 最終カラーの初期化
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

    // メインテクスチャの処理
    vec2 mainUV = applyDistortion(transitionUV);
    vec4 mainCol = texture2D(u_tex, mainUV);

    // モザイクテクスチャとミックス
    vec4 mosaicTex = generateMosaicTexture(transitionUV);
    mainCol.rgb = mix3(mainCol.rgb, mosaicTex.rgb, pow(gray(mainCol.rgb) + 0.2, 4.0));

    // メインカラーを適用
    if(mainCol.a > 0.0) {
        col.rgb = mainCol.rgb;
    }

    // スキャンラインジッター
    if(abs(sin(transitionUV.y + u_time * 0.2)) > 0.999) {
        col.rgb = applyScanlineJitter(transitionUV);
    }

    // 範囲外は黒
    if(outside) {
        col.rgb = vec3(0.0);
    }

    // UIテクスチャの合成（p5.jsで既にtranslateされている）
    vec4 uiCol = texture2D(u_uiTex, vTexCoord);
    col.rgb += gray(uiCol.rgb) * 0.95 * MAIN_COLOR;

    gl_FragColor = col;
}