'use client';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Quote' },
  { number: 4, label: 'Preview' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center mb-8 no-print bg-white border border-slate-200 rounded-xl px-6 py-4">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isCompleted
                  ? 'bg-[#1D3461] text-white'
                  : isCurrent
                  ? 'bg-[#E9A620] text-[#1D3461] shadow-[0_0_0_3px_rgba(233,166,32,0.25)]'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.number}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                isCurrent ? 'text-[#1D3461] font-bold' : isCompleted ? 'text-slate-400' : 'text-slate-300'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${isCompleted ? 'bg-[#1D3461]' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
