import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Star, Shield, CreditCard, Users } from 'lucide-react';
import HomeSearch from '../components/search/HomeSearch';
import { EventCardList } from '../components/EventCard';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 to-indigo-800 h-[600px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea"
            alt="Hero background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Experience the Best Events <br />Across Africa
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Discover and book tickets to concerts, festivals, cultural events, and more. Your gateway to unforgettable experiences.
          </p>
          
          <HomeSearch />
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            <Link to="/events" className="text-indigo-600 hover:text-indigo-700">
              View all events →
            </Link>
          </div>
          <EventCardList featured={true} limit={6} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AfriTix?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure ticket booking process</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Safe and reliable payment options</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-gray-600">Get your tickets delivered instantly</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated customer support team</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}