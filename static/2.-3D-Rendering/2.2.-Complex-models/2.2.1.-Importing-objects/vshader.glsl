attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec3 left_light;
uniform vec3 right_light;

varying vec4 fColor;

void main() {
    vec4 pos = modelMatrix * vPosition;
    vec3 w_li = -normalize(left_light);
    vec3 w_ri = -normalize(right_light);

    float k_a = 1.0;
    vec3 L_a = vec3(0.1);
    vec3 ambient_color = k_a * L_a;
    
    float k_d = 0.75;
    float left_diffuse = max(dot(vNormal.xyz, -w_li), 0.0);
    vec3 L_ld = vec3(0.0, 0.0, 1.0);
    vec3 left_diffuseColor = k_d * left_diffuse * L_ld;

    float right_diffuse = max(dot(vNormal.xyz, -w_ri), 0.0);
    vec3 L_rd = vec3(1.0, 0.0, 0.8);
    vec3 right_diffuseColor = k_d * right_diffuse * L_rd;

    vec3 diffuseColor = left_diffuseColor + right_diffuseColor;
    fColor = vec4(ambient_color + diffuseColor, 1.0);
    gl_Position = projectionMatrix * viewMatrix * pos;
}