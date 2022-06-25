import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({ 
    email: '',
    password: '',
  });

  // Destructure the object properties
  const {  email, password } = formData;

  // Takes the name property of the form control and assign the target value
  const onFormDataChange = event => setFormData({ ...formData, [ event.target.name ]: event.target.value });

  // Form submit handler
  const onSubmit = event => {
    event.preventDefault();
   console.log('Success');
  }

  return (
    <Fragment>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead"><i className="fas fa-user"></i> SignIn Your Account</p>
      <form className="form" onSubmit={ e => onSubmit(e) } >
        
        <div className="form-group">
          <input type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange = { e => onFormDataChange(e) }
            required
          />
          
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
       
        <input type="submit" className="btn btn-primary" value="Login" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </Fragment>
  )
}

export default Register;
