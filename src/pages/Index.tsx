
import React from 'react';
import Hero from '@/components/LandingPage/Hero';
import Features from '@/components/LandingPage/Features';
import Testimonials from '@/components/LandingPage/Testimonials';
import CallToAction from '@/components/LandingPage/CallToAction';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
