import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

export default function AvatarCanvas() {
  return (
    <Canvas style={{ width: '100%', height: '500px' }} camera={{ position: [0, 1.6, 3] }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        {/* 아바타 GLB 모델 로드 (models/avatar.glb). 없는 경우 기본 박스 */}
        <Stage>
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}

function Model() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { scene } = useGLTF('/models/avatar.glb');
    return <primitive object={scene} />;
  } catch (e) {
    return (
      <mesh>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    );
  }
}

// Preload model
// @ts-ignore
useGLTF.preload('/models/avatar.glb'); 