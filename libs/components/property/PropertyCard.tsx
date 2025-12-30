import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Product } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyCardType {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { product, myFavorites } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = product?.productImages[0]
		? `${REACT_APP_API_URL}/${product?.productImages[0]}`
		: '/img/banner/header1.svg';

	const basePrice = Number(product?.productPrice) || 0;
	const discountValue = Number(product?.productDiscount) || 0;
	const hasDiscount = discountValue > 0;
	const isPercentDiscount = hasDiscount && discountValue <= 100;
	const discountPrice =
		hasDiscount && basePrice
			? isPercentDiscount
				? basePrice * (1 - discountValue / 100)
				: Math.max(0, discountValue)
			: basePrice;
	const priceLabel =
		hasDiscount && discountPrice > 0 && discountPrice !== basePrice
			? `$${formatterStr(Math.min(basePrice, discountPrice))} - $${formatterStr(Math.max(basePrice, discountPrice))}`
			: `$${formatterStr(basePrice)}`;

	if (device === 'mobile') {
		return <div>PODUCT CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: product?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{product && product?.productRank > 50 && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TO1111===============</Typography>
						</Box>
					)}
				</Stack>
				{/* shu yerni ozgartirish kerak */}
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/property/detail',
									query: { id: product?._id },
								}}
							>
								<Typography>{product.productName}</Typography>
							</Link>
						</Stack>
						<Stack className="price">
							<Typography className="price">{priceLabel}</Typography>{' '}
						</Stack>
					</Stack>

					<Stack className="type-buttons">
						<Stack className="type">
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={product.productName ? '' : 'disabled-type'}
							></Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
