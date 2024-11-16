attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec3 texCoords;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 texMatrix;

void main() {
    vec4 transformedPos = texMatrix * vPosition;
    texCoords = normalize(transformedPos.xyz / transformedPos.w);
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}