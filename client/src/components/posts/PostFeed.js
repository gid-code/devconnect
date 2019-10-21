import React, { Component } from 'react'
import PropType from 'prop-types'

class PostFeed extends Component {
  render() {
    const { posts } = this.props
    return posts.map( <PostItem key={post._id} post={post} />)
  }
}

PostFeed.propType = {
  posts: PropType.array.isRequired
}

export default PostFeed
