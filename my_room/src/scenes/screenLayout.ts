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

// Moldura do monitor (public/img/monitor-frame.png), na frente da tela.
// Cobre a tela e a borda rosa do modelo; o vão do meio é a área visível onde fica o iframe.
// O PNG é gerado com estas medidas (scripts/generate-monitor-frame.py): mudou aqui, gere de novo.
const FRAME_OVERHANG = 0.0035;
const BEZEL_X = 0.0095;
const BEZEL_Y = 0.0115;
export const FRAME_WIDTH = SCREEN_WIDTH + 2 * FRAME_OVERHANG;
export const FRAME_HEIGHT = SCREEN_HEIGHT + 2 * FRAME_OVERHANG;
export const VIEW_WIDTH = FRAME_WIDTH - 2 * BEZEL_X;
export const VIEW_HEIGHT = FRAME_HEIGHT - 2 * BEZEL_Y;

export const IFRAME_URL = 'https://win32-run-chi.vercel.app/';

// O iframe é renderizado no tamanho exato que a tela ocupa na janela (1 px do iframe = 1 px
// na tela). Se ele fosse menor e o 3D o ampliasse, o texto do XP ficaria borrado.
// Abaixo dessa altura o desktop do XP fica apertado demais: usa tela cheia
const MIN_IFRAME_HEIGHT = 450;

// Quanto da janela a tela ocupa no zoom (0.92 = 92%, sobra uma margem)
const ZOOM_FILL = 0.92;

// Medidas pares: o drei centraliza o iframe com translate(-50%,-50%), e meio pixel borra o texto
const even = (value: number) => 2 * Math.round(value / 2);

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
  /** Tamanho do iframe dentro do monitor, em px (igual ao tamanho que ele ocupa na tela) */
  iframeWidth: number;
  iframeHeight: number;
}

/**
 * Calcula a posição da câmera para a tela do monitor caber na janela.
 * A câmera fica de frente para a tela; a distância depende do fov e do aspect da janela.
 */
export function getZoomLayout(viewportWidth: number, viewportHeight: number): ZoomLayout {
  const aspect = viewportWidth / viewportHeight;
  const tanHalfFov = Math.tan(MathUtils.degToRad(CAMERA_FOV / 2));

  // Distância em que um retângulo (w × h) cabe exatamente: pela altura e pela largura
  const fit = (width: number, height: number) => ({
    height: (height * ROOM_SCALE) / 2 / tanHalfFov,
    width: (width * ROOM_SCALE) / 2 / (tanHalfFov * aspect),
  });

  // "contain": o monitor inteiro (com a moldura) aparece, com margem
  const frameFit = fit(FRAME_WIDTH, FRAME_HEIGHT);
  const containDistance = Math.max(frameFit.height, frameFit.width) / ZOOM_FILL;

  // Tamanho que o iframe teria na tela, em px, nessa distância
  const visibleWidth = 2 * containDistance * tanHalfFov * aspect;
  const screenPx = ((VIEW_WIDTH * ROOM_SCALE) / visibleWidth) * viewportWidth;
  const iframeWidth = even(screenPx);
  const iframeHeight = even((screenPx * VIEW_HEIGHT) / VIEW_WIDTH);
  const fullscreen = iframeHeight < MIN_IFRAME_HEIGHT;

  // Em tela cheia, a câmera "mergulha" até o vão da tela cobrir a janela, e aí o iframe assume
  const viewFit = fit(VIEW_WIDTH, VIEW_HEIGHT);
  const distance = fullscreen ? Math.min(viewFit.height, viewFit.width) : containDistance;

  const { x, y, z } = SCREEN_CENTER_WORLD;
  return {
    cameraPosition: { x, y, z: z - distance },
    target: { x, y, z },
    fullscreen,
    iframeWidth,
    iframeHeight,
  };
}
