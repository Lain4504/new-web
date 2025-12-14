interface HandRaiseToastProps {
    name: string;
    onClose: () => void;
}

export function HandRaiseToast({ name, onClose }: HandRaiseToastProps) {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right min-w-[280px]">
            <div className="text-3xl animate-wave">✋</div>
            <div className="flex-1">
                <div className="font-semibold text-sm">{name}</div>
                <div className="text-xs text-blue-100">raised their hand</div>
            </div>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
