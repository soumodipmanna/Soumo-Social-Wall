import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'Sign In',
    detail: 'Choose a username and store it locally.',
  },
  {
    title: 'Create Post',
    detail: 'Share text and optional image URLs.',
  },
  {
    title: 'Engage',
    detail: 'Like posts or open the comment modal.',
  },
  {
    title: 'Persist',
    detail: 'Posts and comments stay in localStorage.',
  },
];

const FlowDiagram: React.FC = () => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.title} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{step.title}</p>
            <p className="text-sm text-gray-600">{step.detail}</p>
          </div>
          {index < steps.length - 1 ? (
            <ArrowRight className="w-5 h-5 text-gray-300" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default FlowDiagram;
