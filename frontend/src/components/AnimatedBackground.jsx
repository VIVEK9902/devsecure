import { useCallback, useMemo } from 'react';
import Particles from "@tsparticles/react";
import { loadFull } from 'tsparticles';

function AnimatedBackground({ isDark = true }) {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: {
        color: {
          value: isDark ? '#020617' : '#f8fafc',
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: ['#22d3ee', '#3b82f6'],
        },
        links: {
          color: '#06b6d4',
          distance: 120,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: 0.4,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 900,
          },
          value: 45,
        },
        opacity: {
          value: 0.35,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    [isDark]
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Particles id="devsecure-particles" init={particlesInit} options={options} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_45%)]" />
    </div>
  );
}

export default AnimatedBackground;