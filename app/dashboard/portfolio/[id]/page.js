'use client';

import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import DetailForm from '../DetailForm';

export default function PostDetail() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Header />
        <div className="p-4">
          <DetailForm />
        </div>
      </div>
    </div>
  );
}