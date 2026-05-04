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
    <div className="step-indicator no-print">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        return (
          <div key={step.number} className="step-item">
            <div className="step-content">
              <div
                className={`step-dot ${
                  isCompleted
                    ? 'step-dot--completed'
                    : isCurrent
                    ? 'step-dot--current'
                    : 'step-dot--pending'
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
                className={`step-label ${
                  isCurrent ? 'step-label--current' : isCompleted ? 'step-label--completed' : 'step-label--pending'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`step-connector ${isCompleted ? 'step-connector--completed' : 'step-connector--pending'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
