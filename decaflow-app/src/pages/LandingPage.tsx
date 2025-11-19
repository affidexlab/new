import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import StatsSection from '../components/sections/StatsSection';
import IntroducingSection from '../components/sections/IntroducingSection';
import WhatWeDoSection from '../components/sections/WhatWeDoSection';
import ProtocolSections from '../components/sections/ProtocolSections';
import IntraChainSection from '../components/sections/IntraChainSection';

const LandingPage = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <IntroducingSection />
        <WhatWeDoSection />
        <ProtocolSections />
        <IntraChainSection />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
