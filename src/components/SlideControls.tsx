
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SlideControls({ currentSlide, totalSlides, onPrev, onNext, onSelect }: any) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      <button onClick={onPrev} disabled={currentSlide === 0} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all mr-2">
        <ChevronLeft size={18} />
      </button>
      
      {Array.from({ length: totalSlides }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`}
        />
      ))}
      
      <button onClick={onNext} disabled={currentSlide === totalSlides - 1} className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all ml-2">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
