precision mediump float;

varying vec2 vTexCoord;

uniform float u_beat;
uniform float u_time;
uniform float u_uiProgress; // UI遷移の進行度 (0.0-1.0)
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D u_uiTex;

uniform float u_preUIIndex;
uniform float u_nowUIIndex;

vec3 mainColor = vec3(0.1, 0.9, 0.5);
float PI = 3.14159265358979;

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

vec2 mosaic(vec2 uv, vec2 res, float n) {
    return vec2((floor(uv.x * n) + 0.5) / n, (floor(uv.y * n * res.y / res.x) + 0.5) / (n * res.y / res.x));
}

float gray(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

vec3 invert(vec3 col) {
    return vec3(1.0) - col;
}

vec3 hsv2rgb(in float h) {
    float s = 1.;
    float v = 1.;

    vec4 K = vec4(1., 2. / 3., 1. / 3., 3.);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6. - K.w);
    vec3 rgb = v * mix(vec3(K.x), clamp(p - K.x, 0., 1.), s);

    return rgb;
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float zigzag(float x) {
    return abs(fract(x * 2.0) - 1.0);
}

vec3 mix3(vec3 a, vec3 b, float t) {
    return vec3(mix(a.x, b.x, t), mix(a.y, b.y, t), mix(a.z, b.z, t));
}

vec2 repeat(vec2 uv){
    return fract(floor(abs(uv)) + uv);
}

bool isOutside(vec2 uv){
    if(abs(uv.x - 0.5) > 0.5 || abs(uv.y - 0.5) > 0.5){
        return true;
    }else{
        return false;
    }
}

vec3 getUIInfo(int index){
    if(index == 0){
        return vec3(0.5, 0.5, 1.0);
    }else if(index == 1){
        return vec3(0.1, 0.7, 0.5);
    }else if(index == 2){
        return vec3(0.5, 0.5, 0.1);
    }else{
        return vec3(0.0, 0.0, 0.0);
    }
}

void main(void) {
    // UI遷移の進行度に合わせてメインテクスチャのUVを上方向にオフセット
    // UIテクスチャはp5.jsのtranslateで既に動いているので、vTexCoordをそのまま使う
    vec2 initialUV = vTexCoord + vec2(0.0, u_uiProgress);

    float uiIndex = floor(initialUV.y);
    initialUV = repeat(initialUV);

    vec2 pos = uiIndex == 0. ? getUIInfo(int(u_preUIIndex)).xy : getUIInfo(int(u_nowUIIndex)).xy;
    float scl = uiIndex == 0. ? getUIInfo(int(u_preUIIndex)).z : getUIInfo(int(u_nowUIIndex)).z;
    
    float rscl = 1. / scl;
    vec2 rpos = vec2(map(pos.x, 0.0, 1.0, rscl/2., -rscl/2.), map(pos.y, 0.0, 1.0, rscl/2., -rscl/2.));

    initialUV -= vec2(0.5);
    initialUV *= rscl;
    initialUV += rpos;
    initialUV += vec2(0.5);

    bool outside = isOutside(initialUV);

    // UIテクスチャはp5.jsのtranslateで既に動いているので、vTexCoordをそのまま使う
    vec2 uv = vTexCoord;
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

    // =============

    vec2 mainUV = initialUV;

    mainUV -= 0.5;
    mainUV *= (1. + length(mainUV) * 0.05) * 0.5;
    mainUV += 0.5;

    vec4 mosaicTex = vec4(0.0);
    vec2 mosaicUV = initialUV;
    // mosaicUV.x += sin(mosaicUV.y * 50.) * .1;
    mosaicUV = mosaic(mosaicUV, u_resolution, 50.0);
    mosaicTex.r = random(mosaicUV + vec2(1.7, 9.2) + floor(u_beat)) * 0.4 + 0.6;
    mosaicTex.g = random(mosaicUV + vec2(5.2, 1.3) + floor(u_beat)) * 0.5;
    mosaicTex.b = random(mosaicUV + vec2(9.4, 7.2) + floor(u_beat)) * 0.3 + 0.5;

    // mainUV = mosaic(mainUV, u_resolution, 200.0);
    vec4 mainCol = texture2D(u_tex, mainUV);

    mainCol.rgb = mix3(mainCol.rgb, mosaicTex.rgb, pow(gray(mainCol.rgb) + 0.2, 4.0));

    // mainCol.rgb = gray(mainCol.rgb) * mainColor;

    if(mainCol.a > 0.0){
        col.rgb = mainCol.rgb;
    }

    // =============

    // col.rgb = (gray(col.rgb) > 0.0 ? 1.0 : 0.0) * vec3(1.0);

    // =============

    if(abs(sin(initialUV.y+u_time * 0.2)) > 0.999){
        vec2 initialUVR = vec2(initialUV.x + random(vec2(initialUV.x+u_time, initialUV.y+u_time)) * 0.005, initialUV.y+random(vec2(initialUV.x+u_time,initialUV.y+u_time))*.005);
        mainCol.rgb = texture2D(u_tex,initialUVR).rgb;
    }

    if(outside){
        col.rgb = vec3(0.0);
    }

    // =============

    // UIテクスチャはp5.jsで既にtranslateされているので、vTexCoordをそのまま使う
    vec4 uiCol = texture2D(u_uiTex, vTexCoord);
    col.rgb += gray(uiCol.rgb) * 0.95 * mainColor;

    gl_FragColor = col;
}