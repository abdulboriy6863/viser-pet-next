import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Product } from '../../types/property/property';
import { ProductInquiry } from '../../types/property/property.input';
import NewProductCard from './NewProductCard';

interface NewProductProps {
	initialInput: ProductInquiry;
}

const NewProduct = (props: NewProductProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [products, setProducts] = useState<Product[]>([]);

	const { data: getProductsData, error: getProductsError } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getProductsData?.getProducts?.list) {
			setProducts(getProductsData.getProducts.list);
		}
	}, [getProductsData]);

	const isError = !!getProductsError;
	const isLoading = !getProductsData && products.length === 0 && !isError;
	const visibleProducts = useMemo(() => products.slice(0, 5), [products]);

	return (
		<Stack className={'new-products'}>
			<Stack className={'container'}>
				<Stack className={'new-products__heading'}>
					<img src="/img/icons/ellipse7.svg" alt="New arrivals" className={'new-products__bone'} />
					<Box component={'div'} className={'new-products__divider'}>
						<span className={'new-products__line new-products__line--wide'} />
						<h2>New Arrivals</h2>
						<span className={'new-products__line new-products__line--wide'} />
					</Box>
				</Stack>

				{isError ? (
					<Box component={'div'} className={'empty-list'}>
						Unable to load new arrivals
					</Box>
				) : isLoading ? (
					<Box component={'div'} className={'empty-list'}>
						Loading...
					</Box>
				) : visibleProducts.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						No new arrivals yet
					</Box>
				) : (
					<Box className={'new-products__list'}>
						{visibleProducts.map((product) => (
							<NewProductCard key={product._id} product={product} />
						))}
					</Box>
				)}

				<Box className={'new-products__promos'}>
					<div className="new-products__promo new-products__promo--left">
						<video
							className="new-products__promo-video"
							src="/img/newProduct/video-from-rawpixel-id-17991389-sd.mp4"
							autoPlay
							loop
							muted
							playsInline
						/>
						<div className="new-products__promo-overlay">
							<div className="new-products__promo-tag">Up to 90% OFF</div>
							<div className="new-products__promo-title">Clearance Sale</div>
							<p>Stock up before you miss out!</p>
							<button>Shop Now</button>
						</div>
					</div>
					<div className="new-products__promo-grid">
						<div className="new-products__promo-card new-products__promo-card--purple">
							<video
								className="new-products__promo-video"
								src="/img/newProduct/video-from-rawpixel-id-17187071-sd.mp4"
								autoPlay
								loop
								muted
								playsInline
							/>
							<div className="new-products__promo-overlay">
								<div className="new-products__promo-label">Black Friday</div>
								<div className="new-products__promo-sub">Get 10% OFF</div>
								<button>Shop Now</button>
							</div>
						</div>
						<div className="new-products__promo-card new-products__promo-card--peach">
							<video
								className="new-products__promo-video"
								src="/img/newProduct/video-from-rawpixel-id-19551845-sd.mp4"
								autoPlay
								loop
								muted
								playsInline
							/>
							<div className="new-products__promo-overlay">
								<div className="new-products__promo-label">Get 10% OFF</div>
								<div className="new-products__promo-sub">To brighten a loved one&apos;s day.</div>
								<button>Shop Now</button>
							</div>
						</div>
					</div>
				</Box>
			</Stack>
		</Stack>
	);
};

NewProduct.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default NewProduct;
