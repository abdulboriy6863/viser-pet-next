import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import { BlogPost } from '../../types/board-article/board-article';
import { useQuery } from '@apollo/client';
import { GET_BLOG_POSTS } from '../../../apollo/user/query';
import { BlogPostCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'blogPostViews',
		direction: 'DESC',
	});
	const [newsPosts, setNewsPosts] = useState<BlogPost[]>([]);
	const [totalPages, setTotalPages] = useState(1);

	/** APOLLO REQUESTS **/
	const {
		loading: getNewPostsLoading,
		data: getNewPostsData,
		error: getNewPostsError,
		refetch: getNewPostsRefetch,
	} = useQuery(GET_BLOG_POSTS, {
		fetchPolicy: 'network-only',
		variables: { input: { ...searchCommunity, limit: 3, search: { blogPostCategory: BlogPostCategory.NEWS } } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNewsPosts(data?.getBlogPosts?.list || []);
			const total = data?.getBlogPosts?.metaCounter?.[0]?.total || data?.getBlogPosts?.list?.length || 0;
			setTotalPages(Math.max(1, Math.ceil(total / 3)));
		},
	});

	const latestNews = newsPosts.slice(0, 3);
	const skeletons = Array.from({ length: Math.max(3 - latestNews.length, 0) });
	const badgeColors = ['#DCEBC5', '#D7EEF5', '#F5E1BE'];
	const fallbackImage = '/img/event.svg';

	const formatDay = (dateString?: string | Date) => {
		if (!dateString) return '--';
		const date = new Date(dateString);
		return Number.isNaN(date.getTime()) ? '--' : date.getDate();
	};

	const formatMonth = (dateString?: string | Date) => {
		if (!dateString) return '--';
		const date = new Date(dateString);
		return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString('en-US', { month: 'short' });
	};

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	}

	const goToPage = (page: number) => {
		const nextPage = Math.min(Math.max(page, 1), totalPages);
		setSearchCommunity((prev) => ({ ...prev, page: nextPage }));
		getNewPostsRefetch({
			input: { ...searchCommunity, page: nextPage, limit: 3, search: { blogPostCategory: BlogPostCategory.NEWS } },
		});
	};

	useEffect(() => {
		// keep query in sync when page changes via state updates
		getNewPostsRefetch({
			input: { ...searchCommunity, limit: 3, search: { blogPostCategory: BlogPostCategory.NEWS } },
		});
	}, [searchCommunity.page]);

	return (
		<Stack className={'community-board'}>
			<Stack className={'container'}>
				<div className="latest-news">
					<div className="latest-news__bone">
						<img src="/img/featuresProduct/Icon.png" alt="New arrivals" />
					</div>
					<div className="latest-news__heading">
						<span className="latest-news__line" />

						<div className="latest-news__title">Latest News Post</div>
						<span className="latest-news__line" />
					</div>

					<div className="latest-news__grid">
						{latestNews.map((blogPost, idx) => {
							const image = blogPost?.blogPostImage
								? `${process.env.REACT_APP_API_URL}/${blogPost.blogPostImage}`
								: fallbackImage;
							const badgeColor = badgeColors[idx % badgeColors.length];
							return (
								<Link
									href={`/community/detail?articleCategory=${blogPost?.blogPostCategory}&id=${blogPost?._id}`}
									key={blogPost?._id}
									className="latest-news__card"
								>
									<div className="latest-news__image" style={{ backgroundImage: `url(${image})` }} />
									<div className="latest-news__badge" style={{ backgroundColor: badgeColor }}>
										<span className="latest-news__day">{formatDay(blogPost?.createdAt)}</span>
										<span className="latest-news__month">{formatMonth(blogPost?.createdAt)}</span>
									</div>
									<div className="latest-news__text">{blogPost?.blogPostTitle}</div>
								</Link>
							);
						})}

						{skeletons.map((_, idx) => (
							<div className="latest-news__card is-skeleton" key={`skeleton-${idx}`}>
								<div className="latest-news__image" />
								<div className="latest-news__badge">
									<span className="latest-news__day">--</span>
									<span className="latest-news__month">---</span>
								</div>
								<div className="latest-news__text">Coming soon</div>
							</div>
						))}
					</div>

					<div className="latest-news__pagination">
						<button
							type="button"
							className="latest-news__page-btn"
							onClick={() => goToPage(searchCommunity.page - 1)}
							disabled={searchCommunity.page <= 1}
							aria-label="Previous page"
						>
							←
						</button>
						<div className="latest-news__page-info">
							<span className="latest-news__page-current">{searchCommunity.page}</span>
							<span className="latest-news__page-total">/ {totalPages}</span>
						</div>
						<button
							type="button"
							className="latest-news__page-btn"
							onClick={() => goToPage(searchCommunity.page + 1)}
							disabled={searchCommunity.page >= totalPages}
							aria-label="Next page"
						>
							→
						</button>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default CommunityBoards;
