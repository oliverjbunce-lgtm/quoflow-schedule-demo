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
    <div className="flex items-center mb-8 no-print px-2 py-4">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isCompleted
                  ? 'bg-[#1D3461] text-white'
                  : isCurrent
                  ? 'bg-[#E9A620] text-[#1D3461] shadow-[0_0_0_4px_rgba(233,166,32,0.3)]'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {isCompleted ? (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
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
              <div className={`flex-1 h-0.5 mx-3 mb-5 rounded-full ${isCompleted ? 'bg-[#1D3461]' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
