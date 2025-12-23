import React, { useEffect, useState, useRef, useMemo } from 'react';

// --- Particle Component (Gộp vào) ---
const Particle: React.FC = () => {
  const style = useMemo(() => {
    const size = Math.random() * 5 + 2;
    return {
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
    };
  }, []);

  return (
    <div 
      className="absolute bg-white rounded-full opacity-20 animate-float-up"
      style={style}
    />
  );
};

// --- TiltCard Component (Gộp vào) ---
interface TiltCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TiltCard: React.FC<TiltCardProps> = ({ href, title, description, icon }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [transformStyle, setTransformStyle] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0) rotateY(0) scale(1)');
  };

  return (
    <a 
      href={href}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
      className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 w-[340px] flex flex-col items-center text-center text-white no-underline shadow-2xl shadow-black/40 transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:border-white/50 hover:shadow-[0_15px_40px_rgba(0,210,255,0.3)] overflow-hidden"
    >
      {/* Shine effect */}
      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-500 group-hover:left-full pointer-events-none" />

      {/* Icon Box */}
      <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-inner bg-gradient-to-br from-white/10 to-white/5 transition-transform duration-500 animate-float-icon group-hover:rotate-y-180 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:shadow-[0_0_30px_rgba(79,172,254,0.6)] group-hover:border-none relative" style={{ transformStyle: 'preserve-3d' }}>
         <div className="group-hover:rotate-y-[-180deg] transition-transform duration-500">
            {icon}
         </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-white">{title}</h2>
      <p className="text-slate-300 leading-relaxed mb-8 flex-grow">{description}</p>

      <span className="mt-auto bg-gradient-to-r from-primary to-secondary text-[#0f172a] py-3 px-10 rounded-full font-bold uppercase tracking-wide relative overflow-hidden z-10 transition-colors duration-300 shadow-lg group-hover:text-primary group-hover:shadow-[0_0_20px_rgba(79,172,254,0.6)]">
        <span className="relative z-10 flex items-center gap-2">
            Truy cập <i className="fas fa-arrow-right text-xs"></i>
        </span>
        <span className="absolute top-0 left-0 w-0 h-full bg-white -z-1 transition-all duration-300 group-hover:w-full"></span>
      </span>
    </a>
  );
};

// --- Main App Component ---

const AppLogo = () => (
  <svg className="w-[100px] h-[100px] mb-4 drop-shadow-[0_0_15px_rgba(79,172,254,0.6)] transition-transform duration-300 hover:scale-110 hover:rotate-6" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
    <defs>
      <linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' style={{ stopColor: '#4facfe', stopOpacity: 1 }} />
        <stop offset='100%' style={{ stopColor: '#00f2fe', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width='512' height='512' rx='120' fill='#1e293b' />
    <path d='M256 112c-49.5 0-93.5 21.3-128 56-23.8-24.8-57-40-96-40v256c39 0 72.2 15.2 96 40 34.5-34.7 78.5-56 128-56s93.5 21.3 128 56c23.8-24.8 57-40 96-40V128c-39 0-72.2 15.2-96 40-34.5-34.7-78.5-56-128-56z' fill='url(#grad)' transform='scale(0.7) translate(110, 80)' />
  </svg>
);

const App: React.FC = () => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    // Generate particles on mount
    const p = Array.from({ length: 15 }, (_, i) => i);
    setParticles(p);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-poppins text-white">
      
      {/* Background Effects */}
      <div className="fixed inset-0 -z-20 opacity-60 bg-[linear-gradient(-45deg,#020024,#090979,#1a0b2e,#001f3f)] bg-[length:400%_400%] animate-[gradientBG_15s_ease_infinite]" style={{
        animation: 'gradientBG 15s ease infinite'
      }} />
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Particles */}
      <div id="particles" className="fixed inset-0 -z-10 pointer-events-none">
        {particles.map((i) => (
          <Particle key={i} />
        ))}
      </div>

      {/* Header */}
      <header className="text-center mb-12 px-4 z-10 flex flex-col items-center animate-fade-in-down">
        <AppLogo />
        <h1 className="text-4xl md:text-6xl font-extrabold mb-2 tracking-tighter drop-shadow-[0_0_20px_rgba(79,172,254,0.6)] text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
          HiHi Học Tập
        </h1>
        <p className="text-lg md:text-xl text-indigo-100 font-light tracking-wide">
          Chọn công cụ để bắt đầu luyện tập ngay hôm nay
        </p>
      </header>

      {/* Main Content (Cards) */}
      <main className="flex flex-wrap gap-12 justify-center px-4 max-w-6xl z-10 w-full mb-auto pb-10">
        
        <TiltCard 
          href="https://ngxuanhai123.github.io/tuvung/"
          title="Luyện Từ Vựng"
          description="Hệ thống thẻ ghi nhớ (Flashcard) và danh sách từ vựng giúp bạn ghi nhớ nhanh hơn."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 transition-all duration-500 drop-shadow-md">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <TiltCard 
          href="https://ngxuanhai123.github.io/chinhta/"
          title="Luyện Chính Tả"
          description="Công cụ nghe và chép chính tả (Dictation) để cải thiện kỹ năng nghe viết."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 transition-all duration-500 drop-shadow-md">
               <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />

      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-white/60 z-10">
        &copy; HiHi Study, Hải dựa trên nhu cầu học tập của bản thân và các anh em gợi ý. Xây dựng app bằng cả trái tim <i className="fas fa-heart text-[#ff4757] ml-1 animate-heart-beat inline-block align-middle drop-shadow-[0_0_8px_#ff4757]"></i>
      </footer>

    </div>
  );
};

export default App;
