import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import AppointmentSection from '../components/AppointmentSection';
import DepartmentsSection from '../components/DepartmentsSection';
import PsychologistsSection from '../components/DoctorsSection';
import FaqSection from '../components/FaqSection';
import GallerySection from '../components/GallerySection';
import ContactSection from '../components/ContactSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PsychologistsSection />
    </>
  );
};

export default HomePage;