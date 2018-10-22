import React, { Fragment } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.css';
// commented out because it's overriding global CSS, need to migrate to isolated styled components
import TopNavbar from './topnavbar';
import TestTokenUI from './testtoken';
import ERC20TokenUI from './erc20token';
import SNTUI from './snt-ui';

export default ({ setAccount }) => {
  return (
    <div class="container">
      <SNTUI />
    </div>
  )
}
