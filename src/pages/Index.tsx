import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import IDEPreviewSection from "@/components/IDEPreviewSection";
import EnforcementSection from "@/components/EnforcementSection";
import CaseStudySection from "@/components/CaseStudySection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AMIT–BODHIT | Co-Build System for Real Skill Transfer</title>
        <meta 
          name="description" 
          content="Stop outsourcing your college projects. AMIT–BODHIT is a co-building platform with enforced guidance where you write every line of code and learn real skills." 
        />
        <meta name="keywords" content="coding platform, project-based learning, skill transfer, no shortcuts, learn to code, college projects" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <IDEPreviewSection />
          <EnforcementSection />
          <CaseStudySection />
          <PricingSection />
        </main>
        <FooterSection />
      </div>
    </>
  );
};

export default Index;
