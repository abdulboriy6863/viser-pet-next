import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab, Typography, Button, Pagination } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BlogPost } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BlogPostsInquiry } from '../../libs/types/board-article/board-article.input';
import { BlogPostCategory } from '../../libs/enums/board-article.enum';
import { LIKE_TARGET_BLOG_POST } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_BLOG_POSTS } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const defaultCategory =
		(articleCategory as BlogPostCategory) || initialInput.search.blogPostCategory || BlogPostCategory.FREE;
	const [searchCommunity, setSearchCommunity] = useState<BlogPostsInquiry>({
		...initialInput,
		search: {
			...initialInput.search,
			blogPostCategory: defaultCategory,
		},
	});
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBlogPost] = useMutation(LIKE_TARGET_BLOG_POST);

	const {
		loading: getBlogPostsLoading,
		data: getBlogPostsData,
		error: getBlogPostsError,
		refetch: getBlogPostsRefetch,
	} = useQuery(GET_BLOG_POSTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBlogPosts(data?.getBlogPosts?.list);
			setTotalCount(data?.getBlogPosts?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: searchCommunity.search.blogPostCategory },
				},
				router.pathname,
				{ shallow: true },
			);
	}, [query?.articleCategory, router, searchCommunity.search.blogPostCategory]);

	useEffect(() => {
		if (articleCategory && articleCategory !== searchCommunity.search.blogPostCategory) {
			setSearchCommunity((prev) => ({
				...prev,
				page: 1,
				search: { ...prev.search, blogPostCategory: articleCategory as BlogPostCategory },
			}));
		}
	}, [articleCategory]);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchCommunity({ ...searchCommunity, page: 1, search: { blogPostCategory: value as BlogPostCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBlogPostHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBlogPost({
				variables: {
					input: id,
				},
			});
			await getBlogPostsRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<div id="community-list-page">
				<div className="container">
					<Stack className="community-hero">
						<div className="hero-copy">
							<span className="eyebrow">Community</span>
							<Typography className="hero-title">Explore & share stories</Typography>
							<Typography className="hero-desc">
								Read fresh blog posts, recommendations, and news from our pet-loving community.
							</Typography>
						</div>
						<div className="hero-stats">
							<div className="hero-chip">
								<span className="hero-chip__label">Total posts</span>
								<span className="hero-chip__value">{totalCount || 0}</span>
							</div>
							<div className="hero-chip">
								<span className="hero-chip__label">Active category</span>
								<span className="hero-chip__value">{searchCommunity.search.blogPostCategory}</span>
							</div>
						</div>
					</Stack>

					<TabContext value={searchCommunity.search.blogPostCategory}>
						<Stack className="community-layout">
							{/* LEFT SIDEBAR */}
							<Stack className="community-sidebar">
								<Typography className="sidebar-title">Category</Typography>

								<TabList
									orientation="vertical"
									aria-label="community categories"
									TabIndicatorProps={{ style: { display: 'none' } }}
									onChange={tabChangeHandler}
									className="sidebar-tabs"
								>
									<Tab
										value={'FREE'}
										label={'Free Board'}
										className={`sidebar-tab ${searchCommunity.search.blogPostCategory === 'FREE' ? 'active' : ''}`}
									/>
									<Tab
										value={'RECOMMEND'}
										label={'Recommendation'}
										className={`sidebar-tab ${searchCommunity.search.blogPostCategory === 'RECOMMEND' ? 'active' : ''}`}
									/>
									<Tab
										value={'NEWS'}
										label={'News'}
										className={`sidebar-tab ${searchCommunity.search.blogPostCategory === 'NEWS' ? 'active' : ''}`}
									/>
								</TabList>
							</Stack>

							{/* RIGHT CONTENT */}
							<Stack className="community-content">
								<Stack className="content-head">
									<Stack className="head-left">
										<Typography className="head-title">Community</Typography>
										<Typography className="head-sub">
											Latest posts from {searchCommunity.search.blogPostCategory} category
										</Typography>
									</Stack>

									<Button
										onClick={() =>
											router.push({
												pathname: '/mypage',
												query: { category: 'writeArticle' },
											})
										}
										className="head-write"
									>
										Write
									</Button>
								</Stack>

								{/* PANELS (sizdagi 4 ta paneldan HUMOR olib tashlandi) */}
								<TabPanel value="FREE" className="panel">
									<Stack className="post-list">
										{totalCount ? (
											blogPosts?.map((blogPost: BlogPost) => (
												<CommunityCard
													blogPost={blogPost}
													key={blogPost?._id}
													likeBlogPostHandler={likeBlogPostHandler}
												/>
											))
										) : (
											<Stack className="no-data">
												<img src="/img/icons/icoAlert.svg" alt="" />
												<p>No Article found!</p>
											</Stack>
										)}
									</Stack>
								</TabPanel>

								<TabPanel value="RECOMMEND" className="panel">
									<Stack className="post-list">
										{totalCount ? (
											blogPosts?.map((blogPost: BlogPost) => (
												<CommunityCard
													blogPost={blogPost}
													key={blogPost?._id}
													likeBlogPostHandler={likeBlogPostHandler}
												/>
											))
										) : (
											<Stack className="no-data">
												<img src="/img/icons/icoAlert.svg" alt="" />
												<p>No Article found!</p>
											</Stack>
										)}
									</Stack>
								</TabPanel>

								<TabPanel value="NEWS" className="panel">
									<Stack className="post-list">
										{totalCount ? (
											blogPosts?.map((blogPost: BlogPost) => (
												<CommunityCard
													blogPost={blogPost}
													key={blogPost?._id}
													likeBlogPostHandler={likeBlogPostHandler}
												/>
											))
										) : (
											<Stack className="no-data">
												<img src="/img/icons/icoAlert.svg" alt="" />
												<p>No Article found!</p>
											</Stack>
										)}
									</Stack>
								</TabPanel>
							</Stack>
						</Stack>
					</TabContext>

					{totalCount > 0 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									Total {totalCount} article{totalCount > 1 ? 's' : ''} available
								</Typography>
							</Stack>
						</Stack>
					)}
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			blogPostCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
