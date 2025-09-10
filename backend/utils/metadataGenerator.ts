import { FormData, Feature, PreprocessingPipelineStep } from '@/types/form'; 
import crypto from 'crypto';

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
        training_processed?: string;
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
    const cleanVersion = versionStr.toLowerCase().replace(/^v/, '');

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

// Generate unique key
function generateUniqueKey(): string {
    // Generate a UUID-like string using crypto.randomBytes
    const bytes = crypto.randomBytes(16);
    const hex = bytes.toString('hex');
    
    // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        '4' + hex.slice(13, 16), // Version 4 UUID
        ((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
        hex.slice(20, 32)
    ].join('-');
}

// Generate model code from initiative name
function generateModelCode(initiativeName: string): string {
    return initiativeName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length
}

// Generate docker image name
function generateDockerImageName(modelCode: string, version: string): string {
    return `gcr.io/mlops-platform/${modelCode}:${version}`;
}

// Extract feature names from form data
function extractFeatureNames(features: Feature[]): string[] {
    return features
        .sort((a, b) => a.order - b.order)
        .map(f => f.name)
        .filter(name => name && name.trim() !== '');
}

// Process preprocessing steps from form data
function generatePreprocessingConfig(
    features: Feature[],
    preprocessingSteps: PreprocessingPipelineStep[]
): {
    steps: string[];
    clipping?: Record<string, any>;
    encoding?: Record<string, any>;
    binning?: Record<string, any>;
    imputation?: Record<string, any>;
} {
    // Get enabled preprocessing steps in order
    const enabledSteps = preprocessingSteps
        .filter(step => step.enabled)
        .sort((a, b) => a.order - b.order)
        .map(step => step.name);

    const preprocessing: any = {
        steps: enabledSteps.length > 0 ? enabledSteps : ['clipping', 'encoding', 'binning', 'imputation']
    };

    // Process individual feature preprocessing
    const clippingConfig: Record<string, any> = {};
    const encodingConfig: Record<string, any> = {};
    const binningConfig: Record<string, any> = {};
    const imputationConfig: Record<string, any> = {};

    features.forEach(feature => {
        const featureName = feature.name;
        if (!featureName) return;

        // Process individual preprocessing steps
        const steps = [feature.step1, feature.step2, feature.step3, feature.step4]
            .filter(step => step?.name && step?.value);

        steps.forEach(step => {
            if (!step) return;

            const stepName = step.name.toLowerCase();
            const stepValue = step.value;

            // Categorize preprocessing steps
            if (stepName.includes('clip') || stepName.includes('cap') || stepName.includes('floor')) {
                // Parse clipping ranges
                try {
                    const values = stepValue.split(',').map(v => parseFloat(v.trim()));
                    if (values.length === 2 && !isNaN(values[0]) && !isNaN(values[1])) {
                        clippingConfig[featureName] = {
                            range: values
                        };
                    }
                } catch (e) {
                    // Default clipping config
                    clippingConfig[featureName] = {
                        range: [-999999.0, 999999.0]
                    };
                }
            }
            
            if (stepName.includes('encode') || stepName.includes('map')) {
                // Parse encoding mappings
                try {
                    if (stepValue.includes(':') || stepValue.includes('=')) {
                        const mappings: Record<string, any> = {};
                        const pairs = stepValue.split(',');
                        pairs.forEach(pair => {
                            const [key, value] = pair.split(/[:=]/).map(s => s.trim());
                            if (key && value) {
                                mappings[key] = isNaN(Number(value)) ? value : Number(value);
                            }
                        });
                        encodingConfig[featureName] = {
                            default_missing: 0,
                            default_unknown: 0,
                            mapping: mappings
                        };
                    }
                } catch (e) {
                    // Default encoding config
                    encodingConfig[featureName] = {
                        default_missing: 0,
                        default_unknown: 0,
                        mapping: {}
                    };
                }
            }
            
            if (stepName.includes('bin') || stepName.includes('bucket')) {
                // Parse binning configuration
                try {
                    const numBins = parseInt(stepValue) || 10;
                    binningConfig[featureName] = {
                        nbr_bins: numBins,
                        labels: Array.from({length: numBins}, (_, i) => i + 1),
                        intervals: [] // This would need to be calculated from actual data
                    };
                } catch (e) {
                    // Default binning config
                    binningConfig[featureName] = {
                        nbr_bins: 10,
                        labels: Array.from({length: 10}, (_, i) => i + 1),
                        intervals: []
                    };
                }
            }
            
            if (stepName.includes('impute') || stepName.includes('fill')) {
                // Parse imputation strategy
                const strategy = stepValue.toLowerCase().includes('mean') ? 'mean' :
                              stepValue.toLowerCase().includes('median') ? 'median' :
                              stepValue.toLowerCase().includes('mode') ? 'mode' : 'constant';
                
                const value = strategy === 'constant' ? 
                    (isNaN(Number(stepValue)) ? 0.0 : Number(stepValue)) : undefined;

                imputationConfig[featureName] = {
                    strategy,
                    ...(value !== undefined && { value })
                };
            }
        });

        // Default imputation for features without explicit config
        if (!imputationConfig[featureName]) {
            imputationConfig[featureName] = {
                strategy: 'constant',
                value: feature.type === 'categorical' ? 'Unknown' : 0.0
            };
        }
    });

    // Add preprocessing configs if they have data
    if (Object.keys(clippingConfig).length > 0) {
        preprocessing.clipping = clippingConfig;
    }
    if (Object.keys(encodingConfig).length > 0) {
        preprocessing.encoding = encodingConfig;
    }
    if (Object.keys(binningConfig).length > 0) {
        preprocessing.binning = binningConfig;
    }
    if (Object.keys(imputationConfig).length > 0) {
        preprocessing.imputation = imputationConfig;
    }

    return preprocessing;
}

// Generate default percentile breaks
function generatePercentileBreaks(): number[] {
    // Default percentile breaks (0 to 1 in 100 steps)
    const breaks = [];
    for (let i = 0; i <= 100; i++) {
        breaks.push(i / 100);
    }
    return breaks;
}

//main metadata generator function
export function generateModelVersionMetadata(formData: FormData): MetadataConfig {
    //extract numeric version (v1.0 -> 1, v2.3 -> 2.3)
    const numericVersion = extractNumericVersion(formData.modelVersion);
    
    //generate model code
    const modelCode = formData.modelCode || generateModelCode(formData.initiativeName);
    
    //Parse Population Key after "," and trim spaces 
    const idKeys = formData.populationKey ? 
        formData.populationKey.split(',').map(k => k.trim()).filter(k => k) : 
        ['population_key'];
    
    // extract feature names in order
    const featureNames = extractFeatureNames(formData.features);
    
    // generate preprocessing configuration
    const preprocessing = generatePreprocessingConfig(formData.features, formData.preprocessingSteps || []);
    
    // generate percentile breaks
    const percentileBreaks = generatePercentileBreaks();
    
    // build metadata config
    const config: MetadataConfig = {
        key: generateUniqueKey(),
        model_cd: modelCode,
        version: numericVersion,
        description: formData.businessPurpose || `${formData.initiativeName} Model`,
        docker_image_name: generateDockerImageName(modelCode, formData.modelVersion),
        id_keys: idKeys,
        feature_names: featureNames,
        preprocessing,
        metadata: {
            percentile_breaks: percentileBreaks,
            training_raw: formData.trainTable ? `${formData.projectId}.${formData.trainTable}` : undefined,
            training_processed: formData.processedTrainTable ? `${formData.projectId}.${formData.processedTrainTable}` : undefined,
            metrics: {
                auc: parseFloat(formData.auc) || 0,
                f1: parseFloat(formData.f1Score) || 0,
                precision: parseFloat(formData.precision) || 0,
                recall: parseFloat(formData.recall) || 0
            }
        },
        ranking_intervals: percentileBreaks.slice(1) // Remove first 0 value
    };
    
    return config;
}

// Export as YAML string
export function generateModelVersionMetadataYAML(formData: FormData): string {
    const config = generateModelVersionMetadata(formData);
    
    // Convert to YAML string
    const yamlContent = `key: ${config.key}
model_cd: ${config.model_cd}
version: ${config.version}
description: ${config.description}
docker_image_name: ${config.docker_image_name}
id_keys:
${config.id_keys.map(key => `  - ${key}`).join('\n')}
feature_names:
${config.feature_names.map(name => `  - ${name}`).join('\n')}
preprocessing:
  steps:
${config.preprocessing.steps.map(step => `    - ${step}`).join('\n')}${config.preprocessing.clipping ? `
  clipping:
${Object.entries(config.preprocessing.clipping).map(([key, value]: [string, any]) => 
    `    ${key}:
      range:
${value.range.map((r: number) => `      - ${r}`).join('\n')}`
).join('\n')}` : ''}${config.preprocessing.encoding ? `
  encoding:
${Object.entries(config.preprocessing.encoding).map(([key, value]: [string, any]) => 
    `    ${key}:
      default_missing: ${value.default_missing}
      default_unknown: ${value.default_unknown}
      mapping:
${Object.entries(value.mapping).map(([k, v]) => `        ${k}: ${v}`).join('\n')}`
).join('\n')}` : ''}${config.preprocessing.binning ? `
  binning:
${Object.entries(config.preprocessing.binning).map(([key, value]: [string, any]) => 
    `    ${key}:
      nbr_bins: ${value.nbr_bins}
      labels:
${value.labels.map((label: number) => `      - ${label}`).join('\n')}
      intervals:
${value.intervals.map((interval: number) => `      - ${interval}`).join('\n')}`
).join('\n')}` : ''}${config.preprocessing.imputation ? `
  imputation:
${Object.entries(config.preprocessing.imputation).map(([key, value]: [string, any]) => 
    `    ${key}:
      strategy: ${value.strategy}${value.value !== undefined ? `
      value: ${value.value}` : ''}`
).join('\n')}` : ''}
metadata:
  percentile_breaks:
${config.metadata.percentile_breaks.map(pb => `    - ${pb}`).join('\n')}${config.metadata.training_raw ? `
  training_raw: ${config.metadata.training_raw}` : ''}${config.metadata.training_processed ? `
  training_processed: ${config.metadata.training_processed}` : ''}
  metrics:
    auc: ${config.metadata.metrics?.auc}
    f1: ${config.metadata.metrics?.f1}
    precision: ${config.metadata.metrics?.precision}
    recall: ${config.metadata.metrics?.recall}
ranking_intervals:
${config.ranking_intervals.map(ri => `  - ${ri}`).join('\n')}`;

    return yamlContent;
}


