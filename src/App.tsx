import React, { useCallback, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { KeyboardControls, OrbitControls } from "@react-three/drei";
import './App.css';
import { Physics, RigidBody } from "@react-three/rapier";
import { create } from "zustand";
import Controller from "ecctrl";

const useCubeStore = create((set) => ({
  cubes: localStorage.getItem("cubes") ? JSON.parse(localStorage.getItem("cubes")!) : [],
  addCube: (x: number, y: number, z: number) => set((state: any) => ({ cubes: [...state.cubes, [x, y, z]] })),
  removeCube: (x: number, y: number, z: number) => set((state: any) => ({ cubes: state.cubes.filter((cube: any) => cube[0] !== x || cube[1] !== y || cube[2] !== z) })),
}))

export const Cubes = () => {
  const cubes = useCubeStore((state: any) => state.cubes)
  return cubes.map((coords: any, index: any) => <Cube key={index} position={coords} />)
}

const Cube = (props: any) => {
  const [hover, setHover] = useState<any | null>(null);
  const [holdCtrl, setHoldCtrl] = useState(false);
  const onMove = useCallback((e: any) => {
    e.stopPropagation()
    setHoldCtrl(e.ctrlKey || e.metaKey)
    setHover(Math.floor(e.faceIndex / 2))
  }, [])
  const onOut = useCallback(() => setHover(null), [])
  const ref = useRef<any>(null!);
  const addCube = useCubeStore((state: any) => state.addCube);
  const removeCube = useCubeStore((state: any) => state.removeCube);
  const cubes = useCubeStore((state: any) => state.cubes);

  const onClick = useCallback((e: any) => {
    e.stopPropagation()

    //ctrl/commmand + click to remove
    if (e.ctrlKey || e.metaKey) {
      const { x, y, z } = ref?.current?.translation();
      removeCube(x, y, z);
    } else {
      const { x, y, z } = ref?.current?.translation();
  
      const dir = [
        [x + 1, y, z],
        [x - 1, y, z],
        [x, y + 1, z],
        [x, y - 1, z],
        [x, y, z + 1],
        [x, y, z - 1],
      ]
      console.log("click", ...dir[Math.floor(e.faceIndex / 2)]);
      addCube(...dir[Math.floor(e.faceIndex / 2)])
    }

    localStorage.setItem("cubes", JSON.stringify(cubes));
  }, [addCube])

  return (
    <RigidBody type="fixed" {...props} ref={ref}>
      <mesh
        onPointerMove={onMove}
        onPointerOut={onOut}
        onClick={onClick}
        castShadow>
        <boxGeometry args={[1, 1, 1]} />
        {[...Array(6)].map((_, index) => (
          <meshStandardMaterial attach={`material-${index}`} key={index} color={holdCtrl && hover ? "hotpink" : hover === index ? "lightgreen" : "white"} />
        ))}
      </mesh>
    </RigidBody>
  );
};

const MovingCube = () => {
  const ref = useRef<any>(null);

  useFrame(() => {
    let player = ref.current;
    if (!!player) {
      
      const { y } = player != null && player.translation();
      if (y < -5) {
        ref.current.setTranslation({ x: 0, y: 1.25, z: 0 }, true);
        ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
  });

  return (
    <Controller maxVelLimit={4} floatHeight={0} ref={ref}>
      <mesh position={[0, -0.25, 0]} scale={0.6} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
    </Controller>
  );
};

const App: React.FC = () => {

  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ];


  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 90 }}>
      {/* Light with shadows */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[-5, 5, 5]} intensity={0.2} castShadow />
      <directionalLight position={[-5, 5, -10]} intensity={0.5} castShadow />

      <Physics debug>
        <Cube position={[0, 0, 0]} />
        <Cubes />

        <KeyboardControls map={keyboardMap}>
          <MovingCube />
        </KeyboardControls>

      </Physics>

      <OrbitControls />
    </Canvas>
  );
};

export default App;