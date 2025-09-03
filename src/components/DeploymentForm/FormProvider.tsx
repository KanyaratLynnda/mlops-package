'use client';

import { createContext, useContext, useState } from 'react'; 
import type { FormData } from '@/types/form';
import { FormState } from '@/types/form';

interface FormContextType {
    state: FormState; 
    updateField: (field: keyof FormData, value: string) => void;
    updateArrayField: (field: keyof FormData, value: any[]) => void;
    updateObjectField: (field: keyof FormData, value: object) => void;
    nextStep (): void;
    prevStep (): void;
}

const FormContext = createContext<FormContextType | null>(null);

const initialFormData: FormData = {
    initiativeName: '',
    modelVersion: '',
    modelType: '',
    businessPurpose: '',
    dataScientist: '',
    targetDeploymentDate: '',
    // - 2 Model Source Code or Repository
    repositoryUrl: '',
    branch: '',
    commitHash: '',
    // - 3 Dataset Configuration
    projectId: '',
    trainTable: '',
    testTable: '',
    valTable: '',
    ootTable: '',
    processedTrainTable: '',
    processedTestTable: '',
    processedValTable: '',
    processedOotTable: '',
    populationKey: '',
    targetColumn: '',
    exclusionCriteria: '',
    // - 4 Model Performance Metrics
    auc: '',
    f1Score: '',
    precision: '',
    recall: '',
    performanceNotes: '',
    // - 5 Features
    features: [],
    featureNotes: '',
    // - 6 File Uploads
    uploadedFiles: {},
    // - 7 Infrastructure
    machineType: 'n1-standard-4',
    maxWorkers: '10',
    diskSize: '100',
    schedule: '0 6 * * *',
    alertEmails: [''],

    // - 8 File Generation
    generatedFiles: {},
    filesGenerated: false,

    submissionDate: new Date().toISOString().split('T')[0]
}; 

const initialState: FormState = {
     data: initialFormData,
     currentStep: 1,
     errors: {},
     isSubmitting: false
    
}

export function FormProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<FormState>(initialState);

    const updateField = (field: keyof FormData, value: string) => {
        setState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
    };

    const updateArrayField = (field: keyof FormData, value: any[]) => {
        setState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
    };

    const updateObjectField = (field: keyof FormData, value: object) => {
        setState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
    };

    const nextStep = () => {
        setState(prev => ({
            ...prev,
            currentStep: Math.min(prev.currentStep + 1, 8)
        }));
    };

    const prevStep = () => {
        setState(prev => ({
            ...prev,
            currentStep: Math.max(prev.currentStep - 1, 1)
        }));
    };

    return (
    <FormContext.Provider value={{
      state,
      updateField,
      updateArrayField,
      updateObjectField,
      nextStep,
      prevStep
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

