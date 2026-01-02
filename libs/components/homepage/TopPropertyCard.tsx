import React from 'react';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
// import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/property/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface TrendPropertyCardProps {
	product: Product;
	likeProductHandler: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const { product, likeProductHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const mainImage =
		(product?.productImages && product.productImages[0] && `${REACT_APP_API_URL}/${product.productImages[0]}`) ||
		'/img/event.svg';
	const hasDiscount = Boolean(product?.productDiscount);
	const discountValue = Number(product?.productDiscount) || 0;
	const price = Number(product?.productPrice) || 0;
	const discountedPrice = hasDiscount ? Math.max(0, price - price * (discountValue / 100)) : price;
	const liked = Boolean(product?.meLiked && product.meLiked[0]?.myFavorite);

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/property/detail', query: { id: productId } });
	};

	return (
		<div className="top-card" key={product._id}>
			<div
				className="top-card__image"
				style={{ backgroundImage: `url(${mainImage})` }}
				onClick={() => pushDetailHandler(product._id)}
				role="button"
			>
				{hasDiscount && <span className="top-card__discount">-{discountValue}%</span>}
			</div>

			<div className="top-card__body">
				<div className="top-card__title" onClick={() => pushDetailHandler(product._id)} role="button" tabIndex={0}>
					{product.productName}
				</div>

				<div className="top-card__price">
					{hasDiscount && <span className="top-card__price-old">${price.toFixed(2)}</span>}
					<span className="top-card__price-new">${discountedPrice.toFixed(2)}</span>
				</div>

				<div className="top-card__meta">
					<span>Sold: {product?.productSoldCount ?? 0}</span>
					<span>Views: {product?.productViews ?? 0}</span>
				</div>

				<div className="top-card__footer">
					<div className="top-card__views">
						<RemoveRedEyeIcon />
						<span>{product?.productViews ?? 0}</span>

						<button
							type="button"
							className={`top-card__like ${liked ? 'is-active' : ''}`}
							onClick={(e) => {
								e.stopPropagation();
								likeProductHandler(user, product?._id);
							}}
							aria-label="Favorite product"
						>
							<ThumbUpIcon />
						</button>
					</div>

					<button
						type="button"
						className="top-card__cta"
						onClick={() => pushDetailHandler(product._id)}
						aria-label="View details"
					>
						View
					</button>
				</div>
			</div>
		</div>
	);
};

export default TrendPropertyCard;
