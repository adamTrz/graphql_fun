/** @flow*/
import React, { Component } from 'react'
import { gql, graphql, compose } from 'react-apollo'
import Modal from 'react-modal'
import modalStyle from '../constants/modalStyle'
import { withRouter } from 'react-router-dom'

import type { PostType } from '../types'

const detailModalStyle = {
  overlay: modalStyle.overlay,
  content: {
    ...modalStyle.content,
    height: 761
  }
}

type Props = {
  data: {
    loading: boolean,
    Post: PostType
  },
  history: Object,
  deletePost: (postId: string) => Promise<*>,
  updatePost: (postId: string, description: string) => Promise<*>
};

type State = {
  post: ?PostType
};

class DetailPage extends Component {
  state: State = { post: null };
  props: Props;
  componentWillReceiveProps(nextProps) {
    if (nextProps.data.Post) this.setState({ post: nextProps.data.Post })
  }

  render() {
    if (this.props.data.loading) {
      return (
        <div className='flex w-100 h-100 items-center justify-center pt7'>
          <div>
            Loading
            (from {process.env.REACT_APP_GRAPHQL_ENDPOINT})
          </div>
        </div>
      )
    }

    const { post } = this.state
    if (!post) return null
    return (
      <Modal
        isOpen
        contentLabel='Create Post'
        style={detailModalStyle}
        onRequestClose={this.props.history.goBack}
      >
        <div
          className='close fixed right-0 top-0 pointer'
          onClick={this.props.history.goBack}
        >
          <img src={require('../assets/close.svg')} alt='' />
        </div>
        <div
          className='delete ttu white pointer fw6 absolute left-0 top-0 br2'
          onClick={this.handleDelete}
        >
          Delete
        </div>
        <div
          className='bg-white detail flex flex-column no-underline br2 h-100'
        >
          <div
            className='image'
            style={{
              backgroundImage: `url(${post.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              paddingBottom: '100%'
            }}
          />
          <div className='flex items-center black-80 fw3 description'>
            <input
              type='text'
              value={post.description}
              onChange={this.editDescription}
            />

          </div>
        </div>
      </Modal>
    )
  }

  handleDelete = () => {
    this.state.post && this.props.deletePost(this.state.post.id)
  };

  editDescription = (e: SyntheticInputEvent) => {
    this.props.updatePost(this.state.post.id, e.target.value)
  };
}

const deleteMutation = gql`
  mutation deletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`

const PostQuery = gql`
  query post($id: ID!) {
    Post(id: $id) {
      id
      imageUrl
      description
    }
  }
`
const updateMutation = gql`
  mutation updatePost($id: ID!, $description: String!) {
    updatePost(id: $id, description: $description) {
    id description
  }
}
`

// export default withRouter(
//   graphql(deleteMutation)(
//     graphql(PostQuery, {
//       options: ({ match }) => ({
//         variables: {
//           id: match.params.id
//         }
//       })
//     })(DetailPage)
//   )
// )

// Otimistic Response
export default compose(
  withRouter,
  graphql(deleteMutation, {
    props: ({ ownProps, mutate }) => ({
      deletePost: postId =>
        mutate({
          variables: { id: postId }
        })
    })
  }),
  graphql(updateMutation, {
    props: ({ ownProps, mutate }) => ({
      updatePost: (postId, description) =>
        mutate({
          variables: { id: postId, description },
          optimisticResponse: {
            __typename: 'Mutation',
            updatePost: {
              id: postId,
              description,
              __typename: 'Post'
            }
          }
        })
    })
  }),
  graphql(PostQuery, {
    options: ({ match }) => ({
      variables: {
        id: match.params.id
      }
    })
  })
)(DetailPage)
