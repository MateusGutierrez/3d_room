"""Gera monitor-frame.png (borda) e monitor-glare.png (reflexo) a partir das medidas
da imagem de referência (Gemini_Generated_Image_*.jpeg), na proporção da tela 3D.
Requer: pip install pillow numpy
uso: python scripts/generate-monitor-frame.py public/img"""
import sys
import numpy as np
from PIL import Image, ImageDraw

out = sys.argv[1]

# Mesmas medidas de screenLayout.ts (unidades do quarto)
FRAME_W, FRAME_H = 0.4965 + 2 * 0.0025, 0.231 + 2 * 0.0025
BEZEL_X, BEZEL_Y = 0.0095, 0.0115

W = 2048
H = round(W * FRAME_H / FRAME_W)
SS = 4  # supersampling para bordas suaves
w, h = W * SS, H * SS
u = w / FRAME_W  # px por unidade
bx, by = BEZEL_X * u, BEZEL_Y * u

# Cores tiradas da imagem: contorno preto, face cinza-escura (mais escura em cima), aresta interna
OUTLINE = (6, 6, 7)
FACE_TOP, FACE_BOTTOM = (34, 34, 36), (48, 48, 50)
INNER_LINE = (8, 8, 9)
INNER_LIP = (70, 70, 74)

radius = by * 0.55
outline = by * 0.12

# Face com gradiente vertical
t = np.linspace(0, 1, h)[:, None, None]
face = (np.array(FACE_TOP) * (1 - t) + np.array(FACE_BOTTOM) * t).repeat(w, axis=1)
img = Image.fromarray(face.astype(np.uint8), 'RGB').convert('RGBA')
d = ImageDraw.Draw(img)

# Contorno externo: desenha o preto e a face por dentro dele
mask = Image.new('L', (w, h), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
ring = Image.new('L', (w, h), 0)
ImageDraw.Draw(ring).rounded_rectangle(
    [outline, outline, w - 1 - outline, h - 1 - outline], radius=radius - outline, fill=255
)
img.paste(Image.new('RGBA', (w, h), OUTLINE + (255,)), (0, 0), Image.eval(ring, lambda v: 255 - v))

# Aresta interna: lábio claro fino + linha preta, depois o vão transparente
lip, line = by * 0.06, by * 0.1
hole = [bx, by, w - bx, h - by]
d.rectangle([hole[0] - lip - line, hole[1] - lip - line, hole[2] + lip + line, hole[3] + lip + line], fill=INNER_LINE + (255,))
d.rectangle([hole[0] - lip, hole[1] - lip, hole[2] + lip, hole[3] + lip], fill=INNER_LIP + (255,))
md.rectangle(hole, fill=0)

# Câmera (pontinho azul-escuro no centro da borda de baixo), como na imagem
cx, cy, r = w / 2, h - by / 2, by * 0.16
for i in range(int(r), 0, -1):
    k = i / r
    col = (int(20 + 25 * (1 - k)), int(22 + 25 * (1 - k)), int(55 + 45 * (1 - k)))
    d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=col + (255,))
d.ellipse([cx - r * 0.35 - r * 0.25, cy - r * 0.35 - r * 0.25, cx - r * 0.35 + r * 0.25, cy - r * 0.35 + r * 0.25], fill=(120, 130, 190, 255))

img.putalpha(mask)
img = img.resize((W, H), Image.LANCZOS)
img.save(f'{out}/monitor-frame.png', optimize=True)

# Reflexo: faixa diagonal clara no canto superior esquerdo (como o vidro da imagem).
# Branco puro; a intensidade final vem da opacity do material (bem baixa).
GW, GH = 1024, round(1024 * (FRAME_H - 2 * BEZEL_Y) / (FRAME_W - 2 * BEZEL_X))
yy, xx = np.mgrid[0:GH, 0:GW].astype(float)
nx, ny = xx / GW, yy / GH
# reta diagonal: de (0.62, 0) até (0.30, 1) em coordenadas normalizadas
edge = 0.62 - 0.32 * ny
dist = (edge - nx) * GW / GH
alpha = np.clip(dist / 0.04, 0, 1)  # borda levemente suave
alpha *= 0.55 + 0.45 * (1 - ny)  # mais forte em cima
# segunda faixa fininha, paralela, como reflexo secundário
band = np.clip(1 - np.abs((edge + 0.06) - nx) * GW / GH / 0.015, 0, 1) * 0.5 * (1 - ny)
alpha = np.clip(alpha + band * (dist < 0), 0, 1)
glare = np.zeros((GH, GW, 4), np.uint8)
glare[..., :3] = 255
glare[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(glare, 'RGBA').save(f'{out}/monitor-glare.png', optimize=True)
print('frame', (W, H), 'glare', (GW, GH))
