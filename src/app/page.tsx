import { getCurrentSession } from "@/actions/auth";
import { getWheelOfFortuneConfiguration } from "@/actions/wheel-of-fortune-actions";
import SalesCampaignBanner from "@/components/layout/SalesCampaignBanner";
import WheelOfFortune from "@/components/layout/WheelOfFortune";
import FlashDeals from "@/components/home/FlashDeals";
import TrustBar from "@/components/home/TrustBar";
import ProductGrid from "@/components/product/ProductGrid";
import { getAllProducts } from "@/sanity/lib/client";

const Home = async () => {
    const { user } = await getCurrentSession();

    const products = await getAllProducts();

    const { randomProducts, winningIndex } = await getWheelOfFortuneConfiguration();

    return (
        <div>
          <SalesCampaignBanner />
          <TrustBar />
          <FlashDeals products={products.slice(0, 12)} />
          <WheelOfFortune
            products={randomProducts}
            winningIndex={winningIndex}
          />

          <section className='container mx-auto px-4 py-8'>
            <h2 className='text-xl sm:text-2xl font-extrabold mb-4'>Recommended for you</h2>
            <ProductGrid products={products} />
          </section>
        </div>
    );
}

export default Home;