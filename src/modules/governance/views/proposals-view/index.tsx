import React from 'react';
import { useHistory } from 'react-router';
import { CardTabListType } from 'antd/lib/card';
import { SearchOutlined } from '@ant-design/icons';

import Card from 'components/antd/card';
import Button from 'components/antd/button';
import Input from 'components/antd/input';
import Grid from 'components/custom/grid';
import { Heading, Paragraph, Small } from 'components/custom/typography';
import ProposalsProvider, { useProposals } from 'modules/governance/views/proposals-view/providers/ProposalsProvider';
import ProposalsTable from './components/proposals-table';

import { useDebounce } from 'hooks/useDebounce';

import s from './styles.module.scss';
import Popover from '../../../../components/antd/popover';

const TABS: CardTabListType[] = [{
  key: 'all',
  tab: (
    <Paragraph type="p1" semiBold color="grey900">All proposals</Paragraph>
  ),
}, {
  key: 'active',
  tab: (
    <Paragraph type="p1" semiBold color="grey900">Active</Paragraph>
  ),
}, {
  key: 'executed',
  tab: (
    <Paragraph type="p1" semiBold color="grey900">Executed</Paragraph>
  ),
}, {
  key: 'failed',
  tab: (
    <Paragraph type="p1" semiBold color="grey900">Failed</Paragraph>
  ),
}];

const ProposalsViewInner: React.FunctionComponent = () => {
  const history = useHistory();
  const proposalsCtx = useProposals();

  const [visibleReason, setVisibleReason] = React.useState<boolean>(false);

  function handleStateChange(stateFilter: string) {
    proposalsCtx.changeStateFilter(stateFilter);
  }

  const handleSearchChange = useDebounce((ev: React.ChangeEvent<HTMLInputElement>) => {
    proposalsCtx.changeSearchFilter(ev.target.value);
  }, 400);

  return (
    <Grid flow="row" gap={32}>
      <Grid flow="col" align="center" justify="space-between">
        <Heading type="h1" bold color="grey900">Proposals</Heading>
        <Grid flow="row" gap={8} align="end" justify="end">
          {proposalsCtx.hasAlreadyActiveProposal !== undefined && (
            <Button
              type="primary"
              disabled={proposalsCtx.hasAlreadyActiveProposal}
              onClick={() => history.push('proposals/create')}>
              Create proposal
            </Button>
          )}

          {proposalsCtx.hasAlreadyActiveProposal && (
            <Grid flow="col" gap={8} align="center">
              <Small semiBold color="grey500">
                You are not able to create a proposal.
              </Small>
              <Popover
                title="Why you can’t create a proposal"
                placement="bottomLeft"
                overlayStyle={{ width: 376 }}
                content={<Paragraph type="p1">
                  Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis
                  enim velit mollit. Exercitation veniam consequat sunt nostrud amet.Amet minim mollit non deserunt
                  ullamco est sit aliqua dolor do amet sint.
                </Paragraph>}
                visible={visibleReason}
                onVisibleChange={setVisibleReason}>
                <Button type="link">See why</Button>
              </Popover>
            </Grid>
          )}
        </Grid>
      </Grid>

      <Card
        noPaddingBody
        tabList={TABS}
        activeTabKey={proposalsCtx.stateFilter}
        tabBarExtraContent={(
          <Input
            className={s.search}
            prefix={<SearchOutlined />}
            placeholder="Search proposal"
            onChange={handleSearchChange} />
        )}
        onTabChange={handleStateChange}>
        <ProposalsTable />
      </Card>
    </Grid>
  );
};

const ProposalsView = () => {
  return (
    <ProposalsProvider>
      <ProposalsViewInner />
    </ProposalsProvider>
  );
};

export default ProposalsView;