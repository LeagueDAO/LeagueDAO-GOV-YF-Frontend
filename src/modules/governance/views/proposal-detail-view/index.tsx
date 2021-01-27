import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router';

import Button from 'components/antd/button';
import Grid from 'components/custom/grid';
import { Heading, Paragraph } from 'components/custom/typography';
import Icon from 'components/custom/icon';
import ProposalVoteResultsCard from './components/proposal-vote-results-card';
import ProposalDetailsCard from './components/proposal-details-card';
import ProposalStatusCard from './components/proposal-status-card';
import ProposalCancellationCard from './components/proposal-cancellation-card';
import ProposalVotesCard from './components/proposal-votes-card';
import ProposalQuorumCard from './components/proposal-quorum-card';
import ProposalApprovalCard from './components/proposal-approval-card';
import ProposalProvider, { useProposal } from './providers/ProposalProvider';

import { APIProposalState } from 'modules/governance/api';

type ProposalDetailViewInnerState = {
  executing: boolean;
};

const InitialState: ProposalDetailViewInnerState = {
  executing: false,
};

const ProposalDetailViewInner: React.FunctionComponent = () => {
  const history = useHistory();
  const proposalCtx = useProposal();

  const proposalState = proposalCtx.proposal?.state;
  const [state, setState] = React.useState<ProposalDetailViewInnerState>(InitialState);

  function handleBackClick() {
    history.push('/governance/proposals');
  }

  function handleQueueForExecution() {
    setState(prevState => ({
      ...prevState,
      executing: true,
    }));

    proposalCtx.queueForExecution()
      .then(() => {
        setState(prevState => ({
          ...prevState,
          executing: false,
        }));
      })
      .catch(() => {
        setState(prevState => ({
          ...prevState,
          executing: false,
        }));
      });
  }

  function handleExecuteProposal() {
    setState(prevState => ({
      ...prevState,
      executing: true,
    }));

    proposalCtx.executeProposal()
      .then(() => {
        setState(prevState => ({
          ...prevState,
          executing: false,
        }));
      })
      .catch(() => {
        setState(prevState => ({
          ...prevState,
          executing: false,
        }));
      });
  }

  return (
    <Grid flow="row" gap={32}>
      <Grid flow="col">
        <Button
          type="link"
          icon={<Icon type="arrow-left" />}
          onClick={handleBackClick}>Proposals</Button>
      </Grid>

      <Grid flow="col" gap={32} align="start" justify="space-between">
        <Heading type="h2" semiBold color="grey900" loading={!proposalCtx.proposal}>
          PID-{proposalCtx.proposal?.proposalId}: {proposalCtx.proposal?.title}
        </Heading>
        {APIProposalState.ACCEPTED === proposalState && (
          <Button
            type="primary"
            loading={state.executing}
            onClick={handleQueueForExecution}>Queue for execution</Button>
        )}
        {APIProposalState.GRACE === proposalState && (
          <Button
            type="primary"
            loading={state.executing}
            onClick={handleExecuteProposal}>Execute proposal</Button>
        )}
      </Grid>

      <Grid flow="col" gap={32} colsTemplate="1fr minmax(0px, 428px)">
        <Grid flow="row" gap={32}>
          {![APIProposalState.WARMUP, APIProposalState.ACTIVE].includes(proposalState as any) && (
            <ProposalVoteResultsCard />
          )}
          <ProposalDetailsCard />
        </Grid>
        <Grid flow="row" gap={32}>
          <ProposalStatusCard />
          {APIProposalState.QUEUED === proposalState && (
            <ProposalCancellationCard />
          )}
          {APIProposalState.ACTIVE === proposalState && (
            <>
              <ProposalVotesCard />
              <ProposalQuorumCard />
              <ProposalApprovalCard />
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const ProposalDetailView = () => {
  const { params } = useRouteMatch<{ id: string }>();

  return (
    <ProposalProvider proposalId={Number(params.id)}>
      <ProposalDetailViewInner />
    </ProposalProvider>
  );
};

export default ProposalDetailView;