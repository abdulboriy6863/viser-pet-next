import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, MenuItem } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { AllBlogPostsInquiry } from '../../../libs/types/board-article/board-article.input';
import { BlogPost } from '../../../libs/types/board-article/board-article';
import { BlogPostCategory, BlogPostStatus } from '../../../libs/enums/board-article.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { BlogPostUpdate } from '../../../libs/types/board-article/board-article.update';
import {
	REMOVE_BLOG_POST_BY_ADMIN,
	UPDATE_BLOG_POST_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_BLOG_POSTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminCommunity: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<any>([]);
	const [communityInquiry, setCommunityInquiry] = useState<AllBlogPostsInquiry>(initialInquiry);
	const [blogPost, setBlogPost] = useState<BlogPost[]>([]);
	const [blogPostTotal, setBlogPostTotal] = useState<number>(0);
	const [value, setValue] = useState(
		communityInquiry?.search?.blogPostStatus ? communityInquiry?.search?.blogPostStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateBlogPostByAdmin] = useMutation(UPDATE_BLOG_POST_BY_ADMIN);
	const [removeBlogPostByAdmin] = useMutation(REMOVE_BLOG_POST_BY_ADMIN);

	const {
		loading: getAllBlogPostsByAdminLoading,
		data: getAllBlogPostsByAdminData,
		error: getAllBlogPostsByAdminError,
		refetch: getAllBlogPostsByAdminRefetch,
	} = useQuery(GET_ALL_BLOG_POSTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: communityInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBlogPost(data?.getAllBlogPostsByAdmin?.list);
			setBlogPostTotal(data?.getAllBlogPostsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getAllBlogPostsByAdminRefetch({ input: communityInquiry }).then();
	}, [communityInquiry]);

	/** HANDLERS **/
	const changePageHandler = (event: unknown, newPage: number) => {
		const updatedInquiry = { ...communityInquiry, page: newPage + 1 };
		setCommunityInquiry(updatedInquiry);
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const updatedInquiry = {
			...communityInquiry,
			limit: parseInt(event.target.value, 10),
			page: 1,
		};
		setCommunityInquiry(updatedInquiry);
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = (event: any, newValue: string) => {
		setValue(newValue);

		const updatedSearch = { ...communityInquiry.search };

		switch (newValue) {
			case 'ACTIVE':
				updatedSearch.blogPostStatus = BlogPostStatus.ACTIVE;
				break;
			case 'DELETE':
				updatedSearch.blogPostStatus = BlogPostStatus.DELETE;
				break;
			default:
				delete updatedSearch.blogPostStatus;
				break;
		}

		setCommunityInquiry({ ...communityInquiry, page: 1, sort: 'createdAt', search: updatedSearch });
	};

	const searchTypeHandler = (newValue: string) => {
		try {
			setSearchType(newValue);

			const updatedSearch = { ...communityInquiry.search };

			if (newValue !== 'ALL') {
				updatedSearch.blogPostCategory = newValue as BlogPostCategory;
			} else {
				delete updatedSearch.blogPostCategory;
			}

			setCommunityInquiry({
				...communityInquiry,
				page: 1,
				sort: 'createdAt',
				search: updatedSearch,
			});
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateArticleHandler = async (updateData: BlogPostUpdate) => {
		try {
			console.log('+updateData: ', updateData);
			await updateBlogPostByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllBlogPostsByAdminRefetch({ input: communityInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeBlogPostByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllBlogPostsByAdminRefetch({ input: communityInquiry });
			}
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	console.log('+communityInquiry', communityInquiry);
	console.log('+articles', blogPost);

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Arricle List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(BlogPostCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchTypeHandler(category)} key={category}>
											{category}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<CommunityArticleList
							blogPosts={blogPost}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateBlogPostHandler={updateArticleHandler}
							removeBlogPostHandler={removeArticleHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={blogPostTotal}
							rowsPerPage={communityInquiry?.limit}
							page={communityInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminCommunity.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminCommunity);
