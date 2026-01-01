import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography, IconButton } from '@mui/material';
import { BlogPost } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
	blogPost: BlogPost;
	likeBlogPostHandler?: (e: React.MouseEvent, user: any, id: string) => void;
}

const DEFAULT_IMG = '/img/community/communityImg.png';

const normalizeImage = (raw: any): string | null => {
	if (!raw) return null;

	// 1) array bo‘lsa birinchi rasm
	if (Array.isArray(raw)) {
		const first = raw.find((x) => x && String(x).trim());
		return first ? normalizeImage(first) : null;
	}

	// 2) string normalize
	const s = String(raw).trim();
	if (!s) return null;

	// 3) full url (http/https yoki //)
	if (/^(https?:)?\/\//i.test(s)) return s;

	// 4) /uploads/... kabi absolute path
	if (s.startsWith('/')) return `${REACT_APP_API_URL}${s}`;

	// 5) filename/path
	return `${REACT_APP_API_URL}/${s}`;
};

const getBestBlogPostImage = (blogPost: any): string => {
	// Sizning backendingiz rasmni qaysi field’da yuborishini aniq bilmaganim uchun
	// ko‘p uchraydigan variantlarni tekshiraman.
	// Qaysi biri mavjud bo‘lsa, o‘shani oladi.
	const candidate =
		blogPost?.blogPostImage ??
		blogPost?.blogPostImages ??
		blogPost?.images ??
		blogPost?.thumbnail ??
		blogPost?.thumb ??
		blogPost?.coverImage ??
		blogPost?.cover;

	return normalizeImage(candidate) || DEFAULT_IMG;
};

const CommunityCard = (props: CommunityCardProps) => {
	const { blogPost, likeBlogPostHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const imagePath = getBestBlogPostImage(blogPost);

	const chooseBlogPostHandler = (e: React.SyntheticEvent) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { blogPostCategory: blogPost?.blogPostCategory, id: blogPost?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const likeHandler = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		likeBlogPostHandler?.(e, user, blogPost?._id);
	};

	if (device === 'mobile') return <div>COMMUNITY CARD MOBILE</div>;

	return (
		<Stack className="community-post-card" onClick={chooseBlogPostHandler}>
			{/* IMAGE */}
			<Stack className="post-media">
				<img
					src={imagePath}
					alt=""
					onError={(e) => {
						(e.currentTarget as HTMLImageElement).src = DEFAULT_IMG;
					}}
				/>
			</Stack>

			{/* CONTENT */}
			<Stack className="post-body">
				<Typography className="post-title">{blogPost?.blogPostTitle}</Typography>

				<Stack className="post-meta">
					<Typography className="post-by">
						By <span className="author">{blogPost?.memberData?.memberNick}</span>
					</Typography>

					<span className="dot">•</span>

					<Typography className="post-date">
						<Moment format={'D MMM, YYYY'}>{blogPost?.createdAt}</Moment>
					</Typography>
				</Stack>

				<Typography className="post-excerpt">
					{blogPost?.blogPostContent
						? String(blogPost.blogPostContent)
								.replace(/<[^>]*>?/gm, '')
								.slice(0, 150) + '...'
						: '...'}
				</Typography>

				<Stack className="post-footer">
					<Stack className="post-actions">
						<IconButton className="action-btn" onClick={likeHandler}>
							{blogPost?.meLiked && blogPost?.meLiked[0]?.myFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</IconButton>
						<Typography className="like-count">{blogPost?.blogPostLikes ?? 0}</Typography>
					</Stack>

					<Typography className="continue">
						Continue Reading <span className="arrow">›</span>
					</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CommunityCard;
