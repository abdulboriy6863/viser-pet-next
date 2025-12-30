import { BlogPostStatus, BoardArticleStatus } from '../../enums/board-article.enum';

export interface BoardArticleUpdate {
	_id: string;
	blogPostStatus?: BlogPostStatus;
	blogPostTitle?: string;
	blogPostContent?: string;
	blogPostImage?: string;
}

export interface BlogPostUpdate {
	_id: string;
	blogPostStatus?: BlogPostStatus;
	blogPostTitle?: string;
	blogPostContent?: string;
	blogPostImage?: string;
}
