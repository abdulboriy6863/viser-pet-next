import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BlogPost, BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface CommunityCardProps {
	blogPost: BlogPost;
	size?: string;
	likeBlogPostHandler: any;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { blogPost, size = 'normal', likeBlogPostHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const imagePath: string = blogPost?.blogPostImage
		? `${REACT_APP_API_URL}/${blogPost?.blogPostImage}`
		: '/img/community/communityImg.png';

	/** HANDLERS **/
	const chooseBlogPostHandler = (e: React.SyntheticEvent, blogPost: BlogPost) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { blogPostCategory: blogPost?.blogPostCategory, id: blogPost?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	if (device === 'mobile') {
		return <div>COMMUNITY CARD MOBILE</div>;
	} else {
		return (
			<Stack
				sx={{ width: size === 'small' ? '285px' : '317px' }}
				className="community-general-card-config"
				onClick={(e: any) => chooseBlogPostHandler(e, blogPost)}
			>
				<Stack className="image-box">
					<img src={imagePath} alt="" className="card-img" />
				</Stack>
				<Stack className="desc-box" sx={{ marginTop: '-20px' }}>
					<Stack>
						<Typography
							className="desc"
							onClick={(e: any) => {
								e.stopPropagation();
								goMemberPage(blogPost?.memberData?._id as string);
							}}
						>
							{blogPost?.memberData?.memberNick}
						</Typography>
						<Typography className="title">{blogPost?.blogPostTitle}</Typography>
					</Stack>
					<Stack className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{blogPost?.blogPostViews}</Typography>
						<IconButton color={'default'}>
							{blogPost?.meLiked && blogPost?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{blogPost?.blogPostLikes}</Typography>
					</Stack>
				</Stack>
				<Stack className="date-box">
					<Moment className="month" format={'MMMM'}>
						{blogPost?.createdAt}
					</Moment>
					<Typography className="day">
						<Moment format={'DD'}>{blogPost?.createdAt}</Moment>
					</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityCard;
