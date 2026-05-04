'use client';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Pages' },
  { number: 3, label: 'Review' },
  { number: 4, label: 'Quote' },
  { number: 5, label: 'Preview' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center mb-8 no-print">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                isCompleted
                  ? 'bg-[#0a0a0a] text-white'
                  : isCurrent
                  ? 'bg-[#0A84FF] text-white ring-4 ring-[#0A84FF]/20'
                  : 'bg-white border border-[#E5E7EB] text-[#9CA3AF]'
              }`}>
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : step.number}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                isCurrent ? 'text-[#0F1117] font-semibold' : 'text-[#9CA3AF]'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 ${isCompleted ? 'bg-[#0a0a0a]' : 'bg-[#E5E7EB]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
