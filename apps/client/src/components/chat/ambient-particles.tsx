
export const AmbientParticles = () => {
  const particles = Array.from({ length: 25 }); // 增加粒子数量

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {particles.map((_, i) => {
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 25 + 25;
        const delay = Math.random() * -30;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const blur = Math.random() * 2;

        return (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float-slow"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              opacity: Math.random() * 0.15 + 0.05,
              filter: `blur(${blur}px)`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              mixBlendMode: 'plus-lighter',
            }}
          />
        );
      })}
    </div>
  );
};
