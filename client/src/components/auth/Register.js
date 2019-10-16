import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { registerUser } from '../../actions/authActions'
import TextFieldGroup from '../common/TextFieldGroup'

class Register extends Component {
  constructor(){
    super()
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard')
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      })
    }
  }

  onChange(e){
    this.setState({ [e.target.name]: e.target.value })
  }

  onSubmit(e){
    e.preventDefault()

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    }

    this.props.registerUser(newUser, this.props.history)
  }

  render() {
    const { errors } = this.state

    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">Create your DevZone account</p>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  error = {errors.name}
                  placeholder = "Name"
                  value = {this.state.name}
                  onChange = {
                    this.onChange
                  }
                  name = "name"
                  />
                <TextFieldGroup 
                  type="email"
                  error = {errors.email}
                  placeholder = "Email Address"
                  value = {this.state.email}
                  onChange = {
                    this.onChange
                  }
                  name = "email"
                  info = "This site uses Gravatar so if you want a profile image, use a Gravatar email"
                  />
                
                <TextFieldGroup 
                  type="password"
                  error = {errors.password}
                  placeholder = "Password"
                  value = {this.state.password}
                  onChange = {
                    this.onChange
                  }
                  name = "password"
                  />
                
                <TextFieldGroup 
                  type="password"
                  error = {errors.password2}
                  placeholder = "Confirm Password"
                  value = {this.state.password2}
                  onChange = {
                    this.onChange
                  }
                  name = "password2"
                  />
                
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
}

const mapStoreToProps = (state) => ({
  auth: state.auth,
  errors: state.errors
})

export default connect(mapStoreToProps, { registerUser })(withRouter(Register))
