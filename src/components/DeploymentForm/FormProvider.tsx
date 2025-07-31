'use client';

import { createContext, useContext, useActionState, useTransition} from 'react'; 
import type { FormData } from '@/types/form';
import { FormState } from '@/types/form';
import {updateFormField} from '@/lib/actions';

interface FormContextType {
    state: FormState; 
    updateField: (field: keyof FormData, value: string) => void;
    updateArrayField: (field: keyof FormData, value: any[]) => void;
    updateObjectField: (field: keyof FormData, value: object) => void;
    nextStep (): void;
    prevStep (): void;
    isPending: boolean; 
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
    const [isPending, startTransition] = useTransition();
    const [state, dispatch] = useActionState(updateFormField, initialState);

    const updateField = (field: keyof FormData, value: string) => {
        const formData = new FormData();
        formData.append('actionType', 'updateField');
        formData.append(field, value);
        startTransition(() => {
            dispatch(formData);
        });
    };

    const updateArrayField = (field: keyof FormData, value: any[]) => {
        // For complex fields like arrays, we'll serialize and update
        const formData = new FormData();
        formData.append('actionType', 'updateField');
        formData.append(field, JSON.stringify(value));
        startTransition(() => {
            dispatch(formData);
        });
    };

    const updateObjectField = (field: keyof FormData, value: object) => {
        // For complex fields like objects, we'll serialize and update
        const formData = new FormData();
        formData.append('actionType', 'updateField');
        formData.append(field, JSON.stringify(value));
        startTransition(() => {
            dispatch(formData);
        });
    };

    const nextStep = () => {
        const formData = new FormData();
        formData.append('actionType', 'nextStep');
        Object.entries(state.data).forEach(([key, value]) => {
            if (typeof value === 'string') {
                formData.append(key, value);
            } else if (Array.isArray(value)) {
                formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            }
        });
        startTransition(() => {
            dispatch(formData);
        });
    };

    const prevStep = () => {
        const formData = new FormData();
        formData.append('actionType', 'prevStep');
        startTransition(() => {
            dispatch(formData);
        });
    };

    return (
    <FormContext.Provider value={{
      state,
      updateField,
      updateArrayField,
      updateObjectField,
      nextStep,
      prevStep,
      isPending
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

