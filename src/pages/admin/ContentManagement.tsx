import React, { useState, useEffect } from 'react';
import { FileText, Image, Plus, Edit2, Trash2, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import toast from 'react-hot-toast';
import PageEditor from '../../components/admin/cms/PageEditor';
import BannerEditor from '../../components/admin/cms/BannerEditor';
import FAQEditor from '../../components/admin/cms/FAQEditor';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link?: string;
  description?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('pages');
  const [pages, setPages] = useState<Page[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    try {
      setLoading(true);

      switch (activeTab) {
        case 'pages':
          const { data: pagesData, error: pagesError } = await supabase
            .from('pages')
            .select('*')
            .order('updated_at', { ascending: false });
          if (pagesError) throw pagesError;
          setPages(pagesData || []);
          break;

        case 'banners':
          const { data: bannersData, error: bannersError } = await supabase
            .from('banners')
            .select('*')
            .order('display_order', { ascending: true });
          if (bannersError) throw bannersError;
          setBanners(bannersData || []);
          break;

        case 'faqs':
          const { data: faqsData, error: faqsError } = await supabase
            .from('faqs')
            .select('*')
            .order('category', { ascending: true })
            .order('display_order', { ascending: true });
          if (faqsError) throw faqsError;
          setFaqs(faqsData || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      let table = '';
      switch (activeTab) {
        case 'pages':
          table = 'pages';
          break;
        case 'banners':
          table = 'banners';
          break;
        case 'faqs':
          table = 'faqs';
          break;
      }

      if (selectedItem) {
        // Update existing item
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', selectedItem.id);

        if (error) throw error;
        toast.success('Updated successfully');
      } else {
        // Create new item
        const { error } = await supabase
          .from(table)
          .insert(data);

        if (error) throw error;
        toast.success('Created successfully');
      }

      setShowEditor(false);
      setSelectedItem(null);
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from(activeTab)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Deleted successfully');
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const tabs = [
    { id: 'pages', label: 'Pages' },
    { id: 'banners', label: 'Banners' },
    { id: 'faqs', label: 'FAQs' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (showEditor) {
    const EditorComponent = {
      pages: PageEditor,
      banners: BannerEditor,
      faqs: FAQEditor
    }[activeTab];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
          </h1>
          <button
            onClick={() => {
              setShowEditor(false);
              setSelectedItem(null);
            }}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <EditorComponent
          item={selectedItem}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setSelectedItem(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm">
        {activeTab === 'pages' && (
          <div className="divide-y divide-gray-200">
            {pages.map((page) => (
              <div key={page.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    page.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(page);
                        setShowEditor(true);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pages.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pages Found</h3>
                <p className="text-gray-600">Get started by creating a new page.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {banners.map((banner) => (
              <div key={banner.id} className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(banner);
                        setShowEditor(true);
                      }}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:text-indigo-600"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="font-medium text-gray-900">{banner.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      banner.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">Order: {banner.display_order}</span>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Banners Found</h3>
                <p className="text-gray-600">Get started by creating a new banner.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      {faq.category}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(faq);
                          setShowEditor(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h3>
                <p className="text-gray-600">Get started by creating a new FAQ.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}