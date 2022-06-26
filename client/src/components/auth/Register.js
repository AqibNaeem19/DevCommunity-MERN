import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { setAlert } from '../../actions/alert';

/*  connect() requires props in the component parameters 
    to call an action. We want dispatch setAlert action 
    in this component. Instead of used props.setAlert to 
    dispatch action, we can destruct the action and avoid 
    using props again and again. props.setAlert is equal to 
    setAlert and dispatch the same action with the help of 
    connect() function. */
const Register = ( {setAlert} ) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  // Destructure the object properties
  const { name, email, password, password2 } = formData;

  // Takes the name property of the form control and assign the target value
  const onFormDataChange = event => setFormData({ ...formData, [ event.target.name ]: event.target.value });

  // Form submit handler
  const onSubmit = event => {
    event.preventDefault();
    if(password !== password2){
      setAlert('passwords do not match', 'danger');
    } else {
      console.log(formData)
    }
  }

  return (
    <Fragment>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form" onSubmit={ e => onSubmit(e) } >
        <div className="form-group">
          <input type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange = { e => onFormDataChange(e) }
            required
          />
        </div>
        <div className="form-group">
          <input type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange = { e => onFormDataChange(e) }
            required
          />
          <small className="form-text"
          >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small>
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange = { e => onFormDataChange(e) }
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange = { e => onFormDataChange(e) }
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </Fragment>
  )
}

// connect() function connects a react component to a redux store.
export default connect(null, { setAlert })(Register);
