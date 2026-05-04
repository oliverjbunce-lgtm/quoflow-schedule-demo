'use client';

const steps = [
  { number: 1, label: 'Upload' },
  { number: 2, label: 'Extract' },
  { number: 3, label: 'Quote' },
  { number: 4, label: 'Preview' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="no-print flex items-center gap-0 mb-8">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-[#E9A620] text-white'
                    : isCurrent
                    ? 'bg-[#1D3461] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent ? 'text-[#1D3461]' : isCompleted ? 'text-[#E9A620]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-3 ${
                  isCompleted ? 'bg-[#E9A620]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
