import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07090f]/95 backdrop-blur-2xl">
      <div className="relative flex flex-col items-center justify-center animate-pulse">
        {/* Glow effect matching brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/20 to-brand-pink/20 blur-2xl rounded-full w-32 h-32"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-lg flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* We use next/img with unoptimized because we don't want to wait for image optimization on the loader itself */}
          <img 
            src="/icon-192.png" 
            alt="SW Tools Loading..." 
            className="w-12 h-12 object-contain relative z-10"
          />
        </div>
        <span className="mt-6 font-heading font-semibold text-lg tracking-wider text-white/80 animate-bounce">
          LOADING...
        </span>
      </div>
    </div>
  );
}
