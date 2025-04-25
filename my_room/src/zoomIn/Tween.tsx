import { useFrame } from '@react-three/fiber';
import TWEEN from '@tweenjs/tween.js';

export function TweenUpdater() {
  useFrame(() => {
    TWEEN.update();
  });
  return null;
}
