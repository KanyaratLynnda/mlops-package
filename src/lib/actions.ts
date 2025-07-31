'use server'; 

import {FormData as AppFormData, FormState} from '@/types/form';

export async function updateFormField(
    prevState: FormState,
    formData: FormData,
): Promise<FormState> {
    const actionType = formData.get('actionType') as string;
    
    if (actionType === 'nextStep') {
        return validationAndNextStep(prevState, formData);
    } else if (actionType === 'prevStep') {
        return previousStep(prevState);
    } else {
        // Default update field action
        const updateData: Partial<AppFormData> = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'actionType') continue; // Skip action type
            
            const stringValue = value as string;
            
            // Try to parse JSON for complex fields
            if (key === 'features' || key === 'uploadedFiles' || key === 'alertEmails') {
                try {
                    (updateData as any)[key] = JSON.parse(stringValue);
                } catch {
                    (updateData as any)[key] = stringValue;
                }
            } else {
                (updateData as any)[key] = stringValue;
            }
        }

        return {
            ...prevState, 
            data: { ...prevState.data, ...updateData },
            errors: {},
        };
    }
}

async function validationAndNextStep(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    // Convert FormData to object
    const updateData: Partial<AppFormData> = {};
    for (const [key, value] of formData.entries()) {
        if (key === 'actionType') continue; // Skip action type
        
        const stringValue = value as string;
        
        // Try to parse JSON for complex fields
        if (key === 'features' || key === 'uploadedFiles' || key === 'alertEmails') {
            try {
                (updateData as any)[key] = JSON.parse(stringValue);
            } catch {
                (updateData as any)[key] = stringValue;
            }
        } else {
            (updateData as any)[key] = stringValue;
        }
    }

    // Merge the data properly to get the complete current state
    const updatedData = { ...prevState.data, ...updateData };
    const errors = validationCurrentStep(prevState.currentStep, updatedData);

    if (Object.keys(errors).length > 0) {
        return {
            ...prevState,
            data: updatedData,
            errors
        };
    }

    // Successfully validated
    if (prevState.currentStep === 8) {
        // On final step, mark as submitted instead of advancing
        return {
            ...prevState, 
            data: updatedData,
            currentStep: 8,
            errors: {},
            isSubmitting: false,
            // You could add a submitted flag here if needed
        }; 
    } else {
        // Move to next step
        return {
            ...prevState, 
            data: updatedData,
            currentStep: Math.min(prevState.currentStep + 1, 8),
            errors: {},
        }; 
    } 
}

async function previousStep(prevState: FormState): Promise<FormState> {
    return {
        ...prevState, 
        currentStep: Math.max(prevState.currentStep - 1, 1),
        errors: {},
    }
}

function validationCurrentStep(step: number, data: AppFormData): Record<string, string> {
    const errors: Record<string, string> = {}; 

    switch(step) {
        case 1:
            if (!data.initiativeName) errors.initiativeName = 'Initiative name is required';
            if (!data.modelVersion) errors.modelVersion = 'Model version is required';
            if (!data.modelType) errors.modelType = 'Model type is required';
            if (!data.dataScientist) errors.dataScientist = 'Data scientist email is required';
            if (!data.businessPurpose) errors.businessPurpose = 'Business purpose is required'; 
            break;
        case 2:
            if (!data.repositoryUrl) errors.repositoryUrl = 'Repository URL is required';
            if (!data.branch) errors.branch = 'Branch is required'; 
            break;
        case 3:
            if (!data.projectId) errors.projectId = 'Project ID is required'; 
            if (!data.trainTable) errors.trainTable = 'Training table is required';
            if (!data.testTable) errors.testTable = 'Testing table is required';
            if (!data.populationKey) errors.populationKey = 'Population key is required';
            if (!data.targetColumn) errors.targetColumn = 'Target column is required';
            break;
        case 4:
            if (!data.auc && !data.f1Score && !data.precision && !data.recall) {
                errors.performance = 'At least one performance metric is required'; 
            }
            break;
        case 5:
            // Features step - no strict validation for now
            break;
        case 6:
            // File upload step - no strict validation for now
            break;
        case 7:
            if (!data.machineType) errors.machineType = 'Machine type is required';
            if (!data.maxWorkers) errors.maxWorkers = 'Max workers is required';
            if (!data.diskSize) errors.diskSize = 'Disk size is required';
            break;
        case 8:
            // File generation step - no validation needed, just display files
            break;
    }
    return errors;
}