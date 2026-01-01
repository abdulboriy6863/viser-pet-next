import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BlogPost } from '../../types/board-article/board-article';
import { BlogPostsInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BLOG_POST } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { GET_BLOG_POSTS } from 'apollo/user/query';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BlogPostsInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BlogPost[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetBlogPost] = useMutation(LIKE_TARGET_BLOG_POST);

	const {
		loading: boardAriclesLoading,
		data: boardAriclesData,
		error: boardAriclesError,
		refetch: boardAriclesRefetch,
	} = useQuery(GET_BLOG_POSTS, {
		fetchPolicy: 'network-only',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberBoArticles(data?.getBlogPosts?.list);
			setTotal(data?.getBlogPosts?.metaCounter[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
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
			await boardAriclesRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('Success', 750);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	} else {
		return (
			<div id="member-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Articles</Typography>
					</Stack>
				</Stack>
				<Stack className="articles-list-box">
					{memberBoArticles?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
					{memberBoArticles?.map((blogPost: BlogPost) => {
							return (
								<CommunityCard
									blogPost={blogPost}
									likeBlogPostHandler={likeBlogPostHandler}
									key={blogPost?._id}
									// size={'small'}
								/>
							);
					})}
				</Stack>
				{memberBoArticles?.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit) || 1}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} product available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
