// src/components/DeploymentForm/ProgressHeader.tsx
'use client';

import { Check } from 'lucide-react';
import { useFormContext } from './FormProvider';

export default function ProgressHeader() {
  const { state } = useFormContext();
  const totalSteps = 8;
  const progress = (state.currentStep / totalSteps) * 100;

  const stepLabels = ['Basic', 'Repository', 'Dataset', 'Performance', 'Features', 'Files', 'Infrastructure', 'Download'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          MLOps Deployment Request
        </h1>
        <p className="text-gray-600">
          Fill out this form to generate deployment configuration files
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step === state.currentStep && step === 8 ? 'bg-green-600 text-white' :
                step === state.currentStep ? 'bg-blue-600 text-white' :
                step < state.currentStep ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {step < state.currentStep || (step === 8 && state.currentStep === 8) ? <Check size={16} /> : step}
              </div>
              <span className="text-xs mt-1 text-gray-600">{stepLabels[step - 1]}</span>
            </div>
            {step < 8 && (
              <div className={`w-8 h-1 mx-2 ${
                step < state.currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}