import type { MarketListing, PriceStats } from '@/features/market/services/ebay';
import type { MarketValueResult } from '@/features/market/services/perplexity';
import type { PlatformLink } from '@/features/market/services/quicklinks';
import { PlatformQuicklinks } from '@/features/market/components/PlatformQuicklinks';
import { MarketSlider } from '@/features/market/components/MarketSlider';
import { ProductFactsCard } from '@/features/market/components/ProductFactsCard';
import { FadeInView } from '@/shared/components/Animated';
import type { HistoryItem } from '@/features/history/store/types';

interface HistoryDetailMarketSectionProps {
  links: PlatformLink[];
  item?: HistoryItem;
  marketValue: MarketValueResult | null;
  marketValueLoading: boolean;
  onRefreshMarketValue: () => void;
  ebayPriceStats: PriceStats | null;
  ebayListings: MarketListing[];
  ebayLoading: boolean;
  onRefreshEbay: () => void;
  finalPrice?: number;
  onPricePress: () => void;
}

export function HistoryDetailMarketSection({
  links,
  item,
  marketValue,
  marketValueLoading,
  onRefreshMarketValue,
  ebayPriceStats,
  ebayListings,
  ebayLoading,
  onRefreshEbay,
  finalPrice,
  onPricePress,
}: HistoryDetailMarketSectionProps) {
  return (
    <>
      <FadeInView delay={75} className="mb-4">
        <MarketSlider
          marketValue={marketValue}
          marketValueLoading={marketValueLoading}
          onRefreshMarketValue={onRefreshMarketValue}
          ebayPriceStats={ebayPriceStats}
          ebayListings={ebayListings}
          ebayLoading={ebayLoading}
          onRefreshEbay={onRefreshEbay}
          finalPrice={finalPrice}
          onPricePress={onPricePress}
        />
        {marketValue?.facts && marketValue.facts.length > 0 && (
          <ProductFactsCard facts={marketValue.facts} />
        )}
      </FadeInView>

      <FadeInView delay={125}>
        <PlatformQuicklinks links={links} item={item} />
      </FadeInView>
    </>
  );
}
