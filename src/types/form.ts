export interface PreprocessingStep {
    name: string;
    value: string;
}

export interface PreprocessingPipelineStep {
    id: string;
    name: string;
    description: string;
    dataTypes: ('numeric' | 'categorical' | 'both')[];
    order: number;
    enabled: boolean;
    config?: Record<string, any>;
}

export interface Feature {
    id: string;
    order: number;
    name: string;
    type: 'Num' | 'Cat' | 'numerical' | 'categorical' | 'boolean' | 'datetime' | '';
    transformation: string;
    description: string;
    sourceTable?: string;
    dataField?: string;
    nullImputedValue?: string;
    step1?: PreprocessingStep;
    step2?: PreprocessingStep;
    step3?: PreprocessingStep;
    step4?: PreprocessingStep;
}

export interface UploadedFile {
    name: string;
    size: number;
    type: string;
}

export interface FormData {
    // - 1 Basic Initiative Information
    initiativeName: string;
    modelVersion: string;
    modelCode: string;
    modelType: string;
    businessPurpose: string;
    dataScientist: string;
    targetDeploymentDate: string;

    // - 2 Model Source Code or Repository
    repositoryUrl: string;
    branch: string;
    commitHash: string;
    
    // - 3 Dataset Configuration
    projectId: string;
    trainTable: string;
    testTable: string;
    valTable: string;
    ootTable: string;
    processedTrainTable: string;
    processedTestTable: string;
    processedValTable: string;
    processedOotTable: string;
    populationKey: string;
    targetColumn: string;
    exclusionCriteria: string;

    // - 4 Model Performance Metrics
    auc: string;
    f1Score: string;
    precision: string;
    recall: string;
    performanceNotes: string;

    // - 5 Features
    features: Feature[];
    featureNotes: string;
    preprocessingSteps: PreprocessingPipelineStep[];

    // - 6 File Uploads
    uploadedFiles: {
        sqlQueries?: UploadedFile;
        modelPickle?: UploadedFile;
        config?: UploadedFile;
        notebook?: UploadedFile;
    };

    // - 7 Infrastructure
    machineType: string;
    maxWorkers: string;
    diskSize: string;
    schedule: string;
    alertEmails: string[];

    // - 8 File Generation
    generatedFiles?: {
        [key: string]: {
            content: string;
            filename: string;
            type: 'yaml' | 'py' | 'sql' | 'env';
        };
    };
    filesGenerated?: boolean;

    submissionDate: string;
}


export interface ValidationState {
    [key: string]: boolean;
}

export interface FormState {
  data: FormData;
  currentStep: number;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export interface FormAction {
  type: 'UPDATE_FIELD' | 'NEXT_STEP' | 'PREV_STEP' | 'SET_ERRORS' | 'SUBMIT_START' | 'SUBMIT_END';
  payload?: any;
}