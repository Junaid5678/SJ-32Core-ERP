import React from 'react';
import EngineWorkspace from '../../../../src/components/EngineWorkspace';

export default function EnginePage({ params }: { params: { engine: string } }) {
  const engineKey = params.engine;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{engineKey.replace('-', ' ').toUpperCase()}</h1>
      <div className="mt-4">
        <EngineWorkspace engineKey={engineKey} />
      </div>
    </div>
  );
}
