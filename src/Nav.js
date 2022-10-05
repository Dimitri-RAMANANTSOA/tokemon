import React from 'react'
import './Nav.css';
import {Link} from 'react-router-dom';

const Nav = () => {
  return (
    <div className='header'>
      <>
      <h1>Hello Tokemon</h1>
      <ul>
        <Link to='/'>
        <li>Stacking</li>
        </Link>
        <Link to='mint'>
        <li>Mint</li>
        </Link>
      </ul>
      </>
    </div>
  )
}

export default Nav