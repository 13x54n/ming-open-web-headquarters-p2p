"use client";

import { useScrollPosition } from '@/hooks/useScrollPosition';

export default function ScrollPositionProvider() {
  useScrollPosition();
  return null;
}
