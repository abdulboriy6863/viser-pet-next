import React, { useEffect, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import { Product } from '../../types/property/property';
import { ProductInquiry } from '../../types/property/property.input';
import TrendPropertyCard from './TrendPropertyCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TrendProductsProps {
	initialInput: ProductInquiry;
}

const TrendProducts = (props: TrendProductsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [trendProducts, setTrendProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		data: getPropertiesData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getPropertiesData?.getProducts?.list) {
			setTrendProducts(getPropertiesData.getProducts.list);
		}
	}, [getPropertiesData]);

	/** HANDLERS **/
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			//execute like target Product mutation
			await likeTargetProduct({
				variables: { input: id },
			});
			await getProductsRefetch({ input: initialInput });
			//execute get product refetch
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likeProductHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const slidesPerView = device === 'mobile' ? 1.1 : 4;
	const spaceBetween = device === 'mobile' ? 16 : 26;
	const isError = !!getProductsError;
	const isLoading = !getPropertiesData && trendProducts.length === 0 && !isError;

	return (
		<Stack className={'trend-products'}>
			<Stack className={'container'}>
				<Stack className={'trend-products__heading'}>
					<img src="/img/icons/ellipse7.svg" alt="Trending icon" className={'trend-products__bone'} />
					<Box component={'div'} className={'trend-products__divider'}>
						<span className={'trend-products__line'} />
						<h2>Trending Products</h2>
						<span className={'trend-products__line'} />
					</Box>
				</Stack>
				{isError ? (
					<Box component={'div'} className={'empty-list'}>
						Unable to load trending products
					</Box>
				) : isLoading ? (
					<Box component={'div'} className={'empty-list'}>
						Loading...
					</Box>
				) : trendProducts.length === 0 ? (
					<Box component={'div'} className={'empty-list'}>
						Trends Empty
					</Box>
				) : (
					<Box component={'div'} className={'trend-products__slider'}>
						<Box component={'div'} className={'trend-products__prev swiper-trend-prev'}>
							<WestIcon fontSize={'small'} />
						</Box>
						<Swiper
							className={'trend-products__swiper'}
							slidesPerView={slidesPerView}
							spaceBetween={spaceBetween}
							centeredSlides={device === 'mobile'}
							modules={[Autoplay, Navigation]}
							navigation={{
								nextEl: '.swiper-trend-next',
								prevEl: '.swiper-trend-prev',
							}}
							breakpoints={{
								640: {
									slidesPerView: 2.2,
									spaceBetween: 18,
								},
								960: {
									slidesPerView: 3.2,
									spaceBetween: 22,
									centeredSlides: false,
								},
								1200: {
									slidesPerView: 4,
									spaceBetween: 26,
									centeredSlides: false,
								},
							}}
							autoplay={{
								delay: 4000,
								disableOnInteraction: false,
							}}
						>
							{trendProducts.map((product: Product) => {
								return (
									<SwiperSlide key={product._id} className={'trend-products__slide'}>
										<TrendPropertyCard product={product} likeProductHandler={likeProductHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
						<Box component={'div'} className={'trend-products__next swiper-trend-next'}>
							<EastIcon fontSize={'small'} />
						</Box>
					</Box>
				)}
			</Stack>
		</Stack>
	);
};

TrendProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'productLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendProducts;
