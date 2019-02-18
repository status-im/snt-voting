import React, { Fragment } from 'react';
import NoConnection from './NoConnection';

const NoWeb3 = () => <div>NO WEB3 Provider detected</div>;

const Web3Render = ({ ready, children }) => (
  <Fragment>
    {ready ? (
      <Fragment>{children}</Fragment>
    ) : (
      <div id="votingDapp">
        <NoConnection />
      </div>
    )}
  </Fragment>
);

export default Web3Render;
