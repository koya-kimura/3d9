precision mediump float;

varying vec2 vTexCoord;

uniform float u_beat;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_tex;
uniform sampler2D u_uiTex;

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

void main(void) {
    vec2 uv = vTexCoord;
    vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

    // =============

    vec2 bgUV = vTexCoord;
    vec4 bgCol = vec4(0.0, 0.0, 0.0, 1.0);
    // bgUV -= vec2(0.5);
    // bgUV *= rot(PI * 0.25);
    // bgUV += 0.5;
    // bgCol = vec4(mainColor * (mod(floor(bgUV.x * 20.0), 2.0) == 1.0 ? 1.0 : 0.0), 0.5);

    col = bgCol;

    // =============

    vec2 mainUV = vTexCoord;

    mainUV -= 0.5;
    mainUV *= (1. + length(mainUV) * 0.05) * 0.5;
    mainUV += 0.5;

    vec3 mosaicTex = vec3(0.0);
    vec2 mosaicUV = vTexCoord;
    mosaicUV = mosaic(mosaicUV, u_resolution, 20.0);
    mosaicTex.r = random(mosaicUV + vec2(1.7, 9.2) + floor(u_beat)) * 0.4 + 0.6;
    mosaicTex.g = random(mosaicUV + vec2(5.2, 1.3) + floor(u_beat)) * 0.5;
    mosaicTex.b = random(mosaicUV + vec2(9.4, 7.2) + floor(u_beat)) * 0.3 + 0.5;

    // mainUV = mosaic(mainUV, u_resolution, 200.0);
    vec4 mainCol = texture2D(u_tex, mainUV);

    mainCol.rgb = mix3(mainCol.rgb, mosaicTex, pow(gray(mainCol.rgb) + 0.3, 3.0));

    // mainCol.rgb = gray(mainCol.rgb) * mainColor;

    if(mainCol.a > 0.0){
        col.rgb = mainCol.rgb;
    }

    // =============

    col.rgb = (gray(col.rgb) > 0.0 ? 1.0 : 0.0) * vec3(1.0);

    // =============

    if(abs(sin(vTexCoord.y+u_time * 0.2)) > 0.999){
        vec2 vTexCoordR = vec2(vTexCoord.x + random(vec2(vTexCoord.x+u_time, vTexCoord.y+u_time)) * 0.005, vTexCoord.y+random(vec2(vTexCoord.x+u_time,vTexCoord.y+u_time))*.005);
        mainCol.rgb = texture2D(u_tex,vTexCoordR).rgb;
    }

    vec4 uiCol = texture2D(u_uiTex, vTexCoord);
    col.rgb += gray(uiCol.rgb) * 0.95 * mainColor;

    gl_FragColor = col;
}