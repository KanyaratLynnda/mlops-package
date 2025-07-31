// src/components/DeploymentForm/index.tsx
'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { FormProvider, useFormContext } from './FormProvider';
import ProgressHeader from './ProgressHeader';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Repository from './steps/Step2Repository';
import Step3Dataset from './steps/Step3Dataset';
import Step4Performance from './steps/Step4Performance';
import Step5Feature from './steps/Step5Feature';
import Step6FileUpload from './steps/Step6FileUpload';
import Step7Infrastructure from './steps/Step7Infrastructure';
import Step8FileGeneration from './steps/Step8FileGeneration';

function FormContent() {
  const { state, nextStep, prevStep, isPending } = useFormContext();

  const renderStep = () => {
    switch(state.currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2Repository />;
      case 3:
        return <Step3Dataset />;
      case 4:
        return <Step4Performance />;
      case 5:
        return <Step5Feature />;
      case 6:
        return <Step6FileUpload />;
      case 7:
        return <Step7Infrastructure />;
      case 8:
        return <Step8FileGeneration />;
      default:
        return <Step1BasicInfo />;
    }
  };

  const canProceed = () => {
    // This will be validated by the server action
    return !isPending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProgressHeader />

        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={state.currentStep === 1 || isPending}
              className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
                state.currentStep === 1 || isPending
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft size={20} className="mr-1" />
              Previous
            </button>

            <div className="text-sm text-gray-500 flex items-center">
              Step {state.currentStep} of 8
            </div>

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPending ? 'Loading...' : (state.currentStep === 8 ? 'Finish' : state.currentStep === 7 ? 'Generate Files' : 'Next')}
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeploymentForm() {
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  );
}