import React from 'react';
import { useToast } from '../../hooks/useToast';

const ToastTest: React.FC = () => {
  const { success, error, warning, info } = useToast();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Toast Notification Test</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => success('Success!', 'This is a success message')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Test Success Toast
        </button>
        
        <button
          onClick={() => error('Error!', 'This is an error message')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Test Error Toast
        </button>
        
        <button
          onClick={() => warning('Warning!', 'This is a warning message')}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Test Warning Toast
        </button>
        
        <button
          onClick={() => info('Info!', 'This is an info message')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Test Info Toast
        </button>
      </div>
    </div>
  );
};

export default ToastTest; 