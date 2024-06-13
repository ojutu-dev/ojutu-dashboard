'use client';

import DetailForm from '../DetailForm';

export default function NewItem() {
  return (
    <div className="flex">
      <div className="flex flex-col w-full">
        <div className="p-4">
          <DetailForm />
        </div>
      </div>
    </div>
  );
}