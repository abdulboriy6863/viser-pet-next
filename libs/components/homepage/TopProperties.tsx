import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopPropertyCard from './TopPropertyCard';
import { ProductsInquiry, PropertiesInquiry } from '../../types/property/property.input';
import { Product } from '../../types/property/property';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PRODUCT, LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface TopPropertiesProps {
	initialInput: ProductsInquiry;
}

const TopProperties = (props: TopPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topProducts, setTopProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopProducts(data?.getProducts?.list);
		},
	});
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

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box top-agents__info'}>
						<Box component={'div'} className={'top-agents__heading'}>
							<span>Top Products</span>
							<p>Check out our Top Products</p>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={18}
							modules={[Autoplay]}
							autoplay={{
								delay: 3200,
								disableOnInteraction: false,
							}}
						>
							{topProducts.map((product: Product) => {
								return (
									<SwiperSlide className={'top-agents-slide'} key={product?._id}>
										<TopPropertyCard product={product} likeProductHandler={likeProductHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-agents top-properties'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'top-agents__halo top-agents__halo--left'} />
					<Box component={'div'} className={'top-agents__halo top-agents__halo--right'} />
					<Stack className={'info-box top-agents__info'}>
						<Box component={'div'} className={'top-agents__head'}>
							<Box component={'div'} className={'left'}>
								<span>Top Products</span>
								<p>Check out our Top Products</p>
							</Box>
							<Box component={'div'} className={'right'} />
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={24}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
								autoplay={{
									delay: 3600,
									disableOnInteraction: false,
								}}
							>
								{topProducts.map((product: Product) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={product?._id}>
											<TopPropertyCard product={product} likeProductHandler={likeProductHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'productSoldCount',
		direction: 'DESC',
		search: {},
	},
};

export default TopProperties;
