import { Check, X, ArrowRight, Zap, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free Tier",
    subtitle: "Prove yourself first",
    price: "₹0",
    period: "",
    description: "Submit your project idea. If accepted, you get access to basic IDE and self-paced learning.",
    features: [
      { text: "Project feasibility assessment", included: true },
      { text: "Basic IDE access", included: true },
      { text: "Community learning resources", included: true },
      { text: "Progress tracking", included: true },
      { text: "Mentor reviews", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Submit Project Idea",
    variant: "outline" as const,
    icon: Zap,
  },
  {
    name: "Builder Plan",
    subtitle: "Most popular",
    price: "₹2,999",
    period: "/project",
    description: "Full co-building experience with mentor checkpoints, advanced IDE features, and deadline tracking.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "3 mentor review checkpoints", included: true },
      { text: "Advanced IDE features", included: true },
      { text: "Deadline-based scheduling", included: true },
      { text: "Code quality feedback", included: true },
      { text: "Proof-of-work certificate", included: true },
    ],
    cta: "Start Building",
    variant: "hero" as const,
    popular: true,
    icon: Users,
  },
  {
    name: "Pro Builder",
    subtitle: "For serious learners",
    price: "₹5,999",
    period: "/project",
    description: "Unlimited mentor access, architecture reviews, interview prep, and guaranteed placement support.",
    features: [
      { text: "Everything in Builder", included: true },
      { text: "Unlimited mentor sessions", included: true },
      { text: "Architecture deep-dives", included: true },
      { text: "Interview prep support", included: true },
      { text: "Resume & portfolio review", included: true },
      { text: "Placement assistance", included: true },
    ],
    cta: "Go Pro",
    variant: "outline" as const,
    icon: Crown,
  },
];

const whatWeReject = [
  "Projects that are just copy-paste jobs",
  "Students who want someone else to code",
  "Deadline emergency requests (< 2 weeks)",
  "Anyone asking for 'just completion'",
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary mb-4">
            PRICING
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Pay for <span className="text-gradient">Learning</span>, Not Shortcuts
          </h2>
          <p className="text-muted-foreground">
            Our pricing rewards autonomy. The more you do yourself, the less you pay.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative rounded-xl border bg-card/50 overflow-hidden transition-all duration-300 hover:scale-105 ${
                tier.popular 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-border hover:border-primary/30"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary py-1 text-center text-xs font-bold text-primary-foreground">
                  MOST POPULAR
                </div>
              )}
              
              <div className={`p-6 ${tier.popular ? "pt-10" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tier.popular ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <tier.icon className={`w-5 h-5 ${tier.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">{tier.subtitle}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-black">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.variant} 
                  className="w-full group"
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* What We Reject */}
        <div className="max-w-3xl mx-auto">
          <div className="p-6 rounded-xl border border-error/20 bg-error/5">
            <h3 className="font-bold text-error mb-4 flex items-center gap-2">
              <X className="w-5 h-5" />
              What We Reject (And Refund)
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {whatWeReject.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-error flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              If you're rejected during intake or removed for cheating, you get a full refund minus assessment fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
