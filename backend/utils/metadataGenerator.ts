import { FormData } from '@/types/form'; 
import { LargeNumberLike } from 'crypto';

interface MetadataConfig {
    key: string;
    model_cd: string;
    version: number;
    description: string;
    docker_image_name: string;
    id_keys: string[];
    feature_names: string[]; 

    preprocessing: {
        steps: string[];
        clipping?: Record<string, any>;
        encoding?: Record<string, any>;
        binning?: Record<string, any>;
        imputation?: Record<string, any>;
    };
    metadata: {
        percentile_breaks: number[];
        training_raw?: string; 
        trainning_processed?: string
        metrics?: {
            auc: number;
            f1: number;
            precision: number;
            recall: number;
        };
    };
    ranking_intervals: number[];
}

//version processing util
export function extractNumericVersion(versionStr: string): number {
    if (!versionStr) return 1; 

    //remove 'v' prefix 
    const cleanVersion = versionStr.toLowerCase().replace('v','')

    try {
        const versionFloat = parseFloat(cleanVersion);
        //if whole number, return as int 
        return Number.isInteger(versionFloat) ? Math.floor(versionFloat) : versionFloat;
    }
    catch (error) {
        //extract first number if conversion fails
        const numbers = cleanVersion.match(/\d+\.?\d*/);
        if (numbers && numbers[0]) {
            const versionFloat = parseFloat(numbers[0]);
            return Number.isInteger(versionFloat) ? Math.floor(versionFloat) : versionFloat;
        }
        return 1; // Default fallback
    }
}

//model cd --> maybe use input directly 


//generate preprocessing config 

//main metadata generator function
export function generateModelVersionMetadata(formData: FormData): string {
    //extract numeric version (v1.0 -> 1, v2.3 -> 2.3)
    const numericVersion = extractNumericVersion(formData.modelVersion);
    
}


