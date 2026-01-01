import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import Moment from 'react-moment';
import { BlogPost } from '../../types/board-article/board-article';

interface CommunityCardProps {
	vertical: boolean;
	blogPost: BlogPost;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, blogPost, index } = props;
	const device = useDeviceDetect();
	const articleImage = blogPost?.blogPostImage
		? `${process.env.REACT_APP_API_URL}/${blogPost?.blogPostImage}`
		: '/img/event.svg';

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	} else {
		if (vertical) {
			return (
				<Link href={`/community/detail?articleCategory=${blogPost?.blogPostCategory}&id=${blogPost?._id}`}>
					<Box component={'div'} className={'vertical-card'}>
						<div className={'community-img'} style={{ backgroundImage: `url(${articleImage})` }}>
							<div>{index + 1}</div>
						</div>
						<strong>{blogPost?.blogPostTitle}</strong>
						<span>Free Board</span>
					</Box>
				</Link>
			);
		} else {
			return (
				<>
					<Link href={`/community/detail?articleCategory=${blogPost?.blogPostCategory}&id=${blogPost?._id}`}>
						<Box component={'div'} className="horizontal-card">
							<img src={articleImage} alt="" />
							<div>
								<strong>{blogPost.blogPostTitle}</strong>
								<span>
									<Moment format="DD.MM.YY">{blogPost?.createdAt}</Moment>
								</span>
							</div>
						</Box>
					</Link>
				</>
			);
		}
	}
};

export default CommunityCard;
