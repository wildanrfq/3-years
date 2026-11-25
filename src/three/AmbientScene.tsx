import { Component, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ThemeMode } from '../hooks/useTheme';

interface AmbientSceneProps {
  theme: ThemeMode;
  variant?: 'gate' | 'intro';
}

function checkWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function AmbientScene({ theme, variant = 'intro' }: AmbientSceneProps) {
  const reducedMotion = useReducedMotion();
  const [webglSupported] = useState<boolean>(() => checkWebGLAvailable());
  const [tabVisible, setTabVisible] = useState<boolean>(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  );
  const parallaxRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onVisChange = () => {
      setTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      parallaxRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      parallaxRef.current = {
        x: Math.max(-1, Math.min(1, e.gamma / 30)),
        y: Math.max(-1, Math.min(1, (e.beta - 45) / 30)),
      };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [reducedMotion]);

  const fallbackBackdrop = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sage-100/80 via-sage-50 to-sage-100/80"
    />
  );

  if (reducedMotion || !webglSupported) {
    return fallbackBackdrop;
  }

  return (
    <SceneErrorBoundary fallback={fallbackBackdrop}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-85">
        <Canvas
          dpr={[1, 1.5]}
          frameloop={tabVisible ? 'always' : 'never'}
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        >
          <FloatingStage theme={theme} variant={variant} parallaxRef={parallaxRef} />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}

function FloatingStage({
  theme,
  variant,
  parallaxRef,
}: {
  theme: ThemeMode;
  variant: 'gate' | 'intro';
  parallaxRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.25);
    shape.bezierCurveTo(0, 0.45, -0.35, 0.45, -0.35, 0.18);
    shape.bezierCurveTo(-0.35, -0.05, 0, -0.25, 0, -0.4);
    shape.bezierCurveTo(0, -0.25, 0.35, -0.05, 0.35, 0.18);
    shape.bezierCurveTo(0.35, 0.45, 0, 0.45, 0, 0.25);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 1,
      curveSegments: 6,
    });
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.42);
    shape.quadraticCurveTo(0.28, -0.1, 0, 0.42);
    shape.quadraticCurveTo(-0.28, -0.1, 0, -0.42);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
      curveSegments: 6,
    });
  }, []);

  const items = useMemo(
    () => [
      { kind: 'heart' as const, pos: [-2.4, 1.5, -0.6] as [number, number, number], scale: 0.85, speed: 0.7, color: '#F2CFC4' },
      { kind: 'heart' as const, pos: [2.3, -1.2, -0.4] as [number, number, number], scale: 0.95, speed: 0.6, color: '#F2CFC4' },
      { kind: 'leaf' as const, pos: [2.6, 1.6, -1.1] as [number, number, number], scale: 1.05, speed: 0.55, color: '#7F9C70' },
      { kind: 'leaf' as const, pos: [-2.6, -1.5, -0.9] as [number, number, number], scale: 0.95, speed: 0.65, color: '#9CB38E' },
      { kind: 'orb' as const, pos: [-1.4, -2.1, -1.5] as [number, number, number], scale: 0.45, speed: 0.5, color: '#D0DCC8' },
      { kind: 'orb' as const, pos: [1.5, 2.2, -1.6] as [number, number, number], scale: 0.38, speed: 0.75, color: '#FBF8EF' },
      { kind: 'orb' as const, pos: [0.1, variant === 'gate' ? 2.5 : -2.4, -1.8] as [number, number, number], scale: 0.32, speed: 0.8, color: '#B5C7AA' },
    ],
    [variant]
  );

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    const t = clock.getElapsedTime();
    const targetX = parallaxRef.current.x * 0.35;
    const targetY = -parallaxRef.current.y * 0.25;

    g.position.x += (targetX - g.position.x) * 0.05;
    g.position.y += (targetY - g.position.y) * 0.05;

    g.children.forEach((child, idx) => {
      const cfg = items[idx];
      if (!cfg) return;
      child.position.y = cfg.pos[1] + Math.sin(t * cfg.speed + idx * 1.4) * 0.24;
      child.rotation.y = Math.sin(t * 0.4 + idx) * 0.45;
      child.rotation.z = Math.cos(t * 0.35 + idx) * 0.22;
    });
  });

  const isDark = theme === 'dark';

  return (
    <>
      <ambientLight intensity={isDark ? 0.65 : 0.95} color="#FBF8EF" />
      <directionalLight position={[4, 6, 5]} intensity={isDark ? 0.8 : 1.1} color="#FFF4E6" />
      <pointLight position={[-4, -3, 3]} intensity={isDark ? 0.6 : 0.5} color="#F2CFC4" />

      <group ref={groupRef}>
        {items.map((item, idx) => {
          if (item.kind === 'heart') {
            return (
              <mesh key={idx} geometry={heartGeometry} position={item.pos} scale={item.scale}>
                <meshStandardMaterial color={item.color} roughness={0.45} metalness={0.05} />
              </mesh>
            );
          }
          if (item.kind === 'leaf') {
            return (
              <mesh key={idx} geometry={leafGeometry} position={item.pos} scale={item.scale}>
                <meshStandardMaterial color={item.color} roughness={0.55} metalness={0.05} />
              </mesh>
            );
          }
          return (
            <mesh key={idx} position={item.pos} scale={item.scale}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color={item.color} roughness={0.35} metalness={0.08} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}
