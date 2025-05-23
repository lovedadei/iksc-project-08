
import React, { useEffect, useState } from 'react';

interface GrowingGardenProps {
  pledgeCount: number;
}

const GrowingGarden: React.FC<GrowingGardenProps> = ({ pledgeCount }) => {
  const [visibleBlooms, setVisibleBlooms] = useState<number[]>([]);

  useEffect(() => {
    // Animate blooms appearing one by one
    const timer = setTimeout(() => {
      if (visibleBlooms.length < pledgeCount) {
        setVisibleBlooms(prev => [...prev, prev.length]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pledgeCount, visibleBlooms.length]);

  const generateBloomPosition = (index: number) => {
    // Create a more natural, organic arrangement
    const positions = [
      { left: '10%', top: '20%' },
      { left: '30%', top: '60%' },
      { left: '70%', top: '30%' },
      { left: '50%', top: '80%' },
      { left: '80%', top: '70%' },
      { left: '20%', top: '70%' },
      { left: '60%', top: '15%' },
      { left: '90%', top: '40%' },
      { left: '40%', top: '40%' },
      { left: '15%', top: '45%' },
    ];
    
    return positions[index % positions.length] || { left: '50%', top: '50%' };
  };

  const bloomColors = [
    'text-pink-400',
    'text-purple-400', 
    'text-rose-400',
    'text-fuchsia-400',
    'text-pink-300',
    'text-purple-300'
  ];

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl overflow-hidden shadow-lg">
      {/* Background grass/ground */}
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-200 to-green-100"></div>
      
      {/* Garden title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h3 className="text-2xl font-bold text-gray-800">Healthy Lungs Garden</h3>
        <p className="text-gray-600 text-sm mt-1">
          {pledgeCount} {pledgeCount === 1 ? 'bloom' : 'blooms'} and growing! 🌱
        </p>
      </div>

      {/* Animated blooms */}
      {visibleBlooms.map((bloomIndex) => {
        const position = generateBloomPosition(bloomIndex);
        const colorClass = bloomColors[bloomIndex % bloomColors.length];
        
        return (
          <div
            key={bloomIndex}
            className={`absolute bloom-animation gentle-sway ${colorClass}`}
            style={{ 
              left: position.left, 
              top: position.top,
              animationDelay: `${bloomIndex * 0.2}s`
            }}
          >
            <div className="text-4xl drop-shadow-lg">🌸</div>
          </div>
        );
      })}

      {/* Decorative elements */}
      <div className="absolute bottom-5 left-5 text-2xl gentle-sway">🌿</div>
      <div className="absolute bottom-8 right-8 text-2xl gentle-sway" style={{ animationDelay: '1s' }}>🌿</div>
      <div className="absolute top-1/2 left-2 text-xl gentle-sway" style={{ animationDelay: '2s' }}>🍃</div>
      <div className="absolute top-1/3 right-4 text-xl gentle-sway" style={{ animationDelay: '1.5s' }}>🍃</div>

      {/* Floating particles for atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 pulse-grow"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 8)}%`,
              animationDelay: `${i * 0.7}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GrowingGarden;
