import React from 'react';
import { Stack, Box, Typography, IconButton, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Product } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { useRouter } from 'next/router';

interface PropertyBigCardProps {
	product: Product;
	likeProductHandler: (productId: string) => void | Promise<void>;
}

const PropertyBigCard = ({ product, likeProductHandler }: PropertyBigCardProps) => {
	const device = useDeviceDetect();
	const router = useRouter();

	if (device === 'mobile') return <div>PRODUCT CARD</div>;

	const goDetail = () => router.push(`/property/detail?id=${product?._id}`);

	// Image
	const imgUrl = product?.productImages?.[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/property/defaultProperty.jpg';

	// Pricing logic (safe)
	const price = Number(product?.productPrice ?? 0);
	const discountPercent = Number(product?.productDiscount ?? 0); // agar percent bo‘lsa
	const hasDiscount = discountPercent > 0;

	// original/discounted (agar discount percent bo‘lsa)
	const originalPrice = price;
	const discountedPrice = hasDiscount ? Math.max(0, Math.round(price - (price * discountPercent) / 100)) : price;

	// Badge text
	const badgeText = hasDiscount ? `-${discountPercent}%` : product?.productRank ? 'NEW' : '';

	return (
		<Stack className="product-card" onClick={goDetail}>
			{/* IMAGE */}
			<Box className="product-card__img">
				<img src={imgUrl} alt={product?.productName ?? 'Product'} />

				{/* Badge */}
				{badgeText ? (
					<span className={`product-card__badge ${hasDiscount ? 'is-discount' : 'is-new'}`}>{badgeText}</span>
				) : null}
			</Box>

			{/* BODY */}
			<Stack className="product-card__body">
				{/* Price row */}
				<Box className="product-card__priceRow">
					<Typography className="product-card__price">
						${formatterStr(hasDiscount ? discountedPrice : originalPrice)}
					</Typography>

					{hasDiscount ? (
						<Typography className="product-card__oldPrice">${formatterStr(originalPrice)}</Typography>
					) : null}
				</Box>

				{/* Name */}
				<Typography className="product-card__name">{product?.productName ?? 'Product name'}</Typography>

				{/* Detail */}
				<Typography className="product-card__detail">{product?.productDetail ?? ''}</Typography>

				{/* CTA */}
				<Button
					className="product-card__btn"
					variant="outlined"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						// Buy now bosilganda ham detailga olib boramiz (rasmdagi kabi UX)
						goDetail();
					}}
				>
					Buy now
				</Button>

				{/* Meta (View/Like) */}
				<Box className="product-card__meta">
					<Box className="meta-item" onClick={(e) => e.stopPropagation()}>
						<RemoveRedEyeIcon fontSize="small" />
						<span>{product?.productViews ?? 0}</span>
					</Box>

					<Box className="meta-item">
						<IconButton
							className="meta-like"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								void likeProductHandler(product?._id);
							}}
						>
							{product?.meLiked?.[0]?.myFavorite ? <FavoriteIcon className="liked" /> : <FavoriteBorderIcon />}
						</IconButton>
						<span>{product?.productLikes ?? 0}</span>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default PropertyBigCard;
