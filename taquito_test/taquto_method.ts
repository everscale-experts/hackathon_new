import {
  concat,
  defer,
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
  range,
  ReplaySubject,
  SchedulerLike,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  takeWhile,
  tap,
  concatMap,
  distinctUntilKeyChanged,
  startWith,
  switchMap,
  timeoutWith,
} from 'rxjs/operators';
import BigNumber from 'bignumber.js';

export interface WalletTransferParams {
    to: string;
    amount: number;
    fee?: number;
    parameter?: TransactionOperationParameter;
    gasLimit?: number;
    storageLimit?: number;
    mutez?: boolean;
}

export interface TransactionOperationParameter {
    entrypoint: string;
    value: MichelsonV1Expression;
}

export interface MichelsonV1ExpressionExtended {
  prim: string;
  args?: MichelsonV1Expression[];
  annots?: string[];
}

export type MichelsonV1Expression =
    | MichelsonV1ExpressionBase
    | MichelsonV1ExpressionExtended
    | MichelsonV1Expression[];

export interface MichelsonV1ExpressionBase {
    int?: string;
    string?: string;
    bytes?: string;
};

export interface OperationFactoryConfig {
  blockIdentifier?: string;
}

var walletCommand = <T>(send: () => Promise<T>) => {
    return {
        send,
    };
};

var mapTransferParamsToWalletParams: (params: () => Promise<WalletTransferParams>) => Promise<any>;
var sendOperations: (params: any[]) => Promise<string>;
export enum OpKind {
    ORIGINATION = 'origination',
    DELEGATION = 'delegation',
    REVEAL = 'reveal',
    TRANSACTION = 'transaction',
    ACTIVATION = 'activate_account',
    ENDORSEMENT = 'endorsement',
    ENDORSEMENT_WITH_SLOT = 'endorsement_with_slot',
    SEED_NONCE_REVELATION = 'seed_nonce_revelation',
    DOUBLE_ENDORSEMENT_EVIDENCE = 'double_endorsement_evidence',
    DOUBLE_BAKING_EVIDENCE = 'double_baking_evidence',
    PROPOSALS = 'proposals',
    BALLOT = 'ballot',
    FAILING_NOOP = 'failing_noop',
    REGISTER_GLOBAL_CONSTANT = 'register_global_constant'
}

export interface OperationContentsAndResultReveal {
    kind: OpKind.REVEAL;
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    public_key: string;
    metadata: OperationContentsAndResultMetadataReveal;
}

export type InternalOperationResultKindEnum =
    | OpKind.REVEAL
    | OpKind.TRANSACTION
    | OpKind.ORIGINATION
    | OpKind.DELEGATION
    | OpKind.REGISTER_GLOBAL_CONSTANT;

export interface ScriptedContracts {
    code: MichelsonV1Expression[];
    storage: MichelsonV1Expression;
}

export interface TezosGenericOperationError {
    kind: string;
    id: string;
}

export interface OperationResultDelegation {
    status: OperationResultStatusEnum;
    consumed_gas?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
}

export interface OperationBalanceUpdatesItem {
    kind: BalanceUpdateKindEnum;
    category?: BalanceUpdateCategoryEnum;
    delegate?: string;
    cycle?: number;
    contract?: string;
    change: string;
    origin?: MetadataBalanceUpdatesOriginEnum;
}

export interface LazyStorageDiffUpdatesBigMap {
    key_hash: string;
    key: MichelsonV1Expression;
    value?: MichelsonV1Expression;
}

export interface LazyStorageDiffBigMapItems {
    action: DiffActionEnum;
    updates?: LazyStorageDiffUpdatesBigMap[];
    source?: string;
    key_type?: MichelsonV1Expression;
    value_type?: MichelsonV1Expression;
}

export interface LazyStorageDiffBigMap {
    kind: 'big_map';
    id: string;
    diff: LazyStorageDiffBigMapItems;
}

export interface LazyStorageDiffSaplingStateItems {
  action: DiffActionEnum;
  updates?: LazyStorageDiffUpdatesSaplingState;
  source?: string;
  memo_size?: number;
}

export interface LazyStorageDiffUpdatesSaplingState {
  commitments_and_ciphertexts: CommitmentsAndCiphertexts[];
  nullifiers: string[];
}

export type CommitmentsAndCiphertexts = [
  SaplingTransactionCommitment,
  SaplingTransactionCiphertext
];

export interface SaplingTransactionCiphertext {
  cv: string;
  epk: string;
  payload_enc: string;
  nonce_enc: string;
  payload_out: string;
  nonce_out: string;
}

export interface LazyStorageDiffSaplingState {
  kind: 'sapling_state';
  id: string;
  diff: LazyStorageDiffSaplingStateItems;
}

export type ContractBigMapDiff = ContractBigMapDiffItem[];
export type SaplingTransactionCommitment = string;
export type DiffActionEnum = 'update' | 'remove' | 'copy' | 'alloc';
export type OperationBalanceUpdates = OperationBalanceUpdatesItem[];
export type LazyStorageDiff = LazyStorageDiffBigMap | LazyStorageDiffSaplingState;
export type BalanceUpdateKindEnum = 'contract' | 'freezer';
export type BalanceUpdateCategoryEnum = 'rewards' | 'fees' | 'deposits';
export type MetadataBalanceUpdatesOriginEnum = 'block' | 'migration' | 'subsidy';

export interface ContractBigMapDiffItem {
    key_hash?: string;
    key?: MichelsonV1Expression;
    value?: MichelsonV1Expression;
    action?: DiffActionEnum;
    big_map?: string;
    source_big_map?: string;
    destination_big_map?: string;
    key_type?: MichelsonV1Expression;
    value_type?: MichelsonV1Expression;
}

export interface OperationResultOrigination {
    status: OperationResultStatusEnum;
    big_map_diff?: ContractBigMapDiff;
    balance_updates?: OperationBalanceUpdates;
    originated_contracts?: string[];
    consumed_gas?: string;
    storage_size?: string;
    paid_storage_size_diff?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
    lazy_storage_diff?: LazyStorageDiff[];
}

export type InternalOperationResultEnum =
    | OperationResultReveal
    | OperationResultTransaction
    | OperationResultDelegation
    | OperationResultOrigination
    | OperationResultRegisterGlobalConstant;

export interface OperationResultTransaction {
    status: OperationResultStatusEnum;
    storage?: MichelsonV1Expression;
    big_map_diff?: ContractBigMapDiff;
    balance_updates?: OperationBalanceUpdates;
    originated_contracts?: string[];
    consumed_gas?: string;
    storage_size?: string;
    paid_storage_size_diff?: string;
    allocated_destination_contract?: boolean;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
    lazy_storage_diff?: LazyStorageDiff[];
}

export interface OperationResultRegisterGlobalConstant {
  status: OperationResultStatusEnum;
  balance_updates?: OperationBalanceUpdates;
  consumed_gas?: string;
  storage_size?: string;
  global_address?: string;
  errors?: TezosGenericOperationError[];
}

export interface InternalOperationResult {
    kind: InternalOperationResultKindEnum;
    source: string;
    nonce: number;
    amount?: string;
    destination?: string;
    parameters?: TransactionOperationParameter;
    public_key?: string;
    balance?: string;
    delegate?: string;
    script?: ScriptedContracts;
    value?: MichelsonV1Expression;
    result: InternalOperationResultEnum;
}

export type OperationResultStatusEnum = 'applied' | 'failed' | 'skipped' | 'backtracked';
export type MetadataBalanceUpdatesKindEnum = 'contract' | 'freezer';
export type MetadataBalanceUpdatesCategoryEnum = 'rewards' | 'fees' | 'deposits';

export interface OperationContentsAndResultMetadataReveal {
    balance_updates: OperationMetadataBalanceUpdates[];
    operation_result: OperationResultReveal;
    internal_operation_results?: InternalOperationResult[];
}

export interface OperationResultReveal {
    status: OperationResultStatusEnum;
    consumed_gas?: string;
    errors?: TezosGenericOperationError[];
    consumed_milligas?: string;
}

export interface OperationMetadataBalanceUpdates {
  kind: MetadataBalanceUpdatesKindEnum;
  category?: MetadataBalanceUpdatesCategoryEnum;
  contract?: string;
  delegate?: string;
  cycle?: number;
  change: string;
  origin?: MetadataBalanceUpdatesOriginEnum;
}

export interface OperationContentsAndResultTransaction {
  kind: OpKind.TRANSACTION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: TransactionOperationParameter;
  metadata: OperationContentsAndResultMetadataTransaction;
}

export interface OperationContentsAndResultMetadataTransaction {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultTransaction;
  internal_operation_results?: InternalOperationResult[];
}

export interface BlockResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  header: BlockFullHeader;
  metadata: BlockMetadata;
  operations: OperationEntry[][];
}

export interface OperationContentsEndorsement {
  kind: OpKind.ENDORSEMENT;
  level: number;
}

export interface OperationContentsEndorsementWithSlot {
  kind: OpKind.ENDORSEMENT_WITH_SLOT;
  endorsement: InlinedEndorsement;
  slot: number;
}

export interface InlinedEndorsement {
  branch: string;
  operations: InlinedEndorsementContents;
  signature?: string;
}

export interface InlinedEndorsementContents {
  kind: InlinedEndorsementKindEnum;
  level: number;
}

export interface OperationContentsRevelation {
  kind: OpKind.SEED_NONCE_REVELATION;
  level: number;
  nonce: string;
}

export interface OperationContentsDoubleEndorsement {
  kind: OpKind.DOUBLE_ENDORSEMENT_EVIDENCE;
  op1: InlinedEndorsement;
  op2: InlinedEndorsement;
  slot?: number;
}

export interface OperationContentsDoubleBaking {
  kind: OpKind.DOUBLE_BAKING_EVIDENCE;
  bh1: BlockFullHeader;
  bh2: BlockFullHeader;
}

export interface OperationContentsActivateAccount {
  kind: OpKind.ACTIVATION;
  pkh: string;
  secret: string;
}

export interface OperationContentsProposals {
  kind: OpKind.PROPOSALS;
  source: string;
  period: number;
  proposals: string[];
}

export interface OperationContentsBallot {
  kind: OpKind.BALLOT;
  source: string;
  period: number;
  proposal: string;
  ballot: OperationContentsBallotEnum;
}

export interface OperationContentsReveal {
  kind: OpKind.REVEAL;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  public_key: string;
}

export interface OperationContentsTransaction {
  kind: OpKind.TRANSACTION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: TransactionOperationParameter;
}

export interface OperationContentsOrigination {
  kind: OpKind.ORIGINATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script?: ScriptedContracts;
}

export interface OperationContentsDelegation {
  kind: OpKind.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
}

export interface OperationContentsFailingNoop {
  kind: OpKind.FAILING_NOOP;
  arbitrary: string;
}

export interface OperationContentsRegisterGlobalConstant {
  kind: OpKind.REGISTER_GLOBAL_CONSTANT;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  value: MichelsonV1Expression;
}

export type InlinedEndorsementKindEnum = OpKind.ENDORSEMENT;
export type OperationContentsBallotEnum = 'nay' | 'yay' | 'pass';

export type OperationContents =
  | OperationContentsEndorsement
  | OperationContentsRevelation
  | OperationContentsDoubleEndorsement
  | OperationContentsDoubleBaking
  | OperationContentsActivateAccount
  | OperationContentsProposals
  | OperationContentsBallot
  | OperationContentsReveal
  | OperationContentsTransaction
  | OperationContentsOrigination
  | OperationContentsDelegation
  | OperationContentsEndorsementWithSlot
  | OperationContentsFailingNoop
  | OperationContentsRegisterGlobalConstant;

export type OperationContentsAndResult =
  | OperationContentsAndResultEndorsement
  | OperationContentsAndResultRevelation
  | OperationContentsAndResultDoubleEndorsement
  | OperationContentsAndResultDoubleBaking
  | OperationContentsAndResultActivateAccount
  | OperationContentsAndResultProposals
  | OperationContentsAndResultBallot
  | OperationContentsAndResultReveal
  | OperationContentsAndResultTransaction
  | OperationContentsAndResultOrigination
  | OperationContentsAndResultDelegation
  | OperationContentsAndResultEndorsementWithSlot
  | OperationContentsAndResultRegisterGlobalConstant;

export interface OperationContentsAndResultEndorsement {
    kind: OpKind.ENDORSEMENT;
    level: number;
    metadata: OperationContentsAndResultMetadataExtended;
}

export interface OperationContentsAndResultRegisterGlobalConstant {
  kind: OpKind.REGISTER_GLOBAL_CONSTANT;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  value: MichelsonV1Expression;
  metadata: OperationContentsAndResultMetadataRegisterGlobalConstant;
}

export interface OperationContentsAndResultMetadataRegisterGlobalConstant {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultRegisterGlobalConstant;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultEndorsementWithSlot {
  kind: OpKind.ENDORSEMENT_WITH_SLOT;
  endorsement: InlinedEndorsement;
  slot: number;
  metadata: OperationContentsAndResultMetadataExtended;
}

export interface OperationContentsAndResultMetadataDelegation {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultDelegation;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultDelegation {
  kind: OpKind.DELEGATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
  metadata: OperationContentsAndResultMetadataDelegation;
}

export interface OperationContentsAndResultOrigination {
  kind: OpKind.ORIGINATION;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script?: ScriptedContracts;
  metadata: OperationContentsAndResultMetadataOrigination;
}

export interface OperationContentsAndResultMetadataOrigination {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultOrigination;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultBallot {
  kind: OpKind.BALLOT;
  source: string;
  period: number;
  proposal: string;
  ballot: OperationContentsBallotEnum;
}

export interface OperationContentsAndResultProposals {
  kind: OpKind.PROPOSALS;
  source: string;
  period: number;
  proposals: string[];
}

export interface OperationContentsAndResultActivateAccount {
  kind: OpKind.ACTIVATION;
  pkh: string;
  secret: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultDoubleBaking {
  kind: OpKind.DOUBLE_BAKING_EVIDENCE;
  bh1: BlockFullHeader;
  bh2: BlockFullHeader;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultDoubleEndorsement {
  kind: OpKind.DOUBLE_ENDORSEMENT_EVIDENCE;
  op1: InlinedEndorsement;
  op2: InlinedEndorsement;
  slot?: number;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultRevelation {
  kind: OpKind.SEED_NONCE_REVELATION;
  level: number;
  nonce: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsAndResultMetadata {
  balance_updates: OperationMetadataBalanceUpdates[];
}

export interface OperationContentsAndResultMetadataExtended {
  balance_updates: OperationMetadataBalanceUpdates[];
  delegate: string;
  slots: number[];
}

export interface OperationEntry {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: (OperationContents | OperationContentsAndResult)[];
  signature?: string;
}

export interface BlockMetadata {
  protocol: string;
  next_protocol: string;
  test_chain_status: TestChainStatus;
  max_operations_ttl: number;
  max_operation_data_length: number;
  max_block_header_length: number;
  max_operation_list_length: MaxOperationListLength[];
  baker: string;
  level?: Level;
  level_info?: LevelInfo;
  voting_period_kind?: string;
  voting_period_info?: VotingPeriodBlockResult;
  nonce_hash?: any;
  consumed_gas: string;
  deactivated: any[];
  balance_updates: OperationBalanceUpdates;
  liquidity_baking_escape_ema?: number;
  implicit_operations_results?: SuccessfulManagerOperationResult[];
}

export type SuccessfulManagerOperationResultKindEnum =
  | OpKind.REVEAL
  | OpKind.TRANSACTION
  | OpKind.ORIGINATION
  | OpKind.DELEGATION;

export interface SuccessfulManagerOperationResult {
  kind: SuccessfulManagerOperationResultKindEnum;
  consumed_gas?: string;
  consumed_milligas?: string;
  storage?: MichelsonV1Expression;
  big_map_diff?: ContractBigMapDiff;
  balance_updates?: OperationBalanceUpdates;
  originated_contracts?: string[];
  storage_size?: string;
  paid_storage_size_diff?: string;
  lazy_storage_diff?: LazyStorageDiff[];
}

export interface VotingPeriodBlockResult {
  voting_period: VotingPeriodResult;
  position: number;
  remaining: number;
}

export interface VotingPeriodResult {
  index: number;
  kind: string;
  start_position: number;
}

export interface LevelInfo {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  expected_commitment: boolean;
}

export interface Level {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  voting_period: number;
  voting_period_position: number;
  expected_commitment: boolean;
}

export interface MaxOperationListLength {
  max_size: number;
  max_op?: number;
}

export interface TestChainStatus {
  status: string;
}

export interface BlockFullHeader {
  level: number;
  proto: number;
  predecessor: string;
  timestamp: TimeStampMixed;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  seed_nonce_hash?: string;
  signature: string;
}

export interface RPCOptions {
  block: string;
}

export type BalanceResponse = BigNumber;
export type StorageResponse = ScriptedContracts['storage'];
export type ScriptResponse = ScriptedContracts;
export interface ConstantsResponseProto009 extends ConstantsResponseProto007 {}
export interface ConstantsResponseProto008 extends ConstantsResponseProto007 {}
export type UnparsingModeEnum = 'Readable' | 'Optimized' | 'Optimized_legacy';
export type ManagerKeyResponse = string | { key: string };
export type BakingRightsArgumentsDelegate = string | string[];
export type BakingRightsArgumentsCycle = number | number[];
export type BakingRightsArgumentsLevel = number | number[];
export type DelegateResponse = string | null;
export type BigMapGetResponse = MichelsonV1Expression;
export type BigMapResponse = MichelsonV1Expression | MichelsonV1Expression[];
export type Ratio = { numerator: number; denominator: number };
export type UnparsingMode = {
  unparsing_mode: UnparsingModeEnum;
};

export interface DelegatesResponse {
  balance: BigNumber;
  frozen_balance: BigNumber;
  frozen_balance_by_cycle: Frozenbalancebycycle[];
  staking_balance: BigNumber;
  delegated_contracts: string[];
  delegated_balance: BigNumber;
  deactivated: boolean;
  grace_period: number;
  voting_power?: number;
}

interface Frozenbalancebycycle {
  cycle: number;
  deposit?: BigNumber;
  deposits?: BigNumber; // Since Granada, "deposit" is replaced by "deposits"
  fees: BigNumber;
  rewards: BigNumber;
}

export interface ContractResponse {
  balance: BigNumber;
  script: ScriptedContracts;
  counter?: string;
  delegate?: string;
}

export type BigMapKey = {
  key: { [key: string]: string | object[] };
  type: { prim: string; args?: object[] };
};

export interface ConstantsResponseCommon {
  proof_of_work_nonce_size: number;
  nonce_length: number;
  max_operation_data_length: number;
  preserved_cycles: number;
  blocks_per_cycle: number;
  blocks_per_commitment: number;
  blocks_per_roll_snapshot: number;
  blocks_per_voting_period: number;
  time_between_blocks: BigNumber[];
  endorsers_per_block: number;
  hard_gas_limit_per_operation: BigNumber;
  hard_gas_limit_per_block: BigNumber;
  proof_of_work_threshold: BigNumber;
  tokens_per_roll: BigNumber;
  michelson_maximum_type_size: number;
  seed_nonce_revelation_tip: BigNumber;
  block_security_deposit: BigNumber;
  endorsement_security_deposit: BigNumber;
  endorsement_reward: BigNumber | BigNumber[]; // BigNumber[] since proto 006, BigNumber before
  cost_per_byte: BigNumber;
  hard_storage_limit_per_operation: BigNumber;
}

export interface ConstantsResponseProto011 extends ConstantsResponseProto010 {
  max_micheline_node_count?: number;
  max_allowed_global_constants_depth?: number;
  max_micheline_bytes_limit?: number;
  cache_layout?: BigNumber[];
}

export interface ConstantsResponseProto010 extends ConstantsResponseProto007 {
  minimal_block_delay?: BigNumber;
  liquidity_baking_subsidy?: BigNumber;
  liquidity_baking_sunset_level?: number;
  liquidity_baking_escape_ema_threshold?: number;
}

export interface ConstantsResponseProto007
  extends Omit<ConstantsResponseProto006, 'max_revelations_per_block'> {
  max_anon_ops_per_block?: number;
}

export interface ConstantsResponseProto006 extends Omit<ConstantsResponseProto005, 'block_reward'> {
  baking_reward_per_endorsement?: BigNumber[];
}

export interface ConstantsResponseProto005 extends ConstantsResponseProto004 {
  quorum_min?: number;
  quorum_max?: number;
  min_proposal_quorum?: number;
  initial_endorsers?: number;
  delay_per_missing_endorsement?: BigNumber;
}

export interface ConstantsResponseProto004 extends ConstantsResponseProto003 {
  test_chain_duration?: BigNumber;
}

export interface ConstantsResponseProto003
  extends Omit<ConstantsResponseProto001And002, 'origination_burn'> {
  origination_size?: number;
  max_proposals_per_delegate?: number;
}

export interface ConstantsResponseProto001And002 {
  max_revelations_per_block?: number;
  origination_burn?: string;
  block_reward?: BigNumber;
}

export interface ConstantsResponseProto012
  extends Omit<
    ConstantsResponseProto011,
    | 'baking_reward_per_endorsement'
    | 'initial_endorsers'
    | 'delay_per_missing_endorsement'
    | 'test_chain_duration'
    | 'blocks_per_roll_snapshot'
    | 'time_between_blocks'
    | 'endorsers_per_block'
    | 'block_security_deposit'
    | 'endorsement_security_deposit'
    | 'endorsement_reward'
  > {
  blocks_per_stake_snapshot?: number;
  baking_reward_fixed_portion?: BigNumber;
  baking_reward_bonus_per_slot?: BigNumber;
  endorsing_reward_per_slot?: BigNumber;
  max_operations_time_to_live?: number;
  consensus_committee_size?: number;
  consensus_threshold?: number;
  minimal_participation_ratio?: Ratio;
  max_slashing_period?: number;
  frozen_deposits_percentage?: number;
  double_baking_punishment?: BigNumber;
  ratio_of_frozen_deposits_slashed_per_double_endorsement?: Ratio;
  delegate_selection?: 'random' | string[][];
  delay_increment_per_round?: BigNumber;
}

export type ConstantsResponse = ConstantsResponseCommon &
  ConstantsResponseProto012 &
  ConstantsResponseProto011 &
  ConstantsResponseProto010 &
  ConstantsResponseProto009 &
  ConstantsResponseProto008 &
  ConstantsResponseProto007 &
  ConstantsResponseProto006 &
  ConstantsResponseProto005 &
  ConstantsResponseProto004 &
  ConstantsResponseProto003 &
  ConstantsResponseProto001And002;


export interface BlockHeaderResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}

export interface BakingRightsQueryArguments {
  level?: BakingRightsArgumentsLevel;
  cycle?: BakingRightsArgumentsCycle;
  delegate?: BakingRightsArgumentsDelegate;
  max_priority?: number;
  all?: null;
}

export interface BakingRightsResponseItem {
  level: number;
  delegate: string;
  priority: number;
  estimated_time?: Date;
}

export interface BallotsResponse {
  yay: number;
  nay: number;
  pass: number;
}

export interface BallotListResponseItem {
  pkh: string;
  ballot: BallotListResponseEnum;
}

export type PeriodKindResponse =
  | 'proposal'
  | 'testing_vote'
  | 'testing'
  | 'promotion_vote'
  | 'exploration'
  | 'cooldown'
  | 'promotion'
  | 'adoption';

export interface VotesListingsResponseItem {
  pkh: string;
  rolls: number;
}

export interface OperationObject {
  branch?: string;
  contents?: OperationContents[];
  protocol?: string;
  signature?: string;
}

export type PreapplyResponse = {
  contents: OperationContentsAndResult[];
};

export type EntrypointsResponse = {
  entrypoints: { [key: string]: MichelsonV1ExpressionExtended };
  unreachable?: { path: ('Left' | 'Right')[] };
};

export interface EndorsingRightsQueryArguments {
  level?: EndorsingRightsArgumentsLevel;
  cycle?: EndorsingRightsArgumentsCycle;
  delegate?: EndorsingRightsArgumentsDelegate;
}

export interface EndorsingRightsResponseItem {
  level: number;
  delegate: string;
  slots: number[];
  estimated_time?: Date;
}

export type RPCRunOperationParam = {
  operation: OperationObject;
  chain_id: string;
};

export type RPCRunCodeParam = {
  script: MichelsonV1ExpressionExtended[];
  storage: MichelsonV1Expression;
  input: MichelsonV1Expression;
  amount: string;
  chain_id: string;
  source?: string;
  payer?: string;
  gas?: BigNumber;
  entrypoint?: string;
  balance?: string;
};

export type RunCodeResult = {
  storage: MichelsonV1Expression;
  operations: InternalOperationResult[];
  big_map_diff?: ContractBigMapDiff;
};

export interface PackDataParams {
  data: MichelsonV1Expression;
  type: MichelsonV1Expression;
  gas?: BigNumber;
}

export type SaplingDiffResponse = {
  root: SaplingTransactionCommitmentHash;
  commitments_and_ciphertexts: CommitmentsAndCiphertexts[];
  nullifiers: string[];
};

export interface ForgeParams {
  branch: string;
  contents: OperationContents[];
}

export type ProtocolsResponse = {
  protocol: string;
  next_protocol: string;
};

export interface Forger {
  forge(params: ForgeParams): Promise<ForgeResponse>;
}

export interface ParserProvider {
    prepareCodeOrigination(params: OriginateParams): Promise<OriginateParams>;
}

export type OriginateParamsBase = {
  balance?: string;
  code: string | object[];
  delegate?: string;
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
  mutez?: boolean;
};

export type OriginateParams<TStorage = any> = OriginateParamsBase &(
  | {
    init?: never;
    storage: TStorage;
  }
  | {
    init: string | object;
    storage?: never;
  }
);

export interface Injector {
  inject(signedOperationBytes: InjectorParams): Promise<TxHash>;
}

export type ForgeResponse = string;
export type TxHash = string;
export type InjectorParams = string;
export type WalletOriginateParams<TStorage = any> = Omit<OriginateParams<TStorage>, WalletDefinedFields>;
export type WalletDefinedFields = 'source';
export type SaplingTransactionCommitmentHash = string;
export type EndorsingRightsArgumentsDelegate = string | string[];
export type EndorsingRightsArgumentsCycle = number | number[];
export type EndorsingRightsArgumentsLevel = number | number[];
export type BakingRightsResponse = BakingRightsResponseItem[];
export type EndorsingRightsResponse = EndorsingRightsResponseItem[];
export type BallotListResponseEnum = 'nay' | 'yay' | 'pass';
export type BallotListResponse = BallotListResponseItem[];
export type CurrentProposalResponse = string | null;
export type CurrentQuorumResponse = number;
export type VotesListingsResponse = VotesListingsResponseItem[];
export type ProposalsResponse = ProposalsResponseItem[];
export type ProposalsResponseItem = [string, number];
export type ForgeOperationsParams = Pick<OperationObject, 'branch' | 'contents'>;
export type OperationHash = string;
export type PreapplyParams = OperationObject[];
export type WalletDelegateParams = Omit<DelegateParams, WalletDefinedFields>;

export interface DelegateParams {
  source: string;
  delegate?: string;
  fee?: number;
  gasLimit?: number;
  storageLimit?: number;
}

export interface RpcClientInterface {
  getBlockHash(options?: RPCOptions): Promise<string>;
  getLiveBlocks(options?: RPCOptions): Promise<string[]>;
  getBalance(address: string, options?: RPCOptions): Promise<BalanceResponse>;
  getStorage(address: string, options?: RPCOptions): Promise<StorageResponse>;
  getScript(address: string, options?: RPCOptions): Promise<ScriptResponse>;
  getNormalizedScript(
    address: string,
    unparsingMode?: UnparsingMode,
    options?: RPCOptions
  ): Promise<ScriptResponse>;
  getContract(address: string, options?: RPCOptions): Promise<ContractResponse>;
  getManagerKey(address: string, options?: RPCOptions): Promise<ManagerKeyResponse>;
  getDelegate(address: string, options?: RPCOptions): Promise<DelegateResponse>;
  getBigMapKey(address: string, key: BigMapKey, options?: RPCOptions): Promise<BigMapGetResponse>;
  getBigMapExpr(id: string, expr: string, options?: RPCOptions): Promise<BigMapResponse>;
  getDelegates(address: string, options?: RPCOptions): Promise<DelegatesResponse>;
  getConstants(options?: RPCOptions): Promise<ConstantsResponse>;
  getBlock(options?: RPCOptions): Promise<BlockResponse>;
  getBlockHeader(options?: RPCOptions): Promise<BlockHeaderResponse>;
  getBlockMetadata(options?: RPCOptions): Promise<BlockMetadata>;
  getBakingRights(
    args: BakingRightsQueryArguments,
    options?: RPCOptions
  ): Promise<BakingRightsResponse>;
  getEndorsingRights(
    args: EndorsingRightsQueryArguments,
    options?: RPCOptions
  ): Promise<EndorsingRightsResponse>;
  getBallotList(options?: RPCOptions): Promise<BallotListResponse>;
  getBallots(options?: RPCOptions): Promise<BallotsResponse>;
  getCurrentPeriodKind(options?: RPCOptions): Promise<PeriodKindResponse>;
  getCurrentProposal(options?: RPCOptions): Promise<CurrentProposalResponse>;
  getCurrentQuorum(options?: RPCOptions): Promise<CurrentQuorumResponse>;
  getVotesListings(options?: RPCOptions): Promise<VotesListingsResponse>;
  getProposals(options?: RPCOptions): Promise<ProposalsResponse>;
  forgeOperations(data: ForgeOperationsParams, options?: RPCOptions): Promise<string>;
  injectOperation(signedOpBytes: string): Promise<OperationHash>;
  preapplyOperations(ops: PreapplyParams, options?: RPCOptions): Promise<PreapplyResponse[]>;
  getEntrypoints(contract: string, options?: RPCOptions): Promise<EntrypointsResponse>;
  runOperation(op: RPCRunOperationParam, options?: RPCOptions): Promise<PreapplyResponse>;
  runCode(code: RPCRunCodeParam, options?: RPCOptions): Promise<RunCodeResult>;
  getChainId(): Promise<string>;
  packData(
    data: PackDataParams,
    options?: RPCOptions
  ): Promise<{ packed: string; gas: BigNumber | 'unaccounted' | undefined }>;
  getRpcUrl(): string;
  getCurrentPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult>;
  getSuccessorPeriod(options?: RPCOptions): Promise<VotingPeriodBlockResult>;
  getSaplingDiffById(id: string, options?: RPCOptions): Promise<SaplingDiffResponse>;
  getSaplingDiffByContract(contract: string, options?: RPCOptions): Promise<SaplingDiffResponse>;
  getProtocols(options?: RPCOptions): Promise<ProtocolsResponse>;
}

export interface WalletProvider {
  getPKH: () => Promise<string>;
  mapTransferParamsToWalletParams: (params: () => Promise<WalletTransferParams>) => Promise<any>;
  mapOriginateParamsToWalletParams: (params: () => Promise<WalletOriginateParams>) => Promise<any>;
  mapDelegateParamsToWalletParams: (params: () => Promise<WalletDelegateParams>) => Promise<any>;
  sendOperations: (params: any[]) => Promise<string>;
}

export const cacheUntil =
  <T>(cacheUntilObs: Observable<any>): MonoTypeOperatorFunction<T> =>
  (source) => {
  let subject: ReplaySubject<T> | null = null;

  return defer(() => {
    if (!subject) {
      subject = new ReplaySubject<T>();
      source.pipe(first()).subscribe(subject);
      cacheUntilObs.pipe(first()).subscribe(() => {
        subject = null;
      });
    }
    return subject;
  });
};

export const createNewPollingBasedHeadObservable = (
  pollingTimer: Observable<number>,
  sharedHeadOb: Observable<BlockResponse>,
  context: Context,
  scheduler?: SchedulerLike
): Observable<BlockResponse> => {
  return pollingTimer.pipe(
    switchMap(() => sharedHeadOb),
    distinctUntilKeyChanged('hash'),
    timeoutWith(
      context.config.confirmationPollingTimeoutSecond * 1000,
      throwError(new Error('Confirmation polling timed out')),
      scheduler
    ),
    shareReplay({
      refCount: true,
      scheduler,
    })
  );
};

export class MissedBlockDuringConfirmationError extends Error {
  name = 'MissedBlockDuringConfirmationError';

  constructor() {
    super(
      'Taquito missed a block while waiting for operation confirmation and was not able to find the operation'
    );
  }
}

export interface Receipt {
  totalFee: BigNumber;
  totalGas: BigNumber;
  totalStorage: BigNumber;
  totalAllocationBurn: BigNumber;
  totalOriginationBurn: BigNumber;
  totalPaidStorageDiff: BigNumber;
  totalStorageBurn: BigNumber;
}

export type MergedOperationResult = OperationResultDelegation &
  OperationResultOrigination &
  OperationResultTransaction &
  OperationResultRegisterGlobalConstant &
  OperationResultReveal & {
  fee?: string;
};

export const hasMetadata = <T extends { kind: OpKind }, K>(op: T): op is T & {
  metadata: K;
} => {
  return 'metadata' in op;
};

export const hasMetadataWithResult = <T extends { kind: OpKind }, K>(op: T): op is T & {
  metadata: {
    operation_result: K;
  };
} => {
  return hasMetadata<T, any>(op) && 'operation_result' in op.metadata;
};

export const flattenOperationResult = (response: PreapplyResponse | PreapplyResponse[]) => {
  const results = Array.isArray(response) ? response : [response];

  const returnedResults: MergedOperationResult[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results[i].contents.length; j++) {
      const content = results[i].contents[j];
      if (hasMetadataWithResult(content)) {
        returnedResults.push({
          fee: content.fee,
          ...content.metadata.operation_result,
        });

        if (Array.isArray(content.metadata.internal_operation_results)) {
          content.metadata.internal_operation_results.forEach((x) =>
            returnedResults.push(x.result)
          );
        }
      }
    }
  }

  return returnedResults;
};

export const receiptFromOperation = (
  op: OperationContentsAndResult[],
  { ALLOCATION_BURN, ORIGINATION_BURN } = {
    ALLOCATION_BURN: 257,
    ORIGINATION_BURN: 257,
  }
): Receipt => {
  const operationResults = flattenOperationResult({ contents: op });
  let totalGas = new BigNumber(0);
  let totalStorage = new BigNumber(0);
  let totalFee = new BigNumber(0);
  let totalOriginationBurn = new BigNumber(0);
  let totalAllocationBurn = new BigNumber(0);
  let totalPaidStorageDiff = new BigNumber(0);
  operationResults.forEach(result => {
    totalFee = totalFee.plus(result.fee || 0);
    totalOriginationBurn = totalOriginationBurn.plus(
      Array.isArray(result.originated_contracts)
        ? result.originated_contracts.length * ORIGINATION_BURN
        : 0
    );
    totalAllocationBurn = totalAllocationBurn.plus(
      'allocated_destination_contract' in result ? ALLOCATION_BURN : 0
    );
    totalGas = totalGas.plus(result.consumed_gas || 0);
    totalPaidStorageDiff = totalPaidStorageDiff.plus(
      'paid_storage_size_diff' in result ? Number(result.paid_storage_size_diff) || 0 : 0
    );
  });

  totalStorage = totalStorage
    .plus(totalAllocationBurn)
    .plus(totalOriginationBurn)
    .plus(totalPaidStorageDiff);

  return {
    totalFee,
    totalGas,
    totalStorage,
    totalAllocationBurn,
    totalOriginationBurn,
    totalPaidStorageDiff,
    totalStorageBurn: new BigNumber(totalStorage.multipliedBy(1000)),
  };
};

export enum ValidationResult {
  NO_PREFIX_MATCHED,
  INVALID_CHECKSUM,
  INVALID_LENGTH,
  VALID,
}

export enum Prefix {
  TZ1 = 'tz1',
  TZ2 = 'tz2',
  TZ3 = 'tz3',
  KT = 'KT',
  KT1 = 'KT1',

  EDSK2 = 'edsk2',
  SPSK = 'spsk',
  P2SK = 'p2sk',

  EDPK = 'edpk',
  SPPK = 'sppk',
  P2PK = 'p2pk',

  EDESK = 'edesk',
  SPESK = 'spesk',
  P2ESK = 'p2esk',

  EDSK = 'edsk',
  EDSIG = 'edsig',
  SPSIG = 'spsig',
  P2SIG = 'p2sig',
  SIG = 'sig',

  NET = 'Net',
  NCE = 'nce',
  B = 'B',
  O = 'o',
  LO = 'Lo',
  LLO = 'LLo',
  P = 'P',
  CO = 'Co',
  ID = 'id',

  EXPR = 'expr',
  TZ = 'TZ',
}

export function isValidPrefix(value: any): value is Prefix {
  if (typeof value !== 'string') {
    return false;
  }

  return value in prefix;
}

export const prefix = {
  [Prefix.TZ1]: new Uint8Array([6, 161, 159]),
  [Prefix.TZ2]: new Uint8Array([6, 161, 161]),
  [Prefix.TZ3]: new Uint8Array([6, 161, 164]),
  [Prefix.KT]: new Uint8Array([2, 90, 121]),
  [Prefix.KT1]: new Uint8Array([2, 90, 121]),

  [Prefix.EDSK]: new Uint8Array([43, 246, 78, 7]),
  [Prefix.EDSK2]: new Uint8Array([13, 15, 58, 7]),
  [Prefix.SPSK]: new Uint8Array([17, 162, 224, 201]),
  [Prefix.P2SK]: new Uint8Array([16, 81, 238, 189]),

  [Prefix.EDPK]: new Uint8Array([13, 15, 37, 217]),
  [Prefix.SPPK]: new Uint8Array([3, 254, 226, 86]),
  [Prefix.P2PK]: new Uint8Array([3, 178, 139, 127]),

  [Prefix.EDESK]: new Uint8Array([7, 90, 60, 179, 41]),
  [Prefix.SPESK]: new Uint8Array([0x09, 0xed, 0xf1, 0xae, 0x96]),
  [Prefix.P2ESK]: new Uint8Array([0x09, 0x30, 0x39, 0x73, 0xab]),

  [Prefix.EDSIG]: new Uint8Array([9, 245, 205, 134, 18]),
  [Prefix.SPSIG]: new Uint8Array([13, 115, 101, 19, 63]),
  [Prefix.P2SIG]: new Uint8Array([54, 240, 44, 52]),
  [Prefix.SIG]: new Uint8Array([4, 130, 43]),

  [Prefix.NET]: new Uint8Array([87, 82, 0]),
  [Prefix.NCE]: new Uint8Array([69, 220, 169]),
  [Prefix.B]: new Uint8Array([1, 52]),
  [Prefix.O]: new Uint8Array([5, 116]),
  [Prefix.LO]: new Uint8Array([133, 233]),
  [Prefix.LLO]: new Uint8Array([29, 159, 109]),
  [Prefix.P]: new Uint8Array([2, 170]),
  [Prefix.CO]: new Uint8Array([79, 179]),
  [Prefix.ID]: new Uint8Array([153, 103]),

  [Prefix.EXPR]: new Uint8Array([13, 44, 64, 27]),
  // Legacy prefix
  [Prefix.TZ]: new Uint8Array([2, 90, 121]),
};

function validatePrefixedValue(value: any, prefixes: Prefix[]) {
  const match = new RegExp(`^(${prefixes.join('|')})`).exec(value);
  if (!match || match.length === 0) {
    return ValidationResult.NO_PREFIX_MATCHED;
  }

  const prefixKey = match[0];

  if (!isValidPrefix(prefixKey)) {
    return ValidationResult.NO_PREFIX_MATCHED;
  }

  // Remove annotation from contract address before doing the validation
  const contractAddress = /^(KT1\w{33})(%(.*))?/.exec(value);
  if (contractAddress) {
    value = contractAddress[1];
  }

  // decodeUnsafe return undefined if decoding fail
  let decoded = bs58check.decodeUnsafe(value);
  if (!decoded) {
    return ValidationResult.INVALID_CHECKSUM;
  }

  decoded = decoded.slice(prefix[prefixKey].length);
  if (decoded.length !== prefixLength[prefixKey]) {
    return ValidationResult.INVALID_LENGTH;
  }

  return ValidationResult.VALID;
}

export function validateOperation(value: any): ValidationResult {
  return validatePrefixedValue(value, operationPrefix);
}

export class WalletOperation {
  protected _operationResult = new ReplaySubject<OperationContentsAndResult[]>(1);
  protected _includedInBlock = new ReplaySubject<BlockResponse>(1);
  protected _included = false;

  private lastHead: BlockResponse | undefined;
  protected newHead$: Observable<BlockResponse> = this._newHead$.pipe(
    tap((newHead) => {
      if (
        !this._included &&
        this.lastHead &&
        newHead.header.level - this.lastHead.header.level > 1
      ) {
        throw new MissedBlockDuringConfirmationError();
      }

      this.lastHead = newHead;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  // Observable that emit once operation is seen in a block
  private confirmed$ = this.newHead$.pipe(
    map((head) => {
      for (const opGroup of head.operations) {
        for (const op of opGroup) {
          if (op.hash === this.opHash) {
            this._included = true;
            this._includedInBlock.next(head);
            this._operationResult.next(op.contents as OperationContentsAndResult[]);

            // Return the block where the operation was found
            return head;
          }
        }
      }
    }),
    filter<BlockResponse | undefined, BlockResponse>((x): x is BlockResponse => {
      return typeof x !== 'undefined';
    }),
    first(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  async operationResults() {
    return this._operationResult.pipe(first()).toPromise();
  }

  /**
   * @description Receipt expose the total amount of tezos token burn and spent on fees
   * The promise returned by receipt will resolve only once the transaction is included
   */
  async receipt(): Promise<Receipt> {
    return receiptFromOperation(await this.operationResults());
  }

  /**
   *
   * @param opHash Operation hash
   * @param raw Raw operation that was injected
   * @param context Taquito context allowing access to rpc and signer
   */
  constructor(
    public readonly opHash: string,
    protected readonly context: Context,
    private _newHead$: Observable<BlockResponse>
  ) {
    if (validateOperation(this.opHash) !== ValidationResult.VALID) {
      throw new InvalidOperationHashError(`Invalid operation hash: ${this.opHash}`);
    }
    this.confirmed$
      .pipe(
        first(),
        catchError(() => of(undefined))
      )
      .subscribe();
  }

  async getCurrentConfirmation() {
    if (!this._included) {
      return 0;
    }

    return combineLatest([this._includedInBlock, from(this.context.rpc.getBlock())])
      .pipe(
        map(([foundAtBlock, head]) => {
          return head.header.level - foundAtBlock.header.level + 1;
        }),
        first()
      )
      .toPromise();
  }

  async isInCurrentBranch(tipBlockIdentifier = 'head') {
    // By default it is assumed that the operation is in the current branch
    if (!this._included) {
      return true;
    }

    const tipBlockHeader = await this.context.rpc.getBlockHeader({ block: tipBlockIdentifier });
    const inclusionBlock = await this._includedInBlock.pipe(first()).toPromise();

    const levelDiff = tipBlockHeader.level - inclusionBlock.header.level;

    // Block produced before the operation is included are assumed to be part of the current branch
    if (levelDiff <= 0) {
      return true;
    }

    const tipBlockLevel = Math.min(
      inclusionBlock.header.level + levelDiff,
      inclusionBlock.header.level + MAX_BRANCH_ANCESTORS
    );

    const blocks = new Set(await this.context.rpc.getLiveBlocks({ block: String(tipBlockLevel) }));
    return blocks.has(inclusionBlock.hash);
  }

  confirmationObservable(confirmations?: number) {
    if (typeof confirmations !== 'undefined' && confirmations < 1) {
      throw new Error('Confirmation count must be at least 1');
    }

    const { defaultConfirmationCount } = this.context.config;

    const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

    if (conf === undefined) {
      throw new Error('Default confirmation count can not be undefined!');
    }

    return combineLatest([this._includedInBlock, this.newHead$]).pipe(
      distinctUntilChanged(([, previousHead], [, newHead]) => {
        return previousHead.hash === newHead.hash;
      }),
      map(([foundAtBlock, head]) => {
        return {
          block: head,
          expectedConfirmation: conf,
          currentConfirmation: head.header.level - foundAtBlock.header.level + 1,
          completed: head.header.level - foundAtBlock.header.level >= conf - 1,
          isInCurrentBranch: () => this.isInCurrentBranch(head.hash),
        };
      }),
      takeWhile(({ completed }) => !completed, true)
    );
  }

  confirmation(confirmations?: number) {
    return this.confirmationObservable(confirmations).toPromise();
  }
}

export class OperationFactory {
  constructor(private context: Context) {}

  // Cache the last block for one second across all operations
  private sharedHeadObs = defer(() => from(this.context.rpc.getBlock())).pipe(
    cacheUntil(timer(0, 1000))
  );

  private async createNewHeadObservable() {
    const confirmationPollingIntervalSecond =
      this.context.config.confirmationPollingIntervalSecond !== undefined
        ? this.context.config.confirmationPollingIntervalSecond
        : await this.context.getConfirmationPollingInterval();
    return createNewPollingBasedHeadObservable(
      timer(0, confirmationPollingIntervalSecond * 1000),
      this.sharedHeadObs,
      this.context
    );
  }

  private createPastBlockWalker(startBlock: string, count = 1) {
    return from(this.context.rpc.getBlock({ block: startBlock })).pipe(
      switchMap((block) => {
        if (count === 1) {
          return of(block);
        }

        return range(block.header.level, count - 1).pipe(
          startWith(block),
          concatMap(async (level) => {
            return this.context.rpc.getBlock({ block: String(level) });
          })
        );
      })
    );
  }

  private async createHeadObservableFromConfig({ blockIdentifier }: OperationFactoryConfig) {
    const observableSequence: Observable<BlockResponse>[] = [];

    if (blockIdentifier) {
      observableSequence.push(this.createPastBlockWalker(blockIdentifier));
    }

    observableSequence.push(await this.createNewHeadObservable());

    return concat(...observableSequence);
  }

  async createOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<WalletOperation> {
    return new WalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createBatchOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<BatchWalletOperation> {
    return new BatchWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createTransactionOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<TransactionWalletOperation> {
    return new TransactionWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createDelegationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<DelegationWalletOperation> {
    return new DelegationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }

  async createOriginationOperation(
    hash: string,
    config: OperationFactoryConfig = {}
  ): Promise<OriginationWalletOperation> {
    return new OriginationWalletOperation(
      hash,
      this.context.clone(),
      await this.createHeadObservableFromConfig(config)
    );
  }
}

export class Context {
  private _rpcClient: RpcClientInterface;
  private _forger: Forger;
  private _parser: ParserProvider;
  private _injector: Injector;
  private _walletProvider: WalletProvider;
  public readonly operationFactory: OperationFactory;
  private _packer: Packer;
  private providerDecorator: Array<(context: Context) => Context> = [];
  private _globalConstantsProvider: GlobalConstantsProvider;
  public readonly tz = new RpcTzProvider(this);
  public readonly estimate = new RPCEstimateProvider(this);
  public readonly contract = new RpcContractProvider(this, this.estimate);
  public readonly batch = new RPCBatchProvider(this, this.estimate);
  public readonly wallet = new Wallet(this);

  constructor(
    private _rpc: RpcClientInterface | string,
    private _signer: Signer = new NoopSigner(),
    private _proto?: Protocols,
    public readonly _config = new BehaviorSubject({
      ...defaultConfigStreamer,
      ...defaultConfigConfirmation,
    }),
    forger?: Forger,
    injector?: Injector,
    packer?: Packer,
    wallet?: WalletProvider,
    parser?: ParserProvider,
    globalConstantsProvider?: GlobalConstantsProvider
  ) {
    if (typeof this._rpc === 'string') {
      this._rpcClient = new RpcClient(this._rpc);
    } else {
      this._rpcClient = this._rpc;
    }
    this._forger = forger ? forger : new RpcForger(this);
    this._injector = injector ? injector : new RpcInjector(this);
    this.operationFactory = new OperationFactory(this);
    this._walletProvider = wallet ? wallet : new LegacyWalletProvider(this);
    this._parser = parser ? parser : new MichelCodecParser(this);
    this._packer = packer ? packer : new RpcPacker(this);
    this._globalConstantsProvider = globalConstantsProvider
      ? globalConstantsProvider
      : new NoopGlobalConstantsProvider();
  }

  get config(): ConfigConfirmation & ConfigStreamer {
    return this._config.getValue();
  }

  set config(value: ConfigConfirmation & ConfigStreamer) {
    this._config.next({
      ...value,
    });
  }

  setPartialConfig(value: Partial<ConfigConfirmation> & Partial<ConfigStreamer>) {
    this._config.next({
      ...this._config.getValue(),
      ...value,
    });
  }

  get rpc(): RpcClientInterface {
    return this._rpcClient;
  }

  set rpc(value: RpcClientInterface) {
    this._rpcClient = value;
  }

  get injector() {
    return this._injector;
  }

  set injector(value: Injector) {
    this._injector = value;
  }

  get forger() {
    return this._forger;
  }

  set forger(value: Forger) {
    this._forger = value;
  }

  get signer() {
    return this._signer;
  }

  set signer(value: Signer) {
    this._signer = value;
  }

  get walletProvider() {
    return this._walletProvider;
  }

  set walletProvider(value: WalletProvider) {
    this._walletProvider = value;
  }

  set proto(value: Protocols | undefined) {
    this._proto = value;
  }

  get proto() {
    return this._proto;
  }

  get parser() {
    return this._parser;
  }

  set parser(value: ParserProvider) {
    this._parser = value;
  }

  get packer() {
    return this._packer;
  }

  set packer(value: Packer) {
    this._packer = value;
  }

  get globalConstantsProvider() {
    return this._globalConstantsProvider;
  }

  set globalConstantsProvider(value: GlobalConstantsProvider) {
    this._globalConstantsProvider = value;
  }

  async isAnyProtocolActive(protocol: string[] = []) {
    if (this._proto) {
      return protocol.includes(this._proto);
    } else {
      const { next_protocol } = await this.rpc.getBlockMetadata();
      return protocol.includes(next_protocol);
    }
  }

  async getConfirmationPollingInterval() {
    // Granada will generally halve the time between blocks, from 60 seconds to 30 seconds (mainnet).
    // We reduce the default value in the same proportion, from 10 to 5.
    const defaultInterval = 5;
    try {
      const constants = await this.rpc.getConstants();
      let blockTime = constants.time_between_blocks[0];
      if (constants.minimal_block_delay !== undefined) {
        blockTime = constants.minimal_block_delay;
      }
      let confirmationPollingInterval = BigNumber.sum(
        blockTime,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        new BigNumber(constants.delay_per_missing_endorsement!).multipliedBy(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Math.max(0, constants.initial_endorsers! - constants.endorsers_per_block)
        )
      );

      // Divide the polling interval by a constant 3
      // to improvise for polling time to work in prod,
      // testnet and sandbox enviornment.
      confirmationPollingInterval = confirmationPollingInterval.dividedBy(3);

      this.config.confirmationPollingIntervalSecond =
        confirmationPollingInterval.toNumber() === 0 ? 0.1 : confirmationPollingInterval.toNumber();
      return this.config.confirmationPollingIntervalSecond;
    } catch (exception) {
      // Return default value if there is
      // an issue returning from constants
      // file.
      return defaultInterval;
    }
  }

  /**
   * @description Create a copy of the current context. Useful when you have long running operation and you do not want a context change to affect the operation
   */
  clone(): Context {
    return new Context(
      this.rpc,
      this.signer,
      this.proto,
      this._config,
      this.forger,
      this._injector,
      this.packer,
      this._walletProvider,
      this._parser,
      this._globalConstantsProvider,
    );
  }

  /**
   * @description Allows extensions set on the TezosToolkit to inject logic into the context
   */
  registerProviderDecorator(fx: (context: Context) => Context) {
    this.providerDecorator.push(fx);
  }

  /**
   * @description Applies the decorators on a cloned instance of the context and returned this cloned instance.
   * The decorators are functions that inject logic into the context.
   * They are provided by the extensions set on the TezosToolkit by calling the registerProviderDecorator method.
   */
  withExtensions = (): Context => {
    let clonedContext = this.clone();
    this.providerDecorator.forEach((decorator) => {
      clonedContext = decorator(clonedContext);
    });

    return clonedContext;
  };
}

export type TimeStampMixed = Date | string;
export type OperationStatus = 'pending' | 'unknown' | OperationResultStatusEnum;
export class TransactionWalletOperation {
    constructor(
        public readonly opHash: string,
        protected readonly context: Context,
        // private _newHead$: Observable<BlockResponse>
    ) {
        // if (validateOperation(this.opHash) !== ValidationResult.VALID) {
        // throw new InvalidOperationHashError(`Invalid operation hash: ${this.opHash}`);
        // }
        // this.confirmed$
        // .pipe(
        //     first(),
        //     catchError(() => of(undefined))
        // )
        // .subscribe();
    }

    // public async revealOperation() {
    //     const operationResult = await this.operationResults();
    //     return operationResult.find(x => x.kind === OpKind.REVEAL) as
    //     | OperationContentsAndResultReveal
    //     | undefined;
    // }

    public async transactionOperation() {
        const operationResult = await this.operationResults();
        return operationResult.find(x => x.kind === OpKind.TRANSACTION) as
        | OperationContentsAndResultTransaction
        | undefined;
    }

    public async status(): Promise<OperationStatus> {
        if (!this._included) {
        return 'pending';
        }

        const op = await this.transactionOperation();
        if (!op) {
        return 'unknown';
        }

        return op.metadata.operation_result.status;
    }
    protected _operationResult = new ReplaySubject<OperationContentsAndResult[]>(1);
    // protected _includedInBlock = new ReplaySubject<BlockResponse>(1);
    protected _included = false;

    private lastHead: BlockResponse | undefined;
    // protected newHead$: Observable<BlockResponse> = this._newHead$.pipe(
    //     tap((newHead) => {
    //     if (
    //         !this._included &&
    //         this.lastHead &&
    //         newHead.header.level - this.lastHead.header.level > 1
    //     ) {
    //         throw new MissedBlockDuringConfirmationError();
    //     }

    //     this.lastHead = newHead;
    //     }),
    //     shareReplay({ bufferSize: 1, refCount: true })
    // );

    // Observable that emit once operation is seen in a block
    // private confirmed$ = this.newHead$.pipe(
    //     map((head) => {
    //     for (const opGroup of head.operations) {
    //         for (const op of opGroup) {
    //         if (op.hash === this.opHash) {
    //             this._included = true;
    //             this._includedInBlock.next(head);
    //             this._operationResult.next(op.contents as OperationContentsAndResult[]);

    //             // Return the block where the operation was found
    //             return head;
    //         }
    //         }
    //     }
    //     }),
    //     filter<BlockResponse | undefined, BlockResponse>((x): x is BlockResponse => {
    //     return typeof x !== 'undefined';
    //     }),
    //     first(),
    //     shareReplay({ bufferSize: 1, refCount: true })
    // );

    async operationResults() {
        return this._operationResult.pipe(first()).toPromise();
    }

    /**
     * @description Receipt expose the total amount of tezos token burn and spent on fees
     * The promise returned by receipt will resolve only once the transaction is included
     */
    // async receipt(): Promise<Receipt> {
    //     return receiptFromOperation(await this.operationResults());
    // }

    // async getCurrentConfirmation() {
    //     if (!this._included) {
    //     return 0;
    //     }

    //     return combineLatest([this._includedInBlock, from(this.context.rpc.getBlock())])
    //     .pipe(
    //         map(([foundAtBlock, head]) => {
    //         return head.header.level - foundAtBlock.header.level + 1;
    //         }),
    //         first()
    //     )
    //     .toPromise();
    // }

    // async isInCurrentBranch(tipBlockIdentifier = 'head') {
    //     // By default it is assumed that the operation is in the current branch
    //     if (!this._included) {
    //     return true;
    //     }

    //     const tipBlockHeader = await this.context.rpc.getBlockHeader({ block: tipBlockIdentifier });
    //     const inclusionBlock = await this._includedInBlock.pipe(first()).toPromise();

    //     const levelDiff = tipBlockHeader.level - inclusionBlock.header.level;

    //     // Block produced before the operation is included are assumed to be part of the current branch
    //     if (levelDiff <= 0) {
    //     return true;
    //     }

    //     const tipBlockLevel = Math.min(
    //     inclusionBlock.header.level + levelDiff,
    //     inclusionBlock.header.level + MAX_BRANCH_ANCESTORS
    //     );

    //     const blocks = new Set(await this.context.rpc.getLiveBlocks({ block: String(tipBlockLevel) }));
    //     return blocks.has(inclusionBlock.hash);
    // }

    confirmationObservable(confirmations?: number) {
        if (typeof confirmations !== 'undefined' && confirmations < 1) {
        throw new Error('Confirmation count must be at least 1');
        }

        const { defaultConfirmationCount } = this.context.config;

        const conf = confirmations !== undefined ? confirmations : defaultConfirmationCount;

        if (conf === undefined) {
        throw new Error('Default confirmation count can not be undefined!');
        }

        return combineLatest([this._includedInBlock, this.newHead$]).pipe(
        distinctUntilChanged(([, previousHead], [, newHead]) => {
            return previousHead.hash === newHead.hash;
        }),
        map(([foundAtBlock, head]) => {
            return {
            block: head,
            expectedConfirmation: conf,
            currentConfirmation: head.header.level - foundAtBlock.header.level + 1,
            completed: head.header.level - foundAtBlock.header.level >= conf - 1,
            isInCurrentBranch: () => this.isInCurrentBranch(head.hash),
            };
        }),
        takeWhile(({ completed }) => !completed, true)
        );
    }

    /**
     *
     * @param confirmations [0] Number of confirmation to wait for
     */
    confirmation(confirmations?: number) {
        return this.confirmationObservable(confirmations).toPromise();
    }
}


async function createTransactionOperation(
    hash: string, 
    config: OperationFactoryConfig = {}
): Promise<TransactionWalletOperation> {
    return new TransactionWalletOperation(
        hash,
        this.context.clone(),
        await this.createHeadObservableFromConfig(config)
    );
}

function transfer(params: WalletTransferParams) {
    return walletCommand(async () => {
        const mappedParams = await mapTransferParamsToWalletParams(
            async () => params
        );
        const opHash = await sendOperations([mappedParams]);
        return createTransactionOperation(opHash);
    });
}