// src/components/DeploymentForm/steps/Step8FileGeneration.tsx
'use client';

import { CheckCircle, Download, Eye, FileText, Code, Database, Archive, Folder } from 'lucide-react';
import { useFormContext } from '../FormProvider';
import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { PreprocessingStep } from '@/types/form';

interface GeneratedFile {
  filename: string;
  content: string;
  type: 'yaml' | 'py' | 'sql' | 'env';
  icon: React.ReactNode;
  description: string;
}

export default function Step8FileGeneration() {
  const { state } = useFormContext();
  const { data } = state;
  
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filesGenerated, setFilesGenerated] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Generate model code from initiative name and version
  const modelCode = `${data.initiativeName.toLowerCase().replace(/\s+/g, '_')}_${data.modelVersion.replace(/\./g, '_')}`;
  const targetDirectory = `initiatives/${modelCode}/deployment/${data.modelVersion}/`;

  // Auto-generate files when component mounts
  useEffect(() => {
    if (!filesGenerated) {
      generateFiles();
    }
  }, [filesGenerated]);

  const generateFiles = () => {
    setIsGenerating(true);
    
    // Simulate file generation delay for realistic UX
    setTimeout(() => {
      const files: GeneratedFile[] = [
        {
          filename: 'model_version_metadata.yaml',
          type: 'yaml',
          icon: <FileText className="text-blue-600" size={16} />,
          description: 'Model configuration and metadata',
          content: `# Model Version Metadata
model_cd: "${modelCode}"
model_name: "${data.initiativeName}"
model_version: "${data.modelVersion}"
model_type: "${data.modelType}"
business_purpose: "${data.businessPurpose}"
data_scientist: "${data.dataScientist}"
target_deployment_date: "${data.targetDeploymentDate}"
docker_image_name: "gcr.io/mlops-platform/${modelCode}:${data.modelVersion}"

repository:
  url: "${data.repositoryUrl}"
  branch: "${data.branch}"
  commit_hash: "${data.commitHash || 'latest'}"

dataset:
  project_id: "${data.projectId}"
  train_table: "${data.trainTable}"
  test_table: "${data.testTable}"
  validation_table: "${data.valTable}"
  oot_table: "${data.ootTable}"
  processed_train_table: "${data.processedTrainTable || data.trainTable + '_processed'}"
  processed_test_table: "${data.processedTestTable || data.testTable + '_processed'}"
  processed_validation_table: "${data.processedValTable || data.valTable + '_processed'}"
  processed_oot_table: "${data.processedOotTable || data.ootTable + '_processed'}"
  
keys:
  id_keys: ["${data.populationKey}"]
  target_column: "${data.targetColumn}"
  population_key: "${data.populationKey}"
  exclusion_criteria: "${data.exclusionCriteria || 'None'}"

performance_metrics:
  auc: ${data.auc || 'null'}
  f1_score: ${data.f1Score || 'null'}
  precision: ${data.precision || 'null'}
  recall: ${data.recall || 'null'}
  notes: "${data.performanceNotes || 'No additional notes'}"

features:
${data.features.sort((a, b) => a.order - b.order).map(f => {
  let featureYaml = `  - name: "${f.name}"
    type: "${f.type}"
    description: "${f.description}"`;
  
  // Add transformation if present
  if (f.transformation && f.transformation.trim()) {
    featureYaml += `
    transformation: "${f.transformation}"`;
  }
  
  // Add preprocessing steps if present
  const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
    step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
  );
  if (steps.length > 0) {
    featureYaml += `
    preprocessing_steps:`;
    steps.forEach((step, index) => {
      featureYaml += `
      step_${index + 1}:
        name: "${step.name}"
        value: "${step.value}"`;
    });
  }
  
  return featureYaml;
}).join('\n')}

infrastructure:
  machine_type: "${data.machineType}"
  max_workers: ${data.maxWorkers}
  disk_size: "${data.diskSize}GB"
  schedule: "${data.schedule}"
  alert_emails:
${data.alertEmails.filter(email => email.trim()).map(email => `    - "${email}"`).join('\n')}

ranking_intervals:
  daily: true
  weekly: true
  monthly: false

model_artifacts:
  model_file: "${modelCode}_model.pkl"
  config_file: "${modelCode}_config.yaml"
  requirements_file: "requirements.txt"
  
metadata:
  created_at: "${new Date().toISOString()}"
  created_by: "${data.dataScientist}"
  model_directory: "${targetDirectory}"
  deployment_status: "pending"
`
        },
        {
          filename: 'model_catalog_metadata.yaml',
          type: 'yaml',
          icon: <Database className="text-green-600" size={16} />,
          description: 'Registry metadata for model catalog',
          content: `# Model Catalog Metadata
catalog_entry:
  model_id: "${modelCode}"
  name: "${data.initiativeName}"
  version: "${data.modelVersion}"
  status: "pending_deployment"
  
dataset:
  project_id: "${data.projectId}"
  train_table: "${data.trainTable}"
  test_table: "${data.testTable}"
  validation_table: "${data.valTable}"
  oot_table: "${data.ootTable}"
  population_key: "${data.populationKey}"
  target_column: "${data.targetColumn}"
  exclusion_criteria: "${data.exclusionCriteria}"

deployment:
  target_directory: "${targetDirectory}"
  created_by: "${data.dataScientist}"
  created_at: "${new Date().toISOString()}"
`
        },
        {
          filename: 'deployment.yaml',
          type: 'yaml',
          icon: <CheckCircle className="text-indigo-600" size={16} />,
          description: 'Deployment configuration',
          content: `# Deployment Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${modelCode}-config
  namespace: mlops-production

data:
  MODEL_NAME: "${data.initiativeName}"
  MODEL_VERSION: "${data.modelVersion}"
  MODEL_TYPE: "${data.modelType}"
  MACHINE_TYPE: "${data.machineType}"
  MAX_WORKERS: "${data.maxWorkers}"
  DISK_SIZE: "${data.diskSize}"
  SCHEDULE: "${data.schedule}"
  PROJECT_ID: "${data.projectId}"
  TARGET_COLUMN: "${data.targetColumn}"
  POPULATION_KEY: "${data.populationKey}"

---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${modelCode}-prediction
  namespace: mlops-production
spec:
  schedule: "${data.schedule}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: model-prediction
            image: gcr.io/mlops-platform/model-runner:latest
            envFrom:
            - configMapRef:
                name: ${modelCode}-config
            resources:
              requests:
                memory: "2Gi"
                cpu: "1000m"
              limits:
                memory: "4Gi"
                cpu: "2000m"
          restartPolicy: OnFailure
`
        },
        {
          filename: 'deployment.env',
          type: 'env',
          icon: <FileText className="text-yellow-600" size={16} />,
          description: 'Environment variables',
          content: `# Environment Variables for ${data.initiativeName} v${data.modelVersion}
MODEL_NAME=${data.initiativeName}
MODEL_VERSION=${data.modelVersion}
MODEL_TYPE=${data.modelType}
BUSINESS_PURPOSE=${data.businessPurpose}
DATA_SCIENTIST=${data.dataScientist}
TARGET_DEPLOYMENT_DATE=${data.targetDeploymentDate}

# Repository
REPOSITORY_URL=${data.repositoryUrl}
BRANCH=${data.branch}
COMMIT_HASH=${data.commitHash}

# Dataset
PROJECT_ID=${data.projectId}
TRAIN_TABLE=${data.trainTable}
TEST_TABLE=${data.testTable}
VAL_TABLE=${data.valTable}
OOT_TABLE=${data.ootTable}
POPULATION_KEY=${data.populationKey}
TARGET_COLUMN=${data.targetColumn}
EXCLUSION_CRITERIA=${data.exclusionCriteria}

# Infrastructure
MACHINE_TYPE=${data.machineType}
MAX_WORKERS=${data.maxWorkers}
DISK_SIZE=${data.diskSize}
SCHEDULE=${data.schedule}
ALERT_EMAILS=${data.alertEmails.filter(email => email.trim()).join(',')}

# Generated
GENERATED_AT=${new Date().toISOString()}
TARGET_DIRECTORY=${targetDirectory}
`
        },
        {
          filename: 'prediction.yaml',
          type: 'yaml',
          icon: <Code className="text-purple-600" size={16} />,
          description: 'Pipeline configuration (placeholder)',
          content: `# Prediction Pipeline Configuration
# This is a placeholder - customize based on your ML pipeline requirements

pipeline:
  name: "${data.initiativeName.toLowerCase().replace(/\s+/g, '_')}_prediction"
  version: "${data.modelVersion}"
  
steps:
  - name: "data_ingestion"
    type: "sql_query"
    config:
      query_file: "population.sql"
      output_table: "temp_population"
      
  - name: "data_preparation"
    type: "sql_query"
    config:
      query_file: "data_ingestion.sql"
      input_table: "temp_population"
      output_table: "prepared_data"
      
  - name: "model_prediction"
    type: "python_script"
    config:
      script_file: "prediction.py"
      input_table: "prepared_data"
      model_path: "/models/${modelCode}"
      
  - name: "results_export"
    type: "export"
    config:
      output_format: "csv"
      destination: "gs://mlops-results/${modelCode}/"

schedule: "${data.schedule}"
alerts:
  on_failure: ${JSON.stringify(data.alertEmails.filter(email => email.trim()))}
`
        },
        {
          filename: 'prediction.py',
          type: 'py',
          icon: <Code className="text-orange-600" size={16} />,
          description: 'Pipeline code (placeholder)',
          content: `#!/usr/bin/env python3
"""
Prediction pipeline for ${data.initiativeName} v${data.modelVersion}
Generated automatically - customize based on your model requirements
"""

import pandas as pd
import numpy as np
from google.cloud import bigquery
import joblib
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelPredictor:
    def __init__(self):
        self.model_name = "${data.initiativeName}"
        self.model_version = "${data.modelVersion}"
        self.project_id = "${data.projectId}"
        self.target_column = "${data.targetColumn}"
        self.population_key = "${data.populationKey}"
        
        # Initialize BigQuery client
        self.client = bigquery.Client(project=self.project_id)
        
    def load_model(self, model_path: str):
        """Load the trained model"""
        logger.info(f"Loading model from {model_path}")
        # TODO: Implement model loading based on your model type
        # Example: self.model = joblib.load(model_path)
        pass
        
    def load_data(self, table_name: str) -> pd.DataFrame:
        """Load data from BigQuery"""
        query = f"""
        SELECT *
        FROM \`{self.project_id}.{table_name}\`
        WHERE {self.population_key} IS NOT NULL
        """
        
        logger.info(f"Loading data from {table_name}")
        return self.client.query(query).to_dataframe()
        
    def preprocess_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocess features for prediction"""
        logger.info("Preprocessing features")
        
        # Apply feature transformations and preprocessing steps
${data.features.sort((a, b) => a.order - b.order).map(f => {
  let code = `        # ${f.name} (${f.type}): ${f.description}`;
  
  if (f.transformation && f.transformation.trim()) {
    code += `\n        # Transformation: ${f.transformation}`;
  }
  
  // Add preprocessing steps
  const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
    step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
  );
  
  if (steps.length > 0) {
    steps.forEach((step, index) => {
      code += `\n        # Step ${index + 1}: ${step.name} = ${step.value}`;
    });
  }
  
  // Add basic preprocessing template based on type
  switch(f.type) {
    case 'numerical':
      code += `\n        # TODO: Apply numerical preprocessing for ${f.name}`;
      if (steps.some(s => s.name.toLowerCase().includes('cap') || s.name.toLowerCase().includes('floor'))) {
        code += `\n        # df['${f.name}'] = np.clip(df['${f.name}'], min_val, max_val)`;
      }
      if (steps.some(s => s.name.toLowerCase().includes('impute'))) {
        code += `\n        # df['${f.name}'] = df['${f.name}'].fillna(median_value)`;
      }
      if (steps.some(s => s.name.toLowerCase().includes('bin'))) {
        code += `\n        # df['${f.name}_binned'] = pd.cut(df['${f.name}'], bins=n_bins)`;
      }
      break;
    case 'categorical':
      code += `\n        # TODO: Apply categorical preprocessing for ${f.name}`;
      if (steps.some(s => s.name.toLowerCase().includes('encode'))) {
        code += `\n        # df['${f.name}_encoded'] = label_encoder.transform(df['${f.name}'])`;
      }
      if (steps.some(s => s.name.toLowerCase().includes('impute'))) {
        code += `\n        # df['${f.name}'] = df['${f.name}'].fillna('Unknown')`;
      }
      break;
    case 'boolean':
      code += `\n        # TODO: Apply boolean preprocessing for ${f.name}`;
      break;
    case 'datetime':
      code += `\n        # TODO: Apply datetime preprocessing for ${f.name}`;
      if (steps.some(s => s.name.toLowerCase().includes('extract'))) {
        code += `\n        # df['${f.name}_year'] = df['${f.name}'].dt.year`;
        code += `\n        # df['${f.name}_month'] = df['${f.name}'].dt.month`;
      }
      break;
  }
  
  return code;
}).join('\n')}
        
        return df
        
    def predict(self, df: pd.DataFrame) -> np.ndarray:
        """Generate predictions"""
        logger.info(f"Generating predictions for {len(df)} records")
        
        # TODO: Implement prediction logic
        # Example: predictions = self.model.predict_proba(df)[:, 1]
        
        # Placeholder - return random predictions
        return np.random.rand(len(df))
        
    def save_results(self, df: pd.DataFrame, predictions: np.ndarray, output_table: str):
        """Save predictions to BigQuery"""
        logger.info(f"Saving results to {output_table}")
        
        # Add predictions to dataframe
        df['prediction'] = predictions
        df['model_version'] = self.model_version
        df['prediction_date'] = pd.Timestamp.now()
        
        # TODO: Implement saving logic
        # df.to_gbq(output_table, project_id=self.project_id, if_exists='replace')
        
    def run_pipeline(self):
        """Run the complete prediction pipeline"""
        logger.info(f"Starting prediction pipeline for {self.model_name} v{self.model_version}")
        
        try:
            # Load data
            df = self.load_data("prepared_data")
            
            # Preprocess features
            df_processed = self.preprocess_features(df)
            
            # Generate predictions
            predictions = self.predict(df_processed)
            
            # Save results
            self.save_results(df, predictions, f"{self.project_id}.predictions.{self.model_name.lower().replace(' ', '_')}")
            
            logger.info("Pipeline completed successfully")
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}")
            raise

if __name__ == "__main__":
    predictor = ModelPredictor()
    predictor.run_pipeline()
`
        },
        {
          filename: 'population.sql',
          type: 'sql',
          icon: <Database className="text-teal-600" size={16} />,
          description: 'Data selection query',
          content: `-- Population Selection Query for ${data.initiativeName} v${data.modelVersion}
-- Generated automatically - customize based on your data requirements

WITH base_population AS (
  SELECT 
    ${data.populationKey} as population_key,
    -- Add your population selection criteria here
    *
  FROM \`${data.projectId}.${data.trainTable.split('.')[0]}.${data.trainTable.split('.')[1] || 'population_table'}\`
  WHERE 1=1
    -- Add date filters, active status, etc.
    AND DATE(_PARTITIONTIME) = CURRENT_DATE()
    ${data.exclusionCriteria ? `-- Exclusion criteria: ${data.exclusionCriteria}` : ''}
),

feature_population AS (
  SELECT 
    p.*,
    -- Add feature columns here based on your feature list
${data.features.sort((a, b) => a.order - b.order).map(f => {
  let comment = `    -- ${f.name} (${f.type}): ${f.description}`;
  
  // Add preprocessing step information
  const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
    step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
  );
  
  if (steps.length > 0) {
    comment += `\n    -- Preprocessing: ${steps.map(s => `${s.name}=${s.value}`).join(', ')}`;
  }
  
  if (f.transformation && f.transformation.trim()) {
    comment += `\n    -- Transformation: ${f.transformation}`;
  }
  
  return comment;
}).join('\n')}
  FROM base_population p
  -- Add JOINs to feature tables as needed
)

SELECT *
FROM feature_population
WHERE ${data.populationKey} IS NOT NULL
  -- Add any final filters
ORDER BY ${data.populationKey}
`
        },
        {
          filename: 'data_ingestion.sql',
          type: 'sql',
          icon: <Database className="text-cyan-600" size={16} />,
          description: 'Data preparation query',
          content: `-- Data Ingestion and Preparation Query
-- ${data.initiativeName} v${data.modelVersion}

WITH raw_data AS (
  SELECT *
  FROM temp_population
),

cleaned_data AS (
  SELECT 
    ${data.populationKey},
    -- Clean and transform features with preprocessing steps
${data.features.sort((a, b) => a.order - b.order).map(f => {
  let sql = '';
  const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
    step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
  );
  
  // Basic cleaning based on type
  switch(f.type) {
    case 'numerical':
      sql = `    SAFE_CAST(${f.name} AS FLOAT64) as ${f.name}_raw,`;
      break;
    case 'categorical':
      sql = `    UPPER(TRIM(${f.name})) as ${f.name}_raw,`;
      break;
    case 'boolean':
      sql = `    CASE WHEN UPPER(${f.name}) IN ('TRUE', '1', 'YES') THEN TRUE ELSE FALSE END as ${f.name}_raw,`;
      break;
    case 'datetime':
      sql = `    SAFE_CAST(${f.name} AS TIMESTAMP) as ${f.name}_raw,`;
      break;
    default:
      sql = `    ${f.name} as ${f.name}_raw,`;
  }
  
  // Add comments for preprocessing steps
  if (steps.length > 0) {
    sql += `\n    -- Preprocessing steps for ${f.name}:`;
    steps.forEach((step, index) => {
      sql += `\n    -- Step ${index + 1}: ${step.name} = ${step.value}`;
    });
  }
  
  return sql;
}).join('\n')}
    
    -- Add derived features
    CURRENT_TIMESTAMP() as processing_timestamp
    
  FROM raw_data
  WHERE ${data.populationKey} IS NOT NULL
),

final_features AS (
  SELECT 
    ${data.populationKey},
${data.features.sort((a, b) => a.order - b.order).map(f => {
  let sql = '';
  const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
    step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
  );
  
  if (f.transformation && f.transformation.trim()) {
    sql = `    -- ${f.transformation} transformation for ${f.name}
    ${f.name}_raw as ${f.name},`;
  } else {
    sql = `    ${f.name}_raw as ${f.name},`;
  }
  
  // Add preprocessing step transformations as additional columns
  if (steps.length > 0) {
    sql += `\n    -- TODO: Apply preprocessing steps:`;
    steps.forEach((step, index) => {
      sql += `\n    -- ${step.name}: ${step.value}`;
    });
  }
  
  return sql;
}).join('\n')}
    processing_timestamp
    
  FROM cleaned_data
)

SELECT *
FROM final_features
ORDER BY ${data.populationKey}
`
        }
      ];

      setGeneratedFiles(files);
      setFilesGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  useEffect(() => {
    // Auto-generate files when component mounts
    generateFiles();
  }, []);

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { 
      type: file.type === 'yaml' ? 'application/x-yaml' : 
           file.type === 'py' ? 'text/x-python' : 
           file.type === 'sql' ? 'application/sql' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    const zip = new JSZip();
    
    // Add all files to the ZIP
    generatedFiles.forEach(file => {
      zip.file(file.filename, file.content);
    });
    
    try {
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelCode}_deployment_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      // Fallback to individual downloads
      generatedFiles.forEach((file, index) => {
        setTimeout(() => downloadFile(file), index * 100);
      });
    }
  };

  const getSyntaxHighlightClass = (type: string) => {
    switch (type) {
      case 'yaml': return 'language-yaml';
      case 'py': return 'language-python';
      case 'sql': return 'language-sql';
      case 'env': return 'language-bash';
      default: return 'language-text';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 File Generation & Download</h2>
        <p className="text-gray-600">Generate and download all deployment files</p>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating deployment files...</p>
        </div>
      ) : (
        <>
          {/* Success Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="text-green-600 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-green-800">✅ Deployment configuration complete!</h3>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>📁 <strong>Target directory:</strong> <code className="bg-green-100 px-2 py-1 rounded">{targetDirectory}</code></p>
              <p>🔄 <strong>Next steps:</strong> Review generated files and coordinate with MLOps team for deployment</p>
            </div>
          </div>

          {/* Download All Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={downloadAllFiles}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg"
            >
              <Archive size={20} />
              📥 Download All Files (ZIP)
            </button>
          </div>

          {/* Generated Files List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Files Preview:</h3>
            
            {generatedFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {file.icon}
                    <div>
                      <h4 className="font-medium text-gray-800">{file.filename}</h4>
                      <p className="text-sm text-gray-600">{file.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(showPreview === file.filename ? null : file.filename)}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded transition-colors"
                      title="Preview file"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => downloadFile(file)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded transition-colors"
                      title="Download file"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                {showPreview === file.filename && (
                  <div className="mt-4 border-t pt-4">
                    <pre className={`bg-gray-50 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto ${getSyntaxHighlightClass(file.type)}`}>
                      <code>{file.content}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-blue-800 mb-2">📋 File Summary:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>model_version_metadata.yaml</strong> - Complete model configuration with detailed preprocessing steps</li>
              <li>• <strong>model_catalog_metadata.yaml</strong> - Registry metadata for model catalog integration</li>
              <li>• <strong>deployment.yaml</strong> - Kubernetes deployment configuration</li>
              <li>• <strong>deployment.env</strong> - Environment variables for deployment</li>
              <li>• <strong>prediction.yaml</strong> - ML pipeline configuration template</li>
              <li>• <strong>prediction.py</strong> - Python pipeline code with preprocessing logic</li>
              <li>• <strong>population.sql</strong> - Data selection query with feature documentation</li>
              <li>• <strong>data_ingestion.sql</strong> - Data preparation with preprocessing step comments</li>
            </ul>
            
            {data.features.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">🔧 Features with Preprocessing:</h5>
                <div className="text-xs text-blue-600 max-h-32 overflow-y-auto">
                  {data.features.sort((a, b) => a.order - b.order).map((f, index) => {
                    const steps = [f.step1, f.step2, f.step3, f.step4].filter((step): step is PreprocessingStep => 
                      step !== undefined && step.name !== undefined && step.value !== undefined && step.name.trim() !== '' && step.value.trim() !== ''
                    );
                    return (
                      <div key={index} className="mb-1">
                        <strong>{f.name}</strong> ({f.type})
                        {steps.length > 0 && (
                          <span className="ml-2 text-blue-500">
                            [{steps.map(s => `${s.name}=${s.value}`).join(', ')}]
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
