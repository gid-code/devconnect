import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { getCurrentProfile, deleteAccount } from '../../actions/profileActions'
import Spinner from '../common/Spinner'
import { Link } from 'react-router-dom'
import ProfileActions from './ProfileActions'
import Experience from './Experience'
import Education from './Education'

class Dashboard extends Component {

  componentDidMount(){
    this.props.getCurrentProfile()
  }

  onDeleteClick(e) {
    this.props.deleteAccount();
  }

  render() {
    const { user } = this.props.auth
    const { profile, loading } = this.props.profile

    let dashboardcontent;

    if(profile === null || loading){
      dashboardcontent = <Spinner />
    }else{
      //check if logged in user has profile data
      if(Object.keys(profile).length > 0) {
        dashboardcontent = (
          <div>
            <p className="lead text-muted">Welcome <Link to={`/profile/${profile.handle}`}>{user.name}</Link></p>
            <ProfileActions />
            <Experience experience={profile.experience}/>
            <Education education={profile.education} />
            <div style={{ marginBottom: '60px' }} />
              <button
                onClick={this.onDeleteClick.bind(this)}
                className="btn btn-danger">
                Delete My Account
              </button>
          </div>
          
        )
      }else{
        //user is logged in but has no profile
        dashboardcontent = (
          <div>
            <p className="lead text-muted">Welcome {user.name}</p>
            <p>You have not setup a profile. Please add some info</p>
            <Link to='/create-profile' className="btn btn-lg btn-info">
              Create Profile
            </Link>
          </div>
        )
      }
    }
    return (
      <div className="dashboard">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4">Dashboard</h1>
              {dashboardcontent}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth
})

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard)
