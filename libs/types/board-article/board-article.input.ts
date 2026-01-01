import { BlogPostCategory, BlogPostStatus } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';

//////////////////////////////
export interface BlogPostInputInput {
	blogPostCategory: BlogPostCategory;
	blogPostTitle: string;
	blogPostContent: string;
	blogPostImage: string;
	memberId?: string;
}

interface BAISearch {
	blogPostCategory: BlogPostCategory;
	text?: string;
}

export interface BlogPostsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: BAISearch;
}

interface ABAISearch {
	blogPostStatus?: BlogPostStatus;
	blogPostCategory?: BlogPostCategory;
}

export interface AllBlogPostsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ABAISearch;
}
