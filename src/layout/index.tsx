import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AntdSpin from 'antd/lib/spin';

import ErrorBoundary from 'components/custom/error-boundary';
import WarningProvider from 'components/providers/warning-provider';
import LayoutFooter from 'layout/components/layout-footer';
import LayoutHeader from 'layout/components/layout-header';

import ThemeSwitcher from './components/theme-switcher';

import s from './s.module.scss';

const YieldFarmingView = lazy(() => import('modules/yield-farming'));
const GovernanceView = lazy(() => import('modules/governance'));
const AirDropView = lazy(() => import('modules/airdrop'));

const LayoutView: React.FC = () => {
  return (
    <div className={s.layout}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <WarningProvider>
          <LayoutHeader />
          <main className={s.main}>
            <ErrorBoundary>
              <Suspense fallback={<AntdSpin className="pv-24 ph-64" style={{ width: '100%' }} />}>
                <Switch>
                  <Route path="/yield-farming" component={YieldFarmingView} />
                  <Route path="/governance/:vt(\w+)" component={GovernanceView} />
                  <Route path="/governance" component={GovernanceView} />
                  <Route path="/airdrop" component={AirDropView} />
                  <Redirect from="/" to="/yield-farming" />
                </Switch>
              </Suspense>
            </ErrorBoundary>
          </main>
          <LayoutFooter />
          <ThemeSwitcher />
        </WarningProvider>
      </div>
    </div>
  );
};

export default LayoutView;
