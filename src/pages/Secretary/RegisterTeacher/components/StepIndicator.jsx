import { FaCheck } from 'react-icons/fa';
import './stepIndicator.scss';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="op-step-indicator" role="list" aria-label="Progresso do formulário">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isClickable = stepNumber <= currentStep;

        return (
          <div key={stepNumber} className="op-step-wrapper" role="listitem">
            <div className="op-step-item">
              <button
                type="button"
                className={`op-step-circle ${isActive ? 'active' : ''} ${
                  isCompleted ? 'completed' : ''
                } ${isClickable ? 'clickable' : ''}`}
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Etapa ${stepNumber}: ${step.label}`}
                title={step.label}
              >
                {isCompleted ? <FaCheck size={14} /> : stepNumber}
              </button>
              <span className={`op-step-label ${isActive || isCompleted ? 'active' : ''}`}>
                {step.label}
              </span>
            </div>
            {stepNumber < steps.length && (
              <div className={`op-step-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
