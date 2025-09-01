import React, { useState } from "react";
import { X, FileText, Save, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface ContextSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (contextData: WizardContextData) => void;
  chatUuid: string;
}

export interface WizardContextData {
  projectName: string;
  appDescription: string;
  techStack: string[];
  userStories: string;
  readme: string;
  constraints: string;
}

const TECH_STACKS = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express",
  "FastAPI",
  "Django",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "TypeScript",
  "JavaScript",
  "Python",
  "Tailwind CSS",
  "Material-UI",
  "Chakra UI"
];

export function ContextSetupWizard({ isOpen, onClose, onComplete, chatUuid }: ContextSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardContextData>({
    projectName: '',
    appDescription: '',
    techStack: [],
    userStories: '',
    readme: '',
    constraints: ''
  });

  const steps = [
    { title: 'Project Name', description: 'Name your project' },
    { title: 'App Description', description: 'Describe your application' },
    { title: 'Tech Stack', description: 'Choose your technologies' },
    { title: 'User Stories', description: 'Define user requirements' },
    { title: 'README Content', description: 'Add README documentation' },
    { title: 'Constraints', description: 'Non-functional requirements' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
    onClose();
  };

  const updateFormData = (field: keyof WizardContextData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: 'userStories' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: 'userStories' | 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: 'userStories' | 'features', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.projectName.trim() && formData.description.trim();
      case 1: return formData.projectType;
      case 2: return formData.techStack.length > 0;
      case 3: return formData.goals.trim();
      case 4: return formData.userStories.some(story => story.trim());
      case 5: return formData.features.some(feature => feature.trim());
      default: return true;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Setup New Project Context
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  index < currentStep ? "bg-green-500 text-white" :
                  index === currentStep ? "bg-blue-500 text-white" :
                  "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                )}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-2",
                    index < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => updateFormData('projectName', e.target.value)}
                  placeholder="Enter your project name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe what your project does..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              {PROJECT_TYPES.map((type) => (
                <label key={type.value} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="projectType"
                    value={type.value}
                    checked={formData.projectType === type.value}
                    onChange={(e) => updateFormData('projectType', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Select the technologies you plan to use:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {COMMON_TECH_STACKS.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTechStack(tech)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-colors",
                      formData.techStack.includes(tech)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    )}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Goals & Vision *
              </label>
              <textarea
                value={formData.goals}
                onChange={(e) => updateFormData('goals', e.target.value)}
                placeholder="What do you want to achieve with this project? What problems does it solve?"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Stories *
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Describe what users should be able to do with your project:
              </p>
              {formData.userStories.map((story, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={story}
                    onChange={(e) => updateArrayItem('userStories', index, e.target.value)}
                    placeholder="As a user, I want to..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {formData.userStories.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('userStories', index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('userStories')}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                + Add another user story
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Features *
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                List the main features you want to build:
              </p>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateArrayItem('features', index, e.target.value)}
                    placeholder="Feature name or description..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {formData.features.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('features', index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('features')}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                + Add another feature
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {steps.length}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Complete Setup</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
