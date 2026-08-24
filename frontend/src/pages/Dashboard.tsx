import { RecommendationHero } from '../components/dashboard/RecommendationHero';
import { OpportunityScoreWidget } from '../components/dashboard/OpportunityScoreWidget';
import { MarketPulseWidget } from '../components/dashboard/MarketPulseWidget';
import { CashReserveWidget } from '../components/dashboard/CashReserveWidget';
import { TopOpportunitiesWidget } from '../components/dashboard/TopOpportunitiesWidget';
import { RecentDeploymentsWidget } from '../components/dashboard/RecentDeploymentsWidget';

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <section>
        <RecommendationHero />
      </section>

      {/* Top Row: Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OpportunityScoreWidget />
        <MarketPulseWidget />
        <CashReserveWidget />
      </section>

      {/* Bottom Row: Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopOpportunitiesWidget />
        <RecentDeploymentsWidget />
      </section>
    </div>
  );
}
