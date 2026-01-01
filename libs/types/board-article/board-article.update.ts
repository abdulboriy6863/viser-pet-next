import { BlogPostStatus } from '../../enums/board-article.enum';

export interface BlogPostUpdate {
	_id: string;
	blogPostStatus?: BlogPostStatus;
	blogPostTitle?: string;
	blogPostContent?: string;
	blogPostImage?: string;
}
