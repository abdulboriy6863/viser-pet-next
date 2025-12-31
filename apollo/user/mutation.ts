import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberBlogPosts
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberBlogPosts
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberBlogPosts
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberBlogPosts
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *        PRODUCT        *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productCollection
			productStatus
			productName
			productDetail
			productVolume
			productPrice
			productDiscount
			productLeftCount
			productSoldCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			createdAt
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation ($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productCollection
			productStatus
			productName
			productDetail
			productPrice
			productVolume
			productDiscount
			productLeftCount
			productSoldCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			createdAt
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productCollection
			productStatus
			productName
			productDetail
			productPrice
			productDiscount
			productLeftCount
			productSoldCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			createdAt
			soldAt
			deletedAt
			updatedAt
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			memberData {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberProducts
				memberBlogPosts
				memberFollowers
				memberFollowings
				memberPoints
				memberLikes
				memberViews
				memberComments
				memberRank
				memberWarnings
				memberBlocks
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
		}
	}
`;

/**************************
 *      BLOG-POST       *
 *************************/

export const CREATE_BLOG_POST = gql`
	mutation CreateBlogPost($input: BlogPostInput!) {
		createBlogPost(input: $input) {
			_id
			blogPostCategory
			blogPostStatus
			blogPostTitle
			blogPostContent
			blogPostImage
			blogPostViews
			blogPostLikes
			blogPostComments
			blogPostRank
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BLOG_POST = gql`
	mutation UpdateBlogPost($input: BlogPostUpdate!) {
		updateBlogPost(input: $input) {
			_id
			blogPostCategory
			blogPostStatus
			blogPostTitle
			blogPostContent
			blogPostImage
			blogPostViews
			blogPostLikes
			blogPostComments
			blogPostRank
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BLOG_POST = gql`
	mutation LikeTargetBlogPost($input: String!) {
		likeTargetBlogPost(blogPostId: $input) {
			_id
			blogPostCategory
			blogPostStatus
			blogPostTitle
			blogPostContent
			blogPostImage
			blogPostViews
			blogPostLikes
			blogPostComments
			blogPostRank
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      ORDER     *
 *************************/

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			_id
			orderTotal
			orderDelivery
			orderStatus
			memberId
			createdAt
			updatedAt
			orderItems {
				_id
				itemQuantity
				itemPrice
				orderId
				productId

				createdAt
				updatedAt
			}
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder($input: OrderUpdate!) {
		updateOrder(input: $input) {
			orderTotal
			orderDelivery
			orderStatus
			memberId
			createdAt
			updatedAt
			_id
		}
	}
`;
