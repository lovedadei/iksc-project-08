
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';

interface LungsModelProps {
  pledgeCount: number;
  fillLevel: number;
  shouldAnimate: boolean;
}

function LungsModel({ pledgeCount, fillLevel, shouldAnimate }: LungsModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const fillRef = useRef<THREE.Mesh>(null);
  const [animationScale, setAnimationScale] = useState(1);
  
  // Load GLB file
  const { scene } = useGLTF('/realistic_human_lungs.glb');
  
  // Breathing animation with blooming effect
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breatheScale = 2.0 + Math.sin(time * 0.5) * 0.1;
      
      // Apply blooming animation when shouldAnimate is true
      const bloomScale = shouldAnimate ? 1 + Math.sin(time * 8) * 0.2 : 1;
      
      meshRef.current.scale.setScalar(breatheScale * bloomScale * animationScale);
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
    
    // Animate fill with blooming effect
    if (fillRef.current && shouldAnimate) {
      const time = state.clock.getElapsedTime();
      const bloomPulse = 1 + Math.sin(time * 6) * 0.3;
      fillRef.current.scale.set(bloomPulse, 1, bloomPulse);
    } else if (fillRef.current) {
      fillRef.current.scale.set(1, 1, 1);
    }
  });

  // Trigger blooming animation
  useEffect(() => {
    if (shouldAnimate) {
      setAnimationScale(1.3);
      const timer = setTimeout(() => {
        setAnimationScale(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  // Apply material changes to GLB model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && mesh.material instanceof THREE.MeshStandardMaterial) {
            const material = mesh.material;
            if (material.color) {
              // Keep lungs in natural pinkish color for contrast
              material.color = new THREE.Color('#ffb3ba');
              material.opacity = 0.4; // More transparent to show green fill
              material.transparent = true;
              material.metalness = 0.1;
              material.roughness = 0.4;
            }
          }
        }
      });
    }
  }, [fillLevel, scene]);

  // Create green fill effect that fills from bottom to top inside the lungs
  const fillHeight = fillLevel * 2.5;
  const fillColor = "#10b981"; // Always green color
  
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Render GLB model with larger scale and transparency */}
      <primitive object={scene.clone()} scale={[3, 3, 3]} />
      
      {/* Green fill effect - positioned inside the lungs, filling from bottom up */}
      <mesh 
        ref={fillRef}
        position={[0, -1.2 + fillHeight/2, 0]}
      >
        <boxGeometry args={[1.8, fillHeight, 1.2]} />
        <meshStandardMaterial 
          color={fillColor}
          transparent
          opacity={0.8}
          emissive={new THREE.Color(fillColor)}
          emissiveIntensity={shouldAnimate ? 0.6 : 0.3}
        />
      </mesh>
      
      {/* Add blooming particle effect when animating */}
      {shouldAnimate && (
        <>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 3) * 2,
              Math.sin(i * Math.PI / 3) * 1.5,
              Math.sin(i * Math.PI / 3) * 0.5
            ]}>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial 
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.8}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

interface LungsModel3DProps {
  pledgeCount: number;
  shouldAnimate?: boolean;
}

const LungsModel3D: React.FC<LungsModel3DProps> = ({ pledgeCount, shouldAnimate = false }) => {
  const [testFillLevel, setTestFillLevel] = useState<number | null>(null);
  
  // Use test fill level if set, otherwise calculate based on pledge count
  const fillLevel = testFillLevel !== null ? testFillLevel : 
    pledgeCount < 100 ? (pledgeCount / 100) * 0.5 : 0.5 + ((pledgeCount - 100) / 100) * 0.5;
  const cappedFillLevel = Math.min(fillLevel, 1);
  const fillPercentage = Math.round(cappedFillLevel * 100);
  
  const handleShow100Percent = () => {
    setTestFillLevel(1);
    // Reset to normal after 5 seconds
    setTimeout(() => {
      setTestFillLevel(null);
    }, 5000);
  };

  const handleResetFill = () => {
    setTestFillLevel(null);
  };
  
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-sky-50 to-green-50 rounded-2xl overflow-hidden shadow-xl">
      {/* Logos positioned side by side at the top with higher z-index */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <img 
          src="/lovable-uploads/fbdff461-1ffb-485c-8e93-3141b2515bc0.png" 
          alt="IKSC Logo" 
          className="h-16 w-auto object-contain drop-shadow-lg"
        />
        <img 
          src="/lovable-uploads/9c57fcd0-54f8-4f2a-8ff5-70b9175a0fb4.png" 
          alt="KARE Logo" 
          className="h-16 w-auto object-contain drop-shadow-lg"
        />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        className="w-full h-full"
        style={{ zIndex: 10 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#10b981" />
        <spotLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />
        
        <Environment preset="studio" />
        
        <LungsModel pledgeCount={pledgeCount} fillLevel={cappedFillLevel} shouldAnimate={shouldAnimate} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.2}
          minDistance={3}
          maxDistance={15}
          zoomSpeed={1.2}
        />
      </Canvas>
      
      {/* IKSC KARE information positioned at top-middle */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-center z-20 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <h3 className="text-2xl font-bold text-gray-800">IKSC KARE</h3>
        <p className="text-lg font-semibold text-blue-600">Healthy Lungs Progress</p>
      </div>
      
      {/* Simplified pledge display showing only count and percentage */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-20 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
        <p className="text-2xl font-bold text-gray-800">{pledgeCount} Pledges</p>
        <p className="text-lg text-gray-600">{fillPercentage}% Filled</p>
        <div className="w-48 bg-gray-200 rounded-full h-3 mt-2">
          <div 
            className="h-3 rounded-full transition-all duration-1000 ease-out bg-green-500"
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
        
        {/* Test buttons */}
        <div className="flex gap-2 mt-3 justify-center">
          <Button 
            onClick={handleShow100Percent}
            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
            size="sm"
          >
            Show 100%
          </Button>
          <Button 
            onClick={handleResetFill}
            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1"
            size="sm"
          >
            Reset
          </Button>
        </div>
      </div>
      
      {/* Enhanced status messages with higher z-index */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center z-20">
        {fillLevel < 0.25 && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm border-2 border-red-200 shadow-lg">
            🚨 Critical: Lungs need immediate care!
          </div>
        )}
        {fillLevel >= 0.25 && fillLevel < 0.5 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm border-2 border-yellow-200 shadow-lg">
            ⚠️ Improving: Keep up the good work!
          </div>
        )}
        {fillLevel >= 0.5 && fillLevel < 0.75 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm border-2 border-orange-200 shadow-lg">
            🌟 Halfway there! Great progress!
          </div>
        )}
        {fillLevel >= 0.75 && fillLevel < 1 && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm border-2 border-green-200 shadow-lg">
            🚀 Excellent! Almost at maximum health!
          </div>
        )}
        {fillLevel >= 1 && (
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm animate-pulse border-2 border-emerald-200 shadow-lg">
            🎉 Perfect Health! Mission Accomplished!
          </div>
        )}
      </div>
    </div>
  );
};

export default LungsModel3D;
