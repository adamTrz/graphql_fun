/* @flow */

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { gql, graphql } from 'react-apollo'

import type { PostType } from '../types'

type Props = {
  post: PostType,
  mutate: (*) => Promise<*>,
  history: Object,
};

class Post extends Component {
  props: Props;
  render() {
    return (
      <div>
        <span className='red f6 pointer dim' onClick={this.handleDelete}>
          Delete
        </span>
        <Link
          className='bg-white ma3 box post flex flex-column no-underline br2'
          to={`/post/${this.props.post.id}`}
        >
          <div
            className='image'
            style={{
              backgroundImage: `url(${this.props.post.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              paddingBottom: '100%',
            }}
          />
          <div className='flex items-center black-80 fw3 description'>
            {this.props.post.description}
          </div>
        </Link>
      </div>
    )
  }

  // not currently used.
  handleDelete = async () => {
    await this.props.mutate({ variables: { id: this.props.post.id } })
    this.props.history.replace('/')
  };
}

const deleteMutation = gql`
  mutation deletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`

const PostWithMutation = graphql(deleteMutation)(Post)

export default PostWithMutation
