import React from 'react';
import { Search } from 'lucide-react';
import CategoryList from '../components/categories/CategoryList';

export default function Categories() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Event Categories</h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Discover events by category. From music concerts to sports events, find experiences that match your interests.
        </p>
      </div>

      <div className="mb-12">
        <div className="mx-auto max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <CategoryList />
    </div>
  );
}