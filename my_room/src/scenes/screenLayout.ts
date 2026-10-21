import { Euler, MathUtils, Matrix4, Quaternion, Vector3 } from 'three';

// Transform do grupo que contém o quarto inteiro (index.tsx)
export const ROOM_POSITION: [number, number, number] = [5, -25, -5];
export const ROOM_SCALE = 25;

export const CAMERA_FOV = 75;

// Referencial do iframe dentro do quarto, alinhado com a tela do monitor (Monitor.tsx)
export const SCREEN_FRAME_POSITION: [number, number, number] = [0.204, 0.855, 0];
export const SCREEN_FRAME_ROTATION: [number, number, number] = [Math.PI / 40, -Math.PI, 0];

// Medidas da malha `monitor` (a área da tela) nesse referencial.
// Tiradas dos vértices do room-draco.glb: centro um pouco acima e 0.0094 atrás da origem.
export const SCREEN_WIDTH = 0.4965;
export const SCREEN_HEIGHT = 0.231;
export const SCREEN_CENTER: [number, number, number] = [0, 0.0019, -0.0094];

export const IFRAME_URL = 'http://localhost:3001/';

// Tamanho do iframe em px, com o mesmo aspect da tela (≈2.15)
export const IFRAME_WIDTH = 1100;
export const IFRAME_HEIGHT = 512;

// Quanto da janela a tela ocupa no zoom (0.92 = 92%, sobra uma margem)
const ZOOM_FILL = 0.92;
// Abaixo dessa escala (px na tela / px do iframe) o texto fica pequeno demais: usa tela cheia
const MIN_READABLE_SCALE = 0.7;

// Centro da tela em coordenadas do mundo (o resultado de aplicar os transforms acima)
export const SCREEN_CENTER_WORLD = new Vector3(...SCREEN_CENTER).applyMatrix4(
  new Matrix4()
    .compose(
      new Vector3(...ROOM_POSITION),
      new Quaternion(),
      new Vector3(ROOM_SCALE, ROOM_SCALE, ROOM_SCALE)
    )
    .multiply(
      new Matrix4().compose(
        new Vector3(...SCREEN_FRAME_POSITION),
        new Quaternion().setFromEuler(new Euler(...SCREEN_FRAME_ROTATION)),
        new Vector3(1, 1, 1)
      )
    )
);

export interface ZoomLayout {
  /** Onde a câmera para no zoom */
  cameraPosition: { x: number; y: number; z: number };
  /** Para onde a câmera olha no zoom (centro da tela) */
  target: { x: number; y: number; z: number };
  /** true = iframe em tela cheia; false = iframe dentro do monitor 3D */
  fullscreen: boolean;
}

/**
 * Calcula a posição da câmera para a tela do monitor caber na janela.
 * A câmera fica de frente para a tela; a distância depende do fov e do aspect da janela.
 */
export function getZoomLayout(viewportWidth: number, viewportHeight: number): ZoomLayout {
  const aspect = viewportWidth / viewportHeight;
  const tanHalfFov = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));
  const halfWidth = (SCREEN_WIDTH * ROOM_SCALE) / 2;
  const halfHeight = (SCREEN_HEIGHT * ROOM_SCALE) / 2;

  // Distância em que a altura cabe exatamente, e em que a largura cabe exatamente
  const fitHeight = halfHeight / tanHalfFov;
  const fitWidth = halfWidth / (tanHalfFov * aspect);

  // "contain": a tela inteira aparece, com margem
  const containDistance = Math.max(fitHeight, fitWidth) / ZOOM_FILL;

  // Tamanho que o iframe teria na tela, em px, nessa distância
  const visibleWidth = 2 * containDistance * tanHalfFov * aspect;
  const screenPx = ((SCREEN_WIDTH * ROOM_SCALE) / visibleWidth) * viewportWidth;
  const fullscreen = screenPx / IFRAME_WIDTH < MIN_READABLE_SCALE;

  // Em tela cheia, a câmera "mergulha" até a tela cobrir a janela, e aí o iframe assume
  const distance = fullscreen ? Math.min(fitHeight, fitWidth) : containDistance;

  const { x, y, z } = SCREEN_CENTER_WORLD;
  return {
    cameraPosition: { x, y, z: z - distance },
    target: { x, y, z },
    fullscreen,
  };
}
